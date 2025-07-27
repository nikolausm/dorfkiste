"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import Image from "next/image"
import Link from "next/link"
import { 
  Calendar, MapPin, Shield, Star, User, ChevronLeft, ChevronRight, 
  Heart, Share2, Flag, Clock, CheckCircle, AlertCircle, Package,
  Truck, RefreshCw, MessageCircle, X
} from "lucide-react"
import { format, addDays } from "date-fns"
import { de } from "date-fns/locale"
import { generateItemImages } from "@/lib/image-generator"
import PaymentModal from "@/components/PaymentModal"

export default function ItemDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { data: session } = useSession()
  const [item, setItem] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [selectedImageIndex, setSelectedImageIndex] = useState(0)
  const [isWatched, setIsWatched] = useState(false)
  const [showImageModal, setShowImageModal] = useState(false)
  const [bookingDates, setBookingDates] = useState({
    startDate: "",
    endDate: "",
  })
  const [bookingLoading, setBookingLoading] = useState(false)
  const [activeTab, setActiveTab] = useState<"description" | "shipping" | "returns">("description")
  const [showPaymentModal, setShowPaymentModal] = useState(false)
  const [rentalForPayment, setRentalForPayment] = useState<any>(null)

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
        // Instead of redirecting, show payment modal
        setRentalForPayment(rental)
        setShowPaymentModal(true)
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

  const toggleWatchlist = () => {
    setIsWatched(!isWatched)
    // TODO: API call to update watchlist
  }

  const handlePaymentSuccess = () => {
    setShowPaymentModal(false)
    if (rentalForPayment) {
      router.push(`/rentals/${rentalForPayment.id}`)
    }
  }

  if (loading) {
    return (
      <div className="max-w-[1280px] mx-auto px-4 py-4">
        <div className="animate-pulse">
          <div className="h-[500px] bg-gray-200 rounded-lg mb-8"></div>
          <div className="h-8 bg-gray-200 rounded w-1/2 mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-3/4"></div>
        </div>
      </div>
    )
  }

  if (!item) {
    return null
  }

  // Generate images if none exist
  const images = item.images && item.images.length > 0 
    ? item.images 
    : generateItemImages(item.id, item.title, item.category?.id, 3).map((url, index) => ({
        id: `generated-${index}`,
        url
      }))
  const currentImage = images[selectedImageIndex]
  const sellerRating = item.user.rating || 4.5
  const sellerReviews = item.user.reviewCount || 12

  return (
    <div className="max-w-[1280px] mx-auto px-4 py-4">
      {/* Breadcrumb */}
      <nav className="text-sm mb-4">
        <ol className="flex items-center space-x-2 text-gray-600">
          <li><Link href="/" className="hover:text-blue-600">Startseite</Link></li>
          <li className="before:content-['>'] before:mx-2">
            <Link href="/categories" className="hover:text-blue-600">Kategorien</Link>
          </li>
          {item.category && (
            <li className="before:content-['>'] before:mx-2">
              <Link href={`/categories/${item.category.id}`} className="hover:text-blue-600">
                {item.category.name}
              </Link>
            </li>
          )}
          <li className="before:content-['>'] before:mx-2">
            <span className="text-gray-900 truncate max-w-[200px] inline-block">{item.title}</span>
          </li>
        </ol>
      </nav>

      <div className="bg-white rounded-lg shadow-sm">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 p-6">
          {/* Left: Images */}
          <div className="lg:col-span-2">
            {/* Main Image */}
            <div className="relative aspect-[4/3] bg-gray-100 rounded-lg overflow-hidden mb-4">
              {currentImage ? (
                <>
                  <Image
                    src={currentImage.url}
                    alt={item.title}
                    fill
                    className="object-contain cursor-zoom-in"
                    unoptimized
                    onClick={() => setShowImageModal(true)}
                  />
                  {/* Action Buttons */}
                  <div className="absolute top-4 right-4 flex gap-2">
                    <button
                      onClick={toggleWatchlist}
                      className="p-3 bg-white rounded-full shadow-md hover:shadow-lg transition-shadow"
                      aria-label="Zur Beobachtungsliste hinzufügen"
                    >
                      <Heart className={`w-5 h-5 ${isWatched ? 'fill-red-500 text-red-500' : 'text-gray-600'}`} />
                    </button>
                    <button
                      className="p-3 bg-white rounded-full shadow-md hover:shadow-lg transition-shadow"
                      aria-label="Teilen"
                    >
                      <Share2 className="w-5 h-5 text-gray-600" />
                    </button>
                  </div>
                </>
              ) : (
                <div className="flex items-center justify-center h-full text-gray-400">
                  <Package className="h-16 w-16" />
                </div>
              )}
              
              {/* Navigation Arrows */}
              {images.length > 1 && (
                <>
                  <button
                    onClick={() => setSelectedImageIndex(Math.max(0, selectedImageIndex - 1))}
                    className="absolute left-4 top-1/2 -translate-y-1/2 p-2 bg-white/90 rounded-full shadow-md hover:bg-white transition-all"
                    disabled={selectedImageIndex === 0}
                  >
                    <ChevronLeft className="h-6 w-6" />
                  </button>
                  <button
                    onClick={() => setSelectedImageIndex(Math.min(images.length - 1, selectedImageIndex + 1))}
                    className="absolute right-4 top-1/2 -translate-y-1/2 p-2 bg-white/90 rounded-full shadow-md hover:bg-white transition-all"
                    disabled={selectedImageIndex === images.length - 1}
                  >
                    <ChevronRight className="h-6 w-6" />
                  </button>
                </>
              )}
            </div>

            {/* Thumbnail Grid */}
            {images.length > 1 && (
              <div className="grid grid-cols-6 gap-2">
                {images.map((img: any, index: number) => (
                  <button
                    key={img.id}
                    onClick={() => setSelectedImageIndex(index)}
                    className={`relative aspect-square rounded-lg overflow-hidden border-2 transition-all ${
                      index === selectedImageIndex ? "border-[#3665f3]" : "border-gray-200 hover:border-gray-400"
                    }`}
                  >
                    <Image
                      src={img.url}
                      alt={`${item.title} ${index + 1}`}
                      fill
                      className="object-cover"
                      unoptimized
                    />
                  </button>
                ))}
              </div>
            )}

            {/* Item Details Tabs */}
            <div className="mt-8">
              <div className="border-b border-gray-200">
                <nav className="flex space-x-8">
                  <button
                    onClick={() => setActiveTab("description")}
                    className={`pb-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                      activeTab === "description" 
                        ? "border-[#3665f3] text-[#3665f3]" 
                        : "border-transparent text-gray-500 hover:text-gray-700"
                    }`}
                  >
                    Beschreibung
                  </button>
                  <button
                    onClick={() => setActiveTab("shipping")}
                    className={`pb-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                      activeTab === "shipping" 
                        ? "border-[#3665f3] text-[#3665f3]" 
                        : "border-transparent text-gray-500 hover:text-gray-700"
                    }`}
                  >
                    Abholung & Versand
                  </button>
                  <button
                    onClick={() => setActiveTab("returns")}
                    className={`pb-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                      activeTab === "returns" 
                        ? "border-[#3665f3] text-[#3665f3]" 
                        : "border-transparent text-gray-500 hover:text-gray-700"
                    }`}
                  >
                    Rückgabe & Stornierung
                  </button>
                </nav>
              </div>

              <div className="py-6">
                {activeTab === "description" && (
                  <div>
                    <h2 className="text-xl font-bold mb-4">Artikelbeschreibung</h2>
                    <div className="prose max-w-none">
                      <p className="whitespace-pre-wrap text-gray-700">{item.description || "Keine Beschreibung vorhanden"}</p>
                    </div>
                    
                    {/* Item Specifics */}
                    <div className="mt-8">
                      <h3 className="text-lg font-bold mb-4">Artikelmerkmale</h3>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="flex">
                          <span className="font-medium text-gray-600 w-32">Zustand:</span>
                          <span className="text-gray-900">{item.condition}</span>
                        </div>
                        <div className="flex">
                          <span className="font-medium text-gray-600 w-32">Kategorie:</span>
                          <span className="text-gray-900">{item.category?.name || "Sonstiges"}</span>
                        </div>
                        <div className="flex">
                          <span className="font-medium text-gray-600 w-32">Standort:</span>
                          <span className="text-gray-900">{item.location}</span>
                        </div>
                        <div className="flex">
                          <span className="font-medium text-gray-600 w-32">Verfügbar:</span>
                          <span className={`font-medium ${item.available ? "text-green-600" : "text-red-600"}`}>
                            {item.available ? "Ja" : "Nein"}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === "shipping" && (
                  <div>
                    <h2 className="text-xl font-bold mb-4">Abholung & Lieferung</h2>
                    <div className="space-y-4">
                      {item.pickupAvailable && (
                        <div className="flex items-start gap-3">
                          <Package className="w-5 h-5 text-green-600 mt-0.5" />
                          <div>
                            <h4 className="font-medium text-green-600">Selbstabholung möglich</h4>
                            <p className="text-gray-600 text-sm">Artikel kann in {item.location} abgeholt werden</p>
                          </div>
                        </div>
                      )}
                      
                      {item.deliveryAvailable ? (
                        <div className="flex items-start gap-3">
                          <Truck className="w-5 h-5 text-green-600 mt-0.5" />
                          <div>
                            <h4 className="font-medium text-green-600">Lieferung verfügbar</h4>
                            <div className="text-gray-600 text-sm space-y-1">
                              {item.deliveryFee && (
                                <p>Liefergebühr: <span className="font-medium text-gray-900">{item.deliveryFee}€</span></p>
                              )}
                              {item.deliveryRadius && (
                                <p>Lieferradius: <span className="font-medium text-gray-900">{item.deliveryRadius} km</span></p>
                              )}
                              {item.deliveryDetails && (
                                <p className="mt-2">{item.deliveryDetails}</p>
                              )}
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-start gap-3">
                          <Truck className="w-5 h-5 text-gray-400 mt-0.5" />
                          <div>
                            <h4 className="font-medium text-gray-500">Keine Lieferung möglich</h4>
                            <p className="text-gray-500 text-sm">Dieser Artikel muss abgeholt werden</p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {activeTab === "returns" && (
                  <div>
                    <h2 className="text-xl font-bold mb-4">Rückgabe & Stornierung</h2>
                    <div className="space-y-4">
                      <div className="flex items-start gap-3">
                        <RefreshCw className="w-5 h-5 text-gray-600 mt-0.5" />
                        <div>
                          <h4 className="font-medium">Stornierung</h4>
                          <p className="text-gray-600 text-sm">Kostenlose Stornierung bis 24 Stunden vor Mietbeginn</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <Shield className="w-5 h-5 text-gray-600 mt-0.5" />
                        <div>
                          <h4 className="font-medium">Versicherung</h4>
                          <p className="text-gray-600 text-sm">Optionale Versicherung für Schäden verfügbar</p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right: Purchase Box */}
          <div className="lg:col-span-1">
            <div className="sticky top-4">
              {/* Title */}
              <h1 className="text-2xl font-bold mb-4">{item.title}</h1>

              {/* Price */}
              <div className="mb-6">
                {item.pricePerDay && (
                  <div className="text-3xl font-bold text-gray-900 mb-1">
                    {item.pricePerDay}€<span className="text-lg font-normal text-gray-600">/Tag</span>
                  </div>
                )}
                {item.pricePerHour && (
                  <div className="text-lg text-gray-600">
                    oder {item.pricePerHour}€/Stunde
                  </div>
                )}
                {item.deposit && (
                  <div className="text-sm text-gray-500 mt-2">
                    Kaution: {item.deposit}€
                  </div>
                )}
              </div>

              {/* Availability Status */}
              <div className="mb-6">
                {item.available ? (
                  <div className="flex items-center gap-2 text-green-600">
                    <CheckCircle className="w-5 h-5" />
                    <span className="font-medium">Verfügbar</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 text-red-600">
                    <AlertCircle className="w-5 h-5" />
                    <span className="font-medium">Aktuell nicht verfügbar</span>
                  </div>
                )}
              </div>

              {/* Booking Form */}
              {session?.user?.id !== item.user.id && (
                <div className="bg-gray-50 rounded-lg p-4 mb-6">
                  <form onSubmit={handleBooking} className="space-y-4">
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
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3665f3]"
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
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3665f3]"
                      />
                    </div>
                    
                    {/* Action Buttons */}
                    <button
                      type="submit"
                      disabled={bookingLoading || !item.available}
                      className="w-full bg-[#3665f3] text-white py-3 rounded-lg font-semibold hover:bg-[#1e49c7] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {bookingLoading ? "Wird gebucht..." : "Jetzt mieten"}
                    </button>
                    
                    <button
                      type="button"
                      onClick={() => router.push(`/messages/new?to=${item.user.id}&item=${item.id}`)}
                      className="w-full bg-white text-[#3665f3] border-2 border-[#3665f3] py-3 rounded-lg font-semibold hover:bg-gray-50 transition-colors"
                    >
                      <MessageCircle className="w-4 h-4 inline-block mr-2" />
                      Vermieter kontaktieren
                    </button>
                  </form>
                </div>
              )}

              {/* Seller Info */}
              <div className="border-t pt-6">
                <h3 className="font-bold mb-4">Vermieter-Informationen</h3>
                <div className="space-y-4">
                  <Link href={`/users/${item.user.id}`} className="flex items-center gap-3 hover:bg-gray-50 -mx-2 px-2 py-2 rounded">
                    {item.user.avatarUrl ? (
                      <Image
                        src={item.user.avatarUrl}
                        alt={item.user.name}
                        width={48}
                        height={48}
                        className="rounded-full"
                      />
                    ) : (
                      <div className="w-12 h-12 bg-gray-300 rounded-full flex items-center justify-center">
                        <User className="h-6 w-6 text-gray-600" />
                      </div>
                    )}
                    <div className="flex-1">
                      <p className="font-medium text-[#3665f3] hover:underline">{item.user.name || "Unbekannt"}</p>
                      <div className="flex items-center gap-2 text-sm">
                        <div className="flex items-center">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`w-4 h-4 ${i < Math.floor(sellerRating) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`}
                            />
                          ))}
                        </div>
                        <span className="text-gray-600">({sellerReviews} Bewertungen)</span>
                      </div>
                    </div>
                  </Link>
                  
                  <div className="text-sm text-gray-600">
                    <p>Mitglied seit {format(new Date(item.user.createdAt), "MMMM yyyy", { locale: de })}</p>
                    <p className="mt-1">Antwortzeit: Innerhalb von 2 Stunden</p>
                  </div>
                  
                  <Link
                    href={`/users/${item.user.id}/items`}
                    className="text-[#3665f3] hover:underline text-sm font-medium"
                  >
                    Weitere Artikel von diesem Vermieter
                  </Link>
                </div>
              </div>

              {/* Report Item */}
              <div className="mt-6 pt-6 border-t">
                <button className="text-sm text-gray-600 hover:text-gray-900 flex items-center gap-1">
                  <Flag className="w-4 h-4" />
                  Artikel melden
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Image Modal */}
      {showImageModal && currentImage && (
        <div
          className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center p-4"
          onClick={() => setShowImageModal(false)}
        >
          <div className="relative max-w-6xl max-h-[90vh]">
            <Image
              src={currentImage.url}
              alt={item.title}
              width={1200}
              height={900}
              className="object-contain"
              unoptimized
            />
            <button
              className="absolute top-4 right-4 p-2 bg-white rounded-full"
              onClick={() => setShowImageModal(false)}
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>
      )}

      {/* Payment Modal */}
      {showPaymentModal && rentalForPayment && (
        <PaymentModal
          isOpen={showPaymentModal}
          onClose={() => setShowPaymentModal(false)}
          rentalId={rentalForPayment.id}
          amount={rentalForPayment.totalPrice}
          onSuccess={handlePaymentSuccess}
        />
      )}
    </div>
  )
}