using Bogus;
using DorfkisteBlazor.Domain.Entities;

namespace DorfkisteBlazor.Domain.Tests.TestFixtures;

/// <summary>
/// Test data builder using Bogus for generating consistent test data
/// </summary>
public class TestDataBuilder
{
    private readonly Faker _faker = new();

    public UserBuilder User() => new(_faker);
    public ItemBuilder Item() => new(_faker);
    public CategoryBuilder Category() => new(_faker);
    public RentalBuilder Rental() => new(_faker);
    public ReviewBuilder Review() => new(_faker);
    public PaymentBuilder Payment() => new(_faker);
}

public class UserBuilder
{
    private readonly Faker<User> _faker;

    public UserBuilder(Faker faker)
    {
        _faker = new Faker<User>()
            .RuleFor(u => u.Id, f => f.Random.Guid())
            .RuleFor(u => u.Email, f => f.Internet.Email())
            .RuleFor(u => u.Name, f => f.Person.FullName)
            .RuleFor(u => u.AvatarUrl, f => f.Internet.Avatar())
            .RuleFor(u => u.Bio, f => f.Lorem.Paragraph())
            .RuleFor(u => u.Verified, f => false)
            .RuleFor(u => u.IsAdmin, f => false)
            .RuleFor(u => u.StripeCustomerId, f => f.Random.String2(20, "abcdefghijklmnopqrstuvwxyz0123456789"))
            .RuleFor(u => u.PaypalEmail, f => f.Internet.Email())
            .RuleFor(u => u.CreatedAt, f => f.Date.Past())
            .RuleFor(u => u.UpdatedAt, f => f.Date.Recent());
    }

    public UserBuilder WithEmail(string email)
    {
        _faker.RuleFor(u => u.Email, email);
        return this;
    }

    public UserBuilder WithName(string name)
    {
        _faker.RuleFor(u => u.Name, name);
        return this;
    }

    public UserBuilder AsAdmin()
    {
        _faker.RuleFor(u => u.IsAdmin, true);
        return this;
    }

    public UserBuilder AsVerified()
    {
        _faker.RuleFor(u => u.Verified, true);
        return this;
    }

    public UserBuilder WithId(Guid id)
    {
        _faker.RuleFor(u => u.Id, id);
        return this;
    }

    public User Build() => _faker.Generate();
    public List<User> BuildMany(int count) => _faker.Generate(count);
}

public class ItemBuilder
{
    private readonly Faker<Item> _faker;

    public ItemBuilder(Faker faker)
    {
        _faker = new Faker<Item>()
            .RuleFor(i => i.Id, f => f.Random.Guid())
            .RuleFor(i => i.Title, f => f.Commerce.ProductName())
            .RuleFor(i => i.Description, f => f.Commerce.ProductDescription())
            .RuleFor(i => i.Condition, f => f.PickRandom("neu", "sehr gut", "gut", "gebraucht"))
            .RuleFor(i => i.PricePerDay, f => f.Random.Decimal(10, 500))
            .RuleFor(i => i.PricePerHour, f => f.Random.Decimal(2, 50))
            .RuleFor(i => i.Deposit, f => f.Random.Decimal(50, 1000))
            .RuleFor(i => i.Available, f => true)
            .RuleFor(i => i.Location, f => f.Address.City())
            .RuleFor(i => i.Latitude, f => f.Address.Latitude())
            .RuleFor(i => i.Longitude, f => f.Address.Longitude())
            .RuleFor(i => i.DeliveryAvailable, f => false)
            .RuleFor(i => i.DeliveryFee, f => f.Random.Decimal(5, 50))
            .RuleFor(i => i.DeliveryRadius, f => f.Random.Double(5, 50))
            .RuleFor(i => i.PickupAvailable, f => true)
            .RuleFor(i => i.UserId, f => f.Random.Guid())
            .RuleFor(i => i.CategoryId, f => f.Random.Guid())
            .RuleFor(i => i.CreatedAt, f => f.Date.Past())
            .RuleFor(i => i.UpdatedAt, f => f.Date.Recent());
    }

    public ItemBuilder WithTitle(string title)
    {
        _faker.RuleFor(i => i.Title, title);
        return this;
    }

    public ItemBuilder WithUser(Guid userId)
    {
        _faker.RuleFor(i => i.UserId, userId);
        return this;
    }

    public ItemBuilder WithCategory(Guid categoryId)
    {
        _faker.RuleFor(i => i.CategoryId, categoryId);
        return this;
    }

    public ItemBuilder AsUnavailable()
    {
        _faker.RuleFor(i => i.Available, false);
        return this;
    }

    public ItemBuilder WithDelivery(decimal fee = 10m, double radius = 20.0)
    {
        _faker.RuleFor(i => i.DeliveryAvailable, true);
        _faker.RuleFor(i => i.DeliveryFee, fee);
        _faker.RuleFor(i => i.DeliveryRadius, radius);
        return this;
    }

    public ItemBuilder WithId(Guid id)
    {
        _faker.RuleFor(i => i.Id, id);
        return this;
    }

    public Item Build() => _faker.Generate();
    public List<Item> BuildMany(int count) => _faker.Generate(count);
}

public class CategoryBuilder
{
    private readonly Faker<Category> _faker;

    public CategoryBuilder(Faker faker)
    {
        _faker = new Faker<Category>()
            .RuleFor(c => c.Id, f => f.Random.Guid())
            .RuleFor(c => c.Name, f => f.Commerce.Categories(1).First())
            .RuleFor(c => c.Slug, (f, c) => c.Name.ToLower().Replace(" ", "-"))
            .RuleFor(c => c.Description, f => f.Lorem.Sentence())
            .RuleFor(c => c.IconUrl, f => f.Internet.Avatar())
            .RuleFor(c => c.CreatedAt, f => f.Date.Past())
            .RuleFor(c => c.UpdatedAt, f => f.Date.Recent());
    }

    public CategoryBuilder WithName(string name)
    {
        _faker.RuleFor(c => c.Name, name);
        _faker.RuleFor(c => c.Slug, name.ToLower().Replace(" ", "-"));
        return this;
    }

    public CategoryBuilder WithId(Guid id)
    {
        _faker.RuleFor(c => c.Id, id);
        return this;
    }

    public Category Build() => _faker.Generate();
    public List<Category> BuildMany(int count) => _faker.Generate(count);
}

public class RentalBuilder
{
    private readonly Faker<Rental> _faker;

    public RentalBuilder(Faker faker)
    {
        _faker = new Faker<Rental>()
            .RuleFor(r => r.Id, f => f.Random.Guid())
            .RuleFor(r => r.ItemId, f => f.Random.Guid())
            .RuleFor(r => r.OwnerId, f => f.Random.Guid())
            .RuleFor(r => r.RenterId, f => f.Random.Guid())
            .RuleFor(r => r.StartDate, f => f.Date.Future())
            .RuleFor(r => r.EndDate, (f, r) => r.StartDate.AddDays(f.Random.Int(1, 30)))
            .RuleFor(r => r.TotalPrice, f => f.Random.Decimal(50, 2000))
            .RuleFor(r => r.DepositPaid, f => f.Random.Decimal(50, 500))
            .RuleFor(r => r.PlatformFee, f => f.Random.Decimal(5, 200))
            .RuleFor(r => r.Status, f => f.PickRandom("pending", "confirmed", "active", "completed", "cancelled"))
            .RuleFor(r => r.PaymentStatus, f => f.PickRandom("pending", "paid", "refunded"))
            .RuleFor(r => r.PaymentMethod, f => f.PickRandom("stripe", "paypal"))
            .RuleFor(r => r.DeliveryRequested, f => f.Random.Bool())
            .RuleFor(r => r.DeliveryAddress, f => f.Address.FullAddress())
            .RuleFor(r => r.DeliveryFee, f => f.Random.Decimal(0, 50))
            .RuleFor(r => r.CreatedAt, f => f.Date.Past())
            .RuleFor(r => r.UpdatedAt, f => f.Date.Recent());
    }

    public RentalBuilder WithItem(Guid itemId)
    {
        _faker.RuleFor(r => r.ItemId, itemId);
        return this;
    }

    public RentalBuilder WithOwner(Guid ownerId)
    {
        _faker.RuleFor(r => r.OwnerId, ownerId);
        return this;
    }

    public RentalBuilder WithRenter(Guid renterId)
    {
        _faker.RuleFor(r => r.RenterId, renterId);
        return this;
    }

    public RentalBuilder WithStatus(string status)
    {
        _faker.RuleFor(r => r.Status, status);
        return this;
    }

    public RentalBuilder WithDates(DateTime startDate, DateTime endDate)
    {
        _faker.RuleFor(r => r.StartDate, startDate);
        _faker.RuleFor(r => r.EndDate, endDate);
        return this;
    }

    public Rental Build() => _faker.Generate();
    public List<Rental> BuildMany(int count) => _faker.Generate(count);
}

public class ReviewBuilder
{
    private readonly Faker<Review> _faker;

    public ReviewBuilder(Faker faker)
    {
        _faker = new Faker<Review>()
            .RuleFor(r => r.Id, f => f.Random.Guid())
            .RuleFor(r => r.RentalId, f => f.Random.Guid())
            .RuleFor(r => r.ReviewerId, f => f.Random.Guid())
            .RuleFor(r => r.RevieweeId, f => f.Random.Guid())
            .RuleFor(r => r.Rating, f => f.Random.Int(1, 5))
            .RuleFor(r => r.Comment, f => f.Lorem.Paragraph())
            .RuleFor(r => r.CreatedAt, f => f.Date.Past())
            .RuleFor(r => r.UpdatedAt, f => f.Date.Recent());
    }

    public ReviewBuilder WithRating(int rating)
    {
        _faker.RuleFor(r => r.Rating, rating);
        return this;
    }

    public ReviewBuilder WithRental(Guid rentalId)
    {
        _faker.RuleFor(r => r.RentalId, rentalId);
        return this;
    }

    public Review Build() => _faker.Generate();
    public List<Review> BuildMany(int count) => _faker.Generate(count);
}

public class PaymentBuilder
{
    private readonly Faker<Payment> _faker;

    public PaymentBuilder(Faker faker)
    {
        _faker = new Faker<Payment>()
            .RuleFor(p => p.Id, f => f.Random.Guid())
            .RuleFor(p => p.RentalId, f => f.Random.Guid())
            .RuleFor(p => p.UserId, f => f.Random.Guid())
            .RuleFor(p => p.Amount, f => f.Random.Decimal(10, 1000))
            .RuleFor(p => p.Currency, f => "EUR")
            .RuleFor(p => p.Status, f => f.PickRandom("pending", "completed", "failed", "refunded"))
            .RuleFor(p => p.PaymentMethod, f => f.PickRandom("stripe", "paypal"))
            .RuleFor(p => p.StripePaymentIntentId, f => f.Random.String2(20))
            .RuleFor(p => p.PaypalOrderId, f => f.Random.String2(15))
            .RuleFor(p => p.CreatedAt, f => f.Date.Past())
            .RuleFor(p => p.UpdatedAt, f => f.Date.Recent());
    }

    public PaymentBuilder WithAmount(decimal amount)
    {
        _faker.RuleFor(p => p.Amount, amount);
        return this;
    }

    public PaymentBuilder WithStatus(string status)
    {
        _faker.RuleFor(p => p.Status, status);
        return this;
    }

    public Payment Build() => _faker.Generate();
    public List<Payment> BuildMany(int count) => _faker.Generate(count);
}