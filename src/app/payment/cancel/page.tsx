"use client"

import { XCircle, Home, RefreshCw } from "lucide-react"
import Link from "next/link"

export default function PaymentCancelPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-red-100 rounded-full mb-4">
            <XCircle className="h-8 w-8 text-red-600" />
          </div>
          
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Zahlung abgebrochen
          </h1>
          
          <p className="text-gray-600 mb-8">
            Ihre Zahlung wurde abgebrochen. Keine Kosten wurden berechnet.
          </p>

          <div className="space-y-3">
            <Link
              href="/items"
              className="w-full bg-[#3665f3] text-white py-3 px-4 rounded-lg hover:bg-[#1e49c7] transition-colors flex items-center justify-center gap-2"
            >
              <RefreshCw className="h-5 w-5" />
              Erneut versuchen
            </Link>
            
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