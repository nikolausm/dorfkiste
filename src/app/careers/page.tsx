import { Briefcase, MapPin, Clock, Heart, Coffee, Home, Laptop, Users } from "lucide-react"

const openPositions = [
  {
    id: 1,
    title: "Senior Full Stack Developer",
    department: "Engineering",
    location: "Berlin / Remote",
    type: "Vollzeit",
    description: "Wir suchen einen erfahrenen Full Stack Developer, der unsere Plattform weiterentwickelt und skaliert."
  },
  {
    id: 2,
    title: "Product Manager",
    department: "Product",
    location: "Berlin",
    type: "Vollzeit",
    description: "Gestalten Sie die Zukunft der Sharing Economy und entwickeln Sie innovative Features für unsere Nutzer."
  },
  {
    id: 3,
    title: "Marketing Manager",
    department: "Marketing",
    location: "Berlin / Remote",
    type: "Vollzeit",
    description: "Verantworten Sie unsere Marketingstrategie und helfen Sie uns, Dorfkiste bekannt zu machen."
  },
  {
    id: 4,
    title: "Customer Success Manager",
    department: "Support",
    location: "Remote",
    type: "Vollzeit",
    description: "Sorgen Sie für zufriedene Nutzer und bauen Sie langfristige Beziehungen zu unserer Community auf."
  },
  {
    id: 5,
    title: "Data Scientist",
    department: "Engineering",
    location: "Berlin / Remote",
    type: "Vollzeit",
    description: "Nutzen Sie Daten, um unsere Plattform intelligenter zu machen und bessere Nutzererlebnisse zu schaffen."
  }
]

const benefits = [
  {
    icon: Home,
    title: "Flexibles Arbeiten",
    description: "Remote-First Kultur mit optionalem Büro in Berlin"
  },
  {
    icon: Heart,
    title: "Gesundheit",
    description: "Betriebliche Krankenversicherung und Mental Health Support"
  },
  {
    icon: Coffee,
    title: "Team Events",
    description: "Regelmäßige Team-Events und gemeinsame Aktivitäten"
  },
  {
    icon: Laptop,
    title: "Equipment",
    description: "Modernste Arbeitsausstattung nach Wahl"
  },
  {
    icon: Users,
    title: "Entwicklung",
    description: "Persönliches Entwicklungsbudget und Mentoring"
  },
  {
    icon: Clock,
    title: "Work-Life Balance",
    description: "30 Tage Urlaub und flexible Arbeitszeiten"
  }
]

const values = [
  {
    title: "Impact",
    description: "Wir arbeiten an Lösungen, die einen echten Unterschied machen"
  },
  {
    title: "Ownership",
    description: "Jeder übernimmt Verantwortung und gestaltet aktiv mit"
  },
  {
    title: "Transparenz",
    description: "Offene Kommunikation und ehrliches Feedback"
  },
  {
    title: "Innovation",
    description: "Wir probieren Neues aus und lernen aus Fehlern"
  }
]

export default function CareersPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white py-20">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <h1 className="text-5xl font-bold mb-6">Karriere bei Dorfkiste</h1>
          <p className="text-2xl mb-8">
            Gestalten Sie mit uns die Zukunft der Sharing Economy
          </p>
          <p className="text-xl max-w-3xl mx-auto">
            Werden Sie Teil eines Teams, das die Art und Weise revolutioniert, 
            wie Menschen teilen und zusammenarbeiten.
          </p>
        </div>
      </div>

      {/* Why Join Us */}
      <div className="py-16">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Warum Dorfkiste?</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="text-4xl mb-4">🚀</div>
              <h3 className="text-xl font-semibold mb-3">Wachstum</h3>
              <p className="text-gray-600">
                Arbeiten Sie in einem schnell wachsenden Startup mit großem 
                Potenzial und spannenden Herausforderungen.
              </p>
            </div>
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="text-4xl mb-4">🌍</div>
              <h3 className="text-xl font-semibold mb-3">Impact</h3>
              <p className="text-gray-600">
                Ihre Arbeit trägt direkt zu einer nachhaltigeren Gesellschaft 
                und stärkeren Gemeinschaften bei.
              </p>
            </div>
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="text-4xl mb-4">👥</div>
              <h3 className="text-xl font-semibold mb-3">Team</h3>
              <p className="text-gray-600">
                Arbeiten Sie mit talentierten und leidenschaftlichen Menschen, 
                die gemeinsam Großes bewegen wollen.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Open Positions */}
      <div className="py-16 bg-white">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Offene Stellen</h2>
          <div className="space-y-4">
            {openPositions.map((position) => (
              <div key={position.id} className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold mb-2">{position.title}</h3>
                    <div className="flex flex-wrap gap-4 text-sm text-gray-600 mb-3">
                      <span className="flex items-center gap-1">
                        <Briefcase className="w-4 h-4" />
                        {position.department}
                      </span>
                      <span className="flex items-center gap-1">
                        <MapPin className="w-4 h-4" />
                        {position.location}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        {position.type}
                      </span>
                    </div>
                    <p className="text-gray-700">{position.description}</p>
                  </div>
                  <button className="ml-4 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors">
                    Bewerben
                  </button>
                </div>
              </div>
            ))}
          </div>
          <div className="text-center mt-8">
            <p className="text-gray-600 mb-4">
              Keine passende Stelle gefunden?
            </p>
            <button className="text-purple-600 hover:text-purple-700 font-medium">
              Initiativbewerbung senden →
            </button>
          </div>
        </div>
      </div>

      {/* Benefits */}
      <div className="py-16">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Unsere Benefits</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {benefits.map((benefit, index) => (
              <div key={index} className="bg-white rounded-lg shadow-sm p-6">
                <benefit.icon className="w-10 h-10 text-purple-600 mb-3" />
                <h3 className="font-semibold mb-2">{benefit.title}</h3>
                <p className="text-gray-600 text-sm">{benefit.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Culture & Values */}
      <div className="py-16 bg-purple-50">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Unsere Werte</h2>
          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {values.map((value, index) => (
              <div key={index} className="bg-white rounded-lg p-6">
                <h3 className="text-xl font-semibold mb-3">{value.title}</h3>
                <p className="text-gray-600">{value.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Application Process */}
      <div className="py-16">
        <div className="max-w-4xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Bewerbungsprozess</h2>
          <div className="space-y-6">
            <div className="flex gap-4">
              <div className="w-10 h-10 bg-purple-600 text-white rounded-full flex items-center justify-center font-semibold flex-shrink-0">
                1
              </div>
              <div>
                <h3 className="font-semibold mb-2">Bewerbung</h3>
                <p className="text-gray-600">
                  Senden Sie uns Ihre Bewerbungsunterlagen über unser Online-Formular. 
                  Wir melden uns innerhalb von 48 Stunden.
                </p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="w-10 h-10 bg-purple-600 text-white rounded-full flex items-center justify-center font-semibold flex-shrink-0">
                2
              </div>
              <div>
                <h3 className="font-semibold mb-2">Erstes Gespräch</h3>
                <p className="text-gray-600">
                  30-minütiges Video-Interview zum gegenseitigen Kennenlernen mit 
                  unserem People Team.
                </p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="w-10 h-10 bg-purple-600 text-white rounded-full flex items-center justify-center font-semibold flex-shrink-0">
                3
              </div>
              <div>
                <h3 className="font-semibold mb-2">Fachgespräch</h3>
                <p className="text-gray-600">
                  Technisches Interview oder Case Study mit Ihrem zukünftigen Team 
                  (je nach Position).
                </p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="w-10 h-10 bg-purple-600 text-white rounded-full flex items-center justify-center font-semibold flex-shrink-0">
                4
              </div>
              <div>
                <h3 className="font-semibold mb-2">Team Fit</h3>
                <p className="text-gray-600">
                  Treffen Sie das Team und lernen Sie unsere Arbeitsweise kennen - 
                  vor Ort oder virtuell.
                </p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="w-10 h-10 bg-purple-600 text-white rounded-full flex items-center justify-center font-semibold flex-shrink-0">
                5
              </div>
              <div>
                <h3 className="font-semibold mb-2">Angebot</h3>
                <p className="text-gray-600">
                  Bei gegenseitigem Interesse erhalten Sie unser Angebot und wir 
                  besprechen alle Details.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* CTA */}
      <div className="py-16 bg-gradient-to-r from-purple-600 to-blue-600 text-white">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-6">
            Bereit, die Zukunft mitzugestalten?
          </h2>
          <p className="text-xl mb-8">
            Werden Sie Teil unseres Teams und helfen Sie uns, die Sharing Economy 
            voranzutreiben.
          </p>
          <a 
            href="#positions" 
            className="inline-block px-8 py-4 bg-white text-purple-600 rounded-lg hover:bg-gray-100 transition-colors font-semibold"
          >
            Jetzt bewerben
          </a>
        </div>
      </div>
    </div>
  )
}