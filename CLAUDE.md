# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Dorfkiste is a neighborhood marketplace application similar to eBay Kleinanzeigen, consisting of:

1. **Frontend**: Next.js 15 web application with TypeScript and Tailwind CSS
2. **Backend**: .NET 9 Web API using clean architecture principles

The application allows users to rent items (e.g., drilling machines) and offer services (e.g., garden work) within their local community. The user interface is in German and follows eBay or Kleinanzeigen design patterns.

## Key Features

- User registration and JWT-based authentication
- OAuth2 login provider support (planned)
- Offer creation with image upload and AI-powered description suggestions
- Category-based browsing and semantic search
- Contact information management for registered users
- German language interface
- Robust AI image analysis with fallback handling for unanalyzable images
- **Booking calendar system** for services and item rentals with availability management
- **Price calculation** with daily/hourly rate conversion
- **Booking management** with confirmation and cancellation workflows
- **Messaging system** for user-to-user communication with conversation threading
- **Offer management** with picture upload, reordering, and active/inactive toggle
- **AI-powered description generation** from existing offer pictures

## Architecture

### Backend (.NET 9)
Uses onion/clean architecture with the following layers:

- **Dorfkiste.API**: Web API controllers, JWT authentication, Swagger documentation
- **Dorfkiste.Application**: Business logic and services
- **Dorfkiste.Core**: Domain entities and interfaces
- **Dorfkiste.Infrastructure**: Data access with Entity Framework, SQLite database, repository pattern

### Frontend (Next.js 15)
- TypeScript with strict mode enabled
- Tailwind CSS for styling
- Context API for authentication state
- App Router structure with public, auth, and authenticated routes
- API client layer with TypeScript interfaces for type-safe backend communication

## Development Commands

### Frontend
```bash
cd frontend
npm run dev          # Start development server (localhost:3000)
npm run build        # Production build
npm run start        # Start production server
npm run lint         # ESLint code checking
```

### Backend
```bash
cd backend
dotnet build                              # Build all projects
dotnet run --project Dorfkiste.API       # Start API server
dotnet ef migrations add <MigrationName> --project Dorfkiste.Infrastructure --startup-project Dorfkiste.API
dotnet ef database update --project Dorfkiste.Infrastructure --startup-project Dorfkiste.API
```

## Database

- **Type**: SQLite
- **ORM**: Entity Framework Core
- **Pattern**: Repository pattern with interfaces in Core layer
- **Seeding**: Automated test data population on startup

## API Configuration

- **Base URL**: Backend API (typically localhost:5000 or localhost:7000)
- **Authentication**: JWT Bearer tokens
- **CORS**: Configured for localhost:3000-3004
- **Documentation**: Swagger UI available in development mode
- **OpenAI Integration**: GPT-4o model for image analysis and description generation
- **File Uploads**: Multipart form data for offer pictures

## Key Entities

- **User**: User accounts with contact information
- **Offer**: Items/services for rent with categories and pictures
- **Category**: Fixed categories provided by backend
- **Message**: Communication between users
- **OfferPicture**: Image attachments for offers
- **Booking**: Date-based reservations for offers with pricing and status management
- **AvailabilityOverride**: Provider-controlled date blocking for offers

## Development Notes

- Backend uses dependency injection for services and repositories
- Frontend uses path aliases (`@/*`) for imports
- Database migrations are handled through Entity Framework
- Test data is automatically seeded on application startup
- JWT configuration requires secret and issuer in appsettings

## AI Image Analysis

The application features AI-powered image analysis using OpenAI's GPT-4o model for:
- Automatic offer creation from uploaded images
- Description generation from images
- Category suggestions based on image content

### Error Handling for AI Features

The system includes robust error handling for edge cases:
- **Unanalyzable images**: When images are too blurry, unclear, or contain no recognizable objects, the system returns structured fallback responses instead of crashing
- **Network issues**: API failures are gracefully handled with German error messages
- **Invalid AI responses**: JSON parsing errors are caught and fallback responses are provided
- **Fallback categories**: Unrecognized categories default to "Sonstiges"

### AI Response Processing

The `OfferService.AnalyzeImageAndSuggestOfferDataAsync` method:
1. Sends structured prompts to OpenAI GPT-4o with image data
2. Extracts JSON from AI responses (handles markdown, extra text)
3. Parses the response into `AnalyzeImageResponse` objects
4. Maps suggested categories to existing database categories
5. Returns fallback responses for any parsing failures

All AI error scenarios are handled gracefully to ensure the application never crashes due to AI service issues.

### AI Description Generation

In addition to initial offer creation, the system supports generating descriptions from existing offer pictures:
- **Endpoint**: `POST /api/offers/{offerId}/generate-description`
- **Use Case**: Update offer descriptions after uploading additional pictures
- **Process**: Analyzes all existing pictures for an offer and generates a comprehensive German description
- **Integration**: Available in offer edit workflow for improving descriptions

## Messaging System

The application features a comprehensive messaging system for user-to-user communication:

### Messaging Features
- **Conversation Threading**: Messages grouped by offer and participants
- **Read/Unread Tracking**: Visual indicators for new messages
- **Offer Context**: All conversations linked to specific offers
- **Automatic Notifications**: System-generated messages for booking confirmations and cancellations
- **Real-time Updates**: Message list updates after sending/receiving messages

### Backend API Endpoints
```
GET    /api/messages/conversations                    # Get all conversations for current user
GET    /api/messages/conversations/{conversationId}   # Get messages in a conversation
POST   /api/messages/send                            # Send a message
POST   /api/messages/{messageId}/mark-read           # Mark message as read
GET    /api/messages/unread-count                    # Get unread message count
DELETE /api/messages/{messageId}                     # Delete a message
GET    /api/messages/offer/{offerId}/conversation    # Get conversation for specific offer
POST   /api/messages/system                          # Send system notification (internal)
```

### Message Types
- **User Messages**: Direct communication between users
- **System Notifications**: Automatic messages for booking events (confirmation, cancellation)
- **Conversation Context**: Each conversation tied to a specific offer and participants

### Integration with Booking System
- **Booking Confirmations**: Automatic message sent to provider when booking is created
- **Cancellation Notices**: Automatic message sent to customer when provider cancels booking
- **Message Format**: System messages include booking details (dates, price, reason for cancellation)

## Offer Management

The application provides comprehensive offer management capabilities:

### Offer Features
- **Picture Management**: Upload, delete, and reorder offer pictures
- **Active/Inactive Toggle**: Control offer visibility without deletion
- **AI Description Generation**: Generate descriptions from uploaded pictures
- **Category Management**: Fixed categories from backend (Gartenarbeit, Werkzeuge, Transportmittel, etc.)
- **Type Selection**: Items (zum Vermieten) or Services (Dienstleistungen)
- **Price Configuration**: Hourly rates for all offers

### Backend API Endpoints
```
GET    /api/offers                                   # Get all active offers
GET    /api/offers/{id}                             # Get specific offer details
POST   /api/offers                                  # Create new offer
PUT    /api/offers/{id}                             # Update offer
DELETE /api/offers/{id}                             # Delete offer
POST   /api/offers/{id}/pictures                    # Upload offer picture
DELETE /api/offers/pictures/{pictureId}             # Delete offer picture
PUT    /api/offers/{id}/pictures/reorder            # Reorder offer pictures
POST   /api/offers/{id}/toggle-active               # Toggle offer active status
POST   /api/offers/{id}/generate-description        # Generate description from pictures
GET    /api/offers/my-offers                        # Get current user's offers
POST   /api/offers/test-ai                          # Test AI image analysis
```

### Picture Management
- **Multiple Pictures**: Support for multiple pictures per offer
- **Ordering**: First picture serves as primary thumbnail
- **Reordering**: Drag-and-drop or API-based picture sequence management
- **Storage**: Base64 encoding for SQLite storage
- **Formats**: Support for standard image formats (JPEG, PNG, etc.)

## Booking System

The application features a comprehensive booking system for both physical items and services:

### Booking Features
- **Interactive Booking Calendar**: Direct date range selection on offer pages with real-time price calculation
- **Streamlined Booking Flow**: Select dates → See price → Book directly (no separate modal required)
- **Date Range Selection**: 1-14 day booking periods with validation
- **Real-time Availability**: Unavailable dates (past dates and booked dates) are not selectable
- **Dynamic Price Calculation**: Automatic calculation displayed immediately upon date selection
- **Instant Booking**: Selected dates carry over to booking confirmation modal
- **Booking Confirmation**: All bookings are automatically confirmed upon creation

### Backend API Endpoints
```
GET    /api/bookings/availability/{offerId}     # Check date availability
POST   /api/bookings/offers/{offerId}          # Create booking (auto-confirmed)
GET    /api/bookings/my-bookings               # Customer bookings
GET    /api/bookings/my-services               # Provider bookings
GET    /api/bookings/offers/{offerId}/booked-dates    # Get all booked dates for offer
GET    /api/bookings/price/{offerId}           # Calculate pricing
POST   /api/bookings/offers/{offerId}/block-dates    # Block dates (provider)
DELETE /api/bookings/offers/{offerId}/block-dates    # Unblock dates (provider)
```

### Database Schema
- **Bookings Table**: Stores booking details with date ranges, pricing, and status
  - Status enum: `Confirmed = 0, Completed = 1, Cancelled = 2`
  - Entity Framework enum values aligned with CLR defaults
- **AvailabilityOverrides Table**: Provider-managed date blocking
- **Unique Constraints**: Prevents overlapping bookings for same offer
- **Indexes**: Optimized for date range queries and availability checks

### Business Rules
- Minimum 1 day, maximum 14 days per booking
- Future dates only (no past date bookings)
- No self-booking (users cannot book their own offers)
- **Instant booking**: All bookings are immediately confirmed and dates are blocked
- Automatic messaging notifications sent to providers about confirmed bookings
- **Provider cancellation**: Providers can cancel confirmed bookings with automatic customer notification
- **Date release**: Cancelled bookings make dates available for new bookings
- Daily rate calculation: hourly rate × 8 hours (if needed)

### Booking Cancellation System
- **Provider-initiated cancellation**: Service/item providers can cancel confirmed bookings
- **Automatic messaging**: Customers receive automatic notification when their booking is cancelled
- **Optional reason**: Providers can include a cancellation reason for better communication
- **Date availability**: Cancelled booking dates immediately become available for new bookings
- **API endpoint**: `POST /api/bookings/{bookingId}/cancel` with optional reason parameter

## UI/UX Design

### Offer Detail Page Layout
- **Two-column responsive layout**: Main content (left) and sidebar (right)
- **Sidebar components** (top to bottom):
  1. **Interactive Booking Calendar**: Direct date range selection with real-time pricing
  2. **Provider Contact**: Contact information and action buttons
  3. **Safety Tips**: Security recommendations
- **Main content**: Images, description, and detailed information
- **Responsive behavior**: On mobile, sidebar appears first (booking calendar and contact prioritized)

### Calendar Components
- **OfferBookingCalendar**: Interactive booking calendar for offer pages
  - Direct date range selection with click-to-select functionality
  - Unavailable dates (past/booked) are non-selectable and visually disabled
  - Real-time price calculation displayed immediately after date selection
  - Integrated "Jetzt buchen" button appears when valid dates are selected
  - Compact mode for sidebar display with month navigation
- **BookingCalendar**: Legacy interactive calendar used in modals (still available)
  - Date range picker with availability validation
  - Used in full booking modal workflow
- **OfferAvailabilityCalendar**: Legacy read-only calendar (replaced by OfferBookingCalendar)
  - Previously used for showing availability overview only

### Thumbnail System

The application includes a sophisticated thumbnail system for displaying offer images with different states:

#### OfferThumbnail Component Features
- **Dynamic State Display**: Automatically adapts visual appearance based on offer status
- **Active Offers**: Display normal images with full color and clarity
- **Inactive Offers**: Show faded images with grayscale filter + 50% opacity + "Nicht verfügbar" overlay
- **Deleted Offers**: Display dashed border with archive icon and X symbol
- **Loading States**: Proper spinner management during image loading
- **Error Handling**: Graceful fallback to placeholder icons when images fail to load
- **Responsive Sizing**: Support for small, medium, and large thumbnail sizes

#### Visual States
- **Active**: Normal image display with full saturation and opacity
- **Inactive**: `filter: grayscale opacity-50` with semi-transparent overlay text
- **Deleted/Null**: Dashed border container with archive icon and red X overlay
- **Loading**: Spinner overlay during image fetch operations
- **Error**: Fallback to service/item icons when image loading fails

#### Backend Integration
- **BookingOfferDto**: Includes `IsActive` property for booking page thumbnails
- **MessageOfferDto**: Includes `IsActive` property for message page thumbnails
- **API Consistency**: All thumbnail-related endpoints return offer status information
- **Proper Mapping**: Backend controllers map `booking.Offer.IsActive` and `message.Offer.IsActive` to DTOs

#### Usage Examples
```typescript
// Active offer thumbnail
<OfferThumbnail offer={offer} size="medium" isInactive={false} />

// Inactive offer thumbnail (faded appearance)
<OfferThumbnail offer={offer} size="medium" isInactive={offer.isActive === false} />

// Deleted offer thumbnail (dashed border with icons)
<OfferThumbnail offer={null} size="medium" />
```

The thumbnail system ensures consistent visual feedback across all pages (booking management, messaging, offer listings) to clearly communicate offer availability status to users.

### Messaging Components
- **ConversationModal**: Full-screen modal for viewing and sending messages within a conversation
  - Displays all messages between user and offer provider
  - Includes offer details (thumbnail, title, price)
  - Message input with send functionality
  - Auto-scroll to latest messages
  - Read/unread status indicators
- **MessageModal**: Modal for starting new conversations from offer pages
  - Quick message composition
  - Integrated with offer context
  - Automatic conversation creation

## Frontend Architecture

### Page Structure
The application uses Next.js App Router with the following pages:

#### Public Routes
- `/` - Homepage with featured offers and search
- `/offers` - Browse all offers with filtering
- `/offers/[id]` - Offer detail page with booking calendar
- `/categories/[slug]` - Category-specific offer listings

#### Auth Routes
- `/auth/login` - User login
- `/auth/register` - User registration

#### Authenticated Routes
- `/my-offers` - User's own offers management
- `/my-offers/create` - Create new offer with AI assistance
- `/my-offers/[id]/edit` - Edit existing offer
- `/bookings` - Booking management (customer and provider views)
- `/messages` - Message inbox with conversations

### Key Components
- **OfferCard**: Display offer summary with thumbnail, title, price, location
- **OfferThumbnail**: Multi-state thumbnail display (active/inactive/deleted)
- **OfferBookingCalendar**: Interactive date selection with real-time pricing
- **BookingCalendar**: Legacy modal-based calendar picker
- **ConversationModal**: Message conversation interface
- **MessageModal**: New message composition
- **AIImageAnalysis**: Image upload and analysis for offer creation
- **PictureUpload**: Multiple picture upload with drag-and-drop
- **CategorySelect**: Category dropdown with icons

### API Client
The frontend includes a typed API client (`frontend/src/lib/api.ts`) with interfaces for:
- User authentication and management
- Offer CRUD operations
- Booking creation and management
- Message sending and retrieval
- Picture uploads and management
- AI-powered features

All API responses are typed using TypeScript interfaces that match backend DTOs.

## Development Notes

- Backend uses dependency injection for services and repositories
- Frontend uses path aliases (`@/*`) for imports
- Database migrations are handled through Entity Framework
- Test data is automatically seeded on application startup
- JWT configuration requires secret and issuer in appsettings
- OpenAI API key required in appsettings for AI features
- All user-facing text is in German
- Booking and messaging systems are tightly integrated through automatic notifications