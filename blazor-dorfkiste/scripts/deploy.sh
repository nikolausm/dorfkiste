#!/bin/bash
# DorfkisteBlazor - Deployment Script
# Infrastructure & DevOps Agent - Production Deployment

set -e  # Exit on any error

# ==================================================
# Configuration
# ==================================================
ENVIRONMENT="${ENVIRONMENT:-production}"
DOCKER_COMPOSE_FILE="docker-compose.yml"
PROJECT_NAME="dorfkiste"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# ==================================================
# Functions
# ==================================================
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

check_prerequisites() {
    log_info "Checking prerequisites..."
    
    # Check Docker
    if ! command -v docker &> /dev/null; then
        log_error "Docker is not installed"
        exit 1
    fi
    
    # Check Docker Compose
    if ! command -v docker-compose &> /dev/null; then
        log_error "Docker Compose is not installed"
        exit 1
    fi
    
    # Check environment file
    if [ ! -f .env ]; then
        log_warning "No .env file found. Creating from template..."
        if [ -f .env.example ]; then
            cp .env.example .env
            log_warning "Please edit .env file with your configuration before deployment"
            exit 1
        else
            log_error "No .env.example file found"
            exit 1
        fi
    fi
    
    log_success "Prerequisites check completed"
}

prepare_environment() {
    log_info "Preparing environment for $ENVIRONMENT deployment..."
    
    # Create necessary directories
    mkdir -p logs uploads nginx/ssl
    
    # Set proper permissions
    chmod 755 logs uploads
    
    # Generate SSL certificates if they don't exist (for development)
    if [ "$ENVIRONMENT" = "development" ] && [ ! -f nginx/ssl/dorfkiste.crt ]; then
        log_info "Generating self-signed SSL certificates for development..."
        openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
            -keyout nginx/ssl/dorfkiste.key \
            -out nginx/ssl/dorfkiste.crt \
            -subj "/C=DE/ST=Germany/L=City/O=Dorfkiste/CN=localhost"
        
        log_success "SSL certificates generated"
    fi
    
    log_success "Environment prepared"
}

deploy_application() {
    log_info "Deploying DorfkisteBlazor to $ENVIRONMENT..."
    
    # Build and start services
    if [ "$ENVIRONMENT" = "production" ]; then
        docker-compose -f $DOCKER_COMPOSE_FILE up -d --build
    else
        docker-compose -f $DOCKER_COMPOSE_FILE -f docker-compose.override.yml up -d --build
    fi
    
    if [ $? -ne 0 ]; then
        log_error "Deployment failed"
        exit 1
    fi
    
    log_success "Services started successfully"
}

wait_for_services() {
    log_info "Waiting for services to be ready..."
    
    # Wait for SQL Server
    log_info "Waiting for SQL Server..."
    docker-compose exec -T sqlserver /opt/mssql-tools/bin/sqlcmd -S localhost -U sa -P "$SQL_PASSWORD" -Q "SELECT 1" || {
        log_warning "SQL Server not ready yet, continuing..."
    }
    
    # Wait for Redis
    log_info "Waiting for Redis..."
    docker-compose exec -T redis redis-cli ping || {
        log_warning "Redis not ready yet, continuing..."
    }
    
    # Wait for main application
    log_info "Waiting for main application..."
    for i in {1..30}; do
        if curl -f http://localhost:5000/health >/dev/null 2>&1; then
            log_success "Application is ready"
            break
        fi
        
        if [ $i -eq 30 ]; then
            log_error "Application did not start within expected time"
            show_logs
            exit 1
        fi
        
        log_info "Attempt $i/30: Waiting for application to start..."
        sleep 10
    done
}

run_migrations() {
    log_info "Running database migrations..."
    
    # The application will run migrations automatically on startup
    # But we can also run them manually if needed
    log_info "Migrations will be run automatically by the application"
}

show_status() {
    log_info "=== Deployment Status ==="
    docker-compose ps
    
    log_info "=== Service URLs ==="
    echo "Application: http://localhost:5000"
    echo "Application (HTTPS): https://localhost:5001"
    
    if [ "$ENVIRONMENT" = "development" ]; then
        echo "SQL Server: localhost:1433"
        echo "Redis: localhost:6379"
        echo "Adminer (DB Admin): http://localhost:8080"
        echo "Redis Commander: http://localhost:8081"
        echo "Seq (Logs): http://localhost:5341"
    fi
}

show_logs() {
    log_info "=== Recent Logs ==="
    docker-compose logs --tail=20 dorfkiste-app
}

# ==================================================
# Main Deployment Flow
# ==================================================
log_info "Starting deployment to $ENVIRONMENT environment..."

check_prerequisites
prepare_environment
deploy_application
wait_for_services
run_migrations
show_status

log_success "=== Deployment Completed Successfully ==="
log_info "The application is now running and accessible."

if [ "$ENVIRONMENT" = "development" ]; then
    log_info "Development tools are also available (see URLs above)."
fi

log_info "To view logs: docker-compose logs -f dorfkiste-app"
log_info "To stop services: docker-compose down"