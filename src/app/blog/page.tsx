import Link from "next/link"
import { Calendar, User, Clock, ArrowRight } from "lucide-react"

const blogPosts = [
  {
    id: 1,
    title: "Die Sharing Economy revolutioniert unsere Nachbarschaften",
    excerpt: "Wie das Teilen von Gegenständen nicht nur Geld spart, sondern auch Gemeinschaften stärkt und die Umwelt schützt.",
    author: "Lisa Weber",
    date: "2024-12-15",
    readTime: "5 Min",
    category: "Nachhaltigkeit",
    image: "🌱"
  },
  {
    id: 2,
    title: "10 Tipps für erfolgreiche Vermietungen",
    excerpt: "Von der perfekten Artikelbeschreibung bis zur reibungslosen Übergabe - so werden Sie zum Star-Vermieter.",
    author: "Max Mustermann",
    date: "2024-12-10",
    readTime: "7 Min",
    category: "Ratgeber",
    image: "💡"
  },
  {
    id: 3,
    title: "Erfolgsgeschichte: Vom Hobby zum Nebeneinkommen",
    excerpt: "Wie Thomas aus München mit der Vermietung seiner Werkzeuge ein lukratives Nebeneinkommen aufgebaut hat.",
    author: "Tom Schmidt",
    date: "2024-12-05",
    readTime: "4 Min",
    category: "Erfolgsgeschichten",
    image: "🎯"
  },
  {
    id: 4,
    title: "Sicherheit beim Teilen: Das müssen Sie wissen",
    excerpt: "Unser umfassender Guide zu Versicherung, Vertrauen und sicheren Transaktionen auf Dorfkiste.",
    author: "Erika Musterfrau",
    date: "2024-11-28",
    readTime: "8 Min",
    category: "Sicherheit",
    image: "🛡️"
  },
  {
    id: 5,
    title: "Die beliebtesten Mietartikel im Winter",
    excerpt: "Von Schneefräsen bis Fondue-Sets: Diese Artikel sind in der kalten Jahreszeit besonders gefragt.",
    author: "Lisa Weber",
    date: "2024-11-20",
    readTime: "6 Min",
    category: "Trends",
    image: "❄️"
  },
  {
    id: 6,
    title: "Community-Spotlight: Das Repair-Café Freiburg",
    excerpt: "Wie eine lokale Initiative Reparatur und Sharing verbindet und dabei die Nachbarschaft zusammenbringt.",
    author: "Tom Schmidt",
    date: "2024-11-15",
    readTime: "5 Min",
    category: "Community",
    image: "🔧"
  }
]

const categories = [
  "Alle Artikel",
  "Nachhaltigkeit",
  "Ratgeber",
  "Erfolgsgeschichten",
  "Sicherheit",
  "Trends",
  "Community"
]

export default function BlogPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-16">
        <div className="max-w-6xl mx-auto px-4">
          <h1 className="text-4xl font-bold mb-4">Dorfkiste Blog</h1>
          <p className="text-xl">
            Entdecken Sie Tipps, Geschichten und Neuigkeiten aus der Welt des Teilens
          </p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-12">
        {/* Categories */}
        <div className="mb-8">
          <div className="flex flex-wrap gap-2">
            {categories.map((category) => (
              <button
                key={category}
                className={`px-4 py-2 rounded-full transition-colors ${
                  category === "Alle Artikel"
                    ? "bg-blue-600 text-white"
                    : "bg-white text-gray-700 hover:bg-gray-100 border border-gray-300"
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>

        {/* Blog Posts Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {blogPosts.map((post) => (
            <article
              key={post.id}
              className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="p-6">
                {/* Category & Icon */}
                <div className="flex items-center justify-between mb-4">
                  <span className="text-sm font-medium text-blue-600">{post.category}</span>
                  <span className="text-3xl">{post.image}</span>
                </div>

                {/* Title */}
                <h2 className="text-xl font-bold mb-3 line-clamp-2">
                  <Link href={`/blog/${post.id}`} className="hover:text-blue-600 transition-colors">
                    {post.title}
                  </Link>
                </h2>

                {/* Excerpt */}
                <p className="text-gray-600 mb-4 line-clamp-3">{post.excerpt}</p>

                {/* Meta Info */}
                <div className="flex items-center gap-4 text-sm text-gray-500 mb-4">
                  <div className="flex items-center gap-1">
                    <User className="w-4 h-4" />
                    <span>{post.author}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    <span>{new Date(post.date).toLocaleDateString('de-DE')}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    <span>{post.readTime}</span>
                  </div>
                </div>

                {/* Read More Link */}
                <Link
                  href={`/blog/${post.id}`}
                  className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium"
                >
                  Weiterlesen
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </article>
          ))}
        </div>

        {/* Newsletter Section */}
        <div className="mt-16 bg-blue-50 rounded-lg p-8 text-center">
          <h2 className="text-2xl font-bold mb-4">Bleiben Sie auf dem Laufenden</h2>
          <p className="text-gray-700 mb-6 max-w-2xl mx-auto">
            Abonnieren Sie unseren Newsletter und erhalten Sie die neuesten Artikel, 
            Tipps und Erfolgsgeschichten direkt in Ihr Postfach.
          </p>
          <form className="max-w-md mx-auto flex gap-2">
            <input
              type="email"
              placeholder="Ihre E-Mail-Adresse"
              className="flex-1 px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              type="submit"
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              Abonnieren
            </button>
          </form>
        </div>

        {/* Author Spotlight */}
        <div className="mt-16">
          <h2 className="text-2xl font-bold mb-8">Unsere Autoren</h2>
          <div className="grid md:grid-cols-4 gap-6">
            {[
              { name: "Lisa Weber", role: "Head of Community", emoji: "👩‍💻" },
              { name: "Max Mustermann", role: "CEO & Gründer", emoji: "👨‍💼" },
              { name: "Tom Schmidt", role: "Head of Product", emoji: "👨‍💻" },
              { name: "Erika Musterfrau", role: "CTO & Gründerin", emoji: "👩‍💼" }
            ].map((author) => (
              <div key={author.name} className="text-center">
                <div className="w-20 h-20 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-3 text-3xl">
                  {author.emoji}
                </div>
                <h3 className="font-semibold">{author.name}</h3>
                <p className="text-sm text-gray-600">{author.role}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}