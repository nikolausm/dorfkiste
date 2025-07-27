import './globals.css'
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import AuthSessionProvider from '@/components/SessionProvider'
import Navigation from '@/components/Navigation'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Dorfkiste - Die Nachbarschafts-Verleihplattform',
  description: 'Teilen wie im Dorf - Verleihe und leihe Gegenstände in deiner Nachbarschaft',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="de">
      <body className={inter.className}>
        <AuthSessionProvider>
          <Navigation />
          <main className="min-h-screen bg-gray-50">
            {children}
          </main>
        </AuthSessionProvider>
      </body>
    </html>
  )
}