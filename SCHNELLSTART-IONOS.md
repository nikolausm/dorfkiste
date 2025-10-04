# Dorfkiste auf IONOS VPS deployen - Schnellstart

## Server-Zugangsdaten
- **IP**: 194.164.199.151
- **User**: root
- **Initial-Passwort**: 4LsOvtRM

---

## Schritt 1: Auf Server verbinden

```bash
# Von deinem Mac aus
ssh root@194.164.199.151
# Passwort: 4LsOvtRM

# WICHTIG: Passwort sofort ändern!
passwd
# Neues Passwort 2x eingeben
```

---

## Schritt 2: Server vorbereiten (einmalig)

```bash
# Deployment-Script herunterladen und ausführen
curl -o deploy-ionos.sh https://raw.githubusercontent.com/username/dorfkiste/main/deploy-ionos.sh
chmod +x deploy-ionos.sh
./deploy-ionos.sh
```

**Das Script installiert automatisch:**
- Docker & Docker Compose
- Firewall (UFW)
- Git
- Erstellt `/opt/dorfkiste` Verzeichnis
- Legt `.env` Template an

⏱️ Dauer: 3-5 Minuten

---

## Schritt 3: Code auf Server laden

**Von deinem Mac aus (neues Terminal-Fenster):**

```bash
# Im dorfkiste Projekt-Verzeichnis
cd /Users/michaelnikolaus/RiderProjects/dorfkiste

# Code hochladen (ohne node_modules, .git, etc.)
rsync -avz --progress \
  --exclude 'node_modules' \
  --exclude 'bin' \
  --exclude 'obj' \
  --exclude '.git' \
  --exclude '.next' \
  --exclude 'backend-data' \
  ./ root@194.164.199.151:/opt/dorfkiste/
```

⏱️ Dauer: 2-5 Minuten (je nach Internetgeschwindigkeit)

---

## Schritt 4: Umgebungsvariablen konfigurieren

**Zurück auf dem Server (SSH):**

```bash
cd /opt/dorfkiste

# .env bearbeiten
nano .env
```

**Wichtige Werte anpassen:**

```env
# JWT Secret (automatisch generiert - belassen)
JWT_SECRET=<bereits generiert>

# OpenAI API Key eintragen
OPENAI_API_KEY=sk-proj-your-key-here

# Email Konfiguration (IONOS)
EMAIL_SMTP_HOST=smtp.ionos.de
EMAIL_SMTP_PORT=587
EMAIL_FROM=noreply@dorfkiste.org
EMAIL_USERNAME=noreply@dorfkiste.org
EMAIL_PASSWORD=dein-email-passwort-hier

# Domain
DOMAIN=dorfkiste.org
```

**Speichern:** `CTRL+O`, `Enter`, `CTRL+X`

---

## Schritt 5: DNS konfigurieren

**Bei IONOS Domain-Verwaltung:**

1. Zu dorfkiste.org DNS-Einstellungen gehen
2. A-Records hinzufügen:

```
Typ: A    Name: @      Wert: 194.164.199.151
Typ: A    Name: www    Wert: 194.164.199.151
```

⏱️ Warte 5-10 Minuten bis DNS propagiert ist

---

## Schritt 6: Traefik starten (Reverse Proxy + SSL)

```bash
cd /opt/dorfkiste

# Traefik starten
docker-compose -f docker-compose.traefik.yml up -d

# Logs anschauen (CTRL+C zum Beenden)
docker-compose -f docker-compose.traefik.yml logs -f
```

✅ **Erfolgreich wenn:** "Server listening on :443" und "Server listening on :80"

---

## Schritt 7: Dorfkiste starten

```bash
cd /opt/dorfkiste

# Container bauen und starten (dauert 5-10 Minuten beim ersten Mal)
docker-compose up --build -d

# Logs live anschauen
docker-compose logs -f
```

✅ **Erfolgreich wenn:**
- Backend: "Now listening on: http://[::]:8080"
- Frontend: "ready started server on 0.0.0.0:3000"
- Nginx: "start worker process"

**CTRL+C** zum Beenden der Logs

---

## Schritt 8: Testen

**Im Browser:**
- https://dorfkiste.org
- https://www.dorfkiste.org

**SSL-Zertifikat prüfen:**
```bash
curl -I https://dorfkiste.org
# Sollte "HTTP/2 200" und "cert issuer: Let's Encrypt" zeigen
```

---

## Schritt 9: Sicherheit - Traefik Dashboard schließen

```bash
# Port 8080 in Firewall schließen
sudo ufw delete allow 8080/tcp
sudo ufw reload
```

---

## Wartungs-Befehle

### Logs anschauen
```bash
cd /opt/dorfkiste

# Alle Container
docker-compose logs -f

# Nur Backend
docker-compose logs -f backend

# Nur Frontend
docker-compose logs -f frontend
```

### Container neu starten
```bash
cd /opt/dorfkiste
docker-compose restart
```

### Updates deployen
```bash
# Code von Mac hochladen (siehe Schritt 3)
rsync -avz --progress ...

# Auf Server
cd /opt/dorfkiste
docker-compose down
docker-compose up --build -d
```

### Backup erstellen
```bash
# Datenbank sichern
docker cp dorfkiste-backend:/app/data/dorfkiste.db ~/backup-$(date +%Y%m%d).db

# Backup herunterladen (von Mac)
scp root@194.164.199.151:~/backup-*.db ./backups/
```

### Status prüfen
```bash
# Container Status
docker-compose ps

# Ressourcen
docker stats

# Disk Space
df -h
```

---

## Troubleshooting

### Problem: "Let's Encrypt failed"
```bash
# DNS prüfen
nslookup dorfkiste.org
# Sollte 194.164.199.151 anzeigen

# Traefik neu starten
docker-compose -f docker-compose.traefik.yml restart
docker-compose -f docker-compose.traefik.yml logs -f
```

### Problem: "502 Bad Gateway"
```bash
# Container Status prüfen
docker-compose ps
# Alle sollten "Up" sein

# Wenn nicht, neu starten
docker-compose restart
```

### Problem: "Can't connect to backend"
```bash
# Backend Logs prüfen
docker-compose logs backend

# Container neu starten
docker-compose restart backend
```

---

## Kosten-Übersicht

- **VPS**: ~10€/Monat (vps 4 4 120)
- **Domain**: ~15€/Jahr
- **SSL**: Kostenlos (Let's Encrypt)

**Gesamt: ~10-12€/Monat**

---

## Support

Bei Problemen:
1. Logs prüfen: `docker-compose logs -f`
2. Container neu starten: `docker-compose restart`
3. Server neu starten: `sudo reboot`

**Wichtige Dateien:**
- `/opt/dorfkiste/.env` - Konfiguration
- `/opt/dorfkiste/letsencrypt/acme.json` - SSL-Zertifikate
- `/var/lib/docker/volumes/dorfkiste_backend-data/_data/dorfkiste.db` - Datenbank
