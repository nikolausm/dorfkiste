using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using DorfkisteBlazor.Domain.Entities;
using DorfkisteBlazor.Infrastructure.Data;
using Microsoft.AspNetCore.Identity;
using DorfkisteBlazor.Infrastructure.Identity;

namespace DorfkisteBlazor.Infrastructure.Data.Seeding;

/// <summary>
/// Database seeding service for initializing test data
/// </summary>
public class DatabaseSeeder
{
    private readonly ApplicationDbContext _context;
    private readonly UserManager<ApplicationUser> _userManager;
    private readonly RoleManager<IdentityRole> _roleManager;
    private readonly ILogger<DatabaseSeeder> _logger;

    public DatabaseSeeder(
        ApplicationDbContext context,
        UserManager<ApplicationUser> userManager,
        RoleManager<IdentityRole> roleManager,
        ILogger<DatabaseSeeder> logger)
    {
        _context = context;
        _userManager = userManager;
        _roleManager = roleManager;
        _logger = logger;
    }

    /// <summary>
    /// Seeds all necessary data for the application
    /// </summary>
    public async Task SeedAsync()
    {
        try
        {
            _logger.LogInformation("Starting database seeding...");

            // Ensure database is created
            await _context.Database.EnsureCreatedAsync();

            // Seed in order due to dependencies
            await SeedRolesAsync();
            await SeedCategoriesAsync();
            await SeedUsersAsync();
            await SeedPlatformSettingsAsync();
            await SeedItemsAsync();
            await SeedRentalsAsync();

            await _context.SaveChangesAsync();
            _logger.LogInformation("Database seeding completed successfully");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "An error occurred while seeding the database");
            throw;
        }
    }

    /// <summary>
    /// Seeds user roles
    /// </summary>
    private async Task SeedRolesAsync()
    {
        var roles = new[] { "Admin", "User", "Moderator" };

        foreach (var role in roles)
        {
            if (!await _roleManager.RoleExistsAsync(role))
            {
                await _roleManager.CreateAsync(new IdentityRole(role));
                _logger.LogInformation("Created role: {Role}", role);
            }
        }
    }

    /// <summary>
    /// Seeds categories matching the original app
    /// </summary>
    private async Task SeedCategoriesAsync()
    {
        if (await _context.Categories.AnyAsync())
        {
            _logger.LogInformation("Categories already exist, skipping seed");
            return;
        }

        var categories = new List<Category>
        {
            new Category
            {
                Id = Guid.NewGuid(),
                Name = "Electronics",
                Slug = "electronics",
                Description = "Computers, phones, cameras, and other electronic devices",
                Icon = "computer",
                CreatedAt = DateTime.UtcNow
            },
            new Category
            {
                Id = Guid.NewGuid(),
                Name = "Tools & Equipment",
                Slug = "tools-equipment",
                Description = "Power tools, hand tools, construction equipment",
                Icon = "tools",
                CreatedAt = DateTime.UtcNow
            },
            new Category
            {
                Id = Guid.NewGuid(),
                Name = "Sports & Outdoor",
                Slug = "sports-outdoor",
                Description = "Sports equipment, camping gear, outdoor accessories",
                Icon = "sport",
                CreatedAt = DateTime.UtcNow
            },
            new Category
            {
                Id = Guid.NewGuid(),
                Name = "Home & Garden",
                Slug = "home-garden",
                Description = "Furniture, appliances, gardening tools",
                Icon = "home",
                CreatedAt = DateTime.UtcNow
            },
            new Category
            {
                Id = Guid.NewGuid(),
                Name = "Vehicles",
                Slug = "vehicles",
                Description = "Cars, motorcycles, bicycles, and other vehicles",
                Icon = "car",
                CreatedAt = DateTime.UtcNow
            },
            new Category
            {
                Id = Guid.NewGuid(),
                Name = "Party & Events",
                Slug = "party-events",
                Description = "Party supplies, event equipment, decorations",
                Icon = "party",
                CreatedAt = DateTime.UtcNow
            },
            new Category
            {
                Id = Guid.NewGuid(),
                Name = "Books & Media",
                Slug = "books-media",
                Description = "Books, movies, games, music equipment",
                Icon = "book",
                CreatedAt = DateTime.UtcNow
            },
            new Category
            {
                Id = Guid.NewGuid(),
                Name = "Fashion & Accessories",
                Slug = "fashion-accessories",
                Description = "Clothing, shoes, jewelry, bags",
                Icon = "fashion",
                CreatedAt = DateTime.UtcNow
            }
        };

        await _context.Categories.AddRangeAsync(categories);
        _logger.LogInformation("Seeded {Count} categories", categories.Count);
    }

    /// <summary>
    /// Seeds test users with different roles
    /// </summary>
    private async Task SeedUsersAsync()
    {
        if (await _context.Users.AnyAsync())
        {
            _logger.LogInformation("Users already exist, skipping seed");
            return;
        }

        // Admin user
        var adminUser = new ApplicationUser
        {
            Id = Guid.NewGuid().ToString(),
            UserName = "admin@dorfkiste.com",
            Email = "admin@dorfkiste.com",
            EmailConfirmed = true
        };

        var adminResult = await _userManager.CreateAsync(adminUser, "Admin123!");
        if (adminResult.Succeeded)
        {
            await _userManager.AddToRoleAsync(adminUser, "Admin");
            
            // Create corresponding domain user
            var domainAdminUser = new User
            {
                Id = Guid.Parse(adminUser.Id),
                Email = adminUser.Email,
                Name = "System Administrator",
                Verified = true,
                IsAdmin = true,
                CreatedAt = DateTime.UtcNow
            };
            
            await _context.Users.AddAsync(domainAdminUser);
            _logger.LogInformation("Created admin user");
        }

        // Regular test users
        var testUsers = new[]
        {
            new { Email = "john.doe@example.com", Name = "John Doe", Bio = "Friendly neighbor, loves sharing tools and equipment" },
            new { Email = "jane.smith@example.com", Name = "Jane Smith", Bio = "Tech enthusiast and outdoor adventure lover" },
            new { Email = "mike.wilson@example.com", Name = "Mike Wilson", Bio = "DIY expert and weekend warrior" },
            new { Email = "sarah.brown@example.com", Name = "Sarah Brown", Bio = "Event planner and party supply expert" },
            new { Email = "alex.johnson@example.com", Name = "Alex Johnson", Bio = "Sports lover and equipment collector" }
        };

        foreach (var userData in testUsers)
        {
            var identityUser = new ApplicationUser
            {
                Id = Guid.NewGuid().ToString(),
                UserName = userData.Email,
                Email = userData.Email,
                EmailConfirmed = true
            };

            var result = await _userManager.CreateAsync(identityUser, "User123!");
            if (result.Succeeded)
            {
                await _userManager.AddToRoleAsync(identityUser, "User");
                
                var domainUser = new User
                {
                    Id = Guid.Parse(identityUser.Id),
                    Email = userData.Email,
                    Name = userData.Name,
                    Bio = userData.Bio,
                    Verified = true,
                    CreatedAt = DateTime.UtcNow
                };
                
                await _context.Users.AddAsync(domainUser);
            }
        }

        _logger.LogInformation("Seeded {Count} test users", testUsers.Length + 1);
    }

    /// <summary>
    /// Seeds platform settings
    /// </summary>
    private async Task SeedPlatformSettingsAsync()
    {
        if (await _context.PlatformSettings.AnyAsync())
        {
            _logger.LogInformation("Platform settings already exist, skipping seed");
            return;
        }

        var settings = new PlatformSettings
        {
            Id = Guid.NewGuid(),
            PlatformFeePercentage = 10m,
            PaypalMode = "sandbox",
            CreatedAt = DateTime.UtcNow
        };

        await _context.PlatformSettings.AddAsync(settings);
        _logger.LogInformation("Seeded platform settings");
    }

    /// <summary>
    /// Seeds sample items for demonstration
    /// </summary>
    private async Task SeedItemsAsync()
    {
        if (await _context.Items.AnyAsync())
        {
            _logger.LogInformation("Items already exist, skipping seed");
            return;
        }

        var categories = await _context.Categories.ToListAsync();
        var users = await _context.Users.Where(u => !u.IsAdmin).ToListAsync();

        if (!categories.Any() || !users.Any())
        {
            _logger.LogWarning("Cannot seed items: missing categories or users");
            return;
        }

        var random = new Random();
        var items = new List<Item>();

        // Electronics items
        var electronicsCategory = categories.First(c => c.Slug == "electronics");
        items.AddRange(new[]
        {
            new Item
            {
                Id = Guid.NewGuid(),
                Title = "Canon EOS R5 Camera",
                Description = "Professional mirrorless camera with 45MP sensor, perfect for photography and videography",
                Condition = "sehr gut",
                PricePerDay = 89.99m,
                Deposit = 200m,
                Available = true,
                Location = "München, Bayern",
                Latitude = 48.1351,
                Longitude = 11.5820,
                DeliveryAvailable = true,
                DeliveryFee = 15m,
                DeliveryRadius = 50,
                PickupAvailable = true,
                UserId = users[random.Next(users.Count)].Id,
                CategoryId = electronicsCategory.Id,
                CreatedAt = DateTime.UtcNow
            },
            new Item
            {
                Id = Guid.NewGuid(),
                Title = "MacBook Pro 16\" M1",
                Description = "High-performance laptop for creative professionals, includes charger and case",
                Condition = "sehr gut",
                PricePerDay = 45.99m,
                Deposit = 500m,
                Available = true,
                Location = "Hamburg, Hamburg",
                Latitude = 53.5511,
                Longitude = 9.9937,
                DeliveryAvailable = false,
                PickupAvailable = true,
                UserId = users[random.Next(users.Count)].Id,
                CategoryId = electronicsCategory.Id,
                CreatedAt = DateTime.UtcNow
            }
        });

        // Tools & Equipment items
        var toolsCategory = categories.First(c => c.Slug == "tools-equipment");
        items.AddRange(new[]
        {
            new Item
            {
                Id = Guid.NewGuid(),
                Title = "Bosch Professional Hammer Drill",
                Description = "Powerful rotary hammer drill with SDS-plus chuck, includes drill bits set",
                Condition = "gut",
                PricePerDay = 25.99m,
                PricePerHour = 5.99m,
                Deposit = 100m,
                Available = true,
                Location = "Berlin, Berlin",
                Latitude = 52.5200,
                Longitude = 13.4050,
                DeliveryAvailable = true,
                DeliveryFee = 10m,
                DeliveryRadius = 25,
                PickupAvailable = true,
                UserId = users[random.Next(users.Count)].Id,
                CategoryId = toolsCategory.Id,
                CreatedAt = DateTime.UtcNow
            },
            new Item
            {
                Id = Guid.NewGuid(),
                Title = "Circular Saw with Guide Rail",
                Description = "Professional circular saw with 3m guide rail system, perfect for precise cuts",
                Condition = "sehr gut",
                PricePerDay = 35.99m,
                Deposit = 150m,
                Available = true,
                Location = "Köln, Nordrhein-Westfalen",
                Latitude = 50.9375,
                Longitude = 6.9603,
                DeliveryAvailable = true,
                DeliveryFee = 12m,
                DeliveryRadius = 30,
                PickupAvailable = true,
                UserId = users[random.Next(users.Count)].Id,
                CategoryId = toolsCategory.Id,
                CreatedAt = DateTime.UtcNow
            }
        });

        // Sports & Outdoor items
        var sportsCategory = categories.First(c => c.Slug == "sports-outdoor");
        items.AddRange(new[]
        {
            new Item
            {
                Id = Guid.NewGuid(),
                Title = "Mountain Bike - Trek X-Caliber 8",
                Description = "29er hardtail mountain bike, perfect for trail riding and cross-country adventures",
                Condition = "gut",
                PricePerDay = 29.99m,
                Deposit = 300m,
                Available = true,
                Location = "Dresden, Sachsen",
                Latitude = 51.0504,
                Longitude = 13.7373,
                DeliveryAvailable = false,
                PickupAvailable = true,
                UserId = users[random.Next(users.Count)].Id,
                CategoryId = sportsCategory.Id,
                CreatedAt = DateTime.UtcNow
            },
            new Item
            {
                Id = Guid.NewGuid(),
                Title = "4-Person Camping Tent",
                Description = "Waterproof family camping tent with easy setup, includes footprint and guy-lines",
                Condition = "sehr gut",
                PricePerDay = 19.99m,
                Deposit = 80m,
                Available = true,
                Location = "Stuttgart, Baden-Württemberg",
                Latitude = 48.7758,
                Longitude = 9.1829,
                DeliveryAvailable = true,
                DeliveryFee = 8m,
                DeliveryRadius = 40,
                PickupAvailable = true,
                UserId = users[random.Next(users.Count)].Id,
                CategoryId = sportsCategory.Id,
                CreatedAt = DateTime.UtcNow
            }
        });

        // Party & Events items
        var partyCategory = categories.First(c => c.Slug == "party-events");
        items.AddRange(new[]
        {
            new Item
            {
                Id = Guid.NewGuid(),
                Title = "Professional PA Sound System",
                Description = "Complete PA system with speakers, mixer, and microphones for events up to 200 people",
                Condition = "sehr gut",
                PricePerDay = 79.99m,
                Deposit = 400m,
                Available = true,
                Location = "Frankfurt am Main, Hessen",
                Latitude = 50.1109,
                Longitude = 8.6821,
                DeliveryAvailable = true,
                DeliveryFee = 25m,
                DeliveryRadius = 60,
                PickupAvailable = true,
                UserId = users[random.Next(users.Count)].Id,
                CategoryId = partyCategory.Id,
                CreatedAt = DateTime.UtcNow
            }
        });

        await _context.Items.AddRangeAsync(items);
        _logger.LogInformation("Seeded {Count} sample items", items.Count);
    }

    /// <summary>
    /// Seeds sample rental data
    /// </summary>
    private async Task SeedRentalsAsync()
    {
        if (await _context.Rentals.AnyAsync())
        {
            _logger.LogInformation("Rentals already exist, skipping seed");
            return;
        }

        var items = await _context.Items.Include(i => i.User).ToListAsync();
        var users = await _context.Users.Where(u => !u.IsAdmin).ToListAsync();

        if (!items.Any() || users.Count < 2)
        {
            _logger.LogWarning("Cannot seed rentals: insufficient items or users");
            return;
        }

        var random = new Random();
        var rentals = new List<Rental>();

        // Create some sample rentals
        for (int i = 0; i < Math.Min(5, items.Count); i++)
        {
            var item = items[i];
            var renter = users.Where(u => u.Id != item.UserId).Skip(random.Next(users.Count - 1)).First();
            
            var startDate = DateTime.UtcNow.AddDays(-random.Next(30, 90));
            var endDate = startDate.AddDays(random.Next(3, 14));

            var rental = new Rental
            {
                Id = Guid.NewGuid(),
                StartDate = startDate,
                EndDate = endDate,
                TotalPrice = (item.PricePerDay ?? 20m) * (endDate - startDate).Days,
                DepositPaid = item.Deposit ?? 50m,
                PlatformFee = 0m,
                Status = random.Next(4) switch
                {
                    0 => "completed",
                    1 => "active",
                    2 => "confirmed",
                    _ => "pending"
                },
                PaymentStatus = "paid",
                ItemId = item.Id,
                OwnerId = item.UserId,
                RenterId = renter.Id,
                CreatedAt = startDate.AddDays(-1)
            };

            rentals.Add(rental);
        }

        await _context.Rentals.AddRangeAsync(rentals);
        _logger.LogInformation("Seeded {Count} sample rentals", rentals.Count);
    }
}