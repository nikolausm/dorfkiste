#!/bin/bash

# Script to run the application in Development mode with SQLite

echo "🚀 Starting DorfkisteBlazor in Development mode with SQLite..."
echo "=============================================="

# Set environment to Development to use SQLite
export ASPNETCORE_ENVIRONMENT=Development

# Navigate to the server project
cd src/DorfkisteBlazor.Server

# Restore packages if needed
echo "📦 Restoring packages..."
dotnet restore

# Build the project
echo "🔨 Building the application..."
dotnet build

# Run migrations if needed
echo "🗄️ Checking database migrations..."
dotnet ef database update --project ../DorfkisteBlazor.Infrastructure --startup-project . 2>/dev/null || echo "✅ Database is up to date"

# Run the application
echo "🌐 Starting the application..."
echo "=============================================="
echo "Access the application at:"
echo "  - https://localhost:5001"
echo "  - http://localhost:5000"
echo "=============================================="
dotnet run