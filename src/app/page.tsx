import { Camera, Users, Shield, MessageCircle, Calendar, Star } from 'lucide-react'
import Link from 'next/link'

export default function Home() {
  return (
    <main className="min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-green-50 to-blue-50">
        <div className="container mx-auto px-4 py-24">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
              Teilen wie im Dorf
            </h1>
            <p className="text-xl md:text-2xl text-gray-700 mb-8">
              Die Nachbarschafts-Verleihplattform, bei der ein Foto reicht
            </p>
            <div className="flex gap-4 justify-center">
              <Link 
                href="/auth/signup" 
                className="bg-green-600 text-white px-8 py-4 rounded-lg font-semibold hover:bg-green-700 transition-colors inline-block"
              >
                Jetzt starten
              </Link>
              <Link 
                href="/items" 
                className="bg-white text-gray-800 px-8 py-4 rounded-lg font-semibold border-2 border-gray-300 hover:border-gray-400 transition-colors inline-block"
              >
                Artikel entdecken
              </Link>
            </div>
          </div>
        </div>
      </section>
      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl font-bold text-center text-gray-900 mb-16">
            So einfach funktioniert&apos;s
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="bg-green-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Camera className="w-10 h-10 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Foto machen</h3>
              <p className="text-gray-600">
                Einfach Gegenstand fotografieren - die KI erkennt automatisch was es ist
              </p>
            </div>
            <div className="text-center">
              <div className="bg-blue-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
                <MessageCircle className="w-10 h-10 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Anfragen erhalten</h3>
              <p className="text-gray-600">
                Nachbarn können deine Sachen anfragen und per Chat kommunizieren
              </p>
            </div>
            <div className="text-center">
              <div className="bg-purple-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Star className="w-10 h-10 text-purple-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Bewertungen sammeln</h3>
              <p className="text-gray-600">
                Nach jedem Verleih gibt es Bewertungen für mehr Vertrauen
              </p>
            </div>
          </div>
        </div>
      </section>
      {/* Benefits Section */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl font-bold text-center text-gray-900 mb-16">
            Warum Dorfkiste?
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <Users className="w-12 h-12 text-green-600 mb-4" />
              <h3 className="text-xl font-semibold mb-2">Starke Gemeinschaft</h3>
              <p className="text-gray-600">
                Lerne deine Nachbarn kennen und baut gemeinsam eine Sharing-Community auf
              </p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <Shield className="w-12 h-12 text-blue-600 mb-4" />
              <h3 className="text-xl font-semibold mb-2">Sicher & Versichert</h3>
              <p className="text-gray-600">
                Verifizierte Profile und optionale Versicherung für deine wertvollen Sachen
              </p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <Calendar className="w-12 h-12 text-purple-600 mb-4" />
              <h3 className="text-xl font-semibold mb-2">Flexible Zeiten</h3>
              <p className="text-gray-600">
                Verleihe stundenweise, tageweise oder für Wochen - ganz wie du willst
              </p>
            </div>
          </div>
        </div>
      </section>
      {/* CTA Section */}
      <section className="py-20 bg-green-600">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold text-white mb-6">
            Bereit zum Teilen?
          </h2>
          <p className="text-xl text-green-100 mb-8 max-w-2xl mx-auto">
            Werde Teil der Dorfkiste-Community und entdecke, was deine Nachbarn alles zu bieten haben
          </p>
          <Link 
            href="/auth/signup" 
            className="bg-white text-green-600 px-8 py-4 rounded-lg font-semibold hover:bg-gray-100 transition-colors inline-block"
          >
            Kostenlos registrieren
          </Link>
        </div>
      </section>
    </main>
  )
}