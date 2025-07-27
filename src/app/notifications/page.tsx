"use client"

import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { format } from "date-fns"
import { de } from "date-fns/locale"
import { Bell, MessageCircle, Calendar, Package, Star, User, Loader2 } from "lucide-react"

interface Notification {
  id: string
  type: "message" | "rental" | "review"
  title: string
  description: string
  link: string
  read: boolean
  createdAt: string
  relatedUser?: {
    id: string
    name: string | null
    avatarUrl: string | null
  }
}

export default function NotificationsPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/signin")
    } else if (session?.user?.id) {
      fetchNotifications()
    }
  }, [session, status])

  const fetchNotifications = async () => {
    try {
      // Fetch unread messages
      const messagesRes = await fetch("/api/messages/unread")
      const unreadMessages = messagesRes.ok ? await messagesRes.json() : []

      // Fetch recent rentals
      const rentalsRes = await fetch("/api/rentals?limit=10")
      const rentalsData = rentalsRes.ok ? await rentalsRes.json() : { rentals: [] }

      // Fetch recent reviews
      const reviewsRes = await fetch(`/api/reviews?userId=${session!.user.id}&limit=5`)
      const reviewsData = reviewsRes.ok ? await reviewsRes.json() : { reviews: [] }

      // Combine all notifications
      const allNotifications: Notification[] = []

      // Add unread messages
      unreadMessages.forEach((message: any) => {
        allNotifications.push({
          id: `msg-${message.id}`,
          type: "message",
          title: "Neue Nachricht",
          description: `${message.sender.name || "Jemand"} hat dir eine Nachricht geschickt`,
          link: `/rentals/${message.rentalId}`,
          read: false,
          createdAt: message.createdAt,
          relatedUser: message.sender,
        })
      })

      // Add recent rental updates
      rentalsData.rentals
        .filter((rental: any) => {
          const isRecent = new Date(rental.updatedAt) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
          return isRecent && (rental.status === "pending" || rental.status === "confirmed")
        })
        .forEach((rental: any) => {
          const isOwner = rental.ownerId === session!.user.id
          let title = ""
          let description = ""

          if (rental.status === "pending" && isOwner) {
            title = "Neue Buchungsanfrage"
            description = `${rental.renter.name || "Jemand"} möchte "${rental.item.title}" ausleihen`
          } else if (rental.status === "confirmed" && !isOwner) {
            title = "Buchung bestätigt"
            description = `Deine Anfrage für "${rental.item.title}" wurde bestätigt`
          }

          if (title) {
            allNotifications.push({
              id: `rental-${rental.id}`,
              type: "rental",
              title,
              description,
              link: `/rentals/${rental.id}`,
              read: false,
              createdAt: rental.updatedAt,
              relatedUser: isOwner ? rental.renter : rental.owner,
            })
          }
        })

      // Add recent reviews
      reviewsData.reviews.forEach((review: any) => {
        allNotifications.push({
          id: `review-${review.id}`,
          type: "review",
          title: "Neue Bewertung",
          description: `${review.reviewer.name || "Jemand"} hat dich bewertet`,
          link: `/rentals/${review.rentalId}`,
          read: false,
          createdAt: review.createdAt,
          relatedUser: review.reviewer,
        })
      })

      // Sort by date
      allNotifications.sort((a, b) => 
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      )

      setNotifications(allNotifications)
    } catch (error) {
      console.error("Error fetching notifications:", error)
    } finally {
      setLoading(false)
    }
  }

  const getIcon = (type: string) => {
    switch (type) {
      case "message":
        return <MessageCircle className="h-5 w-5 text-blue-600" />
      case "rental":
        return <Calendar className="h-5 w-5 text-green-600" />
      case "review":
        return <Star className="h-5 w-5 text-yellow-500" />
      default:
        return <Bell className="h-5 w-5 text-gray-600" />
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
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <h1 className="text-3xl font-bold mb-8">Benachrichtigungen</h1>

      {notifications.length === 0 ? (
        <div className="text-center py-12">
          <Bell className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500">Keine neuen Benachrichtigungen</p>
        </div>
      ) : (
        <div className="space-y-4">
          {notifications.map((notification) => (
            <Link
              key={notification.id}
              href={notification.link}
              className={`block bg-white rounded-lg shadow-sm p-4 hover:shadow-md transition-shadow ${
                !notification.read ? "border-l-4 border-blue-600" : ""
              }`}
            >
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 mt-1">{getIcon(notification.type)}</div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900">
                        {notification.title}
                      </h3>
                      <p className="text-gray-600 mt-1">{notification.description}</p>
                    </div>
                    {notification.relatedUser && (
                      <div className="flex-shrink-0 ml-4">
                        {notification.relatedUser.avatarUrl ? (
                          <Image
                            src={notification.relatedUser.avatarUrl}
                            alt={notification.relatedUser.name || "User"}
                            width={40}
                            height={40}
                            className="rounded-full"
                          />
                        ) : (
                          <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center">
                            <User className="h-5 w-5 text-gray-600" />
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                  <p className="text-sm text-gray-500 mt-2">
                    {format(new Date(notification.createdAt), "dd. MMM yyyy, HH:mm", {
                      locale: de,
                    })}
                  </p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}