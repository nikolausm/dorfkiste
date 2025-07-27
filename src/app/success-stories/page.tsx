import { Star, TrendingUp, Users, Leaf, Heart, Quote } from "lucide-react"

const successStories = [
  {
    id: 1,
    name: "Thomas K.",
    location: "München",
    title: "Vom Hobby zum profitablen Nebeneinkommen",
    story: "Als leidenschaftlicher Heimwerker hatte ich über die Jahre viele Werkzeuge angesammelt. Die meisten nutzte ich nur selten. Über Dorfkiste vermiete ich sie jetzt und verdiene durchschnittlich 400€ im Monat - das deckt meine kompletten Werkzeugkosten und mehr!",
    image: "👨‍🔧",
    stats: {
      monthlyIncome: "400€",
      itemsShared: 23,
      rentals: 156,
      rating: 4.9
    },
    category: "Vermieter"
  },
  {
    id: 2,
    name: "Familie Schmidt",
    location: "Hamburg",
    title: "Gemeinsam sparen und die Umwelt schonen",
    story: "Mit drei Kindern brauchen wir ständig neue Dinge - aber nur für kurze Zeit. Über Dorfkiste leihen wir Kindersitze, Sportausrüstung und Campingzubehör. Wir sparen etwa 2000€ im Jahr und haben mehr Platz zu Hause!",
    image: "👨‍👩‍👧‍👦",
    stats: {
      yearlySavings: "2000€",
      itemsRented: 67,
      co2Saved: "150kg",
      memberSince: "2022"
    },
    category: "Mieter"
  },
  {
    id: 3,
    name: "GreenTech Startup",
    location: "Berlin",
    title: "Büroausstattung flexibel und nachhaltig",
    story: "Als junges Startup mussten wir flexibel bleiben. Statt teure Büromöbel zu kaufen, mieten wir über Dorfkiste. Das spart nicht nur Geld, sondern passt auch perfekt zu unseren Nachhaltigkeitswerten.",
    image: "🏢",
    stats: {
      monthlySavings: "1500€",
      itemsInUse: 34,
      flexibility: "100%",
      employees: 15
    },
    category: "Business"
  },
  {
    id: 4,
    name: "Lisa M.",
    location: "Köln",
    title: "Events ohne den Stress der Anschaffung",
    story: "Ich organisiere regelmäßig Geburtstage und Feiern. Früher habe ich alles gekauft und es stapelte sich im Keller. Jetzt miete ich Partyzelte, Soundanlagen und Deko - stressfrei und günstig!",
    image: "🎉",
    stats: {
      eventsOrganized: 24,
      avgSavingPerEvent: "300€",
      storageFreed: "15m²",
      rating: 5.0
    },
    category: "Events"
  },
  {
    id: 5,
    name: "Nachbarschaftsinitiative Freiburg",
    location: "Freiburg",
    title: "Ein ganzes Viertel teilt",
    story: "Was als kleine WhatsApp-Gruppe begann, ist heute ein Netzwerk von über 200 Haushalten. Wir teilen alles von Rasenmähern bis zu Fondue-Sets. Die Gemeinschaft ist stärker denn je!",
    image: "🏘️",
    stats: {
      households: 200,
      itemsShared: 450,
      monthlyTransactions: 180,
      communityEvents: 12
    },
    category: "Community"
  },
  {
    id: 6,
    name: "Max & Julia",
    location: "Stuttgart",
    title: "Unser Traumurlaub dank Sharing",
    story: "Wir wollten mit dem Wohnmobil durch Skandinavien, konnten uns aber keins leisten. Über Dorfkiste mieteten wir eins für 3 Wochen - inklusive Campingausrüstung. Der Urlaub unseres Lebens!",
    image: "🚐",
    stats: {
      tripDuration: "3 Wochen",
      savedVsBuying: "45.000€",
      kilometersTravel: 4500,
      memories: "Unbezahlbar"
    },
    category: "Reise"
  }
]

const impactStats = [
  { label: "CO₂ eingespart", value: "50 Tonnen", icon: Leaf },
  { label: "Geld gespart", value: "2.5 Mio €", icon: TrendingUp },
  { label: "Artikel geteilt", value: "25.000+", icon: Heart },
  { label: "Glückliche Nutzer", value: "10.000+", icon: Users }
]

export default function SuccessStoriesPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-green-600 to-blue-600 text-white py-20">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <h1 className="text-5xl font-bold mb-6">Erfolgsgeschichten</h1>
          <p className="text-2xl mb-8">
            Entdecken Sie, wie Dorfkiste das Leben unserer Nutzer verändert
          </p>
          <div className="grid md:grid-cols-4 gap-6 max-w-4xl mx-auto">
            {impactStats.map((stat, index) => (
              <div key={index} className="bg-white/20 backdrop-blur-sm rounded-lg p-4">
                <stat.icon className="w-8 h-8 mx-auto mb-2" />
                <div className="text-3xl font-bold">{stat.value}</div>
                <div className="text-sm">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Stories Grid */}
      <div className="max-w-6xl mx-auto px-4 py-12">
        <div className="grid md:grid-cols-2 gap-8">
          {successStories.map((story) => (
            <div key={story.id} className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow">
              <div className="p-8">
                {/* Header */}
                <div className="flex items-start justify-between mb-6">
                  <div>
                    <div className="text-4xl mb-3">{story.image}</div>
                    <h3 className="text-xl font-bold">{story.name}</h3>
                    <p className="text-gray-600">{story.location}</p>
                    <span className="inline-block mt-2 px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm">
                      {story.category}
                    </span>
                  </div>
                  <Quote className="w-8 h-8 text-gray-300" />
                </div>

                {/* Title */}
                <h4 className="text-lg font-semibold mb-4">{story.title}</h4>

                {/* Story */}
                <p className="text-gray-700 mb-6 italic">"{story.story}"</p>

                {/* Stats */}
                <div className="grid grid-cols-2 gap-4 pt-6 border-t border-gray-100">
                  {Object.entries(story.stats).map(([key, value]) => (
                    <div key={key} className="text-center">
                      <div className="text-2xl font-bold text-green-600">{value}</div>
                      <div className="text-xs text-gray-600 capitalize">
                        {key.replace(/([A-Z])/g, ' $1').trim()}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Call to Action */}
        <div className="mt-16 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg p-12 text-center text-white">
          <h2 className="text-3xl font-bold mb-4">Schreiben Sie Ihre eigene Erfolgsgeschichte</h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto">
            Werden Sie Teil der Dorfkiste-Community und erleben Sie die Vorteile des Teilens
          </p>
          <div className="flex gap-4 justify-center">
            <a 
              href="/auth/signup" 
              className="px-8 py-4 bg-white text-purple-600 rounded-lg hover:bg-gray-100 transition-colors font-semibold"
            >
              Jetzt starten
            </a>
            <a 
              href="/items" 
              className="px-8 py-4 border-2 border-white text-white rounded-lg hover:bg-white hover:text-purple-600 transition-colors font-semibold"
            >
              Artikel entdecken
            </a>
          </div>
        </div>

        {/* Testimonial Highlight */}
        <div className="mt-16 bg-yellow-50 rounded-lg p-8">
          <div className="max-w-3xl mx-auto text-center">
            <Star className="w-12 h-12 text-yellow-500 mx-auto mb-4" />
            <p className="text-2xl font-light italic mb-6">
              "Dorfkiste hat nicht nur mein Leben vereinfacht, sondern mir auch gezeigt, 
              wie bereichernd eine aktive Nachbarschaft sein kann. Ich habe neue Freunde 
              gefunden und spare jeden Monat Geld!"
            </p>
            <div className="flex items-center justify-center gap-2">
              <span className="font-semibold">Maria W.</span>
              <span className="text-gray-500">•</span>
              <span className="text-gray-600">Mitglied seit 2021</span>
            </div>
          </div>
        </div>

        {/* Share Your Story */}
        <div className="mt-16 text-center">
          <h3 className="text-2xl font-bold mb-4">Haben Sie auch eine Erfolgsgeschichte?</h3>
          <p className="text-gray-600 mb-6">
            Wir würden gerne von Ihren Erfahrungen mit Dorfkiste hören!
          </p>
          <a 
            href="/contact" 
            className="inline-block px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            Geschichte teilen
          </a>
        </div>
      </div>
    </div>
  )
}