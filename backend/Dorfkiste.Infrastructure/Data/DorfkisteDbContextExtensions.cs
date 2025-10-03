using Microsoft.EntityFrameworkCore;
using Dorfkiste.Core.Entities;

namespace Dorfkiste.Infrastructure.Data;

public static class DorfkisteDbContextExtensions
{
    public static void ConfigureGdprEntities(this ModelBuilder modelBuilder)
    {
        // Add UserPrivacySettings to UserEntity configuration
        var userEntity = modelBuilder.Entity<User>();

        userEntity.HasOne(u => u.PrivacySettings)
            .WithOne(p => p.User)
            .HasForeignKey<UserPrivacySettings>(p => p.UserId)
            .OnDelete(DeleteBehavior.Cascade);

        // Configure UserPrivacySettings
        var privacyEntity = modelBuilder.Entity<UserPrivacySettings>();

        privacyEntity.HasKey(p => p.Id);

        privacyEntity.Property(p => p.MarketingEmailsConsent)
            .IsRequired()
            .HasDefaultValue(false);

        privacyEntity.Property(p => p.DataProcessingConsent)
            .IsRequired()
            .HasDefaultValue(true);

        privacyEntity.Property(p => p.ProfileVisibilityConsent)
            .IsRequired()
            .HasDefaultValue(true);

        privacyEntity.Property(p => p.DataSharingConsent)
            .IsRequired()
            .HasDefaultValue(false);

        privacyEntity.Property(p => p.CreatedAt)
            .IsRequired();

        privacyEntity.Property(p => p.UpdatedAt)
            .IsRequired();

        privacyEntity.HasIndex(p => p.UserId)
            .IsUnique();
    }
}
