"use client"

import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { 
  DollarSign, Percent, CreditCard, Users, Package, 
  TrendingUp, Settings, Save, AlertCircle, CheckCircle,
  Loader2, Euro, Building, Shield
} from "lucide-react"

interface PlatformSettings {
  id: string
  platformFeePercentage: number
  stripeSecretKey?: string | null
  stripePublishableKey?: string | null
  stripeWebhookSecret?: string | null
  paypalClientId?: string | null
  paypalClientSecret?: string | null
  paypalMode: string
}

interface DashboardStats {
  totalUsers: number
  totalItems: number
  totalRentals: number
  totalRevenue: number
  platformEarnings: number
  pendingPayouts: number
}

export default function AdminDashboard() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)
  const [settings, setSettings] = useState<PlatformSettings | null>(null)
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [error, setError] = useState("")

  useEffect(() => {
    if (status === "loading") return
    
    if (!session?.user) {
      router.push("/auth/signin")
      return
    }

    checkAdminAccess()
  }, [session, status])

  const checkAdminAccess = async () => {
    try {
      const response = await fetch("/api/admin/check")
      if (!response.ok) {
        router.push("/")
        return
      }
      
      await Promise.all([fetchSettings(), fetchStats()])
    } catch (error) {
      console.error("Error checking admin access:", error)
      router.push("/")
    }
  }

  const fetchSettings = async () => {
    try {
      const response = await fetch("/api/admin/settings")
      if (response.ok) {
        const data = await response.json()
        setSettings(data)
      }
    } catch (error) {
      console.error("Error fetching settings:", error)
      setError("Fehler beim Laden der Einstellungen")
    } finally {
      setLoading(false)
    }
  }

  const fetchStats = async () => {
    try {
      const response = await fetch("/api/admin/stats")
      if (response.ok) {
        const data = await response.json()
        setStats(data)
      }
    } catch (error) {
      console.error("Error fetching stats:", error)
    }
  }

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!settings) return

    setSaving(true)
    setError("")

    try {
      const response = await fetch("/api/admin/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
      })

      if (response.ok) {
        setShowSuccess(true)
        setTimeout(() => setShowSuccess(false), 3000)
      } else {
        const error = await response.json()
        setError(error.error || "Fehler beim Speichern")
      }
    } catch (error) {
      console.error("Error saving settings:", error)
      setError("Ein Fehler ist aufgetreten")
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="max-w-[1280px] mx-auto px-4 py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <Loader2 className="h-8 w-8 animate-spin text-[#3665f3]" />
        </div>
      </div>
    )
  }

  if (!settings) {
    return (
      <div className="max-w-[1280px] mx-auto px-4 py-8">
        <div className="bg-red-50 text-red-600 p-4 rounded-lg">
          Fehler beim Laden der Admin-Einstellungen
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-[1280px] mx-auto px-4 py-8">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Shield className="h-8 w-8 text-[#3665f3]" />
            <div>
              <h1 className="text-3xl font-bold">Admin Dashboard</h1>
              <p className="text-gray-600 mt-1">Plattform-Verwaltung und Einstellungen</p>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Benutzer</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalUsers}</p>
              </div>
              <Users className="h-8 w-8 text-gray-400" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Artikel</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalItems}</p>
              </div>
              <Package className="h-8 w-8 text-gray-400" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Vermietungen</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalRentals}</p>
              </div>
              <TrendingUp className="h-8 w-8 text-gray-400" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Gesamtumsatz</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalRevenue.toFixed(2)}€</p>
              </div>
              <Euro className="h-8 w-8 text-gray-400" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Plattform-Einnahmen</p>
                <p className="text-2xl font-bold text-green-600">{stats.platformEarnings.toFixed(2)}€</p>
              </div>
              <DollarSign className="h-8 w-8 text-green-600" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Ausstehende Auszahlungen</p>
                <p className="text-2xl font-bold text-orange-600">{stats.pendingPayouts.toFixed(2)}€</p>
              </div>
              <CreditCard className="h-8 w-8 text-orange-600" />
            </div>
          </div>
        </div>
      )}

      {/* Settings Form */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex items-center gap-2 mb-6">
          <Settings className="h-6 w-6 text-gray-600" />
          <h2 className="text-xl font-bold">Plattform-Einstellungen</h2>
        </div>

        <form onSubmit={handleSaveSettings}>
          {/* Platform Fee */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Percent className="h-5 w-5 text-gray-600" />
              Gebühren-Einstellungen
            </h3>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Plattform-Gebühr (%)
                </label>
                <input
                  type="number"
                  min="0"
                  max="50"
                  step="0.1"
                  value={settings.platformFeePercentage}
                  onChange={(e) => setSettings({
                    ...settings,
                    platformFeePercentage: parseFloat(e.target.value) || 0
                  })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3665f3]"
                  required
                />
                <p className="text-sm text-gray-500 mt-1">
                  Diese Gebühr wird bei jeder Vermietung erhoben
                </p>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-sm font-medium text-gray-700 mb-2">Beispielrechnung:</p>
                <div className="text-sm text-gray-600 space-y-1">
                  <p>Mietpreis: 100€</p>
                  <p>Plattform-Gebühr ({settings.platformFeePercentage}%): {(100 * settings.platformFeePercentage / 100).toFixed(2)}€</p>
                  <p className="font-semibold text-gray-900 pt-1 border-t">
                    Auszahlung an Vermieter: {(100 - (100 * settings.platformFeePercentage / 100)).toFixed(2)}€
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Stripe Settings */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <CreditCard className="h-5 w-5 text-gray-600" />
              Stripe-Einstellungen
            </h3>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Secret Key
                </label>
                <input
                  type="password"
                  value={settings.stripeSecretKey || ""}
                  onChange={(e) => setSettings({
                    ...settings,
                    stripeSecretKey: e.target.value
                  })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3665f3]"
                  placeholder="sk_..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Publishable Key
                </label>
                <input
                  type="text"
                  value={settings.stripePublishableKey || ""}
                  onChange={(e) => setSettings({
                    ...settings,
                    stripePublishableKey: e.target.value
                  })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3665f3]"
                  placeholder="pk_..."
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Webhook Secret
                </label>
                <input
                  type="password"
                  value={settings.stripeWebhookSecret || ""}
                  onChange={(e) => setSettings({
                    ...settings,
                    stripeWebhookSecret: e.target.value
                  })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3665f3]"
                  placeholder="whsec_..."
                />
              </div>
            </div>
          </div>

          {/* PayPal Settings */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Building className="h-5 w-5 text-gray-600" />
              PayPal-Einstellungen
            </h3>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Client ID
                </label>
                <input
                  type="text"
                  value={settings.paypalClientId || ""}
                  onChange={(e) => setSettings({
                    ...settings,
                    paypalClientId: e.target.value
                  })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3665f3]"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Client Secret
                </label>
                <input
                  type="password"
                  value={settings.paypalClientSecret || ""}
                  onChange={(e) => setSettings({
                    ...settings,
                    paypalClientSecret: e.target.value
                  })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3665f3]"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Modus
                </label>
                <select
                  value={settings.paypalMode}
                  onChange={(e) => setSettings({
                    ...settings,
                    paypalMode: e.target.value
                  })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3665f3]"
                >
                  <option value="sandbox">Sandbox (Test)</option>
                  <option value="live">Live (Produktion)</option>
                </select>
              </div>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 text-red-600 rounded-lg flex items-center gap-2">
              <AlertCircle className="h-5 w-5" />
              {error}
            </div>
          )}

          {/* Success Message */}
          {showSuccess && (
            <div className="mb-6 p-4 bg-green-50 text-green-600 rounded-lg flex items-center gap-2">
              <CheckCircle className="h-5 w-5" />
              Einstellungen erfolgreich gespeichert!
            </div>
          )}

          {/* Submit Button */}
          <div className="flex items-center justify-end gap-4">
            <button
              type="button"
              onClick={() => router.push("/")}
              className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Abbrechen
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-2 bg-[#3665f3] text-white rounded-lg hover:bg-[#1e49c7] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {saving ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Wird gespeichert...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4" />
                  Einstellungen speichern
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}