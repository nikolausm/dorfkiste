# Payment Integration Architecture - Dorfkiste Marketplace

## Executive Summary

This document outlines the payment integration architecture for Dorfkiste, a neighborhood marketplace for item rentals and service bookings. The design ensures ZAG (Zahlungsdiensteaufsichtsgesetz) compliance by using Stripe Connect as the payment service provider, eliminating the need for platform escrow accounts while enabling automatic commission deduction.

**Key Design Decisions:**
- **Primary Solution**: Stripe Connect with Platform Fee model
- **Platform Role**: Payment facilitator (not merchant of record)
- **Commission Model**: Automatic deduction at transaction time
- **Currency**: EUR (Euro)
- **Target Markets**: Germany (primary), EU (future expansion)

---

## Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [Payment Flow Diagrams](#payment-flow-diagrams)
3. [Stripe Connect Integration](#stripe-connect-integration)
4. [Database Schema](#database-schema)
5. [Backend API Specifications](#backend-api-specifications)
6. [Frontend Components](#frontend-components)
7. [Webhook Integration](#webhook-integration)
8. [Security Considerations](#security-considerations)
9. [ZAG Compliance](#zag-compliance)
10. [Tax and Invoicing](#tax-and-invoicing)
11. [Configuration Management](#configuration-management)
12. [Testing Scenarios](#testing-scenarios)
13. [Implementation Checklist](#implementation-checklist)
14. [Alternative: PayPal Commerce Platform](#alternative-paypal-commerce-platform)

---

## Architecture Overview

### System Actors

1. **Lessee (Renter/Customer)**: User booking items or services
2. **Lessor (Provider/Seller)**: User offering items or services
3. **Dorfkiste Platform**: Marketplace operator
4. **Stripe**: Payment service provider
5. **Connected Account**: Stripe account owned by lessor

### Core Principles

- **No Platform Escrow**: Payments flow directly from lessee to lessor's connected account
- **Automatic Commission**: Platform fee deducted at transaction time by Stripe
- **ZAG Compliance**: Stripe acts as regulated payment institution
- **Transparent Pricing**: All fees disclosed to users before payment
- **Secure Transactions**: PCI DSS compliance through Stripe's infrastructure

---

## Payment Flow Diagrams

### Standard Booking Payment Flow

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         PAYMENT FLOW - BOOKING                               │
└─────────────────────────────────────────────────────────────────────────────┘

1. BOOKING CREATION
   User B (Lessee) ──[Creates Booking]──> Dorfkiste Backend
                                             │
                                             ├─ Calculate Total Amount
                                             ├─ Calculate Platform Fee (e.g., 10%)
                                             └─ Create PaymentIntent

2. PAYMENT AUTHORIZATION
   Dorfkiste Backend ──[Create PaymentIntent]──> Stripe API
                                                    │
                                                    └─ PaymentIntent ID returned

3. CHECKOUT PROCESS
   Lessee Browser ──[Stripe.js Checkout]──> Stripe Payment Page
                                               │
                                               ├─ Enter Payment Method
                                               ├─ 3D Secure (if required)
                                               └─ Payment Authorized

4. PAYMENT SETTLEMENT
   Stripe ──[Automatic Split]──> Lessor Connected Account (90%)
                              └─> Platform Stripe Account (10% commission)

5. WEBHOOK NOTIFICATION
   Stripe ──[payment_intent.succeeded]──> Dorfkiste Webhook Endpoint
                                             │
                                             ├─ Update Booking Status
                                             ├─ Create Payment Record
                                             └─ Send Notifications

6. PAYOUT TO LESSOR
   Stripe ──[Automatic Payout Schedule]──> Lessor Bank Account
         (Daily/Weekly/Monthly based on settings)
```

### Payment Flow Components

```
┌──────────────┐
│   Lessee     │
│  (User B)    │
└──────┬───────┘
       │
       │ 1. Books offer (€100)
       │
       ▼
┌──────────────────────────────────────────┐
│     Dorfkiste Platform Backend          │
│                                          │
│  Calculate:                              │
│  - Booking Amount: €100                  │
│  - Platform Fee: €10 (10%)               │
│  - Lessor Receives: €90                  │
└──────┬───────────────────────────────────┘
       │
       │ 2. Create PaymentIntent
       │    with application_fee_amount
       │
       ▼
┌──────────────────────────────────────────┐
│          Stripe Platform                 │
│                                          │
│  ┌────────────────────────────────────┐ │
│  │  PaymentIntent                     │ │
│  │  - amount: €100                    │ │
│  │  - application_fee_amount: €10    │ │
│  │  - on_behalf_of: Lessor Account   │ │
│  │  - transfer_data.destination: ... │ │
│  └────────────────────────────────────┘ │
└──────┬───────────────────────────────────┘
       │
       │ 3. Payment processed
       │
       ├─────────────────┬─────────────────┐
       │                 │                 │
       ▼                 ▼                 ▼
┌─────────────┐   ┌──────────────┐  ┌──────────────┐
│   Lessor    │   │  Platform    │  │   Payment    │
│  Connected  │   │  Commission  │  │  Processor   │
│   Account   │   │   Account    │  │   Fees       │
│             │   │              │  │              │
│   €90.00    │   │   €10.00     │  │  €0.29 +2.9% │
└─────────────┘   └──────────────┘  └──────────────┘
       │
       │ 4. Automatic payout schedule
       │
       ▼
┌─────────────┐
│   Lessor    │
│ Bank Account│
└─────────────┘
```

### User Onboarding Flow (Lessor)

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    LESSOR ONBOARDING FLOW                                    │
└─────────────────────────────────────────────────────────────────────────────┘

1. OFFER CREATION ATTEMPT
   User A ──[Creates First Offer]──> Dorfkiste Backend
                                        │
                                        └─ Check: Has Connected Account?

2. STRIPE CONNECT ONBOARDING
   Dorfkiste Backend ──[Create Account Link]──> Stripe API
                                                   │
                                                   └─ Onboarding URL returned

3. STRIPE ONBOARDING UI
   User A Browser ──[Redirected]──> Stripe Connect Onboarding
                                       │
                                       ├─ Verify Identity (KYC)
                                       ├─ Add Bank Account (IBAN)
                                       ├─ Accept Terms of Service
                                       └─ Complete Profile

4. RETURN TO PLATFORM
   Stripe ──[Redirect]──> Dorfkiste Return URL
                            │
                            └─ Save Connected Account ID

5. ACCOUNT VERIFICATION
   Stripe ──[account.updated webhook]──> Dorfkiste Webhook
                                           │
                                           ├─ Update User.StripeAccountId
                                           ├─ Update PaymentStatus
                                           └─ Enable Offer Publishing
```

---

## Stripe Connect Integration

### Integration Model: Platform Fee (Application Fee)

**Recommended Model**: Stripe Connect - Destination Charges with Application Fee

**Why This Model?**
- ✅ ZAG compliant (no platform escrow account)
- ✅ Automatic commission deduction
- ✅ Stripe manages payouts to lessors
- ✅ Platform receives commission directly
- ✅ Lessor maintains merchant of record status
- ✅ Simplified refund handling

### Account Structure

```
Platform Account (Dorfkiste GmbH)
├── Connected Account: User_001 (Lessor A)
│   ├── Charges from lessees
│   ├── Payouts to bank account
│   └── Application fees to platform
├── Connected Account: User_002 (Lessor B)
│   ├── Charges from lessees
│   ├── Payouts to bank account
│   └── Application fees to platform
└── Connected Account: User_003 (Lessor C)
    ├── Charges from lessees
    ├── Payouts to bank account
    └── Application fees to platform
```

### Stripe API Integration Points

#### 1. Create Connected Account

```http
POST https://api.stripe.com/v1/accounts
Authorization: Bearer sk_live_...

{
  "type": "express",
  "country": "DE",
  "email": "user@example.com",
  "capabilities": {
    "card_payments": { "requested": true },
    "transfers": { "requested": true }
  },
  "business_type": "individual",
  "metadata": {
    "dorfkiste_user_id": "123",
    "platform": "dorfkiste"
  }
}
```

**Response**: `acct_xxxxxxxxxxxxx`

#### 2. Create Account Link (Onboarding)

```http
POST https://api.stripe.com/v1/account_links
Authorization: Bearer sk_live_...

{
  "account": "acct_xxxxxxxxxxxxx",
  "refresh_url": "https://dorfkiste.de/connect/refresh",
  "return_url": "https://dorfkiste.de/connect/return",
  "type": "account_onboarding"
}
```

**Response**: Onboarding URL (expires in 5 minutes)

#### 3. Create PaymentIntent with Application Fee

```http
POST https://api.stripe.com/v1/payment_intents
Authorization: Bearer sk_live_...

{
  "amount": 10000,
  "currency": "eur",
  "application_fee_amount": 1000,
  "transfer_data": {
    "destination": "acct_xxxxxxxxxxxxx"
  },
  "metadata": {
    "booking_id": "456",
    "lessor_user_id": "123",
    "lessee_user_id": "789"
  }
}
```

**Breakdown**:
- `amount`: €100.00 (total booking amount in cents)
- `application_fee_amount`: €10.00 (platform commission in cents)
- `transfer_data.destination`: Lessor's connected account ID
- Lessor receives: €90.00 (amount - application_fee_amount)

#### 4. Retrieve Account Status

```http
GET https://api.stripe.com/v1/accounts/acct_xxxxxxxxxxxxx
Authorization: Bearer sk_live_...
```

**Check**:
- `charges_enabled`: true/false
- `payouts_enabled`: true/false
- `requirements.currently_due`: array of required information

---

## Database Schema

### New Entities

#### 1. Payment Entity

```csharp
public class Payment
{
    public int Id { get; set; }

    // Relationships
    public int BookingId { get; set; }
    public Booking Booking { get; set; }

    public int LesseeUserId { get; set; }
    public User Lessee { get; set; }

    public int LessorUserId { get; set; }
    public User Lessor { get; set; }

    // Payment Details
    public decimal TotalAmount { get; set; }          // Total booking amount
    public decimal PlatformFeeAmount { get; set; }     // Commission amount
    public decimal LessorAmount { get; set; }          // Amount to lessor (TotalAmount - PlatformFeeAmount)
    public string Currency { get; set; } = "EUR";

    // Stripe References
    public string StripePaymentIntentId { get; set; }  // pi_xxxxxxxxxxxxx
    public string StripeChargeId { get; set; }         // ch_xxxxxxxxxxxxx
    public string StripeTransferId { get; set; }       // tr_xxxxxxxxxxxxx

    // Status Tracking
    public PaymentStatus Status { get; set; }
    public PaymentMethod PaymentMethod { get; set; }

    // Timestamps
    public DateTime CreatedAt { get; set; }
    public DateTime? AuthorizedAt { get; set; }
    public DateTime? CapturedAt { get; set; }
    public DateTime? RefundedAt { get; set; }

    // Refund Information
    public decimal? RefundAmount { get; set; }
    public string RefundReason { get; set; }
    public string StripeRefundId { get; set; }         // re_xxxxxxxxxxxxx

    // Metadata
    public string StripePaymentMethodId { get; set; }   // pm_xxxxxxxxxxxxx
    public string LastFourDigits { get; set; }
    public string CardBrand { get; set; }

    // Error Handling
    public string ErrorMessage { get; set; }
    public string StripeErrorCode { get; set; }
}

public enum PaymentStatus
{
    Pending = 0,           // PaymentIntent created, awaiting payment
    RequiresAction = 1,    // 3D Secure or additional auth required
    Processing = 2,        // Payment being processed
    Succeeded = 3,         // Payment successful, funds transferred
    Canceled = 4,          // Payment canceled before completion
    Failed = 5,            // Payment failed
    RefundPending = 6,     // Refund initiated
    Refunded = 7           // Fully refunded
}

public enum PaymentMethod
{
    Card = 0,
    SEPA = 1,
    Giropay = 2,
    Sofort = 3
}
```

#### 2. Payout Entity

```csharp
public class Payout
{
    public int Id { get; set; }

    // Relationship
    public int LessorUserId { get; set; }
    public User Lessor { get; set; }

    // Payout Details
    public decimal Amount { get; set; }
    public string Currency { get; set; } = "EUR";

    // Stripe References
    public string StripePayoutId { get; set; }         // po_xxxxxxxxxxxxx
    public string StripeAccountId { get; set; }        // acct_xxxxxxxxxxxxx

    // Status
    public PayoutStatus Status { get; set; }

    // Timestamps
    public DateTime CreatedAt { get; set; }
    public DateTime? ArrivalDate { get; set; }
    public DateTime? PaidAt { get; set; }
    public DateTime? FailedAt { get; set; }

    // Bank Details (last 4 digits for reference)
    public string BankAccountLast4 { get; set; }

    // Error Handling
    public string FailureMessage { get; set; }
    public string FailureCode { get; set; }
}

public enum PayoutStatus
{
    Pending = 0,
    InTransit = 1,
    Paid = 2,
    Failed = 3,
    Canceled = 4
}
```

#### 3. PlatformFee Entity

```csharp
public class PlatformFee
{
    public int Id { get; set; }

    // Relationship
    public int PaymentId { get; set; }
    public Payment Payment { get; set; }

    // Fee Details
    public decimal Amount { get; set; }
    public decimal FeePercentage { get; set; }         // e.g., 10.00 for 10%
    public string Currency { get; set; } = "EUR";

    // Stripe References
    public string StripeApplicationFeeId { get; set; } // fee_xxxxxxxxxxxxx

    // Timestamps
    public DateTime CreatedAt { get; set; }

    // Refund Tracking
    public decimal? RefundedAmount { get; set; }
    public DateTime? RefundedAt { get; set; }
}
```

#### 4. Update User Entity

```csharp
public class User
{
    // ... existing properties ...

    // Stripe Integration
    public string StripeCustomerId { get; set; }       // For lessees: cus_xxxxxxxxxxxxx
    public string StripeAccountId { get; set; }        // For lessors: acct_xxxxxxxxxxxxx

    // Payment Status
    public bool IsStripeOnboardingComplete { get; set; }
    public DateTime? StripeOnboardingCompletedAt { get; set; }

    // Navigation Properties
    public ICollection<Payment> PaymentsAsBuyer { get; set; }
    public ICollection<Payment> PaymentsAsSeller { get; set; }
    public ICollection<Payout> Payouts { get; set; }
}
```

#### 5. Update Booking Entity

```csharp
public class Booking
{
    // ... existing properties ...

    // Payment Reference
    public int? PaymentId { get; set; }
    public Payment Payment { get; set; }

    // Payment Status
    public bool IsPaid { get; set; }
    public DateTime? PaidAt { get; set; }
}
```

### Database Indexes

```csharp
// In DbContext OnModelCreating
modelBuilder.Entity<Payment>()
    .HasIndex(p => p.StripePaymentIntentId)
    .IsUnique();

modelBuilder.Entity<Payment>()
    .HasIndex(p => p.BookingId)
    .IsUnique();

modelBuilder.Entity<Payment>()
    .HasIndex(p => new { p.Status, p.CreatedAt });

modelBuilder.Entity<Payout>()
    .HasIndex(p => p.StripePayoutId)
    .IsUnique();

modelBuilder.Entity<Payout>()
    .HasIndex(p => new { p.LessorUserId, p.CreatedAt });

modelBuilder.Entity<User>()
    .HasIndex(u => u.StripeAccountId)
    .IsUnique()
    .HasFilter("[StripeAccountId] IS NOT NULL");

modelBuilder.Entity<User>()
    .HasIndex(u => u.StripeCustomerId)
    .IsUnique()
    .HasFilter("[StripeCustomerId] IS NOT NULL");
```

---

## Backend API Specifications

### API Endpoints

#### 1. Stripe Connect Onboarding

**Start Onboarding**
```http
POST /api/payments/connect/onboard
Authorization: Bearer <jwt_token>

Response 200 OK:
{
  "onboardingUrl": "https://connect.stripe.com/...",
  "expiresAt": "2024-01-15T10:30:00Z"
}
```

**Refresh Onboarding**
```http
POST /api/payments/connect/refresh
Authorization: Bearer <jwt_token>

Response 200 OK:
{
  "onboardingUrl": "https://connect.stripe.com/...",
  "expiresAt": "2024-01-15T10:35:00Z"
}
```

**Get Account Status**
```http
GET /api/payments/connect/status
Authorization: Bearer <jwt_token>

Response 200 OK:
{
  "isOnboardingComplete": true,
  "chargesEnabled": true,
  "payoutsEnabled": true,
  "requirementsCurrentlyDue": [],
  "stripeAccountId": "acct_xxxxxxxxxxxxx"
}
```

**Handle Return from Stripe**
```http
GET /api/payments/connect/return
Query Parameters: ?account_id=acct_xxxxxxxxxxxxx

Response: Redirect to /my-offers or /dashboard
```

#### 2. Payment Processing

**Create Payment Intent**
```http
POST /api/payments/intents
Authorization: Bearer <jwt_token>
Content-Type: application/json

Request Body:
{
  "bookingId": 123,
  "returnUrl": "https://dorfkiste.de/bookings/123/payment-success"
}

Response 200 OK:
{
  "paymentIntentId": "pi_xxxxxxxxxxxxx",
  "clientSecret": "pi_xxxxxxxxxxxxx_secret_xxxxxxxxxxxxx",
  "amount": 10000,
  "currency": "eur",
  "platformFeeAmount": 1000,
  "lessorAmount": 9000,
  "status": "requires_payment_method"
}
```

**Confirm Payment Intent**
```http
POST /api/payments/intents/{paymentIntentId}/confirm
Authorization: Bearer <jwt_token>
Content-Type: application/json

Request Body:
{
  "paymentMethodId": "pm_xxxxxxxxxxxxx"
}

Response 200 OK:
{
  "status": "succeeded",
  "paymentId": 456,
  "bookingId": 123
}
```

**Get Payment Status**
```http
GET /api/payments/{paymentId}
Authorization: Bearer <jwt_token>

Response 200 OK:
{
  "id": 456,
  "bookingId": 123,
  "totalAmount": 100.00,
  "platformFeeAmount": 10.00,
  "lessorAmount": 90.00,
  "currency": "EUR",
  "status": "succeeded",
  "paymentMethod": "card",
  "lastFourDigits": "4242",
  "cardBrand": "visa",
  "createdAt": "2024-01-15T09:00:00Z",
  "capturedAt": "2024-01-15T09:01:23Z"
}
```

#### 3. Refund Management

**Create Refund**
```http
POST /api/payments/{paymentId}/refunds
Authorization: Bearer <jwt_token>
Content-Type: application/json

Request Body:
{
  "amount": 10000,        // Optional: partial refund
  "reason": "requested_by_customer"
}

Response 200 OK:
{
  "refundId": "re_xxxxxxxxxxxxx",
  "amount": 100.00,
  "status": "succeeded",
  "refundedAt": "2024-01-15T12:00:00Z"
}
```

**Get Refund Status**
```http
GET /api/payments/{paymentId}/refunds
Authorization: Bearer <jwt_token>

Response 200 OK:
{
  "refunds": [
    {
      "id": "re_xxxxxxxxxxxxx",
      "amount": 100.00,
      "status": "succeeded",
      "reason": "requested_by_customer",
      "createdAt": "2024-01-15T12:00:00Z"
    }
  ]
}
```

#### 4. Payout Management

**Get Lessor Payouts**
```http
GET /api/payments/payouts
Authorization: Bearer <jwt_token>
Query Parameters: ?page=1&pageSize=20

Response 200 OK:
{
  "payouts": [
    {
      "id": 1,
      "amount": 450.00,
      "currency": "EUR",
      "status": "paid",
      "createdAt": "2024-01-10T00:00:00Z",
      "arrivalDate": "2024-01-12T00:00:00Z",
      "paidAt": "2024-01-12T08:30:00Z",
      "bankAccountLast4": "1234"
    }
  ],
  "totalCount": 15,
  "page": 1,
  "pageSize": 20
}
```

**Get Payout Details**
```http
GET /api/payments/payouts/{payoutId}
Authorization: Bearer <jwt_token>

Response 200 OK:
{
  "id": 1,
  "amount": 450.00,
  "currency": "EUR",
  "status": "paid",
  "stripePayoutId": "po_xxxxxxxxxxxxx",
  "createdAt": "2024-01-10T00:00:00Z",
  "arrivalDate": "2024-01-12T00:00:00Z",
  "paidAt": "2024-01-12T08:30:00Z",
  "bankAccountLast4": "1234",
  "includedPayments": [
    {
      "paymentId": 123,
      "bookingId": 456,
      "amount": 90.00,
      "capturedAt": "2024-01-08T10:00:00Z"
    }
  ]
}
```

#### 5. Dashboard & Analytics

**Get Earnings Summary**
```http
GET /api/payments/earnings/summary
Authorization: Bearer <jwt_token>
Query Parameters: ?startDate=2024-01-01&endDate=2024-01-31

Response 200 OK:
{
  "totalEarnings": 1250.00,
  "platformFeesPaid": 139.00,
  "netEarnings": 1111.00,
  "pendingPayouts": 250.00,
  "completedPayouts": 861.00,
  "transactionCount": 14,
  "currency": "EUR"
}
```

**Get Platform Revenue**
```http
GET /api/admin/payments/revenue
Authorization: Bearer <admin_jwt_token>
Query Parameters: ?startDate=2024-01-01&endDate=2024-01-31

Response 200 OK:
{
  "totalRevenue": 2500.00,
  "platformFees": 250.00,
  "transactionCount": 25,
  "averageCommission": 10.00,
  "currency": "EUR"
}
```

### Service Layer Architecture

#### IPaymentService Interface

```csharp
public interface IPaymentService
{
    // Stripe Connect
    Task<string> CreateConnectedAccountAsync(int userId);
    Task<string> CreateAccountLinkAsync(int userId, string refreshUrl, string returnUrl);
    Task<ConnectedAccountStatus> GetAccountStatusAsync(int userId);
    Task HandleAccountReturnAsync(int userId, string stripeAccountId);

    // Payment Processing
    Task<PaymentIntent> CreatePaymentIntentAsync(int bookingId, int lesseeUserId);
    Task<Payment> ConfirmPaymentAsync(string paymentIntentId, string paymentMethodId);
    Task<Payment> GetPaymentByIdAsync(int paymentId);
    Task<Payment> GetPaymentByBookingIdAsync(int bookingId);

    // Refunds
    Task<Refund> CreateRefundAsync(int paymentId, decimal? amount, string reason);
    Task<List<Refund>> GetRefundsForPaymentAsync(int paymentId);

    // Payouts
    Task<List<Payout>> GetPayoutsForUserAsync(int userId, int page, int pageSize);
    Task<Payout> GetPayoutByIdAsync(int payoutId);

    // Analytics
    Task<EarningsSummary> GetEarningsSummaryAsync(int userId, DateTime startDate, DateTime endDate);
    Task<PlatformRevenue> GetPlatformRevenueAsync(DateTime startDate, DateTime endDate);

    // Webhook Handling
    Task HandleWebhookEventAsync(string eventType, string eventJson);
}
```

#### Commission Calculation Logic

```csharp
public class PaymentCalculationService
{
    private readonly decimal _commissionPercentage; // From configuration

    public PaymentCalculation CalculatePayment(decimal bookingAmount)
    {
        var platformFee = Math.Round(bookingAmount * _commissionPercentage / 100, 2);
        var lessorAmount = bookingAmount - platformFee;

        return new PaymentCalculation
        {
            TotalAmount = bookingAmount,
            PlatformFeeAmount = platformFee,
            LessorAmount = lessorAmount,
            FeePercentage = _commissionPercentage
        };
    }

    public int ConvertToStripeAmount(decimal amount, string currency = "EUR")
    {
        // Stripe uses smallest currency unit (cents for EUR)
        return (int)Math.Round(amount * 100);
    }
}
```

---

## Frontend Components

### 1. Stripe Connect Onboarding

**Component: ConnectOnboardingButton.tsx**

```typescript
interface ConnectOnboardingButtonProps {
  variant?: 'primary' | 'secondary';
  returnUrl?: string;
}

// Features:
// - Checks if user already has connected account
// - Shows different states: "Jetzt aktivieren", "Aktivierung fortsetzen", "Aktiviert"
// - Handles onboarding flow with Stripe redirect
// - Displays account status (charges_enabled, payouts_enabled)
```

**Page: /connect/setup**

```typescript
// Onboarding status page
// - Display current onboarding status
// - Show requirements still needed
// - Link to continue onboarding
// - Bank account connection status
```

### 2. Payment Checkout

**Component: BookingCheckout.tsx**

```typescript
interface BookingCheckoutProps {
  booking: BookingDto;
  onPaymentSuccess: (paymentId: number) => void;
  onPaymentError: (error: string) => void;
}

// Features:
// - Display booking summary with dates and prices
// - Show commission breakdown
// - Integrate Stripe Payment Element
// - Handle 3D Secure authentication
// - Success/error state handling
// - Redirect after successful payment
```

**Component: StripePaymentForm.tsx**

```typescript
interface StripePaymentFormProps {
  clientSecret: string;
  amount: number;
  currency: string;
  onSuccess: () => void;
  onError: (error: string) => void;
}

// Features:
// - Stripe Elements integration
// - Payment Element (card, SEPA, etc.)
// - Loading states
// - Error handling
// - German localization
```

### 3. Payment Status & History

**Page: /payments/history**

```typescript
// Payment history for lessees
// - List of all payments made
// - Status badges (succeeded, pending, failed)
// - Booking details link
// - Refund status
// - Receipt download
```

**Component: PaymentStatusBadge.tsx**

```typescript
interface PaymentStatusBadgeProps {
  status: PaymentStatus;
}

// Status colors:
// - Pending: yellow
// - Processing: blue
// - Succeeded: green
// - Failed: red
// - Refunded: gray
```

### 4. Payout Dashboard

**Page: /earnings**

```typescript
// Lessor earnings dashboard
// - Total earnings this month
// - Pending payouts
// - Completed payouts
// - Payout history table
// - Date range filter
// - Export functionality
```

**Component: EarningsSummary.tsx**

```typescript
interface EarningsSummaryProps {
  summary: EarningsSummary;
}

// Display:
// - Total earnings
// - Platform fees paid
// - Net earnings
// - Pending amount
// - Next payout date
```

**Component: PayoutList.tsx**

```typescript
interface PayoutListProps {
  payouts: Payout[];
  onSelectPayout: (payoutId: number) => void;
}

// Features:
// - Payout status indicators
// - Amount display
// - Arrival date
// - Bank account (last 4 digits)
// - Detailed view modal
```

### 5. Admin Dashboard

**Page: /admin/revenue**

```typescript
// Platform revenue dashboard (admin only)
// - Total revenue chart
// - Commission breakdown
// - Transaction volume
// - Top earners
// - Fee statistics
// - Export reports
```

### 6. Booking Flow Integration

**Modified: OfferDetailPage - Booking Section**

```typescript
// After booking creation:
// 1. Create booking (status: Confirmed)
// 2. Create PaymentIntent
// 3. Redirect to checkout page with clientSecret
// 4. Process payment
// 5. Update booking with payment reference
// 6. Send confirmation messages

// Payment button states:
// - "Jetzt buchen und bezahlen" (before booking)
// - "Zahlung abschließen" (booking created, payment pending)
// - "Bezahlt" (payment succeeded - disabled)
```

### 7. Refund Flow

**Component: RefundRequestModal.tsx**

```typescript
interface RefundRequestModalProps {
  payment: Payment;
  onRefundRequested: () => void;
}

// Features:
// - Partial or full refund selection
// - Reason dropdown
// - Confirmation step
// - Automatic booking cancellation
// - Notification to both parties
```

---

## Webhook Integration

### Webhook Endpoint

```http
POST /api/webhooks/stripe
Content-Type: application/json
Stripe-Signature: t=...,v1=...,v0=...

Request Body:
{
  "id": "evt_xxxxxxxxxxxxx",
  "object": "event",
  "type": "payment_intent.succeeded",
  "data": {
    "object": { ... }
  }
}
```

### Event Handlers

#### 1. Account Events

**account.updated**
```typescript
// Triggered when connected account status changes
// Actions:
// - Update User.IsStripeOnboardingComplete
// - Update User.StripeOnboardingCompletedAt
// - Send notification email if onboarding complete
// - Enable offer publishing
```

**account.application.deauthorized**
```typescript
// Triggered when user disconnects Stripe account
// Actions:
// - Set User.StripeAccountId to null
// - Set User.IsStripeOnboardingComplete to false
// - Deactivate all user's offers
// - Send notification email
```

#### 2. Payment Intent Events

**payment_intent.created**
```typescript
// Triggered when PaymentIntent is created
// Actions:
// - Create Payment record with status Pending
// - Link to Booking
// - Store PaymentIntent ID
```

**payment_intent.requires_action**
```typescript
// Triggered when 3D Secure or additional auth required
// Actions:
// - Update Payment.Status to RequiresAction
// - Send notification to lessee
```

**payment_intent.processing**
```typescript
// Triggered when payment is being processed
// Actions:
// - Update Payment.Status to Processing
```

**payment_intent.succeeded**
```typescript
// Triggered when payment succeeds
// Actions:
// - Update Payment.Status to Succeeded
// - Set Payment.CapturedAt timestamp
// - Update Booking.IsPaid to true
// - Set Booking.PaidAt timestamp
// - Create PlatformFee record
// - Send confirmation messages to both parties
// - Send receipt email to lessee
// - Notify lessor of incoming payout
```

**payment_intent.payment_failed**
```typescript
// Triggered when payment fails
// Actions:
// - Update Payment.Status to Failed
// - Store error message and code
// - Send failure notification to lessee
// - Optionally cancel booking after retry attempts
```

**payment_intent.canceled**
```typescript
// Triggered when PaymentIntent is canceled
// Actions:
// - Update Payment.Status to Canceled
// - Optionally release booking hold
```

#### 3. Charge Events

**charge.succeeded**
```typescript
// Triggered when charge is successful
// Actions:
// - Update Payment.StripeChargeId
// - Store payment method details (last 4, brand)
```

**charge.refunded**
```typescript
// Triggered when charge is refunded
// Actions:
// - Update Payment.Status to Refunded
// - Set Payment.RefundedAt
// - Update Payment.RefundAmount
// - Store Refund ID
// - Cancel associated booking
// - Send refund confirmation to both parties
```

#### 4. Transfer Events

**transfer.created**
```typescript
// Triggered when transfer to connected account is created
// Actions:
// - Update Payment.StripeTransferId
// - Log transfer creation
```

**transfer.paid**
```typescript
// Triggered when transfer is completed
// Actions:
// - Confirm transfer completion
// - Update internal records
```

**transfer.failed**
```typescript
// Triggered when transfer fails
// Actions:
// - Log error
// - Alert platform admin
// - Investigate connected account status
```

#### 5. Payout Events

**payout.created**
```typescript
// Triggered when payout is created for connected account
// Actions:
// - Create Payout record with status Pending
// - Store Payout ID and expected arrival date
```

**payout.paid**
```typescript
// Triggered when payout arrives at bank account
// Actions:
// - Update Payout.Status to Paid
// - Set Payout.PaidAt timestamp
// - Send confirmation notification to lessor
```

**payout.failed**
```typescript
// Triggered when payout fails
// Actions:
// - Update Payout.Status to Failed
// - Store failure message and code
// - Send notification to lessor
// - Alert platform admin
```

#### 6. Application Fee Events

**application_fee.created**
```typescript
// Triggered when application fee is collected
// Actions:
// - Confirm PlatformFee record
// - Update revenue metrics
```

**application_fee.refunded**
```typescript
// Triggered when application fee is refunded
// Actions:
// - Update PlatformFee.RefundedAmount
// - Set PlatformFee.RefundedAt
// - Update revenue metrics
```

### Webhook Security

```csharp
public class StripeWebhookMiddleware
{
    public async Task<bool> ValidateWebhookSignature(HttpRequest request)
    {
        var signature = request.Headers["Stripe-Signature"].FirstOrDefault();
        var json = await new StreamReader(request.Body).ReadToEndAsync();
        var secret = _configuration["Stripe:WebhookSecret"];

        try
        {
            var stripeEvent = EventUtility.ConstructEvent(
                json,
                signature,
                secret,
                throwOnApiVersionMismatch: false
            );

            return true;
        }
        catch (StripeException)
        {
            return false;
        }
    }
}
```

### Webhook Testing

**Stripe CLI for Local Development**

```bash
# Install Stripe CLI
brew install stripe/stripe-cli/stripe

# Login to Stripe
stripe login

# Forward webhooks to local API
stripe listen --forward-to localhost:5000/api/webhooks/stripe

# Trigger test events
stripe trigger payment_intent.succeeded
stripe trigger payout.paid
```

---

## Security Considerations

### 1. API Key Management

**Environment Separation**:
- **Test Mode**: `sk_test_...` for development/staging
- **Live Mode**: `sk_live_...` for production only
- Never commit API keys to version control
- Use environment variables or Azure Key Vault

**Key Rotation Policy**:
- Rotate keys every 90 days
- Immediate rotation if key exposure suspected
- Use restricted API keys when possible

### 2. Payment Intent Security

**Client Secret Protection**:
- Client secrets are single-use and expire
- Never log client secrets
- Validate PaymentIntent ownership before returning client secret
- Verify user authorization for booking

**Example Authorization Check**:
```csharp
public async Task<string> GetPaymentClientSecret(int bookingId, int userId)
{
    var booking = await _bookingRepository.GetByIdAsync(bookingId);

    // Verify user is the lessee
    if (booking.CustomerId != userId)
    {
        throw new UnauthorizedException("Not authorized to pay for this booking");
    }

    // Verify booking is not already paid
    if (booking.IsPaid)
    {
        throw new InvalidOperationException("Booking already paid");
    }

    // Return client secret
    return booking.Payment.ClientSecret;
}
```

### 3. Webhook Security

**Signature Verification**:
- Always verify webhook signatures
- Use constant-time comparison to prevent timing attacks
- Reject webhooks with invalid signatures
- Log rejected webhook attempts for monitoring

**Idempotency**:
- Webhooks may be delivered multiple times
- Use idempotency keys for operations
- Check if event already processed before taking action
- Use database transactions for atomic updates

**Example Idempotent Handler**:
```csharp
public async Task HandlePaymentSucceeded(string eventId, PaymentIntent paymentIntent)
{
    // Check if event already processed
    var existingEvent = await _webhookEventRepository.GetByIdAsync(eventId);
    if (existingEvent != null)
    {
        _logger.LogInformation($"Event {eventId} already processed");
        return;
    }

    using var transaction = await _dbContext.Database.BeginTransactionAsync();

    try
    {
        // Process payment
        await UpdatePaymentStatus(paymentIntent.Id, PaymentStatus.Succeeded);

        // Record event as processed
        await _webhookEventRepository.CreateAsync(new WebhookEvent
        {
            StripeEventId = eventId,
            EventType = "payment_intent.succeeded",
            ProcessedAt = DateTime.UtcNow
        });

        await transaction.CommitAsync();
    }
    catch (Exception ex)
    {
        await transaction.RollbackAsync();
        throw;
    }
}
```

### 4. Connected Account Security

**Onboarding Validation**:
- Verify user identity before account creation
- Validate email ownership
- Check for duplicate accounts
- Implement fraud detection rules

**Access Control**:
- Only account owner can access account details
- Restrict payout information to account owner
- Validate user permissions before account operations
- Log all sensitive account actions

### 5. PCI DSS Compliance

**Stripe Handles**:
- ✅ Card data storage
- ✅ PCI DSS certification
- ✅ Secure card processing
- ✅ Tokenization

**Platform Responsibilities**:
- Never store card numbers, CVV, or full PAN
- Use Stripe.js for card input (never process in backend)
- Store only payment method IDs and metadata
- Implement strong authentication for payment operations
- Maintain audit logs for all payment activities

### 6. Data Privacy (GDPR)

**Personal Data in Payments**:
- Payment amounts and dates
- Card last 4 digits and brand
- Bank account last 4 digits (for payouts)

**User Rights**:
- Right to access payment history
- Right to data portability (export payments)
- Right to erasure (handle with care due to legal retention requirements)

**Retention Policy**:
- Payment records: 10 years (tax/legal requirements)
- Anonymize personal data after account deletion where legally permitted
- Retain transaction amounts for accounting

### 7. Fraud Prevention

**Risk Indicators**:
- Multiple failed payment attempts
- High-value first transaction
- Rapid account creation and booking
- Mismatched IP geolocation and user location

**Stripe Radar**:
- Enable Stripe Radar for fraud detection
- Review high-risk transactions manually
- Implement 3D Secure (SCA) for European cards
- Use AVS (Address Verification System) for additional validation

**Rate Limiting**:
- Max 3 payment attempts per booking
- Max 5 payment intents per user per hour
- Temporary account suspension after repeated failures

---

## ZAG Compliance

### Regulatory Framework

**ZAG (Zahlungsdiensteaufsichtsgesetz)**: German Payment Services Supervision Act implementing EU's PSD2 (Payment Services Directive 2).

**Key Requirements**:
1. **Licensing**: Payment services require BaFin authorization
2. **E-Money Prohibition**: Platform cannot hold customer funds
3. **SCA (Strong Customer Authentication)**: Required for electronic payments
4. **Transparency**: Clear disclosure of fees and terms
5. **Customer Protection**: Dispute resolution and refund rights

### Compliance Strategy

#### 1. No Platform Escrow Account

**Prohibited Model** ❌:
```
Lessee → Platform Escrow Account → Lessor
        (Platform holds funds temporarily)
```

**Compliant Model** ✅:
```
Lessee → Stripe (Regulated PSP) → Lessor Connected Account
                                  → Platform Fee (automatic)
```

**Why Compliant**:
- Stripe is a licensed payment institution (authorized by BaFin)
- Platform never holds customer funds
- Platform acts as marketplace operator, not payment service provider
- Funds flow directly to lessor's Stripe account
- Commission deducted automatically by Stripe

#### 2. Strong Customer Authentication (SCA)

**Implementation**:
- Stripe automatically handles SCA requirements
- 3D Secure 2 integrated for card payments
- Exemptions handled by Stripe (e.g., low-value transactions <€30)
- User authentication via biometrics or 2FA when required

**PSD2 Compliance**:
- Multi-factor authentication for payments
- Dynamic linking (payment amount tied to authentication)
- Fallback to step-up authentication when needed

#### 3. Transparency Requirements

**Fee Disclosure**:
- Platform commission clearly displayed before booking
- Total amount breakdown shown at checkout
- Terms of service include payment terms
- Email confirmations include all fee details

**Example Checkout Display**:
```
Buchungsdetails:
- Grundpreis (3 Tage): €90,00
- Servicepauschale (10%): €10,00
─────────────────────────────
Gesamtbetrag: €100,00

Der Anbieter erhält: €90,00
Dorfkiste Provision: €10,00
```

#### 4. Customer Protection

**Refund Rights**:
- Clear refund policy in terms of service
- Refunds processed within 14 days
- Automatic refunds for cancelled bookings
- Dispute resolution process documented

**Complaint Handling**:
- Contact form for payment disputes
- 30-day response time for complaints
- Escalation to consumer protection agencies
- Documentation of all disputes

#### 5. Data Protection

**Payment Data Handling**:
- Minimal data collection (GDPR compliance)
- Payment data stored by Stripe (PCI DSS compliant)
- Platform only stores payment metadata (IDs, amounts, timestamps)
- Data retention aligned with legal requirements (10 years for tax records)

### Legal Documentation Required

1. **Terms of Service**:
   - Payment processing through Stripe
   - Commission structure and calculation
   - Payout schedules and timing
   - Refund and cancellation policies
   - Dispute resolution procedures

2. **Privacy Policy**:
   - Payment data processing (Stripe as processor)
   - Data retention periods
   - User rights (access, deletion, portability)
   - Third-party data sharing (Stripe)

3. **Stripe Connected Account Agreement**:
   - Users accept Stripe's terms during onboarding
   - Platform facilitates agreement acceptance
   - Terms displayed before account creation

4. **Impressum (Imprint)**:
   - Platform operator details
   - Contact information
   - Commercial register number
   - VAT ID (if applicable)

### BaFin Notification

**Not Required for Dorfkiste** because:
- Platform uses licensed PSP (Stripe)
- No payment account services provided
- No e-money issuance
- Commission deducted by PSP, not platform
- No fund holding or payment initiation

**If scaling internationally**: Consult legal counsel for specific country requirements.

---

## Tax and Invoicing

### 1. VAT Obligations

#### Platform Commission VAT

**Scenario**: Platform charges 10% commission on €100 booking

```
Booking Amount: €100,00
Platform Fee: €10,00
VAT on Platform Fee (19%): €1,90
Total Platform Revenue: €11,90
```

**Implementation**:
- Platform must charge VAT on commission in Germany (19%)
- VAT included in application_fee_amount or charged separately
- Platform issues VAT invoices to lessors for commission

**Stripe Configuration**:
```http
POST /v1/application_fees/{fee_id}/refunds

# For VAT, platform can:
# Option 1: Include VAT in application_fee_amount
application_fee_amount = 1190  # €11.90 (€10 + €1.90 VAT)

# Option 2: Charge VAT separately via Stripe Tax
```

#### Booking VAT

**Responsibility**: Lessor (seller) is responsible for VAT on booking amount
- Services: 19% VAT (Germany standard rate)
- Goods rental: May vary by category

**Not Platform's Concern**: Platform facilitates payment only

### 2. Invoice Generation

#### Platform Invoices (for Commission)

**Issued to**: Lessor (seller)
**Frequency**: Monthly or per transaction
**Required Information**:
```
Dorfkiste GmbH
[Address]
USt-IdNr.: DE123456789

Rechnung an:
[Lessor Name]
[Address]

Rechnungsnummer: INV-2024-00123
Rechnungsdatum: 15.01.2024
Leistungszeitraum: 01.01.2024 - 31.01.2024

Position | Beschreibung | Netto | MwSt. | Brutto
─────────────────────────────────────────────────
1 | Vermittlungsprovision (10%) | €50,00 | €9,50 | €59,50
  | 5 Buchungen à €10,00 Provision

Gesamtbetrag: €59,50
```

**Implementation**:
- Generate PDF invoices using library (e.g., QuestPDF, iTextSharp)
- Store invoices in database
- Email invoices to lessors
- Provide download in lessor dashboard

#### Lessor Receipts (for Customers)

**Issued to**: Lessee (customer)
**Issued by**: Lessor (via platform on their behalf)
**Required Information**:
```
Quittung

Von: [Lessor Name]
An: [Lessee Name]

Buchungsnummer: BOOK-2024-00456
Datum: 15.01.2024

Position | Beschreibung | Betrag
─────────────────────────────────────────
1 | Miete Bohrmaschine | €100,00
  | 3 Tage (12.01. - 14.01.2024)

Gesamtbetrag: €100,00
Bezahlt via: Visa •••• 4242
```

**Implementation**:
- Auto-generate receipt after successful payment
- Email to lessee
- Provide download in payment history

### 3. Tax Reporting

#### Platform Obligations

**Quarterly VAT Returns**:
- Report all commission revenue
- Calculate VAT owed on commissions
- Submit to Finanzamt

**Annual Financial Statements**:
- Revenue from commissions
- Stripe processing fees (deductible expense)
- Other operational costs

**Data Export for Accountant**:
```http
GET /api/admin/tax/export
Query: ?year=2024&quarter=Q1

Response: CSV with all platform fees and VAT
```

#### Lessor Tax Support

**Earnings Report for Lessors**:
```http
GET /api/payments/earnings/tax-report
Query: ?year=2024

Response: PDF with annual earnings summary
```

**Information Included**:
- Total gross earnings
- Platform fees paid
- Net earnings
- Number of transactions
- Monthly breakdown

**Not Tax Advice**: Include disclaimer that users should consult tax advisors

### 4. Cross-Border Considerations

**Germany Only (Initial Launch)**:
- All users in Germany
- EUR currency
- German VAT rate (19%)
- German tax law applies

**Future EU Expansion**:
- Reverse charge mechanism for B2B services
- OSS (One-Stop-Shop) for B2C cross-border VAT
- Different VAT rates per country
- Currency conversion considerations

---

## Configuration Management

### Environment Variables

#### Required Stripe Configuration

```bash
# .env.production
STRIPE_PUBLISHABLE_KEY=pk_live_xxxxxxxxxxxxx
STRIPE_SECRET_KEY=sk_live_xxxxxxxxxxxxx
STRIPE_WEBHOOK_SECRET=whsec_xxxxxxxxxxxxx

# .env.development
STRIPE_PUBLISHABLE_KEY=pk_test_xxxxxxxxxxxxx
STRIPE_SECRET_KEY=sk_test_xxxxxxxxxxxxx
STRIPE_WEBHOOK_SECRET=whsec_xxxxxxxxxxxxx
```

#### Application Settings

**appsettings.json**

```json
{
  "Stripe": {
    "PublishableKey": "",
    "SecretKey": "",
    "WebhookSecret": "",
    "ConnectClientId": "ca_xxxxxxxxxxxxx",
    "ApiVersion": "2024-01-15"
  },
  "Payment": {
    "CommissionPercentage": 10.0,
    "Currency": "EUR",
    "MinimumPaymentAmount": 1.00,
    "MaximumPaymentAmount": 10000.00,
    "RefundWindow": 14,
    "DefaultPayoutSchedule": "daily"
  },
  "Tax": {
    "VATRate": 19.0,
    "IncludeVATInCommission": true,
    "PlatformVATNumber": "DE123456789"
  },
  "Webhooks": {
    "StripeWebhookPath": "/api/webhooks/stripe",
    "StripeWebhookTolerance": 300
  }
}
```

**Frontend .env**

```bash
# .env.production
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_xxxxxxxxxxxxx
NEXT_PUBLIC_API_BASE_URL=https://api.dorfkiste.de

# .env.development
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_xxxxxxxxxxxxx
NEXT_PUBLIC_API_BASE_URL=http://localhost:5000
```

### Feature Flags

```json
{
  "Features": {
    "PaymentsEnabled": true,
    "RefundsEnabled": true,
    "PartialRefundsEnabled": false,
    "SEPAPaymentsEnabled": true,
    "GiropayEnabled": true,
    "AutomaticPayoutsEnabled": true,
    "ManualPayoutApproval": false
  }
}
```

### Commission Configuration

**Database-Driven Commission Rates** (Future Enhancement):

```csharp
public class CommissionConfiguration
{
    public int Id { get; set; }
    public decimal DefaultCommissionPercentage { get; set; } = 10.0m;
    public decimal MinimumCommissionAmount { get; set; } = 0.50m;
    public DateTime EffectiveFrom { get; set; }
    public bool IsActive { get; set; }
}

// Category-specific rates
public class CategoryCommission
{
    public int Id { get; set; }
    public int CategoryId { get; set; }
    public decimal CommissionPercentage { get; set; }
}

// User-specific rates (VIP users, promotions)
public class UserCommission
{
    public int Id { get; set; }
    public int UserId { get; set; }
    public decimal CommissionPercentage { get; set; }
    public DateTime? ExpiresAt { get; set; }
}
```

---

## Testing Scenarios

### 1. Unit Tests

#### Payment Calculation Tests

```csharp
[TestFixture]
public class PaymentCalculationServiceTests
{
    [Test]
    public void CalculatePayment_WithStandardBooking_ReturnsCorrectAmounts()
    {
        // Arrange
        var service = new PaymentCalculationService(commissionPercentage: 10.0m);
        var bookingAmount = 100.00m;

        // Act
        var result = service.CalculatePayment(bookingAmount);

        // Assert
        Assert.AreEqual(100.00m, result.TotalAmount);
        Assert.AreEqual(10.00m, result.PlatformFeeAmount);
        Assert.AreEqual(90.00m, result.LessorAmount);
    }

    [Test]
    public void ConvertToStripeAmount_WithEuroAmount_ReturnsCorrectCents()
    {
        // Arrange
        var service = new PaymentCalculationService(commissionPercentage: 10.0m);

        // Act
        var result = service.ConvertToStripeAmount(123.45m);

        // Assert
        Assert.AreEqual(12345, result);
    }
}
```

#### Commission Validation Tests

```csharp
[TestFixture]
public class CommissionValidationTests
{
    [Test]
    public void ValidateCommission_WithNegativePercentage_ThrowsException()
    {
        // Arrange
        var validator = new CommissionValidator();

        // Act & Assert
        Assert.Throws<ArgumentException>(() =>
            validator.ValidatePercentage(-5.0m));
    }

    [Test]
    public void ValidateCommission_WithPercentageOver100_ThrowsException()
    {
        // Arrange
        var validator = new CommissionValidator();

        // Act & Assert
        Assert.Throws<ArgumentException>(() =>
            validator.ValidatePercentage(105.0m));
    }
}
```

### 2. Integration Tests

#### Stripe Connect Onboarding

```csharp
[TestFixture]
public class StripeConnectIntegrationTests
{
    [Test]
    public async Task CreateConnectedAccount_WithValidUser_ReturnsAccountId()
    {
        // Arrange
        var service = new PaymentService(_stripeClient, _userRepository);
        var userId = 1;

        // Act
        var accountId = await service.CreateConnectedAccountAsync(userId);

        // Assert
        Assert.IsNotNull(accountId);
        Assert.That(accountId, Does.StartWith("acct_"));
    }

    [Test]
    public async Task CreateAccountLink_WithValidAccount_ReturnsOnboardingUrl()
    {
        // Arrange
        var service = new PaymentService(_stripeClient, _userRepository);
        var userId = 1;
        var accountId = await service.CreateConnectedAccountAsync(userId);

        // Act
        var url = await service.CreateAccountLinkAsync(
            userId,
            "http://localhost/refresh",
            "http://localhost/return"
        );

        // Assert
        Assert.IsNotNull(url);
        Assert.That(url, Does.Contain("connect.stripe.com"));
    }
}
```

#### Payment Processing

```csharp
[TestFixture]
public class PaymentProcessingIntegrationTests
{
    [Test]
    public async Task CreatePaymentIntent_WithValidBooking_ReturnsClientSecret()
    {
        // Arrange
        var booking = await CreateTestBookingAsync();
        var service = new PaymentService(_stripeClient, _bookingRepository);

        // Act
        var paymentIntent = await service.CreatePaymentIntentAsync(
            booking.Id,
            booking.CustomerId
        );

        // Assert
        Assert.IsNotNull(paymentIntent.ClientSecret);
        Assert.AreEqual(10000, paymentIntent.Amount); // €100.00
        Assert.AreEqual(1000, paymentIntent.ApplicationFeeAmount); // €10.00
    }

    [Test]
    public async Task ConfirmPayment_WithTestCard_SucceedsAndUpdatesBooking()
    {
        // Arrange
        var booking = await CreateTestBookingAsync();
        var paymentIntent = await CreateTestPaymentIntentAsync(booking);
        var service = new PaymentService(_stripeClient, _paymentRepository);

        // Act
        var payment = await service.ConfirmPaymentAsync(
            paymentIntent.Id,
            "pm_card_visa" // Test payment method
        );

        // Assert
        Assert.AreEqual(PaymentStatus.Succeeded, payment.Status);
        Assert.IsTrue(booking.IsPaid);
        Assert.IsNotNull(booking.PaidAt);
    }
}
```

### 3. End-to-End Tests

#### Complete Booking and Payment Flow

```typescript
describe('Booking Payment Flow', () => {
  it('should complete booking with payment', async () => {
    // 1. Login as lessee
    await loginAsUser('lessee@example.com');

    // 2. Select offer and dates
    await page.goto('/offers/123');
    await selectDateRange('2024-02-01', '2024-02-03');

    // 3. Create booking
    await page.click('button[data-testid="book-now"]');

    // 4. Verify payment page
    await expect(page).toHaveURL(/\/bookings\/\d+\/checkout/);
    await expect(page.locator('[data-testid="total-amount"]')).toContainText('€100,00');
    await expect(page.locator('[data-testid="platform-fee"]')).toContainText('€10,00');

    // 5. Enter payment details
    const stripeFrame = page.frameLocator('iframe[name*="stripe"]');
    await stripeFrame.locator('[name="cardNumber"]').fill('4242424242424242');
    await stripeFrame.locator('[name="cardExpiry"]').fill('12/25');
    await stripeFrame.locator('[name="cardCvc"]').fill('123');

    // 6. Submit payment
    await page.click('button[data-testid="pay-now"]');

    // 7. Verify success
    await expect(page).toHaveURL(/\/bookings\/\d+\/success/);
    await expect(page.locator('[data-testid="success-message"]'))
      .toContainText('Zahlung erfolgreich');
  });
});
```

#### Stripe Connect Onboarding Flow

```typescript
describe('Lessor Onboarding', () => {
  it('should complete Stripe Connect onboarding', async () => {
    // 1. Login as new lessor
    await loginAsUser('lessor@example.com');

    // 2. Attempt to create offer
    await page.goto('/my-offers/create');

    // 3. Verify redirect to onboarding
    await expect(page.locator('[data-testid="onboarding-required"]'))
      .toBeVisible();

    // 4. Start onboarding
    await page.click('button[data-testid="start-onboarding"]');

    // 5. Stripe redirects to onboarding (test mode)
    await expect(page).toHaveURL(/connect\.stripe\.com/);

    // 6. Fill Stripe form (test data)
    // Note: Stripe test mode allows skipping actual verification
    await page.click('button[data-testid="skip-account-form"]');

    // 7. Return to platform
    await expect(page).toHaveURL(/\/connect\/return/);

    // 8. Verify onboarding complete
    await page.goto('/connect/status');
    await expect(page.locator('[data-testid="charges-enabled"]'))
      .toContainText('Aktiviert');
  });
});
```

### 4. Test Cards (Stripe Test Mode)

**Successful Payments**:
- `4242 4242 4242 4242` - Visa (no authentication)
- `5555 5555 5555 4444` - Mastercard (no authentication)

**3D Secure Required**:
- `4000 0027 6000 3184` - Visa (3DS required)

**Failed Payments**:
- `4000 0000 0000 0002` - Card declined
- `4000 0000 0000 9995` - Insufficient funds

**SEPA Debit**:
- `DE89370400440532013000` - Valid IBAN

### 5. Webhook Testing

#### Local Testing with Stripe CLI

```bash
# Terminal 1: Start backend
cd backend
dotnet run --project Dorfkiste.API

# Terminal 2: Forward webhooks
stripe listen --forward-to localhost:5000/api/webhooks/stripe

# Terminal 3: Trigger events
stripe trigger payment_intent.succeeded
stripe trigger payment_intent.payment_failed
stripe trigger payout.paid
```

#### Automated Webhook Tests

```csharp
[TestFixture]
public class WebhookHandlerTests
{
    [Test]
    public async Task HandlePaymentIntentSucceeded_UpdatesPaymentAndBooking()
    {
        // Arrange
        var payment = await CreateTestPaymentAsync();
        var eventJson = CreateStripeEvent("payment_intent.succeeded", payment.StripePaymentIntentId);
        var handler = new StripeWebhookHandler(_paymentService);

        // Act
        await handler.HandleEventAsync("payment_intent.succeeded", eventJson);

        // Assert
        var updatedPayment = await _paymentRepository.GetByIdAsync(payment.Id);
        Assert.AreEqual(PaymentStatus.Succeeded, updatedPayment.Status);
        Assert.IsTrue(updatedPayment.Booking.IsPaid);
    }
}
```

---

## Implementation Checklist

### Phase 1: Backend Foundation (Week 1-2)

- [ ] **Database Schema**
  - [ ] Create `Payment` entity and migration
  - [ ] Create `Payout` entity and migration
  - [ ] Create `PlatformFee` entity and migration
  - [ ] Update `User` entity with Stripe fields
  - [ ] Update `Booking` entity with payment reference
  - [ ] Add indexes for performance
  - [ ] Seed test data for development

- [ ] **Stripe Integration**
  - [ ] Install Stripe.NET NuGet package
  - [ ] Configure Stripe API keys in appsettings
  - [ ] Create `IStripeService` interface
  - [ ] Implement Stripe Connect account creation
  - [ ] Implement account link generation
  - [ ] Implement account status retrieval

- [ ] **Payment Service**
  - [ ] Create `IPaymentService` interface
  - [ ] Implement payment calculation logic
  - [ ] Implement PaymentIntent creation
  - [ ] Implement payment confirmation
  - [ ] Implement refund processing
  - [ ] Add error handling and logging

- [ ] **API Controllers**
  - [ ] Create `PaymentsController` with endpoints
  - [ ] Create `ConnectController` for onboarding
  - [ ] Add authorization attributes
  - [ ] Add request validation
  - [ ] Add Swagger documentation

### Phase 2: Webhook Integration (Week 2-3)

- [ ] **Webhook Infrastructure**
  - [ ] Create webhook endpoint `/api/webhooks/stripe`
  - [ ] Implement signature verification
  - [ ] Create event router for different event types
  - [ ] Add idempotency handling
  - [ ] Add webhook event logging

- [ ] **Event Handlers**
  - [ ] Implement `account.updated` handler
  - [ ] Implement `payment_intent.succeeded` handler
  - [ ] Implement `payment_intent.payment_failed` handler
  - [ ] Implement `charge.refunded` handler
  - [ ] Implement `payout.paid` handler
  - [ ] Add notification triggers for each event

- [ ] **Testing**
  - [ ] Set up Stripe CLI for local testing
  - [ ] Test webhook signature validation
  - [ ] Test each event handler
  - [ ] Test idempotency
  - [ ] Add integration tests

### Phase 3: Frontend Integration (Week 3-4)

- [ ] **Stripe.js Setup**
  - [ ] Install `@stripe/stripe-js` package
  - [ ] Create Stripe context provider
  - [ ] Configure publishable key
  - [ ] Add Stripe Elements wrapper

- [ ] **Onboarding Flow**
  - [ ] Create `ConnectOnboardingButton` component
  - [ ] Create `/connect/setup` page
  - [ ] Create `/connect/return` page
  - [ ] Add onboarding status checks
  - [ ] Add conditional offer publishing

- [ ] **Payment Checkout**
  - [ ] Create `BookingCheckout` page
  - [ ] Create `StripePaymentForm` component
  - [ ] Implement Payment Element
  - [ ] Add 3D Secure handling
  - [ ] Add success/error states
  - [ ] Add redirect after payment

- [ ] **Payment Management**
  - [ ] Create `/payments/history` page
  - [ ] Create `PaymentStatusBadge` component
  - [ ] Add payment detail modal
  - [ ] Add refund request UI
  - [ ] Add receipt download

- [ ] **Payout Dashboard**
  - [ ] Create `/earnings` page
  - [ ] Create `EarningsSummary` component
  - [ ] Create `PayoutList` component
  - [ ] Add payout detail modal
  - [ ] Add date range filtering
  - [ ] Add export functionality

### Phase 4: Booking Flow Integration (Week 4-5)

- [ ] **Update Booking Flow**
  - [ ] Modify booking creation to create PaymentIntent
  - [ ] Add payment step to booking confirmation
  - [ ] Update booking status based on payment
  - [ ] Add payment requirement checks
  - [ ] Update booking cancellation to handle refunds

- [ ] **UI Updates**
  - [ ] Update `OfferDetailPage` with payment info
  - [ ] Add commission breakdown display
  - [ ] Update booking confirmation messages
  - [ ] Add payment status to booking cards
  - [ ] Update booking management pages

### Phase 5: Admin & Analytics (Week 5-6)

- [ ] **Admin Dashboard**
  - [ ] Create `/admin/revenue` page
  - [ ] Implement revenue analytics
  - [ ] Add transaction volume charts
  - [ ] Add commission breakdown
  - [ ] Add payout monitoring

- [ ] **Reporting**
  - [ ] Create tax report export (CSV/PDF)
  - [ ] Create earnings report for lessors
  - [ ] Create platform revenue reports
  - [ ] Add financial reconciliation tools

### Phase 6: Testing & QA (Week 6-7)

- [ ] **Unit Tests**
  - [ ] Payment calculation tests
  - [ ] Commission validation tests
  - [ ] Refund logic tests
  - [ ] Service layer tests

- [ ] **Integration Tests**
  - [ ] Stripe API integration tests
  - [ ] Payment flow tests
  - [ ] Webhook handler tests
  - [ ] Database transaction tests

- [ ] **End-to-End Tests**
  - [ ] Complete booking and payment flow
  - [ ] Onboarding flow
  - [ ] Refund flow
  - [ ] Payout flow

- [ ] **Manual Testing**
  - [ ] Test with real test cards
  - [ ] Test 3D Secure flows
  - [ ] Test error scenarios
  - [ ] Test webhook delivery
  - [ ] Cross-browser testing

### Phase 7: Documentation & Compliance (Week 7-8)

- [ ] **Legal Documentation**
  - [ ] Update Terms of Service
  - [ ] Update Privacy Policy
  - [ ] Add payment terms
  - [ ] Add refund policy
  - [ ] Add dispute resolution process

- [ ] **User Documentation**
  - [ ] Create payment FAQ
  - [ ] Create onboarding guide
  - [ ] Create earnings guide
  - [ ] Add help center articles

- [ ] **Developer Documentation**
  - [ ] Document API endpoints
  - [ ] Document webhook events
  - [ ] Add code examples
  - [ ] Create deployment guide

- [ ] **Compliance**
  - [ ] ZAG compliance review
  - [ ] GDPR compliance check
  - [ ] PCI DSS compliance verification
  - [ ] VAT setup verification

### Phase 8: Deployment & Monitoring (Week 8)

- [ ] **Production Setup**
  - [ ] Create production Stripe account
  - [ ] Configure production API keys
  - [ ] Set up webhook endpoints
  - [ ] Configure environment variables
  - [ ] Test production webhook delivery

- [ ] **Monitoring**
  - [ ] Set up payment monitoring alerts
  - [ ] Configure failed payment notifications
  - [ ] Add payout monitoring
  - [ ] Set up error tracking (Sentry/Application Insights)
  - [ ] Create payment dashboards

- [ ] **Go-Live**
  - [ ] Final production testing
  - [ ] Enable payments for beta users
  - [ ] Monitor first transactions
  - [ ] Gradual rollout to all users
  - [ ] Post-launch monitoring

---

## Alternative: PayPal Commerce Platform

### Overview

**PayPal Commerce Platform** provides similar functionality to Stripe Connect, allowing marketplaces to facilitate payments between buyers and sellers while collecting platform fees.

### Key Differences vs. Stripe

| Feature | Stripe Connect | PayPal Commerce |
|---------|----------------|-----------------|
| **Market Share (EU)** | Growing | Established |
| **User Familiarity** | Lower | Higher |
| **Integration Complexity** | Moderate | Moderate |
| **Fee Structure** | 2.9% + €0.29 | 2.49% + €0.35 (EU) |
| **Onboarding** | Express (embedded) | Partner Referral |
| **Payout Speed** | Daily | Instant (optional) |
| **Developer Experience** | Excellent | Good |
| **German Market** | Strong | Strong |

### PayPal Architecture

#### Account Structure

```
Platform PayPal Account (Dorfkiste)
├── Partner Referral Link
├── Merchant Account: User_001 (Lessor A)
│   ├── Receives payments from buyers
│   ├── Platform fee deducted automatically
│   └── Payouts to bank account
├── Merchant Account: User_002 (Lessor B)
└── Merchant Account: User_003 (Lessor C)
```

#### Payment Flow

```
1. Lessee Checkout
   User B ──[PayPal Checkout]──> PayPal Payment Page
                                    │
                                    └─ PayPal balance, card, bank

2. Payment Processing
   PayPal ──[Split Payment]──> Lessor Account (90%)
                            └──> Platform Fee (10%)

3. Payout
   PayPal ──[Automatic Payout]──> Lessor Bank Account
```

### Integration Points

#### 1. Partner Referral

```javascript
// Create partner referral link
POST https://api.paypal.com/v2/customer/partner-referrals

{
  "partner_config_override": {
    "partner_logo_url": "https://dorfkiste.de/logo.png",
    "return_url": "https://dorfkiste.de/paypal/return",
    "show_add_credit_card": true
  },
  "operations": [
    {
      "operation": "API_INTEGRATION",
      "api_integration_preference": {
        "rest_api_integration": {
          "integration_method": "PAYPAL",
          "integration_type": "THIRD_PARTY",
          "third_party_details": {
            "features": ["PAYMENT", "REFUND"]
          }
        }
      }
    }
  ],
  "products": ["EXPRESS_CHECKOUT"],
  "legal_consents": [
    {
      "type": "SHARE_DATA_CONSENT",
      "granted": true
    }
  ]
}
```

#### 2. Create Order with Platform Fee

```javascript
POST https://api.paypal.com/v2/checkout/orders

{
  "intent": "CAPTURE",
  "purchase_units": [
    {
      "reference_id": "BOOKING-123",
      "amount": {
        "currency_code": "EUR",
        "value": "100.00",
        "breakdown": {
          "item_total": {
            "currency_code": "EUR",
            "value": "100.00"
          }
        }
      },
      "payee": {
        "merchant_id": "LESSOR_MERCHANT_ID"
      },
      "payment_instruction": {
        "platform_fees": [
          {
            "amount": {
              "currency_code": "EUR",
              "value": "10.00"
            }
          }
        ]
      }
    }
  ]
}
```

### Pros and Cons

#### Advantages of PayPal
- ✅ Higher user recognition in Germany
- ✅ Existing PayPal accounts (no new signup for many users)
- ✅ Buyer protection program
- ✅ Instant payouts available
- ✅ Lower transaction fees (2.49% vs 2.9%)

#### Disadvantages of PayPal
- ❌ Less developer-friendly than Stripe
- ❌ More complex dispute resolution
- ❌ Limited customization of checkout flow
- ❌ Onboarding flow redirects to PayPal
- ❌ Less comprehensive documentation

### Recommendation

**Primary Choice: Stripe Connect**

**Reasoning**:
1. **Superior Developer Experience**: Better APIs, documentation, and tooling
2. **Embedded Onboarding**: Stripe Express onboarding stays within platform
3. **Webhook Reliability**: More robust webhook system
4. **Future Features**: Easier to add features (subscriptions, installments, etc.)
5. **Modern Payment Methods**: Better support for new payment methods (Apple Pay, Google Pay)
6. **ZAG Compliance**: Clear compliance story with Stripe as licensed PSP

**Fallback Option: PayPal Commerce**

Consider PayPal if:
- User testing shows strong preference for PayPal
- PayPal recognition drives higher conversion
- Target demographic heavily uses PayPal

**Hybrid Approach** (Future):
- Offer both Stripe and PayPal as payment options
- Let lessors choose preferred payout method
- Increase payment method availability for lessees

---

## Summary

This payment integration architecture ensures:

✅ **ZAG Compliance**: No platform escrow accounts, licensed PSP (Stripe)
✅ **Automatic Commission**: Platform fee deducted at transaction time
✅ **Transparent Pricing**: All fees clearly disclosed
✅ **Secure Payments**: PCI DSS compliance through Stripe
✅ **Seamless UX**: Embedded onboarding and checkout flows
✅ **Scalability**: Ready for growth and feature expansion
✅ **Tax Compliance**: VAT handling and invoice generation
✅ **User Protection**: Refund policies and dispute resolution

### Next Steps

1. **Review this document** with legal counsel for ZAG compliance confirmation
2. **Create Stripe account** and complete platform verification
3. **Begin Phase 1 implementation** following the checklist
4. **Set up test environment** with Stripe test mode
5. **Iterate based on user feedback** during beta testing

### Support Resources

- **Stripe Documentation**: https://stripe.com/docs/connect
- **Stripe Support**: https://support.stripe.com
- **ZAG Compliance**: Consult legal counsel specializing in German payment law
- **Tax Advice**: Consult with German tax advisor for VAT obligations

---

**Document Version**: 1.0
**Last Updated**: 2024-01-15
**Author**: Dorfkiste Development Team
**Status**: Planning Document - Not Yet Implemented
