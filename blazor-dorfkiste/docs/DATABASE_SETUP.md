# Database Setup Guide

This guide covers the setup and management of the Entity Framework database for the DorfkisteBlazor application.

## Quick Start

### 1. Prerequisites

- .NET 8.0 SDK
- SQL Server (LocalDB, Express, or full version)
- Entity Framework Core Tools

```bash
# Install EF Core tools globally
dotnet tool install --global dotnet-ef
```

### 2. Database Migration

#### Using the Migration Scripts (Recommended)

**Windows (PowerShell):**
```powershell
# Navigate to scripts directory
cd scripts

# Run initial migration
.\migrate-database.ps1 migrate -SeedData

# Or reset database with seed data
.\migrate-database.ps1 reset -SeedData -Force
```

**Linux/macOS (Bash):**
```bash
# Make script executable
chmod +x scripts/migrate-database.sh

# Run initial migration
./scripts/migrate-database.sh migrate --seed

# Or reset database with seed data
./scripts/migrate-database.sh reset --seed --force
```

#### Manual Migration

```bash
# From the solution root directory
dotnet ef database update \
  --project src/DorfkisteBlazor.Infrastructure \
  --startup-project src/DorfkisteBlazor.Server
```

## Database Schema

### Core Entities

#### Users
- **Purpose**: Represents registered users in the system
- **Key Features**: Identity integration, audit trails, admin roles
- **Relationships**: One-to-many with Items, Rentals

#### Categories
- **Purpose**: Organize items into logical groups
- **Key Features**: SEO-friendly slugs, icons, descriptions
- **Pre-seeded Data**: 8 default categories (Electronics, Tools, Sports, etc.)

#### Items
- **Purpose**: Rentable items listed by users
- **Key Features**: Pricing (hourly/daily), location, delivery options, availability
- **Relationships**: Belongs to User and Category, has many Images and Rentals

#### Rentals
- **Purpose**: Booking records for item rentals
- **Key Features**: Payment tracking, status management, delivery options
- **States**: pending → confirmed → active → completed/cancelled

#### Supporting Tables
- **ItemImages**: Photo management for items
- **Reviews**: Rating and feedback system
- **Messages**: Communication between users
- **Payments/Payouts**: Financial transaction records
- **WatchlistItems**: User favorites/watchlist
- **PlatformSettings**: Global application configuration

## Seed Data

The application includes comprehensive seed data for development and testing:

### Categories (8 items)
- Electronics (computers, cameras, phones)
- Tools & Equipment (power tools, construction equipment)
- Sports & Outdoor (bikes, camping gear, sports equipment)
- Home & Garden (furniture, appliances, gardening tools)
- Vehicles (cars, motorcycles, bicycles)
- Party & Events (sound systems, decorations, event supplies)
- Books & Media (books, games, music equipment)
- Fashion & Accessories (clothing, jewelry, bags)

### Test Users (6 users)
- **Admin User**: `admin@dorfkiste.com` / `Admin123!`
- **Regular Users**: 5 test users with different profiles and interests
- **Features**: Pre-configured roles, realistic profile data

### Sample Items (8+ items)
- Professional camera equipment
- Power tools and construction equipment
- Sports and outdoor gear
- Event and party supplies
- **Features**: Realistic pricing, locations across Germany, delivery options

### Platform Settings
- Default platform fee: 10%
- Payment provider configurations (Stripe, PayPal)
- Environment-specific settings

## Configuration

### Connection Strings

#### Development (`appsettings.Development.json`)
```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Server=(localdb)\\mssqllocaldb;Database=DorfkisteBlazor_Dev;Trusted_Connection=True;MultipleActiveResultSets=true;TrustServerCertificate=true",
    "Redis": "localhost:6379"
  }
}
```

#### Production (`appsettings.Production.json`)
```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Server=#{SQL_SERVER}#;Database=#{SQL_DATABASE}#;User Id=#{SQL_USER}#;Password=#{SQL_PASSWORD}#;Encrypt=True;TrustServerCertificate=False;MultipleActiveResultSets=true;Connection Timeout=30;",
    "Redis": "#{REDIS_CONNECTION_STRING}#"
  }
}
```

### Database Settings
```json
{
  "Database": {
    "EnableSensitiveDataLogging": true,     // Development only
    "EnableDetailedErrors": true,           // Development only
    "CommandTimeout": 30,
    "EnableAutomaticMigrations": true,      // Development only
    "SeedTestData": true                    // Development only
  }
}
```

## Repository Pattern

The application uses a comprehensive repository pattern with specialized repositories:

### Generic Repository (`IRepository<T>`)
- Basic CRUD operations
- Paging and filtering
- Query building
- Async operations

### Specialized Repositories

#### ItemRepository (`IItemRepository`)
- Advanced search with filters (category, location, price, availability)
- Geographic queries (items near location)
- Availability checking for date ranges
- Similar item recommendations
- User-specific item queries

#### RentalRepository (`IRentalRepository`)
- Rental history by user (as owner/renter)
- Active and overdue rental queries
- Revenue calculations and statistics
- Date availability checking
- Rental analytics

#### UserRepository (`IUserRepository`)
- User lookup by email
- Top users by activity (renters/owners)
- User statistics and metrics

### Unit of Work Pattern
- Transaction management
- Repository factory
- Batch operations
- Consistent data access

## Health Checks

The application includes comprehensive health checks:

### Database Health Check
- Connection testing
- Basic query validation
- Migration status monitoring
- Performance metrics

### Redis Health Check
- Cache connectivity
- Performance monitoring
- Fallback to in-memory cache

**Health Check Endpoints:**
- `/health` - Overall health status
- `/health/ready` - Readiness probe
- `/health/live` - Liveness probe

## Migration Management

### Adding New Migrations

```bash
# Using scripts
.\migrate-database.ps1 add -MigrationName "AddNewFeature"

# Or manually
dotnet ef migrations add AddNewFeature \
  --project src/DorfkisteBlazor.Infrastructure \
  --startup-project src/DorfkisteBlazor.Server
```

### Removing Migrations

```bash
# Using scripts
.\migrate-database.ps1 remove

# Or manually
dotnet ef migrations remove \
  --project src/DorfkisteBlazor.Infrastructure \
  --startup-project src/DorfkisteBlazor.Server
```

### Generating SQL Scripts

```bash
# For production deployment
.\migrate-database.ps1 script

# Manual approach
dotnet ef migrations script \
  --project src/DorfkisteBlazor.Infrastructure \
  --startup-project src/DorfkisteBlazor.Server \
  --output migration-script.sql \
  --idempotent
```

## Performance Considerations

### Indexes
The migration includes optimized indexes for:
- User email lookup (unique)
- Category slug lookup (unique)
- Item availability and location queries
- Rental date range queries
- Foreign key relationships

### Query Optimization
- Entity Framework query optimization
- Includes for related data
- Projection for large datasets
- Pagination support
- Geographic query optimization

### Caching Strategy
- Redis for distributed caching
- In-memory cache fallback
- Repository-level caching
- Query result caching

## Troubleshooting

### Common Issues

#### LocalDB Connection Issues
```bash
# Check LocalDB instances
sqllocaldb info

# Start LocalDB instance
sqllocaldb start mssqllocaldb
```

#### Migration Conflicts
```bash
# Check migration status
.\migrate-database.ps1 status

# Remove conflicting migration
.\migrate-database.ps1 remove

# Re-add migration
.\migrate-database.ps1 add -MigrationName "FixedMigration"
```

#### Seed Data Issues
- Check `Database.SeedTestData` setting in appsettings
- Verify database seeding service registration
- Check logs for seeding errors

### Logging
The application provides detailed logging for:
- Entity Framework operations
- Migration execution
- Seed data operations
- Repository operations

## Production Deployment

### Pre-Deployment
1. Generate SQL migration scripts
2. Backup existing database
3. Test migrations on staging environment
4. Update connection strings with production values

### Deployment Steps
1. Stop application
2. Run migration scripts
3. Update application
4. Start application
5. Verify health checks

### Post-Deployment
1. Monitor health check endpoints
2. Verify database performance
3. Check application logs
4. Test critical user paths

## Security Considerations

### Database Security
- Use least-privilege database accounts
- Encrypt connection strings
- Enable SQL Server encryption in production
- Regular security updates

### Data Protection
- Audit trail implementation
- Soft delete for sensitive data
- GDPR compliance features
- Data retention policies

## Monitoring

### Performance Metrics
- Database connection pool usage
- Query execution times
- Migration execution tracking
- Health check response times

### Alerting
- Database connectivity issues
- Long-running queries
- Failed migrations
- Health check failures