import Link from 'next/link';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gray-800 text-gray-300 mt-auto">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* About Section */}
          <div>
            <h3 className="text-white font-semibold text-lg mb-4">Über Dorfkiste</h3>
            <p className="text-sm">
              Die lokale Plattform zum Verleihen und Mieten von Gegenständen und Dienstleistungen
              in deiner Nachbarschaft.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-white font-semibold text-lg mb-4">Rechtliches</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/impressum" className="hover:text-white transition-colors">
                  Impressum
                </Link>
              </li>
              <li>
                <Link href="/datenschutz" className="hover:text-white transition-colors">
                  Datenschutzerklärung
                </Link>
              </li>
              <li>
                <Link href="/cookies" className="hover:text-white transition-colors">
                  Cookie-Richtlinie
                </Link>
              </li>
              <li>
                <Link href="/agb" className="hover:text-white transition-colors">
                  AGB
                </Link>
              </li>
              <li>
                <Link href="/widerrufsrecht" className="hover:text-white transition-colors">
                  Widerrufsrecht
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-white font-semibold text-lg mb-4">Kontakt</h3>
            <ul className="space-y-2 text-sm">
              <li>
                E-Mail:{' '}
                <a href="mailto:support@dorfkiste.org" className="hover:text-white transition-colors">
                  support@dorfkiste.org
                </a>
              </li>
              <li>
                Telefon:{' '}
                <a href="tel:+4915127600607" className="hover:text-white transition-colors">
                  +49 151 27600607
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-700 mt-8 pt-6 text-center text-sm">
          <p>&copy; {currentYear} Dorfkiste. Alle Rechte vorbehalten.</p>
        </div>
      </div>
    </footer>
  );
}
