"use client"

import { useEffect, useState, Suspense } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { CheckCircle, Loader2, Home, FileText } from "lucide-react"
import Link from "next/link"

function PaymentSuccessContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [processing, setProcessing] = useState(true)
  const [rentalId, setRentalId] = useState<string | null>(null)

  useEffect(() => {
    const handlePayPalCapture = async () => {
      const token = searchParams.get("token")
      const payerId = searchParams.get("PayerID")

      if (token && payerId) {
        try {
          const response = await fetch("/api/payments/capture-paypal", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ orderId: token, payerId })
          })

          if (response.ok) {
            const data = await response.json()
            setRentalId(data.rentalId)
          }
        } catch (error) {
          console.error("Error capturing PayPal payment:", error)
        }
      }

      setProcessing(false)
    }

    handlePayPalCapture()
  }, [searchParams])

  if (processing) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-[#3665f3] mx-auto mb-4" />
          <p className="text-gray-600">Zahlung wird verarbeitet...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
            <CheckCircle className="h-8 w-8 text-green-600" />
          </div>
          
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Zahlung erfolgreich!
          </h1>
          
          <p className="text-gray-600 mb-8">
            Ihre Zahlung wurde erfolgreich verarbeitet. Sie erhalten in Kürze eine Bestätigungs-E-Mail.
          </p>

          <div className="space-y-3">
            {rentalId && (
              <Link
                href={`/rentals/${rentalId}`}
                className="w-full bg-[#3665f3] text-white py-3 px-4 rounded-lg hover:bg-[#1e49c7] transition-colors flex items-center justify-center gap-2"
              >
                <FileText className="h-5 w-5" />
                Buchungsdetails anzeigen
              </Link>
            )}
            
            <Link
              href="/"
              className="w-full bg-gray-100 text-gray-700 py-3 px-4 rounded-lg hover:bg-gray-200 transition-colors flex items-center justify-center gap-2"
            >
              <Home className="h-5 w-5" />
              Zur Startseite
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function PaymentSuccessPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-[#3665f3] mx-auto mb-4" />
          <p className="text-gray-600">Laden...</p>
        </div>
      </div>
    }>
      <PaymentSuccessContent />
    </Suspense>
  )
}