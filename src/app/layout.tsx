import './globals.css'
import '@/styles/main-theme.css'
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import AuthSessionProvider from '@/components/SessionProvider'
import MainHeader from '@/components/MainHeader'
import MainFooter from '@/components/MainFooter'
import { GlobalErrorBoundary } from '@/components/ErrorBoundary'
import { ToastProvider } from '@/components/Toast'

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
        <GlobalErrorBoundary>
          <ToastProvider>
            <AuthSessionProvider>
              <MainHeader />
              <main className="min-h-screen bg-gray-50">
                {children}
              </main>
              <MainFooter />
            </AuthSessionProvider>
          </ToastProvider>
        </GlobalErrorBoundary>
      </body>
    </html>
  )
}