using Microsoft.EntityFrameworkCore;
using TalepSistemi.API.Models;

namespace TalepSistemi.API.Data;

public static class DbInitializer
{
    public static async Task SeedAsync(ApplicationDbContext context, ILogger logger)
    {
        try
        {
            // Veritabanının oluşturulduğundan emin ol
            await context.Database.MigrateAsync();

            // Eğer hiç kullanıcı yoksa, demo kullanıcıları oluştur
            if (!await context.Users.AnyAsync())
            {
                await SeedUsersAsync(context, logger);
            }

            // İleride başka seed işlemleri eklenebilir
            // await SeedRequestsAsync(context, logger);
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Veritabanı seed işlemi sırasında hata oluştu");
            throw;
        }
    }

    private static async Task SeedUsersAsync(ApplicationDbContext context, ILogger logger)
    {
        logger.LogInformation("Demo kullanıcıları oluşturuluyor...");

        var users = new[]
        {
            new User
            {
                FirstName = "Admin",
                LastName = "User",
                Email = "admin@test.com",
                PasswordHash = BCrypt.Net.BCrypt.HashPassword("Admin123!"),
                Department = "IT",
                Position = "System Administrator",
                IsActive = true,
                CreatedAt = DateTime.UtcNow
            },
            new User
            {
                FirstName = "Ahmet",
                LastName = "Yılmaz",
                Email = "ahmet@test.com",
                PasswordHash = BCrypt.Net.BCrypt.HashPassword("User123!"),
                Department = "İnsan Kaynakları",
                Position = "Uzman",
                IsActive = true,
                CreatedAt = DateTime.UtcNow
            },
            new User
            {
                FirstName = "Ayşe",
                LastName = "Demir",
                Email = "ayse@test.com",
                PasswordHash = BCrypt.Net.BCrypt.HashPassword("Approver123!"),
                Department = "Finans",
                Position = "Müdür",
                IsActive = true,
                CreatedAt = DateTime.UtcNow
            },
            new User
            {
                FirstName = "Mehmet",
                LastName = "Kaya",
                Email = "mehmet@test.com",
                PasswordHash = BCrypt.Net.BCrypt.HashPassword("Manager123!"),
                Department = "Operasyon",
                Position = "Genel Müdür",
                IsActive = true,
                CreatedAt = DateTime.UtcNow
            }
        };

        await context.Users.AddRangeAsync(users);
        await context.SaveChangesAsync();

        // Kullanıcılara roller ata
        var userRoles = new[]
        {
            new UserRole { UserId = 1, RoleId = 4, AssignedAt = DateTime.UtcNow }, // Admin -> Admin
            new UserRole { UserId = 2, RoleId = 1, AssignedAt = DateTime.UtcNow }, // Ahmet -> User
            new UserRole { UserId = 3, RoleId = 2, AssignedAt = DateTime.UtcNow }, // Ayşe -> Approver
            new UserRole { UserId = 4, RoleId = 3, AssignedAt = DateTime.UtcNow }  // Mehmet -> Manager
        };

        await context.UserRoles.AddRangeAsync(userRoles);
        await context.SaveChangesAsync();

        logger.LogInformation("✅ Demo kullanıcıları başarıyla oluşturuldu!");
        logger.LogInformation("📧 admin@test.com / Admin123! (Admin)");
        logger.LogInformation("📧 ahmet@test.com / User123! (User)");
        logger.LogInformation("📧 ayse@test.com / Approver123! (Approver)");
        logger.LogInformation("📧 mehmet@test.com / Manager123! (Manager)");
    }
}

