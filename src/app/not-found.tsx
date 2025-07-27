import Link from "next/link"
import { Home, Search } from "lucide-react"

export default function NotFound() {
  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4">
      <div className="text-center">
        <h1 className="text-9xl font-bold text-gray-200">404</h1>
        <h2 className="text-2xl font-semibold text-gray-900 mt-4">
          Seite nicht gefunden
        </h2>
        <p className="text-gray-600 mt-2 mb-8">
          Die gesuchte Seite existiert leider nicht.
        </p>
        <div className="flex gap-4 justify-center">
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Home className="h-5 w-5" />
            Zur Startseite
          </Link>
          <Link
            href="/items"
            className="inline-flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <Search className="h-5 w-5" />
            Artikel durchsuchen
          </Link>
        </div>
      </div>
    </div>
  )
}