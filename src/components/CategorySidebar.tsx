"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { ChevronRight, Filter } from "lucide-react"
import { useState, useEffect } from "react"

interface Category {
  id: string
  name: string
  description?: string
  itemCount?: number
}

export default function CategorySidebar() {
  const pathname = usePathname()
  const [categories, setCategories] = useState<Category[]>([])
  const [selectedCategory, setSelectedCategory] = useState<string>("")
  const [priceRange, setPriceRange] = useState({ min: "", max: "" })
  const [condition, setCondition] = useState<string[]>([])
  const [availability, setAvailability] = useState<string[]>(["available"])

  useEffect(() => {
    fetchCategories()
  }, [])

  useEffect(() => {
    // Extract category from pathname
    const match = pathname.match(/\/categories\/(.+)/)
    if (match) {
      setSelectedCategory(match[1])
    }
  }, [pathname])

  const fetchCategories = async () => {
    try {
      const response = await fetch("/api/categories")
      if (response.ok) {
        const data = await response.json()
        setCategories(data)
      }
    } catch (error) {
      console.error("Error fetching categories:", error)
    }
  }

  const handleConditionChange = (value: string) => {
    setCondition(prev => 
      prev.includes(value) 
        ? prev.filter(c => c !== value)
        : [...prev, value]
    )
  }

  const handleAvailabilityChange = (value: string) => {
    setAvailability(prev => 
      prev.includes(value) 
        ? prev.filter(a => a !== value)
        : [...prev, value]
    )
  }

  const applyFilters = () => {
    const params = new URLSearchParams()
    if (selectedCategory) params.append("category", selectedCategory)
    if (priceRange.min) params.append("minPrice", priceRange.min)
    if (priceRange.max) params.append("maxPrice", priceRange.max)
    if (condition.length > 0) params.append("condition", condition.join(","))
    if (availability.length > 0) params.append("availability", availability.join(","))
    
    window.location.href = `/items?${params.toString()}`
  }

  return (
    <aside className="w-64 bg-white border border-gray-200 rounded-lg p-4">
      {/* Categories Section */}
      <div className="mb-6">
        <h2 className="font-bold text-sm mb-3">Kategorien</h2>
        <nav>
          <Link 
            href="/items"
            className={`block py-2 px-3 text-sm rounded hover:bg-gray-100 ${
              pathname === "/items" && !selectedCategory ? "bg-gray-100 font-semibold" : ""
            }`}
          >
            Alle Kategorien
          </Link>
          {categories.map((category) => (
            <Link
              key={category.id}
              href={`/categories/${category.id}`}
              className={`block py-2 px-3 text-sm rounded hover:bg-gray-100 flex items-center justify-between group ${
                selectedCategory === category.id ? "bg-gray-100 font-semibold" : ""
              }`}
            >
              <span>{category.name}</span>
              <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-gray-600" />
            </Link>
          ))}
        </nav>
      </div>

      <div className="border-t border-gray-200 my-4"></div>

      {/* Filters Section */}
      <div className="space-y-6">
        <h2 className="font-bold text-sm flex items-center gap-2">
          <Filter className="w-4 h-4" />
          Filter
        </h2>

        {/* Price Range */}
        <div>
          <h3 className="font-semibold text-sm mb-2">Preis pro Tag</h3>
          <div className="flex items-center gap-2">
            <input
              type="number"
              placeholder="Min"
              value={priceRange.min}
              onChange={(e) => setPriceRange(prev => ({ ...prev, min: e.target.value }))}
              className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
            />
            <span className="text-gray-500">-</span>
            <input
              type="number"
              placeholder="Max"
              value={priceRange.max}
              onChange={(e) => setPriceRange(prev => ({ ...prev, max: e.target.value }))}
              className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
            />
          </div>
        </div>

        {/* Condition */}
        <div>
          <h3 className="font-semibold text-sm mb-2">Zustand</h3>
          <div className="space-y-2">
            {["NEU", "WIE_NEU", "GUT", "AKZEPTABEL"].map((cond) => (
              <label key={cond} className="flex items-center text-sm">
                <input
                  type="checkbox"
                  checked={condition.includes(cond)}
                  onChange={() => handleConditionChange(cond)}
                  className="mr-2"
                />
                <span>
                  {cond === "NEU" && "Neu"}
                  {cond === "WIE_NEU" && "Wie neu"}
                  {cond === "GUT" && "Gut"}
                  {cond === "AKZEPTABEL" && "Akzeptabel"}
                </span>
              </label>
            ))}
          </div>
        </div>

        {/* Availability */}
        <div>
          <h3 className="font-semibold text-sm mb-2">Verfügbarkeit</h3>
          <div className="space-y-2">
            <label className="flex items-center text-sm">
              <input
                type="checkbox"
                checked={availability.includes("available")}
                onChange={() => handleAvailabilityChange("available")}
                className="mr-2"
              />
              <span>Sofort verfügbar</span>
            </label>
            <label className="flex items-center text-sm">
              <input
                type="checkbox"
                checked={availability.includes("all")}
                onChange={() => handleAvailabilityChange("all")}
                className="mr-2"
              />
              <span>Alle anzeigen</span>
            </label>
          </div>
        </div>

        {/* Apply Filters Button */}
        <button
          onClick={applyFilters}
          className="w-full py-2 bg-[#3665f3] text-white font-semibold rounded hover:bg-[#1e49c7] transition-colors text-sm"
        >
          Filter anwenden
        </button>
      </div>
    </aside>
  )
}