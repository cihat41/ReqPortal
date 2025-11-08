using Microsoft.EntityFrameworkCore;
using TalepSistemi.API.Data;
using TalepSistemi.API.Models;

namespace TalepSistemi.API.Services;

public class SlaMonitoringService : BackgroundService
{
    private readonly IServiceProvider _serviceProvider;
    private readonly ILogger<SlaMonitoringService> _logger;
    private readonly TimeSpan _checkInterval = TimeSpan.FromMinutes(15);

    public SlaMonitoringService(
        IServiceProvider serviceProvider,
        ILogger<SlaMonitoringService> logger)
    {
        _serviceProvider = serviceProvider;
        _logger = logger;
    }

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        _logger.LogInformation("SLA Monitoring Service started");

        while (!stoppingToken.IsCancellationRequested)
        {
            try
            {
                await CheckSlaViolationsAsync();
                await CheckEscalationsAsync();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error in SLA monitoring service");
            }

            await Task.Delay(_checkInterval, stoppingToken);
        }

        _logger.LogInformation("SLA Monitoring Service stopped");
    }

    private async Task CheckSlaViolationsAsync()
    {
        using var scope = _serviceProvider.CreateScope();
        var context = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
        var emailService = scope.ServiceProvider.GetRequiredService<IEmailService>();

        var now = DateTime.UtcNow;

        // Find requests that are overdue
        var overdueRequests = await context.Requests
            .Include(r => r.Requester)
            .Where(r => r.Status == "Submitted" || r.Status == "InProgress")
            .Where(r => r.DueDate.HasValue && r.DueDate.Value < now)
            .Where(r => !r.SlaViolationNotified)
            .ToListAsync();

        foreach (var request in overdueRequests)
        {
            _logger.LogWarning("SLA violation detected for request {RequestId}", request.Id);

            // Send notification
            var variables = new Dictionary<string, string>
            {
                { "{{RequestId}}", request.Id.ToString() },
                { "{{RequestTitle}}", request.Title },
                { "{{RequestCategory}}", request.Category },
                { "{{RequestPriority}}", request.Priority },
                { "{{RequestStatus}}", request.Status },
                { "{{UserFirstName}}", request.Requester.FirstName },
                { "{{UserLastName}}", request.Requester.LastName }
            };

            await emailService.SendTemplatedEmailAsync(
                request.Requester.Email,
                "SLA Violation",
                variables
            );

            request.SlaViolationNotified = true;
        }

        if (overdueRequests.Any())
        {
            await context.SaveChangesAsync();
        }
    }

    private async Task CheckEscalationsAsync()
    {
        using var scope = _serviceProvider.CreateScope();
        var context = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
        var emailService = scope.ServiceProvider.GetRequiredService<IEmailService>();

        var now = DateTime.UtcNow;

        // Find approvals that need escalation
        var overdueApprovals = await context.Approvals
            .Include(a => a.Request)
                .ThenInclude(r => r.Requester)
            .Include(a => a.Approver)
            .Where(a => a.Status == "Pending")
            .Where(a => a.TimeoutHours.HasValue && a.TimeoutHours.Value > 0)
            .Where(a => a.CreatedAt.AddHours(a.TimeoutHours!.Value) < now)
            .Where(a => !a.EscalationNotified)
            .ToListAsync();

        foreach (var approval in overdueApprovals)
        {
            _logger.LogWarning("Escalation needed for approval {ApprovalId}", approval.Id);

            // Send escalation notification
            var variables = new Dictionary<string, string>
            {
                { "{{RequestId}}", approval.Request.Id.ToString() },
                { "{{RequestTitle}}", approval.Request.Title },
                { "{{RequestCategory}}", approval.Request.Category },
                { "{{ApproverName}}", $"{approval.Approver.FirstName} {approval.Approver.LastName}" },
                { "{{UserFirstName}}", approval.Request.Requester.FirstName },
                { "{{UserLastName}}", approval.Request.Requester.LastName }
            };

            // Send to escalation contact if configured
            if (approval.EscalationUserId.HasValue)
            {
                var escalationUser = await context.Users.FindAsync(approval.EscalationUserId.Value);
                if (escalationUser != null)
                {
                    await emailService.SendTemplatedEmailAsync(
                        escalationUser.Email,
                        "Approval Escalated",
                        variables
                    );
                }
            }
            else if (approval.EscalationRoleId.HasValue)
            {
                var escalationUsers = await context.UserRoles
                    .Include(ur => ur.User)
                    .Where(ur => ur.RoleId == approval.EscalationRoleId.Value)
                    .Select(ur => ur.User.Email)
                    .ToListAsync();

                if (escalationUsers.Any())
                {
                    foreach (var email in escalationUsers)
                    {
                        await emailService.SendTemplatedEmailAsync(
                            email,
                            "Approval Escalated",
                            variables
                        );
                    }
                }
            }

            approval.EscalationNotified = true;
        }

        if (overdueApprovals.Any())
        {
            await context.SaveChangesAsync();
        }
    }
}

