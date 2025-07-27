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
    deliveryAvailable: false,
    deliveryFee: "",
    deliveryRadius: "",
    deliveryDetails: "",
    pickupAvailable: true,
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
                deliveryAvailable: analysis.isHeavyEquipment || false,
                deliveryFee: analysis.suggestedDeliveryFee ? analysis.suggestedDeliveryFee.toString() : prev.deliveryFee,
                deliveryRadius: analysis.suggestedDeliveryRadius ? analysis.suggestedDeliveryRadius.toString() : prev.deliveryRadius,
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
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-2xl">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 sm:p-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-6 sm:mb-8">Neuen Artikel einstellen</h1>

          <form onSubmit={handleSubmit} className="space-y-6">
        {/* Image Upload */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Fotos hinzufügen
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
                    className="w-full h-32 object-cover rounded-xl shadow-sm border border-gray-200"
                  />
                  <button
                    type="button"
                    onClick={() => removeImage(index)}
                    className="absolute top-2 right-2 p-1.5 bg-white/90 backdrop-blur text-red-600 rounded-full opacity-0 group-hover:opacity-100 transition-all shadow-md hover:bg-white"
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
              className={`border-2 border-dashed rounded-xl p-8 sm:p-10 text-center cursor-pointer transition-all ${
                isDragActive
                  ? "border-blue-400 bg-blue-50"
                  : "border-gray-300 hover:border-gray-400 bg-white hover:bg-gray-50"
              }`}
            >
              <input {...getInputProps()} />
              {analyzing ? (
                <div className="space-y-2">
                  <Loader2 className="h-8 w-8 animate-spin mx-auto text-blue-500" />
                  <p className="text-sm text-gray-600">Analysiere Bild mit KI...</p>
                </div>
              ) : analysisSuccess ? (
                <div className="space-y-2">
                  <CheckCircle className="h-8 w-8 mx-auto text-green-600" />
                  <p className="text-sm text-green-600">KI-Analyse erfolgreich!</p>
                </div>
              ) : (
                <>
                  <div className="w-16 h-16 mx-auto mb-4 bg-blue-100 rounded-full flex items-center justify-center">
                    <Camera className="h-8 w-8 text-blue-600" />
                  </div>
                  <p className="text-gray-700 font-medium">
                    {isDragActive
                      ? "Lasse die Dateien hier fallen..."
                      : "Fotos hochladen"}
                  </p>
                  <p className="text-sm text-gray-500 mt-2">
                    <span className="sm:hidden">Tippe zum Hochladen</span>
                    <span className="hidden sm:inline">Klicke oder ziehe Bilder hierher</span>
                  </p>
                  <p className="text-xs text-gray-400 mt-1">Max. 5 Bilder • JPEG/PNG</p>
                </>
              )}
            </div>
          )}
        </div>

        {/* Title */}
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
            Titel <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            id="title"
            required
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 placeholder-gray-400 transition-colors"
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
            className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 placeholder-gray-400 transition-colors"
            placeholder="Beschreiben Sie den Artikel genauer (Zustand, Besonderheiten, Zubehör...)"
          />
        </div>

        {/* Category and Condition */}
        <div className="bg-white border border-gray-300 rounded-xl p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Details</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-2">
              Kategorie <span className="text-red-500">*</span>
            </label>
            <select
              id="category"
              required
              value={formData.categoryId}
              onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
              className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 placeholder-gray-400 transition-colors"
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
              Zustand <span className="text-red-500">*</span>
            </label>
            <select
              id="condition"
              required
              value={formData.condition}
              onChange={(e) => setFormData({ ...formData, condition: e.target.value })}
              className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 placeholder-gray-400 transition-colors"
            >
              <option value="neu">Neu</option>
              <option value="sehr gut">Sehr gut</option>
              <option value="gut">Gut</option>
              <option value="gebraucht">Gebraucht</option>
            </select>
          </div>
          </div>
        </div>

        {/* Pricing */}
        <div className="bg-white border border-gray-300 rounded-xl p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Preisgestaltung</h3>
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
              className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 placeholder-gray-400 transition-colors"
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
              className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 placeholder-gray-400 transition-colors"
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
              className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 placeholder-gray-400 transition-colors"
              placeholder="50.00"
            />
          </div>
          </div>
        </div>

        {/* Delivery Options */}
        <div className="bg-white border border-gray-300 rounded-xl p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Liefer- & Abholoptionen</h3>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <label className="flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.pickupAvailable}
                  onChange={(e) => setFormData({ ...formData, pickupAvailable: e.target.checked })}
                  className="mr-3 h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                />
                <span className="text-gray-700">Selbstabholung möglich</span>
              </label>
            </div>

            <div className="flex items-center justify-between">
              <label className="flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.deliveryAvailable}
                  onChange={(e) => setFormData({ ...formData, deliveryAvailable: e.target.checked })}
                  className="mr-3 h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                />
                <span className="text-gray-700">Lieferung anbieten</span>
              </label>
            </div>

            {formData.deliveryAvailable && (
              <div className="pl-7 space-y-4 mt-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="deliveryFee" className="block text-sm font-medium text-gray-700 mb-2">
                      Lieferpauschale (€)
                    </label>
                    <input
                      type="number"
                      id="deliveryFee"
                      step="0.01"
                      min="0"
                      value={formData.deliveryFee}
                      onChange={(e) => setFormData({ ...formData, deliveryFee: e.target.value })}
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 placeholder-gray-400 transition-colors"
                      placeholder="50.00"
                    />
                  </div>

                  <div>
                    <label htmlFor="deliveryRadius" className="block text-sm font-medium text-gray-700 mb-2">
                      Lieferradius (km)
                    </label>
                    <input
                      type="number"
                      id="deliveryRadius"
                      step="1"
                      min="0"
                      value={formData.deliveryRadius}
                      onChange={(e) => setFormData({ ...formData, deliveryRadius: e.target.value })}
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 placeholder-gray-400 transition-colors"
                      placeholder="20"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="deliveryDetails" className="block text-sm font-medium text-gray-700 mb-2">
                    Lieferdetails
                  </label>
                  <textarea
                    id="deliveryDetails"
                    rows={3}
                    value={formData.deliveryDetails}
                    onChange={(e) => setFormData({ ...formData, deliveryDetails: e.target.value })}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 placeholder-gray-400 transition-colors"
                    placeholder="z.B. Lieferung inkl. Auf- und Abladen, nur werktags möglich..."
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Location */}
        <div>
          <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-2">
            Standort <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <input
              type="text"
              id="location"
              required
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 placeholder-gray-400 transition-colors"
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
            className="flex-1 bg-blue-600 text-white py-3 px-6 rounded-xl font-medium hover:bg-blue-700 transition-all hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base border border-blue-600"
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
            className="px-4 sm:px-6 py-3 bg-white border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors text-gray-700 font-medium text-sm sm:text-base"
          >
            Abbrechen
          </button>
        </div>
          </form>
        </div>
      </div>
    </div>
  )
}