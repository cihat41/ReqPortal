using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using TalepSistemi.API.Data;
using TalepSistemi.API.Models;

namespace TalepSistemi.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize(Roles = "Admin,SystemAdmin")]
public class EmailTemplatesController : ControllerBase
{
    private readonly ApplicationDbContext _context;

    public EmailTemplatesController(ApplicationDbContext context)
    {
        _context = context;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<object>>> GetTemplates([FromQuery] bool? isActive = null)
    {
        var query = _context.EmailTemplates.AsQueryable();

        if (isActive.HasValue)
        {
            query = query.Where(t => t.IsActive == isActive.Value);
        }

        var templates = await query
            .OrderBy(t => t.EventType)
            .Select(t => new
            {
                t.Id,
                t.Name,
                t.EventType,
                t.Subject,
                t.IsActive
            })
            .ToListAsync();

        return Ok(templates);
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<object>> GetTemplate(int id)
    {
        var template = await _context.EmailTemplates.FindAsync(id);

        if (template == null)
        {
            return NotFound();
        }

        return Ok(new
        {
            template.Id,
            template.Name,
            template.EventType,
            template.Subject,
            template.Body,
            template.IsActive
        });
    }

    [HttpPost]
    public async Task<ActionResult> CreateTemplate([FromBody] EmailTemplateDto dto)
    {
        var template = new EmailTemplate
        {
            Name = dto.Name,
            EventType = dto.EventType,
            Subject = dto.Subject,
            Body = dto.Body,
            IsActive = dto.IsActive
        };

        _context.EmailTemplates.Add(template);
        await _context.SaveChangesAsync();

        return CreatedAtAction(nameof(GetTemplate), new { id = template.Id }, new { template.Id });
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> UpdateTemplate(int id, [FromBody] EmailTemplateDto dto)
    {
        var template = await _context.EmailTemplates.FindAsync(id);

        if (template == null)
        {
            return NotFound();
        }

        template.Name = dto.Name;
        template.EventType = dto.EventType;
        template.Subject = dto.Subject;
        template.Body = dto.Body;
        template.IsActive = dto.IsActive;

        await _context.SaveChangesAsync();

        return NoContent();
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteTemplate(int id)
    {
        var template = await _context.EmailTemplates.FindAsync(id);
        if (template == null)
        {
            return NotFound();
        }

        template.IsActive = false;
        await _context.SaveChangesAsync();

        return NoContent();
    }

    [HttpGet("event-types")]
    public ActionResult<IEnumerable<string>> GetEventTypes()
    {
        return Ok(new[]
        {
            EmailEventTypes.RequestCreated,
            EmailEventTypes.RequestSubmitted,
            EmailEventTypes.RequestApproved,
            EmailEventTypes.RequestRejected,
            EmailEventTypes.RequestReturned,
            EmailEventTypes.ApprovalPending,
            EmailEventTypes.ApprovalReminder,
            EmailEventTypes.ApprovalEscalated
        });
    }

    [HttpGet("variables")]
    public ActionResult<object> GetAvailableVariables()
    {
        return Ok(new
        {
            request = new[]
            {
                "{{RequestId}}",
                "{{RequestTitle}}",
                "{{RequestDescription}}",
                "{{RequestCategory}}",
                "{{RequestPriority}}",
                "{{RequestStatus}}",
                "{{RequestCreatedAt}}",
                "{{RequestCreatedBy}}"
            },
            user = new[]
            {
                "{{UserFirstName}}",
                "{{UserLastName}}",
                "{{UserEmail}}",
                "{{UserDepartment}}"
            },
            approval = new[]
            {
                "{{ApproverName}}",
                "{{ApprovalStatus}}",
                "{{ApprovalComments}}",
                "{{ApprovalDate}}"
            },
            system = new[]
            {
                "{{SystemUrl}}",
                "{{CurrentDate}}",
                "{{CurrentTime}}"
            }
        });
    }
}

public class EmailTemplateDto
{
    public string Name { get; set; } = string.Empty;
    public string EventType { get; set; } = string.Empty;
    public string Subject { get; set; } = string.Empty;
    public string Body { get; set; } = string.Empty;
    public bool IsActive { get; set; } = true;
}

