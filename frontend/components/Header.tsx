'use client';

import Link from 'next/link';
import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { apiClient } from '@/lib/api';

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const { user, isLoggedIn, logout, isLoading } = useAuth();
  const router = useRouter();
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsUserMenuOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Fetch unread count for logged-in users
  useEffect(() => {
    if (isLoggedIn && !isLoading) {
      fetchUnreadCount();
      // Poll for updates every 30 seconds
      const interval = setInterval(fetchUnreadCount, 30000);
      return () => clearInterval(interval);
    } else {
      setUnreadCount(0);
    }
  }, [isLoggedIn, isLoading]);

  const fetchUnreadCount = async () => {
    try {
      const response = await apiClient.getUnreadCount();
      setUnreadCount(response.count);
    } catch (error) {
      console.error('Error fetching unread count:', error);
    }
  };

  const handleLogout = () => {
    logout();
    setIsUserMenuOpen(false);
    router.push('/');
  };

  return (
    <header className="glass-effect shadow-soft border-b border-white/20 sticky top-0 z-50">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex-shrink-0">
            <Link href="/" className="flex items-center">
              <span className="text-2xl font-bold gradient-text">🏘️ Dorfkiste</span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:block">
            <div className="ml-10 flex items-center space-x-4">
              <Link href="/angebote" className="nav-link">
                Angebote durchsuchen
              </Link>
              <Link href="/kategorien" className="nav-link">
                Kategorien
              </Link>
              <Link href="/angebot-erstellen" className="nav-link">
                Angebot erstellen
              </Link>
              {isLoggedIn && (
                <Link href="/nachrichten" className="nav-link relative">
                  <div className="flex items-center gap-2">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                    Nachrichten
                    {unreadCount > 0 && (
                      <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-semibold shadow-soft">
                        {unreadCount > 99 ? '99+' : unreadCount}
                      </span>
                    )}
                  </div>
                </Link>
              )}
            </div>
          </div>

          {/* Auth buttons */}
          <div className="hidden md:block">
            {isLoading ? (
              <div className="ml-4 flex items-center">
                <div className="w-6 h-6 border-2 border-primary-600 border-t-transparent rounded-full animate-spin"></div>
              </div>
            ) : isLoggedIn ? (
              <div className="ml-4 flex items-center space-x-3">
                <div className="relative" ref={dropdownRef}>
                  <button
                    onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                    className="flex items-center space-x-2 nav-link"
                  >
                    <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-primary-600 text-white rounded-full flex items-center justify-center text-sm font-semibold shadow-soft">
                      {user?.firstName?.charAt(0)}{user?.lastName?.charAt(0)}
                    </div>
                    <span>Hallo, {user?.firstName}!</span>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>

                  {/* User dropdown menu */}
                  {isUserMenuOpen && (
                    <div className="absolute right-0 mt-2 w-48 glass-effect rounded-xl shadow-medium py-2 z-10 backdrop-blur-md animate-scale-in">
                      <Link
                        href="/profil"
                        className="block px-4 py-2 text-sm text-neutral-700 hover:bg-white/20 rounded-lg mx-2 transition-colors duration-200"
                        onClick={() => setIsUserMenuOpen(false)}
                      >
                        Mein Profil
                      </Link>
                      <Link
                        href="/meine-angebote"
                        className="block px-4 py-2 text-sm text-neutral-700 hover:bg-white/20 rounded-lg mx-2 transition-colors duration-200"
                        onClick={() => setIsUserMenuOpen(false)}
                      >
                        Meine Angebote
                      </Link>
                      <Link
                        href="/meine-buchungen"
                        className="block px-4 py-2 text-sm text-neutral-700 hover:bg-white/20 rounded-lg mx-2 transition-colors duration-200"
                        onClick={() => setIsUserMenuOpen(false)}
                      >
                        Meine Buchungen
                      </Link>
                      <Link
                        href="/nachrichten"
                        className="block px-4 py-2 text-sm text-neutral-700 hover:bg-white/20 rounded-lg mx-2 transition-colors duration-200 relative"
                        onClick={() => setIsUserMenuOpen(false)}
                      >
                        <div className="flex items-center justify-between">
                          Nachrichten
                          {unreadCount > 0 && (
                            <span className="bg-red-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center font-semibold">
                              {unreadCount > 9 ? '9+' : unreadCount}
                            </span>
                          )}
                        </div>
                      </Link>
                      <div className="border-t border-white/20 my-2"></div>
                      <button
                        onClick={handleLogout}
                        className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50/20 rounded-lg mx-2 transition-colors duration-200"
                      >
                        Abmelden
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="ml-4 flex items-center space-x-3">
                <Link href="/anmelden" className="nav-link">
                  Anmelden
                </Link>
                <Link href="/registrieren" className="btn-primary">
                  Registrieren
                </Link>
              </div>
            )}</div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-gray-700 hover:text-primary-600 focus:outline-none focus:text-primary-600"
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                {isMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
              <Link href="/angebote" className="nav-link block">
                Angebote durchsuchen
              </Link>
              <Link href="/kategorien" className="nav-link block">
                Kategorien
              </Link>
              <Link href="/angebot-erstellen" className="nav-link block">
                Angebot erstellen
              </Link>
              {isLoggedIn && (
                <Link href="/nachrichten" className="nav-link block relative">
                  <div className="flex items-center gap-3">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                    Nachrichten
                    {unreadCount > 0 && (
                      <span className="bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-semibold shadow-soft">
                        {unreadCount > 99 ? '99+' : unreadCount}
                      </span>
                    )}
                  </div>
                </Link>
              )}
              
              {/* Mobile auth section */}
              {isLoggedIn ? (
                <>
                  <div className="border-t border-gray-200 mt-3 pt-3">
                    <div className="flex items-center px-3 py-2">
                      <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-primary-600 text-white rounded-full flex items-center justify-center text-sm font-semibold shadow-soft mr-3">
                        {user?.firstName?.charAt(0)}{user?.lastName?.charAt(0)}
                      </div>
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {user?.firstName} {user?.lastName}
                        </div>
                        <div className="text-xs text-gray-500">{user?.email}</div>
                      </div>
                    </div>
                  </div>
                  <Link href="/profil" className="nav-link block">
                    Mein Profil
                  </Link>
                  <Link href="/meine-angebote" className="nav-link block">
                    Meine Angebote
                  </Link>
                  <Link href="/meine-buchungen" className="nav-link block">
                    Meine Buchungen
                  </Link>
                  <Link href="/nachrichten" className="nav-link block">
                    <div className="flex items-center justify-between">
                      Nachrichten
                      {unreadCount > 0 && (
                        <span className="bg-red-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center font-semibold">
                          {unreadCount > 9 ? '9+' : unreadCount}
                        </span>
                      )}
                    </div>
                  </Link>
                  <button 
                    onClick={handleLogout}
                    className="text-red-600 hover:text-red-700 block w-full text-left nav-link"
                  >
                    Abmelden
                  </button>
                </>
              ) : (
                <>
                  <Link href="/anmelden" className="nav-link block">
                    Anmelden
                  </Link>
                  <Link href="/registrieren" className="btn-primary block w-full text-center mt-2">
                    Registrieren
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </nav>
    </header>
  );
}