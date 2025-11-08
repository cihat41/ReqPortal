using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using TalepSistemi.API.Models;
using TalepSistemi.API.Services;

namespace TalepSistemi.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize(Roles = "Admin,SystemAdmin")]
public class SettingsController : ControllerBase
{
    private readonly ISettingsService _settingsService;
    private readonly IEmailService _emailService;
    private readonly ILogger<SettingsController> _logger;

    public SettingsController(
        ISettingsService settingsService,
        IEmailService emailService,
        ILogger<SettingsController> logger)
    {
        _settingsService = settingsService;
        _emailService = emailService;
        _logger = logger;
    }

    [HttpGet("email")]
    public async Task<ActionResult<object>> GetEmailSettings()
    {
        try
        {
            var settings = await _settingsService.GetEmailSettingsAsync();

            if (settings == null)
            {
                return Ok(new
                {
                    smtpHost = "",
                    smtpPort = 587,
                    smtpUsername = "",
                    smtpPassword = "***",
                    fromEmail = "noreply@talepsistemi.com",
                    fromName = "Talep Yönetim Sistemi",
                    enableSsl = true
                });
            }

            return Ok(new
            {
                id = settings.Id,
                smtpHost = settings.SmtpHost,
                smtpPort = settings.SmtpPort,
                smtpUsername = settings.SmtpUsername,
                smtpPassword = "***", // Don't expose password
                fromEmail = settings.FromEmail,
                fromName = settings.FromName,
                enableSsl = settings.EnableSsl
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Email ayarları getirilirken hata oluştu");
            return StatusCode(500, new { message = "Email ayarları getirilirken hata oluştu" });
        }
    }

    [HttpPost("email")]
    public async Task<ActionResult> UpdateEmailSettings([FromBody] EmailSettingsDto dto)
    {
        try
        {
            _logger.LogInformation("Email ayarları güncelleniyor: {@dto}", dto);

            if (!ModelState.IsValid)
            {
                _logger.LogWarning("Model validation hatası: {@errors}", ModelState.Values.SelectMany(v => v.Errors));
                return BadRequest(new { message = "Geçersiz veri", errors = ModelState });
            }

            var settings = new EmailSettings
            {
                Id = dto.Id,
                SmtpHost = dto.SmtpHost,
                SmtpPort = dto.SmtpPort,
                SmtpUsername = dto.SmtpUsername,
                SmtpPassword = dto.SmtpPassword ?? "",
                FromEmail = dto.FromEmail,
                FromName = dto.FromName,
                EnableSsl = dto.EnableSsl
            };

            var updatedSettings = await _settingsService.UpdateEmailSettingsAsync(settings);

            return Ok(new
            {
                message = "Email ayarları başarıyla güncellendi",
                settings = new
                {
                    id = updatedSettings.Id,
                    smtpHost = updatedSettings.SmtpHost,
                    smtpPort = updatedSettings.SmtpPort,
                    smtpUsername = updatedSettings.SmtpUsername,
                    fromEmail = updatedSettings.FromEmail,
                    fromName = updatedSettings.FromName,
                    enableSsl = updatedSettings.EnableSsl
                }
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Email ayarları güncellenirken hata oluştu");
            return StatusCode(500, new { message = $"Email ayarları güncellenirken hata oluştu: {ex.Message}" });
        }
    }

    [HttpPost("email/test")]
    public async Task<ActionResult> TestEmailSettings([FromBody] TestEmailDto dto)
    {
        try
        {
            await _emailService.SendEmailAsync(
                dto.Email,
                "Test E-postası - Talep Yönetim Sistemi",
                @"<h2>Test E-postası</h2>
                  <p>Bu bir test e-postasıdır.</p>
                  <p>SMTP ayarlarınız doğru şekilde yapılandırılmıştır.</p>
                  <p><strong>Talep Yönetim Sistemi</strong></p>"
            );
            
            return Ok(new { message = "Test email sent successfully" });
        }
        catch (Exception ex)
        {
            return BadRequest(new { message = $"Failed to send test email: {ex.Message}" });
        }
    }
}

public class EmailSettingsDto
{
    public int Id { get; set; }
    public string SmtpHost { get; set; } = string.Empty;
    public int SmtpPort { get; set; } = 587;
    public string SmtpUsername { get; set; } = string.Empty;
    public string? SmtpPassword { get; set; }
    public string FromEmail { get; set; } = string.Empty;
    public string FromName { get; set; } = string.Empty;
    public bool EnableSsl { get; set; } = true;
}

public class TestEmailDto
{
    public string Email { get; set; } = string.Empty;
}

