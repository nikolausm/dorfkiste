import { Handshake, Building2, ShoppingBag, Truck, Shield, CreditCard, Users, ArrowRight } from "lucide-react"

const partnerTypes = [
  {
    icon: Building2,
    title: "Unternehmenspartner",
    description: "Bieten Sie Ihren Mitarbeitern Zugang zur Sharing Economy",
    benefits: [
      "Mitarbeiter-Benefits",
      "Nachhaltigkeitsziele erreichen",
      "Kosteneinsparungen",
      "Team-Building fördern"
    ]
  },
  {
    icon: ShoppingBag,
    title: "Einzelhandelspartner",
    description: "Erweitern Sie Ihr Angebot um Mietoptionen",
    benefits: [
      "Zusätzliche Einnahmequelle",
      "Kundenbindung erhöhen",
      "Nachhaltiges Image",
      "Neue Zielgruppen"
    ]
  },
  {
    icon: Truck,
    title: "Logistikpartner",
    description: "Unterstützen Sie die Lieferung und Abholung",
    benefits: [
      "Regelmäßige Aufträge",
      "Lokale Präsenz",
      "Flexible Zusammenarbeit",
      "Wachstumspotenzial"
    ]
  },
  {
    icon: Shield,
    title: "Versicherungspartner",
    description: "Bieten Sie maßgeschneiderte Versicherungslösungen",
    benefits: [
      "Neue Geschäftsfelder",
      "Innovative Produkte",
      "Digitale Integration",
      "Zukunftsmarkt"
    ]
  }
]

const currentPartners = [
  { name: "TechCorp GmbH", type: "Unternehmen", logo: "🏢" },
  { name: "GreenLogistics", type: "Logistik", logo: "🚚" },
  { name: "SafeGuard Versicherung", type: "Versicherung", logo: "🛡️" },
  { name: "CityMart", type: "Einzelhandel", logo: "🛒" },
  { name: "StartupHub Berlin", type: "Community", logo: "🚀" },
  { name: "EcoPayments", type: "Zahlungen", logo: "💳" }
]

const partnershipBenefits = [
  {
    title: "Reichweite",
    description: "Zugang zu über 10.000 aktiven Nutzern",
    value: "10.000+"
  },
  {
    title: "Wachstum",
    description: "300% jährliches Wachstum",
    value: "300%"
  },
  {
    title: "Präsenz",
    description: "Aktiv in über 50 deutschen Städten",
    value: "50+"
  },
  {
    title: "Engagement",
    description: "Durchschnittliche Nutzerbewertung",
    value: "4.8/5"
  }
]

export default function PartnersPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-20">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <Handshake className="w-16 h-16 mx-auto mb-6" />
          <h1 className="text-5xl font-bold mb-6">Partner werden</h1>
          <p className="text-2xl mb-8">
            Gestalten Sie mit uns die Zukunft der Sharing Economy
          </p>
          <p className="text-xl max-w-3xl mx-auto">
            Werden Sie Teil eines wachsenden Netzwerks und profitieren Sie von 
            neuen Geschäftsmöglichkeiten in der Share Economy.
          </p>
        </div>
      </div>

      {/* Partnership Types */}
      <div className="py-16">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Partnerschaftsmodelle</h2>
          <div className="grid md:grid-cols-2 gap-8">
            {partnerTypes.map((type, index) => (
              <div key={index} className="bg-white rounded-lg shadow-sm p-8 hover:shadow-md transition-shadow">
                <type.icon className="w-12 h-12 text-indigo-600 mb-4" />
                <h3 className="text-xl font-semibold mb-3">{type.title}</h3>
                <p className="text-gray-600 mb-4">{type.description}</p>
                <ul className="space-y-2">
                  {type.benefits.map((benefit, idx) => (
                    <li key={idx} className="flex items-center gap-2 text-gray-700">
                      <span className="w-1.5 h-1.5 bg-indigo-600 rounded-full"></span>
                      {benefit}
                    </li>
                  ))}
                </ul>
                <button className="mt-6 text-indigo-600 hover:text-indigo-700 font-medium flex items-center gap-1">
                  Mehr erfahren
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Benefits */}
      <div className="py-16 bg-indigo-50">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Warum mit Dorfkiste partnern?</h2>
          <div className="grid md:grid-cols-4 gap-6">
            {partnershipBenefits.map((benefit, index) => (
              <div key={index} className="bg-white rounded-lg p-6 text-center">
                <div className="text-3xl font-bold text-indigo-600 mb-2">{benefit.value}</div>
                <h3 className="font-semibold mb-1">{benefit.title}</h3>
                <p className="text-sm text-gray-600">{benefit.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Integration Options */}
      <div className="py-16">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Integrationsmöglichkeiten</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-20 h-20 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CreditCard className="w-10 h-10 text-purple-600" />
              </div>
              <h3 className="text-xl font-semibold mb-3">API Integration</h3>
              <p className="text-gray-600">
                Nahtlose Integration in Ihre bestehenden Systeme über unsere 
                moderne REST API.
              </p>
            </div>
            <div className="text-center">
              <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="w-10 h-10 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold mb-3">White Label</h3>
              <p className="text-gray-600">
                Nutzen Sie unsere Plattform unter Ihrer eigenen Marke mit 
                anpassbarem Design.
              </p>
            </div>
            <div className="text-center">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Shield className="w-10 h-10 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Co-Branding</h3>
              <p className="text-gray-600">
                Gemeinsame Marketingaktionen und gebrandete Kampagnen für 
                maximale Reichweite.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Current Partners */}
      <div className="py-16 bg-gray-100">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Unsere Partner</h2>
          <div className="grid md:grid-cols-3 lg:grid-cols-6 gap-6">
            {currentPartners.map((partner, index) => (
              <div key={index} className="bg-white rounded-lg p-6 text-center hover:shadow-md transition-shadow">
                <div className="text-4xl mb-3">{partner.logo}</div>
                <h4 className="font-semibold text-sm">{partner.name}</h4>
                <p className="text-xs text-gray-600 mt-1">{partner.type}</p>
              </div>
            ))}
          </div>
          <p className="text-center mt-8 text-gray-600">
            ... und viele weitere Partner deutschlandweit
          </p>
        </div>
      </div>

      {/* Partnership Process */}
      <div className="py-16">
        <div className="max-w-4xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">So werden Sie Partner</h2>
          <div className="space-y-6">
            <div className="flex gap-4">
              <div className="w-10 h-10 bg-indigo-600 text-white rounded-full flex items-center justify-center font-semibold flex-shrink-0">
                1
              </div>
              <div>
                <h3 className="font-semibold mb-2">Kontaktaufnahme</h3>
                <p className="text-gray-600">
                  Füllen Sie unser Partnerformular aus oder kontaktieren Sie uns direkt. 
                  Wir melden uns innerhalb von 24 Stunden.
                </p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="w-10 h-10 bg-indigo-600 text-white rounded-full flex items-center justify-center font-semibold flex-shrink-0">
                2
              </div>
              <div>
                <h3 className="font-semibold mb-2">Bedarfsanalyse</h3>
                <p className="text-gray-600">
                  Gemeinsam analysieren wir Ihre Anforderungen und entwickeln ein 
                  maßgeschneidertes Partnerschaftskonzept.
                </p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="w-10 h-10 bg-indigo-600 text-white rounded-full flex items-center justify-center font-semibold flex-shrink-0">
                3
              </div>
              <div>
                <h3 className="font-semibold mb-2">Vertragsabschluss</h3>
                <p className="text-gray-600">
                  Nach Abstimmung aller Details schließen wir eine Partnerschaftsvereinbarung 
                  ab, die beide Seiten absichert.
                </p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="w-10 h-10 bg-indigo-600 text-white rounded-full flex items-center justify-center font-semibold flex-shrink-0">
                4
              </div>
              <div>
                <h3 className="font-semibold mb-2">Integration & Launch</h3>
                <p className="text-gray-600">
                  Unser Team unterstützt Sie bei der technischen Integration und 
                  gemeinsamen Markteinführung.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Contact Form */}
      <div className="py-16 bg-white">
        <div className="max-w-4xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Partnerschaftsanfrage</h2>
          <form className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Unternehmen *
                </label>
                <input
                  type="text"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Branche *
                </label>
                <select className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500">
                  <option>Bitte wählen</option>
                  <option>Einzelhandel</option>
                  <option>Logistik</option>
                  <option>Versicherung</option>
                  <option>Technologie</option>
                  <option>Andere</option>
                </select>
              </div>
            </div>
            
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Ansprechpartner *
                </label>
                <input
                  type="text"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  E-Mail *
                </label>
                <input
                  type="email"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Telefon
              </label>
              <input
                type="tel"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Art der Partnerschaft
              </label>
              <div className="space-y-2">
                <label className="flex items-center">
                  <input type="checkbox" className="mr-2" />
                  <span>Unternehmenspartnerschaft</span>
                </label>
                <label className="flex items-center">
                  <input type="checkbox" className="mr-2" />
                  <span>Technische Integration</span>
                </label>
                <label className="flex items-center">
                  <input type="checkbox" className="mr-2" />
                  <span>Marketing-Kooperation</span>
                </label>
                <label className="flex items-center">
                  <input type="checkbox" className="mr-2" />
                  <span>Andere</span>
                </label>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Ihre Nachricht
              </label>
              <textarea
                rows={4}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="Beschreiben Sie Ihre Partnerschaftsidee..."
              ></textarea>
            </div>

            <div className="text-center">
              <button
                type="submit"
                className="px-8 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium"
              >
                Anfrage senden
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Contact Info */}
      <div className="py-16 bg-gray-100">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h3 className="text-xl font-bold mb-4">Direkter Kontakt</h3>
          <p className="text-gray-600 mb-6">
            Haben Sie Fragen zu Partnerschaftsmöglichkeiten? Wir freuen uns auf Ihre Kontaktaufnahme!
          </p>
          <div className="flex flex-col md:flex-row gap-6 justify-center">
            <a href="mailto:partner@dorfkiste.de" className="text-indigo-600 hover:text-indigo-700">
              partner@dorfkiste.de
            </a>
            <span className="text-gray-400 hidden md:block">•</span>
            <span>+49 (0) 123 456789</span>
          </div>
        </div>
      </div>
    </div>
  )
}