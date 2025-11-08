using System.ComponentModel.DataAnnotations;

namespace TalepSistemi.API.Models;

public class AuditLog
{
    [Key]
    public int Id { get; set; }

    [Required]
    [MaxLength(100)]
    public string EntityName { get; set; } = string.Empty;

    [Required]
    [MaxLength(100)]
    public string EntityType { get; set; } = string.Empty;

    [Required]
    public int EntityId { get; set; }

    [Required]
    [MaxLength(50)]
    public string Action { get; set; } = string.Empty; // Create, Update, Delete, Approve, Reject

    public int? UserId { get; set; }

    public string? OldValues { get; set; } // JSON formatında eski değerler

    public string? NewValues { get; set; } // JSON formatında yeni değerler

    public string? Details { get; set; } // Ek detaylar

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public DateTime Timestamp { get; set; } = DateTime.UtcNow;

    [MaxLength(50)]
    public string? IpAddress { get; set; }

    // Navigation Properties
    public User? User { get; set; }
}

