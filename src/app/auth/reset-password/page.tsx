"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { Eye, EyeOff, Lock, CheckCircle, X } from "lucide-react"

export default function ResetPasswordPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const token = searchParams.get("token")
  
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState("")
  const [tokenValid, setTokenValid] = useState<boolean | null>(null)
  const [checkingToken, setCheckingToken] = useState(true)

  // Verify token on mount
  useEffect(() => {
    if (!token) {
      setError("Kein Reset-Token gefunden")
      setCheckingToken(false)
      return
    }

    const verifyToken = async () => {
      try {
        const response = await fetch(`/api/auth/reset-password?token=${token}`)
        const data = await response.json()
        
        if (data.valid) {
          setTokenValid(true)
        } else {
          setTokenValid(false)
          setError(data.error || "Ungültiger oder abgelaufener Reset-Link")
        }
      } catch (error) {
        setTokenValid(false)
        setError("Fehler bei der Überprüfung des Links")
      } finally {
        setCheckingToken(false)
      }
    }

    verifyToken()
  }, [token])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    // Validate passwords
    if (password.length < 6) {
      setError("Das Passwort muss mindestens 6 Zeichen lang sein")
      return
    }

    if (password !== confirmPassword) {
      setError("Die Passwörter stimmen nicht überein")
      return
    }

    setLoading(true)

    try {
      const response = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password })
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error || "Ein Fehler ist aufgetreten")
      } else {
        setSuccess(true)
        // Redirect to login after 3 seconds
        setTimeout(() => {
          router.push("/auth/signin")
        }, 3000)
      }
    } catch (error) {
      setError("Ein Fehler ist aufgetreten. Bitte versuchen Sie es später erneut.")
    } finally {
      setLoading(false)
    }
  }

  // Password strength indicators
  const passwordStrength = {
    hasMinLength: password.length >= 6,
    hasNumber: /\d/.test(password),
    hasSpecial: /[!@#$%^&*]/.test(password),
    hasUpperCase: /[A-Z]/.test(password),
    hasLowerCase: /[a-z]/.test(password)
  }

  const strengthScore = Object.values(passwordStrength).filter(Boolean).length
  const strengthLabel = 
    strengthScore <= 2 ? "Schwach" :
    strengthScore <= 3 ? "Mittel" :
    strengthScore <= 4 ? "Gut" : "Stark"
  const strengthColor = 
    strengthScore <= 2 ? "bg-red-500" :
    strengthScore <= 3 ? "bg-yellow-500" :
    strengthScore <= 4 ? "bg-blue-500" : "bg-green-500"

  if (checkingToken) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Link wird überprüft...</p>
        </div>
      </div>
    )
  }

  if (!tokenValid) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <div className="bg-white p-8 rounded-lg shadow-sm">
            <div className="flex justify-center mb-6">
              <div className="p-3 bg-red-100 rounded-full">
                <X className="w-8 h-8 text-red-600" />
              </div>
            </div>
            
            <h2 className="text-center text-2xl font-bold text-gray-900 mb-4">
              Ungültiger Reset-Link
            </h2>
            
            <p className="text-center text-gray-600 mb-6">
              {error || "Der Reset-Link ist ungültig oder abgelaufen."}
            </p>
            
            <Link
              href="/auth/forgot-password"
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Neuen Reset-Link anfordern
            </Link>
          </div>
        </div>
      </div>
    )
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <div className="bg-white p-8 rounded-lg shadow-sm">
            <div className="flex justify-center mb-6">
              <div className="p-3 bg-green-100 rounded-full">
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
            </div>
            
            <h2 className="text-center text-2xl font-bold text-gray-900 mb-4">
              Passwort erfolgreich zurückgesetzt!
            </h2>
            
            <p className="text-center text-gray-600 mb-6">
              Sie können sich jetzt mit Ihrem neuen Passwort anmelden.
            </p>
            
            <p className="text-center text-sm text-gray-500">
              Sie werden in wenigen Sekunden zur Anmeldeseite weitergeleitet...
            </p>
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
            Neues Passwort festlegen
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Geben Sie Ihr neues Passwort ein
          </p>
        </div>
        
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md text-sm">
              {error}
            </div>
          )}
          
          <div className="space-y-4">
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Neues Passwort
              </label>
              <div className="mt-1 relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="new-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="appearance-none block w-full px-3 py-2 pr-10 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5 text-gray-400" />
                  ) : (
                    <Eye className="h-5 w-5 text-gray-400" />
                  )}
                </button>
              </div>
              
              {password && (
                <div className="mt-2">
                  <div className="flex items-center gap-2 mb-1">
                    <div className="flex-1 bg-gray-200 rounded-full h-2">
                      <div 
                        className={`h-full rounded-full transition-all ${strengthColor}`}
                        style={{ width: `${(strengthScore / 5) * 100}%` }}
                      />
                    </div>
                    <span className="text-xs text-gray-600">{strengthLabel}</span>
                  </div>
                  <ul className="text-xs text-gray-600 space-y-1">
                    <li className={passwordStrength.hasMinLength ? "text-green-600" : ""}>
                      {passwordStrength.hasMinLength ? "✓" : "○"} Mindestens 6 Zeichen
                    </li>
                    <li className={passwordStrength.hasNumber ? "text-green-600" : ""}>
                      {passwordStrength.hasNumber ? "✓" : "○"} Enthält eine Zahl
                    </li>
                    <li className={passwordStrength.hasSpecial ? "text-green-600" : ""}>
                      {passwordStrength.hasSpecial ? "✓" : "○"} Enthält ein Sonderzeichen
                    </li>
                  </ul>
                </div>
              )}
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                Passwort bestätigen
              </label>
              <div className="mt-1 relative">
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  autoComplete="new-password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="appearance-none block w-full px-3 py-2 pr-10 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                >
                  {showConfirmPassword ? (
                    <EyeOff className="h-5 w-5 text-gray-400" />
                  ) : (
                    <Eye className="h-5 w-5 text-gray-400" />
                  )}
                </button>
              </div>
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading || !passwordStrength.hasMinLength}
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Wird zurückgesetzt..." : "Passwort zurücksetzen"}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}