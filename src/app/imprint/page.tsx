export default function ImprintPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-12">
        <h1 className="text-3xl font-bold mb-8">Impressum</h1>
        
        <div className="bg-white rounded-lg shadow-sm p-8 prose prose-gray max-w-none">
          <h2 className="text-2xl font-bold mt-6 mb-4">Angaben gemäß § 5 TMG</h2>
          
          <div className="mb-8">
            <h3 className="text-xl font-semibold mb-3">Betreiber</h3>
            <p>
              Dorfkiste GmbH<br />
              Musterstraße 123<br />
              12345 Musterstadt<br />
              Deutschland
            </p>
          </div>

          <div className="mb-8">
            <h3 className="text-xl font-semibold mb-3">Vertreten durch</h3>
            <p>
              Max Mustermann (Geschäftsführer)<br />
              Erika Musterfrau (Geschäftsführerin)
            </p>
          </div>

          <div className="mb-8">
            <h3 className="text-xl font-semibold mb-3">Kontakt</h3>
            <p>
              Telefon: +49 (0) 123 456789<br />
              Telefax: +49 (0) 123 456788<br />
              E-Mail: info@dorfkiste.de
            </p>
          </div>

          <div className="mb-8">
            <h3 className="text-xl font-semibold mb-3">Registereintrag</h3>
            <p>
              Eintragung im Handelsregister<br />
              Registergericht: Amtsgericht Musterstadt<br />
              Registernummer: HRB 12345
            </p>
          </div>

          <div className="mb-8">
            <h3 className="text-xl font-semibold mb-3">Umsatzsteuer-ID</h3>
            <p>
              Umsatzsteuer-Identifikationsnummer gemäß § 27 a Umsatzsteuergesetz:<br />
              DE123456789
            </p>
          </div>

          <div className="mb-8">
            <h3 className="text-xl font-semibold mb-3">Wirtschafts-ID</h3>
            <p>
              Wirtschafts-Identifikationsnummer gemäß § 139c Abgabenordnung:<br />
              DE987654321
            </p>
          </div>

          <h2 className="text-2xl font-bold mt-8 mb-4">Verantwortlich für den Inhalt nach § 55 Abs. 2 RStV</h2>
          <p>
            Max Mustermann<br />
            Dorfkiste GmbH<br />
            Musterstraße 123<br />
            12345 Musterstadt
          </p>

          <h2 className="text-2xl font-bold mt-8 mb-4">EU-Streitschlichtung</h2>
          <p>
            Die Europäische Kommission stellt eine Plattform zur Online-Streitbeilegung (OS) bereit: 
            <a href="https://ec.europa.eu/consumers/odr/" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
              https://ec.europa.eu/consumers/odr/
            </a>
          </p>
          <p className="mt-2">
            Unsere E-Mail-Adresse finden Sie oben im Impressum.
          </p>

          <h2 className="text-2xl font-bold mt-8 mb-4">Verbraucherstreitbeilegung/Universalschlichtungsstelle</h2>
          <p>
            Wir sind nicht bereit oder verpflichtet, an Streitbeilegungsverfahren vor einer 
            Verbraucherschlichtungsstelle teilzunehmen.
          </p>

          <h2 className="text-2xl font-bold mt-8 mb-4">Berufsbezeichnung und berufsrechtliche Regelungen</h2>
          <p>
            Berufsbezeichnung: Dienstleistungsplattform<br />
            Zuständige Kammer: Industrie- und Handelskammer Musterstadt<br />
            Verliehen in: Deutschland
          </p>

          <h2 className="text-2xl font-bold mt-8 mb-4">Angaben zur Berufshaftpflichtversicherung</h2>
          <p>
            <strong>Name und Sitz des Versicherers:</strong><br />
            Muster Versicherungs AG<br />
            Versicherungsstraße 1<br />
            12345 Versicherungsstadt
          </p>
          <p className="mt-2">
            <strong>Geltungsraum der Versicherung:</strong><br />
            Deutschland
          </p>

          <h2 className="text-2xl font-bold mt-8 mb-4">Haftungsausschluss</h2>
          <h3 className="text-xl font-semibold mt-6 mb-3">Haftung für Inhalte</h3>
          <p>
            Als Diensteanbieter sind wir gemäß § 7 Abs.1 TMG für eigene Inhalte auf diesen Seiten nach den 
            allgemeinen Gesetzen verantwortlich. Nach §§ 8 bis 10 TMG sind wir als Diensteanbieter jedoch nicht 
            verpflichtet, übermittelte oder gespeicherte fremde Informationen zu überwachen oder nach Umständen 
            zu forschen, die auf eine rechtswidrige Tätigkeit hinweisen.
          </p>

          <h3 className="text-xl font-semibold mt-6 mb-3">Haftung für Links</h3>
          <p>
            Unser Angebot enthält Links zu externen Websites Dritter, auf deren Inhalte wir keinen Einfluss haben. 
            Deshalb können wir für diese fremden Inhalte auch keine Gewähr übernehmen. Für die Inhalte der 
            verlinkten Seiten ist stets der jeweilige Anbieter oder Betreiber der Seiten verantwortlich.
          </p>

          <h3 className="text-xl font-semibold mt-6 mb-3">Urheberrecht</h3>
          <p>
            Die durch die Seitenbetreiber erstellten Inhalte und Werke auf diesen Seiten unterliegen dem deutschen 
            Urheberrecht. Die Vervielfältigung, Bearbeitung, Verbreitung und jede Art der Verwertung außerhalb der 
            Grenzen des Urheberrechtes bedürfen der schriftlichen Zustimmung des jeweiligen Autors bzw. Erstellers.
          </p>
        </div>
      </div>
    </div>
  )
}