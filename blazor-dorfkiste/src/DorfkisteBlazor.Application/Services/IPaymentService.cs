using DorfkisteBlazor.Application.Common.Models;

namespace DorfkisteBlazor.Application.Services;

/// <summary>
/// Service interface for payment processing
/// </summary>
public interface IPaymentService
{
    /// <summary>
    /// Create a Stripe payment intent
    /// </summary>
    Task<Result<string>> CreateStripePaymentIntentAsync(decimal amount, string currency = "EUR", string? customerId = null);

    /// <summary>
    /// Confirm a Stripe payment intent
    /// </summary>
    Task<Result<bool>> ConfirmStripePaymentAsync(string paymentIntentId);

    /// <summary>
    /// Create a PayPal order
    /// </summary>
    Task<Result<string>> CreatePayPalOrderAsync(decimal amount, string currency = "EUR");

    /// <summary>
    /// Capture a PayPal payment
    /// </summary>
    Task<Result<bool>> CapturePayPalPaymentAsync(string orderId);

    /// <summary>
    /// Refund a payment
    /// </summary>
    Task<Result<bool>> RefundPaymentAsync(string paymentId, string method, decimal amount);

    /// <summary>
    /// Create a payout to user
    /// </summary>
    Task<Result<string>> CreatePayoutAsync(Guid userId, decimal amount, string method);

    /// <summary>
    /// Get payment status
    /// </summary>
    Task<Result<PaymentStatusDto>> GetPaymentStatusAsync(string paymentId, string method);
}

public class PaymentStatusDto
{
    public string Id { get; set; } = "";
    public string Status { get; set; } = "";
    public decimal Amount { get; set; }
    public string Currency { get; set; } = "";
    public DateTime CreatedAt { get; set; }
    public DateTime? ProcessedAt { get; set; }
}