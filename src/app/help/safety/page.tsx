import { Shield, Lock, UserCheck, AlertTriangle, Phone, CheckCircle } from "lucide-react"

export default function SafetyPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-12">
        <h1 className="text-3xl font-bold mb-8">Sicherheit bei Dorfkiste</h1>
        
        <div className="bg-white rounded-lg shadow-sm p-8">
          <p className="text-lg text-gray-700 mb-8">
            Ihre Sicherheit hat für uns höchste Priorität. Erfahren Sie, wie wir dafür sorgen, 
            dass das Teilen auf Dorfkiste sicher und vertrauenswürdig ist.
          </p>

          {/* Verification */}
          <div className="mb-12">
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
              <UserCheck className="w-6 h-6 text-blue-600" />
              Nutzerverifizierung
            </h2>
            
            <div className="space-y-4">
              <div className="bg-blue-50 p-6 rounded-lg">
                <h3 className="font-semibold mb-3">So verifizieren wir Nutzer:</h3>
                <ul className="space-y-2">
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                    <span>E-Mail-Verifizierung bei der Registrierung</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                    <span>Telefonnummer-Verifizierung für zusätzliche Sicherheit</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                    <span>Ausweisverifizierung für hochwertige Artikel (optional)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                    <span>Adressverifizierung durch Postsendung</span>
                  </li>
                </ul>
              </div>

              <p className="text-gray-600">
                Verifizierte Nutzer erhalten ein spezielles Abzeichen in ihrem Profil, 
                das anderen Nutzern zusätzliches Vertrauen gibt.
              </p>
            </div>
          </div>

          {/* Payment Security */}
          <div className="mb-12">
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
              <Lock className="w-6 h-6 text-green-600" />
              Sichere Zahlungen
            </h2>
            
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-semibold mb-3">Zahlungsschutz</h3>
                <ul className="space-y-2 text-gray-600">
                  <li>• Verschlüsselte Zahlungsabwicklung</li>
                  <li>• Keine Weitergabe von Zahlungsdaten</li>
                  <li>• Zahlung erst nach Artikelübergabe</li>
                  <li>• Käuferschutz bei Problemen</li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold mb-3">Betrugsschutz</h3>
                <ul className="space-y-2 text-gray-600">
                  <li>• Automatische Betrugserkennung</li>
                  <li>• Manuelle Überprüfung verdächtiger Aktivitäten</li>
                  <li>• Sperrung auffälliger Konten</li>
                  <li>• Rückerstattung bei nachgewiesenem Betrug</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Safety Tips */}
          <div className="mb-12">
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
              <Shield className="w-6 h-6 text-purple-600" />
              Sicherheitstipps
            </h2>
            
            <div className="space-y-6">
              <div>
                <h3 className="font-semibold mb-3">Bei der Übergabe</h3>
                <ul className="space-y-2 text-gray-600">
                  <li className="flex items-start gap-2">
                    <span className="text-purple-600">•</span>
                    <span>Treffen Sie sich an öffentlichen, gut beleuchteten Orten</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-purple-600">•</span>
                    <span>Dokumentieren Sie den Zustand des Artikels mit Fotos</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-purple-600">•</span>
                    <span>Erstellen Sie ein Übergabeprotokoll</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-purple-600">•</span>
                    <span>Tauschen Sie Kontaktdaten für Notfälle aus</span>
                  </li>
                </ul>
              </div>

              <div>
                <h3 className="font-semibold mb-3">Online-Sicherheit</h3>
                <ul className="space-y-2 text-gray-600">
                  <li className="flex items-start gap-2">
                    <span className="text-purple-600">•</span>
                    <span>Kommunizieren Sie nur über die Dorfkiste-Plattform</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-purple-600">•</span>
                    <span>Geben Sie keine persönlichen Zahlungsdaten weiter</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-purple-600">•</span>
                    <span>Seien Sie vorsichtig bei ungewöhnlich günstigen Angeboten</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-purple-600">•</span>
                    <span>Melden Sie verdächtige Aktivitäten sofort</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* Report Issues */}
          <div className="mb-12">
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
              <AlertTriangle className="w-6 h-6 text-red-600" />
              Probleme melden
            </h2>
            
            <div className="bg-red-50 p-6 rounded-lg">
              <p className="mb-4">
                Wenn Sie auf verdächtige Aktivitäten stoßen oder Probleme haben, melden Sie diese sofort:
              </p>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <Phone className="w-5 h-5 text-red-600" />
                  <span className="font-semibold">24/7 Notfall-Hotline: 0800 123 4567</span>
                </div>
                <div className="flex items-center gap-3">
                  <Shield className="w-5 h-5 text-red-600" />
                  <span>E-Mail: sicherheit@dorfkiste.de</span>
                </div>
                <div className="flex items-center gap-3">
                  <AlertTriangle className="w-5 h-5 text-red-600" />
                  <span>Melde-Button in jedem Nutzerprofil und Artikel</span>
                </div>
              </div>
            </div>
          </div>

          {/* Trust & Safety Team */}
          <div>
            <h2 className="text-2xl font-bold mb-6">Unser Trust & Safety Team</h2>
            <p className="text-gray-600 mb-4">
              Unser spezialisiertes Team arbeitet rund um die Uhr daran, Dorfkiste zu einem 
              sicheren Ort für alle zu machen:
            </p>
            <ul className="space-y-2 text-gray-600">
              <li>• Überprüfung von gemeldeten Inhalten und Nutzern</li>
              <li>• Entwicklung neuer Sicherheitsfeatures</li>
              <li>• Zusammenarbeit mit lokalen Behörden bei Bedarf</li>
              <li>• Schulung der Community in Sicherheitsthemen</li>
            </ul>
          </div>

          <div className="mt-12 p-6 bg-gray-100 rounded-lg text-center">
            <p className="text-lg font-semibold mb-2">
              Gemeinsam für mehr Sicherheit
            </p>
            <p className="text-gray-600">
              Helfen Sie uns, Dorfkiste sicher zu halten, indem Sie verdächtige 
              Aktivitäten melden und unsere Sicherheitsrichtlinien befolgen.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}