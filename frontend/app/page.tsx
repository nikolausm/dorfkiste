import Link from 'next/link';
import SearchBar from '@/components/SearchBar';

export default function Home() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="hero-gradient pt-20 pb-32">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16 animate-fade-in">
            <h1 className="text-5xl lg:text-7xl font-bold text-neutral-900 mb-6 leading-tight">
              Willkommen bei{' '}
              <span className="gradient-text">Dorfkiste</span>
            </h1>
            <p className="text-xl lg:text-2xl text-neutral-600 max-w-4xl mx-auto mb-12 leading-relaxed">
              Verleihe und finde alles was du brauchst in deiner Nachbarschaft. 
              Von Werkzeugen bis zu Dienstleistungen - hier findest du es!
            </p>
            
            <div className="mb-16 max-w-2xl mx-auto">
              <SearchBar />
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link href="/angebote" className="btn-primary text-lg px-8 py-4">
                Angebote durchsuchen
              </Link>
              <Link href="/registrieren" className="btn-secondary text-lg px-8 py-4">
                Kostenlos registrieren
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="feature-section">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-neutral-900 mb-4">
              Entdecke unsere Kategorien
            </h2>
            <p className="text-xl text-neutral-600 max-w-3xl mx-auto">
              Von Heimwerker-Tools bis zu professionellen Dienstleistungen - 
              finde genau das, was du suchst
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-20">
            <Link href="/angebote?categoryId=1" className="category-card card-hover animate-slide-up group">
              <div className="relative z-10">
                <div className="text-4xl mb-4">🔧</div>
                <h3 className="text-xl font-bold mb-3 text-neutral-900">Werkzeuge & Geräte</h3>
                <p className="text-neutral-600 leading-relaxed">
                  Bohrmaschinen, Sägen und mehr für deine Heimwerkerprojekte
                </p>
              </div>
            </Link>
            
            <Link href="/angebote?categoryId=2" className="category-card card-hover animate-slide-up group" style={{animationDelay: '0.1s'}}>
              <div className="relative z-10">
                <div className="text-4xl mb-4">🌿</div>
                <h3 className="text-xl font-bold mb-3 text-neutral-900">Gartengeräte</h3>
                <p className="text-neutral-600 leading-relaxed">
                  Rasenmäher, Heckenscheren für einen perfekten Garten
                </p>
              </div>
            </Link>
            
            <Link href="/angebote?categoryId=3" className="category-card card-hover animate-slide-up group" style={{animationDelay: '0.2s'}}>
              <div className="relative z-10">
                <div className="text-4xl mb-4">🏠</div>
                <h3 className="text-xl font-bold mb-3 text-neutral-900">Haushaltsgeräte</h3>
                <p className="text-neutral-600 leading-relaxed">
                  Küchengeräte und Reinigungsgeräte für den Haushalt
                </p>
              </div>
            </Link>
            
            <Link href="/angebote?categoryId=4" className="category-card card-hover animate-slide-up group" style={{animationDelay: '0.3s'}}>
              <div className="relative z-10">
                <div className="text-4xl mb-4">🚴</div>
                <h3 className="text-xl font-bold mb-3 text-neutral-900">Sport & Freizeit</h3>
                <p className="text-neutral-600 leading-relaxed">
                  Sportgeräte, Fahrräder und Campingausrüstung
                </p>
              </div>
            </Link>
            
            <Link href="/angebote?categoryId=5" className="category-card card-hover animate-slide-up group" style={{animationDelay: '0.4s'}}>
              <div className="relative z-10">
                <div className="text-4xl mb-4">🚚</div>
                <h3 className="text-xl font-bold mb-3 text-neutral-900">Transport & Umzug</h3>
                <p className="text-neutral-600 leading-relaxed">
                  Anhänger, Transportboxen und Umzugshilfen
                </p>
              </div>
            </Link>
            
            <Link href="/angebote?categoryId=7" className="category-card card-hover animate-slide-up group" style={{animationDelay: '0.5s'}}>
              <div className="relative z-10">
                <div className="text-4xl mb-4">⚒️</div>
                <h3 className="text-xl font-bold mb-3 text-neutral-900">Handwerksdienste</h3>
                <p className="text-neutral-600 leading-relaxed">
                  Professionelle Hilfe für Reparaturen und Renovierungen
                </p>
              </div>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 bg-white">
        <div className="container mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            <div className="text-center group">
              <div className="w-16 h-16 bg-gradient-to-br from-primary-500 to-primary-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-soft group-hover:shadow-medium transition-all duration-300 transform group-hover:scale-110">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold mb-4 text-neutral-900">Lokal & Nachbarschaftlich</h3>
              <p className="text-neutral-600 leading-relaxed">
                Entdecke Angebote in deiner unmittelbaren Umgebung und baue Verbindungen zu deinen Nachbarn auf.
              </p>
            </div>

            <div className="text-center group">
              <div className="w-16 h-16 bg-gradient-to-br from-secondary-500 to-secondary-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-soft group-hover:shadow-medium transition-all duration-300 transform group-hover:scale-110">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold mb-4 text-neutral-900">Sicher & Vertrauensvoll</h3>
              <p className="text-neutral-600 leading-relaxed">
                Bewertungssystem und verifizierte Profile sorgen für eine sichere und vertrauensvolle Gemeinschaft.
              </p>
            </div>

            <div className="text-center group">
              <div className="w-16 h-16 bg-gradient-to-br from-accent-500 to-accent-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-soft group-hover:shadow-medium transition-all duration-300 transform group-hover:scale-110">
                <svg className="w-8 h-8 text-neutral-900" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold mb-4 text-neutral-900">Einfach & Schnell</h3>
              <p className="text-neutral-600 leading-relaxed">
                Finde und verleihe Gegenstände mit wenigen Klicks. Keine komplizierten Prozesse - einfach und intuitiv.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}