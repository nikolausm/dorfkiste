#!/bin/bash

# ========================================
# Dorfkiste Starter Script
# Startet Traefik + Dorfkiste
# ========================================

set -e

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

print_success() { echo -e "${GREEN}✓ $1${NC}"; }
print_info() { echo -e "${YELLOW}→ $1${NC}"; }

echo "=========================================="
echo "  🚀 Dorfkiste wird gestartet..."
echo "=========================================="
echo ""

cd /opt/dorfkiste

# Traefik starten
print_info "Traefik (Reverse Proxy + SSL) wird gestartet..."
docker-compose -f docker-compose.traefik.yml up -d
print_success "Traefik läuft"

sleep 3

# Dorfkiste starten
print_info "Dorfkiste wird gebaut und gestartet..."
print_info "Dies dauert beim ersten Mal ca. 5-10 Minuten..."
docker-compose up --build -d

echo ""
print_success "Dorfkiste wurde gestartet!"
echo ""
echo "=========================================="
echo "  📊 Container Status:"
echo "=========================================="
docker-compose ps
echo ""
echo "=========================================="
echo "  📝 Logs anschauen:"
echo "=========================================="
echo "  docker-compose logs -f"
echo ""
echo "=========================================="
echo "  🌐 Webseite:"
echo "=========================================="
echo "  https://dorfkiste.org"
echo ""
echo "⏳ SSL-Zertifikat wird im Hintergrund erstellt (1-2 Min)"
echo ""
