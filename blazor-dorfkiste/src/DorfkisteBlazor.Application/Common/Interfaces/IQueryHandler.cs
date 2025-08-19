using MediatR;

namespace DorfkisteBlazor.Application.Common.Interfaces;

/// <summary>
/// Interface for query handlers
/// </summary>
/// <typeparam name="TQuery">The query type</typeparam>
/// <typeparam name="TResponse">The response type</typeparam>
public interface IQueryHandler<in TQuery, TResponse> : IRequestHandler<TQuery, TResponse>
    where TQuery : IQuery<TResponse>
{
}