using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using TalepSistemi.API.Data;
using TalepSistemi.API.Models;

namespace TalepSistemi.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class AttachmentsController : ControllerBase
{
    private readonly ApplicationDbContext _context;
    private readonly IWebHostEnvironment _environment;
    private readonly long _maxFileSize = 10 * 1024 * 1024; // 10MB

    public AttachmentsController(ApplicationDbContext context, IWebHostEnvironment environment)
    {
        _context = context;
        _environment = environment;
    }

    [HttpGet("request/{requestId}")]
    public async Task<ActionResult<IEnumerable<object>>> GetRequestAttachments(int requestId)
    {
        var attachments = await _context.RequestAttachments
            .Include(a => a.Uploader)
            .Where(a => a.RequestId == requestId)
            .OrderByDescending(a => a.UploadedAt)
            .Select(a => new
            {
                a.Id,
                a.FileName,
                a.FileSize,
                a.ContentType,
                a.UploadedAt,
                UploadedBy = new
                {
                    a.Uploader.Id,
                    a.Uploader.FirstName,
                    a.Uploader.LastName
                }
            })
            .ToListAsync();

        return Ok(attachments);
    }

    [HttpPost("upload/{requestId}")]
    public async Task<ActionResult> UploadFile(int requestId, IFormFile file)
    {
        if (file == null || file.Length == 0)
        {
            return BadRequest("Dosya seçilmedi");
        }

        if (file.Length > _maxFileSize)
        {
            return BadRequest("Dosya boyutu 10MB'dan büyük olamaz");
        }

        var request = await _context.Requests.FindAsync(requestId);
        if (request == null)
        {
            return NotFound("Talep bulunamadı");
        }

        var userIdClaim = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
        if (string.IsNullOrEmpty(userIdClaim) || !int.TryParse(userIdClaim, out int userId))
        {
            return Unauthorized();
        }

        // Create uploads directory if not exists
        var uploadsPath = Path.Combine(_environment.ContentRootPath, "uploads");
        if (!Directory.Exists(uploadsPath))
        {
            Directory.CreateDirectory(uploadsPath);
        }

        // Generate unique filename
        var fileExtension = Path.GetExtension(file.FileName);
        var uniqueFileName = $"{Guid.NewGuid()}{fileExtension}";
        var filePath = Path.Combine(uploadsPath, uniqueFileName);

        // Save file
        using (var stream = new FileStream(filePath, FileMode.Create))
        {
            await file.CopyToAsync(stream);
        }

        // Save to database
        var attachment = new RequestAttachment
        {
            RequestId = requestId,
            FileName = file.FileName,
            FilePath = uniqueFileName,
            FileSize = file.Length,
            ContentType = file.ContentType,
            UploadedBy = userId,
            UploadedAt = DateTime.UtcNow
        };

        _context.RequestAttachments.Add(attachment);
        await _context.SaveChangesAsync();

        return Ok(new
        {
            attachment.Id,
            attachment.FileName,
            attachment.FileSize,
            attachment.ContentType,
            attachment.UploadedAt
        });
    }

    [HttpGet("download/{id}")]
    public async Task<ActionResult> DownloadFile(int id)
    {
        var attachment = await _context.RequestAttachments.FindAsync(id);
        if (attachment == null)
        {
            return NotFound();
        }

        var filePath = Path.Combine(_environment.ContentRootPath, "uploads", attachment.FilePath);
        if (!System.IO.File.Exists(filePath))
        {
            return NotFound("Dosya bulunamadı");
        }

        var memory = new MemoryStream();
        using (var stream = new FileStream(filePath, FileMode.Open))
        {
            await stream.CopyToAsync(memory);
        }
        memory.Position = 0;

        return File(memory, attachment.ContentType ?? "application/octet-stream", attachment.FileName);
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteAttachment(int id)
    {
        var attachment = await _context.RequestAttachments
            .Include(a => a.Request)
            .FirstOrDefaultAsync(a => a.Id == id);

        if (attachment == null)
        {
            return NotFound();
        }

        var userIdClaim = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
        if (string.IsNullOrEmpty(userIdClaim) || !int.TryParse(userIdClaim, out int userId))
        {
            return Unauthorized();
        }

        // Only requester or admin can delete
        if (attachment.Request.RequesterId != userId && !User.IsInRole("Admin"))
        {
            return Forbid();
        }

        // Delete physical file
        var filePath = Path.Combine(_environment.ContentRootPath, "uploads", attachment.FilePath);
        if (System.IO.File.Exists(filePath))
        {
            System.IO.File.Delete(filePath);
        }

        _context.RequestAttachments.Remove(attachment);
        await _context.SaveChangesAsync();

        return NoContent();
    }
}

