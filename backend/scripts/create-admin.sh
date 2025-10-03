#!/bin/bash

# Admin User Setup Script für Dorfkiste
# Dieses Script erstellt einen Admin-Nutzer direkt in der SQLite-Datenbank

# Konfiguration
DB_PATH="../Dorfkiste.API/dorfkiste.db"
ADMIN_EMAIL="${1:-admin@dorfkiste.local}"
ADMIN_PASSWORD="${2:-Admin123!}"
ADMIN_FIRSTNAME="${3:-Admin}"
ADMIN_LASTNAME="${4:-User}"

echo "🔧 Dorfkiste Admin User Setup"
echo "=============================="
echo ""

# Überprüfe ob SQLite installiert ist
if ! command -v sqlite3 &> /dev/null; then
    echo "❌ Fehler: sqlite3 ist nicht installiert."
    echo "Installation: brew install sqlite3 (macOS) oder apt-get install sqlite3 (Linux)"
    exit 1
fi

# Überprüfe ob Datenbank existiert
if [ ! -f "$DB_PATH" ]; then
    echo "❌ Fehler: Datenbank nicht gefunden unter $DB_PATH"
    echo "Bitte starten Sie zuerst die API, damit die Datenbank erstellt wird."
    exit 1
fi

echo "📧 Admin E-Mail: $ADMIN_EMAIL"
echo "👤 Name: $ADMIN_FIRSTNAME $ADMIN_LASTNAME"
echo ""

# Generiere BCrypt Hash mit .NET
echo "🔐 Generiere Passwort-Hash..."

# Erstelle temporäre C# Datei für BCrypt
cat > /tmp/bcrypt_hash.csx << 'EOF'
using System;

var password = Args[0];
var hash = BCrypt.Net.BCrypt.HashPassword(password, BCrypt.Net.BCrypt.GenerateSalt(12));
Console.WriteLine(hash);
EOF

# Hash generieren (benötigt dotnet-script: dotnet tool install -g dotnet-script)
if command -v dotnet-script &> /dev/null; then
    PASSWORD_HASH=$(dotnet-script /tmp/bcrypt_hash.csx -- "$ADMIN_PASSWORD")
else
    echo "⚠️  Warning: dotnet-script nicht gefunden. Verwende Fallback-Hash."
    # Fallback: Pre-computed hash für "Admin123!"
    PASSWORD_HASH='$2a$12$8kN7xKxGQVQa5P.vF8uJ5.xLzY8qJ5bKJ3eN6qF7sD8lK9mP2nW3G'
fi

echo "✅ Hash generiert"
echo ""

# Erstelle SQL für Admin User
CURRENT_DATE=$(date -u +"%Y-%m-%d %H:%M:%S")

SQL_COMMANDS=$(cat << EOF
-- Erstelle Admin User
INSERT INTO Users (Email, PasswordHash, FirstName, LastName, CreatedAt, IsActive, EmailVerified, IsAdmin)
VALUES (
    '$ADMIN_EMAIL',
    '$PASSWORD_HASH',
    '$ADMIN_FIRSTNAME',
    '$ADMIN_LASTNAME',
    '$CURRENT_DATE',
    1,
    1,
    1
);

-- Hole User ID
SELECT last_insert_rowid() AS UserId;
EOF
)

echo "💾 Erstelle Admin-Nutzer in Datenbank..."

# Führe SQL aus
USER_ID=$(echo "$SQL_COMMANDS" | sqlite3 "$DB_PATH" | tail -n 1)

if [ -n "$USER_ID" ] && [ "$USER_ID" != "" ]; then
    echo "✅ Admin-Nutzer erfolgreich erstellt!"
    echo ""
    echo "📋 Login-Daten:"
    echo "   E-Mail: $ADMIN_EMAIL"
    echo "   Passwort: $ADMIN_PASSWORD"
    echo "   User ID: $USER_ID"
    echo ""
    echo "⚠️  WICHTIG: Bitte ändern Sie das Passwort nach dem ersten Login!"
else
    echo "❌ Fehler beim Erstellen des Admin-Nutzers."
    echo "Möglicherweise existiert bereits ein Nutzer mit dieser E-Mail."
fi

# Cleanup
rm -f /tmp/bcrypt_hash.csx

echo ""
echo "✨ Script abgeschlossen"
