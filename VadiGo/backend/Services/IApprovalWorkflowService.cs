using TalepSistemi.API.Models;

namespace TalepSistemi.API.Services;

public interface IApprovalWorkflowService
{
    /// <summary>
    /// Workflow'a göre approval kayıtları oluşturur
    /// </summary>
    Task CreateApprovalsForRequestAsync(int requestId, int workflowId);

    /// <summary>
    /// Bir approval onaylandığında sonraki adımları kontrol eder
    /// </summary>
    Task<bool> ProcessApprovalAsync(int approvalId, string status, string? comments = null);

    /// <summary>
    /// Paralel onaylarda stratejiye göre level'ın tamamlanıp tamamlanmadığını kontrol eder
    /// </summary>
    Task<bool> IsLevelCompletedAsync(int requestId, int level);
}

