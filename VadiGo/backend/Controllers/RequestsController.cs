using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;
using TalepSistemi.API.Data;
using TalepSistemi.API.DTOs;
using TalepSistemi.API.Models;

namespace TalepSistemi.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class RequestsController : ControllerBase
{
    private readonly ApplicationDbContext _context;
    private readonly ILogger<RequestsController> _logger;

    public RequestsController(ApplicationDbContext context, ILogger<RequestsController> logger)
    {
        _context = context;
        _logger = logger;
    }

    private int GetCurrentUserId()
    {
        var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        return int.Parse(userIdClaim ?? "0");
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<RequestDto>>> GetRequests(
        [FromQuery] string? status = null,
        [FromQuery] string? type = null)
    {
        try
        {
            var userId = GetCurrentUserId();
            var query = _context.Requests
                .Include(r => r.Requester)
                .Where(r => r.RequesterId == userId);

            if (!string.IsNullOrEmpty(status))
            {
                query = query.Where(r => r.Status == status);
            }

            if (!string.IsNullOrEmpty(type))
            {
                query = query.Where(r => r.Type == type);
            }

            var requests = await query
                .OrderByDescending(r => r.CreatedAt)
                .Select(r => new RequestDto
                {
                    Id = r.Id,
                    Title = r.Title,
                    Description = r.Description,
                    Type = r.Type,
                    Status = r.Status,
                    RequesterId = r.RequesterId,
                    RequesterName = $"{r.Requester.FirstName} {r.Requester.LastName}",
                    FormData = r.FormData,
                    CreatedAt = r.CreatedAt,
                    SubmittedAt = r.SubmittedAt,
                    CompletedAt = r.CompletedAt
                })
                .ToListAsync();

            return Ok(requests);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Talepler getirilirken hata oluştu");
            return StatusCode(500, new { message = "Talepler getirilirken bir hata oluştu" });
        }
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<RequestDto>> GetRequest(int id)
    {
        try
        {
            var userId = GetCurrentUserId();
            var request = await _context.Requests
                .Include(r => r.Requester)
                .FirstOrDefaultAsync(r => r.Id == id && r.RequesterId == userId);

            if (request == null)
            {
                return NotFound(new { message = "Talep bulunamadı" });
            }

            var requestDto = new RequestDto
            {
                Id = request.Id,
                Title = request.Title,
                Description = request.Description,
                Type = request.Type,
                Status = request.Status,
                RequesterId = request.RequesterId,
                RequesterName = $"{request.Requester.FirstName} {request.Requester.LastName}",
                FormData = request.FormData,
                CreatedAt = request.CreatedAt,
                SubmittedAt = request.SubmittedAt,
                CompletedAt = request.CompletedAt
            };

            return Ok(requestDto);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Talep getirilirken hata oluştu: {Id}", id);
            return StatusCode(500, new { message = "Talep getirilirken bir hata oluştu" });
        }
    }

    [HttpPost]
    public async Task<ActionResult<RequestDto>> CreateRequest([FromBody] CreateRequestDto createRequestDto)
    {
        try
        {
            var userId = GetCurrentUserId();

            var request = new Request
            {
                Title = createRequestDto.Title,
                Description = createRequestDto.Description,
                Type = createRequestDto.Type,
                RequesterId = userId,
                Status = createRequestDto.SaveAsDraft ? RequestStatus.Draft : RequestStatus.Submitted,
                FormData = createRequestDto.FormData,
                CreatedAt = DateTime.UtcNow,
                SubmittedAt = createRequestDto.SaveAsDraft ? null : DateTime.UtcNow
            };

            _context.Requests.Add(request);
            await _context.SaveChangesAsync();

            // Talep gönderildiyse onay kaydı oluştur (basit versiyon)
            if (!createRequestDto.SaveAsDraft)
            {
                // Varsayılan olarak Admin rolündeki ilk kullanıcıyı onaycı olarak ata
                var approver = await _context.UserRoles
                    .Include(ur => ur.User)
                    .Where(ur => ur.RoleId == 4) // Admin rolü
                    .Select(ur => ur.User)
                    .FirstOrDefaultAsync();

                if (approver != null)
                {
                    var approval = new Approval
                    {
                        RequestId = request.Id,
                        ApproverId = approver.Id,
                        Status = ApprovalStatus.Pending,
                        Order = 1,
                        CreatedAt = DateTime.UtcNow
                    };

                    _context.Approvals.Add(approval);
                    request.Status = RequestStatus.PendingApproval;
                    await _context.SaveChangesAsync();
                }
            }

            var requester = await _context.Users.FindAsync(userId);

            var requestDto = new RequestDto
            {
                Id = request.Id,
                Title = request.Title,
                Description = request.Description,
                Type = request.Type,
                Status = request.Status,
                RequesterId = request.RequesterId,
                RequesterName = $"{requester!.FirstName} {requester.LastName}",
                FormData = request.FormData,
                CreatedAt = request.CreatedAt,
                SubmittedAt = request.SubmittedAt,
                CompletedAt = request.CompletedAt
            };

            return CreatedAtAction(nameof(GetRequest), new { id = request.Id }, requestDto);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Talep oluşturulurken hata oluştu");
            return StatusCode(500, new { message = "Talep oluşturulurken bir hata oluştu" });
        }
    }

    [HttpPut("{id}")]
    public async Task<ActionResult<RequestDto>> UpdateRequest(int id, [FromBody] UpdateRequestDto updateRequestDto)
    {
        try
        {
            var userId = GetCurrentUserId();
            var request = await _context.Requests
                .Include(r => r.Requester)
                .FirstOrDefaultAsync(r => r.Id == id && r.RequesterId == userId);

            if (request == null)
            {
                return NotFound(new { message = "Talep bulunamadı" });
            }

            // Sadece taslak durumundaki talepler düzenlenebilir
            if (request.Status != RequestStatus.Draft)
            {
                return BadRequest(new { message = "Sadece taslak durumundaki talepler düzenlenebilir" });
            }

            if (!string.IsNullOrEmpty(updateRequestDto.Title))
                request.Title = updateRequestDto.Title;

            if (!string.IsNullOrEmpty(updateRequestDto.Description))
                request.Description = updateRequestDto.Description;

            if (!string.IsNullOrEmpty(updateRequestDto.Type))
                request.Type = updateRequestDto.Type;

            if (updateRequestDto.FormData != null)
                request.FormData = updateRequestDto.FormData;

            request.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();

            var requestDto = new RequestDto
            {
                Id = request.Id,
                Title = request.Title,
                Description = request.Description,
                Type = request.Type,
                Status = request.Status,
                RequesterId = request.RequesterId,
                RequesterName = $"{request.Requester.FirstName} {request.Requester.LastName}",
                FormData = request.FormData,
                CreatedAt = request.CreatedAt,
                SubmittedAt = request.SubmittedAt,
                CompletedAt = request.CompletedAt
            };

            return Ok(requestDto);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Talep güncellenirken hata oluştu: {Id}", id);
            return StatusCode(500, new { message = "Talep güncellenirken bir hata oluştu" });
        }
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteRequest(int id)
    {
        try
        {
            var userId = GetCurrentUserId();
            var request = await _context.Requests
                .FirstOrDefaultAsync(r => r.Id == id && r.RequesterId == userId);

            if (request == null)
            {
                return NotFound(new { message = "Talep bulunamadı" });
            }

            // Sadece taslak durumundaki talepler silinebilir
            if (request.Status != RequestStatus.Draft)
            {
                return BadRequest(new { message = "Sadece taslak durumundaki talepler silinebilir" });
            }

            _context.Requests.Remove(request);
            await _context.SaveChangesAsync();

            return NoContent();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Talep silinirken hata oluştu: {Id}", id);
            return StatusCode(500, new { message = "Talep silinirken bir hata oluştu" });
        }
    }
}

