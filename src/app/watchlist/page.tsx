"use client"

import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Heart, Loader2, Eye, Calendar } from "lucide-react"
import ItemCard from "@/components/ItemCard"

interface WatchlistItem {
  id: string
  item: {
    id: string
    title: string
    images: { url: string }[]
    pricePerDay: number | null
    pricePerHour: number | null
    location: string
    condition: string
    available: boolean
    user: {
      id: string
      name: string | null
      rating?: number
      reviewCount?: number
    }
    category?: {
      id: string
      name: string
    }
  }
  createdAt: string
}

export default function WatchlistPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [watchlistItems, setWatchlistItems] = useState<WatchlistItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (status === "loading") return
    
    if (!session) {
      router.push("/auth/signin")
      return
    }

    fetchWatchlist()
  }, [session, status, router])

  const fetchWatchlist = async () => {
    try {
      const response = await fetch("/api/watchlist")
      if (response.ok) {
        const data = await response.json()
        setWatchlistItems(data)
      } else {
        setError("Fehler beim Laden der Beobachtungsliste")
      }
    } catch (error) {
      console.error("Error fetching watchlist:", error)
      setError("Ein Fehler ist aufgetreten")
    } finally {
      setLoading(false)
    }
  }

  const removeFromWatchlist = async (itemId: string) => {
    try {
      const response = await fetch(`/api/watchlist/${itemId}`, {
        method: "DELETE",
      })
      
      if (response.ok) {
        setWatchlistItems(prev => prev.filter(item => item.item.id !== itemId))
      }
    } catch (error) {
      console.error("Error removing from watchlist:", error)
    }
  }

  if (status === "loading" || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-[#3665f3] mx-auto mb-4" />
          <p className="text-gray-600">Lade Beobachtungsliste...</p>
        </div>
      </div>
    )
  }

  if (!session) {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-[1280px] mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Meine Beobachtungsliste
          </h1>
          <p className="text-gray-600">
            Artikel, die Sie beobachten
          </p>
        </div>

        {/* Content */}
        {error ? (
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
            <p className="text-red-600">{error}</p>
            <button 
              onClick={fetchWatchlist}
              className="mt-4 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
            >
              Erneut versuchen
            </button>
          </div>
        ) : watchlistItems.length === 0 ? (
          <div className="bg-white rounded-lg p-12 text-center">
            <Heart className="h-16 w-16 mx-auto text-gray-300 mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              Keine beobachteten Artikel
            </h2>
            <p className="text-gray-600 mb-6">
              Fügen Sie Artikel zu Ihrer Beobachtungsliste hinzu, um sie hier zu sehen.
            </p>
            <Link
              href="/items"
              className="inline-flex items-center px-4 py-2 bg-[#3665f3] text-white rounded-lg hover:bg-[#1e49c7] transition-colors"
            >
              <Eye className="h-5 w-5 mr-2" />
              Artikel entdecken
            </Link>
          </div>
        ) : (
          <>
            {/* Stats */}
            <div className="bg-white rounded-lg p-4 mb-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-6">
                  <div className="text-sm text-gray-600">
                    <span className="font-semibold text-gray-900">{watchlistItems.length}</span> Artikel beobachtet
                  </div>
                </div>
                <div className="text-sm text-gray-500">
                  Zuletzt aktualisiert: {new Date().toLocaleDateString("de-DE")}
                </div>
              </div>
            </div>

            {/* Items Grid */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
              {watchlistItems.map((watchlistItem) => (
                <div key={watchlistItem.id} className="relative">
                  <ItemCard
                    id={watchlistItem.item.id}
                    title={watchlistItem.item.title}
                    imageUrl={watchlistItem.item.images?.[0]?.url}
                    pricePerDay={watchlistItem.item.pricePerDay}
                    pricePerHour={watchlistItem.item.pricePerHour}
                    location={watchlistItem.item.location}
                    condition={watchlistItem.item.condition}
                    available={watchlistItem.item.available}
                    user={watchlistItem.item.user}
                    category={watchlistItem.item.category?.id}
                    isWatched={true}
                  />
                  
                  {/* Remove from watchlist button */}
                  <button
                    onClick={() => removeFromWatchlist(watchlistItem.item.id)}
                    className="absolute top-2 left-2 p-2 bg-red-500 text-white rounded-full shadow hover:bg-red-600 transition-colors"
                    title="Aus Beobachtungsliste entfernen"
                  >
                    <Heart className="h-4 w-4 fill-current" />
                  </button>
                  
                  {/* Date added */}
                  <div className="absolute bottom-2 left-2 bg-black bg-opacity-50 text-white text-xs px-2 py-1 rounded">
                    <Calendar className="h-3 w-3 inline mr-1" />
                    {new Date(watchlistItem.createdAt).toLocaleDateString("de-DE")}
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  )
}