"use client"

import { useState, useCallback, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import { useDropzone } from "react-dropzone"
import { Camera, X, Upload, Loader2, CheckCircle } from "lucide-react"
import Image from "next/image"

export default function NewItemPage() {
  const router = useRouter()
  const { data: session } = useSession()
  const [loading, setLoading] = useState(false)
  const [analyzing, setAnalyzing] = useState(false)
  const [locationLoading, setLocationLoading] = useState(false)
  const [images, setImages] = useState<string[]>([])
  const [categories, setCategories] = useState<any[]>([])
  const [analysisSuccess, setAnalysisSuccess] = useState(false)
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    categoryId: "",
    condition: "gut",
    pricePerDay: "",
    pricePerHour: "",
    deposit: "",
    location: "",
  })

  // Fetch categories on mount
  useEffect(() => {
    fetch("/api/categories")
      .then((res) => res.json())
      .then(setCategories)
      .catch(console.error)
  }, [])

  // Get user location on mount
  useEffect(() => {
    if ("geolocation" in navigator) {
      setLocationLoading(true)
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords
          try {
            // Use reverse geocoding to get address
            const response = await fetch(
              `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`
            )
            if (response.ok) {
              const data = await response.json()
              const city = data.address?.city || data.address?.town || data.address?.village
              const postcode = data.address?.postcode
              const location = city && postcode ? `${city} ${postcode}` : city || postcode || ""
              if (location) {
                setFormData((prev) => ({ ...prev, location }))
              }
            }
          } catch (error) {
            console.error("Error getting location:", error)
          } finally {
            setLocationLoading(false)
          }
        },
        (error) => {
          console.log("Geolocation permission denied or error:", error)
          setLocationLoading(false)
        },
        { enableHighAccuracy: false, timeout: 5000, maximumAge: 0 }
      )
    }
  }, [])

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    for (const file of acceptedFiles) {
      setAnalyzing(true)
      try {
        // Upload image
        const formData = new FormData()
        formData.append("file", file)
        
        const uploadRes = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        })
        
        if (!uploadRes.ok) throw new Error("Upload failed")
        
        const { url } = await uploadRes.json()
        setImages((prev) => [...prev, url])
        
        // Analyze image with AI if it's the first image
        if (images.length === 0) {
          const analyzeRes = await fetch("/api/analyze-image", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ imageUrl: url }),
          })
          
          if (analyzeRes.ok) {
            const analysis = await analyzeRes.json()
            console.log("AI Analysis Response:", analysis)
            
            // Update form data with analysis results
            setFormData((prev) => {
              const updates = {
                ...prev,
                title: analysis.title || prev.title,
                description: analysis.description || prev.description,
                categoryId: analysis.categoryId || prev.categoryId,
                condition: analysis.condition || prev.condition,
                pricePerDay: analysis.suggestedPricePerDay ? analysis.suggestedPricePerDay.toString() : prev.pricePerDay,
                pricePerHour: analysis.suggestedPricePerHour ? analysis.suggestedPricePerHour.toString() : prev.pricePerHour,
                deposit: analysis.deposit ? analysis.deposit.toString() : prev.deposit,
              }
              console.log("Form data updates:", updates)
              return updates
            })
            
            // Show success feedback
            setAnalysisSuccess(true)
            setTimeout(() => setAnalysisSuccess(false), 3000)
          } else {
            console.error("AI analysis failed with status:", analyzeRes.status)
          }
        }
      } catch (error) {
        console.error("Error processing image:", error)
      } finally {
        setAnalyzing(false)
      }
    }
  }, [images.length])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "image/*": [".jpeg", ".jpg", ".png", ".webp"],
    },
    maxFiles: 5,
    multiple: true,
  })

  const removeImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!session) {
      router.push("/auth/signin")
      return
    }

    setLoading(true)
    try {
      const response = await fetch("/api/items", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          imageUrls: images,
        }),
      })

      if (response.ok) {
        const item = await response.json()
        router.push(`/items/${item.id}`)
      } else {
        alert("Fehler beim Erstellen des Artikels")
      }
    } catch (error) {
      console.error("Error creating item:", error)
      alert("Ein Fehler ist aufgetreten")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container mx-auto px-4 py-4 sm:py-8 max-w-2xl">
      <h1 className="text-2xl sm:text-3xl font-bold mb-6 sm:mb-8">Neuen Artikel einstellen</h1>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Image Upload */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Fotos
          </label>
          
          {images.length > 0 && (
            <div className="grid grid-cols-3 gap-2 sm:gap-4 mb-4">
              {images.map((url, index) => (
                <div key={index} className="relative group">
                  <Image
                    src={url}
                    alt={`Bild ${index + 1}`}
                    width={200}
                    height={200}
                    className="w-full h-32 object-cover rounded-lg"
                  />
                  <button
                    type="button"
                    onClick={() => removeImage(index)}
                    className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          )}

          {images.length < 5 && (
            <div
              {...getRootProps()}
              className={`border-2 border-dashed rounded-lg p-6 sm:p-8 text-center cursor-pointer transition-colors ${
                isDragActive
                  ? "border-blue-500 bg-blue-50"
                  : "border-gray-300 hover:border-gray-400"
              }`}
            >
              <input {...getInputProps()} capture="environment" />
              {analyzing ? (
                <div className="space-y-2">
                  <Loader2 className="h-8 w-8 animate-spin mx-auto text-blue-600" />
                  <p className="text-sm text-gray-600">Analysiere Bild mit KI...</p>
                </div>
              ) : analysisSuccess ? (
                <div className="space-y-2">
                  <CheckCircle className="h-8 w-8 mx-auto text-green-600" />
                  <p className="text-sm text-green-600">KI-Analyse erfolgreich!</p>
                </div>
              ) : (
                <>
                  <Camera className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                  <p className="text-gray-600">
                    {isDragActive
                      ? "Lasse die Dateien hier fallen..."
                      : "Foto aufnehmen oder auswählen"}
                  </p>
                  <p className="text-sm text-gray-500 mt-2">
                    <span className="sm:hidden">Tippe für Kamera</span>
                    <span className="hidden sm:inline">Max. 5 Bilder, JPEG/PNG</span>
                  </p>
                </>
              )}
            </div>
          )}
        </div>

        {/* Title */}
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
            Titel *
          </label>
          <input
            type="text"
            id="title"
            required
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="z.B. Bohrmaschine Bosch Professional"
          />
        </div>

        {/* Description */}
        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
            Beschreibung
          </label>
          <textarea
            id="description"
            rows={4}
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Weitere Details zum Artikel..."
          />
        </div>

        {/* Category and Condition */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-2">
              Kategorie *
            </label>
            <select
              id="category"
              required
              value={formData.categoryId}
              onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Bitte wählen</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.icon} {cat.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="condition" className="block text-sm font-medium text-gray-700 mb-2">
              Zustand *
            </label>
            <select
              id="condition"
              required
              value={formData.condition}
              onChange={(e) => setFormData({ ...formData, condition: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="neu">Neu</option>
              <option value="sehr gut">Sehr gut</option>
              <option value="gut">Gut</option>
              <option value="gebraucht">Gebraucht</option>
            </select>
          </div>
        </div>

        {/* Pricing */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label htmlFor="pricePerDay" className="block text-sm font-medium text-gray-700 mb-2">
              Preis pro Tag (€)
            </label>
            <input
              type="number"
              id="pricePerDay"
              step="0.01"
              min="0"
              value={formData.pricePerDay}
              onChange={(e) => setFormData({ ...formData, pricePerDay: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="10.00"
            />
          </div>

          <div>
            <label htmlFor="pricePerHour" className="block text-sm font-medium text-gray-700 mb-2">
              Preis pro Stunde (€)
            </label>
            <input
              type="number"
              id="pricePerHour"
              step="0.01"
              min="0"
              value={formData.pricePerHour}
              onChange={(e) => setFormData({ ...formData, pricePerHour: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="2.50"
            />
          </div>

          <div>
            <label htmlFor="deposit" className="block text-sm font-medium text-gray-700 mb-2">
              Kaution (€)
            </label>
            <input
              type="number"
              id="deposit"
              step="0.01"
              min="0"
              value={formData.deposit}
              onChange={(e) => setFormData({ ...formData, deposit: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="50.00"
            />
          </div>
        </div>

        {/* Location */}
        <div>
          <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-2">
            Standort *
          </label>
          <div className="relative">
            <input
              type="text"
              id="location"
              required
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder={locationLoading ? "Standort wird ermittelt..." : "z.B. Berlin Mitte oder 10115"}
              disabled={locationLoading}
            />
            {locationLoading && (
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                <Loader2 className="h-5 w-5 animate-spin text-gray-400" />
              </div>
            )}
          </div>
        </div>

        {/* Submit */}
        <div className="flex gap-4">
          <button
            type="submit"
            disabled={loading || images.length === 0}
            className="flex-1 bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base"
          >
            {loading ? (
              <span className="flex items-center justify-center">
                <Loader2 className="animate-spin h-5 w-5 mr-2" />
                Wird erstellt...
              </span>
            ) : (
              "Artikel einstellen"
            )}
          </button>
          <button
            type="button"
            onClick={() => router.back()}
            className="px-4 sm:px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm sm:text-base"
          >
            Abbrechen
          </button>
        </div>
      </form>
    </div>
  )
}