"use client"

import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import { Calendar, MapPin, Clock, CheckCircle, XCircle, AlertCircle, Package } from "lucide-react"
import { format } from "date-fns"
import { de } from "date-fns/locale"

export default function MyRentalsPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [rentals, setRentals] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<"renter" | "owner">("renter")

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/signin")
    } else if (session) {
      fetchRentals()
    }
  }, [session, status, activeTab])

  const fetchRentals = async () => {
    setLoading(true)
    try {
      const response = await fetch(`/api/rentals?role=${activeTab}`)
      if (response.ok) {
        const data = await response.json()
        setRentals(data.rentals)
      }
    } catch (error) {
      console.error("Error fetching rentals:", error)
    } finally {
      setLoading(false)
    }
  }

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
        return <AlertCircle className="h-5 w-5 text-gray-500" />
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

  if (status === "loading" || loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-8"></div>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-32 bg-gray-200 rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Meine Buchungen</h1>

      {/* Tabs */}
      <div className="flex space-x-1 mb-8 bg-gray-100 p-1 rounded-lg inline-flex">
        <button
          onClick={() => setActiveTab("renter")}
          className={`px-4 py-2 rounded-md font-medium transition-colors ${
            activeTab === "renter"
              ? "bg-white text-blue-600 shadow-sm"
              : "text-gray-600 hover:text-gray-900"
          }`}
        >
          Als Mieter
        </button>
        <button
          onClick={() => setActiveTab("owner")}
          className={`px-4 py-2 rounded-md font-medium transition-colors ${
            activeTab === "owner"
              ? "bg-white text-blue-600 shadow-sm"
              : "text-gray-600 hover:text-gray-900"
          }`}
        >
          Als Vermieter
        </button>
      </div>

      {/* Rentals List */}
      {rentals.length === 0 ? (
        <div className="text-center py-12">
          <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500">
            {activeTab === "renter"
              ? "Du hast noch keine Artikel gemietet"
              : "Du hast noch keine Vermietungen"}
          </p>
          {activeTab === "renter" && (
            <Link
              href="/items"
              className="inline-block mt-4 text-blue-600 hover:text-blue-700 font-medium"
            >
              Artikel entdecken →
            </Link>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {rentals.map((rental) => (
            <Link
              key={rental.id}
              href={`/rentals/${rental.id}`}
              className="block bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow p-6"
            >
              <div className="flex gap-6">
                {/* Image */}
                <div className="relative w-24 h-24 flex-shrink-0 rounded-lg overflow-hidden">
                  {rental.item.images[0] ? (
                    <Image
                      src={rental.item.images[0].url}
                      alt={rental.item.title}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                      <Package className="h-8 w-8 text-gray-400" />
                    </div>
                  )}
                </div>

                {/* Details */}
                <div className="flex-1">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="text-lg font-semibold">{rental.item.title}</h3>
                    <div className="flex items-center gap-2">
                      {getStatusIcon(rental.status)}
                      <span className="text-sm font-medium">{getStatusText(rental.status)}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 text-sm text-gray-600 mb-2">
                    <span className="inline-flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      {format(new Date(rental.startDate), "dd.MM.yyyy", { locale: de })} - 
                      {format(new Date(rental.endDate), "dd.MM.yyyy", { locale: de })}
                    </span>
                    <span className="inline-flex items-center gap-1">
                      <MapPin className="h-4 w-4" />
                      {rental.item.location}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-sm text-gray-600">
                        {activeTab === "renter" ? "Vermieter: " : "Mieter: "}
                      </span>
                      <span className="text-sm font-medium">
                        {activeTab === "renter" ? rental.owner.name : rental.renter.name}
                      </span>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-semibold text-green-600">{rental.totalPrice}€</p>
                      <p className="text-xs text-gray-500">Gesamtpreis</p>
                    </div>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}