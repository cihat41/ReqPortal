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

            // Onay akışlarını seed et (form template'lerden önce)
            if (!await context.ApprovalWorkflows.AnyAsync())
            {
                await SeedApprovalWorkflowsAsync(context, logger);
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

        // Tüm kullanıcılar için şifre: 123456
        var commonPassword = BCrypt.Net.BCrypt.HashPassword("123456");

        var users = new[]
        {
            // 1. Admin
            new User
            {
                FirstName = "Admin",
                LastName = "User",
                Email = "admin@test.com",
                PasswordHash = commonPassword,
                Department = "IT",
                Position = "System Administrator",
                IsActive = true,
                CreatedAt = DateTime.UtcNow
            },

            // 2-5. IT Departmanı
            new User
            {
                FirstName = "Can",
                LastName = "Yılmaz",
                Email = "can.yilmaz@test.com",
                PasswordHash = commonPassword,
                Department = "IT",
                Position = "IT Uzmanı",
                IsActive = true,
                CreatedAt = DateTime.UtcNow
            },
            new User
            {
                FirstName = "Deniz",
                LastName = "Kaya",
                Email = "deniz.kaya@test.com",
                PasswordHash = commonPassword,
                Department = "IT",
                Position = "IT Müdürü",
                IsActive = true,
                CreatedAt = DateTime.UtcNow
            },
            new User
            {
                FirstName = "Ece",
                LastName = "Demir",
                Email = "ece.demir@test.com",
                PasswordHash = commonPassword,
                Department = "IT",
                Position = "IT Direktörü",
                IsActive = true,
                CreatedAt = DateTime.UtcNow
            },

            // 5-8. Finans Departmanı
            new User
            {
                FirstName = "Fatma",
                LastName = "Şahin",
                Email = "fatma.sahin@test.com",
                PasswordHash = commonPassword,
                Department = "Finans",
                Position = "Finans Uzmanı",
                IsActive = true,
                CreatedAt = DateTime.UtcNow
            },
            new User
            {
                FirstName = "Gökhan",
                LastName = "Arslan",
                Email = "gokhan.arslan@test.com",
                PasswordHash = commonPassword,
                Department = "Finans",
                Position = "Finans Müdürü",
                IsActive = true,
                CreatedAt = DateTime.UtcNow
            },
            new User
            {
                FirstName = "Hakan",
                LastName = "Özdemir",
                Email = "hakan.ozdemir@test.com",
                PasswordHash = commonPassword,
                Department = "Finans",
                Position = "CFO",
                IsActive = true,
                CreatedAt = DateTime.UtcNow
            },

            // 8-11. İnsan Kaynakları
            new User
            {
                FirstName = "İrem",
                LastName = "Aydın",
                Email = "irem.aydin@test.com",
                PasswordHash = commonPassword,
                Department = "İnsan Kaynakları",
                Position = "İK Uzmanı",
                IsActive = true,
                CreatedAt = DateTime.UtcNow
            },
            new User
            {
                FirstName = "Kemal",
                LastName = "Çelik",
                Email = "kemal.celik@test.com",
                PasswordHash = commonPassword,
                Department = "İnsan Kaynakları",
                Position = "İK Müdürü",
                IsActive = true,
                CreatedAt = DateTime.UtcNow
            },
            new User
            {
                FirstName = "Leyla",
                LastName = "Yıldız",
                Email = "leyla.yildiz@test.com",
                PasswordHash = commonPassword,
                Department = "İnsan Kaynakları",
                Position = "İK Direktörü",
                IsActive = true,
                CreatedAt = DateTime.UtcNow
            },

            // 11-14. Satış Departmanı
            new User
            {
                FirstName = "Murat",
                LastName = "Koç",
                Email = "murat.koc@test.com",
                PasswordHash = commonPassword,
                Department = "Satış",
                Position = "Satış Uzmanı",
                IsActive = true,
                CreatedAt = DateTime.UtcNow
            },
            new User
            {
                FirstName = "Nur",
                LastName = "Acar",
                Email = "nur.acar@test.com",
                PasswordHash = commonPassword,
                Department = "Satış",
                Position = "Satış Müdürü",
                IsActive = true,
                CreatedAt = DateTime.UtcNow
            },
            new User
            {
                FirstName = "Oğuz",
                LastName = "Polat",
                Email = "oguz.polat@test.com",
                PasswordHash = commonPassword,
                Department = "Satış",
                Position = "Satış Direktörü",
                IsActive = true,
                CreatedAt = DateTime.UtcNow
            },

            // 14-17. Pazarlama Departmanı
            new User
            {
                FirstName = "Pınar",
                LastName = "Güneş",
                Email = "pinar.gunes@test.com",
                PasswordHash = commonPassword,
                Department = "Pazarlama",
                Position = "Pazarlama Uzmanı",
                IsActive = true,
                CreatedAt = DateTime.UtcNow
            },
            new User
            {
                FirstName = "Rıza",
                LastName = "Kurt",
                Email = "riza.kurt@test.com",
                PasswordHash = commonPassword,
                Department = "Pazarlama",
                Position = "Pazarlama Müdürü",
                IsActive = true,
                CreatedAt = DateTime.UtcNow
            },

            // 17-20. Operasyon Departmanı
            new User
            {
                FirstName = "Selin",
                LastName = "Yurt",
                Email = "selin.yurt@test.com",
                PasswordHash = commonPassword,
                Department = "Operasyon",
                Position = "Operasyon Uzmanı",
                IsActive = true,
                CreatedAt = DateTime.UtcNow
            },
            new User
            {
                FirstName = "Taner",
                LastName = "Bulut",
                Email = "taner.bulut@test.com",
                PasswordHash = commonPassword,
                Department = "Operasyon",
                Position = "Operasyon Müdürü",
                IsActive = true,
                CreatedAt = DateTime.UtcNow
            },
            new User
            {
                FirstName = "Ufuk",
                LastName = "Taş",
                Email = "ufuk.tas@test.com",
                PasswordHash = commonPassword,
                Department = "Operasyon",
                Position = "Operasyon Direktörü",
                IsActive = true,
                CreatedAt = DateTime.UtcNow
            },

            // 20. CEO
            new User
            {
                FirstName = "Volkan",
                LastName = "Erdoğan",
                Email = "volkan.erdogan@test.com",
                PasswordHash = commonPassword,
                Department = "Yönetim",
                Position = "CEO",
                IsActive = true,
                CreatedAt = DateTime.UtcNow
            }
        };

        await context.Users.AddRangeAsync(users);
        await context.SaveChangesAsync();

        // Kullanıcılara roller ata
        var userRoles = new List<UserRole>
        {
            // Admin
            new UserRole { UserId = 1, RoleId = 4, AssignedAt = DateTime.UtcNow }, // Admin -> Admin

            // IT Departmanı
            new UserRole { UserId = 2, RoleId = 1, AssignedAt = DateTime.UtcNow }, // Can -> User
            new UserRole { UserId = 3, RoleId = 3, AssignedAt = DateTime.UtcNow }, // Deniz -> Manager
            new UserRole { UserId = 3, RoleId = 2, AssignedAt = DateTime.UtcNow }, // Deniz -> Approver
            new UserRole { UserId = 4, RoleId = 3, AssignedAt = DateTime.UtcNow }, // Ece -> Manager
            new UserRole { UserId = 4, RoleId = 2, AssignedAt = DateTime.UtcNow }, // Ece -> Approver

            // Finans Departmanı
            new UserRole { UserId = 5, RoleId = 1, AssignedAt = DateTime.UtcNow }, // Fatma -> User
            new UserRole { UserId = 6, RoleId = 3, AssignedAt = DateTime.UtcNow }, // Gökhan -> Manager
            new UserRole { UserId = 6, RoleId = 2, AssignedAt = DateTime.UtcNow }, // Gökhan -> Approver
            new UserRole { UserId = 7, RoleId = 3, AssignedAt = DateTime.UtcNow }, // Hakan (CFO) -> Manager
            new UserRole { UserId = 7, RoleId = 2, AssignedAt = DateTime.UtcNow }, // Hakan (CFO) -> Approver

            // İnsan Kaynakları
            new UserRole { UserId = 8, RoleId = 1, AssignedAt = DateTime.UtcNow }, // İrem -> User
            new UserRole { UserId = 9, RoleId = 3, AssignedAt = DateTime.UtcNow }, // Kemal -> Manager
            new UserRole { UserId = 9, RoleId = 2, AssignedAt = DateTime.UtcNow }, // Kemal -> Approver
            new UserRole { UserId = 10, RoleId = 3, AssignedAt = DateTime.UtcNow }, // Leyla -> Manager
            new UserRole { UserId = 10, RoleId = 2, AssignedAt = DateTime.UtcNow }, // Leyla -> Approver

            // Satış Departmanı
            new UserRole { UserId = 11, RoleId = 1, AssignedAt = DateTime.UtcNow }, // Murat -> User
            new UserRole { UserId = 12, RoleId = 3, AssignedAt = DateTime.UtcNow }, // Nur -> Manager
            new UserRole { UserId = 12, RoleId = 2, AssignedAt = DateTime.UtcNow }, // Nur -> Approver
            new UserRole { UserId = 13, RoleId = 3, AssignedAt = DateTime.UtcNow }, // Oğuz -> Manager
            new UserRole { UserId = 13, RoleId = 2, AssignedAt = DateTime.UtcNow }, // Oğuz -> Approver

            // Pazarlama Departmanı
            new UserRole { UserId = 14, RoleId = 1, AssignedAt = DateTime.UtcNow }, // Pınar -> User
            new UserRole { UserId = 15, RoleId = 3, AssignedAt = DateTime.UtcNow }, // Rıza -> Manager
            new UserRole { UserId = 15, RoleId = 2, AssignedAt = DateTime.UtcNow }, // Rıza -> Approver

            // Operasyon Departmanı
            new UserRole { UserId = 16, RoleId = 1, AssignedAt = DateTime.UtcNow }, // Selin -> User
            new UserRole { UserId = 17, RoleId = 3, AssignedAt = DateTime.UtcNow }, // Taner -> Manager
            new UserRole { UserId = 17, RoleId = 2, AssignedAt = DateTime.UtcNow }, // Taner -> Approver
            new UserRole { UserId = 18, RoleId = 3, AssignedAt = DateTime.UtcNow }, // Ufuk -> Manager
            new UserRole { UserId = 18, RoleId = 2, AssignedAt = DateTime.UtcNow }, // Ufuk -> Approver

            // CEO
            new UserRole { UserId = 19, RoleId = 3, AssignedAt = DateTime.UtcNow }, // Volkan -> Manager
            new UserRole { UserId = 19, RoleId = 2, AssignedAt = DateTime.UtcNow }  // Volkan -> Approver
        };

        await context.UserRoles.AddRangeAsync(userRoles);
        await context.SaveChangesAsync();

        logger.LogInformation("✅ 20 demo kullanıcısı başarıyla oluşturuldu!");
        logger.LogInformation("🔑 Tüm kullanıcılar için şifre: 123456");
        logger.LogInformation("📧 admin@test.com (Admin)");
        logger.LogInformation("📧 IT: can.yilmaz, deniz.kaya (Müdür), ece.demir (Direktör)");
        logger.LogInformation("📧 Finans: fatma.sahin, gokhan.arslan (Müdür), hakan.ozdemir (CFO)");
        logger.LogInformation("📧 İK: irem.aydin, kemal.celik (Müdür), leyla.yildiz (Direktör)");
        logger.LogInformation("📧 Satış: murat.koc, nur.acar (Müdür), oguz.polat (Direktör)");
        logger.LogInformation("📧 Pazarlama: pinar.gunes, riza.kurt (Müdür)");
        logger.LogInformation("📧 Operasyon: selin.yurt, taner.bulut (Müdür), ufuk.tas (Direktör)");
        logger.LogInformation("📧 CEO: volkan.erdogan");
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

        // Onay akışlarını al
        var generalWorkflow = await context.ApprovalWorkflows.FirstOrDefaultAsync(w => w.Name == "Genel Talepler Onay Akışı");
        var financeWorkflow = await context.ApprovalWorkflows.FirstOrDefaultAsync(w => w.Name == "Finans Talepleri Onay Akışı");
        var hrWorkflow = await context.ApprovalWorkflows.FirstOrDefaultAsync(w => w.Name == "İK Talepleri Onay Akışı");
        var salesWorkflow = await context.ApprovalWorkflows.FirstOrDefaultAsync(w => w.Name == "Satış Talepleri Onay Akışı");

        // 1. Genel Talep Formu
        var genelForm = new FormTemplate
        {
            Name = "Genel Talep Formu",
            Description = "Standart talep formu",
            Category = "Genel",
            IsActive = true,
            Version = 1,
            DefaultWorkflowId = generalWorkflow?.Id,
            CreatedBy = 1,
            CreatedAt = DateTime.UtcNow
        };
        context.FormTemplates.Add(genelForm);
        await context.SaveChangesAsync();

        await context.FormFields.AddRangeAsync(new[]
        {
            new FormField
            {
                FormTemplateId = genelForm.Id,
                Name = "talep_turu",
                Label = "Talep Türü",
                FieldType = "dropdown",
                IsRequired = true,
                Order = 1,
                Options = "[\"Satın Alma\",\"İnsan Kaynakları\",\"IT Destek\",\"Diğer\"]",
                HelpText = "Talebin hangi kategoriye ait olduğunu seçin"
            },
            new FormField
            {
                FormTemplateId = genelForm.Id,
                Name = "aciklama",
                Label = "Detaylı Açıklama",
                FieldType = "textarea",
                IsRequired = true,
                Order = 2,
                Placeholder = "Talebin detaylarını açıklayın..."
            },
            new FormField
            {
                FormTemplateId = genelForm.Id,
                Name = "tahmini_tutar",
                Label = "Tahmini Tutar (TL)",
                FieldType = "number",
                IsRequired = false,
                Order = 3
            },
            new FormField
            {
                FormTemplateId = genelForm.Id,
                Name = "termin_tarihi",
                Label = "İstenilen Termin Tarihi",
                FieldType = "date",
                IsRequired = false,
                Order = 4
            }
        });
        await context.SaveChangesAsync();

        // 2. Avans Talep Formu
        var avansForm = new FormTemplate
        {
            Name = "Avans Talep Formu",
            Description = "Personel avans talebi için kullanılır",
            Category = "Finans",
            IsActive = true,
            Version = 1,
            DefaultWorkflowId = financeWorkflow?.Id,
            CreatedBy = 1,
            CreatedAt = DateTime.UtcNow
        };
        context.FormTemplates.Add(avansForm);
        await context.SaveChangesAsync();

        await context.FormFields.AddRangeAsync(new[]
        {
            new FormField
            {
                FormTemplateId = avansForm.Id,
                Name = "avans_tutari",
                Label = "Avans Tutarı",
                FieldType = "currency",
                IsRequired = true,
                Order = 1,
                HelpText = "Talep edilen avans tutarını girin"
            },
            new FormField
            {
                FormTemplateId = avansForm.Id,
                Name = "gerekcesi",
                Label = "Avans Gerekçesi",
                FieldType = "textarea",
                IsRequired = true,
                Order = 2,
                Placeholder = "Avans talebinin gerekçesini detaylı açıklayın..."
            },
            new FormField
            {
                FormTemplateId = avansForm.Id,
                Name = "geri_odeme_tarihi",
                Label = "Geri Ödeme Tarihi",
                FieldType = "date",
                IsRequired = true,
                Order = 3,
                HelpText = "Avansın geri ödeneceği tarihi belirtin"
            },
            new FormField
            {
                FormTemplateId = avansForm.Id,
                Name = "butce_kodu",
                Label = "Bütçe Kodu",
                FieldType = "dropdown",
                IsRequired = true,
                Order = 4,
                Options = "[\"BK-001 - Genel Giderler\",\"BK-002 - Proje Giderleri\",\"BK-003 - Pazarlama\",\"BK-004 - İnsan Kaynakları\"]"
            }
        });
        await context.SaveChangesAsync();

        // 3. Ödeme Fişi Formu
        var odemeForm = new FormTemplate
        {
            Name = "Ödeme Fişi Formu",
            Description = "Tedarikçi ödemesi için kullanılır",
            Category = "Finans",
            IsActive = true,
            Version = 1,
            DefaultWorkflowId = financeWorkflow?.Id,
            CreatedBy = 1,
            CreatedAt = DateTime.UtcNow
        };
        context.FormTemplates.Add(odemeForm);
        await context.SaveChangesAsync();

        await context.FormFields.AddRangeAsync(new[]
        {
            new FormField
            {
                FormTemplateId = odemeForm.Id,
                Name = "alici_adi",
                Label = "Alıcı Adı",
                FieldType = "text",
                IsRequired = true,
                Order = 1,
                Placeholder = "Tedarikçi veya alıcı adını girin"
            },
            new FormField
            {
                FormTemplateId = odemeForm.Id,
                Name = "tutar",
                Label = "Ödeme Tutarı",
                FieldType = "currency",
                IsRequired = true,
                Order = 2
            },
            new FormField
            {
                FormTemplateId = odemeForm.Id,
                Name = "odeme_tarihi",
                Label = "Ödeme Tarihi",
                FieldType = "date",
                IsRequired = true,
                Order = 3
            },
            new FormField
            {
                FormTemplateId = odemeForm.Id,
                Name = "odeme_yontemi",
                Label = "Ödeme Yöntemi",
                FieldType = "dropdown",
                IsRequired = true,
                Order = 4,
                Options = "[\"Havale\",\"Çek\",\"Nakit\",\"Kredi Kartı\"]"
            },
            new FormField
            {
                FormTemplateId = odemeForm.Id,
                Name = "aciklama",
                Label = "Açıklama",
                FieldType = "textarea",
                IsRequired = false,
                Order = 5,
                Placeholder = "Ödeme ile ilgili ek bilgiler..."
            }
        });
        await context.SaveChangesAsync();

        // 4. Yeni Müşteri Formu
        var musteriForm = new FormTemplate
        {
            Name = "Yeni Müşteri Formu",
            Description = "Yeni müşteri kaydı için kullanılır",
            Category = "Satış",
            IsActive = true,
            Version = 1,
            DefaultWorkflowId = salesWorkflow?.Id,
            CreatedBy = 1,
            CreatedAt = DateTime.UtcNow
        };
        context.FormTemplates.Add(musteriForm);
        await context.SaveChangesAsync();

        await context.FormFields.AddRangeAsync(new[]
        {
            new FormField
            {
                FormTemplateId = musteriForm.Id,
                Name = "musteri_adi",
                Label = "Müşteri Adı",
                FieldType = "text",
                IsRequired = true,
                Order = 1,
                Placeholder = "Şirket veya kişi adı"
            },
            new FormField
            {
                FormTemplateId = musteriForm.Id,
                Name = "vergi_no",
                Label = "Vergi Numarası",
                FieldType = "text",
                IsRequired = true,
                Order = 2,
                Placeholder = "10 haneli vergi numarası"
            },
            new FormField
            {
                FormTemplateId = musteriForm.Id,
                Name = "iletisim_email",
                Label = "İletişim E-posta",
                FieldType = "email",
                IsRequired = true,
                Order = 3
            },
            new FormField
            {
                FormTemplateId = musteriForm.Id,
                Name = "iletisim_telefon",
                Label = "İletişim Telefon",
                FieldType = "text",
                IsRequired = true,
                Order = 4,
                Placeholder = "+90 5XX XXX XX XX"
            },
            new FormField
            {
                FormTemplateId = musteriForm.Id,
                Name = "risk_skoru",
                Label = "Risk Skoru",
                FieldType = "dropdown",
                IsRequired = true,
                Order = 5,
                Options = "[\"Düşük\",\"Orta\",\"Yüksek\"]",
                HelpText = "Müşterinin risk değerlendirmesi"
            },
            new FormField
            {
                FormTemplateId = musteriForm.Id,
                Name = "ek_teminat",
                Label = "Ek Teminat Gerekli mi?",
                FieldType = "radio",
                IsRequired = false,
                Order = 6,
                Options = "[\"Evet\",\"Hayır\"]",
                DependsOn = "risk_skoru",
                VisibilityCondition = "{\"equals\":\"Yüksek\"}",
                HelpText = "Yüksek riskli müşteriler için ek teminat gerekebilir"
            },
            new FormField
            {
                FormTemplateId = musteriForm.Id,
                Name = "kredi_limiti",
                Label = "Kredi Limiti",
                FieldType = "currency",
                IsRequired = true,
                Order = 7,
                HelpText = "Müşteriye tanınacak maksimum kredi limiti"
            },
            new FormField
            {
                FormTemplateId = musteriForm.Id,
                Name = "odeme_vadesi",
                Label = "Ödeme Vadesi (Gün)",
                FieldType = "number",
                IsRequired = true,
                Order = 8,
                DefaultValue = "30"
            }
        });
        await context.SaveChangesAsync();

        // 5. İzin Talep Formu
        var izinForm = new FormTemplate
        {
            Name = "İzin Talep Formu",
            Description = "Personel izin talebi için kullanılır",
            Category = "İnsan Kaynakları",
            IsActive = true,
            Version = 1,
            DefaultWorkflowId = hrWorkflow?.Id,
            CreatedBy = 1,
            CreatedAt = DateTime.UtcNow
        };
        context.FormTemplates.Add(izinForm);
        await context.SaveChangesAsync();

        await context.FormFields.AddRangeAsync(new[]
        {
            new FormField
            {
                FormTemplateId = izinForm.Id,
                Name = "izin_turu",
                Label = "İzin Türü",
                FieldType = "dropdown",
                IsRequired = true,
                Order = 1,
                Options = "[\"Yıllık İzin\",\"Mazeret İzni\",\"Ücretsiz İzin\",\"Hastalık İzni\",\"Evlilik İzni\",\"Doğum İzni\"]"
            },
            new FormField
            {
                FormTemplateId = izinForm.Id,
                Name = "baslangic_tarihi",
                Label = "Başlangıç Tarihi",
                FieldType = "date",
                IsRequired = true,
                Order = 2
            },
            new FormField
            {
                FormTemplateId = izinForm.Id,
                Name = "bitis_tarihi",
                Label = "Bitiş Tarihi",
                FieldType = "date",
                IsRequired = true,
                Order = 3
            },
            new FormField
            {
                FormTemplateId = izinForm.Id,
                Name = "gun_sayisi",
                Label = "Toplam Gün Sayısı",
                FieldType = "number",
                IsRequired = true,
                Order = 4,
                HelpText = "İzin süresi (gün)"
            },
            new FormField
            {
                FormTemplateId = izinForm.Id,
                Name = "aciklama",
                Label = "Açıklama",
                FieldType = "textarea",
                IsRequired = false,
                Order = 5,
                Placeholder = "İzin nedeni veya ek bilgiler..."
            },
            new FormField
            {
                FormTemplateId = izinForm.Id,
                Name = "vekil_personel",
                Label = "Vekil Personel",
                FieldType = "text",
                IsRequired = false,
                Order = 6,
                Placeholder = "İzin süresince işlerinizi yürütecek kişi",
                HelpText = "İzin süresince görevlerinizi devralacak personelin adı"
            }
        });
        await context.SaveChangesAsync();

        logger.LogInformation("✅ 5 adet form şablonu başarıyla oluşturuldu!");
        logger.LogInformation("📋 Genel Talep Formu → Genel Talepler Onay Akışı");
        logger.LogInformation("📋 Avans Talep Formu → Finans Talepleri Onay Akışı");
        logger.LogInformation("📋 Ödeme Fişi Formu → Finans Talepleri Onay Akışı");
        logger.LogInformation("📋 Yeni Müşteri Formu → Satış Talepleri Onay Akışı");
        logger.LogInformation("📋 İzin Talep Formu → İK Talepleri Onay Akışı");
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

    private static async Task SeedApprovalWorkflowsAsync(ApplicationDbContext context, ILogger logger)
    {
        logger.LogInformation("Onay akışları oluşturuluyor...");

        // 1. IT Talepleri Akışı (IT Müdürü → IT Direktörü)
        var itWorkflow = new ApprovalWorkflow
        {
            Name = "IT Talepleri Onay Akışı",
            Description = "IT departmanı talepleri için 2 aşamalı onay akışı",
            Category = "IT",
            IsActive = true,
            Priority = 1,
            CreatedAt = DateTime.UtcNow
        };
        await context.ApprovalWorkflows.AddAsync(itWorkflow);
        await context.SaveChangesAsync();

        var itSteps = new[]
        {
            new ApprovalWorkflowStep
            {
                WorkflowId = itWorkflow.Id,
                StepOrder = 1,
                StepType = StepTypes.Sequential,
                UserId = 3 // Deniz Kaya - IT Müdürü
            },
            new ApprovalWorkflowStep
            {
                WorkflowId = itWorkflow.Id,
                StepOrder = 2,
                StepType = StepTypes.Sequential,
                UserId = 4 // Ece Demir - IT Direktörü
            }
        };
        await context.ApprovalWorkflowSteps.AddRangeAsync(itSteps);

        // 2. Finans Talepleri Akışı (Finans Müdürü → CFO → CEO)
        var financeWorkflow = new ApprovalWorkflow
        {
            Name = "Finans Talepleri Onay Akışı",
            Description = "Finans departmanı talepleri için 3 aşamalı onay akışı",
            Category = "Finans",
            IsActive = true,
            Priority = 1,
            CreatedAt = DateTime.UtcNow
        };
        await context.ApprovalWorkflows.AddAsync(financeWorkflow);
        await context.SaveChangesAsync();

        var financeSteps = new[]
        {
            new ApprovalWorkflowStep
            {
                WorkflowId = financeWorkflow.Id,
                StepOrder = 1,
                StepType = StepTypes.Sequential,
                UserId = 6 // Gökhan Arslan - Finans Müdürü
            },
            new ApprovalWorkflowStep
            {
                WorkflowId = financeWorkflow.Id,
                StepOrder = 2,
                StepType = StepTypes.Sequential,
                UserId = 7 // Hakan Özdemir - CFO
            },
            new ApprovalWorkflowStep
            {
                WorkflowId = financeWorkflow.Id,
                StepOrder = 3,
                StepType = StepTypes.Sequential,
                UserId = 19 // Volkan Erdoğan - CEO
            }
        };
        await context.ApprovalWorkflowSteps.AddRangeAsync(financeSteps);

        // 3. İK Talepleri Akışı (İK Müdürü → İK Direktörü)
        var hrWorkflow = new ApprovalWorkflow
        {
            Name = "İK Talepleri Onay Akışı",
            Description = "İnsan Kaynakları talepleri için 2 aşamalı onay akışı",
            Category = "İnsan Kaynakları",
            IsActive = true,
            Priority = 1,
            CreatedAt = DateTime.UtcNow
        };
        await context.ApprovalWorkflows.AddAsync(hrWorkflow);
        await context.SaveChangesAsync();

        var hrSteps = new[]
        {
            new ApprovalWorkflowStep
            {
                WorkflowId = hrWorkflow.Id,
                StepOrder = 1,
                StepType = StepTypes.Sequential,
                UserId = 9 // Kemal Çelik - İK Müdürü
            },
            new ApprovalWorkflowStep
            {
                WorkflowId = hrWorkflow.Id,
                StepOrder = 2,
                StepType = StepTypes.Sequential,
                UserId = 10 // Leyla Yıldız - İK Direktörü
            }
        };
        await context.ApprovalWorkflowSteps.AddRangeAsync(hrSteps);

        // 4. Satış Talepleri Akışı (Satış Müdürü → Satış Direktörü → CFO)
        var salesWorkflow = new ApprovalWorkflow
        {
            Name = "Satış Talepleri Onay Akışı",
            Description = "Satış departmanı talepleri için 3 aşamalı onay akışı",
            Category = "Satış",
            IsActive = true,
            Priority = 1,
            CreatedAt = DateTime.UtcNow
        };
        await context.ApprovalWorkflows.AddAsync(salesWorkflow);
        await context.SaveChangesAsync();

        var salesSteps = new[]
        {
            new ApprovalWorkflowStep
            {
                WorkflowId = salesWorkflow.Id,
                StepOrder = 1,
                StepType = StepTypes.Sequential,
                UserId = 12 // Nur Acar - Satış Müdürü
            },
            new ApprovalWorkflowStep
            {
                WorkflowId = salesWorkflow.Id,
                StepOrder = 2,
                StepType = StepTypes.Sequential,
                UserId = 13 // Oğuz Polat - Satış Direktörü
            },
            new ApprovalWorkflowStep
            {
                WorkflowId = salesWorkflow.Id,
                StepOrder = 3,
                StepType = StepTypes.Sequential,
                UserId = 7 // Hakan Özdemir - CFO
            }
        };
        await context.ApprovalWorkflowSteps.AddRangeAsync(salesSteps);

        // 5. Genel Talepler Akışı (Departman Müdürü → Operasyon Direktörü)
        var generalWorkflow = new ApprovalWorkflow
        {
            Name = "Genel Talepler Onay Akışı",
            Description = "Genel talepler için 2 aşamalı onay akışı",
            Category = "Genel",
            IsActive = true,
            Priority = 1,
            CreatedAt = DateTime.UtcNow
        };
        await context.ApprovalWorkflows.AddAsync(generalWorkflow);
        await context.SaveChangesAsync();

        var generalSteps = new[]
        {
            new ApprovalWorkflowStep
            {
                WorkflowId = generalWorkflow.Id,
                StepOrder = 1,
                StepType = StepTypes.Sequential,
                UserId = 17 // Taner Bulut - Operasyon Müdürü
            },
            new ApprovalWorkflowStep
            {
                WorkflowId = generalWorkflow.Id,
                StepOrder = 2,
                StepType = StepTypes.Sequential,
                UserId = 18 // Ufuk Taş - Operasyon Direktörü
            }
        };
        await context.ApprovalWorkflowSteps.AddRangeAsync(generalSteps);

        await context.SaveChangesAsync();

        // ========================================
        // TEST WORKFLOW'LARI - PARALEL ONAY TESTLERİ
        // ========================================

        // 6. Paralel Onay - Any (Herhangi Biri Yeterli)
        var parallelAnyWorkflow = new ApprovalWorkflow
        {
            Name = "Test: Paralel Onay - Herhangi Biri",
            Description = "3 kişiden herhangi biri onaylayınca geçer (Any stratejisi)",
            Category = "Test",
            IsActive = true,
            Priority = 10,
            CreatedAt = DateTime.UtcNow
        };
        await context.ApprovalWorkflows.AddAsync(parallelAnyWorkflow);
        await context.SaveChangesAsync();

        var parallelAnySteps = new[]
        {
            new ApprovalWorkflowStep
            {
                WorkflowId = parallelAnyWorkflow.Id,
                StepOrder = 1,
                Level = 1,
                StepType = StepTypes.Parallel,
                ApprovalStrategy = ApprovalStrategies.Any,
                UserId = 3 // Deniz Kaya
            },
            new ApprovalWorkflowStep
            {
                WorkflowId = parallelAnyWorkflow.Id,
                StepOrder = 2,
                Level = 1,
                StepType = StepTypes.Parallel,
                ApprovalStrategy = ApprovalStrategies.Any,
                UserId = 6 // Gökhan Arslan
            },
            new ApprovalWorkflowStep
            {
                WorkflowId = parallelAnyWorkflow.Id,
                StepOrder = 3,
                Level = 1,
                StepType = StepTypes.Parallel,
                ApprovalStrategy = ApprovalStrategies.Any,
                UserId = 9 // Kemal Çelik
            }
        };
        await context.ApprovalWorkflowSteps.AddRangeAsync(parallelAnySteps);

        // 7. Paralel Onay - All (Hepsi Gerekli)
        var parallelAllWorkflow = new ApprovalWorkflow
        {
            Name = "Test: Paralel Onay - Hepsi Gerekli",
            Description = "3 kişinin hepsi onaylamalı (All stratejisi)",
            Category = "Test",
            IsActive = true,
            Priority = 10,
            CreatedAt = DateTime.UtcNow
        };
        await context.ApprovalWorkflows.AddAsync(parallelAllWorkflow);
        await context.SaveChangesAsync();

        var parallelAllSteps = new[]
        {
            new ApprovalWorkflowStep
            {
                WorkflowId = parallelAllWorkflow.Id,
                StepOrder = 1,
                Level = 1,
                StepType = StepTypes.Parallel,
                ApprovalStrategy = ApprovalStrategies.All,
                UserId = 4 // Ece Demir
            },
            new ApprovalWorkflowStep
            {
                WorkflowId = parallelAllWorkflow.Id,
                StepOrder = 2,
                Level = 1,
                StepType = StepTypes.Parallel,
                ApprovalStrategy = ApprovalStrategies.All,
                UserId = 7 // Hakan Özdemir
            },
            new ApprovalWorkflowStep
            {
                WorkflowId = parallelAllWorkflow.Id,
                StepOrder = 3,
                Level = 1,
                StepType = StepTypes.Parallel,
                ApprovalStrategy = ApprovalStrategies.All,
                UserId = 10 // Leyla Şahin
            }
        };
        await context.ApprovalWorkflowSteps.AddRangeAsync(parallelAllSteps);

        // 8. Paralel Onay - Majority (Çoğunluk)
        var parallelMajorityWorkflow = new ApprovalWorkflow
        {
            Name = "Test: Paralel Onay - Çoğunluk",
            Description = "5 kişiden 3'ü onaylayınca geçer (Majority stratejisi)",
            Category = "Test",
            IsActive = true,
            Priority = 10,
            CreatedAt = DateTime.UtcNow
        };
        await context.ApprovalWorkflows.AddAsync(parallelMajorityWorkflow);
        await context.SaveChangesAsync();

        var parallelMajoritySteps = new[]
        {
            new ApprovalWorkflowStep
            {
                WorkflowId = parallelMajorityWorkflow.Id,
                StepOrder = 1,
                Level = 1,
                StepType = StepTypes.Parallel,
                ApprovalStrategy = ApprovalStrategies.Majority,
                UserId = 3 // Deniz Kaya
            },
            new ApprovalWorkflowStep
            {
                WorkflowId = parallelMajorityWorkflow.Id,
                StepOrder = 2,
                Level = 1,
                StepType = StepTypes.Parallel,
                ApprovalStrategy = ApprovalStrategies.Majority,
                UserId = 6 // Gökhan Arslan
            },
            new ApprovalWorkflowStep
            {
                WorkflowId = parallelMajorityWorkflow.Id,
                StepOrder = 3,
                Level = 1,
                StepType = StepTypes.Parallel,
                ApprovalStrategy = ApprovalStrategies.Majority,
                UserId = 9 // Kemal Çelik
            },
            new ApprovalWorkflowStep
            {
                WorkflowId = parallelMajorityWorkflow.Id,
                StepOrder = 4,
                Level = 1,
                StepType = StepTypes.Parallel,
                ApprovalStrategy = ApprovalStrategies.Majority,
                UserId = 12 // Murat Yılmaz
            },
            new ApprovalWorkflowStep
            {
                WorkflowId = parallelMajorityWorkflow.Id,
                StepOrder = 5,
                Level = 1,
                StepType = StepTypes.Parallel,
                ApprovalStrategy = ApprovalStrategies.Majority,
                UserId = 15 // Pınar Aydın
            }
        };
        await context.ApprovalWorkflowSteps.AddRangeAsync(parallelMajoritySteps);

        // 9. Karma Akış (Sequential → Parallel-Majority → Sequential)
        var mixedWorkflow = new ApprovalWorkflow
        {
            Name = "Test: Karma Onay Akışı",
            Description = "Level 1: Sequential → Level 2: Parallel-Majority → Level 3: Sequential",
            Category = "Test",
            IsActive = true,
            Priority = 10,
            CreatedAt = DateTime.UtcNow
        };
        await context.ApprovalWorkflows.AddAsync(mixedWorkflow);
        await context.SaveChangesAsync();

        var mixedSteps = new[]
        {
            // Level 1: Sequential
            new ApprovalWorkflowStep
            {
                WorkflowId = mixedWorkflow.Id,
                StepOrder = 1,
                Level = 1,
                StepType = StepTypes.Sequential,
                ApprovalStrategy = ApprovalStrategies.All,
                UserId = 3 // Deniz Kaya - IT Müdürü
            },
            // Level 2: Parallel-Majority (3 kişiden 2'si)
            new ApprovalWorkflowStep
            {
                WorkflowId = mixedWorkflow.Id,
                StepOrder = 2,
                Level = 2,
                StepType = StepTypes.Parallel,
                ApprovalStrategy = ApprovalStrategies.Majority,
                UserId = 6 // Gökhan Arslan - Finans Müdürü
            },
            new ApprovalWorkflowStep
            {
                WorkflowId = mixedWorkflow.Id,
                StepOrder = 3,
                Level = 2,
                StepType = StepTypes.Parallel,
                ApprovalStrategy = ApprovalStrategies.Majority,
                UserId = 9 // Kemal Çelik - İK Müdürü
            },
            new ApprovalWorkflowStep
            {
                WorkflowId = mixedWorkflow.Id,
                StepOrder = 4,
                Level = 2,
                StepType = StepTypes.Parallel,
                ApprovalStrategy = ApprovalStrategies.Majority,
                UserId = 12 // Murat Yılmaz - Satış Müdürü
            },
            // Level 3: Sequential
            new ApprovalWorkflowStep
            {
                WorkflowId = mixedWorkflow.Id,
                StepOrder = 5,
                Level = 3,
                StepType = StepTypes.Sequential,
                ApprovalStrategy = ApprovalStrategies.All,
                UserId = 19 // Volkan Erdoğan - CEO
            }
        };
        await context.ApprovalWorkflowSteps.AddRangeAsync(mixedSteps);

        await context.SaveChangesAsync();

        logger.LogInformation("✅ 9 onay akışı başarıyla oluşturuldu!");
        logger.LogInformation("📋 IT Talepleri: IT Müdürü → IT Direktörü");
        logger.LogInformation("📋 Finans Talepleri: Finans Müdürü → CFO → CEO");
        logger.LogInformation("📋 İK Talepleri: İK Müdürü → İK Direktörü");
        logger.LogInformation("📋 Satış Talepleri: Satış Müdürü → Satış Direktörü → CFO");
        logger.LogInformation("📋 Genel Talepler: Operasyon Müdürü → Operasyon Direktörü");
        logger.LogInformation("🧪 TEST: Paralel-Any (3 kişiden 1'i yeterli)");
        logger.LogInformation("🧪 TEST: Paralel-All (3 kişinin hepsi gerekli)");
        logger.LogInformation("🧪 TEST: Paralel-Majority (5 kişiden 3'ü gerekli)");
        logger.LogInformation("🧪 TEST: Karma Akış (Sequential → Majority → Sequential)");
    }
}

