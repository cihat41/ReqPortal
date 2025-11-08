using System.ComponentModel.DataAnnotations;

namespace TalepSistemi.API.Models;

public class Approval
{
    [Key]
    public int Id { get; set; }

    [Required]
    public int RequestId { get; set; }

    [Required]
    public int ApproverId { get; set; }

    [Required]
    [MaxLength(50)]
    public string Status { get; set; } = ApprovalStatus.Pending;

    public int Order { get; set; } = 1; // Onay sırası (seri onay için)

    public int Level { get; set; } = 1; // Onay seviyesi

    public string? Comments { get; set; } // Onaylayıcının yorumları

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public DateTime? ReviewedAt { get; set; }

    public DateTime? ApprovedAt { get; set; }

    public int? TimeoutHours { get; set; }

    public int? EscalationRoleId { get; set; }

    public int? EscalationUserId { get; set; }

    public bool EscalationNotified { get; set; } = false;

    // Navigation Properties
    public Request Request { get; set; } = null!;
    public User Approver { get; set; } = null!;
    public Role? EscalationRole { get; set; }
    public User? EscalationUser { get; set; }
}

// Onay durumları
public static class ApprovalStatus
{
    public const string Pending = "Pending";
    public const string Approved = "Approved";
    public const string Rejected = "Rejected";
    public const string Returned = "Returned"; // İade edildi
}

