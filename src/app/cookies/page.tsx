export default function CookiesPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-12">
        <h1 className="text-3xl font-bold mb-8">Cookie-Richtlinie</h1>
        
        <div className="bg-white rounded-lg shadow-sm p-8 prose prose-gray max-w-none">
          <p className="text-gray-600 mb-6">Stand: {new Date().toLocaleDateString('de-DE', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
          
          <h2 className="text-2xl font-bold mt-8 mb-4">Was sind Cookies?</h2>
          <p>
            Cookies sind kleine Textdateien, die auf Ihrem Computer oder mobilen Gerät gespeichert werden, 
            wenn Sie unsere Website besuchen. Sie ermöglichen es der Website, sich an Ihre Aktionen und 
            Präferenzen (wie Login, Sprache, Schriftgröße und andere Anzeigepräferenzen) über einen bestimmten 
            Zeitraum zu erinnern.
          </p>

          <h2 className="text-2xl font-bold mt-8 mb-4">Wie verwenden wir Cookies?</h2>
          <p>Wir verwenden Cookies für verschiedene Zwecke:</p>

          <h3 className="text-xl font-semibold mt-6 mb-3">Notwendige Cookies</h3>
          <p>
            Diese Cookies sind für das Funktionieren der Website unerlässlich. Sie ermöglichen grundlegende 
            Funktionen wie die Navigation auf der Website und den Zugriff auf sichere Bereiche. Ohne diese 
            Cookies kann die Website nicht ordnungsgemäß funktionieren.
          </p>
          <ul className="list-disc pl-6 my-4">
            <li><strong>Session-Cookie:</strong> Speichert Ihre Anmeldedaten während einer Browsersitzung</li>
            <li><strong>Sicherheits-Token:</strong> Schützt vor Cross-Site-Request-Forgery-Angriffen</li>
            <li><strong>Lastverteilung:</strong> Sorgt für optimale Serverauslastung</li>
          </ul>

          <h3 className="text-xl font-semibold mt-6 mb-3">Funktionale Cookies</h3>
          <p>
            Diese Cookies ermöglichen es der Website, erweiterte Funktionalitäten und Personalisierung zu bieten. 
            Sie können von uns oder von Drittanbietern gesetzt werden, deren Dienste wir auf unseren Seiten verwenden.
          </p>
          <ul className="list-disc pl-6 my-4">
            <li><strong>Spracheinstellungen:</strong> Speichert Ihre bevorzugte Sprache</li>
            <li><strong>Standort:</strong> Speichert Ihren ungefähren Standort für lokale Suchergebnisse</li>
            <li><strong>Präferenzen:</strong> Merkt sich Ihre Einstellungen und Präferenzen</li>
          </ul>

          <h3 className="text-xl font-semibold mt-6 mb-3">Analyse-Cookies</h3>
          <p>
            Diese Cookies helfen uns zu verstehen, wie Besucher mit unserer Website interagieren, indem sie 
            Informationen anonym sammeln und melden. Dies hilft uns, unsere Website kontinuierlich zu verbessern.
          </p>
          <ul className="list-disc pl-6 my-4">
            <li><strong>Google Analytics:</strong> Erfasst anonyme Statistiken über Website-Nutzung</li>
            <li><strong>Hotjar:</strong> Erstellt anonyme Heatmaps und Aufzeichnungen der Nutzerinteraktion</li>
          </ul>

          <h3 className="text-xl font-semibold mt-6 mb-3">Marketing-Cookies</h3>
          <p>
            Diese Cookies werden verwendet, um Werbung zu liefern, die für Sie und Ihre Interessen relevanter ist. 
            Sie werden auch verwendet, um die Anzahl der Anzeigenaufrufe zu begrenzen und die Wirksamkeit von 
            Werbekampagnen zu messen.
          </p>
          <ul className="list-disc pl-6 my-4">
            <li><strong>Facebook Pixel:</strong> Für zielgerichtete Werbung auf Facebook</li>
            <li><strong>Google Ads:</strong> Für Remarketing und Conversion-Tracking</li>
          </ul>

          <h2 className="text-2xl font-bold mt-8 mb-4">Cookie-Verwaltung</h2>
          <p>
            Sie können Cookies in Ihren Browser-Einstellungen kontrollieren und verwalten. Beachten Sie jedoch, 
            dass das Blockieren bestimmter Cookies die Funktionalität unserer Website beeinträchtigen kann.
          </p>

          <h3 className="text-xl font-semibold mt-6 mb-3">Browser-Einstellungen</h3>
          <p>Die meisten Browser ermöglichen es Ihnen:</p>
          <ul className="list-disc pl-6 my-4">
            <li>Alle Cookies zu akzeptieren oder abzulehnen</li>
            <li>Nur Cookies von bestimmten Websites zu akzeptieren</li>
            <li>Benachrichtigt zu werden, wenn ein Cookie gesetzt wird</li>
            <li>Cookies nach dem Schließen des Browsers zu löschen</li>
          </ul>

          <h3 className="text-xl font-semibold mt-6 mb-3">Links zu Browser-Anleitungen</h3>
          <ul className="list-disc pl-6 my-4">
            <li>
              <a href="https://support.google.com/chrome/answer/95647" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                Google Chrome
              </a>
            </li>
            <li>
              <a href="https://support.mozilla.org/de/kb/cookies-erlauben-und-ablehnen" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                Mozilla Firefox
              </a>
            </li>
            <li>
              <a href="https://support.apple.com/de-de/guide/safari/sfri11471/mac" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                Safari
              </a>
            </li>
            <li>
              <a href="https://support.microsoft.com/de-de/help/17442/windows-internet-explorer-delete-manage-cookies" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                Microsoft Edge
              </a>
            </li>
          </ul>

          <h2 className="text-2xl font-bold mt-8 mb-4">Drittanbieter-Cookies</h2>
          <p>
            Einige unserer Seiten zeigen Inhalte von externen Anbietern an. Um diese Inhalte anzuzeigen, 
            müssen Sie deren spezifische Bedingungen akzeptieren, einschließlich ihrer Cookie-Richtlinien.
          </p>

          <h2 className="text-2xl font-bold mt-8 mb-4">Änderungen dieser Cookie-Richtlinie</h2>
          <p>
            Wir können diese Cookie-Richtlinie von Zeit zu Zeit aktualisieren, um Änderungen in unseren 
            Praktiken und Diensten widerzuspiegeln. Bitte überprüfen Sie diese Seite regelmäßig, um über 
            unsere Verwendung von Cookies informiert zu bleiben.
          </p>

          <h2 className="text-2xl font-bold mt-8 mb-4">Kontakt</h2>
          <p>
            Wenn Sie Fragen zu unserer Verwendung von Cookies haben, kontaktieren Sie uns bitte unter:
          </p>
          <p className="mt-4">
            E-Mail: datenschutz@dorfkiste.de<br />
            Telefon: +49 (0) 123 456789<br />
            Adresse: Dorfkiste GmbH, Musterstraße 123, 12345 Musterstadt
          </p>
        </div>
      </div>
    </div>
  )
}