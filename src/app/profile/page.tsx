"use client"

import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { Camera, Save, Star, Package, Calendar, Shield, Edit2, Loader2 } from "lucide-react"
import { format } from "date-fns"
import { de } from "date-fns/locale"

export default function ProfilePage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [uploadingAvatar, setUploadingAvatar] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    bio: "",
    avatarUrl: "",
  })

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/signin")
    } else if (session?.user?.id) {
      fetchUserProfile()
    }
  }, [session, status])

  const fetchUserProfile = async () => {
    try {
      const response = await fetch(`/api/users/${session!.user.id}`)
      if (response.ok) {
        const data = await response.json()
        setUser(data)
        setFormData({
          name: data.name || "",
          bio: data.bio || "",
          avatarUrl: data.avatarUrl || "",
        })
      }
    } catch (error) {
      console.error("Error fetching profile:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploadingAvatar(true)
    try {
      const formData = new FormData()
      formData.append("file", file)

      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      })

      if (response.ok) {
        const { url } = await response.json()
        setFormData((prev) => ({ ...prev, avatarUrl: url }))
      }
    } catch (error) {
      console.error("Error uploading avatar:", error)
    } finally {
      setUploadingAvatar(false)
    }
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      const response = await fetch(`/api/users/${session!.user.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        const updatedUser = await response.json()
        setUser({ ...user, ...updatedUser })
        setEditing(false)
      }
    } catch (error) {
      console.error("Error updating profile:", error)
    } finally {
      setSaving(false)
    }
  }

  if (status === "loading" || loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-center items-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        </div>
      </div>
    )
  }

  if (!user) return null

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
        <div className="flex items-start justify-between mb-6">
          <h1 className="text-2xl font-bold">Mein Profil</h1>
          {!editing && (
            <button
              onClick={() => setEditing(true)}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
            >
              <Edit2 className="h-4 w-4" />
              Bearbeiten
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Avatar and Basic Info */}
          <div className="text-center">
            <div className="relative inline-block">
              {formData.avatarUrl ? (
                <Image
                  src={formData.avatarUrl}
                  alt={formData.name}
                  width={120}
                  height={120}
                  className="rounded-full"
                />
              ) : (
                <div className="w-[120px] h-[120px] bg-gray-300 rounded-full flex items-center justify-center">
                  <Camera className="h-12 w-12 text-gray-600" />
                </div>
              )}
              {editing && (
                <label className="absolute bottom-0 right-0 p-2 bg-blue-600 text-white rounded-full cursor-pointer hover:bg-blue-700 transition-colors">
                  <Camera className="h-4 w-4" />
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarUpload}
                    className="hidden"
                    disabled={uploadingAvatar}
                  />
                </label>
              )}
            </div>
            
            {user.verified && (
              <div className="mt-3 inline-flex items-center gap-1 text-green-600 text-sm">
                <Shield className="h-4 w-4" />
                Verifiziert
              </div>
            )}

            <p className="mt-2 text-sm text-gray-600">
              Mitglied seit {format(new Date(user.createdAt), "MMMM yyyy", { locale: de })}
            </p>
          </div>

          {/* Profile Details */}
          <div className="md:col-span-2 space-y-4">
            {editing ? (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Name
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Über mich
                  </label>
                  <textarea
                    rows={4}
                    value={formData.bio}
                    onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Erzähle etwas über dich..."
                  />
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={handleSave}
                    disabled={saving || uploadingAvatar}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                  >
                    <Save className="h-4 w-4" />
                    {saving ? "Wird gespeichert..." : "Speichern"}
                  </button>
                  <button
                    onClick={() => {
                      setEditing(false)
                      setFormData({
                        name: user.name || "",
                        bio: user.bio || "",
                        avatarUrl: user.avatarUrl || "",
                      })
                    }}
                    className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    Abbrechen
                  </button>
                </div>
              </>
            ) : (
              <>
                <div>
                  <h2 className="text-xl font-semibold">{user.name || "Kein Name"}</h2>
                  <p className="text-gray-600">{session?.user?.email}</p>
                </div>
                {user.bio && (
                  <div>
                    <h3 className="font-medium text-gray-700 mb-1">Über mich</h3>
                    <p className="text-gray-600 whitespace-pre-wrap">{user.bio}</p>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white rounded-lg shadow-sm p-4 text-center">
          <Package className="h-8 w-8 text-blue-600 mx-auto mb-2" />
          <p className="text-2xl font-bold">{user._count.items}</p>
          <p className="text-sm text-gray-600">Artikel</p>
        </div>
        <div className="bg-white rounded-lg shadow-sm p-4 text-center">
          <Calendar className="h-8 w-8 text-green-600 mx-auto mb-2" />
          <p className="text-2xl font-bold">{user._count.rentalsAsOwner}</p>
          <p className="text-sm text-gray-600">Vermietungen</p>
        </div>
        <div className="bg-white rounded-lg shadow-sm p-4 text-center">
          <Star className="h-8 w-8 text-yellow-500 mx-auto mb-2" />
          <p className="text-2xl font-bold">
            {user.avgRating ? user.avgRating.toFixed(1) : "-"}
          </p>
          <p className="text-sm text-gray-600">Bewertung</p>
        </div>
        <div className="bg-white rounded-lg shadow-sm p-4 text-center">
          <Shield className="h-8 w-8 text-purple-600 mx-auto mb-2" />
          <p className="text-2xl font-bold">{user.totalReviews}</p>
          <p className="text-sm text-gray-600">Bewertungen</p>
        </div>
      </div>
    </div>
  )
}