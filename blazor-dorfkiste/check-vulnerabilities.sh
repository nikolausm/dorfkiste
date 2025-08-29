#!/bin/bash

echo "Checking for vulnerable packages..."
echo "======================================"

# Stop any running dotnet processes
pkill -f "dotnet run" || true

cd /Users/michaelnikolaus/RiderProjects/dorfkiste/blazor-dorfkiste

echo "Running vulnerability scan..."
dotnet list package --vulnerable --include-transitive

echo ""
echo "Checking outdated packages..."
dotnet list package --outdated --include-transitive

echo ""
echo "Checking package references in all projects..."
find . -name "*.csproj" -exec echo "=== {} ===" \; -exec cat {} \;