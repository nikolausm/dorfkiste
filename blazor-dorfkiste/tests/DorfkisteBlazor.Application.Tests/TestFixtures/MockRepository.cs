using System;
using System.Collections.Generic;
using System.Linq;
using System.Linq.Expressions;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using Moq;
using DorfkisteBlazor.Domain.Interfaces;
using DorfkisteBlazor.Domain.Common;

namespace DorfkisteBlazor.Application.Tests.TestFixtures;

/// <summary>
/// Mock repository factory for creating test repositories with in-memory data
/// </summary>
public class MockRepositoryFactory
{
    public Mock<IRepository<T>> CreateMockRepository<T>(List<T> data) where T : BaseEntity
    {
        var mockRepository = new Mock<IRepository<T>>();
        var queryableData = data.AsQueryable();

        // Setup GetQueryable
        mockRepository.Setup(r => r.GetQueryable())
            .Returns(queryableData);

        // Setup GetByIdAsync
        mockRepository.Setup(r => r.GetByIdAsync(It.IsAny<Guid>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync((Guid id, CancellationToken ct) => data.FirstOrDefault(x => x.Id == id));

        // Setup AddAsync
        mockRepository.Setup(r => r.AddAsync(It.IsAny<T>(), It.IsAny<CancellationToken>()))
            .Callback<T, CancellationToken>((entity, ct) =>
            {
                if (entity.Id == Guid.Empty)
                    entity.Id = Guid.NewGuid();
                data.Add(entity);
            })
            .Returns(Task.CompletedTask);

        // Setup UpdateAsync
        mockRepository.Setup(r => r.UpdateAsync(It.IsAny<T>(), It.IsAny<CancellationToken>()))
            .Callback<T, CancellationToken>((entity, ct) =>
            {
                var existingEntity = data.FirstOrDefault(x => x.Id == entity.Id);
                if (existingEntity != null)
                {
                    var index = data.IndexOf(existingEntity);
                    data[index] = entity;
                }
            })
            .Returns(Task.CompletedTask);

        // Setup DeleteAsync
        mockRepository.Setup(r => r.DeleteAsync(It.IsAny<Guid>(), It.IsAny<CancellationToken>()))
            .Callback<Guid, CancellationToken>((id, ct) =>
            {
                var entity = data.FirstOrDefault(x => x.Id == id);
                if (entity != null)
                    data.Remove(entity);
            })
            .Returns(Task.CompletedTask);

        // Setup GetAllAsync
        mockRepository.Setup(r => r.GetAllAsync(It.IsAny<CancellationToken>()))
            .ReturnsAsync(data);

        // Setup FindAsync
        mockRepository.Setup(r => r.FindAsync(It.IsAny<Expression<Func<T, bool>>>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync((Expression<Func<T, bool>> predicate, CancellationToken ct) =>
            {
                return data.Where(predicate.Compile()).ToList();
            });

        // Setup FirstOrDefaultAsync
        mockRepository.Setup(r => r.FirstOrDefaultAsync(It.IsAny<Expression<Func<T, bool>>>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync((Expression<Func<T, bool>> predicate, CancellationToken ct) =>
            {
                return data.FirstOrDefault(predicate.Compile());
            });

        return mockRepository;
    }

    public Mock<IUnitOfWork> CreateMockUnitOfWork()
    {
        var mockUnitOfWork = new Mock<IUnitOfWork>();

        mockUnitOfWork.Setup(u => u.SaveChangesAsync(It.IsAny<CancellationToken>()))
            .ReturnsAsync(1);

        return mockUnitOfWork;
    }
}

/// <summary>
/// In-memory test context for integration testing with Entity Framework
/// </summary>
public class InMemoryTestContext
{
    public static DbContextOptions<T> CreateOptions<T>() where T : DbContext
    {
        return new DbContextOptionsBuilder<T>()
            .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
            .Options;
    }
}