using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using TalepSistemi.API.Data;
using TalepSistemi.API.Models;
using BCrypt.Net;

namespace TalepSistemi.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize(Roles = "Admin,SystemAdmin")]
public class UsersController : ControllerBase
{
    private readonly ApplicationDbContext _context;

    public UsersController(ApplicationDbContext context)
    {
        _context = context;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<object>>> GetUsers([FromQuery] bool? isActive = null)
    {
        var query = _context.Users
            .Include(u => u.UserRoles)
            .ThenInclude(ur => ur.Role)
            .AsQueryable();

        if (isActive.HasValue)
        {
            query = query.Where(u => u.IsActive == isActive.Value);
        }

        var users = await query
            .OrderBy(u => u.FirstName)
            .Select(u => new
            {
                u.Id,
                u.FirstName,
                u.LastName,
                u.Email,
                u.Department,
                u.Position,
                u.IsActive,
                u.CreatedAt,
                Roles = u.UserRoles.Select(ur => new
                {
                    ur.Role.Id,
                    ur.Role.Name
                })
            })
            .ToListAsync();

        return Ok(users);
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<object>> GetUser(int id)
    {
        var user = await _context.Users
            .Include(u => u.UserRoles)
            .ThenInclude(ur => ur.Role)
            .FirstOrDefaultAsync(u => u.Id == id);

        if (user == null)
        {
            return NotFound();
        }

        return Ok(new
        {
            user.Id,
            user.FirstName,
            user.LastName,
            user.Email,
            user.Department,
            user.Position,
            user.IsActive,
            user.CreatedAt,
            user.UpdatedAt,
            Roles = user.UserRoles.Select(ur => new
            {
                ur.Role.Id,
                ur.Role.Name
            })
        });
    }

    [HttpPost]
    public async Task<ActionResult> CreateUser([FromBody] UserCreateDto dto)
    {
        if (await _context.Users.AnyAsync(u => u.Email == dto.Email))
        {
            return BadRequest("Bu e-posta adresi zaten kullanılıyor");
        }

        var user = new User
        {
            FirstName = dto.FirstName,
            LastName = dto.LastName,
            Email = dto.Email,
            PasswordHash = BCrypt.Net.BCrypt.HashPassword(dto.Password),
            Department = dto.Department,
            Position = dto.Position,
            IsActive = dto.IsActive,
            CreatedAt = DateTime.UtcNow
        };

        _context.Users.Add(user);
        await _context.SaveChangesAsync();

        // Assign roles
        if (dto.RoleIds != null && dto.RoleIds.Any())
        {
            foreach (var roleId in dto.RoleIds)
            {
                _context.UserRoles.Add(new UserRole
                {
                    UserId = user.Id,
                    RoleId = roleId
                });
            }
            await _context.SaveChangesAsync();
        }

        return CreatedAtAction(nameof(GetUser), new { id = user.Id }, new { user.Id });
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> UpdateUser(int id, [FromBody] UserUpdateDto dto)
    {
        var user = await _context.Users
            .Include(u => u.UserRoles)
            .FirstOrDefaultAsync(u => u.Id == id);

        if (user == null)
        {
            return NotFound();
        }

        if (dto.Email != user.Email && await _context.Users.AnyAsync(u => u.Email == dto.Email))
        {
            return BadRequest("Bu e-posta adresi zaten kullanılıyor");
        }

        user.FirstName = dto.FirstName;
        user.LastName = dto.LastName;
        user.Email = dto.Email;
        user.Department = dto.Department;
        user.Position = dto.Position;
        user.IsActive = dto.IsActive;
        user.UpdatedAt = DateTime.UtcNow;

        if (!string.IsNullOrEmpty(dto.Password))
        {
            user.PasswordHash = BCrypt.Net.BCrypt.HashPassword(dto.Password);
        }

        // Update roles
        if (dto.RoleIds != null)
        {
            _context.UserRoles.RemoveRange(user.UserRoles);
            foreach (var roleId in dto.RoleIds)
            {
                _context.UserRoles.Add(new UserRole
                {
                    UserId = user.Id,
                    RoleId = roleId
                });
            }
        }

        await _context.SaveChangesAsync();

        return NoContent();
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteUser(int id)
    {
        var user = await _context.Users.FindAsync(id);
        if (user == null)
        {
            return NotFound();
        }

        // Soft delete
        user.IsActive = false;
        user.UpdatedAt = DateTime.UtcNow;
        await _context.SaveChangesAsync();

        return NoContent();
    }

    [HttpGet("roles")]
    [AllowAnonymous]
    public async Task<ActionResult<IEnumerable<object>>> GetRoles()
    {
        var roles = await _context.Roles
            .Select(r => new
            {
                r.Id,
                r.Name,
                r.Description
            })
            .ToListAsync();

        return Ok(roles);
    }
}

public class UserCreateDto
{
    public string FirstName { get; set; } = string.Empty;
    public string LastName { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string Password { get; set; } = string.Empty;
    public string? Department { get; set; }
    public string? Position { get; set; }
    public bool IsActive { get; set; } = true;
    public List<int>? RoleIds { get; set; }
}

public class UserUpdateDto
{
    public string FirstName { get; set; } = string.Empty;
    public string LastName { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string? Password { get; set; }
    public string? Department { get; set; }
    public string? Position { get; set; }
    public bool IsActive { get; set; } = true;
    public List<int>? RoleIds { get; set; }
}

