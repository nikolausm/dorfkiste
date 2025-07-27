import Link from "next/link"
import { MessageSquare, Users, TrendingUp, Clock, ThumbsUp, Eye, Search, Plus } from "lucide-react"

const forumCategories = [
  {
    id: 1,
    name: "Allgemeine Diskussionen",
    description: "Alles rund um das Teilen und die Sharing Economy",
    icon: "💬",
    topics: 156,
    posts: 892,
    lastPost: {
      title: "Wie organisiert ihr eure Übergaben?",
      author: "SharingFan123",
      time: "vor 2 Stunden"
    }
  },
  {
    id: 2,
    name: "Tipps & Tricks",
    description: "Teilen Sie Ihre besten Praktiken und lernen Sie von anderen",
    icon: "💡",
    topics: 89,
    posts: 543,
    lastPost: {
      title: "Meine Top 5 Tipps für perfekte Artikelfotos",
      author: "FotoProfi",
      time: "vor 5 Stunden"
    }
  },
  {
    id: 3,
    name: "Marktplatz-Feedback",
    description: "Vorschläge und Feedback zur Dorfkiste-Plattform",
    icon: "🎯",
    topics: 67,
    posts: 412,
    lastPost: {
      title: "Feature-Wunsch: Kalender-Integration",
      author: "TechUser42",
      time: "vor 1 Tag"
    }
  },
  {
    id: 4,
    name: "Regionale Gruppen",
    description: "Vernetzen Sie sich mit Nutzern aus Ihrer Region",
    icon: "📍",
    topics: 234,
    posts: 1567,
    lastPost: {
      title: "München: Treffen am Samstag?",
      author: "MünchenMieter",
      time: "vor 3 Stunden"
    }
  },
  {
    id: 5,
    name: "Support & Hilfe",
    description: "Fragen und Antworten zur Nutzung von Dorfkiste",
    icon: "🆘",
    topics: 145,
    posts: 687,
    lastPost: {
      title: "Wie funktioniert die Versicherung genau?",
      author: "NeuerNutzer",
      time: "vor 6 Stunden"
    }
  }
]

const popularTopics = [
  { title: "Erste Schritte als Vermieter", replies: 45, views: 1234 },
  { title: "Die besten Kategorien für Anfänger", replies: 32, views: 876 },
  { title: "Preisgestaltung richtig gemacht", replies: 28, views: 654 },
  { title: "Sicherheitstipps für Übergaben", replies: 39, views: 982 }
]

const activeUsers = [
  { name: "PowerSharer", posts: 234, joined: "2022" },
  { name: "HelpfulHans", posts: 189, joined: "2023" },
  { name: "CommunityQueen", posts: 167, joined: "2022" },
  { name: "TechGuru", posts: 145, joined: "2023" }
]

export default function ForumPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white py-12">
        <div className="max-w-6xl mx-auto px-4">
          <h1 className="text-4xl font-bold mb-4">Community Forum</h1>
          <p className="text-xl mb-6">
            Tauschen Sie sich mit anderen Nutzern aus, stellen Sie Fragen und teilen Sie Ihre Erfahrungen
          </p>
          <div className="flex flex-wrap gap-4">
            <div className="bg-white/20 backdrop-blur-sm rounded-lg px-4 py-2">
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5" />
                <span className="font-semibold">12.456</span>
                <span>Mitglieder</span>
              </div>
            </div>
            <div className="bg-white/20 backdrop-blur-sm rounded-lg px-4 py-2">
              <div className="flex items-center gap-2">
                <MessageSquare className="w-5 h-5" />
                <span className="font-semibold">3.892</span>
                <span>Diskussionen</span>
              </div>
            </div>
            <div className="bg-white/20 backdrop-blur-sm rounded-lg px-4 py-2">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5" />
                <span className="font-semibold">234</span>
                <span>Online</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {/* Search Bar */}
            <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    placeholder="Forum durchsuchen..."
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
                <button className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center gap-2">
                  <Plus className="w-5 h-5" />
                  Neues Thema
                </button>
              </div>
            </div>

            {/* Forum Categories */}
            <div className="space-y-4">
              {forumCategories.map((category) => (
                <div key={category.id} className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow">
                  <div className="p-6">
                    <div className="flex items-start gap-4">
                      <div className="text-4xl">{category.icon}</div>
                      <div className="flex-1">
                        <h3 className="text-xl font-bold mb-1">
                          <Link href={`/forum/category/${category.id}`} className="hover:text-purple-600 transition-colors">
                            {category.name}
                          </Link>
                        </h3>
                        <p className="text-gray-600 mb-3">{category.description}</p>
                        <div className="flex items-center gap-6 text-sm text-gray-500">
                          <span>{category.topics} Themen</span>
                          <span>{category.posts} Beiträge</span>
                        </div>
                        {category.lastPost && (
                          <div className="mt-3 pt-3 border-t border-gray-100">
                            <p className="text-sm">
                              <span className="font-medium">Letzter Beitrag:</span>{" "}
                              <Link href="#" className="text-purple-600 hover:underline">
                                {category.lastPost.title}
                              </Link>
                            </p>
                            <p className="text-xs text-gray-500 mt-1">
                              von {category.lastPost.author} • {category.lastPost.time}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Popular Topics */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-orange-500" />
                Beliebte Themen
              </h3>
              <div className="space-y-3">
                {popularTopics.map((topic, index) => (
                  <div key={index} className="border-b border-gray-100 pb-3 last:border-0">
                    <Link href="#" className="text-sm font-medium hover:text-purple-600 transition-colors block mb-1">
                      {topic.title}
                    </Link>
                    <div className="flex items-center gap-3 text-xs text-gray-500">
                      <span className="flex items-center gap-1">
                        <MessageSquare className="w-3 h-3" />
                        {topic.replies}
                      </span>
                      <span className="flex items-center gap-1">
                        <Eye className="w-3 h-3" />
                        {topic.views}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Active Users */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                <Users className="w-5 h-5 text-green-500" />
                Aktivste Mitglieder
              </h3>
              <div className="space-y-3">
                {activeUsers.map((user, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div>
                      <Link href="#" className="font-medium text-sm hover:text-purple-600 transition-colors">
                        {user.name}
                      </Link>
                      <p className="text-xs text-gray-500">Dabei seit {user.joined}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold">{user.posts}</p>
                      <p className="text-xs text-gray-500">Beiträge</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Forum Rules */}
            <div className="bg-yellow-50 rounded-lg p-6">
              <h3 className="text-lg font-bold mb-3 flex items-center gap-2">
                📋 Forum-Regeln
              </h3>
              <ul className="space-y-2 text-sm text-gray-700">
                <li>• Respektvoller Umgang miteinander</li>
                <li>• Keine Werbung oder Spam</li>
                <li>• Hilfsbereitschaft wird geschätzt</li>
                <li>• Persönliche Daten schützen</li>
                <li>• Bei Problemen Moderatoren kontaktieren</li>
              </ul>
            </div>

            {/* Quick Stats */}
            <div className="bg-gray-100 rounded-lg p-6">
              <h3 className="text-lg font-bold mb-4">Forum-Statistiken</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Neuestes Mitglied:</span>
                  <span className="font-medium">FreshUser2024</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Beiträge heute:</span>
                  <span className="font-medium">47</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Aktive Themen:</span>
                  <span className="font-medium">892</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}