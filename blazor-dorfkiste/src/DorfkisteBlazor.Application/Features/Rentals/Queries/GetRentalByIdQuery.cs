using DorfkisteBlazor.Application.Common.Interfaces;
using DorfkisteBlazor.Application.Common.Models;
using DorfkisteBlazor.Application.Features.Rentals.DTOs;

namespace DorfkisteBlazor.Application.Features.Rentals.Queries;

/// <summary>
/// Query to get a specific rental by ID
/// </summary>
public class GetRentalByIdQuery : IQuery<Result<RentalDto?>>
{
    public Guid Id { get; set; }
}