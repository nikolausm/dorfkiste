import React from 'react';

export default function DatenschutzPage() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-6">Datenschutzerklärung</h1>

      <div className="space-y-6 text-gray-700 dark:text-gray-300">
        <section>
          <h2 className="text-2xl font-semibold mb-3 text-gray-900 dark:text-gray-100">1. Datenschutz auf einen Blick</h2>

          <h3 className="text-xl font-semibold mb-2 text-gray-900 dark:text-gray-100">Allgemeine Hinweise</h3>
          <p className="mb-4">
            Die folgenden Hinweise geben einen einfachen Überblick darüber, was mit Ihren personenbezogenen Daten
            passiert, wenn Sie diese Website besuchen. Personenbezogene Daten sind alle Daten, mit denen Sie
            persönlich identifiziert werden können. Ausführliche Informationen zum Thema Datenschutz entnehmen
            Sie unserer unter diesem Text aufgeführten Datenschutzerklärung.
          </p>

          <h3 className="text-xl font-semibold mb-2 text-gray-900 dark:text-gray-100">Datenerfassung auf dieser Website</h3>
          <p className="mb-2">
            <strong>Wer ist verantwortlich für die Datenerfassung auf dieser Website?</strong>
          </p>
          <p className="mb-4">
            Die Datenverarbeitung auf dieser Website erfolgt durch den Websitebetreiber. Dessen Kontaktdaten
            können Sie dem Impressum dieser Website entnehmen.
          </p>

          <p className="mb-2">
            <strong>Wie erfassen wir Ihre Daten?</strong>
          </p>
          <p className="mb-4">
            Ihre Daten werden zum einen dadurch erhoben, dass Sie uns diese mitteilen. Hierbei kann es sich z.B.
            um Daten handeln, die Sie in ein Kontaktformular oder bei der Registrierung eingeben. Andere Daten
            werden automatisch oder nach Ihrer Einwilligung beim Besuch der Website durch unsere IT-Systeme
            erfasst. Das sind vor allem technische Daten (z.B. Internetbrowser, Betriebssystem oder Uhrzeit des
            Seitenaufrufs).
          </p>

          <p className="mb-2">
            <strong>Wofür nutzen wir Ihre Daten?</strong>
          </p>
          <p className="mb-4">
            Ein Teil der Daten wird erhoben, um eine fehlerfreie Bereitstellung der Website zu gewährleisten.
            Andere Daten können zur Analyse Ihres Nutzerverhaltens verwendet werden.
          </p>

          <p className="mb-2">
            <strong>Welche Rechte haben Sie bezüglich Ihrer Daten?</strong>
          </p>
          <p>
            Sie haben jederzeit das Recht, unentgeltlich Auskunft über Herkunft, Empfänger und Zweck Ihrer
            gespeicherten personenbezogenen Daten zu erhalten. Sie haben außerdem ein Recht, die Berichtigung
            oder Löschung dieser Daten zu verlangen. Wenn Sie eine Einwilligung zur Datenverarbeitung erteilt
            haben, können Sie diese Einwilligung jederzeit für die Zukunft widerrufen. Außerdem haben Sie das
            Recht, unter bestimmten Umständen die Einschränkung der Verarbeitung Ihrer personenbezogenen Daten
            zu verlangen.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-3 text-gray-900 dark:text-gray-100">2. Hosting</h2>
          <p className="mb-2">
            Wir hosten die Inhalte unserer Website bei folgendem Anbieter:
          </p>
          <p className="mb-2">
            <strong>IONOS SE</strong><br/>
            Elgendorfer Str. 57<br/>
            56410 Montabaur<br/>
            Deutschland
          </p>
          <p className="mb-4">
            Details entnehmen Sie der Datenschutzerklärung des Anbieters:{' '}
            <a
              href="https://www.ionos.de/terms-gtc/datenschutzerklaerung/"
              className="text-blue-600 dark:text-blue-400 hover:underline"
              target="_blank"
              rel="noopener noreferrer"
            >
              https://www.ionos.de/terms-gtc/datenschutzerklaerung/
            </a>
          </p>
          <p className="mb-2">
            Die Verwendung von IONOS erfolgt auf Grundlage von Art. 6 Abs. 1 lit. f DSGVO. Wir haben ein
            berechtigtes Interesse an einer möglichst zuverlässigen Darstellung unserer Website. Sofern eine
            entsprechende Einwilligung abgefragt wurde, erfolgt die Verarbeitung ausschließlich auf Grundlage von
            Art. 6 Abs. 1 lit. a DSGVO und § 25 Abs. 1 TTDSG.
          </p>
          <p>
            IONOS ist ein deutscher Hosting-Anbieter mit Sitz in Deutschland. Alle Server befinden sich in
            deutschen Rechenzentren und unterliegen den strengen deutschen Datenschutzgesetzen.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-3 text-gray-900 dark:text-gray-100">3. Allgemeine Hinweise und Pflichtinformationen</h2>

          <h3 className="text-xl font-semibold mb-2 text-gray-900 dark:text-gray-100">Datenschutz</h3>
          <p className="mb-4">
            Die Betreiber dieser Seiten nehmen den Schutz Ihrer persönlichen Daten sehr ernst. Wir behandeln Ihre
            personenbezogenen Daten vertraulich und entsprechend den gesetzlichen Datenschutzvorschriften sowie
            dieser Datenschutzerklärung.
          </p>

          <h3 className="text-xl font-semibold mb-2 text-gray-900 dark:text-gray-100">Hinweis zur verantwortlichen Stelle</h3>
          <p className="mb-2">
            Die verantwortliche Stelle für die Datenverarbeitung auf dieser Website ist:
          </p>
          <p className="mb-4">
            Minicon eG<br/>
            Danziger Str. 4, 66994 Dahn<br/>
            Telefon: 015127600607<br/>
            E-Mail: info@minicon.eu
          </p>

          <h3 className="text-xl font-semibold mb-2 text-gray-900 dark:text-gray-100">Speicherdauer</h3>
          <p className="mb-4">
            Soweit innerhalb dieser Datenschutzerklärung keine speziellere Speicherdauer genannt wurde, verbleiben
            Ihre personenbezogenen Daten bei uns, bis der Zweck für die Datenverarbeitung entfällt. Wenn Sie ein
            berechtigtes Löschersuchen geltend machen oder eine Einwilligung zur Datenverarbeitung widerrufen,
            werden Ihre Daten gelöscht, sofern wir keine anderen rechtlich zulässigen Gründe für die Speicherung
            Ihrer personenbezogenen Daten haben.
          </p>

          <h3 className="text-xl font-semibold mb-2 text-gray-900 dark:text-gray-100">Widerruf Ihrer Einwilligung zur Datenverarbeitung</h3>
          <p>
            Viele Datenverarbeitungsvorgänge sind nur mit Ihrer ausdrücklichen Einwilligung möglich. Sie können
            eine bereits erteilte Einwilligung jederzeit widerrufen. Die Rechtmäßigkeit der bis zum Widerruf
            erfolgten Datenverarbeitung bleibt vom Widerruf unberührt.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-3 text-gray-900 dark:text-gray-100">4. Datenerfassung auf dieser Website</h2>

          <h3 className="text-xl font-semibold mb-2 text-gray-900 dark:text-gray-100">Cookies</h3>
          <p className="mb-4">
            Unsere Internetseiten verwenden so genannte „Cookies". Cookies sind kleine Datenpakete und richten
            auf Ihrem Endgerät keinen Schaden an. Sie werden entweder vorübergehend für die Dauer einer Sitzung
            (Session-Cookies) oder dauerhaft (permanente Cookies) auf Ihrem Endgerät gespeichert. Session-Cookies
            werden nach Ende Ihres Besuchs automatisch gelöscht. Permanente Cookies bleiben auf Ihrem Endgerät
            gespeichert, bis Sie diese selbst löschen oder eine automatische Löschung durch Ihren Webbrowser erfolgt.
          </p>

          <h3 className="text-xl font-semibold mb-2 text-gray-900 dark:text-gray-100">Registrierung auf dieser Website</h3>
          <p className="mb-2">
            Sie können sich auf dieser Website registrieren, um zusätzliche Funktionen zu nutzen. Die dazu
            eingegebenen Daten verwenden wir nur zum Zwecke der Nutzung des jeweiligen Angebotes oder Dienstes,
            für den Sie sich registriert haben. Die bei der Registrierung abgefragten Pflichtangaben müssen
            vollständig angegeben werden. Anderenfalls werden wir die Registrierung ablehnen.
          </p>
          <p className="mb-4">
            Wir speichern bei der Registrierung folgende Daten:
          </p>
          <ul className="list-disc ml-6 mb-4 space-y-1">
            <li>E-Mail-Adresse</li>
            <li>Name (Vor- und Nachname)</li>
            <li>Telefonnummer</li>
            <li>Adresse (Straße, Hausnummer, PLZ, Ort)</li>
            <li>Profilbild (optional)</li>
          </ul>

          <h3 className="text-xl font-semibold mb-2 text-gray-900 dark:text-gray-100">Kontaktformular und Nachrichten</h3>
          <p>
            Wenn Sie uns per Kontaktformular oder über die Nachrichtenfunktion Anfragen zukommen lassen, werden
            Ihre Angaben aus dem Anfrageformular inklusive der von Ihnen dort angegebenen Kontaktdaten zwecks
            Bearbeitung der Anfrage und für den Fall von Anschlussfragen bei uns gespeichert.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-3 text-gray-900 dark:text-gray-100">5. Analyse-Tools und Werbung</h2>

          <h3 className="text-xl font-semibold mb-2 text-gray-900 dark:text-gray-100">Google Analytics</h3>
          <p className="mb-4">
            Diese Website nutzt Funktionen des Webanalysedienstes Google Analytics. Anbieter ist die Google Ireland
            Limited („Google"), Gordon House, Barrow Street, Dublin 4, Irland.
          </p>
          <p className="mb-4">
            Google Analytics ermöglicht es dem Websitebetreiber, das Verhalten der Websitebesucher zu analysieren.
            Hierbei erhält der Websitebetreiber verschiedene Nutzungsdaten, wie z.B. Seitenaufrufe, Verweildauer,
            verwendete Betriebssysteme und Herkunft des Nutzers. Diese Daten werden dem jeweiligen Endgerät des
            Users zugeordnet. Eine Zuordnung zu einer User-ID erfolgt nicht.
          </p>
          <p className="mb-4">
            Des Weiteren können wir mit Google Analytics u. a. Ihre Maus- und Scrollbewegungen und Klicks aufzeichnen.
            Google Analytics verwendet verschiedene Modellierungsansätze, um die erfassten Datensätze zu ergänzen und
            setzt Machine-Learning-Technologien bei der Datenanalyse ein.
          </p>
          <p className="mb-4">
            Google Analytics verwendet Technologien, die die Wiedererkennung des Nutzers zum Zwecke der Analyse des
            Nutzerverhaltens ermöglichen (z. B. Cookies oder Device-Fingerprinting). Die von Google erfassten
            Informationen über die Benutzung dieser Website werden in der Regel an einen Server von Google in den
            USA übertragen und dort gespeichert.
          </p>
          <p className="mb-4">
            Die Nutzung dieses Dienstes erfolgt auf Grundlage Ihrer Einwilligung nach Art. 6 Abs. 1 lit. a DSGVO
            und § 25 Abs. 1 TTDSG. Die Einwilligung ist jederzeit widerrufbar.
          </p>
          <p className="mb-4">
            Die Datenübertragung in die USA wird auf die Standardvertragsklauseln der EU-Kommission gestützt.
            Details finden Sie hier:{' '}
            <a
              href="https://privacy.google.com/businesses/controllerterms/mccs/"
              className="text-blue-600 dark:text-blue-400 hover:underline"
              target="_blank"
              rel="noopener noreferrer"
            >
              https://privacy.google.com/businesses/controllerterms/mccs/
            </a>
          </p>
          <p className="mb-2">
            Mehr Informationen zum Umgang mit Nutzerdaten bei Google Analytics finden Sie in der
            Datenschutzerklärung von Google:{' '}
            <a
              href="https://support.google.com/analytics/answer/6004245?hl=de"
              className="text-blue-600 dark:text-blue-400 hover:underline"
              target="_blank"
              rel="noopener noreferrer"
            >
              https://support.google.com/analytics/answer/6004245?hl=de
            </a>
          </p>

          <h3 className="text-xl font-semibold mb-2 mt-6 text-gray-900 dark:text-gray-100">Auftragsverarbeitung</h3>
          <p className="mb-4">
            Wir haben mit Google einen Vertrag zur Auftragsverarbeitung abgeschlossen und setzen die strengen
            Vorgaben der deutschen Datenschutzbehörden bei der Nutzung von Google Analytics vollständig um.
          </p>

          <h3 className="text-xl font-semibold mb-2 text-gray-900 dark:text-gray-100">Google Signals</h3>
          <p className="mb-4">
            Wir nutzen Google Signals. Wenn Sie unsere Website besuchen, erfasst Google Analytics u. a. Ihren
            Standort, Suchverlauf und YouTube-Verlauf sowie demografische Daten (Besucherdaten). Diese Daten
            können mit Hilfe von Google-Signal für personalisierte Werbung verwendet werden. Wenn Sie über ein
            Google-Konto verfügen, werden die Besucherdaten von Google-Signal mit Ihrem Google-Konto verknüpft
            und für personalisierte Werbebotschaften verwendet. Die Daten werden außerdem für die Erstellung
            anonymisierter Statistiken zum Nutzerverhalten unserer User verwendet.
          </p>

          <h3 className="text-xl font-semibold mb-2 text-gray-900 dark:text-gray-100">IP-Anonymisierung</h3>
          <p>
            Wir haben auf dieser Website die Funktion IP-Anonymisierung aktiviert. Dadurch wird Ihre IP-Adresse
            von Google innerhalb von Mitgliedstaaten der Europäischen Union oder in anderen Vertragsstaaten des
            Abkommens über den Europäischen Wirtschaftsraum vor der Übermittlung in die USA gekürzt. Nur in
            Ausnahmefällen wird die volle IP-Adresse an einen Server von Google in den USA übertragen und dort
            gekürzt.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-3 text-gray-900 dark:text-gray-100">6. Plugins und Tools</h2>

          <h3 className="text-xl font-semibold mb-2 text-gray-900 dark:text-gray-100">Google Maps</h3>
          <p className="mb-4">
            Diese Seite nutzt den Kartendienst Google Maps. Anbieter ist die Google Ireland Limited („Google"),
            Gordon House, Barrow Street, Dublin 4, Irland. Zur Nutzung der Funktionen von Google Maps ist es
            notwendig, Ihre IP-Adresse zu speichern. Diese Informationen werden in der Regel an einen Server von
            Google in den USA übertragen und dort gespeichert.
          </p>

          <h3 className="text-xl font-semibold mb-2 text-gray-900 dark:text-gray-100">Zahlungsanbieter</h3>
          <p className="mb-4">
            Wir binden auf unserer Website Zahlungsdienstleister ein. Wenn Sie einen Kauf bei uns tätigen,
            werden Ihre Zahlungsdaten (z.B. Name, Zahlungssumme, Kontoverbindung, Kreditkartennummer) vom
            Zahlungsdienstleister zum Zwecke der Zahlungsabwicklung verarbeitet. Für diese Transaktionen gelten
            die jeweiligen Vertrags- und Datenschutzbestimmungen der jeweiligen Anbieter.
          </p>
          <p className="mb-2">
            <strong>Stripe</strong>
          </p>
          <p className="mb-4">
            Anbieter für Kunden innerhalb der EU ist die Stripe Payments Europe, Ltd., 1 Grand Canal Street Lower,
            Grand Canal Dock, Dublin, Irland (nachfolgend „Stripe"). Die Datenübertragung in die USA wird auf die
            Standardvertragsklauseln der EU-Kommission gestützt. Details finden Sie hier:{' '}
            <a href="https://stripe.com/de/privacy" className="text-blue-600 dark:text-blue-400 hover:underline" target="_blank" rel="noopener noreferrer">
              https://stripe.com/de/privacy
            </a>
          </p>
          <p>
            Details entnehmen Sie der Datenschutzerklärung von Stripe unter:{' '}
            <a href="https://stripe.com/de/privacy" className="text-blue-600 dark:text-blue-400 hover:underline" target="_blank" rel="noopener noreferrer">
              https://stripe.com/de/privacy
            </a>
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-3 text-gray-900 dark:text-gray-100">7. Eigene Dienste</h2>

          <h3 className="text-xl font-semibold mb-2 text-gray-900 dark:text-gray-100">Umgang mit Angebotsdaten</h3>
          <p className="mb-4">
            Wenn Sie ein Angebot auf unserer Plattform erstellen, speichern wir die von Ihnen eingegebenen
            Informationen (Titel, Beschreibung, Preis, Bilder, Standort). Diese Daten sind für andere Nutzer
            sichtbar und dienen der Vermittlung von Miet- und Dienstleistungsangeboten.
          </p>

          <h3 className="text-xl font-semibold mb-2 text-gray-900 dark:text-gray-100">Buchungsdaten</h3>
          <p>
            Bei Buchungen speichern wir die Buchungsdaten (Zeitraum, Preis, beteiligte Nutzer) zur Abwicklung
            des Vermittlungsvertrages und für gesetzlich vorgeschriebene Aufbewahrungsfristen.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-3 text-gray-900 dark:text-gray-100">8. Ihre Rechte</h2>
          <p className="mb-2">Sie haben folgende Rechte:</p>
          <ul className="list-disc ml-6 space-y-2">
            <li>
              <strong>Recht auf Auskunft:</strong> Sie können Auskunft über Ihre bei uns gespeicherten
              personenbezogenen Daten verlangen.
            </li>
            <li>
              <strong>Recht auf Berichtigung:</strong> Sie können die Berichtigung unrichtiger Daten verlangen.
            </li>
            <li>
              <strong>Recht auf Löschung:</strong> Sie können die Löschung Ihrer Daten verlangen, soweit keine
              gesetzlichen Aufbewahrungspflichten entgegenstehen.
            </li>
            <li>
              <strong>Recht auf Einschränkung:</strong> Sie können die Einschränkung der Verarbeitung Ihrer
              Daten verlangen.
            </li>
            <li>
              <strong>Recht auf Datenübertragbarkeit:</strong> Sie können verlangen, dass wir Ihnen Ihre Daten
              in einem strukturierten, gängigen und maschinenlesbaren Format übermitteln.
            </li>
            <li>
              <strong>Widerspruchsrecht:</strong> Sie können der Verarbeitung Ihrer Daten widersprechen, soweit
              diese auf der Grundlage von berechtigten Interessen erfolgt.
            </li>
            <li>
              <strong>Beschwerderecht:</strong> Sie haben das Recht, sich bei einer Aufsichtsbehörde zu beschweren.
            </li>
          </ul>
          <p className="mt-4">
            Für Anfragen zum Datenschutz wenden Sie sich bitte an:{' '}
            <a href="mailto:datenschutz@dorfkiste.com" className="text-blue-600 dark:text-blue-400 hover:underline">
              datenschutz@dorfkiste.com
            </a>
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-3 text-gray-900 dark:text-gray-100">9. SSL- bzw. TLS-Verschlüsselung</h2>
          <p>
            Diese Seite nutzt aus Sicherheitsgründen und zum Schutz der Übertragung vertraulicher Inhalte eine
            SSL- bzw. TLS-Verschlüsselung. Eine verschlüsselte Verbindung erkennen Sie daran, dass die
            Adresszeile des Browsers von „http://" auf „https://" wechselt und an dem Schloss-Symbol in Ihrer
            Browserzeile.
          </p>
        </section>

        <section className="pt-4 border-t border-gray-300 dark:border-gray-600">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Stand: 3. Oktober 2025<br/>
            Dorfkiste - Minicon eG
          </p>
        </section>
      </div>
    </div>
  );
}
