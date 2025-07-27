import Link from "next/link"
import { Users, Leaf, Shield, Heart, Target, Award } from "lucide-react"

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-b from-green-600 to-green-700 text-white py-20">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <h1 className="text-5xl font-bold mb-6">Über Dorfkiste</h1>
          <p className="text-2xl mb-8">Gemeinsam nutzen statt einzeln besitzen</p>
          <p className="text-xl max-w-3xl mx-auto">
            Wir glauben an eine nachhaltige Zukunft, in der Nachbarn sich gegenseitig helfen und Ressourcen 
            gemeinsam nutzen. Dorfkiste macht das Teilen einfach, sicher und für jeden zugänglich.
          </p>
        </div>
      </div>

      {/* Mission Section */}
      <div className="py-16">
        <div className="max-w-6xl mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold mb-6">Unsere Mission</h2>
              <p className="text-lg text-gray-700 mb-4">
                Dorfkiste wurde gegründet, um Nachbarschaften zu stärken und nachhaltigen Konsum zu fördern. 
                Wir glauben, dass nicht jeder alles besitzen muss – viele Dinge können wir teilen.
              </p>
              <p className="text-lg text-gray-700 mb-4">
                Unsere Plattform verbindet Menschen, die Gegenstände verleihen möchten, mit denen, die sie 
                nur gelegentlich benötigen. So sparen alle Geld, Platz und schonen gleichzeitig die Umwelt.
              </p>
              <div className="flex gap-4 mt-6">
                <Link href="/auth/signup" className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
                  Jetzt mitmachen
                </Link>
                <Link href="/items" className="px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                  Artikel entdecken
                </Link>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white p-6 rounded-lg shadow-sm text-center">
                <Users className="w-12 h-12 text-green-600 mx-auto mb-3" />
                <div className="text-3xl font-bold">10.000+</div>
                <div className="text-gray-600">Aktive Nutzer</div>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-sm text-center">
                <Package className="w-12 h-12 text-blue-600 mx-auto mb-3" />
                <div className="text-3xl font-bold">25.000+</div>
                <div className="text-gray-600">Artikel geteilt</div>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-sm text-center">
                <Leaf className="w-12 h-12 text-green-600 mx-auto mb-3" />
                <div className="text-3xl font-bold">50t CO₂</div>
                <div className="text-gray-600">Eingespart</div>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-sm text-center">
                <Heart className="w-12 h-12 text-red-600 mx-auto mb-3" />
                <div className="text-3xl font-bold">98%</div>
                <div className="text-gray-600">Zufriedenheit</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Values Section */}
      <div className="py-16 bg-white">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Unsere Werte</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Leaf className="w-10 h-10 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Nachhaltigkeit</h3>
              <p className="text-gray-600">
                Durch das Teilen von Gegenständen reduzieren wir Überkonsum und schonen wertvolle Ressourcen.
              </p>
            </div>
            <div className="text-center">
              <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="w-10 h-10 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Gemeinschaft</h3>
              <p className="text-gray-600">
                Wir fördern den Zusammenhalt in Nachbarschaften und schaffen Verbindungen zwischen Menschen.
              </p>
            </div>
            <div className="text-center">
              <div className="w-20 h-20 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Shield className="w-10 h-10 text-purple-600" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Vertrauen</h3>
              <p className="text-gray-600">
                Sicherheit und Vertrauen stehen bei uns an erster Stelle - für eine sorgenfreie Sharing-Erfahrung.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Team Section */}
      <div className="py-16">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Unser Team</h2>
          <div className="grid md:grid-cols-4 gap-8">
            {[
              { name: "Max Mustermann", role: "Gründer & CEO", image: "👨‍💼" },
              { name: "Erika Musterfrau", role: "Gründerin & CTO", image: "👩‍💼" },
              { name: "Tom Schmidt", role: "Head of Product", image: "👨‍💻" },
              { name: "Lisa Weber", role: "Head of Community", image: "👩‍💻" }
            ].map((member, index) => (
              <div key={index} className="text-center">
                <div className="w-32 h-32 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4 text-5xl">
                  {member.image}
                </div>
                <h3 className="font-semibold text-lg">{member.name}</h3>
                <p className="text-gray-600">{member.role}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Story Section */}
      <div className="py-16 bg-gray-100">
        <div className="max-w-4xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Unsere Geschichte</h2>
          <div className="prose prose-lg mx-auto">
            <p>
              Die Idee zu Dorfkiste entstand 2020, als unsere Gründer Max und Erika feststellten, dass in 
              ihrer Nachbarschaft viele selten genutzte Gegenstände ungenutzt herumstanden. Gleichzeitig 
              kauften Nachbarn dieselben Dinge neu, obwohl sie diese nur gelegentlich brauchten.
            </p>
            <p>
              Was als kleine WhatsApp-Gruppe zum Verleihen von Werkzeugen begann, wuchs schnell zu einer 
              lebendigen Community. Es wurde klar: Menschen wollen teilen, es fehlte nur die richtige Plattform.
            </p>
            <p>
              Heute, vier Jahre später, ist Dorfkiste in über 50 Städten aktiv und hat Tausenden von Menschen 
              geholfen, Geld zu sparen, neue Nachbarn kennenzulernen und nachhaltiger zu leben.
            </p>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="py-16 bg-green-600 text-white">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-6">Werden Sie Teil der Bewegung</h2>
          <p className="text-xl mb-8">
            Schließen Sie sich Tausenden von Menschen an, die bereits von der Sharing Economy profitieren.
          </p>
          <div className="flex gap-4 justify-center">
            <Link href="/auth/signup" className="px-8 py-4 bg-white text-green-600 rounded-lg hover:bg-gray-100 transition-colors font-semibold">
              Kostenlos registrieren
            </Link>
            <Link href="/help" className="px-8 py-4 border-2 border-white text-white rounded-lg hover:bg-white hover:text-green-600 transition-colors font-semibold">
              Mehr erfahren
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

// Add missing import
import { Package } from "lucide-react"