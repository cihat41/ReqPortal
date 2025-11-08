using System.ComponentModel.DataAnnotations;

namespace TalepSistemi.API.Models;

public class EmailSettings
{
    [Key]
    public int Id { get; set; }

    [Required]
    [MaxLength(200)]
    public string SmtpHost { get; set; } = string.Empty;

    [Required]
    public int SmtpPort { get; set; } = 587;

    [Required]
    [MaxLength(200)]
    public string SmtpUsername { get; set; } = string.Empty;

    [Required]
    [MaxLength(500)]
    public string SmtpPassword { get; set; } = string.Empty;

    [Required]
    [EmailAddress]
    [MaxLength(200)]
    public string FromEmail { get; set; } = string.Empty;

    [Required]
    [MaxLength(200)]
    public string FromName { get; set; } = string.Empty;

    public bool EnableSsl { get; set; } = true;

    public bool IsActive { get; set; } = true;

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public DateTime? UpdatedAt { get; set; }
}

