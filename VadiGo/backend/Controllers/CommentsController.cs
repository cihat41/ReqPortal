using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using TalepSistemi.API.Data;
using TalepSistemi.API.Models;

namespace TalepSistemi.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class CommentsController : ControllerBase
{
    private readonly ApplicationDbContext _context;

    public CommentsController(ApplicationDbContext context)
    {
        _context = context;
    }

    [HttpGet("request/{requestId}")]
    public async Task<ActionResult<IEnumerable<object>>> GetRequestComments(int requestId)
    {
        var comments = await _context.RequestComments
            .Include(c => c.User)
            .Where(c => c.RequestId == requestId)
            .OrderBy(c => c.CreatedAt)
            .Select(c => new
            {
                c.Id,
                c.Comment,
                c.CreatedAt,
                User = new
                {
                    c.User.Id,
                    c.User.FirstName,
                    c.User.LastName,
                    c.User.Email
                }
            })
            .ToListAsync();

        return Ok(comments);
    }

    [HttpPost]
    public async Task<ActionResult> AddComment([FromBody] CommentDto dto)
    {
        var userIdClaim = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
        if (string.IsNullOrEmpty(userIdClaim) || !int.TryParse(userIdClaim, out int userId))
        {
            return Unauthorized();
        }

        var request = await _context.Requests.FindAsync(dto.RequestId);
        if (request == null)
        {
            return NotFound("Talep bulunamadı");
        }

        var comment = new RequestComment
        {
            RequestId = dto.RequestId,
            UserId = userId,
            Comment = dto.Comment,
            CreatedAt = DateTime.UtcNow
        };

        _context.RequestComments.Add(comment);
        await _context.SaveChangesAsync();

        var user = await _context.Users.FindAsync(userId);
        if (user == null)
        {
            return NotFound("Kullanıcı bulunamadı");
        }

        return Ok(new
        {
            comment.Id,
            comment.Comment,
            comment.CreatedAt,
            User = new
            {
                user.Id,
                user.FirstName,
                user.LastName,
                user.Email
            }
        });
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteComment(int id)
    {
        var comment = await _context.RequestComments.FindAsync(id);
        if (comment == null)
        {
            return NotFound();
        }

        var userIdClaim = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
        if (string.IsNullOrEmpty(userIdClaim) || !int.TryParse(userIdClaim, out int userId))
        {
            return Unauthorized();
        }

        // Only comment owner or admin can delete
        if (comment.UserId != userId && !User.IsInRole("Admin"))
        {
            return Forbid();
        }

        _context.RequestComments.Remove(comment);
        await _context.SaveChangesAsync();

        return NoContent();
    }
}

public class CommentDto
{
    public int RequestId { get; set; }
    public string Comment { get; set; } = string.Empty;
}

