# Dorfkiste 📦

> Die Nachbarschafts-Verleihplattform - Teilen wie im Dorf

Dorfkiste ist eine KI-gestützte Verleih-App, die das Teilen von Gegenständen in der Nachbarschaft revolutioniert. Einfach fotografieren, hochladen und verleihen - die KI erledigt den Rest.

## 🎉 Release Notes

### Version 1.1.0 (27.01.2025)

#### 🐛 Bugfixes
- **AI-Bildanalyse verbessert**: Formularfelder werden jetzt zuverlässig nach der KI-Analyse ausgefüllt
- **Null-Werte Handling**: Optionale Preisfelder (Preis pro Stunde) werden korrekt behandelt
- **TypeScript-Typen**: Verbesserte Typsicherheit im gesamten Projekt

#### ✨ Neue Features
- **Erfolgs-Feedback**: Visuelles Feedback (grüner Haken) nach erfolgreicher AI-Analyse
- **Verbessertes Logging**: Detaillierte Console-Logs für besseres Debugging
- **Playwright Tests**: Automatisierte E2E-Tests für die AI-Bildanalyse

#### 🔧 Technische Verbesserungen
- Mock-Daten für Entwicklung ohne OpenAI API-Key
- Bessere Error-Handling bei der Bildanalyse
- Performance-Optimierungen beim Formular-Rendering

## 🎯 Vision

Eine App, die das Verleihen und Ausleihen von Gegenständen so einfach macht wie das Teilen von Fotos. Nachhaltigkeit trifft auf modernste Technologie.

## ✨ Hauptfunktionen

- **📸 KI-Artikelerkennung**: Foto machen, fertig! Die KI erkennt und kategorisiert automatisch
- **💬 In-App Chat**: Sichere Kommunikation zwischen Verleihern und Ausleihern
- **📅 Smart Calendar**: Automatische Verfügbarkeitsverwaltung
- **⭐ Bewertungssystem**: Vertrauen durch Community-Feedback
- **🔒 Sicherheit**: Verifizierte Profile und optionale Versicherung

## 🚀 Tech Stack

### Frontend
- React Native (Mobile Apps)
- Next.js (Web-App)
- Tailwind CSS (Styling)

### Backend
- Node.js + Express
- PostgreSQL + Prisma
- AWS S3 / Cloudflare R2

### KI & Services
- Google Vision API / AWS Rekognition
- OpenAI GPT-4 / Claude API
- Supabase Auth

## 📱 Screenshots

*Coming soon...*

## 🛠️ Installation

```bash
# Repository klonen
git clone https://github.com/nikolaus/dorfkiste.git
cd dorfkiste

# Dependencies installieren
npm install

# Entwicklungsserver starten
npm run dev
```

## 📝 Dokumentation

Weitere Dokumentation findest du im [docs](./docs) Ordner:
- [Technische Architektur](./docs/architecture.md)
- [API Dokumentation](./docs/api.md)
- [Deployment Guide](./docs/deployment.md)

## 🤝 Contributing

Wir freuen uns über Beiträge! Bitte lies unsere [Contributing Guidelines](./CONTRIBUTING.md).

## 📄 Lizenz

Dieses Projekt ist unter der MIT Lizenz lizenziert - siehe [LICENSE](./LICENSE) für Details.

## 📞 Kontakt

- Website: [dorfkiste.de](https://dorfkiste.de)
- Email: info@dorfkiste.de
- Twitter: [@dorfkiste](https://twitter.com/dorfkiste)

---

Made with ❤️ für die Nachbarschaft
