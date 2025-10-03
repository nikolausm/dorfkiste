# Admin User Setup Scripts

Diese Scripts erstellen einen Admin-Nutzer für die Dorfkiste-Plattform.

## Methode 1: Bash Script (empfohlen)

```bash
cd backend/scripts
chmod +x create-admin.sh
./create-admin.sh [email] [password] [firstname] [lastname]
```

**Beispiel:**
```bash
./create-admin.sh admin@dorfkiste.local Admin123! Administrator System
```

**Standardwerte (wenn keine Parameter angegeben):**
- Email: admin@dorfkiste.local
- Password: Admin123!
- FirstName: Admin
- LastName: User

## Methode 2: SQL Script (direkt)

```bash
cd backend/Dorfkiste.API
sqlite3 dorfkiste.db < ../scripts/create-admin.sql
```

**Wichtig:** Dieses Script erstellt einen Admin mit festen Credentials:
- Email: admin@dorfkiste.local
- Password: Admin123!

## Methode 3: Via DbSeeder (Development)

Füge in `DbSeeder.cs` hinzu:

```csharp
// In SeedAsync Methode
if (!context.Users.Any(u => u.IsAdmin))
{
    var admin = new User
    {
        Email = "admin@dorfkiste.local",
        PasswordHash = BCrypt.Net.BCrypt.HashPassword("Admin123!", BCrypt.Net.BCrypt.GenerateSalt(12)),
        FirstName = "Admin",
        LastName = "User",
        CreatedAt = DateTime.UtcNow,
        IsActive = true,
        EmailVerified = true,
        IsAdmin = true,
        ContactInfo = new ContactInfo
        {
            Street = "Admin Straße 1",
            City = "München",
            PostalCode = "80331",
            Country = "Deutschland"
        }
    };

    context.Users.Add(admin);
    await context.SaveChangesAsync();
}
```

## Methode 4: Docker Compose (Production)

Füge Environment Variable in docker-compose.yml hinzu:

```yaml
backend:
  environment:
    - SEED_ADMIN_USER=true
    - ADMIN_EMAIL=admin@dorfkiste.local
    - ADMIN_PASSWORD=SecurePassword123!
```

## Verifizierung

Nach der Erstellung können Sie sich einloggen:

1. **Web UI:** http://localhost:8000/auth/login
2. **Credentials:**
   - Email: admin@dorfkiste.local
   - Password: Admin123! (oder Ihr gewähltes Passwort)

3. **Admin Dashboard:** http://localhost:8000/admin/reports

## Sicherheitshinweise

⚠️ **WICHTIG:**

1. **Passwort ändern:** Ändern Sie das Standard-Passwort sofort nach dem ersten Login!
2. **Production:** Verwenden Sie niemals das Standard-Passwort in Production
3. **E-Mail:** Verwenden Sie eine echte Admin-E-Mail-Adresse
4. **Berechtigungen:** Admin-Rechte gewähren vollen Zugriff auf alle Funktionen

## Admin-Funktionen

Mit Admin-Rechten haben Sie Zugriff auf:

- ✅ Meldungs-Verwaltung (`/admin/reports`)
- ✅ Nutzer sperren/entsperren
- ✅ Angebote entfernen
- ✅ Meldungen bearbeiten und lösen
- ✅ System-Statistiken (geplant)
- ✅ Nutzer-Verwaltung (geplant)

## Troubleshooting

### "sqlite3 command not found"
```bash
# macOS
brew install sqlite3

# Ubuntu/Debian
sudo apt-get install sqlite3
```

### "dotnet-script not found"
```bash
dotnet tool install -g dotnet-script
```

### "User already exists"
Löschen Sie zuerst den existierenden Admin:
```bash
sqlite3 dorfkiste.db "DELETE FROM Users WHERE Email = 'admin@dorfkiste.local';"
```

### Passwort-Hash manuell generieren
```bash
dotnet run --project ../Dorfkiste.API -- hash-password "YourPassword"
```
