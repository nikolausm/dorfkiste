# DorfkisteBlazor Test Suite

Comprehensive test suite following TDD principles and modern testing best practices for the DorfkisteBlazor application.

## 📊 Test Coverage Overview

### Test Architecture
- **Domain Tests**: Entity validation and business logic
- **Application Tests**: CQRS handlers and service layer
- **Infrastructure Tests**: Repository patterns and database integration
- **Server Tests**: API controllers, SignalR hubs, and Blazor components
- **E2E Tests**: Complete user journeys with Playwright

## 🧪 Test Projects

### 1. DorfkisteBlazor.Domain.Tests
**Unit tests for domain entities and business logic**

- **Entity Tests**: Validation for Item, User, Rental, Category, Review, Payment entities
- **Test Data Builders**: Bogus-based test data generation with builder pattern
- **Coverage**: Business rules, entity validation, domain logic

**Key Files:**
- `TestFixtures/TestDataBuilder.cs` - Comprehensive test data builders
- `Entities/ItemTests.cs` - Item entity validation tests
- `Entities/UserTests.cs` - User entity validation tests
- `Entities/RentalTests.cs` - Rental business logic tests

### 2. DorfkisteBlazor.Application.Tests
**Unit tests for CQRS handlers and application services**

- **Query Handler Tests**: GetItemsQueryHandler with filtering, sorting, pagination
- **Command Handler Tests**: CreateRentalCommandHandler with business validation
- **Mock Repositories**: In-memory testing with AutoFixture and Moq
- **Coverage**: CQRS patterns, application logic, error handling

**Key Files:**
- `TestFixtures/MockRepository.cs` - Mock repository factory
- `Features/Items/GetItemsQueryHandlerTests.cs` - Query handler tests
- `Features/Rentals/CreateRentalCommandHandlerTests.cs` - Command handler tests

### 3. DorfkisteBlazor.Infrastructure.Tests
**Integration tests for data access and infrastructure**

- **Repository Integration**: Real database operations with test containers
- **Database Tests**: PostgreSQL integration with Testcontainers
- **Unit of Work**: Transaction handling and data consistency
- **Coverage**: Data access patterns, database operations, concurrency

**Key Files:**
- `Repositories/RepositoryIntegrationTests.cs` - Full repository integration tests

### 4. DorfkisteBlazor.Server.Tests
**Integration tests for web API and Blazor components**

- **API Controller Tests**: HTTP endpoints with WebApplicationFactory
- **SignalR Hub Tests**: Real-time communication testing
- **Component Tests**: Blazor component rendering with bUnit
- **Coverage**: HTTP APIs, real-time features, UI components

**Key Files:**
- `TestFixtures/CustomWebApplicationFactory.cs` - Test server setup
- `Controllers/ItemsControllerTests.cs` - Items API integration tests
- `Controllers/RentalsControllerTests.cs` - Rentals API integration tests
- `Hubs/MessageHubTests.cs` - SignalR hub integration tests
- `Components/BlazorComponentTests.cs` - Blazor component unit tests

### 5. DorfkisteBlazor.E2E.Tests
**End-to-end tests for complete user journeys**

- **User Journeys**: Registration, login, item browsing, rental booking
- **Cross-Browser Testing**: Chrome, Firefox, Safari, mobile viewports
- **Performance Testing**: Load times and responsiveness
- **Coverage**: Complete user workflows, accessibility, performance

**Key Files:**
- `TestFixtures/PlaywrightTestBase.cs` - E2E test foundation
- `UserJourneyTests.cs` - Complete user workflow tests
- `playwright.config.js` - Playwright configuration

## 🚀 Running Tests

### Prerequisites
```bash
# Install .NET 8 SDK
dotnet --version  # Should be 8.0 or higher

# Install Playwright browsers (for E2E tests)
npx playwright install

# Ensure Docker is running (for test containers)
docker --version
```

### Run All Tests
```bash
# From the tests directory
dotnet test

# Or from solution root
dotnet test blazor-dorfkiste/tests/DorfkisteBlazor.Tests.sln
```

### Run Specific Test Projects
```bash
# Domain tests only
dotnet test DorfkisteBlazor.Domain.Tests/

# Application tests only
dotnet test DorfkisteBlazor.Application.Tests/

# Infrastructure tests (requires Docker)
dotnet test DorfkisteBlazor.Infrastructure.Tests/

# Server integration tests
dotnet test DorfkisteBlazor.Server.Tests/

# E2E tests (requires running application)
dotnet test DorfkisteBlazor.E2E.Tests/
```

### Run with Coverage
```bash
# Generate coverage report
dotnet test --collect:"XPlat Code Coverage" --results-directory:"./TestResults"

# Generate HTML coverage report (requires reportgenerator)
dotnet tool install --global dotnet-reportgenerator-globaltool
reportgenerator -reports:"./TestResults/*/coverage.cobertura.xml" -targetdir:"./TestResults/html" -reporttypes:Html
```

## 📈 Test Patterns and Best Practices

### 1. Test-Driven Development (TDD)
- **Red-Green-Refactor**: Write failing tests first, implement, then refactor
- **Test Naming**: `Method_Scenario_ExpectedResult` pattern
- **Arrange-Act-Assert**: Clear test structure with proper separation

### 2. Test Data Management
- **Builder Pattern**: Fluent test data creation with sensible defaults
- **Bogus Library**: Realistic fake data generation
- **Test Fixtures**: Reusable test setup and teardown

### 3. Mocking and Isolation
- **Repository Mocking**: In-memory implementations for unit tests
- **Service Mocking**: Moq for external dependencies
- **Database Isolation**: Test containers for integration tests

### 4. Integration Testing
- **WebApplicationFactory**: In-memory test server for API tests
- **Test Containers**: Real database instances for integration tests
- **SignalR Testing**: Real-time communication validation

### 5. E2E Testing
- **Page Object Model**: Reusable page abstractions
- **Cross-Browser Testing**: Multiple browser and device support
- **Visual Testing**: Screenshot capture for debugging

## 🎯 Test Quality Metrics

### Coverage Targets
- **Unit Tests**: 80%+ code coverage
- **Integration Tests**: 70%+ critical path coverage
- **E2E Tests**: 100% critical user journey coverage

### Quality Gates
- All tests must pass before deployment
- No failing tests in CI/CD pipeline
- Performance tests must meet SLA requirements
- Security tests validate authentication and authorization

## 🔧 Configuration

### Test Settings
- **Environment**: `Testing` environment for all test runs
- **Database**: In-memory for unit tests, containers for integration
- **Authentication**: Mock JWT tokens for testing
- **Logging**: Console output for test debugging

### CI/CD Integration
```yaml
# Example GitHub Actions workflow
- name: Run Tests
  run: |
    dotnet test --configuration Release --logger trx --results-directory "TestResults"
    dotnet test DorfkisteBlazor.E2E.Tests/ --configuration Release
```

## 🐛 Debugging Tests

### Common Issues
1. **Test Container Failures**: Ensure Docker is running
2. **SignalR Connection Issues**: Check WebSocket support
3. **E2E Test Timeouts**: Verify application startup
4. **Authentication Failures**: Check JWT token generation

### Debugging Tools
- **Visual Studio Test Explorer**: Interactive test running and debugging
- **Playwright Inspector**: E2E test debugging with UI
- **Test Logs**: Detailed output for test failures
- **Screenshots**: Visual debugging for E2E tests

## 📚 Testing Resources

### Documentation
- [NUnit Documentation](https://docs.nunit.org/)
- [Playwright .NET Documentation](https://playwright.dev/dotnet/)
- [bUnit Documentation](https://bunit.dev/)
- [Testcontainers Documentation](https://testcontainers.com/)

### Best Practices
- Write tests before implementation (TDD)
- Keep tests fast, isolated, and deterministic
- Use descriptive test names and clear assertions
- Maintain test code quality equal to production code
- Regular test review and refactoring

## 🤝 Contributing

When adding new tests:
1. Follow existing naming conventions
2. Use appropriate test categories (Unit, Integration, E2E)
3. Include proper documentation and comments
4. Ensure tests are reliable and maintainable
5. Update coverage metrics and documentation