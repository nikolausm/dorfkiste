using DorfkisteBlazor.Application.Common.Interfaces;
using DorfkisteBlazor.Application.Common.Models;

namespace DorfkisteBlazor.Application.Features.Rentals.Commands;

/// <summary>
/// Command to delete a rental (soft delete)
/// </summary>
public class DeleteRentalCommand : ICommand<Result>
{
    public Guid Id { get; set; }
}