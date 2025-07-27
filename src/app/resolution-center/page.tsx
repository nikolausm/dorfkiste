import { AlertTriangle, MessageSquare, FileText, Shield, CheckCircle, Clock, ArrowRight } from "lucide-react"

const disputeTypes = [
  {
    id: 1,
    title: "Artikel beschädigt zurückgegeben",
    description: "Der Mieter hat den Artikel in beschädigtem Zustand zurückgegeben",
    icon: "🔨",
    frequency: "Häufig"
  },
  {
    id: 2,
    title: "Artikel nicht wie beschrieben",
    description: "Der gemietete Artikel entspricht nicht der Beschreibung",
    icon: "❓",
    frequency: "Gelegentlich"
  },
  {
    id: 3,
    title: "Verspätete Rückgabe",
    description: "Der Artikel wurde nicht zum vereinbarten Zeitpunkt zurückgegeben",
    icon: "⏰",
    frequency: "Häufig"
  },
  {
    id: 4,
    title: "Zahlung nicht erhalten",
    description: "Die vereinbarte Zahlung wurde nicht geleistet",
    icon: "💰",
    frequency: "Selten"
  },
  {
    id: 5,
    title: "Kommunikationsprobleme",
    description: "Schwierigkeiten bei der Kontaktaufnahme oder Vereinbarung",
    icon: "📱",
    frequency: "Gelegentlich"
  }
]

const resolutionProcess = [
  {
    step: 1,
    title: "Direkte Kommunikation",
    description: "Versuchen Sie zunächst, das Problem direkt mit dem anderen Nutzer zu klären",
    timeframe: "24-48 Stunden"
  },
  {
    step: 2,
    title: "Streitfall melden",
    description: "Wenn keine Einigung erzielt wird, melden Sie den Fall über das Formular",
    timeframe: "Sofort möglich"
  },
  {
    step: 3,
    title: "Beweise sammeln",
    description: "Laden Sie Fotos, Nachrichten und andere relevante Dokumente hoch",
    timeframe: "3 Tage"
  },
  {
    step: 4,
    title: "Mediation",
    description: "Unser Team vermittelt zwischen beiden Parteien",
    timeframe: "5-7 Tage"
  },
  {
    step: 5,
    title: "Entscheidung",
    description: "Wir treffen eine faire Entscheidung basierend auf den Fakten",
    timeframe: "2-3 Tage"
  }
]

export default function ResolutionCenterPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-red-600 to-orange-600 text-white py-16">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex items-center gap-3 mb-4">
            <Shield className="w-10 h-10" />
            <h1 className="text-4xl font-bold">Konfliktlösungscenter</h1>
          </div>
          <p className="text-xl">
            Wir helfen Ihnen, Streitigkeiten fair und schnell zu lösen
          </p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-12">
        {/* Quick Actions */}
        <div className="grid md:grid-cols-3 gap-6 mb-12">
          <div className="bg-white rounded-lg shadow-sm p-6 text-center hover:shadow-md transition-shadow">
            <AlertTriangle className="w-12 h-12 text-red-600 mx-auto mb-3" />
            <h3 className="font-semibold mb-2">Streitfall melden</h3>
            <p className="text-gray-600 text-sm mb-4">
              Melden Sie ein Problem mit einer Vermietung
            </p>
            <button className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors">
              Jetzt melden
            </button>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm p-6 text-center hover:shadow-md transition-shadow">
            <MessageSquare className="w-12 h-12 text-blue-600 mx-auto mb-3" />
            <h3 className="font-semibold mb-2">Status prüfen</h3>
            <p className="text-gray-600 text-sm mb-4">
              Verfolgen Sie Ihren offenen Fall
            </p>
            <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
              Status ansehen
            </button>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm p-6 text-center hover:shadow-md transition-shadow">
            <FileText className="w-12 h-12 text-green-600 mx-auto mb-3" />
            <h3 className="font-semibold mb-2">Richtlinien</h3>
            <p className="text-gray-600 text-sm mb-4">
              Unsere Regeln für faire Streitbeilegung
            </p>
            <button className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
              Mehr erfahren
            </button>
          </div>
        </div>

        {/* Common Dispute Types */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold mb-6">Häufige Streitfälle</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {disputeTypes.map((type) => (
              <div key={type.id} className="bg-white rounded-lg p-6 border border-gray-200 hover:border-orange-300 transition-colors">
                <div className="flex items-start gap-3">
                  <span className="text-2xl">{type.icon}</span>
                  <div>
                    <h3 className="font-semibold mb-1">{type.title}</h3>
                    <p className="text-sm text-gray-600 mb-2">{type.description}</p>
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      type.frequency === 'Häufig' ? 'bg-red-100 text-red-700' :
                      type.frequency === 'Gelegentlich' ? 'bg-yellow-100 text-yellow-700' :
                      'bg-green-100 text-green-700'
                    }`}>
                      {type.frequency}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Resolution Process */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold mb-6">So funktioniert die Streitbeilegung</h2>
          <div className="bg-white rounded-lg shadow-sm p-8">
            <div className="space-y-6">
              {resolutionProcess.map((process, index) => (
                <div key={process.step} className="flex gap-4">
                  <div className="flex-shrink-0">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold ${
                      index === 0 ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'
                    }`}>
                      {process.step}
                    </div>
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold mb-1">{process.title}</h3>
                    <p className="text-gray-600 text-sm">{process.description}</p>
                    <p className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {process.timeframe}
                    </p>
                  </div>
                  {index < resolutionProcess.length - 1 && (
                    <ArrowRight className="w-5 h-5 text-gray-400 mt-2" />
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Guidelines */}
        <div className="grid md:grid-cols-2 gap-8 mb-12">
          <div className="bg-blue-50 rounded-lg p-6">
            <h3 className="font-bold mb-4 flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-blue-600" />
              Tipps zur Konfliktvermeidung
            </h3>
            <ul className="space-y-2 text-sm text-gray-700">
              <li>• Kommunizieren Sie klar und respektvoll</li>
              <li>• Dokumentieren Sie den Zustand mit Fotos</li>
              <li>• Vereinbaren Sie alle Details schriftlich</li>
              <li>• Prüfen Sie Artikel vor der Übergabe gemeinsam</li>
              <li>• Halten Sie sich an vereinbarte Zeiten</li>
              <li>• Melden Sie Probleme sofort</li>
            </ul>
          </div>
          
          <div className="bg-orange-50 rounded-lg p-6">
            <h3 className="font-bold mb-4 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-orange-600" />
              Was wir nicht lösen können
            </h3>
            <ul className="space-y-2 text-sm text-gray-700">
              <li>• Strafrechtliche Vergehen</li>
              <li>• Vorsätzliche Beschädigung</li>
              <li>• Streitigkeiten außerhalb der Plattform</li>
              <li>• Fälle ohne ausreichende Beweise</li>
              <li>• Meinungsverschiedenheiten über Geschmack</li>
              <li>• Normale Abnutzung</li>
            </ul>
          </div>
        </div>

        {/* Statistics */}
        <div className="bg-gray-100 rounded-lg p-8 mb-12">
          <h3 className="text-xl font-bold mb-6 text-center">Unsere Erfolgsbilanz</h3>
          <div className="grid md:grid-cols-4 gap-6 text-center">
            <div>
              <div className="text-3xl font-bold text-green-600">95%</div>
              <p className="text-sm text-gray-600">Zufriedenheitsrate</p>
            </div>
            <div>
              <div className="text-3xl font-bold text-blue-600">3-5 Tage</div>
              <p className="text-sm text-gray-600">Durchschn. Lösungszeit</p>
            </div>
            <div>
              <div className="text-3xl font-bold text-purple-600">2.341</div>
              <p className="text-sm text-gray-600">Gelöste Fälle</p>
            </div>
            <div>
              <div className="text-3xl font-bold text-orange-600">24/7</div>
              <p className="text-sm text-gray-600">Support verfügbar</p>
            </div>
          </div>
        </div>

        {/* FAQ */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold mb-6">Häufige Fragen</h2>
          <div className="space-y-4">
            <details className="bg-white rounded-lg p-4 group">
              <summary className="cursor-pointer font-medium text-gray-700 hover:text-gray-900">
                Kostet die Streitbeilegung etwas?
              </summary>
              <p className="mt-3 text-gray-600">
                Nein, unser Streitbeilegungsservice ist für alle Nutzer kostenlos. 
                Wir möchten, dass Konflikte fair und ohne zusätzliche Belastung gelöst werden.
              </p>
            </details>
            
            <details className="bg-white rounded-lg p-4 group">
              <summary className="cursor-pointer font-medium text-gray-700 hover:text-gray-900">
                Wie lange dauert die Bearbeitung?
              </summary>
              <p className="mt-3 text-gray-600">
                Die meisten Fälle werden innerhalb von 3-5 Werktagen gelöst. 
                Komplexere Fälle können bis zu 10 Tage dauern. Wir halten Sie 
                während des gesamten Prozesses auf dem Laufenden.
              </p>
            </details>
            
            <details className="bg-white rounded-lg p-4 group">
              <summary className="cursor-pointer font-medium text-gray-700 hover:text-gray-900">
                Ist die Entscheidung bindend?
              </summary>
              <p className="mt-3 text-gray-600">
                Unsere Entscheidungen basieren auf den Nutzungsbedingungen von Dorfkiste. 
                In schwerwiegenden Fällen behalten wir uns vor, Nutzerkonten zu sperren 
                oder rechtliche Schritte einzuleiten.
              </p>
            </details>
          </div>
        </div>

        {/* Contact */}
        <div className="bg-white rounded-lg shadow-sm p-8 text-center">
          <h3 className="text-xl font-bold mb-4">Brauchen Sie Hilfe?</h3>
          <p className="text-gray-600 mb-6">
            Unser Support-Team steht Ihnen bei Fragen zur Streitbeilegung zur Verfügung
          </p>
          <div className="flex gap-4 justify-center">
            <a 
              href="/contact" 
              className="px-6 py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
            >
              Support kontaktieren
            </a>
            <a 
              href="/help" 
              className="px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Hilfe-Center
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}