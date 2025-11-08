using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using TalepSistemi.API.Data;
using TalepSistemi.API.DTOs;
using TalepSistemi.API.Models;
using TalepSistemi.API.Services;

namespace TalepSistemi.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly ApplicationDbContext _context;
    private readonly ITokenService _tokenService;
    private readonly ILogger<AuthController> _logger;

    public AuthController(
        ApplicationDbContext context,
        ITokenService tokenService,
        ILogger<AuthController> logger)
    {
        _context = context;
        _tokenService = tokenService;
        _logger = logger;
    }

    [HttpPost("login")]
    public async Task<ActionResult<LoginResponseDto>> Login([FromBody] LoginDto loginDto)
    {
        try
        {
            // Kullanıcıyı bul
            var user = await _context.Users
                .Include(u => u.UserRoles)
                .ThenInclude(ur => ur.Role)
                .FirstOrDefaultAsync(u => u.Email == loginDto.Email);

            if (user == null || !user.IsActive)
            {
                return Unauthorized(new { message = "Geçersiz e-posta veya şifre" });
            }

            // Şifre kontrolü (basit versiyon - production'da BCrypt kullanılmalı)
            if (!VerifyPassword(loginDto.Password, user.PasswordHash))
            {
                return Unauthorized(new { message = "Geçersiz e-posta veya şifre" });
            }

            // Rolleri al
            var roles = user.UserRoles.Select(ur => ur.Role.Name).ToList();

            // Token oluştur
            var token = _tokenService.GenerateToken(user, roles);

            var userDto = new UserDto
            {
                Id = user.Id,
                FirstName = user.FirstName,
                LastName = user.LastName,
                Email = user.Email,
                Department = user.Department,
                Position = user.Position,
                IsActive = user.IsActive,
                Roles = roles
            };

            return Ok(new LoginResponseDto
            {
                Token = token,
                User = userDto
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Login hatası: {Email}", loginDto.Email);
            return StatusCode(500, new { message = "Giriş işlemi sırasında bir hata oluştu" });
        }
    }

    [HttpPost("register")]
    public async Task<ActionResult<UserDto>> Register([FromBody] CreateUserDto createUserDto)
    {
        try
        {
            // E-posta kontrolü
            if (await _context.Users.AnyAsync(u => u.Email == createUserDto.Email))
            {
                return BadRequest(new { message = "Bu e-posta adresi zaten kullanılıyor" });
            }

            // Yeni kullanıcı oluştur
            var user = new User
            {
                FirstName = createUserDto.FirstName,
                LastName = createUserDto.LastName,
                Email = createUserDto.Email,
                PasswordHash = HashPassword(createUserDto.Password),
                Department = createUserDto.Department,
                Position = createUserDto.Position,
                IsActive = true,
                CreatedAt = DateTime.UtcNow
            };

            _context.Users.Add(user);
            await _context.SaveChangesAsync();

            // Rolleri ata (eğer belirtilmemişse varsayılan olarak User rolü)
            var roleIds = createUserDto.RoleIds.Any() ? createUserDto.RoleIds : new List<int> { 1 };
            
            foreach (var roleId in roleIds)
            {
                var userRole = new UserRole
                {
                    UserId = user.Id,
                    RoleId = roleId,
                    AssignedAt = DateTime.UtcNow
                };
                _context.UserRoles.Add(userRole);
            }

            await _context.SaveChangesAsync();

            // Rolleri yükle
            var roles = await _context.Roles
                .Where(r => roleIds.Contains(r.Id))
                .Select(r => r.Name)
                .ToListAsync();

            var userDto = new UserDto
            {
                Id = user.Id,
                FirstName = user.FirstName,
                LastName = user.LastName,
                Email = user.Email,
                Department = user.Department,
                Position = user.Position,
                IsActive = user.IsActive,
                Roles = roles
            };

            return CreatedAtAction(nameof(Register), new { id = user.Id }, userDto);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Kayıt hatası: {Email}", createUserDto.Email);
            return StatusCode(500, new { message = "Kayıt işlemi sırasında bir hata oluştu" });
        }
    }

    // Basit şifre hash fonksiyonu (Production'da BCrypt kullanılmalı)
    private string HashPassword(string password)
    {
        return BCrypt.Net.BCrypt.HashPassword(password);
    }

    private bool VerifyPassword(string password, string hash)
    {
        return BCrypt.Net.BCrypt.Verify(password, hash);
    }
}

