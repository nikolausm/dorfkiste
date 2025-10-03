import Link from 'next/link';

export default function WiderrufsrechtPage() {
  return (
    <div className="min-h-screen bg-neutral-50">
      {/* Header */}
      <section className="hero-gradient pt-20 pb-16">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <h1 className="text-4xl lg:text-5xl font-bold text-neutral-900 mb-4">
              Widerrufsrecht
            </h1>
            <p className="text-xl text-neutral-600 max-w-3xl mx-auto">
              Informationen zu Ihrem gesetzlichen Widerrufsrecht
            </p>
          </div>
        </div>
      </section>

      {/* Content */}
      <section className="py-16">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="bg-white rounded-2xl p-8 lg:p-12 shadow-soft space-y-8">

            {/* Important Notice */}
            <div className="bg-accent-50 border-l-4 border-accent-500 p-6 rounded-r-lg">
              <div className="flex items-start gap-3">
                <svg className="w-6 h-6 text-accent-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div>
                  <h3 className="font-bold text-neutral-900 mb-2">Wichtiger Hinweis</h3>
                  <p className="text-neutral-700 leading-relaxed">
                    Dorfkiste ist eine reine Vermittlungsplattform. Verträge kommen direkt zwischen Vermieter und Mieter zustande.
                    Das Widerrufsrecht gilt nur, wenn Dorfkiste selbst als Vertragspartei auftritt (z.B. bei zukünftigen Premium-Diensten).
                  </p>
                </div>
              </div>
            </div>

            {/* Widerrufsbelehrung */}
            <div>
              <h2 className="text-2xl font-bold text-neutral-900 mb-4">Widerrufsbelehrung</h2>
              <div className="prose prose-neutral max-w-none">
                <h3 className="text-lg font-semibold text-neutral-900 mt-6 mb-3">Widerrufsrecht</h3>
                <p className="text-neutral-700 leading-relaxed mb-4">
                  Sie haben das Recht, binnen vierzehn Tagen ohne Angabe von Gründen diesen Vertrag zu widerrufen.
                </p>
                <p className="text-neutral-700 leading-relaxed mb-4">
                  Die Widerrufsfrist beträgt vierzehn Tage ab dem Tag des Vertragsabschlusses.
                </p>
                <p className="text-neutral-700 leading-relaxed mb-4">
                  Um Ihr Widerrufsrecht auszuüben, müssen Sie uns (Dorfkiste, Musterstraße 1, 12345 Musterstadt,
                  E-Mail: widerruf@dorfkiste.de, Telefon: +49 123 456789) mittels einer eindeutigen Erklärung
                  (z.B. ein mit der Post versandter Brief oder E-Mail) über Ihren Entschluss, diesen Vertrag zu
                  widerrufen, informieren. Sie können dafür das beigefügte Muster-Widerrufsformular verwenden,
                  das jedoch nicht vorgeschrieben ist.
                </p>
                <p className="text-neutral-700 leading-relaxed">
                  Zur Wahrung der Widerrufsfrist reicht es aus, dass Sie die Mitteilung über die Ausübung des
                  Widerrufsrechts vor Ablauf der Widerrufsfrist absenden.
                </p>

                <h3 className="text-lg font-semibold text-neutral-900 mt-6 mb-3">Folgen des Widerrufs</h3>
                <p className="text-neutral-700 leading-relaxed mb-4">
                  Wenn Sie diesen Vertrag widerrufen, haben wir Ihnen alle Zahlungen, die wir von Ihnen erhalten haben,
                  einschließlich der Lieferkosten (mit Ausnahme der zusätzlichen Kosten, die sich daraus ergeben, dass
                  Sie eine andere Art der Lieferung als die von uns angebotene, günstigste Standardlieferung gewählt haben),
                  unverzüglich und spätestens binnen vierzehn Tagen ab dem Tag zurückzuzahlen, an dem die Mitteilung über
                  Ihren Widerruf dieses Vertrags bei uns eingegangen ist.
                </p>
                <p className="text-neutral-700 leading-relaxed">
                  Für diese Rückzahlung verwenden wir dasselbe Zahlungsmittel, das Sie bei der ursprünglichen Transaktion
                  eingesetzt haben, es sei denn, mit Ihnen wurde ausdrücklich etwas anderes vereinbart; in keinem Fall
                  werden Ihnen wegen dieser Rückzahlung Entgelte berechnet.
                </p>
              </div>
            </div>

            {/* Ausnahmen */}
            <div className="bg-neutral-50 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-neutral-900 mb-3">Ausnahmen vom Widerrufsrecht</h3>
              <p className="text-neutral-700 leading-relaxed mb-4">
                Das Widerrufsrecht besteht nicht bei folgenden Verträgen:
              </p>
              <ul className="list-disc list-inside space-y-2 text-neutral-700">
                <li>Verträge zur Lieferung von Waren, die schnell verderben können oder deren Verfallsdatum schnell überschritten würde</li>
                <li>Verträge zur Lieferung versiegelter Waren, die aus Gründen des Gesundheitsschutzes oder der Hygiene nicht zur Rückgabe geeignet sind, wenn ihre Versiegelung nach der Lieferung entfernt wurde</li>
                <li>Verträge zur Lieferung von Waren, die nach der Lieferung auf Grund ihrer Beschaffenheit untrennbar mit anderen Gütern vermischt wurden</li>
                <li>Verträge zur Erbringung von Dienstleistungen, wenn der Unternehmer diese vollständig erbracht hat und mit der Ausführung erst begonnen hat, nachdem der Verbraucher dazu seine ausdrückliche Zustimmung gegeben hat</li>
              </ul>
            </div>

            {/* Widerrufsformular */}
            <div>
              <h2 className="text-2xl font-bold text-neutral-900 mb-4">Muster-Widerrufsformular</h2>
              <div className="bg-white border-2 border-neutral-200 rounded-xl p-6">
                <p className="text-sm text-neutral-500 mb-4">
                  (Wenn Sie den Vertrag widerrufen wollen, füllen Sie bitte dieses Formular aus und senden Sie es zurück)
                </p>

                <div className="space-y-4 text-neutral-700">
                  <p>An:</p>
                  <div className="pl-4">
                    <p>Dorfkiste</p>
                    <p>Musterstraße 1</p>
                    <p>12345 Musterstadt</p>
                    <p>E-Mail: widerruf@dorfkiste.de</p>
                  </div>

                  <p className="pt-4">
                    Hiermit widerrufe(n) ich/wir (*) den von mir/uns (*) abgeschlossenen Vertrag über den Kauf der folgenden Waren (*)/die Erbringung der folgenden Dienstleistung (*)
                  </p>

                  <div className="space-y-2 pt-2">
                    <p>- Bestellt am (*)/erhalten am (*): _________________</p>
                    <p>- Name des/der Verbraucher(s): _________________</p>
                    <p>- Anschrift des/der Verbraucher(s): _________________</p>
                    <p>- Unterschrift des/der Verbraucher(s) (nur bei Mitteilung auf Papier): _________________</p>
                    <p>- Datum: _________________</p>
                  </div>

                  <p className="text-sm text-neutral-500 pt-4">
                    (*) Unzutreffendes streichen
                  </p>
                </div>
              </div>

              {/* Download Button */}
              <div className="mt-6 flex justify-center">
                <button className="btn-secondary inline-flex items-center gap-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  Formular als PDF herunterladen
                </button>
              </div>
            </div>

            {/* Kontakt bei Vermietverträgen */}
            <div className="bg-primary-50 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-neutral-900 mb-3 flex items-center gap-2">
                <svg className="w-5 h-5 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Widerruf bei Vermietverträgen
              </h3>
              <p className="text-neutral-700 leading-relaxed mb-4">
                Bei Vermietverträgen zwischen Privatpersonen über unsere Plattform wenden Sie sich bitte direkt
                an den Vermieter. Dorfkiste ist in diesem Fall nicht Vertragspartei und kann den Vertrag nicht widerrufen.
              </p>
              <p className="text-neutral-700 leading-relaxed">
                Das gesetzliche Widerrufsrecht bei Fernabsatzverträgen besteht grundsätzlich nur bei Verträgen
                zwischen Verbrauchern und Unternehmern. Vereinbarungen zwischen Privatpersonen unterliegen anderen
                Regelungen. Bitte prüfen Sie die Stornierungsbedingungen des jeweiligen Vermieters.
              </p>
            </div>

            {/* Kontakt */}
            <div className="border-t border-neutral-200 pt-8">
              <h3 className="text-lg font-semibold text-neutral-900 mb-4">Kontakt bei Fragen</h3>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="flex items-start gap-3">
                  <svg className="w-6 h-6 text-primary-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  <div>
                    <p className="font-medium text-neutral-900">E-Mail</p>
                    <a href="mailto:widerruf@dorfkiste.de" className="text-primary-600 hover:text-primary-700">
                      widerruf@dorfkiste.de
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <svg className="w-6 h-6 text-primary-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                  <div>
                    <p className="font-medium text-neutral-900">Telefon</p>
                    <a href="tel:+491234567890" className="text-primary-600 hover:text-primary-700">
                      +49 123 456 7890
                    </a>
                  </div>
                </div>
              </div>
            </div>

            {/* Back to FAQ */}
            <div className="text-center pt-8">
              <Link href="/faq" className="btn-secondary inline-flex items-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                Zurück zu den FAQ
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
