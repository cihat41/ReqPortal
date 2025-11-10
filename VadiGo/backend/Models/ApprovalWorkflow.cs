using System.ComponentModel.DataAnnotations;

namespace TalepSistemi.API.Models;

public class ApprovalWorkflow
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

    public string? Conditions { get; set; } // JSON: amount > 1000, priority = High, etc.

    public bool IsActive { get; set; } = true;

    public int Priority { get; set; } = 0; // Higher priority workflows are checked first

    [MaxLength(50)]
    public string ApprovalStrategy { get; set; } = ApprovalStrategies.All; // Any, All, Majority - TÜM WORKFLOW İÇİN

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public DateTime? UpdatedAt { get; set; }

    // Navigation Properties
    public ICollection<ApprovalWorkflowStep> Steps { get; set; } = new List<ApprovalWorkflowStep>();
}

public class ApprovalWorkflowStep
{
    [Key]
    public int Id { get; set; }

    [Required]
    public int WorkflowId { get; set; }

    public int StepOrder { get; set; }

    public int Level { get; set; } = 1; // Onay seviyesi - aynı level'daki step'ler paralel çalışır

    [Required]
    [MaxLength(50)]
    public string StepType { get; set; } = StepTypes.Sequential; // Sequential or Parallel

    [MaxLength(50)]
    public string ApprovalStrategy { get; set; } = ApprovalStrategies.All; // Any, All, Majority (paralel için)

    public int? RoleId { get; set; }

    public int? UserId { get; set; }

    public int? TimeoutHours { get; set; }

    public bool IsEscalationEnabled { get; set; } = false;

    public int? EscalationRoleId { get; set; }

    public int? EscalationUserId { get; set; }

    // Navigation Properties
    public ApprovalWorkflow Workflow { get; set; } = null!;
    public Role? Role { get; set; }
    public User? User { get; set; }
    public Role? EscalationRole { get; set; }
    public User? EscalationUser { get; set; }
}

public static class StepTypes
{
    public const string Sequential = "sequential";
    public const string Parallel = "parallel";
}

public static class ApprovalStrategies
{
    public const string Any = "any"; // Herhangi biri onaylayınca geçer
    public const string All = "all"; // Hepsi onaylamalı
    public const string Majority = "majority"; // Çoğunluk onaylamalı (50%+1)
}

