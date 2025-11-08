using System.ComponentModel.DataAnnotations;

namespace TalepSistemi.API.Models;

public class RequestComment
{
    [Key]
    public int Id { get; set; }

    [Required]
    public int RequestId { get; set; }

    [Required]
    public int UserId { get; set; }

    [Required]
    public string Comment { get; set; } = string.Empty;

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    // Navigation Properties
    public Request Request { get; set; } = null!;
    public User User { get; set; } = null!;
}

