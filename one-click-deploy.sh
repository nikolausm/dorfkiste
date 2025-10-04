#!/bin/bash

# ========================================
# Dorfkiste One-Click Deployment
# ========================================
# Dieses Script führt ALLE Schritte automatisch aus
# Einfach kopieren, auf dem Server einfügen, Enter drücken!

set -e

echo "=========================================="
echo "  🚀 Dorfkiste One-Click Deployment"
echo "=========================================="
echo ""

# Farben
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

print_success() { echo -e "${GREEN}✓ $1${NC}"; }
print_info() { echo -e "${YELLOW}→ $1${NC}"; }
print_error() { echo -e "${RED}✗ $1${NC}"; }

# 1. System Update
print_info "System wird aktualisiert..."
apt-get update -y > /dev/null 2>&1
apt-get upgrade -y > /dev/null 2>&1
print_success "System aktualisiert"

# 2. Dependencies installieren
print_info "Dependencies werden installiert..."
apt-get install -y ca-certificates curl gnupg lsb-release git ufw > /dev/null 2>&1
print_success "Dependencies installiert"

# 3. Docker installieren
if ! command -v docker &> /dev/null; then
    print_info "Docker wird installiert..."

    # GPG Key
    install -m 0755 -d /etc/apt/keyrings
    curl -fsSL https://download.docker.com/linux/debian/gpg | gpg --dearmor -o /etc/apt/keyrings/docker.gpg
    chmod a+r /etc/apt/keyrings/docker.gpg

    # Repository
    echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/debian $(lsb_release -cs) stable" | tee /etc/apt/sources.list.d/docker.list > /dev/null

    # Docker installieren
    apt-get update -y > /dev/null 2>&1
    apt-get install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin > /dev/null 2>&1

    print_success "Docker installiert"
else
    print_success "Docker bereits installiert"
fi

# 4. Docker Compose standalone
if ! command -v docker-compose &> /dev/null; then
    print_info "Docker Compose wird installiert..."
    curl -sL "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
    chmod +x /usr/local/bin/docker-compose
    print_success "Docker Compose installiert"
else
    print_success "Docker Compose bereits installiert"
fi

# 5. Firewall
print_info "Firewall wird konfiguriert..."
ufw --force enable > /dev/null 2>&1
ufw default deny incoming > /dev/null 2>&1
ufw default allow outgoing > /dev/null 2>&1
ufw allow ssh > /dev/null 2>&1
ufw allow 80/tcp > /dev/null 2>&1
ufw allow 443/tcp > /dev/null 2>&1
print_success "Firewall konfiguriert"

# 6. Projekt-Verzeichnis
print_info "Projekt-Verzeichnis wird erstellt..."
mkdir -p /opt/dorfkiste
cd /opt/dorfkiste
print_success "Verzeichnis /opt/dorfkiste erstellt"

# 7. JWT Secret generieren
JWT_SECRET=$(openssl rand -base64 32)

# 8. .env Datei erstellen
print_info ".env Datei wird erstellt..."
cat > .env << EOF
# Dorfkiste Production Environment
JWT_SECRET=${JWT_SECRET}
JWT_ISSUER=DorfkisteAPI
JWT_AUDIENCE=DorfkisteClient
JWT_EXPIRY_MINUTES=60

# OpenAI - BITTE EINTRAGEN!
OPENAI_API_KEY=sk-proj-your-key-here

# Email - BITTE EINTRAGEN!
EMAIL_SMTP_HOST=smtp.ionos.de
EMAIL_SMTP_PORT=587
EMAIL_FROM=noreply@dorfkiste.org
EMAIL_USERNAME=noreply@dorfkiste.org
EMAIL_PASSWORD=your-email-password-here

DATABASE_PATH=/app/data/dorfkiste.db
DOMAIN=dorfkiste.org
EOF
print_success ".env Datei erstellt"

# 9. Docker Network
print_info "Docker Network wird erstellt..."
docker network create traefik-network 2>/dev/null || true
print_success "Docker Network erstellt"

# 10. Let's Encrypt vorbereiten
mkdir -p /opt/dorfkiste/letsencrypt
print_success "Let's Encrypt vorbereitet"

echo ""
echo "=========================================="
echo "  ✅ Server-Setup abgeschlossen!"
echo "=========================================="
echo ""
print_success "Docker: $(docker --version | cut -d' ' -f3)"
print_success "Docker Compose: $(docker-compose --version | cut -d' ' -f4)"
print_success "Firewall: aktiv (Ports 22, 80, 443)"
print_success "Projekt: /opt/dorfkiste"
echo ""
echo "=========================================="
echo "  📋 Nächste Schritte:"
echo "=========================================="
echo ""
echo "1. ⚠️  .env Datei anpassen:"
echo "   nano /opt/dorfkiste/.env"
echo "   → OPENAI_API_KEY eintragen"
echo "   → EMAIL_PASSWORD eintragen"
echo ""
echo "2. 📤 Code hochladen (von Mac):"
echo "   rsync -avz --progress \\"
echo "     --exclude 'node_modules' --exclude 'bin' --exclude 'obj' \\"
echo "     --exclude '.git' --exclude '.next' \\"
echo "     ./ root@194.164.199.151:/opt/dorfkiste/"
echo ""
echo "3. 🌐 DNS konfigurieren:"
echo "   dorfkiste.org → A → 194.164.199.151"
echo "   www.dorfkiste.org → A → 194.164.199.151"
echo ""
echo "4. 🚀 Danach auf dem Server:"
echo "   cd /opt/dorfkiste"
echo "   ./start-dorfkiste.sh"
echo ""
