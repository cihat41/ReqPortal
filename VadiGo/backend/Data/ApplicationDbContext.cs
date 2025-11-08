using Microsoft.EntityFrameworkCore;
using TalepSistemi.API.Models;

namespace TalepSistemi.API.Data;

public class ApplicationDbContext : DbContext
{
    public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options)
        : base(options)
    {
    }

    public DbSet<User> Users { get; set; }
    public DbSet<Role> Roles { get; set; }
    public DbSet<UserRole> UserRoles { get; set; }
    public DbSet<Request> Requests { get; set; }
    public DbSet<Approval> Approvals { get; set; }
    public DbSet<RequestComment> RequestComments { get; set; }
    public DbSet<RequestAttachment> RequestAttachments { get; set; }
    public DbSet<AuditLog> AuditLogs { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // User configuration
        modelBuilder.Entity<User>(entity =>
        {
            entity.HasIndex(e => e.Email).IsUnique();
        });

        // Role configuration
        modelBuilder.Entity<Role>(entity =>
        {
            entity.HasIndex(e => e.Name).IsUnique();
        });

        // UserRole configuration
        modelBuilder.Entity<UserRole>(entity =>
        {
            entity.HasOne(ur => ur.User)
                .WithMany(u => u.UserRoles)
                .HasForeignKey(ur => ur.UserId)
                .OnDelete(DeleteBehavior.Cascade);

            entity.HasOne(ur => ur.Role)
                .WithMany(r => r.UserRoles)
                .HasForeignKey(ur => ur.RoleId)
                .OnDelete(DeleteBehavior.Cascade);

            entity.HasIndex(e => new { e.UserId, e.RoleId }).IsUnique();
        });

        // Request configuration
        modelBuilder.Entity<Request>(entity =>
        {
            entity.HasOne(r => r.Requester)
                .WithMany(u => u.Requests)
                .HasForeignKey(r => r.RequesterId)
                .OnDelete(DeleteBehavior.Restrict);

            entity.HasIndex(e => e.Status);
            entity.HasIndex(e => e.RequesterId);
        });

        // Approval configuration
        modelBuilder.Entity<Approval>(entity =>
        {
            entity.HasOne(a => a.Request)
                .WithMany(r => r.Approvals)
                .HasForeignKey(a => a.RequestId)
                .OnDelete(DeleteBehavior.Cascade);

            entity.HasOne(a => a.Approver)
                .WithMany(u => u.Approvals)
                .HasForeignKey(a => a.ApproverId)
                .OnDelete(DeleteBehavior.Restrict);

            entity.HasIndex(e => new { e.RequestId, e.ApproverId });
        });

        // RequestComment configuration
        modelBuilder.Entity<RequestComment>(entity =>
        {
            entity.HasOne(rc => rc.Request)
                .WithMany(r => r.Comments)
                .HasForeignKey(rc => rc.RequestId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        // RequestAttachment configuration
        modelBuilder.Entity<RequestAttachment>(entity =>
        {
            entity.HasOne(ra => ra.Request)
                .WithMany(r => r.Attachments)
                .HasForeignKey(ra => ra.RequestId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        // AuditLog configuration
        modelBuilder.Entity<AuditLog>(entity =>
        {
            entity.HasIndex(e => e.EntityName);
            entity.HasIndex(e => e.CreatedAt);
        });

        // Seed initial data
        SeedData(modelBuilder);
    }

    private void SeedData(ModelBuilder modelBuilder)
    {
        // Seed Roles - Sabit tarih kullanıyoruz (migration için)
        var seedDate = new DateTime(2024, 1, 1, 0, 0, 0, DateTimeKind.Utc);

        modelBuilder.Entity<Role>().HasData(
            new Role { Id = 1, Name = RoleNames.User, Description = "Normal kullanıcı", CreatedAt = seedDate },
            new Role { Id = 2, Name = RoleNames.Approver, Description = "Onaylayıcı", CreatedAt = seedDate },
            new Role { Id = 3, Name = RoleNames.Manager, Description = "Yönetici", CreatedAt = seedDate },
            new Role { Id = 4, Name = RoleNames.Admin, Description = "Sistem Yöneticisi", CreatedAt = seedDate }
        );
    }
}

