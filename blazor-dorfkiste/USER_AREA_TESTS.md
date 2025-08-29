# User Area Tests für Dorfkiste Blazor

## Übersicht

Diese Tests prüfen alle benutzerbezogenen Seiten der Dorfkiste-Anwendung auf korrekte HTTP-Statuscodes.

## Getestete Seiten

| URL | Beschreibung | Erwarteter Status |
|-----|-------------|-------------------|
| `/profile` | Benutzerprofil | 200, 302, 401, 403 |
| `/my-items` | Eigene Artikel | 200, 302, 401, 403 |
| `/my-rentals` | Eigene Vermietungen | 200, 302, 401, 403 |
| `/watchlist` | Merkliste | 200, 302, 401, 403 |
| `/notifications` | Benachrichtigungen | 200, 302, 401, 403 |
| `/items/new` | Neuen Artikel erstellen | 200, 302, 401, 403 |

## Statuscode-Bedeutungen

### ✅ Akzeptable Statuscodes
- **200 (OK)**: Seite wird erfolgreich geladen
- **302 (Redirect)**: Weiterleitung zur Anmeldeseite (normal für geschützte Seiten)
- **401 (Unauthorized)**: Authentifizierung erforderlich
- **403 (Forbidden)**: Benutzer hat keine Berechtigung

### ❌ Problematische Statuscodes
- **404 (Not Found)**: Seite existiert nicht - FEHLER!
- **500 (Server Error)**: Anwendungsfehler - FEHLER!

## Ausführung der Tests

### Option 1: Playwright E2E Tests (Empfohlen)

```bash
# PowerShell-Skript ausführen
./run-user-area-tests.ps1

# Oder direkt mit dotnet test
cd tests/DorfkisteBlazor.E2E.Tests
dotnet test --filter "FullyQualifiedName~UserAreaTests" --logger:"console;verbosity=detailed"
```

### Option 2: Einfache cURL Tests

```bash
# Shell-Skript ausführen
chmod +x test-user-area-urls.sh
./test-user-area-urls.sh
```

### Option 3: Manuelle cURL Tests

```bash
# Beispiel für einzelne URL-Tests
curl -k -I https://localhost:5001/profile
curl -k -I https://localhost:5001/my-items
curl -k -I https://localhost:5001/my-rentals
curl -k -I https://localhost:5001/watchlist
curl -k -I https://localhost:5001/notifications
curl -k -I https://localhost:5001/items/new
```

## Voraussetzungen

1. **Anwendung läuft**: Die Dorfkiste-Anwendung muss auf `https://localhost:5001` laufen
2. **Playwright (für E2E Tests)**: Playwright-Browser müssen installiert sein
3. **cURL (für einfache Tests)**: cURL muss verfügbar sein

## Testlogik

Die Tests prüfen folgende Aspekte:

1. **Seiten existieren**: Keine 404-Fehler
2. **Keine Serverfehler**: Keine 500-Fehler  
3. **Korrekte Authentifizierung**: 302-Weiterleitungen oder 401/403-Statuscodes sind OK
4. **Erfolgreiche Seitenladung**: 200-Status bei authentifizierten Benutzern

## Fehlerdiagnose

### 404 Not Found
- Seite existiert nicht oder Route ist falsch konfiguriert
- Prüfen Sie die Blazor-Routen in den entsprechenden `.razor`-Dateien

### 500 Server Error
- Anwendungsfehler oder Konfigurationsproblem
- Prüfen Sie die Anwendungslogs und die Konfiguration

### Authentifizierungsprobleme
- Prüfen Sie die ASP.NET Identity-Konfiguration
- Stellen Sie sicher, dass die Authentifizierungs-Middleware korrekt konfiguriert ist

## Erweiterung der Tests

Um weitere Seiten zu testen:

1. **Playwright Tests**: Fügen Sie URLs zum `userAreaUrls`-Array in `UserAreaTests.cs` hinzu
2. **cURL Tests**: Fügen Sie URLs zum `USER_PAGES`-Array in `test-user-area-urls.sh` hinzu

## Beispiel-Ausgabe

```
=== Dorfkiste User Area URL Tests ===
Testing user area pages with cURL...

Testing against: https://localhost:5001
==============================================
Testing /profile       302 (Redirect - likely to login page)
Testing /my-items       302 (Redirect - likely to login page)  
Testing /my-rentals     302 (Redirect - likely to login page)
Testing /watchlist      302 (Redirect - likely to login page)
Testing /notifications  302 (Redirect - likely to login page)
Testing /items/new      302 (Redirect - likely to login page)
==============================================

✅ All tests passed! (6/6)
All user area pages return acceptable status codes.
```