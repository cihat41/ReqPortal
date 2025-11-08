using System.ComponentModel.DataAnnotations;

namespace TalepSistemi.API.Models;

public class FormTemplate
{
    [Key]
    public int Id { get; set; }

    [Required]
    [MaxLength(200)]
    public string Name { get; set; } = string.Empty;

    [MaxLength(500)]
    public string? Description { get; set; }

    [Required]
    [MaxLength(100)]
    public string Category { get; set; } = string.Empty;

    public bool IsActive { get; set; } = true;

    public int Version { get; set; } = 1;

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public DateTime? UpdatedAt { get; set; }

    public int? CreatedBy { get; set; }

    // Navigation Properties
    public User? Creator { get; set; }
    public ICollection<FormField> Fields { get; set; } = new List<FormField>();
}

