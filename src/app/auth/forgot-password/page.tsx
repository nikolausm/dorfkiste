"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { ArrowLeft, Mail } from "lucide-react"

export default function ForgotPasswordPage() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [loading, setLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    try {
      const response = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email })
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error || "Ein Fehler ist aufgetreten")
      } else {
        setSubmitted(true)
      }
    } catch (error) {
      setError("Ein Fehler ist aufgetreten. Bitte versuchen Sie es später erneut.")
    } finally {
      setLoading(false)
    }
  }

  if (submitted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <div className="bg-white p-8 rounded-lg shadow-sm">
            <div className="flex justify-center mb-6">
              <div className="p-3 bg-green-100 rounded-full">
                <Mail className="w-8 h-8 text-green-600" />
              </div>
            </div>
            
            <h2 className="text-center text-2xl font-bold text-gray-900 mb-2">
              E-Mail gesendet!
            </h2>
            
            <p className="text-center text-gray-600 mb-6">
              Wenn die E-Mail-Adresse <strong>{email}</strong> in unserem System registriert ist, 
              erhalten Sie in Kürze eine E-Mail mit Anweisungen zum Zurücksetzen Ihres Passworts.
            </p>
            
            <p className="text-center text-sm text-gray-500 mb-6">
              Bitte überprüfen Sie auch Ihren Spam-Ordner, falls Sie keine E-Mail erhalten.
            </p>
            
            <Link
              href="/auth/signin"
              className="w-full flex justify-center items-center gap-2 py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <ArrowLeft className="w-4 h-4" />
              Zurück zur Anmeldung
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <div className="text-center">
            <Link href="/" className="inline-block">
              <div className="text-4xl font-bold mb-2">
                <span className="text-[#e53238]">D</span>
                <span className="text-[#f9a316]">o</span>
                <span className="text-[#5ba71b]">r</span>
                <span className="text-[#3665f3]">f</span>
                <span className="text-black">kiste</span>
              </div>
            </Link>
            <p className="text-gray-600">Die Nachbarschafts-Verleihplattform</p>
          </div>
          
          <h2 className="mt-6 text-center text-3xl font-bold text-gray-900">
            Passwort vergessen?
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Geben Sie Ihre E-Mail-Adresse ein und wir senden Ihnen einen Link zum Zurücksetzen Ihres Passworts.
          </p>
        </div>
        
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md text-sm">
              {error}
            </div>
          )}
          
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
              E-Mail-Adresse
            </label>
            <div className="mt-1">
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                placeholder="ihre@email.de"
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Wird gesendet..." : "Reset-Link senden"}
            </button>
          </div>

          <div className="text-center">
            <Link
              href="/auth/signin"
              className="text-sm text-blue-600 hover:text-blue-500 flex items-center justify-center gap-1"
            >
              <ArrowLeft className="w-4 h-4" />
              Zurück zur Anmeldung
            </Link>
          </div>
        </form>
      </div>
    </div>
  )
}