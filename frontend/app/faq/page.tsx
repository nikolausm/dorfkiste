'use client';

import { useState } from 'react';
import Link from 'next/link';

interface FAQItem {
  question: string;
  answer: string;
}

interface FAQCategory {
  title: string;
  icon: string;
  items: FAQItem[];
}

export default function FAQPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [openItems, setOpenItems] = useState<Set<string>>(new Set());

  const categories: FAQCategory[] = [
    {
      title: 'Steuern',
      icon: '💰',
      items: [
        {
          question: 'Muss ich meine Einnahmen versteuern?',
          answer: 'Ja, grundsätzlich müssen Einnahmen aus der Vermietung von Gegenständen oder Dienstleistungen versteuert werden. Bei gelegentlichen Vermietungen im privaten Rahmen kann dies jedoch als "sonstige Einkünfte" gelten. Wir empfehlen, sich bei einem Steuerberater über Ihre individuelle Situation zu informieren, insbesondere bei regelmäßigen Einnahmen über 520 Euro pro Jahr.'
        },
        {
          question: 'Brauche ich ein Gewerbe?',
          answer: 'Ein Gewerbe ist erforderlich, wenn Sie regelmäßig und mit Gewinnerzielungsabsicht vermieten. Bei gelegentlicher Vermietung privater Gegenstände ist dies meist nicht nötig. Die Grenze liegt bei einer Gewinnerzielungsabsicht und Dauerhaftigkeit der Tätigkeit. Kontaktieren Sie Ihr örtliches Gewerbeamt oder einen Steuerberater für eine verbindliche Auskunft.'
        },
        {
          question: 'Was ist mit der Umsatzsteuer?',
          answer: 'Als Kleinunternehmer nach § 19 UStG sind Sie bis zu einem Jahresumsatz von 22.000 Euro (ab 2025) von der Umsatzsteuer befreit. Sie müssen dann keine Umsatzsteuer ausweisen oder abführen. Bei höheren Umsätzen oder freiwilligem Verzicht auf die Kleinunternehmerregelung wird Umsatzsteuer fällig.'
        },
        {
          question: 'Wie dokumentiere ich meine Einnahmen?',
          answer: 'Führen Sie eine einfache Einnahmen-Ausgaben-Rechnung mit Datum, Art der Vermietung, Betrag und Kontaktdaten des Mieters. Bewahren Sie alle Belege mindestens 10 Jahre auf. Nutzen Sie digitale Tools oder Tabellen für eine übersichtliche Dokumentation. Bei gewerblicher Vermietung können höhere Anforderungen gelten.'
        }
      ]
    },
    {
      title: 'Haftung',
      icon: '🛡️',
      items: [
        {
          question: 'Wer haftet bei Schäden?',
          answer: 'Grundsätzlich haftet der Mieter für Schäden, die er verschuldet hat. Als Vermieter haften Sie für Schäden, die durch mangelhafte Gegenstände entstehen. Wir empfehlen einen schriftlichen Leihvertrag mit Haftungsregelungen. Bei höherwertigen Gegenständen sollten Sie eine Kaution vereinbaren und den Zustand vor und nach der Vermietung dokumentieren.'
        },
        {
          question: 'Brauche ich eine Versicherung?',
          answer: 'Für gelegentliche private Vermietungen reicht oft die private Haftpflichtversicherung. Diese deckt jedoch meist keine gewerbliche Vermietung ab. Bei regelmäßiger oder gewerblicher Vermietung sollten Sie eine spezielle Vermietversicherung oder gewerbliche Haftpflicht abschließen. Prüfen Sie Ihre bestehenden Versicherungen und sprechen Sie mit Ihrem Versicherer.'
        },
        {
          question: 'Was passiert bei Diebstahl?',
          answer: 'Bei Diebstahl sollte sofort Anzeige bei der Polizei erstattet werden. Der Mieter haftet in der Regel für den Verlust, es sei denn, er kann nachweisen, dass ihn kein Verschulden trifft. Eine Hausratversicherung kann greifen, wenn der Gegenstand nicht zu gewerblichen Zwecken vermietet wurde. Dokumentieren Sie den Zustand und Wert der Gegenstände vor der Vermietung.'
        },
        {
          question: 'Welche Gegenstände sollte ich versichern?',
          answer: 'Hochwertige Gegenstände ab ca. 500 Euro sollten separat versichert werden. Dazu gehören Elektrowerkzeuge, Gartengeräte, Sportausrüstung oder Elektronik. Informieren Sie Ihre Versicherung über die Vermietung, da dies die Versicherungsbedingungen beeinflussen kann. Erwägen Sie bei teuren Gegenständen eine spezielle Vermietversicherung.'
        }
      ]
    },
    {
      title: 'Plattform',
      icon: '💻',
      items: [
        {
          question: 'Wie funktioniert die Bezahlung?',
          answer: 'Die Bezahlung erfolgt direkt zwischen Vermieter und Mieter. Dorfkiste wickelt keine Zahlungen ab und erhebt keine Gebühren. Wir empfehlen Barzahlung bei Übergabe oder Banküberweisung vorab. Nutzen Sie sichere Zahlungsmethoden und bestätigen Sie den Erhalt schriftlich. Bei höheren Beträgen empfehlen wir eine schriftliche Quittung.'
        },
        {
          question: 'Welche Gebühren fallen an?',
          answer: 'Die Nutzung von Dorfkiste ist komplett kostenlos. Es fallen keine Registrierungsgebühren, Vermittlungsprovisionen oder versteckte Kosten an. Sie behalten 100% Ihrer Einnahmen. Wir finanzieren uns durch zukünftige Premium-Features und Werbung, die optional bleiben werden.'
        },
        {
          question: 'Wie schütze ich meine Daten?',
          answer: 'Wir speichern Ihre Daten verschlüsselt und geben sie nicht an Dritte weiter. Ihre Kontaktdaten werden erst nach einer Buchungsanfrage an den anderen Nutzer weitergegeben. Sie können jederzeit Ihre Daten einsehen, ändern oder löschen lassen. Mehr Informationen finden Sie in unserer Datenschutzerklärung.'
        },
        {
          question: 'Kann ich meine Angebote bearbeiten?',
          answer: 'Ja, Sie können Ihre Angebote jederzeit bearbeiten, Bilder hinzufügen oder entfernen, die Beschreibung ändern oder den Preis anpassen. Über die Option "Angebot deaktivieren" können Sie Angebote vorübergehend unsichtbar machen, ohne sie zu löschen. Gelöschte Angebote können nicht wiederhergestellt werden.'
        }
      ]
    },
    {
      title: 'Leihvorgang',
      icon: '🤝',
      items: [
        {
          question: 'Wie funktioniert die Buchung?',
          answer: 'Wählen Sie auf der Angebotsseite Ihre gewünschten Daten im Kalender aus. Das System zeigt sofort den Gesamtpreis an. Mit "Jetzt buchen" bestätigen Sie die Buchung. Der Anbieter erhält automatisch eine Nachricht und kann die Buchung annehmen. Sie können sich dann über die Nachrichten-Funktion über Details wie Übergabeort und -zeit austauschen.'
        },
        {
          question: 'Was ist der Leihvertrag?',
          answer: 'Wir empfehlen dringend einen schriftlichen Leihvertrag, auch bei Vermietungen unter Nachbarn. Dieser sollte enthalten: Namen und Kontaktdaten beider Parteien, genaue Beschreibung des Gegenstands, Miet- und Rückgabedatum, Mietpreis, Zustandsbeschreibung, Haftungsregelungen und eventuelle Kaution. Nutzen Sie unsere kostenlose Vorlage (Link im Download-Bereich).'
        },
        {
          question: 'Wie läuft die Übergabe ab?',
          answer: 'Vereinbaren Sie einen konkreten Übergabetermin und -ort über die Nachrichten-Funktion. Prüfen Sie gemeinsam den Zustand des Gegenstands und dokumentieren Sie diesen (z.B. mit Fotos). Übergeben Sie alle nötigen Zubehörteile und Anleitungen. Lassen Sie sich die Übergabe schriftlich bestätigen. Bei Rückgabe wiederholen Sie den Prozess und prüfen auf eventuelle Schäden.'
        },
        {
          question: 'Was bei verspäteter Rückgabe?',
          answer: 'Kontaktieren Sie zunächst den Mieter und klären Sie den Grund der Verspätung. Vereinbaren Sie einen neuen Rückgabetermin. Bei unentschuldigter Verspätung können Sie eine Vertragsstrafe oder zusätzliche Miete für die Verspätungstage verlangen. Bei längerem Ausbleiben sollten Sie rechtliche Schritte in Erwägung ziehen. Dokumentieren Sie alle Kommunikationsversuche.'
        }
      ]
    }
  ];

  const toggleItem = (categoryIndex: number, itemIndex: number) => {
    const key = `${categoryIndex}-${itemIndex}`;
    const newOpenItems = new Set(openItems);

    if (newOpenItems.has(key)) {
      newOpenItems.delete(key);
    } else {
      newOpenItems.add(key);
    }

    setOpenItems(newOpenItems);
  };

  const isItemOpen = (categoryIndex: number, itemIndex: number) => {
    return openItems.has(`${categoryIndex}-${itemIndex}`);
  };

  const filteredCategories = categories.map(category => ({
    ...category,
    items: category.items.filter(item =>
      item.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.answer.toLowerCase().includes(searchQuery.toLowerCase())
    )
  })).filter(category => category.items.length > 0);

  return (
    <div className="min-h-screen bg-neutral-50">
      {/* Header */}
      <section className="hero-gradient pt-20 pb-16">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <h1 className="text-4xl lg:text-5xl font-bold text-neutral-900 mb-4">
              Häufig gestellte Fragen
            </h1>
            <p className="text-xl text-neutral-600 max-w-3xl mx-auto mb-8">
              Finde Antworten auf die wichtigsten Fragen rund um Dorfkiste
            </p>

            {/* Search */}
            <div className="max-w-2xl mx-auto">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Frage oder Stichwort eingeben..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full px-6 py-4 pl-12 rounded-xl border border-neutral-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-200 transition-all"
                />
                <svg
                  className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-neutral-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Content */}
      <section className="py-16">
        <div className="container mx-auto px-4 max-w-4xl">
          {filteredCategories.length === 0 ? (
            <div className="text-center py-16">
              <p className="text-xl text-neutral-500">
                Keine Ergebnisse für "{searchQuery}" gefunden
              </p>
            </div>
          ) : (
            <div className="space-y-12">
              {filteredCategories.map((category, categoryIndex) => (
                <div key={categoryIndex} className="animate-fade-in">
                  <div className="flex items-center gap-3 mb-6">
                    <span className="text-3xl">{category.icon}</span>
                    <h2 className="text-2xl font-bold text-neutral-900">
                      {category.title}
                    </h2>
                  </div>

                  <div className="space-y-4">
                    {category.items.map((item, itemIndex) => {
                      const isOpen = isItemOpen(categoryIndex, itemIndex);

                      return (
                        <div
                          key={itemIndex}
                          className="bg-white rounded-xl border border-neutral-200 overflow-hidden transition-all hover:shadow-soft"
                        >
                          <button
                            onClick={() => toggleItem(categoryIndex, itemIndex)}
                            className="w-full px-6 py-4 flex items-center justify-between text-left hover:bg-neutral-50 transition-colors"
                          >
                            <span className="font-semibold text-neutral-900 pr-8">
                              {item.question}
                            </span>
                            <svg
                              className={`w-5 h-5 text-neutral-400 transition-transform flex-shrink-0 ${
                                isOpen ? 'rotate-180' : ''
                              }`}
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M19 9l-7 7-7-7"
                              />
                            </svg>
                          </button>

                          <div
                            className={`overflow-hidden transition-all duration-300 ${
                              isOpen ? 'max-h-[500px]' : 'max-h-0'
                            }`}
                          >
                            <div className="px-6 pb-4 text-neutral-600 leading-relaxed">
                              {item.answer}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Contact Section */}
          <div className="mt-16 bg-gradient-to-br from-primary-50 to-secondary-50 rounded-2xl p-8 text-center">
            <h3 className="text-2xl font-bold text-neutral-900 mb-4">
              Weitere Fragen?
            </h3>
            <p className="text-neutral-600 mb-6 max-w-2xl mx-auto">
              Wenn du deine Frage hier nicht findest, kontaktiere uns gerne.
              Wir helfen dir weiter!
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="mailto:support@dorfkiste.de"
                className="btn-primary inline-flex items-center justify-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                E-Mail schreiben
              </a>
              <Link href="/widerrufsrecht" className="btn-secondary">
                Widerrufsrecht ansehen
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
