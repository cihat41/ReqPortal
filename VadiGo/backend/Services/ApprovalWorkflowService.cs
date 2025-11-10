using Microsoft.EntityFrameworkCore;
using TalepSistemi.API.Data;
using TalepSistemi.API.Models;

namespace TalepSistemi.API.Services;

public class ApprovalWorkflowService : IApprovalWorkflowService
{
    private readonly ApplicationDbContext _context;
    private readonly ILogger<ApprovalWorkflowService> _logger;
    private readonly IEmailService _emailService;

    public ApprovalWorkflowService(
        ApplicationDbContext context,
        ILogger<ApprovalWorkflowService> logger,
        IEmailService emailService)
    {
        _context = context;
        _logger = logger;
        _emailService = emailService;
    }

    public async Task CreateApprovalsForRequestAsync(int requestId, int workflowId)
    {
        var workflow = await _context.ApprovalWorkflows
            .Include(w => w.Steps)
                .ThenInclude(s => s.User)
            .Include(w => w.Steps)
                .ThenInclude(s => s.Role)
                    .ThenInclude(r => r!.UserRoles)
                        .ThenInclude(ur => ur.User)
            .FirstOrDefaultAsync(w => w.Id == workflowId);

        if (workflow == null)
        {
            _logger.LogWarning($"Workflow {workflowId} bulunamadı");
            return;
        }

        var request = await _context.Requests
            .Include(r => r.Requester)
            .FirstOrDefaultAsync(r => r.Id == requestId);

        if (request == null)
        {
            _logger.LogWarning($"Request {requestId} bulunamadı");
            return;
        }

        // Workflow step'lerini level ve order'a göre sırala
        var orderedSteps = workflow.Steps
            .OrderBy(s => s.Level)
            .ThenBy(s => s.StepOrder)
            .ToList();

        var approvals = new List<Approval>();

        foreach (var step in orderedSteps)
        {
            // Step'e göre onaylayıcıları belirle
            var approvers = new List<User>();

            if (step.UserId.HasValue && step.User != null)
            {
                approvers.Add(step.User);
            }
            else if (step.RoleId.HasValue && step.Role != null)
            {
                // Role'deki tüm kullanıcıları al
                approvers.AddRange(step.Role.UserRoles.Select(ur => ur.User));
            }

            // Her onaylayıcı için approval kaydı oluştur
            foreach (var approver in approvers)
            {
                var approval = new Approval
                {
                    RequestId = requestId,
                    ApproverId = approver.Id,
                    Status = ApprovalStatus.Pending,
                    Level = step.Level,
                    Order = step.StepOrder,
                    TimeoutHours = step.TimeoutHours,
                    EscalationRoleId = step.EscalationRoleId,
                    EscalationUserId = step.EscalationUserId,
                    CreatedAt = DateTime.UtcNow
                };

                approvals.Add(approval);
            }
        }

        if (approvals.Any())
        {
            await _context.Approvals.AddRangeAsync(approvals);
            await _context.SaveChangesAsync();

            // İlk level'daki onaylayıcılara email gönder
            var firstLevelApprovals = approvals.Where(a => a.Level == approvals.Min(x => x.Level)).ToList();
            foreach (var approval in firstLevelApprovals)
            {
                var approver = await _context.Users.FindAsync(approval.ApproverId);
                if (approver != null)
                {
                    try
                    {
                        await _emailService.SendEmailAsync(
                            approver.Email,
                            $"Yeni Talep Onayı Bekliyor: {request.Title}",
                            $@"Merhaba {approver.FirstName},

{request.Requester.FirstName} {request.Requester.LastName} tarafından yeni bir talep oluşturuldu ve onayınızı bekliyor.

Talep Başlığı: {request.Title}
Kategori: {request.Category}
Öncelik: {request.Priority}
Açıklama: {request.Description}

Talebi incelemek için sisteme giriş yapınız.

İyi çalışmalar."
                        );
                    }
                    catch (Exception ex)
                    {
                        _logger.LogError(ex, $"Email gönderilemedi: {approver.Email}");
                    }
                }
            }

            _logger.LogInformation($"Request {requestId} için {approvals.Count} approval kaydı oluşturuldu");
        }
    }

    public async Task<bool> ProcessApprovalAsync(int approvalId, string status, string? comments = null)
    {
        var approval = await _context.Approvals
            .Include(a => a.Request)
                .ThenInclude(r => r.Requester)
            .FirstOrDefaultAsync(a => a.Id == approvalId);

        if (approval == null)
        {
            return false;
        }

        approval.Status = status;
        approval.Comments = comments;
        approval.ApprovedAt = DateTime.UtcNow;
        approval.ReviewedAt = DateTime.UtcNow;

        // Eğer reddedildiyse, talebi reddet
        if (status == ApprovalStatus.Rejected)
        {
            approval.Request.Status = RequestStatus.Rejected;
            await _context.SaveChangesAsync();
            return true;
        }

        // Eğer onaylandıysa, level'ın tamamlanıp tamamlanmadığını kontrol et
        if (status == ApprovalStatus.Approved)
        {
            var isLevelCompleted = await IsLevelCompletedAsync(approval.RequestId, approval.Level);

            if (isLevelCompleted)
            {
                // Sonraki level var mı kontrol et
                var nextLevelApprovals = await _context.Approvals
                    .Where(a => a.RequestId == approval.RequestId && a.Level > approval.Level && a.Status == ApprovalStatus.Pending)
                    .OrderBy(a => a.Level)
                    .ToListAsync();

                if (nextLevelApprovals.Any())
                {
                    // Sonraki level'daki onaylayıcılara email gönder
                    var nextLevel = nextLevelApprovals.First().Level;
                    var nextLevelApprovers = nextLevelApprovals.Where(a => a.Level == nextLevel).ToList();

                    foreach (var nextApproval in nextLevelApprovers)
                    {
                        var approver = await _context.Users.FindAsync(nextApproval.ApproverId);
                        if (approver != null)
                        {
                            try
                            {
                                await _emailService.SendEmailAsync(
                                    approver.Email,
                                    $"Talep Onayınızı Bekliyor: {approval.Request.Title}",
                                    $@"Merhaba {approver.FirstName},

{approval.Request.Title} başlıklı talep bir önceki onay aşamasını geçti ve şimdi onayınızı bekliyor.

Talep Başlığı: {approval.Request.Title}
Kategori: {approval.Request.Category}
Öncelik: {approval.Request.Priority}

Talebi incelemek için sisteme giriş yapınız.

İyi çalışmalar."
                                );
                            }
                            catch (Exception ex)
                            {
                                _logger.LogError(ex, $"Email gönderilemedi: {approver.Email}");
                            }
                        }
                    }

                    approval.Request.Status = RequestStatus.PendingApproval;
                }
                else
                {
                    // Tüm onaylar tamamlandı
                    approval.Request.Status = RequestStatus.Approved;
                    approval.Request.CompletedAt = DateTime.UtcNow;

                    // Talep sahibine email gönder
                    try
                    {
                        await _emailService.SendEmailAsync(
                            approval.Request.Requester.Email,
                            $"Talebiniz Onaylandı: {approval.Request.Title}",
                            $@"Merhaba {approval.Request.Requester.FirstName},

{approval.Request.Title} başlıklı talebiniz tüm onay aşamalarını geçerek onaylandı.

Detayları görmek için sisteme giriş yapınız.

İyi çalışmalar."
                        );
                    }
                    catch (Exception ex)
                    {
                        _logger.LogError(ex, "Email gönderilemedi");
                    }
                }
            }
            else
            {
                // Level henüz tamamlanmadı, request durumu değişmez
                approval.Request.Status = RequestStatus.PendingApproval;
            }
        }

        await _context.SaveChangesAsync();
        return true;
    }

    public async Task<bool> IsLevelCompletedAsync(int requestId, int level)
    {
        // Bu level'daki tüm approval'ları al
        var levelApprovals = await _context.Approvals
            .Where(a => a.RequestId == requestId && a.Level == level)
            .ToListAsync();

        if (!levelApprovals.Any())
        {
            return false;
        }

        // Bu level için workflow step'i al
        var request = await _context.Requests
            .Include(r => r.FormTemplate)
                .ThenInclude(ft => ft!.DefaultWorkflow)
                    .ThenInclude(w => w!.Steps)
            .FirstOrDefaultAsync(r => r.Id == requestId);

        if (request?.FormTemplate?.DefaultWorkflow == null)
        {
            // Workflow yoksa, basit kontrol: tüm onaylar approved mı?
            return levelApprovals.All(a => a.Status == ApprovalStatus.Approved);
        }

        var workflowSteps = request.FormTemplate.DefaultWorkflow.Steps
            .Where(s => s.Level == level)
            .ToList();

        if (!workflowSteps.Any())
        {
            return levelApprovals.All(a => a.Status == ApprovalStatus.Approved);
        }

        // ✅ Workflow seviyesinden stratejiyi al
        var strategy = request.FormTemplate.DefaultWorkflow.ApprovalStrategy;

        var approvedCount = levelApprovals.Count(a => a.Status == ApprovalStatus.Approved);
        var totalCount = levelApprovals.Count;

        return strategy switch
        {
            ApprovalStrategies.Any => approvedCount >= 1,
            ApprovalStrategies.All => approvedCount == totalCount,
            ApprovalStrategies.Majority => approvedCount > (totalCount / 2.0),
            _ => approvedCount == totalCount
        };
    }
}

