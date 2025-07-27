"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import Image from "next/image"
import Link from "next/link"
import { format } from "date-fns"
import { de } from "date-fns/locale"
import { Calendar, MapPin, MessageCircle, Star, User, Package, CheckCircle, XCircle, Clock, Loader2 } from "lucide-react"
import MessageThread from "@/components/MessageThread"

export default function RentalDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { data: session } = useSession()
  const [rental, setRental] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState(false)
  const [showReviewForm, setShowReviewForm] = useState(false)
  const [reviewData, setReviewData] = useState({
    rating: 5,
    comment: "",
  })
  const [submittingReview, setSubmittingReview] = useState(false)

  useEffect(() => {
    if (session) {
      fetchRental()
    } else if (session === null) {
      router.push("/auth/signin")
    }
  }, [session, params.id])

  const fetchRental = async () => {
    try {
      const response = await fetch(`/api/rentals/${params.id}`)
      if (response.ok) {
        const data = await response.json()
        setRental(data)
      } else {
        router.push("/my-rentals")
      }
    } catch (error) {
      console.error("Error fetching rental:", error)
    } finally {
      setLoading(false)
    }
  }

  const updateRentalStatus = async (newStatus: string) => {
    setUpdating(true)
    try {
      const response = await fetch(`/api/rentals/${params.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      })

      if (response.ok) {
        const updated = await response.json()
        setRental(updated)
      } else {
        const error = await response.json()
        alert(error.error || "Fehler beim Aktualisieren")
      }
    } catch (error) {
      console.error("Error updating rental:", error)
    } finally {
      setUpdating(false)
    }
  }

  const submitReview = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmittingReview(true)

    try {
      const response = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          rentalId: rental.id,
          rating: reviewData.rating,
          comment: reviewData.comment,
        }),
      })

      if (response.ok) {
        setShowReviewForm(false)
        // Refresh rental to show the new review
        fetchRental()
      } else {
        const error = await response.json()
        alert(error.error || "Fehler beim Erstellen der Bewertung")
      }
    } catch (error) {
      console.error("Error submitting review:", error)
    } finally {
      setSubmittingReview(false)
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-center items-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        </div>
      </div>
    )
  }

  if (!rental) return null

  const isOwner = session?.user?.id === rental.ownerId
  const isRenter = session?.user?.id === rental.renterId
  const otherUser = isOwner ? rental.renter : rental.owner
  const hasReviewed = rental.reviews.some((r: any) => r.reviewer.id === session?.user?.id)

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "pending":
        return <Clock className="h-5 w-5 text-yellow-500" />
      case "confirmed":
        return <CheckCircle className="h-5 w-5 text-green-500" />
      case "active":
        return <Package className="h-5 w-5 text-blue-500" />
      case "completed":
        return <CheckCircle className="h-5 w-5 text-gray-500" />
      case "cancelled":
        return <XCircle className="h-5 w-5 text-red-500" />
      default:
        return null
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case "pending":
        return "Ausstehend"
      case "confirmed":
        return "Bestätigt"
      case "active":
        return "Aktiv"
      case "completed":
        return "Abgeschlossen"
      case "cancelled":
        return "Storniert"
      default:
        return status
    }
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <Link
        href="/my-rentals"
        className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-6"
      >
        ← Zurück zu meinen Buchungen
      </Link>

      <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">Buchungsdetails</h1>
          <div className="flex items-center gap-2">
            {getStatusIcon(rental.status)}
            <span className="font-medium">{getStatusText(rental.status)}</span>
          </div>
        </div>

        {/* Item Details */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div>
            <Link href={`/items/${rental.item.id}`} className="block">
              <div className="relative aspect-[4/3] rounded-lg overflow-hidden mb-4">
                {rental.item.images[0] ? (
                  <Image
                    src={rental.item.images[0].url}
                    alt={rental.item.title}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                    <Package className="h-12 w-12 text-gray-400" />
                  </div>
                )}
              </div>
              <h2 className="text-xl font-semibold hover:text-blue-600 transition-colors">
                {rental.item.title}
              </h2>
            </Link>
            <p className="text-gray-600 flex items-center gap-1 mt-2">
              <MapPin className="h-4 w-4" />
              {rental.item.location}
            </p>
          </div>

          <div className="space-y-4">
            <div>
              <h3 className="font-medium text-gray-700 mb-2">Buchungszeitraum</h3>
              <div className="flex items-center gap-1 text-gray-600">
                <Calendar className="h-4 w-4" />
                {format(new Date(rental.startDate), "dd. MMMM yyyy", { locale: de })} - 
                {format(new Date(rental.endDate), "dd. MMMM yyyy", { locale: de })}
              </div>
            </div>

            <div>
              <h3 className="font-medium text-gray-700 mb-2">Preisdetails</h3>
              <div className="space-y-1">
                <div className="flex justify-between">
                  <span className="text-gray-600">Gesamtpreis:</span>
                  <span className="font-semibold">{rental.totalPrice}€</span>
                </div>
                {rental.depositPaid > 0 && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Kaution:</span>
                    <span>{rental.depositPaid}€</span>
                  </div>
                )}
              </div>
            </div>

            {/* Other User Info */}
            <div>
              <h3 className="font-medium text-gray-700 mb-2">
                {isOwner ? "Mieter" : "Vermieter"}
              </h3>
              <div className="flex items-center gap-3">
                {otherUser.avatarUrl ? (
                  <Image
                    src={otherUser.avatarUrl}
                    alt={otherUser.name}
                    width={48}
                    height={48}
                    className="rounded-full"
                  />
                ) : (
                  <div className="w-12 h-12 bg-gray-300 rounded-full flex items-center justify-center">
                    <User className="h-6 w-6 text-gray-600" />
                  </div>
                )}
                <div>
                  <p className="font-medium">{otherUser.name || "Unbekannt"}</p>
                  <p className="text-sm text-gray-600">{otherUser.email}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-3 pt-6 border-t">
          {rental.status === "pending" && isOwner && (
            <>
              <button
                onClick={() => updateRentalStatus("confirmed")}
                disabled={updating}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
              >
                Bestätigen
              </button>
              <button
                onClick={() => updateRentalStatus("cancelled")}
                disabled={updating}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
              >
                Ablehnen
              </button>
            </>
          )}

          {rental.status === "confirmed" && isOwner && (
            <button
              onClick={() => updateRentalStatus("active")}
              disabled={updating}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              Als übergeben markieren
            </button>
          )}

          {rental.status === "active" && isRenter && (
            <button
              onClick={() => updateRentalStatus("completed")}
              disabled={updating}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
            >
              Als zurückgegeben markieren
            </button>
          )}

          {(rental.status === "pending" || rental.status === "confirmed") && (isOwner || isRenter) && (
            <button
              onClick={() => {
                if (confirm("Möchtest du diese Buchung wirklich stornieren?")) {
                  updateRentalStatus("cancelled")
                }
              }}
              disabled={updating}
              className="px-4 py-2 border border-red-600 text-red-600 rounded-lg hover:bg-red-50 transition-colors disabled:opacity-50"
            >
              Stornieren
            </button>
          )}

          {rental.status === "completed" && !hasReviewed && (
            <button
              onClick={() => setShowReviewForm(true)}
              className="px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition-colors"
            >
              Bewertung abgeben
            </button>
          )}
        </div>
      </div>

      {/* Review Form */}
      {showReviewForm && (
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Bewertung abgeben</h2>
          <form onSubmit={submitReview}>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Bewertung
              </label>
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setReviewData({ ...reviewData, rating: star })}
                    className={`p-1 ${
                      star <= reviewData.rating ? "text-yellow-500" : "text-gray-300"
                    }`}
                  >
                    <Star className="h-8 w-8 fill-current" />
                  </button>
                ))}
              </div>
            </div>

            <div className="mb-4">
              <label htmlFor="comment" className="block text-sm font-medium text-gray-700 mb-2">
                Kommentar (optional)
              </label>
              <textarea
                id="comment"
                rows={4}
                value={reviewData.comment}
                onChange={(e) => setReviewData({ ...reviewData, comment: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Wie war deine Erfahrung?"
              />
            </div>

            <div className="flex gap-3">
              <button
                type="submit"
                disabled={submittingReview}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
              >
                {submittingReview ? "Wird gesendet..." : "Bewertung abgeben"}
              </button>
              <button
                type="button"
                onClick={() => setShowReviewForm(false)}
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Abbrechen
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Reviews */}
      {rental.reviews.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Bewertungen</h2>
          <div className="space-y-4">
            {rental.reviews.map((review: any) => (
              <div key={review.id} className="border-b pb-4 last:border-0">
                <div className="flex items-center gap-3 mb-2">
                  {review.reviewer.avatarUrl ? (
                    <Image
                      src={review.reviewer.avatarUrl}
                      alt={review.reviewer.name}
                      width={40}
                      height={40}
                      className="rounded-full"
                    />
                  ) : (
                    <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center">
                      <User className="h-5 w-5 text-gray-600" />
                    </div>
                  )}
                  <div>
                    <p className="font-medium">{review.reviewer.name || "Unbekannt"}</p>
                    <div className="flex items-center gap-1">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`h-4 w-4 ${
                            i < review.rating ? "text-yellow-500 fill-current" : "text-gray-300"
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                </div>
                {review.comment && (
                  <p className="text-gray-700 ml-[52px]">{review.comment}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Messages */}
      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <MessageCircle className="h-5 w-5" />
          Nachrichten
        </h2>
        <MessageThread rentalId={rental.id} otherUser={otherUser} />
      </div>
    </div>
  )
}