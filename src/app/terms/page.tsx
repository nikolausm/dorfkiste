export default function TermsPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-12">
        <h1 className="text-3xl font-bold mb-8">Allgemeine Geschäftsbedingungen (AGB)</h1>
        
        <div className="bg-white rounded-lg shadow-sm p-8 prose prose-gray max-w-none">
          <p className="text-gray-600 mb-6">Stand: {new Date().toLocaleDateString('de-DE', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
          
          <h2 className="text-2xl font-bold mt-8 mb-4">§ 1 Geltungsbereich</h2>
          <p>
            (1) Diese Allgemeinen Geschäftsbedingungen (nachfolgend „AGB") gelten für alle über die Plattform Dorfkiste 
            (nachfolgend „Plattform") geschlossenen Verträge zwischen Nutzern.
          </p>
          <p>
            (2) Die Plattform wird betrieben von der Dorfkiste GmbH, Musterstraße 123, 12345 Musterstadt 
            (nachfolgend „Betreiber").
          </p>

          <h2 className="text-2xl font-bold mt-8 mb-4">§ 2 Vertragsschluss</h2>
          <p>
            (1) Die Darstellung der Artikel auf der Plattform stellt kein rechtlich bindendes Angebot, sondern eine 
            Aufforderung zur Abgabe eines Angebots dar.
          </p>
          <p>
            (2) Durch Klicken des Buttons „Jetzt mieten" gibt der Mieter ein verbindliches Angebot zum Abschluss eines 
            Mietvertrages ab.
          </p>

          <h2 className="text-2xl font-bold mt-8 mb-4">§ 3 Nutzung der Plattform</h2>
          <h3 className="text-xl font-semibold mt-6 mb-3">3.1 Registrierung</h3>
          <p>
            Für die Nutzung der Plattform ist eine Registrierung erforderlich. Der Nutzer ist verpflichtet, bei der 
            Registrierung wahrheitsgemäße Angaben zu machen.
          </p>

          <h3 className="text-xl font-semibold mt-6 mb-3">3.2 Nutzerkonto</h3>
          <p>
            Der Nutzer ist für die Geheimhaltung seiner Zugangsdaten selbst verantwortlich und haftet für alle unter 
            seinem Nutzerkonto vorgenommenen Aktivitäten.
          </p>

          <h2 className="text-2xl font-bold mt-8 mb-4">§ 4 Vermietung und Miete</h2>
          <h3 className="text-xl font-semibold mt-6 mb-3">4.1 Zustandekommen des Mietvertrages</h3>
          <p>
            Der Mietvertrag kommt ausschließlich zwischen dem Vermieter und dem Mieter zustande. Der Betreiber ist 
            nicht Vertragspartei des Mietvertrages.
          </p>

          <h3 className="text-xl font-semibold mt-6 mb-3">4.2 Pflichten des Vermieters</h3>
          <p>
            Der Vermieter verpflichtet sich, den Mietgegenstand in dem beschriebenen Zustand und zum vereinbarten 
            Zeitpunkt zur Verfügung zu stellen.
          </p>

          <h3 className="text-xl font-semibold mt-6 mb-3">4.3 Pflichten des Mieters</h3>
          <p>
            Der Mieter verpflichtet sich, den Mietgegenstand pfleglich zu behandeln und zum vereinbarten Zeitpunkt 
            in dem Zustand zurückzugeben, in dem er ihn erhalten hat.
          </p>

          <h2 className="text-2xl font-bold mt-8 mb-4">§ 5 Zahlungsabwicklung</h2>
          <p>
            (1) Die Zahlungsabwicklung erfolgt über den vom Betreiber zur Verfügung gestellten Zahlungsdienstleister.
          </p>
          <p>
            (2) Der Betreiber behält eine Vermittlungsgebühr in Höhe von 10% des Mietpreises ein.
          </p>

          <h2 className="text-2xl font-bold mt-8 mb-4">§ 6 Haftung</h2>
          <p>
            (1) Der Betreiber haftet nicht für Schäden, die durch die Nutzung der vermieteten Gegenstände entstehen.
          </p>
          <p>
            (2) Die Haftung des Betreibers für leichte Fahrlässigkeit ist ausgeschlossen, soweit keine wesentlichen 
            Vertragspflichten verletzt werden.
          </p>

          <h2 className="text-2xl font-bold mt-8 mb-4">§ 7 Bewertungssystem</h2>
          <p>
            (1) Nach Abschluss einer Transaktion können sich Vermieter und Mieter gegenseitig bewerten.
          </p>
          <p>
            (2) Bewertungen müssen wahrheitsgemäß und sachlich sein. Beleidigende oder unwahre Bewertungen können 
            vom Betreiber entfernt werden.
          </p>

          <h2 className="text-2xl font-bold mt-8 mb-4">§ 8 Datenschutz</h2>
          <p>
            Die Verarbeitung personenbezogener Daten erfolgt entsprechend unserer Datenschutzerklärung.
          </p>

          <h2 className="text-2xl font-bold mt-8 mb-4">§ 9 Änderungen der AGB</h2>
          <p>
            (1) Der Betreiber behält sich vor, diese AGB jederzeit zu ändern.
          </p>
          <p>
            (2) Über Änderungen werden die Nutzer per E-Mail informiert. Die Änderungen gelten als genehmigt, wenn 
            der Nutzer nicht innerhalb von 14 Tagen widerspricht.
          </p>

          <h2 className="text-2xl font-bold mt-8 mb-4">§ 10 Kündigung</h2>
          <p>
            (1) Das Nutzungsverhältnis kann von beiden Seiten jederzeit ohne Angabe von Gründen gekündigt werden.
          </p>
          <p>
            (2) Das Recht zur außerordentlichen Kündigung aus wichtigem Grund bleibt unberührt.
          </p>

          <h2 className="text-2xl font-bold mt-8 mb-4">§ 11 Streitschlichtung</h2>
          <p>
            Die Europäische Kommission stellt eine Plattform zur Online-Streitbeilegung (OS) bereit: 
            https://ec.europa.eu/consumers/odr
          </p>

          <h2 className="text-2xl font-bold mt-8 mb-4">§ 12 Schlussbestimmungen</h2>
          <p>
            (1) Es gilt das Recht der Bundesrepublik Deutschland.
          </p>
          <p>
            (2) Ist der Nutzer Kaufmann, juristische Person des öffentlichen Rechts oder öffentlich-rechtliches 
            Sondervermögen, ist ausschließlicher Gerichtsstand für alle Streitigkeiten aus diesem Vertrag der 
            Geschäftssitz des Betreibers.
          </p>
        </div>
      </div>
    </div>
  )
}