import { Calculator, TrendingUp, Shield, Percent } from "lucide-react"

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-12">
        <h1 className="text-3xl font-bold mb-8">Preisgestaltung bei Dorfkiste</h1>
        
        <div className="bg-white rounded-lg shadow-sm p-8">
          <p className="text-lg text-gray-700 mb-8">
            Bei Dorfkiste bestimmen Sie als Vermieter selbst die Preise für Ihre Artikel. 
            Hier erfahren Sie alles über faire Preisgestaltung und unsere Gebühren.
          </p>

          {/* Pricing Guidelines */}
          <div className="mb-12">
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
              <Calculator className="w-6 h-6 text-blue-600" />
              Preisgestaltung für Vermieter
            </h2>
            
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold mb-2">Wie setze ich den richtigen Preis?</h3>
                <p className="text-gray-600 mb-4">
                  Der Mietpreis sollte fair und marktgerecht sein. Berücksichtigen Sie dabei:
                </p>
                <ul className="list-disc pl-6 space-y-2 text-gray-600">
                  <li>Neupreis des Artikels (empfohlen: 5-10% des Neupreises pro Tag)</li>
                  <li>Zustand und Alter des Artikels</li>
                  <li>Nachfrage in Ihrer Region</li>
                  <li>Vergleichbare Angebote auf Dorfkiste</li>
                  <li>Ihre eigenen Kosten (Wartung, Reinigung, etc.)</li>
                </ul>
              </div>

              <div className="bg-blue-50 p-6 rounded-lg">
                <h3 className="font-semibold mb-3">Preisbeispiele</h3>
                <div className="grid md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <strong>Bohrmaschine (Neupreis 150€)</strong>
                    <ul className="text-gray-600 mt-1">
                      <li>• Pro Tag: 7-15€</li>
                      <li>• Pro Woche: 35-60€</li>
                      <li>• Pro Monat: 100-150€</li>
                    </ul>
                  </div>
                  <div>
                    <strong>Partyzelt (Neupreis 500€)</strong>
                    <ul className="text-gray-600 mt-1">
                      <li>• Pro Tag: 25-50€</li>
                      <li>• Pro Woche: 150-250€</li>
                      <li>• Pro Monat: 400-600€</li>
                    </ul>
                  </div>
                  <div>
                    <strong>Fahrradanhänger (Neupreis 300€)</strong>
                    <ul className="text-gray-600 mt-1">
                      <li>• Pro Tag: 15-25€</li>
                      <li>• Pro Woche: 70-120€</li>
                      <li>• Pro Monat: 200-300€</li>
                    </ul>
                  </div>
                  <div>
                    <strong>Beamer (Neupreis 800€)</strong>
                    <ul className="text-gray-600 mt-1">
                      <li>• Pro Tag: 40-60€</li>
                      <li>• Pro Woche: 200-300€</li>
                      <li>• Pro Monat: 500-700€</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Platform Fees */}
          <div className="mb-12">
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
              <Percent className="w-6 h-6 text-green-600" />
              Unsere Gebühren
            </h2>
            
            <div className="bg-gray-50 p-6 rounded-lg">
              <p className="text-lg font-semibold mb-4">
                Dorfkiste Servicegebühr: <span className="text-green-600">10% des Mietpreises</span>
              </p>
              <p className="text-gray-600 mb-4">
                Die Servicegebühr deckt folgende Leistungen ab:
              </p>
              <ul className="space-y-2">
                <li className="flex items-start gap-2">
                  <Shield className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-600">Sichere Zahlungsabwicklung</span>
                </li>
                <li className="flex items-start gap-2">
                  <Shield className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-600">Versicherungsschutz für Mieter und Vermieter</span>
                </li>
                <li className="flex items-start gap-2">
                  <Shield className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-600">24/7 Kundensupport</span>
                </li>
                <li className="flex items-start gap-2">
                  <Shield className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-600">Bewertungssystem und Nutzerverifizierung</span>
                </li>
              </ul>
            </div>

            <div className="mt-6 p-4 bg-yellow-50 rounded-lg">
              <p className="text-sm text-gray-700">
                <strong>Beispielrechnung:</strong> Bei einer Miete von 50€ erhält der Vermieter 45€, 
                Dorfkiste erhält 5€ als Servicegebühr.
              </p>
            </div>
          </div>

          {/* Tips */}
          <div>
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
              <TrendingUp className="w-6 h-6 text-purple-600" />
              Tipps für erfolgreiche Vermietungen
            </h2>
            
            <div className="space-y-4">
              <div className="border-l-4 border-purple-600 pl-4">
                <h3 className="font-semibold mb-1">Wettbewerbsfähige Preise</h3>
                <p className="text-gray-600">
                  Recherchieren Sie ähnliche Angebote und setzen Sie Ihre Preise konkurrenzfähig.
                </p>
              </div>
              
              <div className="border-l-4 border-purple-600 pl-4">
                <h3 className="font-semibold mb-1">Rabatte für längere Mietdauer</h3>
                <p className="text-gray-600">
                  Bieten Sie gestaffelte Preise an: z.B. 20% Rabatt ab einer Woche, 40% ab einem Monat.
                </p>
              </div>
              
              <div className="border-l-4 border-purple-600 pl-4">
                <h3 className="font-semibold mb-1">Transparente Zusatzkosten</h3>
                <p className="text-gray-600">
                  Kommunizieren Sie klar eventuelle Zusatzkosten wie Kaution, Reinigung oder Lieferung.
                </p>
              </div>
              
              <div className="border-l-4 border-purple-600 pl-4">
                <h3 className="font-semibold mb-1">Saisonale Anpassungen</h3>
                <p className="text-gray-600">
                  Passen Sie Preise an die Nachfrage an: z.B. höhere Preise für Grills im Sommer.
                </p>
              </div>
            </div>
          </div>

          <div className="mt-12 text-center">
            <p className="text-gray-600 mb-4">
              Haben Sie Fragen zur Preisgestaltung?
            </p>
            <a 
              href="/contact" 
              className="inline-block px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              Kontaktieren Sie uns
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}