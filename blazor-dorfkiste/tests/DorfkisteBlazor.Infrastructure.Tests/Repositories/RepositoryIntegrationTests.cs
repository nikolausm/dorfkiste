using DorfkisteBlazor.Domain.Entities;
using DorfkisteBlazor.Infrastructure.Data;
using DorfkisteBlazor.Infrastructure.Repositories;
using FluentAssertions;
using Microsoft.EntityFrameworkCore;
using NUnit.Framework;
using Testcontainers.PostgreSql;

namespace DorfkisteBlazor.Infrastructure.Tests.Repositories;

/// <summary>
/// Integration tests for repository implementations using test containers
/// </summary>
[TestFixture]
public class RepositoryIntegrationTests
{
    private PostgreSqlContainer _postgreSqlContainer = null!;
    private ApplicationDbContext _context = null!;
    private Repository<Item> _itemRepository = null!;
    private Repository<User> _userRepository = null!;
    private UnitOfWork _unitOfWork = null!;

    [OneTimeSetUp]
    public async Task OneTimeSetUp()
    {
        // Start PostgreSQL test container
        _postgreSqlContainer = new PostgreSqlBuilder()
            .WithImage("postgres:15-alpine")
            .WithDatabase("testdb")
            .WithUsername("testuser")
            .WithPassword("testpass")
            .WithCleanUp(true)
            .Build();

        await _postgreSqlContainer.StartAsync();
    }

    [OneTimeTearDown]
    public async Task OneTimeTearDown()
    {
        await _postgreSqlContainer.StopAsync();
        await _postgreSqlContainer.DisposeAsync();
    }

    [SetUp]
    public async Task SetUp()
    {
        var options = new DbContextOptionsBuilder<ApplicationDbContext>()
            .UseNpgsql(_postgreSqlContainer.GetConnectionString())
            .Options;

        _context = new ApplicationDbContext(options);
        await _context.Database.EnsureCreatedAsync();

        _itemRepository = new Repository<Item>(_context);
        _userRepository = new Repository<User>(_context);
        _unitOfWork = new UnitOfWork(_context);

        // Seed test data
        await SeedTestDataAsync();
    }

    [TearDown]
    public async Task TearDown()
    {
        await _context.Database.EnsureDeletedAsync();
        await _context.DisposeAsync();
    }

    [Test]
    public async Task Repository_AddAsync_ShouldAddEntityToDatabase()
    {
        // Arrange
        var newItem = new Item
        {
            Title = "Test Item",
            Description = "Test Description",
            Condition = "neu",
            PricePerDay = 25.00m,
            Location = "Test Location",
            UserId = Guid.NewGuid(),
            CategoryId = Guid.NewGuid()
        };

        // Act
        await _itemRepository.AddAsync(newItem);
        await _unitOfWork.SaveChangesAsync();

        // Assert
        var retrievedItem = await _itemRepository.GetByIdAsync(newItem.Id);
        retrievedItem.Should().NotBeNull();
        retrievedItem!.Title.Should().Be("Test Item");
        retrievedItem.Description.Should().Be("Test Description");
    }

    [Test]
    public async Task Repository_UpdateAsync_ShouldUpdateEntityInDatabase()
    {
        // Arrange
        var existingItem = await _itemRepository.FirstOrDefaultAsync(i => i.Title.Contains("Test"));
        existingItem.Should().NotBeNull();

        var updatedTitle = "Updated Test Item";
        existingItem!.Title = updatedTitle;

        // Act
        await _itemRepository.UpdateAsync(existingItem);
        await _unitOfWork.SaveChangesAsync();

        // Assert
        var retrievedItem = await _itemRepository.GetByIdAsync(existingItem.Id);
        retrievedItem.Should().NotBeNull();
        retrievedItem!.Title.Should().Be(updatedTitle);
    }

    [Test]
    public async Task Repository_DeleteAsync_ShouldRemoveEntityFromDatabase()
    {
        // Arrange
        var existingItem = await _itemRepository.FirstOrDefaultAsync(i => i.Title.Contains("Test"));
        existingItem.Should().NotBeNull();

        // Act
        await _itemRepository.DeleteAsync(existingItem!.Id);
        await _unitOfWork.SaveChangesAsync();

        // Assert
        var retrievedItem = await _itemRepository.GetByIdAsync(existingItem.Id);
        retrievedItem.Should().BeNull();
    }

    [Test]
    public async Task Repository_GetQueryable_ShouldSupportLinqQueries()
    {
        // Act
        var items = await _itemRepository.GetQueryable()
            .Where(i => i.Available)
            .OrderBy(i => i.Title)
            .ToListAsync();

        // Assert
        items.Should().NotBeEmpty();
        items.Should().OnlyContain(i => i.Available);
        items.Should().BeInAscendingOrder(i => i.Title);
    }

    [Test]
    public async Task Repository_FindAsync_ShouldReturnMatchingEntities()
    {
        // Act
        var availableItems = await _itemRepository.FindAsync(i => i.Available);

        // Assert
        availableItems.Should().NotBeEmpty();
        availableItems.Should().OnlyContain(i => i.Available);
    }

    [Test]
    public async Task Repository_FirstOrDefaultAsync_ShouldReturnFirstMatchingEntity()
    {
        // Act
        var firstItem = await _itemRepository.FirstOrDefaultAsync(i => i.Available);

        // Assert
        firstItem.Should().NotBeNull();
        firstItem!.Available.Should().BeTrue();
    }

    [Test]
    public async Task Repository_GetAllAsync_ShouldReturnAllEntities()
    {
        // Act
        var allItems = await _itemRepository.GetAllAsync();

        // Assert
        allItems.Should().NotBeEmpty();
        allItems.Should().HaveCountGreaterOrEqualTo(3); // We seed 3 items
    }

    [Test]
    public async Task UnitOfWork_SaveChangesAsync_ShouldCommitAllChanges()
    {
        // Arrange
        var user = new User { Email = "test@unitofwork.com", Name = "UoW Test User" };
        var item = new Item
        {
            Title = "UoW Test Item",
            Condition = "neu",
            Location = "UoW Location",
            UserId = user.Id,
            CategoryId = Guid.NewGuid()
        };

        await _userRepository.AddAsync(user);
        await _itemRepository.AddAsync(item);

        // Act
        var savedChanges = await _unitOfWork.SaveChangesAsync();

        // Assert
        savedChanges.Should().BeGreaterThan(0);

        var savedUser = await _userRepository.GetByIdAsync(user.Id);
        var savedItem = await _itemRepository.GetByIdAsync(item.Id);

        savedUser.Should().NotBeNull();
        savedItem.Should().NotBeNull();
    }

    [Test]
    public async Task Repository_WithIncludes_ShouldLoadRelatedEntities()
    {
        // Act
        var itemsWithUsers = await _itemRepository.GetQueryable()
            .Include(i => i.User)
            .Where(i => i.User != null)
            .ToListAsync();

        // Assert
        itemsWithUsers.Should().NotBeEmpty();
        itemsWithUsers.Should().OnlyContain(i => i.User != null);
    }

    [Test]
    public async Task Repository_ConcurrentAccess_ShouldHandleCorrectly()
    {
        // Arrange
        var tasks = new List<Task>();
        var itemsToAdd = 10;

        // Act
        for (int i = 0; i < itemsToAdd; i++)
        {
            var index = i;
            tasks.Add(Task.Run(async () =>
            {
                var item = new Item
                {
                    Title = $"Concurrent Item {index}",
                    Condition = "neu",
                    Location = "Concurrent Location",
                    UserId = Guid.NewGuid(),
                    CategoryId = Guid.NewGuid()
                };

                await _itemRepository.AddAsync(item);
            }));
        }

        await Task.WhenAll(tasks);
        await _unitOfWork.SaveChangesAsync();

        // Assert
        var concurrentItems = await _itemRepository.FindAsync(i => i.Title.StartsWith("Concurrent Item"));
        concurrentItems.Should().HaveCount(itemsToAdd);
    }

    [Test]
    public async Task Repository_LargeDataSet_ShouldHandleEfficiently()
    {
        // Arrange
        var largeDataSet = new List<Item>();
        for (int i = 0; i < 1000; i++)
        {
            largeDataSet.Add(new Item
            {
                Title = $"Large Dataset Item {i}",
                Condition = "neu",
                Location = "Large Dataset Location",
                Available = i % 2 == 0,
                UserId = Guid.NewGuid(),
                CategoryId = Guid.NewGuid()
            });
        }

        // Act
        foreach (var item in largeDataSet)
        {
            await _itemRepository.AddAsync(item);
        }
        await _unitOfWork.SaveChangesAsync();

        // Assert
        var availableCount = await _itemRepository.GetQueryable()
            .Where(i => i.Available && i.Title.StartsWith("Large Dataset"))
            .CountAsync();

        availableCount.Should().Be(500); // Half should be available
    }

    [Test]
    public async Task Repository_Transaction_ShouldRollbackOnError()
    {
        // Arrange
        var initialCount = await _itemRepository.GetQueryable().CountAsync();

        // Act & Assert
        await FluentActions.Invoking(async () =>
        {
            using var transaction = await _context.Database.BeginTransactionAsync();
            
            var validItem = new Item
            {
                Title = "Valid Item",
                Condition = "neu",
                Location = "Valid Location",
                UserId = Guid.NewGuid(),
                CategoryId = Guid.NewGuid()
            };

            await _itemRepository.AddAsync(validItem);
            await _unitOfWork.SaveChangesAsync();

            // This should cause an error (invalid foreign key)
            var invalidItem = new Item
            {
                Title = "Invalid Item",
                Condition = "neu",
                Location = "Invalid Location",
                UserId = Guid.Empty, // Invalid foreign key
                CategoryId = Guid.NewGuid()
            };

            await _itemRepository.AddAsync(invalidItem);
            await _unitOfWork.SaveChangesAsync();

            await transaction.CommitAsync();
        }).Should().ThrowAsync<Exception>();

        // Verify rollback
        var finalCount = await _itemRepository.GetQueryable().CountAsync();
        finalCount.Should().Be(initialCount);
    }

    private async Task SeedTestDataAsync()
    {
        var testUser = new User
        {
            Email = "test@example.com",
            Name = "Test User",
            Verified = true
        };

        var testCategory = new Category
        {
            Name = "Test Category",
            Slug = "test-category",
            Description = "Test category for integration tests"
        };

        await _userRepository.AddAsync(testUser);
        _context.Categories.Add(testCategory);

        var testItems = new[]
        {
            new Item
            {
                Title = "Test Item 1",
                Description = "First test item",
                Condition = "neu",
                PricePerDay = 25.00m,
                Available = true,
                Location = "Test Location 1",
                UserId = testUser.Id,
                CategoryId = testCategory.Id
            },
            new Item
            {
                Title = "Test Item 2",
                Description = "Second test item",
                Condition = "sehr gut",
                PricePerDay = 35.00m,
                Available = true,
                Location = "Test Location 2",
                UserId = testUser.Id,
                CategoryId = testCategory.Id
            },
            new Item
            {
                Title = "Test Item 3",
                Description = "Third test item",
                Condition = "gut",
                PricePerDay = 20.00m,
                Available = false,
                Location = "Test Location 3",
                UserId = testUser.Id,
                CategoryId = testCategory.Id
            }
        };

        foreach (var item in testItems)
        {
            await _itemRepository.AddAsync(item);
        }

        await _unitOfWork.SaveChangesAsync();
    }
}