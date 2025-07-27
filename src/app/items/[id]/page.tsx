"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import Image from "next/image"
import { Calendar, MapPin, Shield, Star, User, ChevronLeft, ChevronRight } from "lucide-react"
import { format, addDays } from "date-fns"
import { de } from "date-fns/locale"

export default function ItemDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { data: session } = useSession()
  const [item, setItem] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [selectedImageIndex, setSelectedImageIndex] = useState(0)
  const [bookingDates, setBookingDates] = useState({
    startDate: "",
    endDate: "",
  })
  const [bookingLoading, setBookingLoading] = useState(false)

  useEffect(() => {
    fetchItem()
  }, [params.id])

  const fetchItem = async () => {
    try {
      const response = await fetch(`/api/items/${params.id}`)
      if (response.ok) {
        const data = await response.json()
        setItem(data)
      } else {
        router.push("/items")
      }
    } catch (error) {
      console.error("Error fetching item:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleBooking = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!session) {
      router.push("/auth/signin")
      return
    }

    setBookingLoading(true)
    try {
      const response = await fetch("/api/rentals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          itemId: params.id,
          startDate: bookingDates.startDate,
          endDate: bookingDates.endDate,
        }),
      })

      if (response.ok) {
        const rental = await response.json()
        router.push(`/rentals/${rental.id}`)
      } else {
        const error = await response.json()
        alert(error.error || "Fehler bei der Buchung")
      }
    } catch (error) {
      console.error("Error creating rental:", error)
      alert("Ein Fehler ist aufgetreten")
    } finally {
      setBookingLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse">
          <div className="h-96 bg-gray-200 rounded-lg mb-8"></div>
          <div className="h-8 bg-gray-200 rounded w-1/2 mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-3/4"></div>
        </div>
      </div>
    )
  }

  if (!item) {
    return null
  }

  const images = item.images || []
  const currentImage = images[selectedImageIndex]

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Images */}
        <div>
          <div className="relative aspect-[4/3] bg-gray-100 rounded-lg overflow-hidden mb-4">
            {currentImage ? (
              <Image
                src={currentImage.url}
                alt={item.title}
                fill
                className="object-cover"
              />
            ) : (
              <div className="flex items-center justify-center h-full text-gray-400">
                <Shield className="h-16 w-16" />
              </div>
            )}
            
            {images.length > 1 && (
              <>
                <button
                  onClick={() => setSelectedImageIndex(Math.max(0, selectedImageIndex - 1))}
                  className="absolute left-2 top-1/2 -translate-y-1/2 p-2 bg-white/80 rounded-full hover:bg-white transition-colors"
                  disabled={selectedImageIndex === 0}
                >
                  <ChevronLeft className="h-5 w-5" />
                </button>
                <button
                  onClick={() => setSelectedImageIndex(Math.min(images.length - 1, selectedImageIndex + 1))}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-white/80 rounded-full hover:bg-white transition-colors"
                  disabled={selectedImageIndex === images.length - 1}
                >
                  <ChevronRight className="h-5 w-5" />
                </button>
              </>
            )}
          </div>

          {images.length > 1 && (
            <div className="grid grid-cols-4 gap-2">
              {images.map((img: any, index: number) => (
                <button
                  key={img.id}
                  onClick={() => setSelectedImageIndex(index)}
                  className={`relative aspect-[4/3] rounded-lg overflow-hidden ${
                    index === selectedImageIndex ? "ring-2 ring-blue-600" : ""
                  }`}
                >
                  <Image
                    src={img.url}
                    alt={`${item.title} ${index + 1}`}
                    fill
                    className="object-cover"
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Details */}
        <div>
          <div className="mb-6">
            <h1 className="text-3xl font-bold mb-2">{item.title}</h1>
            <div className="flex items-center gap-4 text-gray-600">
              <span className="inline-flex items-center gap-1">
                <MapPin className="h-4 w-4" />
                {item.location}
              </span>
              <span className="inline-flex items-center gap-1">
                Zustand: {item.condition}
              </span>
            </div>
          </div>

          {item.description && (
            <div className="mb-6">
              <h2 className="text-lg font-semibold mb-2">Beschreibung</h2>
              <p className="text-gray-700 whitespace-pre-wrap">{item.description}</p>
            </div>
          )}

          {/* Pricing */}
          <div className="bg-gray-50 rounded-lg p-6 mb-6">
            <h2 className="text-lg font-semibold mb-4">Preise</h2>
            <div className="space-y-2">
              {item.pricePerDay && (
                <div className="flex justify-between">
                  <span>Pro Tag:</span>
                  <span className="font-semibold">{item.pricePerDay}€</span>
                </div>
              )}
              {item.pricePerHour && (
                <div className="flex justify-between">
                  <span>Pro Stunde:</span>
                  <span className="font-semibold">{item.pricePerHour}€</span>
                </div>
              )}
              {item.deposit && (
                <div className="flex justify-between">
                  <span>Kaution:</span>
                  <span className="font-semibold">{item.deposit}€</span>
                </div>
              )}
            </div>
          </div>

          {/* Booking Form */}
          {session?.user?.id !== item.user.id && (
            <div className="bg-blue-50 rounded-lg p-6 mb-6">
              <h2 className="text-lg font-semibold mb-4">Jetzt buchen</h2>
              <form onSubmit={handleBooking} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Von
                    </label>
                    <input
                      type="date"
                      required
                      min={format(new Date(), "yyyy-MM-dd")}
                      value={bookingDates.startDate}
                      onChange={(e) => setBookingDates({ ...bookingDates, startDate: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Bis
                    </label>
                    <input
                      type="date"
                      required
                      min={bookingDates.startDate || format(addDays(new Date(), 1), "yyyy-MM-dd")}
                      value={bookingDates.endDate}
                      onChange={(e) => setBookingDates({ ...bookingDates, endDate: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
                <button
                  type="submit"
                  disabled={bookingLoading || !item.available}
                  className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {bookingLoading ? "Wird gebucht..." : item.available ? "Anfrage senden" : "Nicht verfügbar"}
                </button>
              </form>
            </div>
          )}

          {/* Owner Info */}
          <div className="border-t pt-6">
            <h2 className="text-lg font-semibold mb-4">Vermieter</h2>
            <div className="flex items-center gap-4">
              {item.user.avatarUrl ? (
                <Image
                  src={item.user.avatarUrl}
                  alt={item.user.name}
                  width={60}
                  height={60}
                  className="rounded-full"
                />
              ) : (
                <div className="w-[60px] h-[60px] bg-gray-300 rounded-full flex items-center justify-center">
                  <User className="h-8 w-8 text-gray-600" />
                </div>
              )}
              <div>
                <p className="font-semibold">{item.user.name || "Unbekannt"}</p>
                <p className="text-sm text-gray-600">
                  Mitglied seit {format(new Date(item.user.createdAt), "MMMM yyyy", { locale: de })}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}