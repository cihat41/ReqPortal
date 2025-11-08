using System.ComponentModel.DataAnnotations;

namespace TalepSistemi.API.Models;

public class EmailTemplate
{
    [Key]
    public int Id { get; set; }

    [Required]
    [MaxLength(100)]
    public string Name { get; set; } = string.Empty;

    [Required]
    [MaxLength(100)]
    public string EventType { get; set; } = string.Empty; // RequestCreated, RequestApproved, etc.

    [Required]
    [MaxLength(200)]
    public string Subject { get; set; } = string.Empty;

    [Required]
    public string Body { get; set; } = string.Empty; // HTML template with variables

    public bool IsActive { get; set; } = true;

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public DateTime? UpdatedAt { get; set; }
}

public static class EmailEventTypes
{
    public const string RequestCreated = "RequestCreated";
    public const string RequestSubmitted = "RequestSubmitted";
    public const string RequestApproved = "RequestApproved";
    public const string RequestRejected = "RequestRejected";
    public const string RequestReturned = "RequestReturned";
    public const string ApprovalPending = "ApprovalPending";
    public const string ApprovalReminder = "ApprovalReminder";
    public const string ApprovalEscalated = "ApprovalEscalated";
}

