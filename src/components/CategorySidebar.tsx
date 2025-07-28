"use client"

import Link from "next/link"
import { usePathname, useSearchParams, useRouter } from "next/navigation"
import { ChevronRight, Filter } from "lucide-react"
import { useState, useEffect, useCallback } from "react"

interface Category {
  id: string
  name: string
  description?: string
  itemCount?: number
}

export default function CategorySidebar() {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const router = useRouter()
  const [categories, setCategories] = useState<Category[]>([])
  const [selectedCategory, setSelectedCategory] = useState<string>("")
  const [priceRange, setPriceRange] = useState({ min: "", max: "" })
  const [condition, setCondition] = useState<string[]>([])
  const [availability, setAvailability] = useState<string[]>(["available"])

  useEffect(() => {
    fetchCategories()
  }, [])

  // Initialize filters from URL parameters
  useEffect(() => {
    const category = searchParams.get("category") || ""
    const minPrice = searchParams.get("minPrice") || ""
    const maxPrice = searchParams.get("maxPrice") || ""
    const conditionParam = searchParams.get("condition")
    const availabilityParam = searchParams.get("availability")
    
    setSelectedCategory(category)
    setPriceRange({ min: minPrice, max: maxPrice })
    
    if (conditionParam) {
      setCondition(conditionParam.split(","))
    }
    
    if (availabilityParam) {
      setAvailability(availabilityParam.split(","))
    }
  }, [searchParams])

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

  // Helper function to build URL with filters
  const buildFilterUrl = useCallback((categoryId?: string, categoryName?: string) => {
    const params = new URLSearchParams()
    
    // Preserve existing search parameter
    const currentSearch = searchParams.get("search")
    if (currentSearch) {
      params.append("search", currentSearch)
    }
    
    // Add category if provided
    if (categoryId) {
      params.append("category", categoryId)
      if (categoryName) {
        params.append("categoryName", categoryName)
      }
    }
    
    // Add other active filters
    if (priceRange.min) params.append("minPrice", priceRange.min)
    if (priceRange.max) params.append("maxPrice", priceRange.max)
    if (condition.length > 0) params.append("condition", condition.join(","))
    if (availability.length > 0) params.append("availability", availability.join(","))
    
    return `/items?${params.toString()}`
  }, [searchParams, priceRange, condition, availability])

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

  const applyFilters = useCallback(() => {
    const params = new URLSearchParams()
    
    // Preserve existing search parameter
    const currentSearch = searchParams.get("search")
    if (currentSearch) {
      params.append("search", currentSearch)
    }
    
    // Add filters
    if (selectedCategory) {
      params.append("category", selectedCategory)
      // Find and add category name
      const category = categories.find(c => c.id === selectedCategory)
      if (category) {
        params.append("categoryName", category.name)
      }
    }
    if (priceRange.min) params.append("minPrice", priceRange.min)
    if (priceRange.max) params.append("maxPrice", priceRange.max)
    if (condition.length > 0) params.append("condition", condition.join(","))
    if (availability.length > 0) params.append("availability", availability.join(","))
    
    // Use Next.js router for smooth navigation
    router.push(`/items?${params.toString()}`)
  }, [selectedCategory, priceRange, condition, availability, categories, searchParams, router])

  return (
    <aside className="w-64 bg-white border border-gray-200 rounded-lg p-4">
      {/* Categories Section */}
      <div className="mb-6">
        <h2 className="font-bold text-sm mb-3">Kategorien</h2>
        <nav>
          <button
            onClick={() => router.push(buildFilterUrl())}
            className={`block w-full text-left py-2 px-3 text-sm rounded hover:bg-gray-100 ${
              pathname === "/items" && !selectedCategory ? "bg-gray-100 font-semibold" : ""
            }`}
          >
            Alle Kategorien
          </button>
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => router.push(buildFilterUrl(category.id, category.name))}
              className={`block w-full text-left py-2 px-3 text-sm rounded hover:bg-gray-100 flex items-center justify-between group ${
                selectedCategory === category.id ? "bg-gray-100 font-semibold" : ""
              }`}
            >
              <span>{category.name}</span>
              <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-gray-600" />
            </button>
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

        {/* Filter Action Buttons */}
        <div className="space-y-2">
          <button
            onClick={applyFilters}
            className="w-full py-2 bg-[#3665f3] text-white font-semibold rounded hover:bg-[#1e49c7] transition-colors text-sm"
          >
            Filter anwenden
          </button>
          
          {/* Reset Filters Button - only show if filters are active */}
          {(priceRange.min || priceRange.max || condition.length > 0 || 
            (availability.length > 0 && !availability.includes("available")) || 
            selectedCategory) && (
            <button
              onClick={() => {
                setPriceRange({ min: "", max: "" })
                setCondition([])
                setAvailability(["available"])
                setSelectedCategory("")
                router.push("/items")
              }}
              className="w-full py-2 bg-gray-100 text-gray-700 font-semibold rounded hover:bg-gray-200 transition-colors text-sm"
            >
              Filter zurücksetzen
            </button>
          )}
        </div>
      </div>
    </aside>
  )
}