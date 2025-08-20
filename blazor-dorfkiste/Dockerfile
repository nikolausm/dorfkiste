# DorfkisteBlazor - Multi-stage Dockerfile for Production Deployment
# Infrastructure & DevOps Agent Configuration

# ==================================================
# Build Stage
# ==================================================
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src

# Copy project files for restore
COPY ["src/DorfkisteBlazor.Server/DorfkisteBlazor.Server.csproj", "src/DorfkisteBlazor.Server/"]
COPY ["src/DorfkisteBlazor.Application/DorfkisteBlazor.Application.csproj", "src/DorfkisteBlazor.Application/"]
COPY ["src/DorfkisteBlazor.Infrastructure/DorfkisteBlazor.Infrastructure.csproj", "src/DorfkisteBlazor.Infrastructure/"]
COPY ["src/DorfkisteBlazor.Domain/DorfkisteBlazor.Domain.csproj", "src/DorfkisteBlazor.Domain/"]

# Restore dependencies
RUN dotnet restore "src/DorfkisteBlazor.Server/DorfkisteBlazor.Server.csproj"

# Copy all source files
COPY . .

# Build and publish the application
WORKDIR "/src/src/DorfkisteBlazor.Server"
RUN dotnet publish "DorfkisteBlazor.Server.csproj" -c Release -o /app/publish \
    --no-restore \
    --verbosity minimal

# ==================================================
# Runtime Stage
# ==================================================
FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS runtime

# Install additional dependencies for production
RUN apt-get update && apt-get install -y \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Create a non-root user for security
RUN addgroup --system --gid 1001 blazor && \
    adduser --system --uid 1001 --ingroup blazor blazor

WORKDIR /app

# Copy published application
COPY --from=build /app/publish .

# Create directories for data persistence
RUN mkdir -p /app/logs /app/uploads /var/log/dorfkiste && \
    chown -R blazor:blazor /app /var/log/dorfkiste

# Set proper permissions for log directories
VOLUME ["/app/logs", "/app/uploads", "/var/log/dorfkiste"]

# Switch to non-root user
USER blazor

# Configure ASP.NET Core
ENV ASPNETCORE_URLS=http://+:5000
ENV ASPNETCORE_ENVIRONMENT=Production
ENV DOTNET_RUNNING_IN_CONTAINER=true
ENV DOTNET_SYSTEM_GLOBALIZATION_INVARIANT=false

# Health check configuration
HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=3 \
    CMD curl -f http://localhost:5000/health || exit 1

# Expose port
EXPOSE 5000

# Start the application
ENTRYPOINT ["dotnet", "DorfkisteBlazor.Server.dll"]