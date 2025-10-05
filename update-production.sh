#!/bin/bash

# Dorfkiste Production Update Script
# This script updates the production environment with the latest code from Git

set -e  # Exit on error

echo "🚀 Starting Dorfkiste production update..."
echo ""

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Step 1: Pull latest code
echo -e "${YELLOW}📥 Pulling latest code from Git...${NC}"
git fetch origin
git reset --hard origin/master
echo -e "${GREEN}✅ Code updated${NC}"
echo ""

# Step 2: Stop containers
echo -e "${YELLOW}🛑 Stopping containers...${NC}"
docker compose down
echo -e "${GREEN}✅ Containers stopped${NC}"
echo ""

# Step 3: Rebuild images (no cache for clean build)
echo -e "${YELLOW}🔨 Building Docker images (this may take a few minutes)...${NC}"
docker compose build --no-cache
echo -e "${GREEN}✅ Images built${NC}"
echo ""

# Step 4: Start containers
echo -e "${YELLOW}🚀 Starting containers...${NC}"
docker compose up -d
echo -e "${GREEN}✅ Containers started${NC}"
echo ""

# Step 5: Wait for backend to be ready
echo -e "${YELLOW}⏳ Waiting for backend to be ready...${NC}"
sleep 10
echo -e "${GREEN}✅ Backend should be ready${NC}"
echo ""

# Step 6: Show status
echo -e "${YELLOW}📊 Container status:${NC}"
docker compose ps
echo ""

# Step 7: Show recent logs
echo -e "${YELLOW}📋 Recent backend logs:${NC}"
docker compose logs backend --tail 50
echo ""

echo -e "${GREEN}✨ Production update complete!${NC}"
echo -e "🌐 Visit: https://dorfkiste.com"
echo ""
echo "💡 Tips:"
echo "  - Check logs: docker compose logs -f backend"
echo "  - Check status: docker compose ps"
echo "  - Restart: docker compose restart"
