# 🔌 Dorfkiste API Documentation

Comprehensive REST API documentation for the Dorfkiste rental platform.

## 📋 Table of Contents
- [Authentication](#authentication)
- [Items Management](#items-management)
- [Categories](#categories)
- [Rentals](#rentals)
- [Payments](#payments)
- [Users](#users)
- [Reviews](#reviews)
- [Messages](#messages)
- [Watchlist](#watchlist)
- [Admin](#admin)
- [Error Handling](#error-handling)
- [Rate Limiting](#rate-limiting)

## 🔐 Authentication

### Register User
```http
POST /api/auth/register
Content-Type: application/json

{
  "name": "Max Mustermann",
  "email": "max@example.com",
  "password": "securePassword123"
}
```

**Response:**
```json
{
  "success": true,
  "message": "User created successfully",
  "user": {
    "id": "user_123",
    "name": "Max Mustermann",
    "email": "max@example.com",
    "createdAt": "2024-01-15T10:30:00Z"
  }
}
```

### Sign In
```http
POST /api/auth/signin
Content-Type: application/json

{
  "email": "max@example.com",
  "password": "securePassword123"
}
```

### Password Reset Request
```http
POST /api/auth/forgot-password
Content-Type: application/json

{
  "email": "max@example.com"
}
```

### Reset Password
```http
POST /api/auth/reset-password
Content-Type: application/json

{
  "token": "reset_token_here",
  "password": "newSecurePassword123"
}
```

## 📦 Items Management

### Get All Items
```http
GET /api/items?page=1&limit=20&category=werkzeuge&sort=createdAt&order=desc&search=bohrmaschine

Query Parameters:
- page (number): Page number (default: 1)
- limit (number): Items per page (default: 20, max: 100)
- category (string): Filter by category ID
- sort (string): Sort field (createdAt, pricePerDay, name)
- order (string): Sort order (asc, desc)
- search (string): Search in name and description
- available (boolean): Only available items
- priceMin (number): Minimum price per day
- priceMax (number): Maximum price per day
```

**Response:**
```json
{
  "success": true,
  "data": {
    "items": [
      {
        "id": "item_123",
        "name": "Bohrmaschine Bosch Professional",
        "description": "Profi-Bohrmaschine mit verschiedenen Aufsätzen",
        "pricePerDay": 1500,
        "categoryId": "werkzeuge",
        "ownerId": "user_456",
        "available": true,
        "createdAt": "2024-01-15T10:30:00Z",
        "images": [
          {
            "id": "img_789",
            "url": "/uploads/bohrmaschine-1.jpg",
            "alt": "Bohrmaschine Vorderansicht"
          }
        ],
        "category": {
          "id": "werkzeuge",
          "name": "Werkzeuge",
          "icon": "🔧"
        },
        "owner": {
          "id": "user_456",
          "name": "Anna Schmidt",
          "avatar": "/uploads/anna-avatar.jpg"
        }
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 150,
      "totalPages": 8,
      "hasNext": true,
      "hasPrev": false
    }
  }
}
```

### Get Single Item
```http
GET /api/items/:id
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "item_123",
    "name": "Bohrmaschine Bosch Professional",
    "description": "Profi-Bohrmaschine mit verschiedenen Aufsätzen. Perfekt für Heimwerker-Projekte.",
    "pricePerDay": 1500,
    "categoryId": "werkzeuge",
    "ownerId": "user_456",
    "available": true,
    "createdAt": "2024-01-15T10:30:00Z",
    "updatedAt": "2024-01-20T14:22:00Z",
    "images": [...],
    "category": {...},
    "owner": {...},
    "reviews": [
      {
        "id": "review_123",
        "rating": 5,
        "comment": "Perfekte Bohrmaschine, sehr zu empfehlen!",
        "createdAt": "2024-01-18T09:15:00Z",
        "reviewer": {
          "name": "Thomas Weber",
          "avatar": "/uploads/thomas-avatar.jpg"
        }
      }
    ],
    "availability": {
      "blockedDates": [
        "2024-02-15",
        "2024-02-16",
        "2024-02-17"
      ]
    }
  }
}
```

### Create Item
```http
POST /api/items
Authorization: Bearer <token>
Content-Type: multipart/form-data

{
  "name": "Bohrmaschine Bosch Professional",
  "description": "Profi-Bohrmaschine mit verschiedenen Aufsätzen",
  "pricePerDay": 1500,
  "categoryId": "werkzeuge",
  "deliveryOptions": ["pickup", "delivery"],
  "images": [File, File]
}
```

### Update Item
```http
PUT /api/items/:id
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Bohrmaschine Bosch Professional (aktualisiert)",
  "description": "Profi-Bohrmaschine mit noch mehr Aufsätzen",
  "pricePerDay": 1600,
  "available": true
}
```

### Delete Item
```http
DELETE /api/items/:id
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "message": "Item deleted successfully"
}
```

## 🏷️ Categories

### Get All Categories
```http
GET /api/categories
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "werkzeuge",
      "name": "Werkzeuge",
      "description": "Bohrmaschinen, Sägen, Schraubendreher und mehr",
      "icon": "🔧",
      "color": "bg-blue-50",
      "_count": {
        "items": 45
      }
    },
    {
      "id": "elektronik",
      "name": "Elektronik",
      "description": "Kameras, Tablets, Gaming-Equipment",
      "icon": "📱",
      "color": "bg-purple-50",
      "_count": {
        "items": 23
      }
    }
  ]
}
```

### Get Category Items
```http
GET /api/categories/:id/items?page=1&limit=20
```

## 📅 Rentals

### Get User Rentals
```http
GET /api/rentals?status=active&role=renter
Authorization: Bearer <token>

Query Parameters:
- status (string): active, completed, cancelled, pending
- role (string): renter, owner (items you've rented vs. items you own)
- page (number): Page number
- limit (number): Results per page
```

**Response:**
```json
{
  "success": true,
  "data": {
    "rentals": [
      {
        "id": "rental_123",
        "startDate": "2024-02-15T00:00:00Z",
        "endDate": "2024-02-17T00:00:00Z",
        "totalPrice": 4500,
        "status": "active",
        "createdAt": "2024-02-10T12:30:00Z",
        "item": {
          "id": "item_123",
          "name": "Bohrmaschine Bosch Professional",
          "images": [...]
        },
        "renter": {
          "id": "user_123",
          "name": "Max Mustermann"
        },
        "owner": {
          "id": "user_456",
          "name": "Anna Schmidt"
        },
        "payment": {
          "id": "payment_789",
          "status": "completed",
          "method": "stripe"
        }
      }
    ],
    "pagination": {...}
  }
}
```

### Create Rental Request
```http
POST /api/rentals
Authorization: Bearer <token>
Content-Type: application/json

{
  "itemId": "item_123",
  "startDate": "2024-02-15T00:00:00Z",
  "endDate": "2024-02-17T00:00:00Z",
  "message": "Hallo, ich würde gerne Ihre Bohrmaschine mieten."
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "rental_123",
    "startDate": "2024-02-15T00:00:00Z",
    "endDate": "2024-02-17T00:00:00Z",
    "totalPrice": 4500,
    "status": "pending",
    "paymentRequired": true,
    "paymentIntentId": "pi_stripe_123"
  }
}
```

### Update Rental Status
```http
PUT /api/rentals/:id
Authorization: Bearer <token>
Content-Type: application/json

{
  "status": "confirmed" // pending, confirmed, active, completed, cancelled
}
```

### Get Rental Details
```http
GET /api/rentals/:id
Authorization: Bearer <token>
```

## 💳 Payments

### Create Stripe Payment Intent
```http
POST /api/payments/create-intent
Authorization: Bearer <token>
Content-Type: application/json

{
  "rentalId": "rental_123",
  "amount": 4500,
  "currency": "eur"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "clientSecret": "pi_123_secret_456",
    "paymentIntentId": "pi_123"
  }
}
```

### Create PayPal Order
```http
POST /api/payments/create-paypal-order
Authorization: Bearer <token>
Content-Type: application/json

{
  "rentalId": "rental_123",
  "amount": 4500,
  "currency": "EUR"
}
```

### Capture PayPal Payment
```http
POST /api/payments/capture-paypal
Authorization: Bearer <token>
Content-Type: application/json

{
  "orderId": "paypal_order_123",
  "rentalId": "rental_123"
}
```

### Get Stripe Public Key
```http
GET /api/payments/stripe-key
```

## 👥 Users

### Get User Profile
```http
GET /api/users/:id
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "user_123",
    "name": "Max Mustermann",
    "email": "max@example.com",
    "avatar": "/uploads/max-avatar.jpg",
    "bio": "Hobbybastler und Heimwerker aus München",
    "createdAt": "2024-01-15T10:30:00Z",
    "stats": {
      "itemsOwned": 5,
      "itemsRented": 12,
      "totalRentals": 8,
      "averageRating": 4.8,
      "reviewCount": 15
    },
    "location": {
      "city": "München",
      "postalCode": "80331"
    }
  }
}
```

### Update User Profile
```http
PUT /api/users/:id
Authorization: Bearer <token>
Content-Type: multipart/form-data

{
  "name": "Max Mustermann",
  "bio": "Hobbybastler und Heimwerker aus München",
  "avatar": File
}
```

### Get User Items
```http
GET /api/users/:id/items?status=available
```

### Get User Reviews
```http
GET /api/users/:id/reviews?page=1&limit=10
```

## ⭐ Reviews

### Get Item Reviews
```http
GET /api/reviews?itemId=item_123&page=1&limit=10
```

**Response:**
```json
{
  "success": true,
  "data": {
    "reviews": [
      {
        "id": "review_123",
        "rating": 5,
        "comment": "Perfekte Bohrmaschine, sehr zu empfehlen!",
        "createdAt": "2024-01-18T09:15:00Z",
        "reviewer": {
          "id": "user_789",
          "name": "Thomas Weber",
          "avatar": "/uploads/thomas-avatar.jpg"
        },
        "rental": {
          "id": "rental_456",
          "startDate": "2024-01-10T00:00:00Z",
          "endDate": "2024-01-12T00:00:00Z"
        }
      }
    ],
    "stats": {
      "averageRating": 4.8,
      "totalReviews": 23,
      "ratingDistribution": {
        "5": 18,
        "4": 3,
        "3": 1,
        "2": 1,
        "1": 0
      }
    },
    "pagination": {...}
  }
}
```

### Create Review
```http
POST /api/reviews
Authorization: Bearer <token>
Content-Type: application/json

{
  "rentalId": "rental_123",
  "rating": 5,
  "comment": "Perfekte Bohrmaschine, sehr zu empfehlen!"
}
```

### Update Review
```http
PUT /api/reviews/:id
Authorization: Bearer <token>
Content-Type: application/json

{
  "rating": 4,
  "comment": "Sehr gute Bohrmaschine, kleine Gebrauchsspuren."
}
```

### Delete Review
```http
DELETE /api/reviews/:id
Authorization: Bearer <token>
```

## 💬 Messages

### Get Conversations
```http
GET /api/messages?page=1&limit=20
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "conversations": [
      {
        "id": "conv_123",
        "participants": [
          {
            "id": "user_123",
            "name": "Max Mustermann",
            "avatar": "/uploads/max-avatar.jpg"
          },
          {
            "id": "user_456",
            "name": "Anna Schmidt",
            "avatar": "/uploads/anna-avatar.jpg"
          }
        ],
        "lastMessage": {
          "id": "msg_789",
          "content": "Wann können wir die Übergabe machen?",
          "createdAt": "2024-02-14T15:30:00Z",
          "senderId": "user_123"
        },
        "unreadCount": 2,
        "updatedAt": "2024-02-14T15:30:00Z",
        "relatedItem": {
          "id": "item_123",
          "name": "Bohrmaschine Bosch Professional"
        }
      }
    ],
    "pagination": {...}
  }
}
```

### Get Messages
```http
GET /api/messages/:conversationId?page=1&limit=50
Authorization: Bearer <token>
```

### Send Message
```http
POST /api/messages
Authorization: Bearer <token>
Content-Type: application/json

{
  "recipientId": "user_456",
  "content": "Hallo, ich interessiere mich für Ihre Bohrmaschine.",
  "itemId": "item_123"
}
```

### Mark Messages as Read
```http
PUT /api/messages/:conversationId/read
Authorization: Bearer <token>
```

### Get Unread Count
```http
GET /api/messages/unread
Authorization: Bearer <token>
```

## 📋 Watchlist

### Get User Watchlist
```http
GET /api/watchlist?page=1&limit=20
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "items": [
      {
        "id": "watchlist_123",
        "createdAt": "2024-02-10T12:00:00Z",
        "item": {
          "id": "item_123",
          "name": "Bohrmaschine Bosch Professional",
          "pricePerDay": 1500,
          "available": true,
          "images": [...],
          "owner": {...}
        }
      }
    ],
    "pagination": {...}
  }
}
```

### Add to Watchlist
```http
POST /api/watchlist/:itemId
Authorization: Bearer <token>
```

### Remove from Watchlist
```http
DELETE /api/watchlist/:itemId
Authorization: Bearer <token>
```

## 🔧 Admin

### Get Admin Stats
```http
GET /api/admin/stats
Authorization: Bearer <admin-token>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "users": {
      "total": 1247,
      "newThisMonth": 89,
      "activeToday": 156
    },
    "items": {
      "total": 3421,
      "available": 2987,
      "newThisWeek": 67
    },
    "rentals": {
      "total": 8934,
      "active": 234,
      "thisMonth": 456,
      "revenue": 234567
    },
    "categories": {
      "werkzeuge": 567,
      "elektronik": 234,
      "sport": 123
    }
  }
}
```

### Get Admin Settings
```http
GET /api/admin/settings
Authorization: Bearer <admin-token>
```

### Update Platform Settings
```http
PUT /api/admin/settings
Authorization: Bearer <admin-token>
Content-Type: application/json

{
  "platformFee": 0.05,
  "maxRentalDays": 30,
  "allowRegistration": true,
  "maintenanceMode": false
}
```

### Admin Check
```http
GET /api/admin/check
Authorization: Bearer <admin-token>
```

## 🚨 Error Handling

### Standard Error Response
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Die angegebenen Daten sind ungültig",
    "details": [
      {
        "field": "email",
        "message": "E-Mail-Adresse ist erforderlich"
      },
      {
        "field": "password",
        "message": "Passwort muss mindestens 8 Zeichen haben"
      }
    ]
  },
  "timestamp": "2024-02-14T15:30:00Z",
  "requestId": "req_123456"
}
```

### Error Codes
- `VALIDATION_ERROR` (400): Input validation failed
- `UNAUTHORIZED` (401): Authentication required
- `FORBIDDEN` (403): Insufficient permissions
- `NOT_FOUND` (404): Resource not found
- `CONFLICT` (409): Resource already exists
- `RATE_LIMIT_EXCEEDED` (429): Too many requests
- `INTERNAL_ERROR` (500): Server error
- `SERVICE_UNAVAILABLE` (503): Maintenance mode

## 🛡️ Rate Limiting

### Rate Limits
- **General API**: 100 requests per 15 minutes per IP
- **Authentication**: 5 requests per 15 minutes per IP
- **File Upload**: 10 requests per hour per user
- **Messages**: 30 requests per minute per user
- **Search**: 60 requests per minute per user

### Rate Limit Headers
```http
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1642598400
X-RateLimit-Policy: 100;w=900
```

### Rate Limit Exceeded Response
```json
{
  "success": false,
  "error": {
    "code": "RATE_LIMIT_EXCEEDED",
    "message": "Zu viele Anfragen. Versuchen Sie es später erneut.",
    "retryAfter": 300
  }
}
```

## 🔍 Search & Filtering

### Advanced Search
```http
GET /api/items/search?q=bohrmaschine&filters[category]=werkzeuge&filters[priceMin]=1000&filters[priceMax]=2000&filters[available]=true&sort=pricePerDay&order=asc
```

### Filter Options
- **category**: Category ID
- **priceMin/priceMax**: Price range in cents
- **available**: Only available items
- **location**: Search by postal code or city
- **deliveryOptions**: pickup, delivery, shipping
- **owner**: Owner ID
- **rating**: Minimum average rating

## 📱 WebSocket Events

### Connection
```javascript
const socket = io('ws://localhost:3000')

// Authentication
socket.emit('authenticate', { token: 'user_token' })
```

### Message Events
```javascript
// Send message
socket.emit('message:send', {
  recipientId: 'user_123',
  content: 'Hello!',
  itemId: 'item_123'
})

// Receive message
socket.on('message:received', (message) => {
  // Handle new message
})

// Typing indicators
socket.emit('typing:start', { conversationId: 'conv_123' })
socket.emit('typing:stop', { conversationId: 'conv_123' })
```

### Notification Events
```javascript
// Rental notifications
socket.on('rental:created', (rental) => {})
socket.on('rental:confirmed', (rental) => {})
socket.on('rental:cancelled', (rental) => {})

// Payment notifications
socket.on('payment:completed', (payment) => {})
socket.on('payment:failed', (payment) => {})

// System notifications
socket.on('system:maintenance', (info) => {})
```

## 🧪 Testing

### Test Endpoints
```http
GET /api/health              # System health check
GET /api/health/db          # Database connectivity
GET /api/monitoring         # Performance metrics
```

### Sample cURL Commands
```bash
# Register user
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Test User","email":"test@example.com","password":"password123"}'

# Get items
curl -X GET "http://localhost:3000/api/items?page=1&limit=5" \
  -H "Accept: application/json"

# Create item (with auth)
curl -X POST http://localhost:3000/api/items \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name":"Test Item","description":"Test Description","pricePerDay":1000,"categoryId":"werkzeuge"}'
```

## 📝 Changelog

### v1.0.0 (2024-02-15)
- Initial API release
- User authentication and management
- Item CRUD operations
- Rental system
- Payment integration (Stripe + PayPal)
- Review system
- Messaging functionality
- Admin panel APIs

### v1.1.0 (planned)
- Advanced search and filtering
- Geolocation-based search
- Push notifications
- Mobile app API endpoints
- API versioning support

---

**For more information, visit our [GitHub Repository](https://github.com/your-org/dorfkiste) or contact our [Support Team](mailto:support@dorfkiste.de).**