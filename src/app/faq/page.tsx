"use client"

import { useState } from "react"
import Link from "next/link"
import { ChevronDown, ChevronUp, HelpCircle, Shield, Package, CreditCard, Truck, Clock, Users } from "lucide-react"

type FAQItem = {
  id: string
  category: string
  question: string
  answer: string
  icon: React.ReactNode
}

const faqs: FAQItem[] = [
  {
    id: "1",
    category: "Allgemein",
    question: "Was ist Dorfkiste?",
    answer: "Dorfkiste ist eine Nachbarschafts-Verleihplattform, auf der Sie Gegenstände mit Menschen in Ihrer Umgebung teilen können. Statt selten genutzte Dinge zu kaufen, können Sie diese von Nachbarn ausleihen oder Ihre eigenen Sachen vermieten.",
    icon: <HelpCircle className="w-5 h-5" />
  },
  {
    id: "2",
    category: "Sicherheit",
    question: "Wie sicher ist das Verleihen über Dorfkiste?",
    answer: "Wir bieten mehrere Sicherheitsfunktionen: Verifizierte Profile, Bewertungssystem, sichere Zahlungsabwicklung und optional eine Versicherung für hochwertige Gegenstände. Außerdem empfehlen wir, bei der Übergabe einen Mietvertrag zu verwenden.",
    icon: <Shield className="w-5 h-5" />
  },
  {
    id: "3",
    category: "Vermietung",
    question: "Wie stelle ich einen Artikel ein?",
    answer: "Klicken Sie auf 'Artikel einstellen', fügen Sie Fotos und eine Beschreibung hinzu, legen Sie den Preis fest und veröffentlichen Sie Ihren Artikel. Sie können entscheiden, ob Selbstabholung oder Lieferung möglich ist.",
    icon: <Package className="w-5 h-5" />
  },
  {
    id: "4",
    category: "Zahlung",
    question: "Wie funktioniert die Bezahlung?",
    answer: "Zahlungen werden sicher über unsere Plattform abgewickelt. Wir unterstützen Kreditkarten, PayPal und SEPA-Lastschrift. Das Geld wird erst nach erfolgreicher Übergabe an den Vermieter ausgezahlt.",
    icon: <CreditCard className="w-5 h-5" />
  },
  {
    id: "5",
    category: "Lieferung",
    question: "Kann ich Artikel liefern lassen?",
    answer: "Ja, wenn der Vermieter Lieferung anbietet. Die Liefergebühr wird beim Checkout angezeigt. Besonders bei schweren Gegenständen wie Baumaschinen ist dies oft verfügbar.",
    icon: <Truck className="w-5 h-5" />
  },
  {
    id: "6",
    category: "Miete",
    question: "Wie lange kann ich etwas mieten?",
    answer: "Die Mietdauer können Sie flexibel mit dem Vermieter vereinbaren - von wenigen Stunden bis zu mehreren Wochen. Die meisten Artikel haben Tages- oder Stundenpreise.",
    icon: <Clock className="w-5 h-5" />
  },
  {
    id: "7",
    category: "Community",
    question: "Wie finde ich Verleiher in meiner Nähe?",
    answer: "Nutzen Sie die Suchfunktion und geben Sie Ihren Standort ein. Die Ergebnisse werden nach Entfernung sortiert. Sie können auch einen Suchradius festlegen.",
    icon: <Users className="w-5 h-5" />
  },
  {
    id: "8",
    category: "Sicherheit",
    question: "Was passiert bei Schäden?",
    answer: "Kleine Gebrauchsspuren sind normal. Bei größeren Schäden greift unsere optionale Versicherung. Dokumentieren Sie den Zustand bei Übergabe und Rückgabe mit Fotos.",
    icon: <Shield className="w-5 h-5" />
  }
]

const categories = ["Alle", "Allgemein", "Sicherheit", "Vermietung", "Zahlung", "Lieferung", "Miete", "Community"]

export default function FAQPage() {
  const [activeCategory, setActiveCategory] = useState("Alle")
  const [expandedItems, setExpandedItems] = useState<string[]>([])
  const [searchQuery, setSearchQuery] = useState("")

  const toggleExpanded = (id: string) => {
    setExpandedItems(prev =>
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    )
  }

  const filteredFAQs = faqs.filter(faq => {
    const matchesCategory = activeCategory === "Alle" || faq.category === activeCategory
    const matchesSearch = searchQuery === "" || 
      (typeof faq.question === 'string' && typeof searchQuery === 'string' && faq.question.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (typeof faq.answer === 'string' && typeof searchQuery === 'string' && faq.answer.toLowerCase().includes(searchQuery.toLowerCase()))
    return matchesCategory && matchesSearch
  })

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-b from-blue-600 to-blue-700 text-white py-16">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h1 className="text-4xl font-bold mb-4">Häufig gestellte Fragen</h1>
          <p className="text-xl mb-8">Finden Sie schnell Antworten auf Ihre Fragen</p>
          
          {/* Search */}
          <div className="max-w-2xl mx-auto">
            <input
              type="text"
              placeholder="Suchen Sie nach Stichwörtern..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-6 py-3 rounded-lg text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-white"
            />
          </div>
        </div>
      </div>

      {/* Categories */}
      <div className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex gap-4 overflow-x-auto">
            {categories.map(category => (
              <button
                key={category}
                onClick={() => setActiveCategory(category)}
                className={`px-4 py-2 rounded-full whitespace-nowrap transition-colors ${
                  activeCategory === category
                    ? "bg-blue-600 text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* FAQ Items */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        {filteredFAQs.length === 0 ? (
          <div className="text-center py-12">
            <HelpCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">Keine Fragen gefunden. Versuchen Sie eine andere Suche.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredFAQs.map(faq => (
              <div
                key={faq.id}
                className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden"
              >
                <button
                  onClick={() => toggleExpanded(faq.id)}
                  className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className="p-2 bg-blue-100 text-blue-600 rounded-lg">
                      {faq.icon}
                    </div>
                    <div className="text-left">
                      <h3 className="font-medium text-gray-900">{faq.question}</h3>
                      <p className="text-sm text-gray-500">{faq.category}</p>
                    </div>
                  </div>
                  {expandedItems.includes(faq.id) ? (
                    <ChevronUp className="w-5 h-5 text-gray-400" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-gray-400" />
                  )}
                </button>
                
                {expandedItems.includes(faq.id) && (
                  <div className="px-6 pb-4 border-t">
                    <p className="text-gray-600 mt-4">{faq.answer}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Contact Section */}
        <div className="mt-12 bg-blue-50 rounded-lg p-8 text-center">
          <h2 className="text-2xl font-bold mb-4">Keine Antwort gefunden?</h2>
          <p className="text-gray-600 mb-6">
            Unser Support-Team hilft Ihnen gerne weiter
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/contact"
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Kontakt aufnehmen
            </Link>
            <Link
              href="/help"
              className="px-6 py-3 bg-white text-gray-700 rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors"
            >
              Zum Hilfe-Center
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}