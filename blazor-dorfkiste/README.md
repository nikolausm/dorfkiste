# DorfkisteBlazor - Clean Architecture Implementation

## Overview

This is a Blazor Server application following Clean Architecture principles with CQRS pattern implementation.

## Architecture

### Solution Structure

```
DorfkisteBlazor/
├── src/
│   ├── DorfkisteBlazor.Domain/          # Enterprise business rules
│   ├── DorfkisteBlazor.Application/     # Application business rules
│   ├── DorfkisteBlazor.Infrastructure/  # External concerns
│   └── DorfkisteBlazor.Server/          # Presentation layer (Blazor Server)
└── tests/
    ├── DorfkisteBlazor.Domain.Tests/
    ├── DorfkisteBlazor.Application.Tests/
    ├── DorfkisteBlazor.Infrastructure.Tests/
    └── DorfkisteBlazor.IntegrationTests/
```

### Layer Responsibilities

#### Domain Layer
- **Purpose**: Contains enterprise-wide business rules and logic
- **Components**:
  - Entities (BaseEntity with audit fields)
  - Value Objects
  - Domain Interfaces (IRepository, IUnitOfWork)
  - Domain Exceptions
  - Enums and Constants

#### Application Layer
- **Purpose**: Contains application-specific business rules
- **Components**:
  - CQRS Implementation (Commands/Queries)
  - DTOs (Data Transfer Objects)
  - Application Interfaces
  - AutoMapper Profiles
  - FluentValidation Validators
  - MediatR Pipeline Behaviors

#### Infrastructure Layer
- **Purpose**: Contains all external concerns
- **Components**:
  - Entity Framework Core Implementation
  - Repository Pattern Implementation
  - Unit of Work Pattern
  - ASP.NET Core Identity
  - External Service Integrations (Email, Storage)
  - Data Migrations

#### Server Layer (Presentation)
- **Purpose**: Blazor Server UI and API endpoints
- **Components**:
  - Blazor Components and Pages
  - MudBlazor UI Framework
  - Authentication/Authorization
  - API Controllers
  - SignalR Hubs

## Key Patterns & Technologies

### Design Patterns
1. **Repository Pattern**: Generic repository for data access abstraction
2. **Unit of Work**: Transaction management and repository coordination
3. **CQRS**: Command Query Responsibility Segregation with MediatR
4. **Result Pattern**: Consistent error handling without exceptions

### Technologies
- **.NET 8.0**: Latest framework version
- **Blazor Server**: Real-time UI with server-side rendering
- **Entity Framework Core 8**: ORM with SQL Server
- **MediatR**: CQRS implementation
- **AutoMapper**: Object mapping
- **FluentValidation**: Input validation
- **MudBlazor**: Material Design components
- **ASP.NET Core Identity**: Authentication/Authorization
- **Serilog**: Structured logging
- **Redis**: Distributed caching (optional)

### Cross-Cutting Concerns
1. **Validation**: FluentValidation with MediatR pipeline
2. **Logging**: Serilog with request/response logging
3. **Performance Monitoring**: Performance behavior tracking
4. **Audit Trail**: Automatic tracking of entity changes
5. **Soft Delete**: ISoftDeletable interface implementation

## Getting Started

### Prerequisites
- .NET 8.0 SDK
- SQL Server (LocalDB or full instance)
- Visual Studio 2022 or Rider
- Redis (optional, for distributed caching)

### Setup Instructions

1. **Clone the repository**
   ```bash
   cd blazor-dorfkiste
   ```

2. **Update connection string**
   Edit `appsettings.json` in the Server project:
   ```json
   "ConnectionStrings": {
     "DefaultConnection": "Your SQL Server connection string"
   }
   ```

3. **Run migrations**
   ```bash
   cd src/DorfkisteBlazor.Server
   dotnet ef database update
   ```

4. **Run the application**
   ```bash
   dotnet run
   ```

5. **Access the application**
   Navigate to https://localhost:5001

## Development Guidelines

### Adding New Features

1. **Domain Entity**: Create in Domain/Entities
2. **Repository Interface**: Add to Domain/Interfaces if needed
3. **Commands/Queries**: Create in Application/Features/{Feature}
4. **Validators**: Add FluentValidation rules
5. **DTOs**: Create in Application/DTOs
6. **API Endpoints**: Add controllers or minimal APIs
7. **UI Components**: Create Blazor components

### Testing Strategy
- **Unit Tests**: Domain logic and Application handlers
- **Integration Tests**: Infrastructure and database
- **UI Tests**: Blazor component testing
- **E2E Tests**: Full user workflows

### Best Practices
1. Keep Domain layer free of external dependencies
2. Use DTOs for data transfer between layers
3. Implement validation at Application layer
4. Handle exceptions globally
5. Use async/await throughout
6. Follow SOLID principles
7. Write tests first (TDD approach)

## Configuration

### Application Settings
- **Email**: SendGrid integration
- **Storage**: Azure Blob Storage
- **Caching**: Redis or In-Memory
- **Authentication**: ASP.NET Core Identity with external providers

### Environment-Specific Settings
- Development: `appsettings.Development.json`
- Production: `appsettings.Production.json`

## Deployment

### Docker Support
Dockerfile and docker-compose files can be added for containerization.

### Azure Deployment
- Azure App Service for Blazor Server
- Azure SQL Database
- Azure Redis Cache
- Azure Blob Storage

## Contributing

1. Follow the established architecture patterns
2. Write unit tests for new features
3. Update documentation
4. Submit pull requests for review

## License

[Your License Here]