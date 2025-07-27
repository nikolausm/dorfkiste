# Changelog

Alle nennenswerten Änderungen an diesem Projekt werden in dieser Datei dokumentiert.

Das Format basiert auf [Keep a Changelog](https://keepachangelog.com/de/1.0.0/),
und dieses Projekt hält sich an [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.1.0] - 2025-01-27

### Hinzugefügt
- Visuelles Erfolgs-Feedback nach AI-Bildanalyse mit grünem Checkmark-Icon
- Detaillierte Console-Logs für besseres Debugging der AI-Analyse
- Automatisierte Playwright E2E-Tests für die Bildanalyse-Funktion
- Mock-Daten für Entwicklung ohne OpenAI API-Schlüssel

### Geändert
- Verbesserte Fehlerbehandlung für null-Werte bei optionalen Preisfeldern
- TypeScript-Typen für bessere Typsicherheit (Record types für PRICE_RANGES und conditionMultipliers)
- Optimierte Formular-Updates nach AI-Analyse

### Behoben
- Formularfelder werden jetzt zuverlässig nach der AI-Bildanalyse ausgefüllt
- Null-Pointer-Exceptions bei fehlenden Preis-pro-Stunde-Werten verhindert
- TypeScript-Kompilierungsfehler in ItemCard und analyze-image Route behoben

### Technische Details
- **Betroffene Dateien:**
  - `src/app/items/new/page.tsx`: Verbesserte Null-Checks und Erfolgs-Feedback
  - `src/app/api/analyze-image/route.ts`: TypeScript-Typen korrigiert
  - `src/components/ItemCard.tsx`: Alt-Text Fallback für User-Namen
  - `tests/ai-image-analysis.spec.ts`: Neuer E2E-Test

## [1.0.0] - 2025-01-26

### Hinzugefügt
- MVP-Implementation mit Next.js, Prisma und Tailwind CSS
- KI-gestützte Bilderkennung mit OpenAI GPT-4 Vision
- Benutzerauthentifizierung mit NextAuth.js
- Artikel-Management (Erstellen, Anzeigen, Bearbeiten)
- Kategorie-System mit Icons
- Miet-Anfragen und Buchungssystem
- In-App Messaging zwischen Nutzern
- Bewertungssystem für Nutzer und Artikel
- Responsive Design für Mobile und Desktop