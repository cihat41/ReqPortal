using TalepSistemi.API.Models;

namespace TalepSistemi.API.Services;

public interface ISettingsService
{
    Task<EmailSettings?> GetEmailSettingsAsync();
    Task<EmailSettings> UpdateEmailSettingsAsync(EmailSettings settings);
}

