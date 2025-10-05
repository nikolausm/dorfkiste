#!/bin/bash

# Fresh deployment script - resets database and deploys latest code
# Run this on the production server

set -e

SERVER="dorfkiste@194.164.199.151"

echo "🚀 Starting fresh deployment to production..."
echo ""

ssh $SERVER << 'EOF'
set -e

cd /home/dorfkiste/dorfkiste

echo "📥 Pulling latest code..."
git fetch origin
git reset --hard origin/master

echo "🛑 Stopping containers..."
docker compose down

echo "🗑️  Removing old database..."
docker volume rm dorfkiste_backend-data || true

echo "🧹 Cleaning up old images..."
docker compose rm -f
docker rmi dorfkiste-backend dorfkiste-frontend 2>/dev/null || true

echo "🔨 Building fresh images (this will take a few minutes)..."
docker compose build --no-cache

echo "🚀 Starting containers..."
docker compose up -d

echo "⏳ Waiting for backend to initialize..."
sleep 15

echo "📊 Container status:"
docker compose ps

echo ""
echo "📋 Backend logs:"
docker compose logs backend --tail 30

echo ""
echo "✨ Deployment complete!"
echo "🌐 Visit: https://dorfkiste.org"
echo ""
echo "👤 Default admin login:"
echo "   Email: admin@dorfkiste.de"
echo "   Password: Admin123!"

EOF

echo ""
echo "✅ Deployment script finished!"
