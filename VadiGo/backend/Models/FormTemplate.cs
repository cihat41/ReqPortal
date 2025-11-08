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

    // Workflow Integration
    public int? DefaultWorkflowId { get; set; } // Bu form için varsayılan onay akışı

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public DateTime? UpdatedAt { get; set; }

    public int? CreatedBy { get; set; }

    // Navigation Properties
    public User? Creator { get; set; }
    public ApprovalWorkflow? DefaultWorkflow { get; set; }
    public ICollection<FormField> Fields { get; set; } = new List<FormField>();
    public ICollection<Request> Requests { get; set; } = new List<Request>();
}

