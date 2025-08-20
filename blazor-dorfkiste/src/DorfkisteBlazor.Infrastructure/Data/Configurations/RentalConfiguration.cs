using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using DorfkisteBlazor.Domain.Entities;

namespace DorfkisteBlazor.Infrastructure.Data.Configurations;

/// <summary>
/// Entity Framework configuration for Rental entity
/// </summary>
public class RentalConfiguration : IEntityTypeConfiguration<Rental>
{
    public void Configure(EntityTypeBuilder<Rental> builder)
    {
        // Primary key
        builder.HasKey(x => x.Id);

        // Properties
        builder.Property(x => x.StartDate)
            .IsRequired();

        builder.Property(x => x.EndDate)
            .IsRequired();

        builder.Property(x => x.TotalPrice)
            .IsRequired()
            .HasPrecision(10, 2);

        builder.Property(x => x.DepositPaid)
            .IsRequired()
            .HasPrecision(10, 2);

        builder.Property(x => x.PlatformFee)
            .HasPrecision(8, 2)
            .HasDefaultValue(0);

        builder.Property(x => x.Status)
            .IsRequired()
            .HasMaxLength(50);

        builder.Property(x => x.PaymentStatus)
            .IsRequired()
            .HasMaxLength(50)
            .HasDefaultValue("pending");

        builder.Property(x => x.PaymentMethod)
            .HasMaxLength(50);

        builder.Property(x => x.StripePaymentIntentId)
            .HasMaxLength(100);

        builder.Property(x => x.PaypalOrderId)
            .HasMaxLength(100);

        builder.Property(x => x.DeliveryRequested)
            .HasDefaultValue(false);

        builder.Property(x => x.DeliveryAddress)
            .HasMaxLength(500);

        builder.Property(x => x.DeliveryFee)
            .HasPrecision(8, 2);

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
        builder.HasIndex(x => x.ItemId)
            .HasDatabaseName("IX_Rentals_ItemId");

        builder.HasIndex(x => x.OwnerId)
            .HasDatabaseName("IX_Rentals_OwnerId");

        builder.HasIndex(x => x.RenterId)
            .HasDatabaseName("IX_Rentals_RenterId");

        builder.HasIndex(x => x.Status)
            .HasDatabaseName("IX_Rentals_Status");

        builder.HasIndex(x => x.PaymentStatus)
            .HasDatabaseName("IX_Rentals_PaymentStatus");

        builder.HasIndex(x => new { x.StartDate, x.EndDate })
            .HasDatabaseName("IX_Rentals_StartDate_EndDate");

        builder.HasIndex(x => x.CreatedAt)
            .HasDatabaseName("IX_Rentals_CreatedAt");

        builder.HasIndex(x => x.IsActive)
            .HasDatabaseName("IX_Rentals_IsActive");

        builder.HasIndex(x => x.IsDeleted)
            .HasDatabaseName("IX_Rentals_IsDeleted");

        // Composite indexes for common queries
        builder.HasIndex(x => new { x.Status, x.IsActive, x.IsDeleted })
            .HasDatabaseName("IX_Rentals_Status_Active_NotDeleted");

        builder.HasIndex(x => new { x.OwnerId, x.Status, x.StartDate })
            .HasDatabaseName("IX_Rentals_Owner_Status_StartDate");

        builder.HasIndex(x => new { x.RenterId, x.Status, x.StartDate })
            .HasDatabaseName("IX_Rentals_Renter_Status_StartDate");

        // Relationships
        builder.HasOne(x => x.Item)
            .WithMany(x => x.Rentals)
            .HasForeignKey(x => x.ItemId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(x => x.Owner)
            .WithMany(x => x.RentalsAsOwner)
            .HasForeignKey(x => x.OwnerId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(x => x.Renter)
            .WithMany(x => x.RentalsAsRenter)
            .HasForeignKey(x => x.RenterId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasMany(x => x.Payments)
            .WithOne(x => x.Rental)
            .HasForeignKey(x => x.RentalId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasMany(x => x.Reviews)
            .WithOne(x => x.Rental)
            .HasForeignKey(x => x.RentalId)
            .OnDelete(DeleteBehavior.Cascade);

        // Table name
        builder.ToTable("Rentals");

        // Check constraints
        builder.HasCheckConstraint("CK_Rentals_EndDate_AfterStartDate", "[EndDate] > [StartDate]");
        builder.HasCheckConstraint("CK_Rentals_TotalPrice_Positive", "[TotalPrice] >= 0");
        builder.HasCheckConstraint("CK_Rentals_DepositPaid_NonNegative", "[DepositPaid] >= 0");
        builder.HasCheckConstraint("CK_Rentals_PlatformFee_NonNegative", "[PlatformFee] >= 0");
    }
}