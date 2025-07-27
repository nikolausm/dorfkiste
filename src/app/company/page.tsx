import { Building2, Target, Users, Globe, Award, TrendingUp } from "lucide-react"
import Link from "next/link"

export default function CompanyPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-b from-blue-900 to-blue-800 text-white py-20">
        <div className="max-w-6xl mx-auto px-4">
          <h1 className="text-5xl font-bold mb-6">Das Unternehmen</h1>
          <p className="text-2xl mb-8">
            Wir revolutionieren die Art, wie Nachbarn teilen
          </p>
          <p className="text-xl max-w-3xl">
            Dorfkiste wurde 2020 gegründet mit der Vision, Nachbarschaften zu stärken 
            und nachhaltigen Konsum zu fördern. Heute sind wir die führende Plattform 
            für lokales Teilen in Deutschland.
          </p>
        </div>
      </div>

      {/* Company Stats */}
      <div className="py-16">
        <div className="max-w-6xl mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8">
            <div className="bg-white rounded-lg shadow-sm p-6 text-center">
              <Users className="w-12 h-12 text-blue-600 mx-auto mb-3" />
              <div className="text-3xl font-bold">10.000+</div>
              <div className="text-gray-600">Aktive Nutzer</div>
            </div>
            <div className="bg-white rounded-lg shadow-sm p-6 text-center">
              <Globe className="w-12 h-12 text-green-600 mx-auto mb-3" />
              <div className="text-3xl font-bold">50+</div>
              <div className="text-gray-600">Städte</div>
            </div>
            <div className="bg-white rounded-lg shadow-sm p-6 text-center">
              <TrendingUp className="w-12 h-12 text-purple-600 mx-auto mb-3" />
              <div className="text-3xl font-bold">300%</div>
              <div className="text-gray-600">Jährliches Wachstum</div>
            </div>
            <div className="bg-white rounded-lg shadow-sm p-6 text-center">
              <Award className="w-12 h-12 text-orange-600 mx-auto mb-3" />
              <div className="text-3xl font-bold">5</div>
              <div className="text-gray-600">Auszeichnungen</div>
            </div>
          </div>
        </div>
      </div>

      {/* Leadership Team */}
      <div className="py-16 bg-white">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Führungsteam</h2>
          <div className="grid md:grid-cols-2 gap-12">
            <div className="flex gap-6">
              <div className="w-32 h-32 bg-gray-200 rounded-full flex items-center justify-center text-5xl">
                👨‍💼
              </div>
              <div>
                <h3 className="text-xl font-bold">Max Mustermann</h3>
                <p className="text-gray-600 mb-3">CEO & Mitgründer</p>
                <p className="text-gray-700">
                  Max bringt über 10 Jahre Erfahrung in der Tech-Industrie mit. 
                  Seine Vision einer nachhaltigeren Gesellschaft treibt Dorfkiste 
                  seit der ersten Stunde an.
                </p>
              </div>
            </div>
            <div className="flex gap-6">
              <div className="w-32 h-32 bg-gray-200 rounded-full flex items-center justify-center text-5xl">
                👩‍💼
              </div>
              <div>
                <h3 className="text-xl font-bold">Erika Musterfrau</h3>
                <p className="text-gray-600 mb-3">CTO & Mitgründerin</p>
                <p className="text-gray-700">
                  Als technische Visionärin hat Erika die Plattform von Grund auf 
                  entwickelt. Ihre Expertise in AI und Machine Learning macht 
                  Dorfkiste zur innovativsten Sharing-Plattform.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Company Culture */}
      <div className="py-16">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Unsere Unternehmenskultur</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Target className="w-10 h-10 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Innovation</h3>
              <p className="text-gray-600">
                Wir hinterfragen ständig den Status Quo und suchen nach 
                besseren Lösungen für unsere Nutzer.
              </p>
            </div>
            <div className="text-center">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="w-10 h-10 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Teamwork</h3>
              <p className="text-gray-600">
                Gemeinsam sind wir stärker. Wir fördern Zusammenarbeit 
                und offene Kommunikation.
              </p>
            </div>
            <div className="text-center">
              <div className="w-20 h-20 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Building2 className="w-10 h-10 text-purple-600" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Verantwortung</h3>
              <p className="text-gray-600">
                Wir übernehmen Verantwortung für unsere Nutzer, Mitarbeiter 
                und die Umwelt.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Timeline */}
      <div className="py-16 bg-gray-100">
        <div className="max-w-4xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Unsere Geschichte</h2>
          <div className="space-y-8">
            <div className="flex gap-4">
              <div className="w-24 text-right font-bold text-gray-600">2020</div>
              <div className="w-4 h-4 bg-blue-600 rounded-full mt-1"></div>
              <div className="flex-1">
                <h4 className="font-semibold mb-1">Gründung</h4>
                <p className="text-gray-600">
                  Max und Erika gründen Dorfkiste als WhatsApp-Gruppe für ihre Nachbarschaft
                </p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="w-24 text-right font-bold text-gray-600">2021</div>
              <div className="w-4 h-4 bg-blue-600 rounded-full mt-1"></div>
              <div className="flex-1">
                <h4 className="font-semibold mb-1">Erste Finanzierung</h4>
                <p className="text-gray-600">
                  Seed-Finanzierung von 500.000€ und Launch der ersten App-Version
                </p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="w-24 text-right font-bold text-gray-600">2022</div>
              <div className="w-4 h-4 bg-blue-600 rounded-full mt-1"></div>
              <div className="flex-1">
                <h4 className="font-semibold mb-1">Expansion</h4>
                <p className="text-gray-600">
                  Ausweitung auf 10 deutsche Städte, 1.000+ aktive Nutzer
                </p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="w-24 text-right font-bold text-gray-600">2023</div>
              <div className="w-4 h-4 bg-blue-600 rounded-full mt-1"></div>
              <div className="flex-1">
                <h4 className="font-semibold mb-1">Series A</h4>
                <p className="text-gray-600">
                  3 Millionen Euro Finanzierung, Launch der Business-Features
                </p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="w-24 text-right font-bold text-gray-600">2024</div>
              <div className="w-4 h-4 bg-blue-600 rounded-full mt-1"></div>
              <div className="flex-1">
                <h4 className="font-semibold mb-1">Marktführer</h4>
                <p className="text-gray-600">
                  10.000+ Nutzer, 50+ Städte, führende Sharing-Plattform in Deutschland
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* CTA */}
      <div className="py-16 bg-blue-600 text-white">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-6">Werden Sie Teil unserer Mission</h2>
          <p className="text-xl mb-8">
            Interessiert an einer Karriere bei Dorfkiste? Wir suchen 
            leidenschaftliche Menschen, die mit uns die Zukunft gestalten wollen.
          </p>
          <div className="flex gap-4 justify-center">
            <Link 
              href="/careers" 
              className="px-8 py-4 bg-white text-blue-600 rounded-lg hover:bg-gray-100 transition-colors font-semibold"
            >
              Offene Stellen
            </Link>
            <Link 
              href="/contact" 
              className="px-8 py-4 border-2 border-white text-white rounded-lg hover:bg-white hover:text-blue-600 transition-colors font-semibold"
            >
              Kontakt
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}