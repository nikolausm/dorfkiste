"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Loader2, ChevronRight } from "lucide-react"

export default function CategoriesPage() {
  const [categories, setCategories] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchCategories()
  }, [])

  const fetchCategories = async () => {
    try {
      const response = await fetch("/api/categories")
      if (response.ok) {
        const data = await response.json()
        setCategories(data)
      }
    } catch (error) {
      console.error("Error fetching categories:", error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="max-w-[1280px] mx-auto px-4 py-4">
        <div className="flex justify-center items-center py-12 bg-white rounded-lg">
          <Loader2 className="h-8 w-8 animate-spin text-[#3665f3]" />
        </div>
      </div>
    )
  }

  // Predefined category data with emojis and colors
  const categoryEnhancements: Record<string, { icon: string, color: string }> = {
    elektronik: { icon: "📱", color: "bg-purple-50" },
    werkzeuge: { icon: "🔧", color: "bg-blue-50" },
    sport: { icon: "⚽", color: "bg-green-50" },
    haushalt: { icon: "🏠", color: "bg-yellow-50" },
    garten: { icon: "🌱", color: "bg-emerald-50" },
    fahrzeuge: { icon: "🚗", color: "bg-red-50" },
    medien: { icon: "📚", color: "bg-indigo-50" },
    sonstiges: { icon: "📦", color: "bg-gray-50" }
  }

  return (
    <div className="max-w-[1280px] mx-auto px-4 py-4">
      {/* Breadcrumb */}
      <nav className="text-sm mb-4">
        <ol className="flex items-center space-x-2 text-gray-600">
          <li><a href="/" className="hover:text-blue-600">Startseite</a></li>
          <li className="before:content-['>'] before:mx-2">
            <span className="text-gray-900">Alle Kategorien</span>
          </li>
        </ol>
      </nav>

      {/* Page Title */}
      <div className="bg-white border border-gray-200 rounded-lg p-6 mb-6">
        <h1 className="text-3xl font-bold mb-2">Alle Kategorien</h1>
        <p className="text-gray-600">Entdecke Artikel in verschiedenen Kategorien</p>
      </div>
      
      {/* Categories Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {categories.map((category) => {
          const enhancement = categoryEnhancements[category.id] || { icon: "📦", color: "bg-gray-50" }
          
          return (
            <Link
              key={category.id}
              href={`/categories/${category.id}`}
              className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-lg transition-shadow group"
            >
              <div className="flex items-start gap-4">
                <div className={`p-4 rounded-full ${enhancement.color} group-hover:scale-110 transition-transform`}>
                  <span className="text-3xl">{category.icon || enhancement.icon}</span>
                </div>
                <div className="flex-1">
                  <h2 className="text-xl font-semibold text-gray-900 mb-2 group-hover:text-[#3665f3] transition-colors">
                    {category.name}
                  </h2>
                  <p className="text-gray-600 text-sm mb-3">
                    {category.description}
                  </p>
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-[#3665f3]">
                      {category._count?.items || 0} Artikel
                    </p>
                    <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-[#3665f3] transition-colors" />
                  </div>
                </div>
              </div>
            </Link>
          )
        })}
      </div>

      {/* Additional CTA */}
      <div className="mt-12 bg-gradient-to-r from-[#3665f3] to-[#1e49c7] rounded-lg p-8 text-white text-center">
        <h2 className="text-2xl font-bold mb-4">Nichts Passendes gefunden?</h2>
        <p className="mb-6">Stelle eine Suchanfrage oder erstelle einen eigenen Artikel</p>
        <div className="flex gap-4 justify-center">
          <Link
            href="/items"
            className="bg-white text-[#3665f3] px-6 py-3 rounded font-semibold hover:bg-gray-100 transition-colors"
          >
            Alle Artikel durchsuchen
          </Link>
          <Link
            href="/items/new"
            className="bg-transparent border-2 border-white text-white px-6 py-3 rounded font-semibold hover:bg-white hover:text-[#3665f3] transition-colors"
          >
            Artikel einstellen
          </Link>
        </div>
      </div>
    </div>
  )
}