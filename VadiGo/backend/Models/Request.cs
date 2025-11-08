using System.ComponentModel.DataAnnotations;

namespace TalepSistemi.API.Models;

public class Request
{
    [Key]
    public int Id { get; set; }

    [Required]
    [MaxLength(200)]
    public string Title { get; set; } = string.Empty;

    [Required]
    public string Description { get; set; } = string.Empty;

    [Required]
    [MaxLength(50)]
    public string Type { get; set; } = string.Empty;

    [Required]
    [MaxLength(100)]
    public string Category { get; set; } = string.Empty;

    [Required]
    [MaxLength(50)]
    public string Priority { get; set; } = "Medium";

    public string? Justification { get; set; }

    public decimal? EstimatedCost { get; set; }

    [Required]
    public int RequesterId { get; set; }

    [Required]
    [MaxLength(50)]
    public string Status { get; set; } = RequestStatus.Draft;

    public string? FormData { get; set; } // JSON formatında form verileri

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public DateTime? UpdatedAt { get; set; }

    public DateTime? SubmittedAt { get; set; }

    public DateTime? CompletedAt { get; set; }

    public DateTime? DueDate { get; set; }

    public int? SlaHours { get; set; }

    public bool SlaViolationNotified { get; set; } = false;

    // Navigation Properties
    public User Requester { get; set; } = null!;
    public ICollection<Approval> Approvals { get; set; } = new List<Approval>();
    public ICollection<RequestComment> Comments { get; set; } = new List<RequestComment>();
    public ICollection<RequestAttachment> Attachments { get; set; } = new List<RequestAttachment>();
}

// Talep durumları
public static class RequestStatus
{
    public const string Draft = "Draft";
    public const string Submitted = "Submitted";
    public const string PendingApproval = "PendingApproval";
    public const string Approved = "Approved";
    public const string Rejected = "Rejected";
    public const string Cancelled = "Cancelled";
}

// Talep tipleri
public static class RequestType
{
    public const string Leave = "Leave";
    public const string Purchase = "Purchase";
    public const string Travel = "Travel";
    public const string IT = "IT";
    public const string HR = "HR";
    public const string Other = "Other";
}

