"use client"

import Link from "next/link"
import Image from "next/image"
import { useState, useRef, useEffect } from "react"
import { useSession, signOut } from "next-auth/react"
import { Search, ChevronDown, ShoppingCart, Bell, Menu, X, User, Heart, Package, Shield } from "lucide-react"
import { useRouter } from "next/navigation"

export default function MainHeader() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isAccountMenuOpen, setIsAccountMenuOpen] = useState(false)
  const [isCategoryMenuOpen, setIsCategoryMenuOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [cartCount, setCartCount] = useState(0)
  const [notificationCount, setNotificationCount] = useState(0)
  const [isAdmin, setIsAdmin] = useState(false)
  
  const accountMenuRef = useRef<HTMLDivElement>(null)
  const categoryMenuRef = useRef<HTMLDivElement>(null)

  // Close menus when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (accountMenuRef.current && !accountMenuRef.current.contains(event.target as Node)) {
        setIsAccountMenuOpen(false)
      }
      if (categoryMenuRef.current && !categoryMenuRef.current.contains(event.target as Node)) {
        setIsCategoryMenuOpen(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  // Fetch notification count and check admin status
  useEffect(() => {
    if (session?.user?.id) {
      fetchNotificationCount()
      checkAdminStatus()
      const interval = setInterval(fetchNotificationCount, 30000)
      return () => clearInterval(interval)
    }
  }, [session])

  const fetchNotificationCount = async () => {
    try {
      const response = await fetch("/api/messages/unread")
      if (response.ok) {
        const messages = await response.json()
        setNotificationCount(messages.length)
      }
    } catch (error) {
      console.error("Error fetching notifications:", error)
    }
  }

  const checkAdminStatus = async () => {
    try {
      const response = await fetch("/api/admin/check")
      if (response.ok) {
        setIsAdmin(true)
      } else if (response.status === 403) {
        // User is not an admin - this is expected, not an error
        setIsAdmin(false)
      }
    } catch (error) {
      console.error("Error checking admin status:", error)
    }
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      router.push(`/items?search=${encodeURIComponent(searchQuery)}`)
    }
  }

  const categories = [
    { name: "Elektronik", href: "/categories/elektronik" },
    { name: "Werkzeuge", href: "/categories/werkzeuge" },
    { name: "Sport & Freizeit", href: "/categories/sport" },
    { name: "Haushalt", href: "/categories/haushalt" },
    { name: "Garten", href: "/categories/garten" },
    { name: "Fahrzeuge", href: "/categories/fahrzeuge" },
    { name: "Bücher & Medien", href: "/categories/medien" },
    { name: "Sonstiges", href: "/categories/sonstiges" },
  ]

  return (
    <>
      {/* Top Bar */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-[1280px] mx-auto px-4">
          <div className="flex items-center justify-between h-8 text-xs">
            <div className="flex items-center space-x-4">
              <span className="text-gray-600">
                Hallo{session?.user?.name ? `, ${session.user.name}` : ""}!
              </span>
              <Link href="/notifications" className="text-blue-600 hover:underline">
                Benachrichtigungen
              </Link>
              <Link href="/my-items" className="text-blue-600 hover:underline">
                Meine Artikel
              </Link>
            </div>
            <div className="flex items-center space-x-4">
              <Link href="/help" className="text-gray-600 hover:text-blue-600">
                Hilfe & Kontakt
              </Link>
              {session ? (
                <button
                  onClick={() => signOut()}
                  className="text-gray-600 hover:text-blue-600"
                >
                  Abmelden
                </button>
              ) : (
                <>
                  <Link href="/auth/signin" className="text-gray-600 hover:text-blue-600">
                    Einloggen
                  </Link>
                  <Link href="/auth/signup" className="text-gray-600 hover:text-blue-600">
                    Registrieren
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Header */}
      <header className="bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-[1280px] mx-auto px-4">
          <div className="flex items-center h-16 gap-4">
            {/* Logo */}
            <Link href="/" className="flex-shrink-0">
              <div className="text-2xl font-bold">
                <span className="text-[#e53238]">D</span>
                <span className="text-[#f9a316]">o</span>
                <span className="text-[#5ba71b]">r</span>
                <span className="text-[#3665f3]">f</span>
                <span className="text-black">kiste</span>
              </div>
            </Link>

            {/* Category Dropdown */}
            <div className="relative hidden lg:block" ref={categoryMenuRef}>
              <button
                onClick={() => setIsCategoryMenuOpen(!isCategoryMenuOpen)}
                className="flex items-center space-x-1 text-sm text-gray-700 hover:text-blue-600"
              >
                <span>Shop nach Kategorie</span>
                <ChevronDown className="w-4 h-4" />
              </button>
              
              {isCategoryMenuOpen && (
                <div className="absolute top-full left-0 mt-1 w-64 bg-white border border-gray-200 rounded-lg shadow-lg">
                  <div className="py-2">
                    {categories.map((category) => (
                      <Link
                        key={category.name}
                        href={category.href}
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        onClick={() => setIsCategoryMenuOpen(false)}
                      >
                        {category.name}
                      </Link>
                    ))}
                    <div className="border-t border-gray-200 mt-2 pt-2">
                      <Link
                        href="/categories"
                        className="block px-4 py-2 text-sm font-semibold text-blue-600 hover:bg-gray-100"
                        onClick={() => setIsCategoryMenuOpen(false)}
                      >
                        Alle Kategorien anzeigen
                      </Link>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Search Bar */}
            <form onSubmit={handleSearch} className="flex-1 flex">
              <div className="w-full max-w-2xl flex">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Suchen Sie nach allem"
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-l-full focus:outline-none focus:border-blue-500"
                />
                <select className="px-3 border-t border-b border-gray-300 bg-white text-sm">
                  <option>Alle Kategorien</option>
                  {categories.map((cat) => (
                    <option key={cat.name} value={cat.name}>{cat.name}</option>
                  ))}
                </select>
                <button
                  type="submit"
                  className="px-8 py-2 bg-[#3665f3] text-white font-semibold rounded-r-full hover:bg-[#1e49c7] transition-colors"
                >
                  Suchen
                </button>
              </div>
            </form>

            {/* Right Menu */}
            <div className="flex items-center space-x-4">
              {/* Notifications */}
              {session && (
                <Link
                  href="/notifications"
                  className="relative p-2 text-gray-600 hover:text-gray-900"
                >
                  <Bell className="w-6 h-6" />
                  {notificationCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                      {notificationCount > 9 ? "9+" : notificationCount}
                    </span>
                  )}
                </Link>
              )}

              {/* Watchlist */}
              {session && (
                <Link
                  href="/watchlist"
                  className="relative p-2 text-gray-600 hover:text-gray-900"
                >
                  <Heart className="w-6 h-6" />
                </Link>
              )}

              {/* My Account */}
              <div className="relative" ref={accountMenuRef}>
                {session ? (
                  <>
                    <button
                      onClick={() => setIsAccountMenuOpen(!isAccountMenuOpen)}
                      className="flex items-center space-x-1 text-sm text-gray-700 hover:text-blue-600"
                    >
                      <User className="w-5 h-5" />
                      <span className="hidden lg:inline">Mein Konto</span>
                      <ChevronDown className="w-4 h-4" />
                    </button>
                    
                    {isAccountMenuOpen && (
                      <div className="absolute right-0 top-full mt-1 w-56 bg-white border border-gray-200 rounded-lg shadow-lg">
                        <div className="py-2">
                          <Link
                            href="/profile"
                            className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                            onClick={() => setIsAccountMenuOpen(false)}
                          >
                            <User className="w-4 h-4 mr-2" />
                            Mein Profil
                          </Link>
                          <Link
                            href="/my-items"
                            className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                            onClick={() => setIsAccountMenuOpen(false)}
                          >
                            <Package className="w-4 h-4 mr-2" />
                            Meine Artikel
                          </Link>
                          <Link
                            href="/my-rentals"
                            className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                            onClick={() => setIsAccountMenuOpen(false)}
                          >
                            <ShoppingCart className="w-4 h-4 mr-2" />
                            Meine Ausleihen
                          </Link>
                          {isAdmin && (
                            <>
                              <div className="border-t border-gray-200 my-2"></div>
                              <Link
                                href="/admin"
                                className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                onClick={() => setIsAccountMenuOpen(false)}
                              >
                                <Shield className="w-4 h-4 mr-2" />
                                Admin Dashboard
                              </Link>
                            </>
                          )}
                          <div className="border-t border-gray-200 my-2"></div>
                          <button
                            onClick={() => {
                              setIsAccountMenuOpen(false)
                              signOut()
                            }}
                            className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                          >
                            Abmelden
                          </button>
                        </div>
                      </div>
                    )}
                  </>
                ) : (
                  <Link
                    href="/auth/signin"
                    className="text-sm text-blue-600 hover:underline"
                  >
                    Einloggen
                  </Link>
                )}
              </div>

              {/* Post Item Button */}
              {session && (
                <Link
                  href="/items/new"
                  className="hidden lg:block px-4 py-2 bg-white border border-blue-600 text-blue-600 font-semibold rounded hover:bg-blue-50 transition-colors"
                >
                  Artikel einstellen
                </Link>
              )}

              {/* Mobile Menu Toggle */}
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="lg:hidden p-2 text-gray-600"
              >
                {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="lg:hidden border-t border-gray-200">
            <div className="px-4 py-2 space-y-2">
              <Link
                href="/categories"
                className="block py-2 text-sm text-gray-700"
                onClick={() => setIsMenuOpen(false)}
              >
                Shop nach Kategorie
              </Link>
              {session && (
                <>
                  <Link
                    href="/items/new"
                    className="block py-2 text-sm text-gray-700"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Artikel einstellen
                  </Link>
                  <Link
                    href="/my-items"
                    className="block py-2 text-sm text-gray-700"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Meine Artikel
                  </Link>
                  <Link
                    href="/my-rentals"
                    className="block py-2 text-sm text-gray-700"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Meine Ausleihen
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </header>
    </>
  )
}