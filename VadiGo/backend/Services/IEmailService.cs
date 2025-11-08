namespace TalepSistemi.API.Services;

public interface IEmailService
{
    Task SendEmailAsync(string to, string subject, string body);
    Task SendRequestSubmittedNotificationAsync(int requestId);
    Task SendApprovalNotificationAsync(int approvalId);
    Task SendRequestApprovedNotificationAsync(int requestId);
    Task SendRequestRejectedNotificationAsync(int requestId);
}

