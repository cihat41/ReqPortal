using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using TalepSistemi.API.Data;
using TalepSistemi.API.Models;

namespace TalepSistemi.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class FormTemplatesController : ControllerBase
{
    private readonly ApplicationDbContext _context;

    public FormTemplatesController(ApplicationDbContext context)
    {
        _context = context;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<object>>> GetFormTemplates([FromQuery] bool? isActive = null)
    {
        var query = _context.FormTemplates
            .Include(ft => ft.Fields.OrderBy(f => f.Order))
            .Include(ft => ft.Creator)
            .AsQueryable();

        if (isActive.HasValue)
        {
            query = query.Where(ft => ft.IsActive == isActive.Value);
        }

        var templates = await query
            .OrderByDescending(ft => ft.CreatedAt)
            .Select(ft => new
            {
                ft.Id,
                ft.Name,
                ft.Description,
                ft.Category,
                ft.IsActive,
                ft.Version,
                ft.DefaultWorkflowId,
                ft.CreatedAt,
                ft.UpdatedAt,
                CreatedBy = ft.Creator != null ? new
                {
                    ft.Creator.Id,
                    ft.Creator.FirstName,
                    ft.Creator.LastName,
                    ft.Creator.Email
                } : null,
                FieldCount = ft.Fields.Count
            })
            .ToListAsync();

        return Ok(templates);
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<object>> GetFormTemplate(int id)
    {
        var template = await _context.FormTemplates
            .Include(ft => ft.Fields.OrderBy(f => f.Order))
            .Include(ft => ft.Creator)
            .FirstOrDefaultAsync(ft => ft.Id == id);

        if (template == null)
        {
            return NotFound();
        }

        return Ok(new
        {
            template.Id,
            template.Name,
            template.Description,
            template.Category,
            template.IsActive,
            template.Version,
            template.DefaultWorkflowId,
            template.CreatedAt,
            template.UpdatedAt,
            CreatedBy = template.Creator != null ? new
            {
                template.Creator.Id,
                template.Creator.FirstName,
                template.Creator.LastName,
                template.Creator.Email
            } : null,
            Fields = template.Fields.Select(f => new
            {
                f.Id,
                f.Name,
                f.Label,
                f.FieldType,
                f.Order,
                f.IsRequired,
                f.DefaultValue,
                f.Placeholder,
                f.ValidationRules,
                f.Options,
                f.DependsOn,
                f.VisibilityCondition,
                f.CalculationFormula,
                f.HelpText
            })
        });
    }

    [HttpPost]
    [Authorize(Roles = "Admin,SystemAdmin")]
    public async Task<ActionResult<FormTemplate>> CreateFormTemplate([FromBody] FormTemplateDto dto)
    {
        var userIdClaim = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
        if (string.IsNullOrEmpty(userIdClaim) || !int.TryParse(userIdClaim, out int userId))
        {
            return Unauthorized();
        }

        var template = new FormTemplate
        {
            Name = dto.Name,
            Description = dto.Description,
            Category = dto.Category,
            IsActive = dto.IsActive,
            DefaultWorkflowId = dto.DefaultWorkflowId,
            CreatedBy = userId,
            CreatedAt = DateTime.UtcNow
        };

        _context.FormTemplates.Add(template);
        await _context.SaveChangesAsync();

        if (dto.Fields != null && dto.Fields.Any())
        {
            foreach (var fieldDto in dto.Fields)
            {
                var field = new FormField
                {
                    FormTemplateId = template.Id,
                    Name = fieldDto.Name,
                    Label = fieldDto.Label,
                    FieldType = fieldDto.FieldType,
                    Order = fieldDto.Order,
                    IsRequired = fieldDto.IsRequired,
                    DefaultValue = fieldDto.DefaultValue,
                    Placeholder = fieldDto.Placeholder,
                    ValidationRules = fieldDto.ValidationRules,
                    Options = fieldDto.Options,
                    DependsOn = fieldDto.DependsOn,
                    VisibilityCondition = fieldDto.VisibilityCondition,
                    CalculationFormula = fieldDto.CalculationFormula,
                    HelpText = fieldDto.HelpText
                };
                _context.FormFields.Add(field);
            }
            await _context.SaveChangesAsync();
        }

        // Return DTO to avoid circular reference
        return CreatedAtAction(nameof(GetFormTemplate), new { id = template.Id }, new
        {
            template.Id,
            template.Name,
            template.Description,
            template.Category,
            template.IsActive,
            template.Version,
            template.CreatedAt
        });
    }

    [HttpPut("{id}")]
    [Authorize(Roles = "Admin,SystemAdmin")]
    public async Task<IActionResult> UpdateFormTemplate(int id, [FromBody] FormTemplateDto dto)
    {
        var template = await _context.FormTemplates
            .Include(ft => ft.Fields)
            .FirstOrDefaultAsync(ft => ft.Id == id);

        if (template == null)
        {
            return NotFound();
        }

        template.Name = dto.Name;
        template.Description = dto.Description;
        template.Category = dto.Category;
        template.IsActive = dto.IsActive;
        template.DefaultWorkflowId = dto.DefaultWorkflowId;
        template.UpdatedAt = DateTime.UtcNow;

        // Remove old fields
        _context.FormFields.RemoveRange(template.Fields);

        // Add new fields
        if (dto.Fields != null && dto.Fields.Any())
        {
            foreach (var fieldDto in dto.Fields)
            {
                var field = new FormField
                {
                    FormTemplateId = template.Id,
                    Name = fieldDto.Name,
                    Label = fieldDto.Label,
                    FieldType = fieldDto.FieldType,
                    Order = fieldDto.Order,
                    IsRequired = fieldDto.IsRequired,
                    DefaultValue = fieldDto.DefaultValue,
                    Placeholder = fieldDto.Placeholder,
                    ValidationRules = fieldDto.ValidationRules,
                    Options = fieldDto.Options,
                    DependsOn = fieldDto.DependsOn,
                    VisibilityCondition = fieldDto.VisibilityCondition,
                    CalculationFormula = fieldDto.CalculationFormula,
                    HelpText = fieldDto.HelpText
                };
                _context.FormFields.Add(field);
            }
        }

        await _context.SaveChangesAsync();

        return NoContent();
    }

    [HttpDelete("{id}")]
    [Authorize(Roles = "Admin,SystemAdmin")]
    public async Task<IActionResult> DeleteFormTemplate(int id)
    {
        var template = await _context.FormTemplates.FindAsync(id);
        if (template == null)
        {
            return NotFound();
        }

        _context.FormTemplates.Remove(template);
        await _context.SaveChangesAsync();

        return NoContent();
    }
}

public class FormTemplateDto
{
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public string Category { get; set; } = string.Empty;
    public bool IsActive { get; set; } = true;
    public int? DefaultWorkflowId { get; set; }
    public List<FormFieldDto>? Fields { get; set; }
}

public class FormFieldDto
{
    public string Name { get; set; } = string.Empty;
    public string Label { get; set; } = string.Empty;
    public string FieldType { get; set; } = FieldTypes.Text;
    public int Order { get; set; }
    public bool IsRequired { get; set; } = false;
    public string? DefaultValue { get; set; }
    public string? Placeholder { get; set; }
    public string? ValidationRules { get; set; }
    public string? Options { get; set; }
    public string? DependsOn { get; set; }
    public string? VisibilityCondition { get; set; }
    public string? CalculationFormula { get; set; }
    public string? HelpText { get; set; }
}

