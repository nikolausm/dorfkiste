namespace DorfkisteBlazor.Application.Common.Models;

/// <summary>
/// Represents the result of an operation with support for success/failure states
/// </summary>
public class Result
{
    public bool IsSuccess { get; }
    public bool IsFailure => !IsSuccess;
    public string Error { get; }
    public string[] Errors { get; }

    protected Result(bool isSuccess, string error)
    {
        if (isSuccess && !string.IsNullOrEmpty(error))
            throw new InvalidOperationException("A successful result cannot have an error message.");
        
        if (!isSuccess && string.IsNullOrEmpty(error))
            throw new InvalidOperationException("A failed result must have an error message.");

        IsSuccess = isSuccess;
        Error = error;
        Errors = string.IsNullOrEmpty(error) ? Array.Empty<string>() : new[] { error };
    }

    protected Result(bool isSuccess, string[] errors)
    {
        IsSuccess = isSuccess;
        Errors = errors ?? Array.Empty<string>();
        Error = errors?.FirstOrDefault() ?? string.Empty;
    }

    public static Result Success() => new(true, string.Empty);

    public static Result<T> Success<T>(T value) => new(value, true, string.Empty);

    public static Result Failure(string error) => new(false, error);

    public static Result Failure(string[] errors) => new(false, errors);

    public static Result<T> Failure<T>(string error) => new(default, false, error);

    public static Result<T> Failure<T>(string[] errors) => new(default, false, errors);

    public static Result Combine(params Result[] results)
    {
        var failures = results.Where(r => r.IsFailure).ToArray();
        
        if (failures.Length == 0)
            return Success();

        var errors = failures.SelectMany(r => r.Errors).ToArray();
        return Failure(errors);
    }
}

/// <summary>
/// Represents the result of an operation that returns a value
/// </summary>
/// <typeparam name="T">The type of the value</typeparam>
public class Result<T> : Result
{
    public T Value { get; }

    protected internal Result(T? value, bool isSuccess, string error)
        : base(isSuccess, error)
    {
        Value = value!;
    }

    protected internal Result(T? value, bool isSuccess, string[] errors)
        : base(isSuccess, errors)
    {
        Value = value!;
    }

    public static implicit operator Result<T>(T value)
    {
        return value == null ? Failure<T>("Value cannot be null") : Success(value);
    }
}