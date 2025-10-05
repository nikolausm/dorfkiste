# E-Mail-Test-Umgebung Setup

## MailHog - Lokaler SMTP-Server für Entwicklung

MailHog fängt alle E-Mails ab und zeigt sie in einer Web-Oberfläche an, ohne sie tatsächlich zu versenden.

### Installation und Start

#### Option 1: Docker Compose (empfohlen)

```bash
# MailHog starten
docker-compose -f docker-compose.mailhog.yml up -d

# MailHog stoppen
docker-compose -f docker-compose.mailhog.yml down
```

#### Option 2: Homebrew (macOS)

```bash
# Installation
brew install mailhog

# Starten
mailhog

# Im Hintergrund starten
brew services start mailhog
```

#### Option 3: Download Binary

Download von: https://github.com/mailhog/MailHog/releases

### Zugriff

Nach dem Start:
- **SMTP Server**: `localhost:1025` (für die Anwendung)
- **Web UI**: http://localhost:8025 (zum Anzeigen der E-Mails)

### Konfiguration

Die SMTP-Einstellungen sind bereits in `appsettings.Development.json` konfiguriert:

```json
{
  "EmailSettings": {
    "SmtpServer": "localhost",
    "SmtpPort": 1025,
    "SmtpUsername": "",
    "SmtpPassword": "",
    "SenderEmail": "noreply@dorfkiste.local",
    "SenderName": "Dorfkiste",
    "EnableSsl": false
  }
}
```

### Verwendung

1. MailHog starten (siehe oben)
2. Backend-API starten: `dotnet run --project Dorfkiste.API`
3. Frontend starten: `npm run dev`
4. Benutzer registrieren oder Admin sendet Verifizierungs-E-Mail
5. E-Mails in der Web-UI ansehen: http://localhost:8025

### Features

- **E-Mail-Vorschau**: Zeigt HTML- und Text-Versionen an
- **Kein Versand**: E-Mails werden nicht wirklich versendet
- **API**: RESTful API für automatisierte Tests
- **Suche**: Durchsuche E-Mails nach Empfänger, Betreff, etc.

### Troubleshooting

**Problem**: Verbindung zu MailHog fehlgeschlagen
- Prüfe ob MailHog läuft: `docker ps` oder `brew services list`
- Prüfe Port 1025: `lsof -i :1025`

**Problem**: E-Mails werden nicht angezeigt
- Öffne Web-UI: http://localhost:8025
- Prüfe Backend-Logs auf SMTP-Fehler
- Prüfe `appsettings.Development.json` Konfiguration

## Produktion

Für Produktion sollte ein echter SMTP-Server konfiguriert werden:
- Gmail SMTP
- SendGrid
- Amazon SES
- Mailgun

Konfiguration in `appsettings.Production.json` oder Umgebungsvariablen.
