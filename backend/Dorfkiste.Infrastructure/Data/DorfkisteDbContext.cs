using Microsoft.EntityFrameworkCore;
using Dorfkiste.Core.Entities;

namespace Dorfkiste.Infrastructure.Data;

public class DorfkisteDbContext : DbContext
{
    public DorfkisteDbContext(DbContextOptions<DorfkisteDbContext> options) : base(options)
    {
    }

    public DbSet<User> Users => Set<User>();
    public DbSet<ContactInfo> ContactInfos => Set<ContactInfo>();
    public DbSet<Category> Categories => Set<Category>();
    public DbSet<Offer> Offers => Set<Offer>();
    public DbSet<OfferPicture> OfferPictures => Set<OfferPicture>();
    public DbSet<Message> Messages => Set<Message>();
    public DbSet<Booking> Bookings => Set<Booking>();
    public DbSet<AvailabilityOverride> AvailabilityOverrides => Set<AvailabilityOverride>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        ConfigureUserEntity(modelBuilder);
        ConfigureContactInfoEntity(modelBuilder);
        ConfigureCategoryEntity(modelBuilder);
        ConfigureOfferEntity(modelBuilder);
        ConfigureOfferPictureEntity(modelBuilder);
        ConfigureMessageEntity(modelBuilder);
        ConfigureBookingEntity(modelBuilder);
        ConfigureAvailabilityOverrideEntity(modelBuilder);
    }

    private static void ConfigureUserEntity(ModelBuilder modelBuilder)
    {
        var userEntity = modelBuilder.Entity<User>();
        
        userEntity.HasKey(u => u.Id);
        
        userEntity.Property(u => u.Email)
            .IsRequired()
            .HasMaxLength(255);
        
        userEntity.Property(u => u.PasswordHash)
            .IsRequired()
            .HasMaxLength(255);
        
        userEntity.Property(u => u.FirstName)
            .IsRequired()
            .HasMaxLength(100);
        
        userEntity.Property(u => u.LastName)
            .IsRequired()
            .HasMaxLength(100);
        
        userEntity.Property(u => u.CreatedAt)
            .IsRequired();
        
        userEntity.HasIndex(u => u.Email)
            .IsUnique();
        
        userEntity.HasOne(u => u.ContactInfo)
            .WithOne(c => c.User)
            .HasForeignKey<ContactInfo>(c => c.UserId)
            .OnDelete(DeleteBehavior.Cascade);
    }

    private static void ConfigureContactInfoEntity(ModelBuilder modelBuilder)
    {
        var contactEntity = modelBuilder.Entity<ContactInfo>();
        
        contactEntity.HasKey(c => c.Id);
        
        contactEntity.Property(c => c.PhoneNumber)
            .HasMaxLength(20);
        
        contactEntity.Property(c => c.MobileNumber)
            .HasMaxLength(20);
        
        contactEntity.Property(c => c.Street)
            .HasMaxLength(200);
        
        contactEntity.Property(c => c.City)
            .HasMaxLength(100);
        
        contactEntity.Property(c => c.PostalCode)
            .HasMaxLength(20);
        
        contactEntity.Property(c => c.State)
            .HasMaxLength(100);
        
        contactEntity.Property(c => c.Country)
            .HasMaxLength(100);
    }

    private static void ConfigureCategoryEntity(ModelBuilder modelBuilder)
    {
        var categoryEntity = modelBuilder.Entity<Category>();
        
        categoryEntity.HasKey(c => c.Id);
        
        categoryEntity.Property(c => c.Name)
            .IsRequired()
            .HasMaxLength(100);
        
        categoryEntity.Property(c => c.Description)
            .HasMaxLength(500);
        
        categoryEntity.Property(c => c.IconName)
            .HasMaxLength(50);
        
        categoryEntity.HasIndex(c => c.Name)
            .IsUnique();
    }

    private static void ConfigureOfferEntity(ModelBuilder modelBuilder)
    {
        var offerEntity = modelBuilder.Entity<Offer>();
        
        offerEntity.HasKey(o => o.Id);
        
        offerEntity.Property(o => o.Title)
            .IsRequired()
            .HasMaxLength(200);
        
        offerEntity.Property(o => o.Description)
            .IsRequired()
            .HasMaxLength(2000);
        
        offerEntity.Property(o => o.PricePerDay)
            .HasPrecision(10, 2);
        
        offerEntity.Property(o => o.PricePerHour)
            .HasPrecision(10, 2);
        
        offerEntity.Property(o => o.ImagePath)
            .HasMaxLength(500);
        
        offerEntity.HasOne(o => o.User)
            .WithMany(u => u.Offers)
            .HasForeignKey(o => o.UserId)
            .OnDelete(DeleteBehavior.Cascade);
        
        offerEntity.HasOne(o => o.Category)
            .WithMany(c => c.Offers)
            .HasForeignKey(o => o.CategoryId)
            .OnDelete(DeleteBehavior.Restrict);
        
        offerEntity.HasIndex(o => o.Title);
        offerEntity.HasIndex(o => o.CategoryId);
        offerEntity.HasIndex(o => o.UserId);
        
        offerEntity.HasMany(o => o.Pictures)
            .WithOne(p => p.Offer)
            .HasForeignKey(p => p.OfferId)
            .OnDelete(DeleteBehavior.Cascade);

        offerEntity.HasMany(o => o.Bookings)
            .WithOne(b => b.Offer)
            .HasForeignKey(b => b.OfferId)
            .OnDelete(DeleteBehavior.Cascade);

        offerEntity.HasMany(o => o.AvailabilityOverrides)
            .WithOne(a => a.Offer)
            .HasForeignKey(a => a.OfferId)
            .OnDelete(DeleteBehavior.Cascade);
    }

    private static void ConfigureOfferPictureEntity(ModelBuilder modelBuilder)
    {
        var pictureEntity = modelBuilder.Entity<OfferPicture>();
        
        pictureEntity.HasKey(p => p.Id);
        
        pictureEntity.Property(p => p.ImageData)
            .IsRequired();
        
        pictureEntity.Property(p => p.ContentType)
            .IsRequired()
            .HasMaxLength(100);
        
        pictureEntity.Property(p => p.FileName)
            .IsRequired()
            .HasMaxLength(255);
        
        pictureEntity.Property(p => p.FileSize)
            .IsRequired();
        
        pictureEntity.Property(p => p.DisplayOrder)
            .IsRequired();
        
        pictureEntity.Property(p => p.CreatedAt)
            .IsRequired();
        
        pictureEntity.HasIndex(p => new { p.OfferId, p.DisplayOrder })
            .IsUnique();
        pictureEntity.HasIndex(p => p.OfferId);
    }

    private static void ConfigureMessageEntity(ModelBuilder modelBuilder)
    {
        var messageEntity = modelBuilder.Entity<Message>();
        
        messageEntity.HasKey(m => m.Id);
        
        messageEntity.Property(m => m.Content)
            .IsRequired()
            .HasMaxLength(2000);
        
        messageEntity.Property(m => m.SentAt)
            .IsRequired();
        
        messageEntity.Property(m => m.IsRead)
            .IsRequired()
            .HasDefaultValue(false);
        
        messageEntity.HasOne(m => m.Sender)
            .WithMany()
            .HasForeignKey(m => m.SenderId)
            .OnDelete(DeleteBehavior.Restrict);
        
        messageEntity.HasOne(m => m.Recipient)
            .WithMany()
            .HasForeignKey(m => m.RecipientId)
            .OnDelete(DeleteBehavior.Restrict);
        
        messageEntity.HasOne(m => m.Offer)
            .WithMany()
            .HasForeignKey(m => m.OfferId)
            .OnDelete(DeleteBehavior.Cascade);
        
        messageEntity.HasIndex(m => m.SenderId);
        messageEntity.HasIndex(m => m.RecipientId);
        messageEntity.HasIndex(m => m.OfferId);
        messageEntity.HasIndex(m => m.SentAt);
        messageEntity.HasIndex(m => new { m.SenderId, m.RecipientId, m.OfferId });
    }

    private static void ConfigureBookingEntity(ModelBuilder modelBuilder)
    {
        var bookingEntity = modelBuilder.Entity<Booking>();

        bookingEntity.HasKey(b => b.Id);

        bookingEntity.Property(b => b.StartDate)
            .IsRequired();

        bookingEntity.Property(b => b.EndDate)
            .IsRequired();

        bookingEntity.Property(b => b.TotalPrice)
            .HasPrecision(10, 2)
            .IsRequired();

        bookingEntity.Property(b => b.DaysCount)
            .IsRequired();

        bookingEntity.Property(b => b.Status)
            .IsRequired()
            .HasDefaultValue(BookingStatus.Confirmed);

        bookingEntity.Property(b => b.CreatedAt)
            .IsRequired();


        bookingEntity.HasOne(b => b.Offer)
            .WithMany(o => o.Bookings)
            .HasForeignKey(b => b.OfferId)
            .OnDelete(DeleteBehavior.Cascade);

        bookingEntity.HasOne(b => b.Customer)
            .WithMany(u => u.CustomerBookings)
            .HasForeignKey(b => b.CustomerId)
            .OnDelete(DeleteBehavior.Restrict);

        // Indexes for performance
        bookingEntity.HasIndex(b => b.OfferId);
        bookingEntity.HasIndex(b => b.CustomerId);
        bookingEntity.HasIndex(b => new { b.OfferId, b.StartDate, b.EndDate });
        bookingEntity.HasIndex(b => b.Status);
        bookingEntity.HasIndex(b => b.CreatedAt);

        // Unique constraint to prevent overlapping bookings for same offer
        bookingEntity.HasIndex(b => new { b.OfferId, b.StartDate, b.EndDate })
            .HasDatabaseName("IX_Booking_Offer_DateRange");
    }

    private static void ConfigureAvailabilityOverrideEntity(ModelBuilder modelBuilder)
    {
        var availabilityEntity = modelBuilder.Entity<AvailabilityOverride>();

        availabilityEntity.HasKey(a => a.Id);

        availabilityEntity.Property(a => a.Date)
            .IsRequired();

        availabilityEntity.Property(a => a.IsAvailable)
            .IsRequired()
            .HasDefaultValue(true);

        availabilityEntity.Property(a => a.Reason)
            .HasMaxLength(500);

        availabilityEntity.Property(a => a.CreatedAt)
            .IsRequired();

        availabilityEntity.HasOne(a => a.Offer)
            .WithMany(o => o.AvailabilityOverrides)
            .HasForeignKey(a => a.OfferId)
            .OnDelete(DeleteBehavior.Cascade);

        // Indexes for performance
        availabilityEntity.HasIndex(a => a.OfferId);
        availabilityEntity.HasIndex(a => new { a.OfferId, a.Date });

        // Unique constraint: one override per offer per date
        availabilityEntity.HasIndex(a => new { a.OfferId, a.Date })
            .IsUnique()
            .HasDatabaseName("IX_AvailabilityOverride_Offer_Date_Unique");
    }
}