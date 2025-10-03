import React from 'react';

export default function AGBPage() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <h1 className="text-3xl font-bold mb-6">Allgemeine Geschäftsbedingungen (AGB)</h1>

      <div className="space-y-6 text-gray-700">
        <section>
          <h2 className="text-2xl font-semibold mb-3">§ 1 Geltungsbereich</h2>
          <p className="mb-2">
            Diese Allgemeinen Geschäftsbedingungen (nachfolgend „AGB") regeln die Nutzung der Plattform Dorfkiste
            (nachfolgend „Plattform") durch registrierte Nutzer (nachfolgend „Nutzer").
          </p>
          <p>
            Die Plattform wird betrieben von Minicon eG, Danziger Str. 4, 66994 Dahn
            (nachfolgend „Betreiber").
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-3">§ 2 Beschreibung der Leistung</h2>
          <p className="mb-2">
            2.1 Die Plattform dient ausschließlich als Vermittler zwischen Nutzern, die Gegenstände oder
            Dienstleistungen anbieten (nachfolgend „Anbieter") und Nutzern, die diese mieten bzw. in Anspruch
            nehmen möchten (nachfolgend „Mieter").
          </p>
          <p className="mb-2">
            2.2 Der Betreiber tritt nicht selbst als Vermieter oder Dienstleister auf und ist nicht Vertragspartei
            der zwischen Anbietern und Mietern geschlossenen Miet- oder Dienstleistungsverträge.
          </p>
          <p>
            2.3 Der Betreiber stellt lediglich die technische Infrastruktur zur Verfügung, über die Nutzer
            miteinander in Kontakt treten können.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-3">§ 3 Registrierung und Nutzerkonto</h2>
          <p className="mb-2">
            3.1 Zur Nutzung der Plattform ist eine Registrierung erforderlich. Der Nutzer verpflichtet sich,
            bei der Registrierung wahrheitsgemäße und vollständige Angaben zu machen.
          </p>
          <p className="mb-2">
            3.2 Der Nutzer ist für die Geheimhaltung seiner Zugangsdaten selbst verantwortlich. Bei Verdacht
            auf Missbrauch ist der Betreiber unverzüglich zu informieren.
          </p>
          <p>
            3.3 Pro Person ist nur ein Nutzerkonto zulässig. Die Weitergabe des Nutzerkontos an Dritte ist
            nicht gestattet.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-3">§ 4 Pflichten der Anbieter</h2>
          <p className="mb-2">
            4.1 Anbieter dürfen ausschließlich eigene Gegenstände oder selbst erbrachte Dienstleistungen auf
            der Plattform anbieten.
          </p>
          <p className="mb-2">
            4.2 Angebotene Gegenstände müssen sich in funktionsfähigem und sicherem Zustand befinden. Mängel
            sind in der Angebotsbeschreibung vollständig anzugeben.
          </p>
          <p className="mb-2">
            4.3 Die Preis- und Verfügbarkeitsangaben müssen aktuell und korrekt sein.
          </p>
          <p>
            4.4 Anbieter sind verpflichtet, vermietete Gegenstände zum vereinbarten Zeitpunkt bereitzustellen
            bzw. vereinbarte Dienstleistungen ordnungsgemäß zu erbringen.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-3">§ 5 Pflichten der Mieter</h2>
          <p className="mb-2">
            5.1 Mieter verpflichten sich, gemietete Gegenstände pfleglich zu behandeln und nur
            bestimmungsgemäß zu verwenden.
          </p>
          <p className="mb-2">
            5.2 Beschädigungen oder Verlust sind dem Anbieter unverzüglich mitzuteilen.
          </p>
          <p>
            5.3 Die Weiterverleihung gemieteter Gegenstände an Dritte ist ohne ausdrückliche Zustimmung des
            Anbieters nicht gestattet.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-3">§ 6 Vertragsschluss und Zahlung</h2>
          <p className="mb-2">
            6.1 Der Vertrag über die Miete oder Dienstleistung kommt direkt zwischen Anbieter und Mieter zustande.
            Der Betreiber ist nicht Vertragspartei.
          </p>
          <p className="mb-2">
            6.2 Die Zahlung erfolgt über die Plattform mittels Stripe als Zahlungsdienstleister.
            Akzeptierte Zahlungsmethoden umfassen gängige Kreditkarten und andere von Stripe unterstützte Zahlungsmittel.
          </p>
          <p>
            6.3 Der Betreiber erhebt eine Vermittlungsgebühr in Höhe von 10% des Mietpreises,
            die beim Anbieter erhoben wird. Diese Gebühr wird automatisch bei der Zahlungsabwicklung einbehalten.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-3">§ 7 Haftung</h2>
          <p className="mb-2">
            7.1 Der Betreiber haftet nicht für Schäden, die durch die Nutzung gemieteter Gegenstände oder in
            Anspruch genommener Dienstleistungen entstehen.
          </p>
          <p className="mb-2">
            7.2 Der Betreiber haftet nicht für die Richtigkeit, Vollständigkeit oder Aktualität der von
            Nutzern eingestellten Angebote.
          </p>
          <p className="mb-2">
            7.3 Für Schäden, die aus der Verletzung von Leben, Körper oder Gesundheit resultieren sowie bei
            Vorsatz und grober Fahrlässigkeit haftet der Betreiber uneingeschränkt.
          </p>
          <p>
            7.4 Im Übrigen ist die Haftung des Betreibers auf Fälle des Vorsatzes und der groben Fahrlässigkeit
            beschränkt. Die Haftung für leichte Fahrlässigkeit ist ausgeschlossen, soweit nicht wesentliche
            Vertragspflichten (Kardinalspflichten) betroffen sind.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-3">§ 8 Verbotene Inhalte</h2>
          <p className="mb-2">
            8.1 Es ist untersagt, illegale, sittenwidrige oder gegen gesetzliche Vorschriften verstoßende
            Inhalte auf der Plattform einzustellen.
          </p>
          <p className="mb-2">
            8.2 Verboten sind insbesondere:
          </p>
          <ul className="list-disc ml-6 mb-2 space-y-1">
            <li>Angebote gestohlener oder gefälschter Gegenstände</li>
            <li>Angebote, die gegen das Waffengesetz verstoßen</li>
            <li>Jugendgefährdende oder pornografische Inhalte</li>
            <li>Beleidigungen, Diskriminierungen oder Hassrede</li>
            <li>Spam oder betrügerische Inhalte</li>
          </ul>
          <p>
            8.3 Der Betreiber behält sich vor, Inhalte, die gegen diese Bestimmungen verstoßen, ohne
            Vorankündigung zu löschen.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-3">§ 9 Sperrung und Kündigung</h2>
          <p className="mb-2">
            9.1 Der Betreiber kann Nutzer bei Verstößen gegen diese AGB oder geltendes Recht vorübergehend
            oder dauerhaft sperren.
          </p>
          <p className="mb-2">
            9.2 Nutzer können ihr Konto jederzeit ohne Angabe von Gründen löschen.
          </p>
          <p>
            9.3 Der Betreiber kann das Nutzungsverhältnis mit einer Frist von 4 Wochen
            ordentlich kündigen.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-3">§ 10 Streitbeilegung</h2>
          <p>
            Die Europäische Kommission stellt eine Plattform zur Online-Streitbeilegung (OS) bereit, die Sie
            unter <a href="https://ec.europa.eu/consumers/odr" className="text-blue-600 hover:underline" target="_blank" rel="noopener noreferrer">
            https://ec.europa.eu/consumers/odr</a> finden. Zur Teilnahme an einem Streitbeilegungsverfahren
            vor einer Verbraucherschlichtungsstelle sind wir nicht verpflichtet und nicht bereit.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-3">§ 11 Änderung der AGB</h2>
          <p className="mb-2">
            11.1 Der Betreiber behält sich das Recht vor, diese AGB jederzeit zu ändern.
          </p>
          <p>
            11.2 Nutzer werden über Änderungen per E-Mail an ihre hinterlegte E-Mail-Adresse informiert.
            Widersprechen Nutzer den geänderten AGB nicht innerhalb von 14 Tagen nach Zugang der Änderungsmitteilung,
            gelten die neuen AGB als akzeptiert.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-3">§ 12 Schlussbestimmungen</h2>
          <p className="mb-2">
            12.1 Es gilt das Recht der Bundesrepublik Deutschland unter Ausschluss des UN-Kaufrechts.
          </p>
          <p className="mb-2">
            12.2 Gerichtsstand ist Dahn, soweit der Nutzer Kaufmann, juristische Person des
            öffentlichen Rechts oder öffentlich-rechtliches Sondervermögen ist.
          </p>
          <p>
            12.3 Sollten einzelne Bestimmungen dieser AGB unwirksam sein oder werden, berührt dies die
            Wirksamkeit der übrigen Bestimmungen nicht.
          </p>
        </section>

        <section className="pt-4 border-t border-gray-300">
          <p className="text-sm text-gray-600">
            Stand: 3. Oktober 2025<br/>
            Dorfkiste - Minicon eG
          </p>
        </section>
      </div>
    </div>
  );
}
