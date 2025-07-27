export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-12">
        <h1 className="text-3xl font-bold mb-8">Datenschutzerklärung</h1>
        
        <div className="bg-white rounded-lg shadow-sm p-8 prose prose-gray max-w-none">
          <p className="text-gray-600 mb-6">Stand: {new Date().toLocaleDateString('de-DE', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
          
          <h2 className="text-2xl font-bold mt-8 mb-4">1. Datenschutz auf einen Blick</h2>
          <h3 className="text-xl font-semibold mt-6 mb-3">Allgemeine Hinweise</h3>
          <p>
            Die folgenden Hinweise geben einen einfachen Überblick darüber, was mit Ihren personenbezogenen Daten passiert, 
            wenn Sie diese Website besuchen. Personenbezogene Daten sind alle Daten, mit denen Sie persönlich identifiziert werden können.
          </p>

          <h3 className="text-xl font-semibold mt-6 mb-3">Datenerfassung auf dieser Website</h3>
          <p>
            Die Datenverarbeitung auf dieser Website erfolgt durch den Websitebetreiber. Dessen Kontaktdaten können Sie dem 
            Abschnitt „Hinweis zur Verantwortlichen Stelle" in dieser Datenschutzerklärung entnehmen.
          </p>

          <h2 className="text-2xl font-bold mt-8 mb-4">2. Hosting</h2>
          <p>
            Die Inhalte unserer Website werden bei folgendem Anbieter gehostet: [Hosting-Anbieter einfügen]
          </p>

          <h2 className="text-2xl font-bold mt-8 mb-4">3. Allgemeine Hinweise und Pflichtinformationen</h2>
          <h3 className="text-xl font-semibold mt-6 mb-3">Datenschutz</h3>
          <p>
            Die Betreiber dieser Seiten nehmen den Schutz Ihrer persönlichen Daten sehr ernst. Wir behandeln Ihre 
            personenbezogenen Daten vertraulich und entsprechend den gesetzlichen Datenschutzvorschriften sowie dieser 
            Datenschutzerklärung.
          </p>

          <h3 className="text-xl font-semibold mt-6 mb-3">Hinweis zur verantwortlichen Stelle</h3>
          <p>
            Die verantwortliche Stelle für die Datenverarbeitung auf dieser Website ist:
          </p>
          <address className="not-italic">
            Dorfkiste GmbH<br />
            Musterstraße 123<br />
            12345 Musterstadt<br />
            Deutschland<br />
            <br />
            E-Mail: datenschutz@dorfkiste.de<br />
            Telefon: +49 (0) 123 456789
          </address>

          <h2 className="text-2xl font-bold mt-8 mb-4">4. Datenerfassung auf dieser Website</h2>
          <h3 className="text-xl font-semibold mt-6 mb-3">Cookies</h3>
          <p>
            Unsere Internetseiten verwenden so genannte „Cookies". Cookies sind kleine Datenpakete und richten auf Ihrem 
            Endgerät keinen Schaden an. Sie werden entweder vorübergehend für die Dauer einer Sitzung (Session-Cookies) 
            oder dauerhaft (permanente Cookies) auf Ihrem Endgerät gespeichert.
          </p>

          <h3 className="text-xl font-semibold mt-6 mb-3">Server-Log-Dateien</h3>
          <p>
            Der Provider der Seiten erhebt und speichert automatisch Informationen in so genannten Server-Log-Dateien, 
            die Ihr Browser automatisch an uns übermittelt.
          </p>

          <h2 className="text-2xl font-bold mt-8 mb-4">5. Soziale Medien</h2>
          <p>
            Auf unseren Seiten sind Plugins der sozialen Netzwerke eingebunden. Die jeweiligen Anbieter können beim 
            Besuch unserer Website Daten über Ihr Nutzerverhalten sammeln.
          </p>

          <h2 className="text-2xl font-bold mt-8 mb-4">6. Analyse-Tools und Werbung</h2>
          <p>
            Beim Besuch dieser Website kann Ihr Surf-Verhalten statistisch ausgewertet werden. Das geschieht vor allem 
            mit sogenannten Analyseprogrammen.
          </p>

          <h2 className="text-2xl font-bold mt-8 mb-4">7. Newsletter</h2>
          <p>
            Wenn Sie den auf der Website angebotenen Newsletter beziehen möchten, benötigen wir von Ihnen eine E-Mail-Adresse 
            sowie Informationen, welche uns die Überprüfung gestatten, dass Sie der Inhaber der angegebenen E-Mail-Adresse sind.
          </p>

          <h2 className="text-2xl font-bold mt-8 mb-4">8. Plugins und Tools</h2>
          <h3 className="text-xl font-semibold mt-6 mb-3">Google Maps</h3>
          <p>
            Diese Seite nutzt den Kartendienst Google Maps. Anbieter ist die Google Ireland Limited („Google"), Gordon House, 
            Barrow Street, Dublin 4, Irland.
          </p>

          <h2 className="text-2xl font-bold mt-8 mb-4">9. Eigene Dienste</h2>
          <h3 className="text-xl font-semibold mt-6 mb-3">Umgang mit Bewerberdaten</h3>
          <p>
            Wir bieten Ihnen die Möglichkeit, sich bei uns zu bewerben (z. B. per E-Mail, postalisch oder via Online-Bewerberformular).
          </p>

          <p className="mt-8 text-sm text-gray-600">
            Diese Datenschutzerklärung wurde mit Unterstützung von Datenschutz-Generatoren erstellt und entspricht den 
            aktuellen rechtlichen Anforderungen.
          </p>
        </div>
      </div>
    </div>
  )
}