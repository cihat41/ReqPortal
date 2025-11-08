using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;
using TalepSistemi.API.Data;
using TalepSistemi.API.DTOs;
using TalepSistemi.API.Models;

namespace TalepSistemi.API.Controllers;

[Authorize]
[ApiController]
[Route("api/[controller]")]
public class ApprovalsController : ControllerBase
{
    private readonly ApplicationDbContext _context;

    public ApprovalsController(ApplicationDbContext context)
    {
        _context = context;
    }

    // GET: api/approvals/pending
    [HttpGet("pending")]
    public async Task<ActionResult<IEnumerable<object>>> GetPendingApprovals()
    {
        var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "0");

        var pendingApprovals = await _context.Approvals
            .Include(a => a.Request)
                .ThenInclude(r => r.Requester)
            .Where(a => a.ApproverId == userId && a.Status == ApprovalStatus.Pending)
            .Select(a => new
            {
                a.Id,
                a.RequestId,
                Request = new
                {
                    a.Request.Id,
                    a.Request.Title,
                    a.Request.Description,
                    a.Request.Category,
                    a.Request.Priority,
                    a.Request.Status,
                    a.Request.EstimatedCost,
                    a.Request.CreatedAt,
                    RequesterName = a.Request.Requester.FirstName + " " + a.Request.Requester.LastName,
                    RequesterEmail = a.Request.Requester.Email,
                    RequesterDepartment = a.Request.Requester.Department
                },
                a.Level,
                a.Status,
                a.CreatedAt
            })
            .OrderBy(a => a.CreatedAt)
            .ToListAsync();

        return Ok(pendingApprovals);
    }

    // GET: api/approvals/history
    [HttpGet("history")]
    public async Task<ActionResult<IEnumerable<object>>> GetApprovalHistory()
    {
        var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "0");

        var approvalHistory = await _context.Approvals
            .Include(a => a.Request)
                .ThenInclude(r => r.Requester)
            .Where(a => a.ApproverId == userId && a.Status != ApprovalStatus.Pending)
            .Select(a => new
            {
                a.Id,
                a.RequestId,
                Request = new
                {
                    a.Request.Id,
                    a.Request.Title,
                    a.Request.Category,
                    a.Request.Status,
                    RequesterName = a.Request.Requester.FirstName + " " + a.Request.Requester.LastName
                },
                a.Level,
                a.Status,
                a.Comments,
                a.ApprovedAt,
                a.CreatedAt
            })
            .OrderByDescending(a => a.ApprovedAt)
            .ToListAsync();

        return Ok(approvalHistory);
    }

    // POST: api/approvals/{id}/approve
    [HttpPost("{id}/approve")]
    public async Task<IActionResult> ApproveRequest(int id, [FromBody] ApprovalActionDto dto)
    {
        var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "0");

        var approval = await _context.Approvals
            .Include(a => a.Request)
            .FirstOrDefaultAsync(a => a.Id == id && a.ApproverId == userId);

        if (approval == null)
        {
            return NotFound(new { message = "Onay kaydı bulunamadı." });
        }

        if (approval.Status != ApprovalStatus.Pending)
        {
            return BadRequest(new { message = "Bu onay zaten işlenmiş." });
        }

        approval.Status = ApprovalStatus.Approved;
        approval.Comments = dto.Comments;
        approval.ApprovedAt = DateTime.UtcNow;

        // Check if there are more approval levels
        var nextApproval = await _context.Approvals
            .Where(a => a.RequestId == approval.RequestId && a.Level > approval.Level)
            .OrderBy(a => a.Level)
            .FirstOrDefaultAsync();

        if (nextApproval == null)
        {
            // No more approvals needed, mark request as approved
            approval.Request.Status = RequestStatus.Approved;
        }
        else
        {
            // Keep request in PendingApproval status for next level
            approval.Request.Status = RequestStatus.PendingApproval;
        }

        // Create audit log
        var auditLog = new AuditLog
        {
            UserId = userId,
            Action = "ApproveRequest",
            EntityType = "Request",
            EntityId = approval.RequestId,
            Details = $"Request approved at level {approval.Level}. Comments: {dto.Comments}",
            Timestamp = DateTime.UtcNow
        };
        _context.AuditLogs.Add(auditLog);

        await _context.SaveChangesAsync();

        return Ok(new { message = "Talep onaylandı." });
    }

    // POST: api/approvals/{id}/reject
    [HttpPost("{id}/reject")]
    public async Task<IActionResult> RejectRequest(int id, [FromBody] ApprovalActionDto dto)
    {
        var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "0");

        var approval = await _context.Approvals
            .Include(a => a.Request)
            .FirstOrDefaultAsync(a => a.Id == id && a.ApproverId == userId);

        if (approval == null)
        {
            return NotFound(new { message = "Onay kaydı bulunamadı." });
        }

        if (approval.Status != ApprovalStatus.Pending)
        {
            return BadRequest(new { message = "Bu onay zaten işlenmiş." });
        }

        approval.Status = ApprovalStatus.Rejected;
        approval.Comments = dto.Comments;
        approval.ApprovedAt = DateTime.UtcNow;

        // Mark request as rejected
        approval.Request.Status = RequestStatus.Rejected;

        // Create audit log
        var auditLog = new AuditLog
        {
            UserId = userId,
            Action = "RejectRequest",
            EntityType = "Request",
            EntityId = approval.RequestId,
            Details = $"Request rejected at level {approval.Level}. Comments: {dto.Comments}",
            Timestamp = DateTime.UtcNow
        };
        _context.AuditLogs.Add(auditLog);

        await _context.SaveChangesAsync();

        return Ok(new { message = "Talep reddedildi." });
    }

    // POST: api/approvals/{id}/return
    [HttpPost("{id}/return")]
    public async Task<IActionResult> ReturnRequest(int id, [FromBody] ApprovalActionDto dto)
    {
        var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "0");

        var approval = await _context.Approvals
            .Include(a => a.Request)
            .FirstOrDefaultAsync(a => a.Id == id && a.ApproverId == userId);

        if (approval == null)
        {
            return NotFound(new { message = "Onay kaydı bulunamadı." });
        }

        if (approval.Status != ApprovalStatus.Pending)
        {
            return BadRequest(new { message = "Bu onay zaten işlenmiş." });
        }

        approval.Status = ApprovalStatus.Returned;
        approval.Comments = dto.Comments;
        approval.ApprovedAt = DateTime.UtcNow;

        // Return request to draft status
        approval.Request.Status = RequestStatus.Draft;

        // Create audit log
        var auditLog = new AuditLog
        {
            UserId = userId,
            Action = "ReturnRequest",
            EntityType = "Request",
            EntityId = approval.RequestId,
            Details = $"Request returned at level {approval.Level}. Comments: {dto.Comments}",
            Timestamp = DateTime.UtcNow
        };
        _context.AuditLogs.Add(auditLog);

        await _context.SaveChangesAsync();

        return Ok(new { message = "Talep iade edildi." });
    }
}

