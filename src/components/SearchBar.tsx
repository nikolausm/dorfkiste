"use client"

import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { Search, X, Loader2 } from "lucide-react"
import Link from "next/link"
import Image from "next/image"

export default function SearchBar() {
  const router = useRouter()
  const [query, setQuery] = useState("")
  const [results, setResults] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [showResults, setShowResults] = useState(false)
  const searchRef = useRef<HTMLDivElement>(null)
  const debounceTimer = useRef<NodeJS.Timeout>()

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowResults(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  useEffect(() => {
    if (query.length < 2) {
      setResults([])
      setShowResults(false)
      return
    }

    clearTimeout(debounceTimer.current)
    debounceTimer.current = setTimeout(() => {
      performSearch()
    }, 300)

    return () => clearTimeout(debounceTimer.current)
  }, [query])

  const performSearch = async () => {
    setLoading(true)
    try {
      const response = await fetch(`/api/items?search=${encodeURIComponent(query)}&limit=5`)
      if (response.ok) {
        const data = await response.json()
        setResults(data.items)
        setShowResults(true)
      }
    } catch (error) {
      console.error("Search error:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (query.trim()) {
      router.push(`/items?search=${encodeURIComponent(query)}`)
      setShowResults(false)
      setQuery("")
    }
  }

  return (
    <div ref={searchRef} className="relative w-full max-w-md">
      <form onSubmit={handleSubmit}>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Suche nach Artikeln..."
            className="w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          {query && (
            <button
              type="button"
              onClick={() => {
                setQuery("")
                setResults([])
                setShowResults(false)
              }}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <X className="h-5 w-5" />
            </button>
          )}
        </div>
      </form>

      {/* Search Results Dropdown */}
      {showResults && (
        <div className="absolute top-full mt-2 w-full bg-white rounded-lg shadow-lg border border-gray-200 z-50">
          {loading ? (
            <div className="p-4 text-center">
              <Loader2 className="h-5 w-5 animate-spin mx-auto text-blue-600" />
            </div>
          ) : results.length > 0 ? (
            <>
              <div className="p-2">
                {results.map((item) => (
                  <Link
                    key={item.id}
                    href={`/items/${item.id}`}
                    onClick={() => {
                      setShowResults(false)
                      setQuery("")
                    }}
                    className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded-lg"
                  >
                    <div className="relative w-12 h-12 flex-shrink-0 rounded overflow-hidden">
                      {item.images[0] ? (
                        <Image
                          src={item.images[0].url}
                          alt={item.title}
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <div className="w-full h-full bg-gray-200" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate">{item.title}</p>
                      <p className="text-xs text-gray-500">
                        {item.location} • {item.pricePerDay ? `${item.pricePerDay}€/Tag` : "Preis auf Anfrage"}
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
              <Link
                href={`/items?search=${encodeURIComponent(query)}`}
                onClick={() => {
                  setShowResults(false)
                  setQuery("")
                }}
                className="block p-3 text-center text-sm text-blue-600 hover:bg-gray-50 border-t"
              >
                Alle Ergebnisse anzeigen →
              </Link>
            </>
          ) : (
            <div className="p-4 text-center text-gray-500">
              Keine Ergebnisse gefunden
            </div>
          )}
        </div>
      )}
    </div>
  )
}