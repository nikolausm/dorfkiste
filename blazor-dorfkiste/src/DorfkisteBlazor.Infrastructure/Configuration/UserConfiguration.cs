using DorfkisteBlazor.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace DorfkisteBlazor.Infrastructure.Configuration;

/// <summary>
/// Entity Framework configuration for User entity
/// </summary>
public class UserConfiguration : IEntityTypeConfiguration<User>
{
    public void Configure(EntityTypeBuilder<User> builder)
    {
        builder.ToTable("Users");
        
        builder.HasKey(u => u.Id);
        
        builder.Property(u => u.Email)
            .IsRequired()
            .HasMaxLength(255);
            
        builder.HasIndex(u => u.Email)
            .IsUnique();
            
        builder.Property(u => u.Name)
            .HasMaxLength(100);
            
        builder.Property(u => u.AvatarUrl)
            .HasMaxLength(500);
            
        builder.Property(u => u.Bio)
            .HasMaxLength(1000);
            
        builder.Property(u => u.StripeCustomerId)
            .HasMaxLength(100);
            
        builder.Property(u => u.PaypalEmail)
            .HasMaxLength(255);

        // Configure relationships
        builder.HasMany(u => u.Items)
            .WithOne(i => i.User)
            .HasForeignKey(i => i.UserId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasMany(u => u.RentalsAsOwner)
            .WithOne(r => r.Owner)
            .HasForeignKey(r => r.OwnerId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasMany(u => u.RentalsAsRenter)
            .WithOne(r => r.Renter)
            .HasForeignKey(r => r.RenterId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasMany(u => u.ReviewsGiven)
            .WithOne(r => r.Reviewer)
            .HasForeignKey(r => r.ReviewerId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasMany(u => u.ReviewsReceived)
            .WithOne(r => r.Reviewed)
            .HasForeignKey(r => r.ReviewedId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasMany(u => u.Messages)
            .WithOne(m => m.Sender)
            .HasForeignKey(m => m.SenderId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasMany(u => u.Payments)
            .WithOne(p => p.User)
            .HasForeignKey(p => p.UserId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasMany(u => u.Payouts)
            .WithOne(p => p.User)
            .HasForeignKey(p => p.UserId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasMany(u => u.WatchlistItems)
            .WithOne(w => w.User)
            .HasForeignKey(w => w.UserId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasMany(u => u.PasswordResetTokens)
            .WithOne(t => t.User)
            .HasForeignKey(t => t.UserId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}