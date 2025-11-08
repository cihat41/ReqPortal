using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using TalepSistemi.API.Data;

namespace TalepSistemi.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize(Roles = "Admin,SystemAdmin")]
public class AuditLogsController : ControllerBase
{
    private readonly ApplicationDbContext _context;

    public AuditLogsController(ApplicationDbContext context)
    {
        _context = context;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<object>>> GetAuditLogs(
        [FromQuery] string? entityName = null,
        [FromQuery] string? action = null,
        [FromQuery] DateTime? startDate = null,
        [FromQuery] DateTime? endDate = null,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 50)
    {
        var query = _context.AuditLogs
            .Include(al => al.User)
            .AsQueryable();

        if (!string.IsNullOrEmpty(entityName))
        {
            query = query.Where(al => al.EntityName == entityName);
        }

        if (!string.IsNullOrEmpty(action))
        {
            query = query.Where(al => al.Action == action);
        }

        if (startDate.HasValue)
        {
            query = query.Where(al => al.CreatedAt >= startDate.Value);
        }

        if (endDate.HasValue)
        {
            query = query.Where(al => al.CreatedAt <= endDate.Value.AddDays(1));
        }

        var totalCount = await query.CountAsync();

        var logs = await query
            .OrderByDescending(al => al.CreatedAt)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .Select(al => new
            {
                al.Id,
                al.EntityName,
                al.EntityId,
                al.Action,
                al.Details,
                al.CreatedAt,
                User = al.User != null ? new
                {
                    al.User.Id,
                    al.User.FirstName,
                    al.User.LastName,
                    al.User.Email
                } : null
            })
            .ToListAsync();

        return Ok(new
        {
            data = logs,
            totalCount,
            page,
            pageSize,
            totalPages = (int)Math.Ceiling(totalCount / (double)pageSize)
        });
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<object>> GetAuditLog(int id)
    {
        var log = await _context.AuditLogs
            .Include(al => al.User)
            .FirstOrDefaultAsync(al => al.Id == id);

        if (log == null)
        {
            return NotFound();
        }

        return Ok(new
        {
            log.Id,
            log.EntityName,
            log.EntityId,
            log.Action,
            log.Details,
            log.OldValues,
            log.NewValues,
            log.CreatedAt,
            User = log.User != null ? new
            {
                log.User.Id,
                log.User.FirstName,
                log.User.LastName,
                log.User.Email
            } : null
        });
    }
}

