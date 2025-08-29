#!/bin/bash

echo "Stopping any running dotnet processes..."
pkill -f "dotnet run" || true
sleep 2

echo "Restoring packages after security updates..."
echo "========================================="

cd /Users/michaelnikolaus/RiderProjects/dorfkiste/blazor-dorfkiste

echo "Running dotnet restore..."
dotnet restore

echo ""
echo "Checking for any remaining vulnerabilities..."
dotnet list package --vulnerable --include-transitive

echo ""
echo "Build test to ensure compatibility..."
dotnet build --no-restore

echo ""
echo "Running basic tests..."
dotnet test --no-build --verbosity minimal

echo ""
echo "Package restore and security update complete!"