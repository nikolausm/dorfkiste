using DorfkisteBlazor.Application.Common.Interfaces;
using DorfkisteBlazor.Application.Common.Models;
using DorfkisteBlazor.Application.Features.Users.DTOs;
using DorfkisteBlazor.Domain.Interfaces;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;

namespace DorfkisteBlazor.Application.Features.Users.Queries;

/// <summary>
/// Handler for GetUsersQuery
/// </summary>
public class GetUsersQueryHandler : IQueryHandler<GetUsersQuery, Result<UsersResponse>>
{
    private readonly IRepository<Domain.Entities.User> _userRepository;
    private readonly ILogger<GetUsersQueryHandler> _logger;

    public GetUsersQueryHandler(
        IRepository<Domain.Entities.User> userRepository,
        ILogger<GetUsersQueryHandler> logger)
    {
        _userRepository = userRepository;
        _logger = logger;
    }

    public async Task<Result<UsersResponse>> Handle(GetUsersQuery request, CancellationToken cancellationToken)
    {
        try
        {
            var query = _userRepository.GetQueryable();

            // Apply filters
            if (!string.IsNullOrWhiteSpace(request.SearchTerm))
            {
                var searchTerm = request.SearchTerm.ToLower();
                query = query.Where(u => 
                    u.Email.ToLower().Contains(searchTerm) ||
                    (u.Name != null && u.Name.ToLower().Contains(searchTerm)));
            }

            if (request.Verified.HasValue)
            {
                query = query.Where(u => u.Verified == request.Verified.Value);
            }

            if (request.IsAdmin.HasValue)
            {
                query = query.Where(u => u.IsAdmin == request.IsAdmin.Value);
            }

            // Apply sorting
            query = request.SortBy?.ToLower() switch
            {
                "name" => request.SortDirection?.ToLower() == "desc" 
                    ? query.OrderByDescending(u => u.Name)
                    : query.OrderBy(u => u.Name),
                "email" => request.SortDirection?.ToLower() == "desc"
                    ? query.OrderByDescending(u => u.Email)
                    : query.OrderBy(u => u.Email),
                "verified" => request.SortDirection?.ToLower() == "desc"
                    ? query.OrderByDescending(u => u.Verified)
                    : query.OrderBy(u => u.Verified),
                _ => request.SortDirection?.ToLower() == "desc"
                    ? query.OrderByDescending(u => u.CreatedAt)
                    : query.OrderBy(u => u.CreatedAt)
            };

            // Get total count
            var totalCount = await query.CountAsync(cancellationToken);

            // Apply pagination
            var users = await query
                .Skip((request.Page - 1) * request.PageSize)
                .Take(request.PageSize)
                .Select(u => new UserDto
                {
                    Id = u.Id,
                    Email = u.Email,
                    Name = u.Name,
                    AvatarUrl = u.AvatarUrl,
                    Bio = u.Bio,
                    Verified = u.Verified,
                    IsAdmin = u.IsAdmin,
                    StripeCustomerId = u.StripeCustomerId,
                    PaypalEmail = u.PaypalEmail,
                    CreatedAt = u.CreatedAt,
                    UpdatedAt = u.UpdatedAt,
                    CreatedBy = u.CreatedBy,
                    UpdatedBy = u.UpdatedBy
                })
                .ToListAsync(cancellationToken);

            var totalPages = (int)Math.Ceiling((double)totalCount / request.PageSize);

            var response = new UsersResponse
            {
                Users = users,
                TotalCount = totalCount,
                Page = request.Page,
                PageSize = request.PageSize,
                TotalPages = totalPages
            };

            return Result.Success(response);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error occurred while getting users");
            return Result.Failure<UsersResponse>("An error occurred while retrieving users");
        }
    }
}