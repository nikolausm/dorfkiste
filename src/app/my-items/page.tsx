"use client"

import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import ItemCard from "@/components/ItemCard"
import { Plus, Package, Loader2 } from "lucide-react"

export default function MyItemsPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [items, setItems] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/signin")
    } else if (session?.user?.id) {
      fetchMyItems()
    }
  }, [session, status])

  const fetchMyItems = async () => {
    try {
      const response = await fetch(`/api/items?userId=${session!.user.id}`)
      if (response.ok) {
        const data = await response.json()
        setItems(data.items)
      }
    } catch (error) {
      console.error("Error fetching items:", error)
    } finally {
      setLoading(false)
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

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Meine Artikel</h1>
        <Link
          href="/items/new"
          className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="h-5 w-5" />
          Neuer Artikel
        </Link>
      </div>

      {items.length === 0 ? (
        <div className="text-center py-12">
          <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500 mb-4">Du hast noch keine Artikel eingestellt</p>
          <Link
            href="/items/new"
            className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium"
          >
            <Plus className="h-5 w-5" />
            Ersten Artikel einstellen
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {items.map((item) => (
            <ItemCard
              key={item.id}
              id={item.id}
              title={item.title}
              imageUrl={item.images[0]?.url}
              pricePerDay={item.pricePerDay}
              pricePerHour={item.pricePerHour}
              location={item.location}
              condition={item.condition}
              available={item.available}
              user={item.user}
            />
          ))}
        </div>
      )}
    </div>
  )
}