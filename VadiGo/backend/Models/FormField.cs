using System.ComponentModel.DataAnnotations;

namespace TalepSistemi.API.Models;

public class FormField
{
    [Key]
    public int Id { get; set; }

    [Required]
    public int FormTemplateId { get; set; }

    [Required]
    [MaxLength(100)]
    public string Name { get; set; } = string.Empty;

    [Required]
    [MaxLength(200)]
    public string Label { get; set; } = string.Empty;

    [Required]
    [MaxLength(50)]
    public string FieldType { get; set; } = FieldTypes.Text;

    public int Order { get; set; }

    public bool IsRequired { get; set; } = false;

    public string? DefaultValue { get; set; }

    public string? Placeholder { get; set; }

    public string? ValidationRules { get; set; } // JSON

    public string? Options { get; set; } // JSON for dropdown, radio, checkbox

    public string? DependsOn { get; set; } // Field name that this field depends on

    public string? VisibilityCondition { get; set; } // JSON condition

    [MaxLength(500)]
    public string? HelpText { get; set; }

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    // Navigation Properties
    public FormTemplate FormTemplate { get; set; } = null!;
}

public static class FieldTypes
{
    public const string Text = "text";
    public const string Number = "number";
    public const string Email = "email";
    public const string Date = "date";
    public const string DateTime = "datetime";
    public const string TextArea = "textarea";
    public const string Dropdown = "dropdown";
    public const string Radio = "radio";
    public const string Checkbox = "checkbox";
    public const string File = "file";
    public const string Currency = "currency";
}

