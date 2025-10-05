#!/bin/bash

# Dorfkiste Deployment Script für IONOS VPS mit Debian 12
# Autor: Claude Code
# Datum: 3. Oktober 2025

set -e  # Exit bei Fehler

echo "=========================================="
echo "  Dorfkiste Deployment auf IONOS VPS"
echo "  Debian 12 (Bookworm)"
echo "=========================================="
echo ""

# Farben für Output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Funktion für farbige Ausgabe
print_success() {
    echo -e "${GREEN}✓ $1${NC}"
}

print_error() {
    echo -e "${RED}✗ $1${NC}"
}

print_info() {
    echo -e "${YELLOW}→ $1${NC}"
}

# 1. System Update
print_info "System wird aktualisiert..."
sudo apt-get update -y
sudo apt-get upgrade -y
print_success "System aktualisiert"

# 2. Docker installieren
if ! command -v docker &> /dev/null; then
    print_info "Docker wird installiert..."

    # Alte Docker-Versionen entfernen
    sudo apt-get remove -y docker docker-engine docker.io containerd runc 2>/dev/null || true

    # Dependencies installieren
    sudo apt-get install -y \
        ca-certificates \
        curl \
        gnupg \
        lsb-release

    # Docker GPG Key hinzufügen
    sudo install -m 0755 -d /etc/apt/keyrings
    curl -fsSL https://download.docker.com/linux/debian/gpg | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg
    sudo chmod a+r /etc/apt/keyrings/docker.gpg

    # Docker Repository hinzufügen
    echo \
      "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/debian \
      $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

    # Docker installieren
    sudo apt-get update -y
    sudo apt-get install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin

    # Docker ohne sudo ermöglichen
    sudo usermod -aG docker $USER

    print_success "Docker installiert"
else
    print_success "Docker bereits installiert"
fi

# 3. Docker Compose installieren (standalone)
if ! command -v docker-compose &> /dev/null; then
    print_info "Docker Compose wird installiert..."
    sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
    sudo chmod +x /usr/local/bin/docker-compose
    print_success "Docker Compose installiert"
else
    print_success "Docker Compose bereits installiert"
fi

# 4. Firewall einrichten (UFW)
if ! command -v ufw &> /dev/null; then
    print_info "UFW Firewall wird installiert..."
    sudo apt-get install -y ufw
fi

print_info "Firewall wird konfiguriert..."
sudo ufw --force enable
sudo ufw default deny incoming
sudo ufw default allow outgoing
sudo ufw allow ssh
sudo ufw allow 80/tcp    # HTTP
sudo ufw allow 443/tcp   # HTTPS
sudo ufw allow 8080/tcp  # Traefik Dashboard (optional, später schließen)
print_success "Firewall konfiguriert"

# 5. Git installieren
if ! command -v git &> /dev/null; then
    print_info "Git wird installiert..."
    sudo apt-get install -y git
    print_success "Git installiert"
fi

# 6. Projekt-Verzeichnis erstellen
print_info "Projekt-Verzeichnis wird erstellt..."
sudo mkdir -p /opt/dorfkiste
sudo chown $USER:$USER /opt/dorfkiste
cd /opt/dorfkiste
print_success "Projekt-Verzeichnis erstellt: /opt/dorfkiste"

# 7. .env Datei erstellen
print_info ".env Datei wird erstellt..."
if [ ! -f .env ]; then
    cat > .env << 'EOF'
# Dorfkiste Production Environment

# JWT Configuration
JWT_SECRET=$(openssl rand -base64 32)
JWT_ISSUER=DorfkisteAPI
JWT_AUDIENCE=DorfkisteClient
JWT_EXPIRY_MINUTES=60

# OpenAI Configuration (für AI-Features)
OPENAI_API_KEY=your-openai-api-key-here

# Email Configuration
EMAIL_SMTP_HOST=smtp.ionos.de
EMAIL_SMTP_PORT=587
EMAIL_FROM=noreply@dorfkiste.com
EMAIL_USERNAME=noreply@dorfkiste.com
EMAIL_PASSWORD=your-email-password-here

# Database
DATABASE_PATH=/app/data/dorfkiste.db

# Domain
DOMAIN=dorfkiste.com
EOF
    print_success ".env Datei erstellt (bitte OpenAI & Email konfigurieren!)"
else
    print_info ".env Datei existiert bereits"
fi

# 8. Docker Network für Traefik erstellen
print_info "Docker Network wird erstellt..."
sudo docker network create traefik-network 2>/dev/null || print_info "Network existiert bereits"
print_success "Docker Network bereit"

# 9. SSL/TLS mit Let's Encrypt vorbereiten
print_info "Let's Encrypt Verzeichnis wird erstellt..."
sudo mkdir -p /opt/dorfkiste/letsencrypt
sudo chown $USER:$USER /opt/dorfkiste/letsencrypt
print_success "Let's Encrypt vorbereitet"

# 10. Traefik Konfiguration erstellen
print_info "Traefik Konfiguration wird erstellt..."
cat > docker-compose.traefik.yml << 'EOF'
version: '3.8'

services:
  traefik:
    image: traefik:v2.10
    container_name: traefik-global
    command:
      - "--api.dashboard=true"
      - "--providers.docker=true"
      - "--providers.docker.exposedbydefault=false"
      - "--entrypoints.web.address=:80"
      - "--entrypoints.websecure.address=:443"
      - "--certificatesresolvers.letsencrypt.acme.tlschallenge=true"
      - "--certificatesresolvers.letsencrypt.acme.email=support@dorfkiste.com"
      - "--certificatesresolvers.letsencrypt.acme.storage=/letsencrypt/acme.json"
      - "--entrypoints.web.http.redirections.entryPoint.to=websecure"
      - "--entrypoints.web.http.redirections.entryPoint.scheme=https"
    ports:
      - "80:80"
      - "443:443"
      - "8080:8080"  # Dashboard (später mit Auth sichern!)
    volumes:
      - /var/run/docker.sock:/var/run/docker.sock:ro
      - ./letsencrypt:/letsencrypt
    networks:
      - traefik-network
    restart: unless-stopped

networks:
  traefik-network:
    external: true
    name: traefik-network
EOF
print_success "Traefik Konfiguration erstellt"

# 11. Produktions docker-compose.yml erstellen
print_info "Produktions docker-compose.yml wird erstellt..."
cat > docker-compose.yml << 'EOF'
services:
  nginx:
    image: nginx:alpine
    container_name: dorfkiste-nginx
    expose:
      - "80"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf:ro
    depends_on:
      - frontend
      - backend
    networks:
      - dorfkiste-network
      - traefik-network
    labels:
      - "traefik.enable=true"
      - "traefik.http.routers.dorfkiste.rule=Host(`dorfkiste.com`) || Host(`www.dorfkiste.com`)"
      - "traefik.http.routers.dorfkiste.entrypoints=websecure"
      - "traefik.http.routers.dorfkiste.tls.certresolver=letsencrypt"
      - "traefik.http.services.dorfkiste.loadbalancer.server.port=80"
      - "traefik.docker.network=traefik-network"
    restart: unless-stopped

  backend:
    build:
      context: ./backend
      dockerfile: Dockerfile
    container_name: dorfkiste-backend
    expose:
      - "8080"
    environment:
      - ASPNETCORE_ENVIRONMENT=Production
      - ASPNETCORE_URLS=http://+:8080
      - ConnectionStrings__DefaultConnection=Data Source=/app/data/dorfkiste.db
      - Jwt__Secret=${JWT_SECRET}
      - Jwt__Issuer=${JWT_ISSUER}
      - Jwt__Audience=${JWT_AUDIENCE}
      - Jwt__ExpiryMinutes=${JWT_EXPIRY_MINUTES}
      - OpenAI__ApiKey=${OPENAI_API_KEY}
      - OpenAI__Model=gpt-4o
      - Email__SmtpHost=${EMAIL_SMTP_HOST}
      - Email__SmtpPort=${EMAIL_SMTP_PORT}
      - Email__SmtpUsername=${EMAIL_USERNAME}
      - Email__SmtpPassword=${EMAIL_PASSWORD}
      - Email__FromEmail=${EMAIL_FROM}
      - Email__FromName=Dorfkiste
      - Email__BaseUrl=https://${DOMAIN}
    volumes:
      - backend-data:/app/data
    networks:
      - dorfkiste-network
    restart: unless-stopped

  frontend:
    build:
      context: ./frontend
      dockerfile: Dockerfile
      args:
        - NEXT_PUBLIC_API_URL=/api
    container_name: dorfkiste-frontend
    expose:
      - "3000"
    environment:
      - NODE_ENV=production
      - NEXT_PUBLIC_API_URL=/api
    depends_on:
      - backend
    networks:
      - dorfkiste-network
    restart: unless-stopped

volumes:
  backend-data:
    driver: local

networks:
  dorfkiste-network:
    driver: bridge
  traefik-network:
    external: true
    name: traefik-network
EOF
print_success "docker-compose.yml erstellt"

# 12. Zusammenfassung
echo ""
echo "=========================================="
echo "  Installation abgeschlossen!"
echo "=========================================="
echo ""
print_success "Docker installiert: $(docker --version)"
print_success "Docker Compose installiert: $(docker-compose --version)"
print_success "Firewall konfiguriert (Ports: 22, 80, 443, 8080)"
print_success "Projekt-Verzeichnis: /opt/dorfkiste"
echo ""
echo "=========================================="
echo "  Nächste Schritte:"
echo "=========================================="
echo ""
echo "1. Code hochladen:"
echo "   rsync -avz --exclude 'node_modules' --exclude 'bin' --exclude 'obj' \\"
echo "     ./ user@your-server-ip:/opt/dorfkiste/"
echo ""
echo "2. .env Datei anpassen:"
echo "   nano /opt/dorfkiste/.env"
echo "   → OPENAI_API_KEY eintragen"
echo "   → EMAIL_PASSWORD eintragen"
echo ""
echo "3. DNS konfigurieren:"
echo "   dorfkiste.com      → A Record → Server-IP"
echo "   www.dorfkiste.com  → A Record → Server-IP"
echo ""
echo "4. Traefik starten:"
echo "   cd /opt/dorfkiste"
echo "   docker-compose -f docker-compose.traefik.yml up -d"
echo ""
echo "5. Dorfkiste starten:"
echo "   docker-compose up --build -d"
echo ""
echo "6. Logs prüfen:"
echo "   docker-compose logs -f"
echo ""
echo "7. WICHTIG: Traefik Dashboard sichern nach Test!"
echo "   (Port 8080 in Firewall schließen oder Basic Auth einrichten)"
echo ""
print_info "Hinweis: Beim ersten Start kann Let's Encrypt 1-2 Minuten dauern"
echo ""
