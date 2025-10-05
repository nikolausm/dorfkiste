import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import BackgroundLogo from "@/components/BackgroundLogo";
import { AuthProvider } from "@/contexts/AuthContext";
import { ThemeProvider } from "@/contexts/ThemeContext";
import CookieConsentBanner from "@/components/CookieConsentBanner";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Dorfkiste - Verleihe und finde alles in deiner Nachbarschaft",
  description: "Die lokale Plattform zum Verleihen und Mieten von Gegenständen und Dienstleistungen in deiner Nachbarschaft.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="de">
      <body suppressHydrationWarning className={`${inter.className} min-h-screen flex flex-col bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 transition-colors`}>
        <ThemeProvider>
          <AuthProvider>
            <BackgroundLogo />
            <Header />
            <main className="flex-grow relative z-10">
              {children}
            </main>
            <Footer />
            <CookieConsentBanner />
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}