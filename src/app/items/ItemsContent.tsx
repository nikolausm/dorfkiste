"use client"

import { useEffect, useState } from "react"
import { useSearchParams } from "next/navigation"
import ItemCard from "@/components/ItemCard"
import CategorySidebar from "@/components/CategorySidebar"
import { Loader2, ChevronDown, Grid3X3, List as ListIcon } from "lucide-react"

export default function ItemsContent() {
  const searchParams = useSearchParams()
  const [items, setItems] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [sortBy, setSortBy] = useState("newest")
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")
  const [resultsCount, setResultsCount] = useState(0)

  useEffect(() => {
    fetchItems()
  }, [page, searchParams, sortBy])

  const fetchItems = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams(searchParams.toString())
      params.append("page", page.toString())
      params.append("limit", "48")
      params.append("sort", sortBy)

      const response = await fetch(`/api/items?${params}`)
      if (response.ok) {
        const data = await response.json()
        setItems(data.items)
        setResultsCount(data.total)
        setTotalPages(Math.ceil(data.total / 48))
      }
    } catch (error) {
      console.error("Error fetching items:", error)
    } finally {
      setLoading(false)
    }
  }

  const getSearchQuery = () => {
    return searchParams.get("search") || ""
  }

  const getCategoryName = () => {
    return searchParams.get("categoryName") || "Alle Kategorien"
  }

  return (
    <div className="max-w-[1280px] mx-auto px-4 py-4">
      {/* Breadcrumb */}
      <nav className="text-sm mb-4">
        <ol className="flex items-center space-x-2 text-gray-600">
          <li><a href="/" className="hover:text-blue-600">Startseite</a></li>
          <li className="before:content-['>'] before:mx-2">
            <span className="text-gray-900">{getCategoryName()}</span>
          </li>
        </ol>
      </nav>

      <div className="flex gap-6">
        {/* Sidebar */}
        <div className="hidden lg:block">
          <CategorySidebar />
        </div>

        {/* Main Content */}
        <div className="flex-1">
          {/* Results Header */}
          <div className="bg-white border border-gray-200 rounded-lg p-4 mb-4">
            <div className="flex items-center justify-between mb-3">
              <h1 className="text-2xl font-bold">
                {getSearchQuery() ? `Suchergebnisse für "${getSearchQuery()}"` : getCategoryName()}
              </h1>
              <div className="flex items-center gap-4">
                {/* View Mode Toggle */}
                <div className="flex items-center border border-gray-300 rounded">
                  <button
                    onClick={() => setViewMode("grid")}
                    className={`p-2 ${viewMode === "grid" ? "bg-gray-100" : ""}`}
                    aria-label="Grid-Ansicht"
                  >
                    <Grid3X3 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setViewMode("list")}
                    className={`p-2 ${viewMode === "list" ? "bg-gray-100" : ""}`}
                    aria-label="Listen-Ansicht"
                  >
                    <ListIcon className="w-4 h-4" />
                  </button>
                </div>

                {/* Sort Dropdown */}
                <div className="relative">
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="appearance-none bg-white border border-gray-300 rounded px-4 py-2 pr-8 text-sm"
                  >
                    <option value="newest">Neueste zuerst</option>
                    <option value="price-low">Preis: Niedrig bis Hoch</option>
                    <option value="price-high">Preis: Hoch bis Niedrig</option>
                    <option value="popular">Beliebteste</option>
                  </select>
                  <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 w-4 h-4 pointer-events-none" />
                </div>
              </div>
            </div>

            {/* Results Count */}
            <div className="text-sm text-gray-600">
              {resultsCount > 0 && (
                <span>{resultsCount} Ergebnisse</span>
              )}
            </div>
          </div>

          {/* Items Grid/List */}
          {loading ? (
            <div className="flex items-center justify-center py-12 bg-white rounded-lg">
              <Loader2 className="h-8 w-8 animate-spin text-[#3665f3]" />
            </div>
          ) : items.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-lg">
              <p className="text-gray-500">Keine Artikel gefunden</p>
              <p className="text-sm text-gray-400 mt-2">Versuchen Sie es mit anderen Suchbegriffen oder Filtern</p>
            </div>
          ) : (
            <>
              <div className={viewMode === "grid" 
                ? "grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4"
                : "space-y-4"
              }>
                {items.map((item) => (
                  <ItemCard
                    key={item.id}
                    id={item.id}
                    title={item.title}
                    imageUrl={item.images?.[0]?.url}
                    pricePerDay={item.pricePerDay}
                    pricePerHour={item.pricePerHour}
                    location={item.location}
                    condition={item.condition}
                    available={item.available}
                    user={{
                      id: item.user.id,
                      name: item.user.name,
                      rating: item.user.rating || 4.5,
                      reviewCount: item.user.reviewCount || 12
                    }}
                    viewCount={Math.floor(Math.random() * 100) + 10}
                  />
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="mt-8 flex justify-center">
                  <nav className="flex items-center space-x-1">
                    <button
                      onClick={() => setPage(p => Math.max(1, p - 1))}
                      disabled={page === 1}
                      className="px-3 py-2 text-sm border border-gray-300 rounded-l hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Zurück
                    </button>
                    
                    {/* Page Numbers */}
                    {[...Array(Math.min(5, totalPages))].map((_, i) => {
                      const pageNum = i + 1
                      return (
                        <button
                          key={pageNum}
                          onClick={() => setPage(pageNum)}
                          className={`px-3 py-2 text-sm border-t border-b border-gray-300 hover:bg-gray-50 ${
                            page === pageNum ? "bg-gray-100 font-semibold" : ""
                          }`}
                        >
                          {pageNum}
                        </button>
                      )
                    })}
                    
                    {totalPages > 5 && (
                      <>
                        <span className="px-2">...</span>
                        <button
                          onClick={() => setPage(totalPages)}
                          className={`px-3 py-2 text-sm border-t border-b border-gray-300 hover:bg-gray-50 ${
                            page === totalPages ? "bg-gray-100 font-semibold" : ""
                          }`}
                        >
                          {totalPages}
                        </button>
                      </>
                    )}
                    
                    <button
                      onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                      disabled={page === totalPages}
                      className="px-3 py-2 text-sm border border-gray-300 rounded-r hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Weiter
                    </button>
                  </nav>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}