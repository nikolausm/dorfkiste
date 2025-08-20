#!/bin/bash
# DorfkisteBlazor - Build Script
# Infrastructure & DevOps Agent - Automated Build Pipeline

set -e  # Exit on any error

# ==================================================
# Configuration
# ==================================================
PROJECT_NAME="DorfkisteBlazor"
BUILD_CONFIG="Release"
DOCKER_IMAGE_NAME="dorfkiste-blazor"
DOCKER_TAG="${DOCKER_TAG:-latest}"

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

# ==================================================
# Pre-build Checks
# ==================================================
log_info "Starting ${PROJECT_NAME} build pipeline..."

# Check if .NET is installed
if ! command -v dotnet &> /dev/null; then
    log_error ".NET SDK is not installed or not in PATH"
    exit 1
fi

# Check if Docker is installed (optional)
if ! command -v docker &> /dev/null; then
    log_warning "Docker is not installed. Skipping Docker build."
    SKIP_DOCKER=true
fi

# ==================================================
# Clean Previous Builds
# ==================================================
log_info "Cleaning previous builds..."
dotnet clean --configuration $BUILD_CONFIG --verbosity minimal

# ==================================================
# Restore Dependencies
# ==================================================
log_info "Restoring NuGet packages..."
dotnet restore --verbosity minimal

if [ $? -ne 0 ]; then
    log_error "Failed to restore packages"
    exit 1
fi

# ==================================================
# Security Audit (Optional)
# ==================================================
log_info "Running security audit..."
dotnet list package --vulnerable --include-transitive 2>/dev/null || log_warning "Security audit failed or no vulnerabilities tool available"

# ==================================================
# Build Solution
# ==================================================
log_info "Building solution in $BUILD_CONFIG configuration..."
dotnet build --configuration $BUILD_CONFIG --no-restore --verbosity minimal

if [ $? -ne 0 ]; then
    log_error "Build failed"
    exit 1
fi

log_success "Build completed successfully"

# ==================================================
# Run Tests
# ==================================================
log_info "Running unit tests..."
dotnet test --configuration $BUILD_CONFIG --no-build --verbosity minimal --logger trx --results-directory TestResults

if [ $? -ne 0 ]; then
    log_error "Tests failed"
    exit 1
fi

log_success "All tests passed"

# ==================================================
# Publish Application
# ==================================================
log_info "Publishing application..."
dotnet publish src/DorfkisteBlazor.Server/DorfkisteBlazor.Server.csproj \
    --configuration $BUILD_CONFIG \
    --no-build \
    --output ./publish \
    --verbosity minimal

if [ $? -ne 0 ]; then
    log_error "Publish failed"
    exit 1
fi

log_success "Application published to ./publish"

# ==================================================
# Docker Build (if Docker is available)
# ==================================================
if [ "$SKIP_DOCKER" != true ]; then
    log_info "Building Docker image: ${DOCKER_IMAGE_NAME}:${DOCKER_TAG}"
    
    docker build -t "${DOCKER_IMAGE_NAME}:${DOCKER_TAG}" .
    
    if [ $? -ne 0 ]; then
        log_error "Docker build failed"
        exit 1
    fi
    
    log_success "Docker image built successfully: ${DOCKER_IMAGE_NAME}:${DOCKER_TAG}"
    
    # Tag as latest if not already
    if [ "$DOCKER_TAG" != "latest" ]; then
        docker tag "${DOCKER_IMAGE_NAME}:${DOCKER_TAG}" "${DOCKER_IMAGE_NAME}:latest"
        log_info "Tagged as latest"
    fi
fi

# ==================================================
# Build Summary
# ==================================================
log_success "=== Build Summary ==="
log_info "Project: $PROJECT_NAME"
log_info "Configuration: $BUILD_CONFIG"
log_info "Published to: ./publish"
if [ "$SKIP_DOCKER" != true ]; then
    log_info "Docker image: ${DOCKER_IMAGE_NAME}:${DOCKER_TAG}"
fi
log_success "Build pipeline completed successfully!"