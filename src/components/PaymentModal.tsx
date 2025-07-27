"use client"

import { useState, useEffect } from "react"
import { X, CreditCard, Loader2, CheckCircle, AlertCircle } from "lucide-react"
import { loadStripe } from "@stripe/stripe-js"
import { Elements, CardElement, useStripe, useElements } from "@stripe/react-stripe-js"

interface PaymentModalProps {
  isOpen: boolean
  onClose: () => void
  rentalId: string
  amount: number
  onSuccess: () => void
}

// Inner component that uses Stripe hooks
function PaymentForm({ rentalId, amount, onSuccess, onClose }: {
  rentalId: string
  amount: number
  onSuccess: () => void
  onClose: () => void
}) {
  const stripe = useStripe()
  const elements = useElements()
  const [error, setError] = useState("")
  const [processing, setProcessing] = useState(false)
  const [paymentMethod, setPaymentMethod] = useState<"stripe" | "paypal">("stripe")

  const handleStripePayment = async () => {
    if (!stripe || !elements) return

    setProcessing(true)
    setError("")

    try {
      // Create payment intent
      const response = await fetch("/api/payments/create-intent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          rentalId,
          amount,
          method: "stripe"
        })
      })

      if (!response.ok) {
        throw new Error("Fehler beim Erstellen der Zahlung")
      }

      const { clientSecret } = await response.json()

      // Confirm payment
      const cardElement = elements.getElement(CardElement)
      if (!cardElement) return

      const result = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: cardElement,
        }
      })

      if (result.error) {
        setError(result.error.message || "Zahlung fehlgeschlagen")
      } else if (result.paymentIntent?.status === "succeeded") {
        onSuccess()
      }
    } catch (error: any) {
      setError(error.message || "Ein Fehler ist aufgetreten")
    } finally {
      setProcessing(false)
    }
  }

  const handlePayPalPayment = async () => {
    setProcessing(true)
    setError("")

    try {
      // Create PayPal order
      const response = await fetch("/api/payments/create-paypal-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          rentalId,
          amount
        })
      })

      if (!response.ok) {
        throw new Error("Fehler beim Erstellen der PayPal-Zahlung")
      }

      const order = await response.json()
      
      // Redirect to PayPal
      const approveUrl = order.links.find((link: any) => link.rel === "approve")?.href
      if (approveUrl) {
        window.location.href = approveUrl
      } else {
        throw new Error("PayPal-Zahlungslink nicht gefunden")
      }
    } catch (error: any) {
      setError(error.message || "Ein Fehler ist aufgetreten")
      setProcessing(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (paymentMethod === "stripe") {
      await handleStripePayment()
    } else {
      await handlePayPalPayment()
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-4">Zahlungsmethode wählen</h3>
        <div className="space-y-3">
          <label className="flex items-center p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
            <input
              type="radio"
              name="paymentMethod"
              value="stripe"
              checked={paymentMethod === "stripe"}
              onChange={(e) => setPaymentMethod(e.target.value as "stripe")}
              className="mr-3"
            />
            <CreditCard className="h-5 w-5 mr-2 text-gray-600" />
            <span>Kreditkarte</span>
          </label>
          
          <label className="flex items-center p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
            <input
              type="radio"
              name="paymentMethod"
              value="paypal"
              checked={paymentMethod === "paypal"}
              onChange={(e) => setPaymentMethod(e.target.value as "paypal")}
              className="mr-3"
            />
            <img src="/paypal-logo.svg" alt="PayPal" className="h-5 mr-2" />
            <span>PayPal</span>
          </label>
        </div>
      </div>

      {paymentMethod === "stripe" && (
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Kartendaten
          </label>
          <div className="border rounded-lg p-3">
            <CardElement
              options={{
                style: {
                  base: {
                    fontSize: "16px",
                    color: "#424770",
                    "::placeholder": {
                      color: "#aab7c4",
                    },
                  },
                  invalid: {
                    color: "#9e2146",
                  },
                },
              }}
            />
          </div>
        </div>
      )}

      {error && (
        <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-lg flex items-center gap-2">
          <AlertCircle className="h-5 w-5" />
          {error}
        </div>
      )}

      <div className="flex gap-3">
        <button
          type="button"
          onClick={onClose}
          disabled={processing}
          className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
        >
          Abbrechen
        </button>
        <button
          type="submit"
          disabled={processing || !stripe}
          className="flex-1 px-4 py-2 bg-[#3665f3] text-white rounded-lg hover:bg-[#1e49c7] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {processing ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Wird verarbeitet...
            </>
          ) : (
            <>
              {amount.toFixed(2)}€ zahlen
            </>
          )}
        </button>
      </div>
    </form>
  )
}

export default function PaymentModal({ isOpen, onClose, rentalId, amount, onSuccess }: PaymentModalProps) {
  const [stripePromise, setStripePromise] = useState<Promise<any> | null>(null)

  useEffect(() => {
    // Load Stripe publishable key
    const loadStripeKey = async () => {
      try {
        const response = await fetch("/api/payments/stripe-key")
        if (response.ok) {
          const { publishableKey } = await response.json()
          if (publishableKey) {
            setStripePromise(loadStripe(publishableKey))
          }
        }
      } catch (error) {
        console.error("Error loading Stripe:", error)
      }
    }

    loadStripeKey()
  }, [])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg max-w-md w-full p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold">Zahlung abschließen</h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="mb-6 p-4 bg-gray-50 rounded-lg">
          <div className="flex justify-between items-center">
            <span className="text-gray-600">Gesamtbetrag:</span>
            <span className="text-2xl font-bold">{amount.toFixed(2)}€</span>
          </div>
        </div>

        {stripePromise ? (
          <Elements stripe={stripePromise}>
            <PaymentForm
              rentalId={rentalId}
              amount={amount}
              onSuccess={onSuccess}
              onClose={onClose}
            />
          </Elements>
        ) : (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
          </div>
        )}
      </div>
    </div>
  )
}