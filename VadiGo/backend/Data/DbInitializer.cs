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

            // Email template'leri seed et
            if (!await context.EmailTemplates.AnyAsync())
            {
                await SeedEmailTemplatesAsync(context, logger);
            }

            // Form template'leri seed et
            if (!await context.FormTemplates.AnyAsync())
            {
                await SeedFormTemplatesAsync(context, logger);
            }

            // Email ayarlarını seed et
            if (!await context.EmailSettings.AnyAsync())
            {
                await SeedEmailSettingsAsync(context, logger);
            }
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

    private static async Task SeedEmailTemplatesAsync(ApplicationDbContext context, ILogger logger)
    {
        logger.LogInformation("Email şablonları oluşturuluyor...");

        var templates = new[]
        {
            new EmailTemplate
            {
                Name = "Talep Oluşturuldu",
                EventType = "RequestCreated",
                Subject = "Yeni Talep Oluşturuldu - {{RequestTitle}}",
                Body = @"<h2>Merhaba {{UserFirstName}},</h2>
                        <p>Talebiniz başarıyla oluşturuldu.</p>
                        <p><strong>Talep No:</strong> {{RequestId}}</p>
                        <p><strong>Başlık:</strong> {{RequestTitle}}</p>
                        <p><strong>Kategori:</strong> {{RequestCategory}}</p>
                        <p><strong>Öncelik:</strong> {{RequestPriority}}</p>
                        <p>Talebinizin durumunu sistem üzerinden takip edebilirsiniz.</p>",
                IsActive = true,
                CreatedAt = DateTime.UtcNow
            },
            new EmailTemplate
            {
                Name = "Onay Bekliyor",
                EventType = "ApprovalPending",
                Subject = "Onayınız Bekleniyor - {{RequestTitle}}",
                Body = @"<h2>Merhaba {{ApproverName}},</h2>
                        <p>Onayınızı bekleyen bir talep var.</p>
                        <p><strong>Talep No:</strong> {{RequestId}}</p>
                        <p><strong>Başlık:</strong> {{RequestTitle}}</p>
                        <p><strong>Talep Eden:</strong> {{RequestCreatedBy}}</p>
                        <p>Lütfen sisteme giriş yaparak talebi inceleyin.</p>",
                IsActive = true,
                CreatedAt = DateTime.UtcNow
            },
            new EmailTemplate
            {
                Name = "Talep Onaylandı",
                EventType = "RequestApproved",
                Subject = "Talebiniz Onaylandı - {{RequestTitle}}",
                Body = @"<h2>Merhaba {{UserFirstName}},</h2>
                        <p>Talebiniz onaylandı!</p>
                        <p><strong>Talep No:</strong> {{RequestId}}</p>
                        <p><strong>Başlık:</strong> {{RequestTitle}}</p>
                        <p><strong>Onaylayan:</strong> {{ApproverName}}</p>
                        <p><strong>Tarih:</strong> {{ApprovalDate}}</p>",
                IsActive = true,
                CreatedAt = DateTime.UtcNow
            },
            new EmailTemplate
            {
                Name = "Talep Reddedildi",
                EventType = "RequestRejected",
                Subject = "Talebiniz Reddedildi - {{RequestTitle}}",
                Body = @"<h2>Merhaba {{UserFirstName}},</h2>
                        <p>Talebiniz reddedildi.</p>
                        <p><strong>Talep No:</strong> {{RequestId}}</p>
                        <p><strong>Başlık:</strong> {{RequestTitle}}</p>
                        <p><strong>Red Eden:</strong> {{ApproverName}}</p>
                        <p><strong>Açıklama:</strong> {{ApprovalComments}}</p>",
                IsActive = true,
                CreatedAt = DateTime.UtcNow
            }
        };

        await context.EmailTemplates.AddRangeAsync(templates);
        await context.SaveChangesAsync();

        logger.LogInformation("✅ Email şablonları başarıyla oluşturuldu!");
    }

    private static async Task SeedFormTemplatesAsync(ApplicationDbContext context, ILogger logger)
    {
        logger.LogInformation("Form şablonları oluşturuluyor...");

        var formTemplate = new FormTemplate
        {
            Name = "Genel Talep Formu",
            Description = "Standart talep formu",
            Category = "Genel",
            IsActive = true,
            Version = 1,
            CreatedBy = 1,
            CreatedAt = DateTime.UtcNow
        };

        context.FormTemplates.Add(formTemplate);
        await context.SaveChangesAsync();

        var fields = new[]
        {
            new FormField
            {
                FormTemplateId = formTemplate.Id,
                Name = "talep_turu",
                Label = "Talep Türü",
                FieldType = "dropdown",
                IsRequired = true,
                Order = 1,
                Options = "[\"Satın Alma\",\"İnsan Kaynakları\",\"IT Destek\",\"Diğer\"]"
            },
            new FormField
            {
                FormTemplateId = formTemplate.Id,
                Name = "aciklama",
                Label = "Detaylı Açıklama",
                FieldType = "textarea",
                IsRequired = true,
                Order = 2
            },
            new FormField
            {
                FormTemplateId = formTemplate.Id,
                Name = "tahmini_tutar",
                Label = "Tahmini Tutar (TL)",
                FieldType = "number",
                IsRequired = false,
                Order = 3
            },
            new FormField
            {
                FormTemplateId = formTemplate.Id,
                Name = "termin_tarihi",
                Label = "İstenilen Termin Tarihi",
                FieldType = "date",
                IsRequired = false,
                Order = 4
            }
        };

        await context.FormFields.AddRangeAsync(fields);
        await context.SaveChangesAsync();

        logger.LogInformation("✅ Form şablonları başarıyla oluşturuldu!");
    }

    private static async Task SeedEmailSettingsAsync(ApplicationDbContext context, ILogger logger)
    {
        logger.LogInformation("Email ayarları oluşturuluyor...");

        var emailSettings = new EmailSettings
        {
            SmtpHost = "smtp.gmail.com",
            SmtpPort = 587,
            SmtpUsername = "",
            SmtpPassword = "",
            FromEmail = "noreply@talepsistemi.com",
            FromName = "Talep Yönetim Sistemi",
            EnableSsl = true,
            IsActive = true,
            CreatedAt = DateTime.UtcNow
        };

        await context.EmailSettings.AddAsync(emailSettings);
        await context.SaveChangesAsync();

        logger.LogInformation("✅ Email ayarları başarıyla oluşturuldu!");
    }
}

