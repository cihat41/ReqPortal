using Microsoft.EntityFrameworkCore;
using TalepSistemi.API.Data;
using TalepSistemi.API.Models;

namespace TalepSistemi.API.Services;

public class SettingsService : ISettingsService
{
    private readonly ApplicationDbContext _context;
    private readonly ILogger<SettingsService> _logger;

    public SettingsService(ApplicationDbContext context, ILogger<SettingsService> logger)
    {
        _context = context;
        _logger = logger;
    }

    public async Task<EmailSettings?> GetEmailSettingsAsync()
    {
        try
        {
            // Aktif email ayarlarını getir
            var settings = await _context.EmailSettings
                .Where(s => s.IsActive)
                .OrderByDescending(s => s.CreatedAt)
                .FirstOrDefaultAsync();

            return settings;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Email ayarları getirilirken hata oluştu");
            return null;
        }
    }

    public async Task<EmailSettings> UpdateEmailSettingsAsync(EmailSettings settings)
    {
        try
        {
            // Mevcut aktif ayarları pasif yap
            var existingSettings = await _context.EmailSettings
                .Where(s => s.IsActive)
                .ToListAsync();

            foreach (var existing in existingSettings)
            {
                existing.IsActive = false;
                existing.UpdatedAt = DateTime.UtcNow;
            }

            // Yeni ayarları ekle veya güncelle
            if (settings.Id > 0)
            {
                // Mevcut kaydı güncelle
                var existingSetting = await _context.EmailSettings.FindAsync(settings.Id);
                if (existingSetting != null)
                {
                    existingSetting.SmtpHost = settings.SmtpHost;
                    existingSetting.SmtpPort = settings.SmtpPort;
                    existingSetting.SmtpUsername = settings.SmtpUsername;
                    
                    // Şifre değiştirilmişse güncelle (*** değilse)
                    if (!string.IsNullOrEmpty(settings.SmtpPassword) && settings.SmtpPassword != "***")
                    {
                        existingSetting.SmtpPassword = settings.SmtpPassword;
                    }
                    
                    existingSetting.FromEmail = settings.FromEmail;
                    existingSetting.FromName = settings.FromName;
                    existingSetting.EnableSsl = settings.EnableSsl;
                    existingSetting.IsActive = true;
                    existingSetting.UpdatedAt = DateTime.UtcNow;

                    _context.EmailSettings.Update(existingSetting);
                    settings = existingSetting;
                }
            }
            else
            {
                // Yeni kayıt ekle
                settings.IsActive = true;
                settings.CreatedAt = DateTime.UtcNow;
                await _context.EmailSettings.AddAsync(settings);
            }

            await _context.SaveChangesAsync();

            _logger.LogInformation("Email ayarları başarıyla güncellendi");
            return settings;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Email ayarları güncellenirken hata oluştu");
            throw;
        }
    }
}

