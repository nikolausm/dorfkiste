using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using DorfkisteBlazor.Domain.Entities;

namespace DorfkisteBlazor.Infrastructure.Data.Configurations;

/// <summary>
/// Entity Framework configuration for Item entity
/// </summary>
public class ItemConfiguration : IEntityTypeConfiguration<Item>
{
    public void Configure(EntityTypeBuilder<Item> builder)
    {
        // Primary key
        builder.HasKey(x => x.Id);

        // Properties
        builder.Property(x => x.Title)
            .IsRequired()
            .HasMaxLength(200);

        builder.Property(x => x.Description)
            .HasMaxLength(2000);

        builder.Property(x => x.Condition)
            .IsRequired()
            .HasMaxLength(50);

        builder.Property(x => x.PricePerDay)
            .HasPrecision(10, 2);

        builder.Property(x => x.PricePerHour)
            .HasPrecision(10, 2);

        builder.Property(x => x.Deposit)
            .HasPrecision(10, 2);

        builder.Property(x => x.Available)
            .HasDefaultValue(true);

        builder.Property(x => x.Location)
            .IsRequired()
            .HasMaxLength(200);

        builder.Property(x => x.DeliveryAvailable)
            .HasDefaultValue(false);

        builder.Property(x => x.DeliveryFee)
            .HasPrecision(8, 2);

        builder.Property(x => x.DeliveryDetails)
            .HasMaxLength(500);

        builder.Property(x => x.PickupAvailable)
            .HasDefaultValue(true);

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
        builder.HasIndex(x => x.UserId)
            .HasDatabaseName("IX_Items_UserId");

        builder.HasIndex(x => x.CategoryId)
            .HasDatabaseName("IX_Items_CategoryId");

        builder.HasIndex(x => x.Available)
            .HasDatabaseName("IX_Items_Available");

        builder.HasIndex(x => x.Location)
            .HasDatabaseName("IX_Items_Location");

        builder.HasIndex(x => x.CreatedAt)
            .HasDatabaseName("IX_Items_CreatedAt");

        builder.HasIndex(x => x.IsActive)
            .HasDatabaseName("IX_Items_IsActive");

        builder.HasIndex(x => x.IsDeleted)
            .HasDatabaseName("IX_Items_IsDeleted");

        // Composite indexes for common queries
        builder.HasIndex(x => new { x.Available, x.IsActive, x.IsDeleted })
            .HasDatabaseName("IX_Items_Available_Active_NotDeleted");

        builder.HasIndex(x => new { x.CategoryId, x.Available, x.IsActive })
            .HasDatabaseName("IX_Items_Category_Available_Active");

        // Spatial index for location-based queries (if using spatial data types)
        // builder.HasIndex(x => new { x.Latitude, x.Longitude })
        //     .HasDatabaseName("IX_Items_Location_Spatial");

        // Foreign keys (relationships configured in other entities)
        builder.HasOne(x => x.User)
            .WithMany(x => x.Items)
            .HasForeignKey(x => x.UserId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasOne(x => x.Category)
            .WithMany(x => x.Items)
            .HasForeignKey(x => x.CategoryId)
            .OnDelete(DeleteBehavior.Restrict);

        // Relationships
        builder.HasMany(x => x.Rentals)
            .WithOne(x => x.Item)
            .HasForeignKey(x => x.ItemId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasMany(x => x.Images)
            .WithOne(x => x.Item)
            .HasForeignKey(x => x.ItemId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasMany(x => x.WatchlistItems)
            .WithOne(x => x.Item)
            .HasForeignKey(x => x.ItemId)
            .OnDelete(DeleteBehavior.Cascade);

        // Table name
        builder.ToTable("Items");
    }
}