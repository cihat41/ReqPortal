namespace TalepSistemi.API.Services;

public interface IEmailService
{
    Task SendEmailAsync(string to, string subject, string body);
    Task SendEmailAsync(List<string> to, string subject, string body);
    Task SendTemplatedEmailAsync(string to, string templateName, Dictionary<string, string> variables);
    Task SendRequestSubmittedNotificationAsync(int requestId);
    Task SendApprovalNotificationAsync(int approvalId);
    Task SendRequestApprovedNotificationAsync(int requestId);
    Task SendRequestRejectedNotificationAsync(int requestId);
}

