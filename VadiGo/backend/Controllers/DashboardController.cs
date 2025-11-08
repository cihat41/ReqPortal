using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;
using TalepSistemi.API.Data;
using TalepSistemi.API.Models;

namespace TalepSistemi.API.Controllers;

[Authorize]
[ApiController]
[Route("api/[controller]")]
public class DashboardController : ControllerBase
{
    private readonly ApplicationDbContext _context;

    public DashboardController(ApplicationDbContext context)
    {
        _context = context;
    }

    // GET: api/dashboard/stats
    [HttpGet("stats")]
    public async Task<ActionResult<object>> GetDashboardStats()
    {
        var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "0");

        // Get user's request statistics
        var totalRequests = await _context.Requests
            .Where(r => r.RequesterId == userId)
            .CountAsync();

        var pendingRequests = await _context.Requests
            .Where(r => r.RequesterId == userId && 
                   (r.Status == RequestStatus.Submitted || r.Status == RequestStatus.PendingApproval))
            .CountAsync();

        var approvedRequests = await _context.Requests
            .Where(r => r.RequesterId == userId && r.Status == RequestStatus.Approved)
            .CountAsync();

        var rejectedRequests = await _context.Requests
            .Where(r => r.RequesterId == userId && r.Status == RequestStatus.Rejected)
            .CountAsync();

        var draftRequests = await _context.Requests
            .Where(r => r.RequesterId == userId && r.Status == RequestStatus.Draft)
            .CountAsync();

        // Get pending approvals count
        var pendingApprovals = await _context.Approvals
            .Where(a => a.ApproverId == userId && a.Status == ApprovalStatus.Pending)
            .CountAsync();

        // Get recent requests
        var recentRequests = await _context.Requests
            .Where(r => r.RequesterId == userId)
            .OrderByDescending(r => r.CreatedAt)
            .Take(5)
            .Select(r => new
            {
                r.Id,
                r.Title,
                r.Category,
                r.Status,
                r.Priority,
                r.CreatedAt
            })
            .ToListAsync();

        // Get recent approvals
        var recentApprovals = await _context.Approvals
            .Include(a => a.Request)
                .ThenInclude(r => r.Requester)
            .Where(a => a.ApproverId == userId)
            .OrderByDescending(a => a.CreatedAt)
            .Take(5)
            .Select(a => new
            {
                a.Id,
                a.RequestId,
                Request = new
                {
                    a.Request.Title,
                    a.Request.Category,
                    a.Request.Status,
                    RequesterName = a.Request.Requester.FirstName + " " + a.Request.Requester.LastName
                },
                a.Status,
                a.CreatedAt
            })
            .ToListAsync();

        return Ok(new
        {
            RequestStats = new
            {
                Total = totalRequests,
                Pending = pendingRequests,
                Approved = approvedRequests,
                Rejected = rejectedRequests,
                Draft = draftRequests
            },
            ApprovalStats = new
            {
                PendingApprovals = pendingApprovals
            },
            RecentRequests = recentRequests,
            RecentApprovals = recentApprovals
        });
    }
}

