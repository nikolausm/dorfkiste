using MediatR;

namespace DorfkisteBlazor.Application.Common.Interfaces;

/// <summary>
/// Marker interface for queries
/// </summary>
/// <typeparam name="TResponse">The type of data returned</typeparam>
public interface IQuery<out TResponse> : IRequest<TResponse>
{
}