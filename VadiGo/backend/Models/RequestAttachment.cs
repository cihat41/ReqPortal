using System.ComponentModel.DataAnnotations;

namespace TalepSistemi.API.Models;

public class RequestAttachment
{
    [Key]
    public int Id { get; set; }

    [Required]
    public int RequestId { get; set; }

    [Required]
    [MaxLength(255)]
    public string FileName { get; set; } = string.Empty;

    [Required]
    [MaxLength(500)]
    public string FilePath { get; set; } = string.Empty;

    [MaxLength(100)]
    public string? ContentType { get; set; }

    public long FileSize { get; set; }

    public DateTime UploadedAt { get; set; } = DateTime.UtcNow;

    public int UploadedBy { get; set; }

    // Navigation Properties
    public Request Request { get; set; } = null!;
    public User Uploader { get; set; } = null!;
}

