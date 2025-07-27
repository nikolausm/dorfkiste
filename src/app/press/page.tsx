import { FileText, Download, Camera, Mail, Phone, Calendar } from "lucide-react"

const pressReleases = [
  {
    date: "2024-11-15",
    title: "Dorfkiste erreicht 10.000 aktive Nutzer",
    excerpt: "Die führende Sharing-Plattform verzeichnet starkes Wachstum und plant weitere Expansion.",
    type: "Meilenstein"
  },
  {
    date: "2024-09-20",
    title: "Series A Finanzierung erfolgreich abgeschlossen",
    excerpt: "3 Millionen Euro für die Weiterentwicklung der Plattform und Expansion in neue Märkte.",
    type: "Finanzierung"
  },
  {
    date: "2024-07-12",
    title: "Dorfkiste gewinnt Nachhaltigkeitspreis 2024",
    excerpt: "Auszeichnung für innovative Lösungen zur Förderung der Kreislaufwirtschaft.",
    type: "Auszeichnung"
  },
  {
    date: "2024-05-03",
    title: "Neue Business-Features für Unternehmen",
    excerpt: "Dorfkiste erweitert Angebot um spezielle Funktionen für gewerbliche Nutzer.",
    type: "Produkt"
  }
]

const mediaKitItems = [
  {
    title: "Logo-Paket",
    description: "Verschiedene Formate und Varianten des Dorfkiste Logos",
    size: "2.3 MB",
    format: "ZIP"
  },
  {
    title: "Fact Sheet",
    description: "Wichtige Zahlen und Fakten über Dorfkiste",
    size: "156 KB",
    format: "PDF"
  },
  {
    title: "Gründerfotos",
    description: "Hochauflösende Fotos der Gründer",
    size: "8.7 MB",
    format: "ZIP"
  },
  {
    title: "Produktscreenshots",
    description: "Aktuelle Screenshots der Plattform",
    size: "4.2 MB",
    format: "ZIP"
  }
]

const mediaCoverage = [
  {
    outlet: "Süddeutsche Zeitung",
    date: "2024-10-20",
    title: "Wie Nachbarn durch Teilen sparen",
    link: "#"
  },
  {
    outlet: "TechCrunch Deutschland",
    date: "2024-09-22",
    title: "Dorfkiste sichert sich Series A Finanzierung",
    link: "#"
  },
  {
    outlet: "WirtschaftsWoche",
    date: "2024-08-15",
    title: "Die Sharing Economy erobert die Nachbarschaft",
    link: "#"
  },
  {
    outlet: "Gründerszene",
    date: "2024-07-30",
    title: "Diese Plattform will das Airbnb für Gegenstände werden",
    link: "#"
  }
]

export default function PressPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-gray-900 to-gray-800 text-white py-16">
        <div className="max-w-6xl mx-auto px-4">
          <h1 className="text-4xl font-bold mb-4">Presse</h1>
          <p className="text-xl">
            Aktuelle Pressemitteilungen, Medienkit und Kontaktinformationen
          </p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-12">
        {/* Press Contact */}
        <div className="bg-blue-50 rounded-lg p-8 mb-12">
          <h2 className="text-2xl font-bold mb-6">Pressekontakt</h2>
          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <h3 className="font-semibold mb-3">Ansprechpartner</h3>
              <p className="mb-2">Lisa Weber</p>
              <p className="text-gray-600">Head of Communications</p>
            </div>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <Mail className="w-5 h-5 text-gray-600" />
                <a href="mailto:presse@dorfkiste.de" className="text-blue-600 hover:underline">
                  presse@dorfkiste.de
                </a>
              </div>
              <div className="flex items-center gap-3">
                <Phone className="w-5 h-5 text-gray-600" />
                <span>+49 (0) 123 456789</span>
              </div>
            </div>
          </div>
        </div>

        {/* Press Releases */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold mb-6">Pressemitteilungen</h2>
          <div className="space-y-4">
            {pressReleases.map((release, index) => (
              <div key={index} className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="text-sm text-gray-500 flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        {new Date(release.date).toLocaleDateString('de-DE')}
                      </span>
                      <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full">
                        {release.type}
                      </span>
                    </div>
                    <h3 className="text-lg font-semibold mb-2">{release.title}</h3>
                    <p className="text-gray-600">{release.excerpt}</p>
                  </div>
                  <button className="ml-4 text-blue-600 hover:text-blue-700 flex items-center gap-1">
                    <FileText className="w-4 h-4" />
                    <span className="text-sm">Lesen</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
          <div className="text-center mt-6">
            <button className="text-blue-600 hover:text-blue-700 font-medium">
              Alle Pressemitteilungen anzeigen →
            </button>
          </div>
        </div>

        {/* Media Kit */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold mb-6">Medienkit</h2>
          <div className="grid md:grid-cols-2 gap-4">
            {mediaKitItems.map((item, index) => (
              <div key={index} className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-semibold mb-1">{item.title}</h3>
                    <p className="text-sm text-gray-600 mb-2">{item.description}</p>
                    <div className="flex items-center gap-3 text-xs text-gray-500">
                      <span>{item.format}</span>
                      <span>•</span>
                      <span>{item.size}</span>
                    </div>
                  </div>
                  <button className="text-blue-600 hover:text-blue-700 p-2">
                    <Download className="w-5 h-5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-6 p-4 bg-yellow-50 rounded-lg">
            <p className="text-sm text-gray-700">
              <strong>Hinweis:</strong> Die Verwendung unserer Markenzeichen unterliegt unseren 
              Markenrichtlinien. Bei Fragen kontaktieren Sie bitte unser PR-Team.
            </p>
          </div>
        </div>

        {/* Media Coverage */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold mb-6">Dorfkiste in den Medien</h2>
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="space-y-4">
              {mediaCoverage.map((coverage, index) => (
                <div key={index} className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0">
                  <div>
                    <h4 className="font-medium">{coverage.title}</h4>
                    <div className="flex items-center gap-3 text-sm text-gray-600 mt-1">
                      <span className="font-medium">{coverage.outlet}</span>
                      <span>•</span>
                      <span>{new Date(coverage.date).toLocaleDateString('de-DE')}</span>
                    </div>
                  </div>
                  <a href={coverage.link} className="text-blue-600 hover:text-blue-700 text-sm">
                    Artikel lesen →
                  </a>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Company Facts */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold mb-6">Zahlen & Fakten</h2>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-white rounded-lg shadow-sm p-6 text-center">
              <div className="text-3xl font-bold text-blue-600 mb-2">10.000+</div>
              <p className="text-gray-600">Aktive Nutzer</p>
            </div>
            <div className="bg-white rounded-lg shadow-sm p-6 text-center">
              <div className="text-3xl font-bold text-green-600 mb-2">50 Tonnen</div>
              <p className="text-gray-600">CO₂ eingespart</p>
            </div>
            <div className="bg-white rounded-lg shadow-sm p-6 text-center">
              <div className="text-3xl font-bold text-purple-600 mb-2">50+</div>
              <p className="text-gray-600">Städte in Deutschland</p>
            </div>
          </div>
        </div>

        {/* Photo Gallery */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
            <Camera className="w-6 h-6" />
            Bildmaterial
          </h2>
          <div className="grid md:grid-cols-3 gap-4">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="bg-gray-200 rounded-lg aspect-video flex items-center justify-center text-gray-500">
                <Camera className="w-12 h-12" />
              </div>
            ))}
          </div>
          <p className="text-sm text-gray-600 mt-4">
            Hochauflösende Bilder sind im Medienkit verfügbar. Für spezielle Anfragen 
            kontaktieren Sie bitte unser PR-Team.
          </p>
        </div>

        {/* Press Inquiries */}
        <div className="bg-gray-100 rounded-lg p-8 text-center">
          <h3 className="text-xl font-bold mb-4">Presseanfragen</h3>
          <p className="text-gray-700 mb-6 max-w-2xl mx-auto">
            Für Interviews, Hintergrundgespräche oder weitere Informationen stehen 
            wir Ihnen gerne zur Verfügung. Kontaktieren Sie uns!
          </p>
          <a 
            href="mailto:presse@dorfkiste.de" 
            className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Presseanfrage senden
          </a>
        </div>
      </div>
    </div>
  )
}