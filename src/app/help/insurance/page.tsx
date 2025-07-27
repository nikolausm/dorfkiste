import { Shield, FileText, AlertCircle, CheckCircle, Euro, Info } from "lucide-react"

export default function InsurancePage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-12">
        <h1 className="text-3xl font-bold mb-8">Versicherungsschutz bei Dorfkiste</h1>
        
        <div className="bg-white rounded-lg shadow-sm p-8">
          <p className="text-lg text-gray-700 mb-8">
            Bei Dorfkiste sind alle Vermietungen automatisch versichert. Erfahren Sie hier alles 
            über unseren umfassenden Versicherungsschutz für Mieter und Vermieter.
          </p>

          {/* Coverage Overview */}
          <div className="mb-12">
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
              <Shield className="w-6 h-6 text-green-600" />
              Automatischer Versicherungsschutz
            </h2>
            
            <div className="bg-green-50 p-6 rounded-lg mb-6">
              <p className="text-lg font-semibold mb-3">
                Jede Vermietung ist automatisch bis zu 10.000€ versichert
              </p>
              <p className="text-gray-700">
                Der Versicherungsschutz ist in der Servicegebühr enthalten - keine zusätzlichen Kosten!
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-semibold mb-3 text-green-700">Was ist versichert?</h3>
                <ul className="space-y-2">
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <span>Beschädigung des Mietgegenstands</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <span>Diebstahl während der Mietzeit</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <span>Totalverlust des Artikels</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <span>Transportschäden</span>
                  </li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold mb-3 text-red-700">Was ist nicht versichert?</h3>
                <ul className="space-y-2">
                  <li className="flex items-start gap-2">
                    <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                    <span>Normale Abnutzung</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                    <span>Vorsätzliche Beschädigung</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                    <span>Grobe Fahrlässigkeit</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                    <span>Schäden durch unsachgemäße Nutzung</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* Deductible */}
          <div className="mb-12">
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
              <Euro className="w-6 h-6 text-blue-600" />
              Selbstbeteiligung
            </h2>
            
            <div className="bg-blue-50 p-6 rounded-lg">
              <p className="mb-4">
                Die Selbstbeteiligung richtet sich nach dem Wert des Mietgegenstands:
              </p>
              <div className="space-y-2">
                <div className="flex justify-between items-center py-2 border-b border-blue-200">
                  <span>Artikelwert bis 500€</span>
                  <span className="font-semibold">50€ Selbstbeteiligung</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-blue-200">
                  <span>Artikelwert 500€ - 2.000€</span>
                  <span className="font-semibold">100€ Selbstbeteiligung</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-blue-200">
                  <span>Artikelwert 2.000€ - 5.000€</span>
                  <span className="font-semibold">200€ Selbstbeteiligung</span>
                </div>
                <div className="flex justify-between items-center py-2">
                  <span>Artikelwert über 5.000€</span>
                  <span className="font-semibold">500€ Selbstbeteiligung</span>
                </div>
              </div>
            </div>
          </div>

          {/* Claims Process */}
          <div className="mb-12">
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
              <FileText className="w-6 h-6 text-purple-600" />
              Schadensfall - Was tun?
            </h2>
            
            <div className="space-y-6">
              <div className="border-l-4 border-purple-600 pl-4">
                <h3 className="font-semibold mb-2">1. Schaden dokumentieren</h3>
                <p className="text-gray-600">
                  Machen Sie Fotos vom Schaden und notieren Sie, wie es dazu kam. 
                  Je detaillierter die Dokumentation, desto schneller die Bearbeitung.
                </p>
              </div>
              
              <div className="border-l-4 border-purple-600 pl-4">
                <h3 className="font-semibold mb-2">2. Schaden melden</h3>
                <p className="text-gray-600">
                  Melden Sie den Schaden innerhalb von 24 Stunden über Ihr Dorfkiste-Konto 
                  oder per E-Mail an versicherung@dorfkiste.de.
                </p>
              </div>
              
              <div className="border-l-4 border-purple-600 pl-4">
                <h3 className="font-semibold mb-2">3. Formular ausfüllen</h3>
                <p className="text-gray-600">
                  Füllen Sie das Schadensformular vollständig aus. Wir benötigen: 
                  Schadensbeschreibung, Fotos, Zeugenaussagen (falls vorhanden).
                </p>
              </div>
              
              <div className="border-l-4 border-purple-600 pl-4">
                <h3 className="font-semibold mb-2">4. Bearbeitung abwarten</h3>
                <p className="text-gray-600">
                  Unser Versicherungsteam bearbeitet Ihren Fall innerhalb von 3-5 Werktagen. 
                  Bei Rückfragen kontaktieren wir Sie direkt.
                </p>
              </div>
            </div>
          </div>

          {/* Additional Coverage */}
          <div className="mb-12">
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
              <Info className="w-6 h-6 text-indigo-600" />
              Zusätzlicher Versicherungsschutz
            </h2>
            
            <div className="space-y-4">
              <div className="bg-indigo-50 p-6 rounded-lg">
                <h3 className="font-semibold mb-3">Premium-Versicherung für hochwertige Artikel</h3>
                <p className="text-gray-700 mb-3">
                  Für Artikel über 10.000€ Wert bieten wir eine erweiterte Versicherung:
                </p>
                <ul className="space-y-1 text-gray-600">
                  <li>• Deckung bis 50.000€</li>
                  <li>• Reduzierte Selbstbeteiligung</li>
                  <li>• Erweiterte Schadensfälle abgedeckt</li>
                  <li>• Zusatzkosten: 5% des Mietpreises</li>
                </ul>
              </div>

              <div className="bg-indigo-50 p-6 rounded-lg">
                <h3 className="font-semibold mb-3">Haftpflichtversicherung</h3>
                <p className="text-gray-700">
                  Schützt Sie vor Ansprüchen Dritter bei Personen- oder Sachschäden, 
                  die durch die Nutzung des gemieteten Artikels entstehen. 
                  Zusatzkosten: 2€ pro Miettag.
                </p>
              </div>
            </div>
          </div>

          {/* FAQ */}
          <div className="mb-12">
            <h2 className="text-2xl font-bold mb-6">Häufige Fragen zur Versicherung</h2>
            
            <div className="space-y-4">
              <details className="group">
                <summary className="cursor-pointer font-medium text-gray-700 hover:text-gray-900">
                  Muss ich als Vermieter eine eigene Versicherung haben?
                </summary>
                <p className="mt-2 text-gray-600 pl-4">
                  Nein, der Dorfkiste-Versicherungsschutz deckt Ihre Artikel während der 
                  Vermietung ab. Eine eigene Hausrat- oder Haftpflichtversicherung ist 
                  aber generell empfehlenswert.
                </p>
              </details>

              <details className="group">
                <summary className="cursor-pointer font-medium text-gray-700 hover:text-gray-900">
                  Was passiert bei einem Totalschaden?
                </summary>
                <p className="mt-2 text-gray-600 pl-4">
                  Bei einem Totalschaden erstatten wir den Zeitwert des Artikels abzüglich 
                  der Selbstbeteiligung. Der Zeitwert berücksichtigt Alter und Zustand 
                  des Artikels.
                </p>
              </details>

              <details className="group">
                <summary className="cursor-pointer font-medium text-gray-700 hover:text-gray-900">
                  Gilt die Versicherung auch im Ausland?
                </summary>
                <p className="mt-2 text-gray-600 pl-4">
                  Die Standardversicherung gilt nur innerhalb Deutschlands. Für 
                  grenzüberschreitende Vermietungen kontaktieren Sie bitte unseren Support.
                </p>
              </details>
            </div>
          </div>

          <div className="p-6 bg-gray-100 rounded-lg text-center">
            <p className="text-lg font-semibold mb-2">
              Haben Sie Fragen zur Versicherung?
            </p>
            <p className="text-gray-600 mb-4">
              Unser Versicherungsteam hilft Ihnen gerne weiter.
            </p>
            <div className="flex gap-4 justify-center">
              <a 
                href="mailto:versicherung@dorfkiste.de" 
                className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                E-Mail senden
              </a>
              <a 
                href="/contact" 
                className="px-6 py-3 border border-gray-300 rounded-lg hover:bg-white transition-colors"
              >
                Kontaktformular
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}