"use client"

import { useState, useEffect, useRef } from "react"
import { useSession } from "next-auth/react"
import Image from "next/image"
import { format } from "date-fns"
import { de } from "date-fns/locale"
import { Send, User, Loader2 } from "lucide-react"

interface Message {
  id: string
  content: string
  createdAt: string
  read: boolean
  sender: {
    id: string
    name: string | null
    avatarUrl: string | null
  }
}

interface MessageThreadProps {
  rentalId: string
  otherUser: {
    id: string
    name: string | null
    avatarUrl: string | null
    email: string
  }
}

export default function MessageThread({ rentalId, otherUser }: MessageThreadProps) {
  const { data: session } = useSession()
  const [messages, setMessages] = useState<Message[]>([])
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const [newMessage, setNewMessage] = useState("")
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    fetchMessages()
    // Poll for new messages every 5 seconds
    const interval = setInterval(fetchMessages, 5000)
    return () => clearInterval(interval)
  }, [rentalId])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const fetchMessages = async () => {
    try {
      const response = await fetch(`/api/messages?rentalId=${rentalId}`)
      if (response.ok) {
        const data = await response.json()
        setMessages(data)
      }
    } catch (error) {
      console.error("Error fetching messages:", error)
    } finally {
      setLoading(false)
    }
  }

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newMessage.trim()) return

    setSending(true)
    try {
      const response = await fetch("/api/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          rentalId,
          content: newMessage.trim(),
        }),
      })

      if (response.ok) {
        const message = await response.json()
        setMessages([...messages, message])
        setNewMessage("")
      }
    } catch (error) {
      console.error("Error sending message:", error)
    } finally {
      setSending(false)
    }
  }

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center py-8">
        <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg shadow-sm">
      {/* Header */}
      <div className="border-b px-4 py-3">
        <div className="flex items-center gap-3">
          {otherUser.avatarUrl ? (
            <Image
              src={otherUser.avatarUrl}
              alt={otherUser.name || "User"}
              width={40}
              height={40}
              className="rounded-full"
            />
          ) : (
            <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center">
              <User className="h-5 w-5 text-gray-600" />
            </div>
          )}
          <div>
            <p className="font-medium">{otherUser.name || "Unbekannt"}</p>
            <p className="text-sm text-gray-600">Nachrichten zur Buchung</p>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="h-96 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 ? (
          <p className="text-center text-gray-500 py-8">
            Noch keine Nachrichten. Beginne die Unterhaltung!
          </p>
        ) : (
          messages.map((message) => {
            const isOwnMessage = message.sender.id === session?.user?.id
            return (
              <div
                key={message.id}
                className={`flex ${isOwnMessage ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[70%] ${
                    isOwnMessage
                      ? "bg-blue-600 text-white"
                      : "bg-gray-100 text-gray-900"
                  } rounded-lg px-4 py-2`}
                >
                  <p className="break-words">{message.content}</p>
                  <p
                    className={`text-xs mt-1 ${
                      isOwnMessage ? "text-blue-100" : "text-gray-500"
                    }`}
                  >
                    {format(new Date(message.createdAt), "HH:mm", { locale: de })}
                  </p>
                </div>
              </div>
            )
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <form onSubmit={sendMessage} className="border-t p-4">
        <div className="flex gap-2">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Nachricht schreiben..."
            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={sending}
          />
          <button
            type="submit"
            disabled={sending || !newMessage.trim()}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Send className="h-5 w-5" />
          </button>
        </div>
      </form>
    </div>
  )
}