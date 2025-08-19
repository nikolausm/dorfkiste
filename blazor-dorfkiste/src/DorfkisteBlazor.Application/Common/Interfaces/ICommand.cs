using MediatR;

namespace DorfkisteBlazor.Application.Common.Interfaces;

/// <summary>
/// Marker interface for commands that don't return a value
/// </summary>
public interface ICommand : IRequest
{
}

/// <summary>
/// Marker interface for commands that return a value
/// </summary>
/// <typeparam name="TResponse">The type of value returned</typeparam>
public interface ICommand<out TResponse> : IRequest<TResponse>
{
}