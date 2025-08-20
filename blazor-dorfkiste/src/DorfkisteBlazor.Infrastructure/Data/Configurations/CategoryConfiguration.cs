using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using DorfkisteBlazor.Domain.Entities;

namespace DorfkisteBlazor.Infrastructure.Data.Configurations;

/// <summary>
/// Entity Framework configuration for Category entity
/// </summary>
public class CategoryConfiguration : IEntityTypeConfiguration<Category>
{
    public void Configure(EntityTypeBuilder<Category> builder)
    {
        // Primary key
        builder.HasKey(x => x.Id);

        // Properties
        builder.Property(x => x.Name)
            .IsRequired()
            .HasMaxLength(100);

        builder.Property(x => x.Slug)
            .IsRequired()
            .HasMaxLength(100);

        builder.Property(x => x.Description)
            .HasMaxLength(500);

        builder.Property(x => x.Icon)
            .HasMaxLength(50);

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
        builder.HasIndex(x => x.Slug)
            .IsUnique()
            .HasDatabaseName("IX_Categories_Slug");

        builder.HasIndex(x => x.Name)
            .HasDatabaseName("IX_Categories_Name");

        builder.HasIndex(x => x.IsActive)
            .HasDatabaseName("IX_Categories_IsActive");

        builder.HasIndex(x => x.IsDeleted)
            .HasDatabaseName("IX_Categories_IsDeleted");

        // Relationships
        builder.HasMany(x => x.Items)
            .WithOne(x => x.Category)
            .HasForeignKey(x => x.CategoryId)
            .OnDelete(DeleteBehavior.Restrict);

        // Table name
        builder.ToTable("Categories");
    }
}