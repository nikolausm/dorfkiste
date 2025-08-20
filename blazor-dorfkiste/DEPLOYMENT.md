# DorfkisteBlazor - Deployment Guide
**Infrastructure & DevOps Agent Configuration**

## 🚀 Quick Start

### Prerequisites
- Docker & Docker Compose
- .NET 8.0 SDK (for development)
- Git

### Development Deployment
```bash
# Clone repository
git clone <repository-url>
cd blazor-dorfkiste

# Copy environment configuration
cp .env.example .env
# Edit .env with your settings

# Deploy with development tools
ENVIRONMENT=development ./scripts/deploy.sh
```

### Production Deployment
```bash
# Copy environment configuration
cp .env.example .env
# Configure production values in .env

# Deploy to production
ENVIRONMENT=production ./scripts/deploy.sh
```

## 📁 Infrastructure Overview

### Architecture Components
```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Nginx Proxy   │    │  Blazor Server  │    │   SQL Server    │
│    Port 80/443  │────│    Port 5000    │────│    Port 1433    │
└─────────────────┘    └─────────────────┘    └─────────────────┘
                              │
                              │
                       ┌─────────────────┐
                       │   Redis Cache   │
                       │    Port 6379    │
                       └─────────────────┘
```

### Directory Structure
```
.
├── Dockerfile                    # Multi-stage container build
├── docker-compose.yml           # Production configuration
├── docker-compose.override.yml  # Development overrides
├── .env.example                 # Environment template
├── nginx/
│   ├── nginx.conf               # Reverse proxy configuration
│   └── ssl/                     # SSL certificates
├── scripts/
│   ├── build.sh                 # Automated build pipeline
│   ├── deploy.sh                # Deployment automation
│   └── init-db.sql              # Database initialization
└── src/                         # Application source code
```

## 🔧 Configuration

### Environment Variables

#### Core Application
- `ASPNETCORE_ENVIRONMENT`: Production/Development
- `BASE_URL`: Public application URL
- `ALLOWED_HOSTS`: Comma-separated hostnames

#### Database Configuration
- `SQL_SERVER`: Database server hostname
- `SQL_DATABASE`: Database name
- `SQL_USER`: Database username
- `SQL_PASSWORD`: Database password

#### External Services
- `AZURE_STORAGE_CONNECTION_STRING`: Azure Storage for file uploads
- `SENDGRID_API_KEY`: Email service API key
- `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`: OAuth authentication
- `FACEBOOK_APP_ID`, `FACEBOOK_APP_SECRET`: OAuth authentication

#### Security
- `JWT_SECRET_KEY`: JWT token signing key
- `JWT_ISSUER`, `JWT_AUDIENCE`: JWT validation settings

### Port Configuration
- **80/443**: Nginx reverse proxy (public)
- **5000**: Application HTTP (internal)
- **5001**: Application HTTPS (development)
- **1433**: SQL Server (internal)
- **6379**: Redis cache (internal)

### Development Tools (Development Mode Only)
- **8080**: Adminer (database management)
- **8081**: Redis Commander (cache management)
- **5341**: Seq (structured logging)

## 🐳 Docker Configuration

### Multi-Stage Dockerfile
1. **Build Stage**: Compiles .NET application
2. **Runtime Stage**: Creates optimized production image

### Container Features
- ✅ Non-root user for security
- ✅ Health checks for monitoring
- ✅ Volume mounts for data persistence
- ✅ Optimized for production performance

### Networks
- **dorfkiste-network**: Isolated container network (172.20.0.0/16)

### Volumes
- **sqlserver-data**: Database persistence
- **redis-data**: Cache persistence
- **app-logs**: Application logging
- **app-uploads**: File upload storage
- **dorfkiste-logs**: System logging

## 🔨 Build Pipeline

### Automated Build Script (`scripts/build.sh`)
1. **Environment Check**: Validates .NET SDK and Docker
2. **Clean**: Removes previous build artifacts
3. **Restore**: Downloads NuGet packages
4. **Security Audit**: Checks for vulnerable packages
5. **Build**: Compiles solution in Release mode
6. **Test**: Runs unit test suite
7. **Publish**: Creates deployment artifacts
8. **Docker Build**: Creates container image

### Build Commands
```bash
# Full automated build
./scripts/build.sh

# Manual build steps
dotnet clean --configuration Release
dotnet restore
dotnet build --configuration Release
dotnet test --configuration Release
dotnet publish src/DorfkisteBlazor.Server/DorfkisteBlazor.Server.csproj -c Release -o ./publish
```

## 🚀 Deployment Pipeline

### Automated Deployment Script (`scripts/deploy.sh`)
1. **Prerequisites Check**: Docker, Docker Compose, environment file
2. **Environment Preparation**: Directories, SSL certificates (dev)
3. **Service Deployment**: Starts all containers
4. **Health Verification**: Waits for services to be ready
5. **Database Migration**: Automatic schema updates
6. **Status Report**: Service URLs and health status

### Deployment Commands
```bash
# Development deployment
ENVIRONMENT=development ./scripts/deploy.sh

# Production deployment
ENVIRONMENT=production ./scripts/deploy.sh

# Manual deployment
docker-compose up -d --build

# View logs
docker-compose logs -f dorfkiste-app

# Stop services
docker-compose down
```

## 🔐 Security Configuration

### SSL/TLS Setup
- **Development**: Self-signed certificates (auto-generated)
- **Production**: Custom certificates in `nginx/ssl/`

### Network Security
- Container isolation with dedicated network
- Internal service communication only
- Nginx reverse proxy with security headers

### Application Security
- Health checks for monitoring
- Non-root container execution
- Secret management via environment variables
- Rate limiting on API endpoints

## 📊 Monitoring & Logging

### Health Checks
- **Application**: `/health` endpoint
- **Database**: SQL Server ping
- **Cache**: Redis ping
- **Web Server**: Nginx status

### Logging Configuration
- **Serilog**: Structured application logging
- **Console**: Development output
- **File**: Persistent log storage
- **Seq**: Development log aggregation (optional)

### Log Locations
- Application: `/app/logs/` (container), `./logs/` (host)
- System: `/var/log/dorfkiste/`
- Nginx: Standard Docker logging

## 🛠️ Troubleshooting

### Common Issues

#### Build Failures
```bash
# Check .NET version
dotnet --version

# Clean and rebuild
dotnet clean
dotnet restore --force
```

#### Container Issues
```bash
# Check container status
docker-compose ps

# View container logs
docker-compose logs <service-name>

# Restart specific service
docker-compose restart <service-name>
```

#### Database Connection Issues
```bash
# Test SQL Server connection
docker-compose exec sqlserver /opt/mssql-tools/bin/sqlcmd -S localhost -U sa -P "$SQL_PASSWORD" -Q "SELECT 1"

# View database logs
docker-compose logs sqlserver
```

#### Performance Issues
```bash
# Check resource usage
docker stats

# Monitor application logs
docker-compose logs -f dorfkiste-app

# Check health endpoints
curl http://localhost:5000/health
```

### Service URLs

#### Production
- Application: `http://localhost` or your configured domain
- Health Check: `http://localhost/health`

#### Development
- Application: `http://localhost:5000` (HTTP), `https://localhost:5001` (HTTPS)
- Database Admin: `http://localhost:8080`
- Redis Admin: `http://localhost:8081`
- Logs: `http://localhost:5341`

## 🔄 Maintenance

### Regular Tasks
```bash
# Update containers
docker-compose pull
docker-compose up -d

# Clean up unused images
docker system prune

# Backup database
docker-compose exec sqlserver /opt/mssql-tools/bin/sqlcmd -S localhost -U sa -P "$SQL_PASSWORD" -Q "BACKUP DATABASE [DorfkisteBlazor] TO DISK = '/tmp/backup.bak'"

# View disk usage
docker system df
```

### Scaling
```bash
# Scale application instances
docker-compose up -d --scale dorfkiste-app=3

# Load balancer configuration required for multiple instances
```

## 📚 Additional Resources

### Documentation
- [ASP.NET Core Docker Guide](https://docs.microsoft.com/en-us/dotnet/core/docker/)
- [Docker Compose Reference](https://docs.docker.com/compose/)
- [Nginx Configuration](https://nginx.org/en/docs/)

### Security
- [.NET Security Best Practices](https://docs.microsoft.com/en-us/dotnet/standard/security/)
- [Docker Security](https://docs.docker.com/engine/security/)
- [OWASP Top 10](https://owasp.org/www-project-top-ten/)

---

**Infrastructure & DevOps Agent**  
*Production-ready deployment configuration for DorfkisteBlazor*