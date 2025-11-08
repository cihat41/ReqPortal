namespace TalepSistemi.API.DTOs;

public class UserDto
{
    public int Id { get; set; }
    public string FirstName { get; set; } = string.Empty;
    public string LastName { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string? Department { get; set; }
    public string? Position { get; set; }
    public bool IsActive { get; set; }
    public List<string> Roles { get; set; } = new();
}

public class CreateUserDto
{
    public string FirstName { get; set; } = string.Empty;
    public string LastName { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string Password { get; set; } = string.Empty;
    public string? Department { get; set; }
    public string? Position { get; set; }
    public List<int> RoleIds { get; set; } = new();
}

