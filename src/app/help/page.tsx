import Link from "next/link"
import { 
  MessageCircle, 
  FileText, 
  Shield, 
  CreditCard, 
  Users, 
  Settings,
  Phone,
  Mail,
  Clock,
  HelpCircle
} from "lucide-react"

const helpSections = [
  {
    title: "Erste Schritte",
    icon: HelpCircle,
    color: "text-blue-600",
    bgColor: "bg-blue-50",
    links: [
      { title: "Wie funktioniert Dorfkiste?", href: "/help/how-it-works" },
      { title: "Registrierung und Profil", href: "/help/registration" },
      { title: "Ersten Artikel einstellen", href: "/help/first-listing" },
      { title: "Artikel ausleihen", href: "/help/how-to-rent" },
    ]
  },
  {
    title: "Artikel einstellen",
    icon: FileText,
    color: "text-green-600",
    bgColor: "bg-green-50",
    links: [
      { title: "Fotos aufnehmen", href: "/help/photos" },
      { title: "Preisgestaltung", href: "/help/pricing" },
      { title: "Artikelbeschreibung", href: "/help/descriptions" },
      { title: "Verfügbarkeit verwalten", href: "/help/availability" },
    ]
  },
  {
    title: "Sicherheit & Vertrauen",
    icon: Shield,
    color: "text-purple-600",
    bgColor: "bg-purple-50",
    links: [
      { title: "Sicherheitsrichtlinien", href: "/help/safety" },
      { title: "Versicherung", href: "/help/insurance" },
      { title: "Bewertungssystem", href: "/help/ratings" },
      { title: "Probleme melden", href: "/help/report" },
    ]
  },
  {
    title: "Zahlungen",
    icon: CreditCard,
    color: "text-yellow-600",
    bgColor: "bg-yellow-50",
    links: [
      { title: "Zahlungsmethoden", href: "/help/payment-methods" },
      { title: "Rückerstattungen", href: "/help/refunds" },
      { title: "Auszahlungen", href: "/help/payouts" },
      { title: "Gebühren", href: "/help/fees" },
    ]
  },
  {
    title: "Community",
    icon: Users,
    color: "text-indigo-600",
    bgColor: "bg-indigo-50",
    links: [
      { title: "Community-Richtlinien", href: "/help/community-guidelines" },
      { title: "Nachbarschafts-Tipps", href: "/help/neighborhood-tips" },
      { title: "Erfolgsgeschichten", href: "/success-stories" },
      { title: "Blog", href: "/blog" },
    ]
  },
  {
    title: "Konto & Einstellungen",
    icon: Settings,
    color: "text-gray-600",
    bgColor: "bg-gray-50",
    links: [
      { title: "Profil bearbeiten", href: "/help/profile-settings" },
      { title: "Benachrichtigungen", href: "/help/notifications" },
      { title: "Datenschutz", href: "/privacy" },
      { title: "Konto löschen", href: "/help/delete-account" },
    ]
  },
]

const faqs = [
  {
    question: "Wie sicher ist das Verleihen über Dorfkiste?",
    answer: "Wir haben verschiedene Sicherheitsmaßnahmen implementiert, einschließlich Benutzerverifizierung, Bewertungssystem und optionalem Versicherungsschutz."
  },
  {
    question: "Was passiert, wenn ein Artikel beschädigt wird?",
    answer: "Bei Schäden können Sie dies über unser Konfliktlösungszentrum melden. Je nach Fall wird eine faire Lösung zwischen den Parteien gefunden."
  },
  {
    question: "Wie hoch sind die Gebühren?",
    answer: "Dorfkiste erhebt eine kleine Servicegebühr von der Gesamtmiete, um die Plattform zu betreiben und weiterzuentwickeln."
  },
  {
    question: "Kann ich auch gewerblich Artikel vermieten?",
    answer: "Ja, gewerbliche Vermieter sind willkommen. Bitte kontaktieren Sie uns für spezielle Konditionen für Unternehmen."
  },
]

export default function HelpPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-[1280px] mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Hilfe & Support
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Finden Sie Antworten auf Ihre Fragen oder kontaktieren Sie unser Support-Team
          </p>
        </div>

        {/* Contact Cards */}
        <div className="grid md:grid-cols-3 gap-6 mb-12">
          <div className="bg-white rounded-lg p-6 text-center shadow-sm">
            <MessageCircle className="h-8 w-8 text-blue-600 mx-auto mb-3" />
            <h3 className="font-semibold mb-2">Live Chat</h3>
            <p className="text-sm text-gray-600 mb-4">Sofortige Hilfe von unserem Support-Team</p>
            <button className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors">
              Chat starten
            </button>
          </div>
          
          <div className="bg-white rounded-lg p-6 text-center shadow-sm">
            <Mail className="h-8 w-8 text-green-600 mx-auto mb-3" />
            <h3 className="font-semibold mb-2">E-Mail Support</h3>
            <p className="text-sm text-gray-600 mb-4">Antwort innerhalb von 24 Stunden</p>
            <a 
              href="mailto:support@dorfkiste.de"
              className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition-colors inline-block"
            >
              E-Mail senden
            </a>
          </div>
          
          <div className="bg-white rounded-lg p-6 text-center shadow-sm">
            <Phone className="h-8 w-8 text-purple-600 mx-auto mb-3" />
            <h3 className="font-semibold mb-2">Telefon Support</h3>
            <p className="text-sm text-gray-600 mb-4">Mo-Fr 9:00-18:00 Uhr</p>
            <a 
              href="tel:+4930123456789"
              className="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700 transition-colors inline-block"
            >
              Anrufen
            </a>
          </div>
        </div>

        {/* Help Topics */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-8 text-center">
            Hilfe-Themen
          </h2>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {helpSections.map((section) => (
              <div key={section.title} className="bg-white rounded-lg p-6 shadow-sm">
                <div className="flex items-center mb-4">
                  <div className={`p-3 rounded-lg ${section.bgColor} mr-3`}>
                    <section.icon className={`h-6 w-6 ${section.color}`} />
                  </div>
                  <h3 className="font-semibold text-gray-900">{section.title}</h3>
                </div>
                
                <ul className="space-y-2">
                  {section.links.map((link) => (
                    <li key={link.title}>
                      <Link 
                        href={link.href}
                        className="text-sm text-gray-600 hover:text-blue-600 hover:underline"
                      >
                        {link.title}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        {/* FAQs */}
        <div className="bg-white rounded-lg p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            Häufige Fragen
          </h2>
          
          <div className="space-y-6">
            {faqs.map((faq, index) => (
              <div key={index} className="border-b border-gray-200 pb-6 last:border-b-0">
                <h3 className="font-semibold text-gray-900 mb-2">
                  {faq.question}
                </h3>
                <p className="text-gray-600">
                  {faq.answer}
                </p>
              </div>
            ))}
          </div>
          
          <div className="mt-8 text-center">
            <Link
              href="/faq"
              className="inline-flex items-center text-blue-600 hover:text-blue-700"
            >
              Alle FAQs anzeigen
              <HelpCircle className="h-4 w-4 ml-1" />
            </Link>
          </div>
        </div>

        {/* Footer note */}
        <div className="text-center mt-12 text-gray-500">
          <Clock className="h-4 w-4 inline mr-1" />
          Unser Support-Team ist Mo-Fr von 9:00-18:00 Uhr für Sie da
        </div>
      </div>
    </div>
  )
}