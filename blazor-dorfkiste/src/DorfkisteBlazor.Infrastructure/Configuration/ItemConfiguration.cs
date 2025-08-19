using DorfkisteBlazor.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace DorfkisteBlazor.Infrastructure.Configuration;

/// <summary>
/// Entity Framework configuration for Item entity
/// </summary>
public class ItemConfiguration : IEntityTypeConfiguration<Item>
{
    public void Configure(EntityTypeBuilder<Item> builder)
    {
        builder.ToTable("Items");
        
        builder.HasKey(i => i.Id);
        
        builder.Property(i => i.Title)
            .IsRequired()
            .HasMaxLength(200);
            
        builder.Property(i => i.Description)
            .HasMaxLength(2000);
            
        builder.Property(i => i.Condition)
            .IsRequired()
            .HasMaxLength(50);
            
        builder.Property(i => i.Location)
            .IsRequired()
            .HasMaxLength(200);
            
        builder.Property(i => i.PricePerDay)
            .HasPrecision(10, 2);
            
        builder.Property(i => i.PricePerHour)
            .HasPrecision(10, 2);
            
        builder.Property(i => i.Deposit)
            .HasPrecision(10, 2);
            
        builder.Property(i => i.DeliveryFee)
            .HasPrecision(10, 2);
            
        builder.Property(i => i.DeliveryDetails)
            .HasMaxLength(500);

        // Configure relationships
        builder.HasOne(i => i.User)
            .WithMany(u => u.Items)
            .HasForeignKey(i => i.UserId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(i => i.Category)
            .WithMany(c => c.Items)
            .HasForeignKey(i => i.CategoryId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasMany(i => i.Images)
            .WithOne(img => img.Item)
            .HasForeignKey(img => img.ItemId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasMany(i => i.Rentals)
            .WithOne(r => r.Item)
            .HasForeignKey(r => r.ItemId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasMany(i => i.WatchlistItems)
            .WithOne(w => w.Item)
            .HasForeignKey(w => w.ItemId)
            .OnDelete(DeleteBehavior.Cascade);

        // Indexes
        builder.HasIndex(i => new { i.UserId, i.Available });
        builder.HasIndex(i => new { i.CategoryId, i.Available });
        builder.HasIndex(i => new { i.Latitude, i.Longitude });
    }
}