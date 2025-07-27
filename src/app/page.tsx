import Link from 'next/link'
import Image from 'next/image'
import ItemCard from '@/components/ItemCard'
import { ChevronRight, Truck, Shield, Clock, Users } from 'lucide-react'

export default async function Home() {
  // Fetch some featured items
  const featuredResponse = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/items?limit=8`, {
    cache: 'no-store'
  })
  const featuredData = await featuredResponse.ok ? await featuredResponse.json() : { items: [] }
  const featuredItems = featuredData.items || []

  // Popular categories
  const popularCategories = [
    { name: "Werkzeuge", id: "werkzeuge", icon: "🔧", color: "bg-blue-50" },
    { name: "Elektronik", id: "elektronik", icon: "📱", color: "bg-purple-50" },
    { name: "Sport & Freizeit", id: "sport", icon: "⚽", color: "bg-green-50" },
    { name: "Haushalt", id: "haushalt", icon: "🏠", color: "bg-yellow-50" },
    { name: "Garten", id: "garten", icon: "🌱", color: "bg-emerald-50" },
    { name: "Fahrzeuge", id: "fahrzeuge", icon: "🚗", color: "bg-red-50" },
  ]

  return (
    <main className="min-h-screen bg-gray-50">
      {/* Hero Banner */}
      <section className="bg-gradient-to-r from-[#3665f3] to-[#1e49c7] text-white">
        <div className="max-w-[1280px] mx-auto px-4 py-8">
          <div className="grid md:grid-cols-2 gap-8 items-center">
            <div>
              <h1 className="text-4xl md:text-5xl font-bold mb-4">
                Teilen wie im Dorf
              </h1>
              <p className="text-xl mb-6 text-blue-100">
                Leihe und verleihe in deiner Nachbarschaft – einfach, sicher und nachhaltig
              </p>
              <div className="flex gap-4">
                <Link
                  href="/items/new"
                  className="bg-white text-[#3665f3] px-6 py-3 rounded font-semibold hover:bg-gray-100 transition-colors"
                >
                  Artikel einstellen
                </Link>
                <Link
                  href="/items"
                  className="bg-transparent border-2 border-white text-white px-6 py-3 rounded font-semibold hover:bg-white hover:text-[#3665f3] transition-colors"
                >
                  Artikel durchsuchen
                </Link>
              </div>
            </div>
            <div className="hidden md:block">
              <div className="relative h-64">
                <div className="absolute inset-0 bg-white bg-opacity-10 rounded-lg backdrop-blur-sm"></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Popular Categories */}
      <section className="py-8 bg-white border-b">
        <div className="max-w-[1280px] mx-auto px-4">
          <h2 className="text-2xl font-bold mb-6">Beliebte Kategorien</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {popularCategories.map((category) => (
              <Link
                key={category.id}
                href={`/categories/${category.id}`}
                className="flex flex-col items-center p-4 rounded-lg hover:shadow-md transition-shadow bg-white border border-gray-200"
              >
                <div className={`text-4xl mb-3 p-4 rounded-full ${category.color}`}>
                  {category.icon}
                </div>
                <span className="text-sm font-medium text-center">{category.name}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Items */}
      <section className="py-8">
        <div className="max-w-[1280px] mx-auto px-4">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold">Beliebte Artikel</h2>
            <Link
              href="/items"
              className="text-[#3665f3] hover:underline flex items-center text-sm"
            >
              Alle anzeigen
              <ChevronRight className="w-4 h-4 ml-1" />
            </Link>
          </div>
          
          {featuredItems.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {featuredItems.slice(0, 8).map((item: any) => (
                <ItemCard
                  key={item.id}
                  id={item.id}
                  title={item.title}
                  imageUrl={item.images?.[0]?.url}
                  pricePerDay={item.pricePerDay}
                  pricePerHour={item.pricePerHour}
                  location={item.location}
                  condition={item.condition}
                  available={item.available}
                  user={{
                    id: item.user.id,
                    name: item.user.name,
                    rating: 4.5,
                    reviewCount: 12
                  }}
                  category={item.category?.id}
                  viewCount={Math.floor(Math.random() * 100) + 10}
                />
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-lg p-8 text-center">
              <p className="text-gray-500">Noch keine Artikel verfügbar</p>
              <Link
                href="/items/new"
                className="text-[#3665f3] hover:underline mt-2 inline-block"
              >
                Sei der Erste und stelle einen Artikel ein!
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* Trust Indicators */}
      <section className="py-12 bg-white border-t">
        <div className="max-w-[1280px] mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <Truck className="w-12 h-12 mx-auto mb-3 text-[#3665f3]" />
              <h3 className="font-semibold mb-1">Lokale Abholung</h3>
              <p className="text-sm text-gray-600">Keine Versandkosten</p>
            </div>
            <div>
              <Shield className="w-12 h-12 mx-auto mb-3 text-[#5ba71b]" />
              <h3 className="font-semibold mb-1">Sicher & Versichert</h3>
              <p className="text-sm text-gray-600">Optionaler Schutz</p>
            </div>
            <div>
              <Clock className="w-12 h-12 mx-auto mb-3 text-[#f9a316]" />
              <h3 className="font-semibold mb-1">Flexible Zeiten</h3>
              <p className="text-sm text-gray-600">Stunden- oder tageweise</p>
            </div>
            <div>
              <Users className="w-12 h-12 mx-auto mb-3 text-[#e53238]" />
              <h3 className="font-semibold mb-1">Nachbarschaft</h3>
              <p className="text-sm text-gray-600">Vertraute Community</p>
            </div>
          </div>
        </div>
      </section>

      {/* Daily Deals / Special Section */}
      <section className="py-8 bg-gray-100">
        <div className="max-w-[1280px] mx-auto px-4">
          <div className="bg-white rounded-lg p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-2xl font-bold mb-2">Neu bei Dorfkiste?</h2>
                <p className="text-gray-600">
                  Registriere dich jetzt und erhalte Zugang zu allen Artikeln in deiner Nachbarschaft
                </p>
              </div>
              <Link
                href="/auth/signup"
                className="bg-[#3665f3] text-white px-6 py-3 rounded font-semibold hover:bg-[#1e49c7] transition-colors whitespace-nowrap"
              >
                Jetzt registrieren
              </Link>
            </div>
            <div className="grid md:grid-cols-3 gap-4 text-sm">
              <div className="flex items-start gap-3">
                <div className="text-[#3665f3] font-bold text-lg">1.</div>
                <div>
                  <h4 className="font-semibold">Kostenlos anmelden</h4>
                  <p className="text-gray-600">Erstelle dein Profil in weniger als 2 Minuten</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="text-[#3665f3] font-bold text-lg">2.</div>
                <div>
                  <h4 className="font-semibold">Artikel finden</h4>
                  <p className="text-gray-600">Durchsuche Angebote in deiner Nähe</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="text-[#3665f3] font-bold text-lg">3.</div>
                <div>
                  <h4 className="font-semibold">Leihen & Sparen</h4>
                  <p className="text-gray-600">Spare Geld und Ressourcen durch Teilen</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}