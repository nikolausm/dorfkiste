#!/bin/bash
# Deployment script for Dorfkiste production server
# Usage: ./deploy-to-production.sh

echo "🚀 Starting deployment to production server..."
echo ""

# SSH connection details
SERVER="dorfkiste@194.164.199.151"
PROJECT_DIR="/home/dorfkiste/dorfkiste"

# Connect and deploy
ssh $SERVER << 'EOF'
echo "📂 Navigating to project directory..."
cd /home/dorfkiste/dorfkiste

echo "📥 Pulling latest changes from GitHub..."
git pull origin master

echo "🛑 Stopping containers..."
docker compose down

echo "🔨 Building containers..."
docker compose build

echo "🚀 Starting containers..."
docker compose up -d

echo ""
echo "✅ Deployment complete!"
echo ""
echo "🌐 Your application should now be running at:"
echo "   https://dorfkiste.org"
echo ""
echo "📊 Check container status:"
docker compose ps
EOF

echo ""
echo "✨ Deployment script finished!"
