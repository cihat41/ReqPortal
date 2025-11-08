using Microsoft.EntityFrameworkCore;
using System.Net;
using System.Net.Mail;
using TalepSistemi.API.Data;

namespace TalepSistemi.API.Services;

public class EmailService : IEmailService
{
    private readonly IConfiguration _configuration;
    private readonly ApplicationDbContext _context;
    private readonly ILogger<EmailService> _logger;
    private readonly ISettingsService _settingsService;

    public EmailService(
        IConfiguration configuration,
        ApplicationDbContext context,
        ILogger<EmailService> logger,
        ISettingsService settingsService)
    {
        _configuration = configuration;
        _context = context;
        _logger = logger;
        _settingsService = settingsService;
    }

    public async Task SendEmailAsync(string to, string subject, string body)
    {
        await SendEmailAsync(new List<string> { to }, subject, body);
    }

    public async Task SendEmailAsync(List<string> to, string subject, string body)
    {
        try
        {
            // Önce veritabanından ayarları al
            var dbSettings = await _settingsService.GetEmailSettingsAsync();

            string? smtpHost;
            int smtpPort;
            string? smtpUsername;
            string? smtpPassword;
            string? fromEmail;
            string? fromName;
            bool enableSsl;

            if (dbSettings != null)
            {
                // Veritabanından ayarları kullan
                smtpHost = dbSettings.SmtpHost;
                smtpPort = dbSettings.SmtpPort;
                smtpUsername = dbSettings.SmtpUsername;
                smtpPassword = dbSettings.SmtpPassword;
                fromEmail = dbSettings.FromEmail;
                fromName = dbSettings.FromName;
                enableSsl = dbSettings.EnableSsl;

                _logger.LogInformation("Email ayarları veritabanından alındı");
            }
            else
            {
                // Fallback: appsettings.json'dan ayarları kullan
                var smtpSettings = _configuration.GetSection("EmailSettings");
                smtpHost = smtpSettings["SmtpHost"];
                smtpPort = int.Parse(smtpSettings["SmtpPort"] ?? "587");
                smtpUsername = smtpSettings["SmtpUsername"];
                smtpPassword = smtpSettings["SmtpPassword"];
                fromEmail = smtpSettings["FromEmail"];
                fromName = smtpSettings["FromName"];
                enableSsl = true;

                _logger.LogWarning("Email ayarları veritabanında bulunamadı, appsettings.json kullanılıyor");
            }

            // If SMTP is not configured, just log the email
            if (string.IsNullOrEmpty(smtpHost))
            {
                _logger.LogInformation(
                    "Email would be sent to {To} with subject '{Subject}'. Body: {Body}",
                    string.Join(", ", to), subject, body);
                return;
            }

            using var client = new SmtpClient(smtpHost, smtpPort)
            {
                Credentials = new NetworkCredential(smtpUsername, smtpPassword),
                EnableSsl = enableSsl
            };

            var mailMessage = new MailMessage
            {
                From = new MailAddress(fromEmail ?? smtpUsername ?? "", fromName ?? "Talep Sistemi"),
                Subject = subject,
                Body = body,
                IsBodyHtml = true
            };

            foreach (var recipient in to)
            {
                mailMessage.To.Add(recipient);
            }

            await client.SendMailAsync(mailMessage);
            _logger.LogInformation("Email sent successfully to {To}", string.Join(", ", to));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to send email to {To}", string.Join(", ", to));
            // Don't throw - email failures shouldn't break the application
        }
    }

    public async Task SendTemplatedEmailAsync(string to, string templateName, Dictionary<string, string> variables)
    {
        var template = await _context.EmailTemplates
            .FirstOrDefaultAsync(t => t.Name == templateName && t.IsActive);

        if (template == null)
        {
            _logger.LogWarning("Email template '{TemplateName}' not found", templateName);
            return;
        }

        var subject = ReplaceVariables(template.Subject, variables);
        var body = ReplaceVariables(template.Body, variables);

        await SendEmailAsync(to, subject, body);
    }

    private string ReplaceVariables(string text, Dictionary<string, string> variables)
    {
        foreach (var variable in variables)
        {
            text = text.Replace(variable.Key, variable.Value);
        }
        return text;
    }

    public async Task SendRequestSubmittedNotificationAsync(int requestId)
    {
        var request = await _context.Requests
            .Include(r => r.Requester)
            .FirstOrDefaultAsync(r => r.Id == requestId);

        if (request == null) return;

        var subject = $"Talep Gönderildi: {request.Title}";
        var body = $@"
            <h2>Talebiniz Başarıyla Gönderildi</h2>
            <p>Sayın {request.Requester.FirstName} {request.Requester.LastName},</p>
            <p>Aşağıdaki talebiniz başarıyla gönderilmiştir:</p>
            <ul>
                <li><strong>Başlık:</strong> {request.Title}</li>
                <li><strong>Kategori:</strong> {request.Category}</li>
                <li><strong>Öncelik:</strong> {request.Priority}</li>
                <li><strong>Durum:</strong> {request.Status}</li>
            </ul>
            <p>Talebiniz ilgili kişiler tarafından değerlendirilecektir.</p>
        ";

        await SendEmailAsync(request.Requester.Email, subject, body);
    }

    public async Task SendApprovalNotificationAsync(int approvalId)
    {
        var approval = await _context.Approvals
            .Include(a => a.Request)
                .ThenInclude(r => r.Requester)
            .Include(a => a.Approver)
            .FirstOrDefaultAsync(a => a.Id == approvalId);

        if (approval == null) return;

        var subject = $"Onay Bekleyen Talep: {approval.Request.Title}";
        var body = $@"
            <h2>Onayınız Bekleniyor</h2>
            <p>Sayın {approval.Approver.FirstName} {approval.Approver.LastName},</p>
            <p>Aşağıdaki talep onayınızı beklemektedir:</p>
            <ul>
                <li><strong>Başlık:</strong> {approval.Request.Title}</li>
                <li><strong>Talep Eden:</strong> {approval.Request.Requester.FirstName} {approval.Request.Requester.LastName}</li>
                <li><strong>Kategori:</strong> {approval.Request.Category}</li>
                <li><strong>Öncelik:</strong> {approval.Request.Priority}</li>
                <li><strong>Açıklama:</strong> {approval.Request.Description}</li>
            </ul>
            <p>Lütfen sisteme giriş yaparak talebi değerlendirin.</p>
        ";

        await SendEmailAsync(approval.Approver.Email, subject, body);
    }

    public async Task SendRequestApprovedNotificationAsync(int requestId)
    {
        var request = await _context.Requests
            .Include(r => r.Requester)
            .FirstOrDefaultAsync(r => r.Id == requestId);

        if (request == null) return;

        var subject = $"Talep Onaylandı: {request.Title}";
        var body = $@"
            <h2>Talebiniz Onaylandı</h2>
            <p>Sayın {request.Requester.FirstName} {request.Requester.LastName},</p>
            <p>Aşağıdaki talebiniz onaylanmıştır:</p>
            <ul>
                <li><strong>Başlık:</strong> {request.Title}</li>
                <li><strong>Kategori:</strong> {request.Category}</li>
                <li><strong>Durum:</strong> Onaylandı</li>
            </ul>
            <p>Tebrikler! Talebiniz tüm onay aşamalarından geçmiştir.</p>
        ";

        await SendEmailAsync(request.Requester.Email, subject, body);
    }

    public async Task SendRequestRejectedNotificationAsync(int requestId)
    {
        var request = await _context.Requests
            .Include(r => r.Requester)
            .FirstOrDefaultAsync(r => r.Id == requestId);

        if (request == null) return;

        var subject = $"Talep Reddedildi: {request.Title}";
        var body = $@"
            <h2>Talebiniz Reddedildi</h2>
            <p>Sayın {request.Requester.FirstName} {request.Requester.LastName},</p>
            <p>Aşağıdaki talebiniz reddedilmiştir:</p>
            <ul>
                <li><strong>Başlık:</strong> {request.Title}</li>
                <li><strong>Kategori:</strong> {request.Category}</li>
                <li><strong>Durum:</strong> Reddedildi</li>
            </ul>
            <p>Detaylar için lütfen sisteme giriş yapın.</p>
        ";

        await SendEmailAsync(request.Requester.Email, subject, body);
    }
}

