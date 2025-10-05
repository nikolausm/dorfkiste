# Dorfkiste Deployment Guide - IONOS VPS

## Voraussetzungen

- IONOS VPS Linux L mit Debian 12
- Domain dorfkiste.com zeigt auf Server-IP
- SSH-Zugang zum Server

## 1. Server vorbereiten

```bash
# Auf dem Server einloggen
ssh root@your-server-ip

# Deployment-Script herunterladen
curl -o deploy-ionos.sh https://raw.githubusercontent.com/your-repo/dorfkiste/main/deploy-ionos.sh

# Script ausführbar machen
chmod +x deploy-ionos.sh

# Script ausführen
./deploy-ionos.sh
```

Das Script installiert automatisch:
- ✅ Docker & Docker Compose
- ✅ UFW Firewall (Ports 22, 80, 443, 8080)
- ✅ Git
- ✅ Projekt-Verzeichnis `/opt/dorfkiste`
- ✅ Traefik mit Let's Encrypt
- ✅ .env Template

## 2. Code hochladen

### Option A: Von lokalem Rechner (empfohlen)

```bash
# Im Dorfkiste-Verzeichnis auf deinem Mac
rsync -avz --exclude 'node_modules' --exclude 'bin' --exclude 'obj' \
  --exclude '.git' --exclude '.next' --exclude 'backend-data' \
  ./ user@your-server-ip:/opt/dorfkiste/
```

### Option B: Via Git

```bash
# Auf dem Server
cd /opt/dorfkiste
git clone https://github.com/your-repo/dorfkiste.git .
```

## 3. Umgebungsvariablen konfigurieren

```bash
# .env bearbeiten
nano /opt/dorfkiste/.env
```

Wichtige Werte eintragen:
```env
OPENAI_API_KEY=sk-...              # Dein OpenAI API Key
EMAIL_PASSWORD=your-password        # IONOS Email Passwort
```

## 4. DNS konfigurieren

Bei deinem Domain-Provider (z.B. IONOS):

```
A Record:  dorfkiste.com      → Server-IP
A Record:  www.dorfkiste.com  → Server-IP
```

Warte 5-10 Minuten bis DNS propagiert ist.

## 5. Traefik starten (Reverse Proxy + SSL)

```bash
cd /opt/dorfkiste

# Docker Network erstellen
docker network create traefik-network

# Traefik starten
docker-compose -f docker-compose.traefik.yml up -d

# Logs prüfen
docker-compose -f docker-compose.traefik.yml logs -f
```

## 6. Dorfkiste starten

```bash
cd /opt/dorfkiste

# Container bauen und starten
docker-compose up --build -d

# Logs anschauen
docker-compose logs -f

# Status prüfen
docker-compose ps
```

## 7. Testen

```bash
# Health Check
curl https://dorfkiste.com

# SSL-Zertifikat prüfen
curl -I https://dorfkiste.com
```

Im Browser:
- https://dorfkiste.com (Hauptseite)
- https://www.dorfkiste.com (Weiterleitung)
- http://your-server-ip:8080 (Traefik Dashboard)

## 8. Sicherheit

### Traefik Dashboard sichern

**Option A: Firewall schließen (empfohlen)**
```bash
sudo ufw delete allow 8080/tcp
```

**Option B: Basic Auth einrichten**
```bash
# Password hashen
htpasswd -nb admin your-password

# In docker-compose.traefik.yml eintragen:
labels:
  - "traefik.http.middlewares.auth.basicauth.users=admin:$$apr1$$..."
  - "traefik.http.routers.dashboard.middlewares=auth"
```

### SSL erzwingen

Bereits konfiguriert! HTTP → HTTPS Weiterleitung aktiv.

## 9. Wartung

### Logs anschauen
```bash
cd /opt/dorfkiste

# Alle Container
docker-compose logs -f

# Einzelner Container
docker-compose logs -f backend
docker-compose logs -f frontend
```

### Container neu starten
```bash
# Alle
docker-compose restart

# Einzeln
docker-compose restart backend
```

### Updates einspielen
```bash
cd /opt/dorfkiste

# Code aktualisieren (rsync oder git pull)
git pull

# Container neu bauen
docker-compose down
docker-compose up --build -d
```

### Backup erstellen
```bash
# Datenbank sichern
docker cp dorfkiste-backend:/app/data/dorfkiste.db ./backup-$(date +%Y%m%d).db

# Bilder sichern (in DB gespeichert, siehe oben)

# .env sichern
cp /opt/dorfkiste/.env ./backup-env-$(date +%Y%m%d)
```

## 10. Monitoring

### Ressourcen prüfen
```bash
# Docker Stats
docker stats

# Disk Space
df -h

# Memory
free -h
```

### Container Status
```bash
# Alle Container
docker-compose ps

# Traefik
docker-compose -f docker-compose.traefik.yml ps
```

## Troubleshooting

### Problem: "Let's Encrypt failed"
```bash
# DNS prüfen
nslookup dorfkiste.com

# Firewall prüfen
sudo ufw status

# Traefik Logs
docker-compose -f docker-compose.traefik.yml logs -f
```

### Problem: "Backend nicht erreichbar"
```bash
# Container Logs
docker-compose logs backend

# Network prüfen
docker network inspect dorfkiste_dorfkiste-network
```

### Problem: "Frontend zeigt 502 Bad Gateway"
```bash
# Alle Container Status
docker-compose ps

# Nginx Logs
docker-compose logs nginx
```

## Kosten

**IONOS VPS Linux L:**
- ~10€/Monat
- 4 vCores, 8GB RAM, 160GB SSD
- Ausreichend für 100-500 Nutzer

**Let's Encrypt SSL:**
- Kostenlos
- Automatische Erneuerung

**Domain dorfkiste.com:**
- ~15€/Jahr (bei IONOS)

**Gesamt: ~10-15€/Monat**

## Support

Bei Problemen:
- Logs prüfen: `docker-compose logs -f`
- Server neu starten: `sudo reboot`
- Docker neu installieren: `./deploy-ionos.sh` erneut ausführen

**Wichtige Dateien:**
- `/opt/dorfkiste/.env` - Umgebungsvariablen
- `/opt/dorfkiste/docker-compose.yml` - Container Config
- `/opt/dorfkiste/letsencrypt/acme.json` - SSL Zertifikate
- `/var/lib/docker/volumes/dorfkiste_backend-data/_data/dorfkiste.db` - Datenbank
