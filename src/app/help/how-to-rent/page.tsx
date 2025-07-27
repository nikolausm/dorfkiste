import { Search, MessageSquare, Calendar, Package, Star, Shield } from "lucide-react"

export default function HowToRentPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-12">
        <h1 className="text-3xl font-bold mb-8">Wie funktioniert das Mieten?</h1>
        
        <div className="bg-white rounded-lg shadow-sm p-8">
          <p className="text-lg text-gray-700 mb-8">
            Bei Dorfkiste ist das Mieten von Gegenständen einfach, sicher und unkompliziert. 
            Folgen Sie diesen einfachen Schritten, um Ihren ersten Artikel zu mieten.
          </p>

          <div className="space-y-8">
            {/* Step 1 */}
            <div className="flex gap-4">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                  <Search className="w-6 h-6 text-blue-600" />
                </div>
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-2">1. Artikel finden</h3>
                <p className="text-gray-600">
                  Durchsuchen Sie unsere Kategorien oder nutzen Sie die Suchfunktion, um den gewünschten 
                  Artikel zu finden. Verwenden Sie Filter für Standort, Preis und Verfügbarkeit.
                </p>
              </div>
            </div>

            {/* Step 2 */}
            <div className="flex gap-4">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                  <MessageSquare className="w-6 h-6 text-green-600" />
                </div>
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-2">2. Kontakt aufnehmen</h3>
                <p className="text-gray-600">
                  Klicken Sie auf den Artikel und senden Sie eine Anfrage an den Vermieter. 
                  Klären Sie Details wie Abholzeit, Standort und besondere Bedingungen.
                </p>
              </div>
            </div>

            {/* Step 3 */}
            <div className="flex gap-4">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                  <Calendar className="w-6 h-6 text-purple-600" />
                </div>
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-2">3. Buchung bestätigen</h3>
                <p className="text-gray-600">
                  Wählen Sie Ihren Mietzeitraum und bestätigen Sie die Buchung. Die Zahlung wird 
                  sicher über unsere Plattform abgewickelt.
                </p>
              </div>
            </div>

            {/* Step 4 */}
            <div className="flex gap-4">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
                  <Package className="w-6 h-6 text-orange-600" />
                </div>
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-2">4. Abholen und nutzen</h3>
                <p className="text-gray-600">
                  Holen Sie den Artikel zum vereinbarten Zeitpunkt ab. Prüfen Sie den Zustand 
                  gemeinsam mit dem Vermieter und genießen Sie die Nutzung!
                </p>
              </div>
            </div>

            {/* Step 5 */}
            <div className="flex gap-4">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center">
                  <Star className="w-6 h-6 text-yellow-600" />
                </div>
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-2">5. Zurückgeben und bewerten</h3>
                <p className="text-gray-600">
                  Geben Sie den Artikel pünktlich und im vereinbarten Zustand zurück. 
                  Hinterlassen Sie eine Bewertung, um anderen Nutzern zu helfen.
                </p>
              </div>
            </div>
          </div>

          <div className="mt-12 bg-blue-50 p-6 rounded-lg">
            <div className="flex items-start gap-3">
              <Shield className="w-6 h-6 text-blue-600 flex-shrink-0 mt-1" />
              <div>
                <h3 className="font-semibold mb-2">Ihre Sicherheit ist uns wichtig</h3>
                <p className="text-gray-700">
                  Alle Transaktionen sind durch unsere Plattform abgesichert. Bei Problemen 
                  steht Ihnen unser Support-Team zur Verfügung. Vermieter und Mieter werden 
                  verifiziert, und alle Artikel können versichert werden.
                </p>
              </div>
            </div>
          </div>

          <div className="mt-8 space-y-4">
            <h3 className="text-xl font-semibold">Häufige Fragen zum Mietprozess</h3>
            
            <div className="space-y-3">
              <details className="group">
                <summary className="cursor-pointer font-medium text-gray-700 hover:text-gray-900">
                  Was passiert, wenn ein Artikel beschädigt wird?
                </summary>
                <p className="mt-2 text-gray-600 pl-4">
                  Kleinere Gebrauchsspuren sind normal. Bei größeren Schäden greift unsere 
                  Versicherung. Melden Sie Schäden sofort dem Vermieter und unserem Support.
                </p>
              </details>

              <details className="group">
                <summary className="cursor-pointer font-medium text-gray-700 hover:text-gray-900">
                  Kann ich die Mietdauer verlängern?
                </summary>
                <p className="mt-2 text-gray-600 pl-4">
                  Ja, kontaktieren Sie den Vermieter über unsere Plattform. Wenn der Artikel 
                  verfügbar ist, können Sie die Miete einfach verlängern.
                </p>
              </details>

              <details className="group">
                <summary className="cursor-pointer font-medium text-gray-700 hover:text-gray-900">
                  Wie funktioniert die Bezahlung?
                </summary>
                <p className="mt-2 text-gray-600 pl-4">
                  Die Zahlung erfolgt sicher über unsere Plattform. Wir unterstützen 
                  Kreditkarten, PayPal und SEPA-Lastschrift. Der Vermieter erhält das 
                  Geld nach erfolgreicher Übergabe.
                </p>
              </details>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}