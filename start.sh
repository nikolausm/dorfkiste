#!/bin/bash

# Dorfkiste Startup Script
echo "🚀 Starting Dorfkiste Application..."

# Check if port 3000 is in use
if lsof -Pi :3000 -sTCP:LISTEN -t >/dev/null ; then
    echo "⚠️  Port 3000 is already in use. Killing existing process..."
    lsof -ti:3000 | xargs kill -9
    sleep 2
fi

# Check if PostgreSQL is running
if ! pg_isready -q; then
    echo "⚠️  PostgreSQL is not running. Please start it first."
    exit 1
fi

# Check if Redis is running (optional)
if ! redis-cli ping >/dev/null 2>&1; then
    echo "⚠️  Redis is not running. Some features may be limited."
    echo "   To start Redis: redis-server --daemonize yes"
fi

# Install dependencies if needed
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
fi

# Generate Prisma client if needed
if [ ! -d "node_modules/.prisma/client" ]; then
    echo "🔧 Generating Prisma client..."
    npm run prisma:generate
fi

# Check if database needs migration
echo "🗄️  Checking database migrations..."
npx prisma migrate deploy

# Start the application
echo "✅ Starting Next.js on port 3000..."
echo "📱 Open http://localhost:3000 in your browser"
echo ""
echo "Available commands:"
echo "  - Press Ctrl+C to stop"
echo "  - npm run prisma:studio - Open Prisma Studio"
echo "  - npm run test - Run tests"
echo ""

npm run dev