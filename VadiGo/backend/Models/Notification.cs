using System.ComponentModel.DataAnnotations;

namespace TalepSistemi.API.Models;

public class Notification
{
    [Key]
    public int Id { get; set; }

    [Required]
    public int UserId { get; set; }

    [Required]
    [MaxLength(100)]
    public string Type { get; set; } = string.Empty; // RequestCreated, ApprovalPending, RequestApproved, etc.

    [Required]
    [MaxLength(200)]
    public string Title { get; set; } = string.Empty;

    [Required]
    public string Message { get; set; } = string.Empty;

    public int? RelatedRequestId { get; set; }

    public int? RelatedApprovalId { get; set; }

    public bool IsRead { get; set; } = false;

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public DateTime? ReadAt { get; set; }

    // Navigation Properties
    public User User { get; set; } = null!;
    public Request? RelatedRequest { get; set; }
    public Approval? RelatedApproval { get; set; }
}

// Bildirim tipleri
public static class NotificationType
{
    public const string RequestCreated = "RequestCreated";
    public const string RequestSubmitted = "RequestSubmitted";
    public const string RequestApproved = "RequestApproved";
    public const string RequestRejected = "RequestRejected";
    public const string RequestReturned = "RequestReturned";
    public const string ApprovalPending = "ApprovalPending";
    public const string ApprovalTimeout = "ApprovalTimeout";
    public const string SlaViolation = "SlaViolation";
    public const string CommentAdded = "CommentAdded";
}

