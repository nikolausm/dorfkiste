using DorfkisteBlazor.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace DorfkisteBlazor.Infrastructure.Configuration;

/// <summary>
/// Entity Framework configuration for Rental entity
/// </summary>
public class RentalConfiguration : IEntityTypeConfiguration<Rental>
{
    public void Configure(EntityTypeBuilder<Rental> builder)
    {
        builder.ToTable("Rentals");
        
        builder.HasKey(r => r.Id);
        
        builder.Property(r => r.Status)
            .IsRequired()
            .HasMaxLength(50);
            
        builder.Property(r => r.PaymentStatus)
            .IsRequired()
            .HasMaxLength(50);
            
        builder.Property(r => r.PaymentMethod)
            .HasMaxLength(50);
            
        builder.Property(r => r.StripePaymentIntentId)
            .HasMaxLength(100);
            
        builder.Property(r => r.PaypalOrderId)
            .HasMaxLength(100);
            
        builder.Property(r => r.DeliveryAddress)
            .HasMaxLength(500);
            
        builder.Property(r => r.TotalPrice)
            .HasPrecision(10, 2);
            
        builder.Property(r => r.DepositPaid)
            .HasPrecision(10, 2);
            
        builder.Property(r => r.PlatformFee)
            .HasPrecision(10, 2);
            
        builder.Property(r => r.DeliveryFee)
            .HasPrecision(10, 2);

        // Configure relationships
        builder.HasOne(r => r.Item)
            .WithMany(i => i.Rentals)
            .HasForeignKey(r => r.ItemId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(r => r.Owner)
            .WithMany(u => u.RentalsAsOwner)
            .HasForeignKey(r => r.OwnerId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(r => r.Renter)
            .WithMany(u => u.RentalsAsRenter)
            .HasForeignKey(r => r.RenterId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasMany(r => r.Reviews)
            .WithOne(rv => rv.Rental)
            .HasForeignKey(rv => rv.RentalId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasMany(r => r.Messages)
            .WithOne(m => m.Rental)
            .HasForeignKey(m => m.RentalId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasMany(r => r.Payments)
            .WithOne(p => p.Rental)
            .HasForeignKey(p => p.RentalId)
            .OnDelete(DeleteBehavior.Restrict);

        // Indexes
        builder.HasIndex(r => new { r.ItemId, r.Status });
        builder.HasIndex(r => new { r.OwnerId, r.Status });
        builder.HasIndex(r => new { r.RenterId, r.Status });
        builder.HasIndex(r => new { r.StartDate, r.EndDate });
    }
}