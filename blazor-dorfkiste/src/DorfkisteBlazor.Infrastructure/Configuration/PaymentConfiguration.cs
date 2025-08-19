using DorfkisteBlazor.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace DorfkisteBlazor.Infrastructure.Configuration;

/// <summary>
/// Entity Framework configuration for Payment entity
/// </summary>
public class PaymentConfiguration : IEntityTypeConfiguration<Payment>
{
    public void Configure(EntityTypeBuilder<Payment> builder)
    {
        builder.ToTable("Payments");
        
        builder.HasKey(p => p.Id);
        
        builder.Property(p => p.Amount)
            .HasPrecision(10, 2);
            
        builder.Property(p => p.Currency)
            .IsRequired()
            .HasMaxLength(3);
            
        builder.Property(p => p.Status)
            .IsRequired()
            .HasMaxLength(50);
            
        builder.Property(p => p.Type)
            .IsRequired()
            .HasMaxLength(50);
            
        builder.Property(p => p.Method)
            .IsRequired()
            .HasMaxLength(50);
            
        builder.Property(p => p.StripePaymentIntentId)
            .HasMaxLength(100);
            
        builder.Property(p => p.PaypalPaymentId)
            .HasMaxLength(100);
            
        builder.Property(p => p.Metadata)
            .HasMaxLength(2000);

        // Configure relationships
        builder.HasOne(p => p.User)
            .WithMany(u => u.Payments)
            .HasForeignKey(p => p.UserId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(p => p.Rental)
            .WithMany(r => r.Payments)
            .HasForeignKey(p => p.RentalId)
            .OnDelete(DeleteBehavior.Restrict);

        // Indexes
        builder.HasIndex(p => new { p.UserId, p.Status });
        builder.HasIndex(p => p.StripePaymentIntentId);
        builder.HasIndex(p => p.PaypalPaymentId);
    }
}