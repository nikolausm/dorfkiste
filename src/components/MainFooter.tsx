import Link from "next/link"

export default function MainFooter() {
  return (
    <footer className="bg-gray-100 border-t border-gray-200 mt-12">
      {/* Main Footer */}
      <div className="max-w-[1280px] mx-auto px-4 py-8">
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-8">
          {/* Kaufen */}
          <div>
            <h3 className="font-bold text-sm mb-3">Ausleihen</h3>
            <ul className="space-y-2 text-sm">
              <li><Link href="/auth/signup" className="text-gray-600 hover:underline">Registrierung</Link></li>
              <li><Link href="/categories" className="text-gray-600 hover:underline">Alle Kategorien</Link></li>
              <li><Link href="/items" className="text-gray-600 hover:underline">Artikel durchsuchen</Link></li>
              <li><Link href="/help/how-to-rent" className="text-gray-600 hover:underline">Wie funktioniert's?</Link></li>
            </ul>
          </div>

          {/* Verkaufen */}
          <div>
            <h3 className="font-bold text-sm mb-3">Verleihen</h3>
            <ul className="space-y-2 text-sm">
              <li><Link href="/items/new" className="text-gray-600 hover:underline">Artikel einstellen</Link></li>
              <li><Link href="/help/pricing" className="text-gray-600 hover:underline">Preisgestaltung</Link></li>
              <li><Link href="/help/safety" className="text-gray-600 hover:underline">Sicherheit</Link></li>
              <li><Link href="/help/insurance" className="text-gray-600 hover:underline">Versicherung</Link></li>
            </ul>
          </div>

          {/* Community */}
          <div>
            <h3 className="font-bold text-sm mb-3">Community</h3>
            <ul className="space-y-2 text-sm">
              <li><Link href="/about" className="text-gray-600 hover:underline">Über Dorfkiste</Link></li>
              <li><Link href="/blog" className="text-gray-600 hover:underline">Blog</Link></li>
              <li><Link href="/forum" className="text-gray-600 hover:underline">Forum</Link></li>
              <li><Link href="/success-stories" className="text-gray-600 hover:underline">Erfolgsgeschichten</Link></li>
            </ul>
          </div>

          {/* Hilfe & Kontakt */}
          <div>
            <h3 className="font-bold text-sm mb-3">Hilfe & Kontakt</h3>
            <ul className="space-y-2 text-sm">
              <li><Link href="/help" className="text-gray-600 hover:underline">Hilfe-Center</Link></li>
              <li><Link href="/contact" className="text-gray-600 hover:underline">Kontakt</Link></li>
              <li><Link href="/faq" className="text-gray-600 hover:underline">Häufige Fragen</Link></li>
              <li><Link href="/resolution-center" className="text-gray-600 hover:underline">Konfliktlösung</Link></li>
            </ul>
          </div>

          {/* Über Dorfkiste */}
          <div>
            <h3 className="font-bold text-sm mb-3">Über Dorfkiste</h3>
            <ul className="space-y-2 text-sm">
              <li><Link href="/company" className="text-gray-600 hover:underline">Unternehmen</Link></li>
              <li><Link href="/press" className="text-gray-600 hover:underline">Presse</Link></li>
              <li><Link href="/careers" className="text-gray-600 hover:underline">Karriere</Link></li>
              <li><Link href="/partners" className="text-gray-600 hover:underline">Partner</Link></li>
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom Footer */}
      <div className="bg-white border-t border-gray-200">
        <div className="max-w-[1280px] mx-auto px-4 py-4">
          <div className="flex flex-col md:flex-row items-center justify-between text-xs text-gray-600">
            <div className="flex flex-wrap items-center gap-3 mb-2 md:mb-0">
              <span>© 2024 Dorfkiste</span>
              <Link href="/privacy" className="hover:underline">Datenschutz</Link>
              <Link href="/terms" className="hover:underline">AGB</Link>
              <Link href="/cookies" className="hover:underline">Cookies</Link>
              <Link href="/imprint" className="hover:underline">Impressum</Link>
            </div>
            
            {/* Payment Methods */}
            <div className="flex items-center gap-3">
              <span className="mr-2">Sichere Zahlung:</span>
              <div className="flex gap-2">
                {/* Payment icons would go here */}
                <div className="w-10 h-6 bg-gray-200 rounded"></div>
                <div className="w-10 h-6 bg-gray-200 rounded"></div>
                <div className="w-10 h-6 bg-gray-200 rounded"></div>
                <div className="w-10 h-6 bg-gray-200 rounded"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}