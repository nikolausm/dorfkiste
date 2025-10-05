#!/bin/bash

# Dorfkiste Production Update Script
# This script updates the production environment with the latest code from Git
# PRESERVES DATABASE AND VOLUMES

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

# Step 2: Backup database (optional but recommended)
echo -e "${YELLOW}💾 Creating database backup...${NC}"
BACKUP_FILE="backups/dorfkiste-$(date +%Y%m%d-%H%M%S).db"
mkdir -p backups
docker exec dorfkiste-backend cp /app/data/dorfkiste.db /app/data/backup.db 2>/dev/null || echo "No existing database to backup"
docker cp dorfkiste-backend:/app/data/backup.db "$BACKUP_FILE" 2>/dev/null || echo "Skipping backup"
if [ -f "$BACKUP_FILE" ]; then
    echo -e "${GREEN}✅ Database backed up to $BACKUP_FILE${NC}"
else
    echo -e "${YELLOW}⚠️  No database backup created (this is OK for first deployment)${NC}"
fi
echo ""

# Step 3: Build new images (with cache for faster builds)
echo -e "${YELLOW}🔨 Building Docker images...${NC}"
docker compose build
echo -e "${GREEN}✅ Images built${NC}"
echo ""

# Step 4: Restart containers (this keeps volumes!)
echo -e "${YELLOW}🔄 Restarting containers...${NC}"
docker compose up -d
echo -e "${GREEN}✅ Containers restarted${NC}"
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
echo "  - Database backups: ls -lh backups/"
