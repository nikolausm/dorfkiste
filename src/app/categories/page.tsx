"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Loader2 } from "lucide-react"

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
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-center items-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Alle Kategorien</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {categories.map((category) => (
          <Link
            key={category.id}
            href={`/items?category=${category.id}`}
            className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow p-6 flex items-start gap-4"
          >
            <div className="text-4xl">{category.icon}</div>
            <div className="flex-1">
              <h2 className="text-xl font-semibold mb-2">{category.name}</h2>
              <p className="text-gray-600 text-sm mb-2">{category.description}</p>
              <p className="text-sm text-blue-600 font-medium">
                {category._count.items} {category._count.items === 1 ? "Artikel" : "Artikel"}
              </p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}