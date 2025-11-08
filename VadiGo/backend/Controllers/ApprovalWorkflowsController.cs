using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using TalepSistemi.API.Data;
using TalepSistemi.API.Models;

namespace TalepSistemi.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize(Roles = "Admin,SystemAdmin")]
public class ApprovalWorkflowsController : ControllerBase
{
    private readonly ApplicationDbContext _context;

    public ApprovalWorkflowsController(ApplicationDbContext context)
    {
        _context = context;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<object>>> GetWorkflows([FromQuery] bool? isActive = null)
    {
        var query = _context.ApprovalWorkflows
            .Include(w => w.Steps)
            .AsQueryable();

        if (isActive.HasValue)
        {
            query = query.Where(w => w.IsActive == isActive.Value);
        }

        var workflows = await query
            .OrderBy(w => w.Priority)
            .Select(w => new
            {
                w.Id,
                w.Name,
                w.Description,
                w.Category,
                w.Conditions,
                w.IsActive,
                w.Priority,
                StepCount = w.Steps.Count
            })
            .ToListAsync();

        return Ok(workflows);
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<object>> GetWorkflow(int id)
    {
        var workflow = await _context.ApprovalWorkflows
            .Include(w => w.Steps)
                .ThenInclude(s => s.Role)
            .Include(w => w.Steps)
                .ThenInclude(s => s.User)
            .Include(w => w.Steps)
                .ThenInclude(s => s.EscalationRole)
            .Include(w => w.Steps)
                .ThenInclude(s => s.EscalationUser)
            .FirstOrDefaultAsync(w => w.Id == id);

        if (workflow == null)
        {
            return NotFound();
        }

        return Ok(new
        {
            workflow.Id,
            workflow.Name,
            workflow.Description,
            workflow.Category,
            workflow.Conditions,
            workflow.IsActive,
            workflow.Priority,
            Steps = workflow.Steps.OrderBy(s => s.StepOrder).Select(s => new
            {
                s.Id,
                s.StepOrder,
                s.StepType,
                s.TimeoutHours,
                s.IsEscalationEnabled,
                Role = s.Role != null ? new { s.Role.Id, s.Role.Name } : null,
                User = s.User != null ? new { s.User.Id, s.User.FirstName, s.User.LastName } : null,
                EscalationRole = s.EscalationRole != null ? new { s.EscalationRole.Id, s.EscalationRole.Name } : null,
                EscalationUser = s.EscalationUser != null ? new { s.EscalationUser.Id, s.EscalationUser.FirstName, s.EscalationUser.LastName } : null
            })
        });
    }

    [HttpPost]
    public async Task<ActionResult> CreateWorkflow([FromBody] WorkflowDto dto)
    {
        var workflow = new ApprovalWorkflow
        {
            Name = dto.Name,
            Description = dto.Description,
            Category = dto.Category,
            Conditions = dto.Conditions,
            IsActive = dto.IsActive,
            Priority = dto.Priority
        };

        _context.ApprovalWorkflows.Add(workflow);
        await _context.SaveChangesAsync();

        if (dto.Steps != null && dto.Steps.Any())
        {
            foreach (var stepDto in dto.Steps)
            {
                _context.ApprovalWorkflowSteps.Add(new ApprovalWorkflowStep
                {
                    WorkflowId = workflow.Id,
                    StepOrder = stepDto.StepOrder,
                    StepType = stepDto.StepType,
                    RoleId = stepDto.RoleId,
                    UserId = stepDto.UserId,
                    TimeoutHours = stepDto.TimeoutHours,
                    IsEscalationEnabled = stepDto.IsEscalationEnabled,
                    EscalationRoleId = stepDto.EscalationRoleId,
                    EscalationUserId = stepDto.EscalationUserId
                });
            }
            await _context.SaveChangesAsync();
        }

        return CreatedAtAction(nameof(GetWorkflow), new { id = workflow.Id }, new { workflow.Id });
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> UpdateWorkflow(int id, [FromBody] WorkflowDto dto)
    {
        var workflow = await _context.ApprovalWorkflows
            .Include(w => w.Steps)
            .FirstOrDefaultAsync(w => w.Id == id);

        if (workflow == null)
        {
            return NotFound();
        }

        workflow.Name = dto.Name;
        workflow.Description = dto.Description;
        workflow.Category = dto.Category;
        workflow.Conditions = dto.Conditions;
        workflow.IsActive = dto.IsActive;
        workflow.Priority = dto.Priority;

        // Remove old steps
        _context.ApprovalWorkflowSteps.RemoveRange(workflow.Steps);

        // Add new steps
        if (dto.Steps != null && dto.Steps.Any())
        {
            foreach (var stepDto in dto.Steps)
            {
                _context.ApprovalWorkflowSteps.Add(new ApprovalWorkflowStep
                {
                    WorkflowId = workflow.Id,
                    StepOrder = stepDto.StepOrder,
                    StepType = stepDto.StepType,
                    RoleId = stepDto.RoleId,
                    UserId = stepDto.UserId,
                    TimeoutHours = stepDto.TimeoutHours,
                    IsEscalationEnabled = stepDto.IsEscalationEnabled,
                    EscalationRoleId = stepDto.EscalationRoleId,
                    EscalationUserId = stepDto.EscalationUserId
                });
            }
        }

        await _context.SaveChangesAsync();

        return NoContent();
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteWorkflow(int id)
    {
        var workflow = await _context.ApprovalWorkflows.FindAsync(id);
        if (workflow == null)
        {
            return NotFound();
        }

        workflow.IsActive = false;
        await _context.SaveChangesAsync();

        return NoContent();
    }
}

public class WorkflowDto
{
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public string Category { get; set; } = string.Empty;
    public string? Conditions { get; set; }
    public bool IsActive { get; set; } = true;
    public int Priority { get; set; } = 0;
    public List<WorkflowStepDto>? Steps { get; set; }
}

public class WorkflowStepDto
{
    public int StepOrder { get; set; }
    public string StepType { get; set; } = StepTypes.Sequential;
    public int? RoleId { get; set; }
    public int? UserId { get; set; }
    public int? TimeoutHours { get; set; }
    public bool IsEscalationEnabled { get; set; } = false;
    public int? EscalationRoleId { get; set; }
    public int? EscalationUserId { get; set; }
}

