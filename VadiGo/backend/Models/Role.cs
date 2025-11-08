using System.ComponentModel.DataAnnotations;

namespace TalepSistemi.API.Models;

public class Role
{
    [Key]
    public int Id { get; set; }

    [Required]
    [MaxLength(50)]
    public string Name { get; set; } = string.Empty;

    [MaxLength(255)]
    public string? Description { get; set; }

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    // Navigation Properties
    public ICollection<UserRole> UserRoles { get; set; } = new List<UserRole>();
}

// Rol sabitleri
public static class RoleNames
{
    public const string User = "User";
    public const string Approver = "Approver";
    public const string Manager = "Manager";
    public const string Admin = "Admin";
}

