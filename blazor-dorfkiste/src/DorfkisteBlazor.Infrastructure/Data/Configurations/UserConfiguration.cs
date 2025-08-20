using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using DorfkisteBlazor.Domain.Entities;

namespace DorfkisteBlazor.Infrastructure.Data.Configurations;

/// <summary>
/// Entity Framework configuration for User entity
/// </summary>
public class UserConfiguration : IEntityTypeConfiguration<User>
{
    public void Configure(EntityTypeBuilder<User> builder)
    {
        // Primary key
        builder.HasKey(x => x.Id);

        // Properties
        builder.Property(x => x.Email)
            .IsRequired()
            .HasMaxLength(256)
            .HasAnnotation("EmailAddress", true);

        builder.Property(x => x.Password)
            .HasMaxLength(500);

        builder.Property(x => x.Name)
            .HasMaxLength(100);

        builder.Property(x => x.AvatarUrl)
            .HasMaxLength(500);

        builder.Property(x => x.Bio)
            .HasMaxLength(1000);

        builder.Property(x => x.Verified)
            .HasDefaultValue(false);

        builder.Property(x => x.IsAdmin)
            .HasDefaultValue(false);

        builder.Property(x => x.StripeCustomerId)
            .HasMaxLength(100);

        builder.Property(x => x.PaypalEmail)
            .HasMaxLength(256);

        // Base entity properties
        builder.Property(x => x.CreatedAt)
            .HasDefaultValueSql("GETUTCDATE()")
            .IsRequired();

        builder.Property(x => x.IsActive)
            .HasDefaultValue(true);

        builder.Property(x => x.IsDeleted)
            .HasDefaultValue(false);

        builder.Property(x => x.RowVersion)
            .IsRowVersion();

        // Indexes
        builder.HasIndex(x => x.Email)
            .IsUnique()
            .HasDatabaseName("IX_Users_Email");

        builder.HasIndex(x => x.IsActive)
            .HasDatabaseName("IX_Users_IsActive");

        builder.HasIndex(x => x.IsDeleted)
            .HasDatabaseName("IX_Users_IsDeleted");

        builder.HasIndex(x => x.CreatedAt)
            .HasDatabaseName("IX_Users_CreatedAt");

        // Relationships
        builder.HasMany(x => x.Items)
            .WithOne(x => x.User)
            .HasForeignKey(x => x.UserId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasMany(x => x.RentalsAsOwner)
            .WithOne(x => x.Owner)
            .HasForeignKey(x => x.OwnerId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasMany(x => x.RentalsAsRenter)
            .WithOne(x => x.Renter)
            .HasForeignKey(x => x.RenterId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasMany(x => x.ReviewsGiven)
            .WithOne(x => x.Reviewer)
            .HasForeignKey(x => x.ReviewerId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasMany(x => x.ReviewsReceived)
            .WithOne(x => x.Reviewed)
            .HasForeignKey(x => x.ReviewedId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasMany(x => x.Payments)
            .WithOne(x => x.User)
            .HasForeignKey(x => x.UserId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasMany(x => x.Payouts)
            .WithOne(x => x.User)
            .HasForeignKey(x => x.UserId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasMany(x => x.WatchlistItems)
            .WithOne(x => x.User)
            .HasForeignKey(x => x.UserId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasMany(x => x.PasswordResetTokens)
            .WithOne(x => x.User)
            .HasForeignKey(x => x.UserId)
            .OnDelete(DeleteBehavior.Cascade);

        // Table name
        builder.ToTable("Users");
    }
}