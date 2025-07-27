import { Server as SocketIOServer } from 'socket.io'
import { Server as HTTPServer } from 'http'
import { verify } from 'jsonwebtoken'
import { logger } from './logger'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export interface SocketUser {
  id: string
  name?: string
  email: string
  socketId: string
}

export interface ChatMessage {
  id: string
  content: string
  senderId: string
  receiverId: string
  rentalId?: string
  timestamp: Date
  type: 'text' | 'image' | 'file' | 'system'
  metadata?: {
    fileName?: string
    fileSize?: number
    imageUrl?: string
  }
}

export interface Notification {
  id: string
  userId: string
  type: 'rental_request' | 'rental_confirmed' | 'payment_received' | 'message' | 'review' | 'system'
  title: string
  message: string
  data?: any
  read: boolean
  timestamp: Date
}

export interface RentalUpdate {
  rentalId: string
  status: string
  message?: string
  timestamp: Date
}

export class WebSocketServer {
  private io: SocketIOServer
  private connectedUsers = new Map<string, SocketUser>()
  private userSockets = new Map<string, Set<string>>() // userId -> Set of socketIds
  
  constructor(httpServer: HTTPServer) {
    this.io = new SocketIOServer(httpServer, {
      cors: {
        origin: process.env.NEXTAUTH_URL || "http://localhost:3000",
        methods: ["GET", "POST"],
        credentials: true
      },
      transports: ['websocket', 'polling']
    })

    this.setupMiddleware()
    this.setupEventHandlers()
    
    logger.info('WebSocket server initialized')
  }

  private setupMiddleware(): void {
    // Authentication middleware
    this.io.use(async (socket, next) => {
      try {
        const token = socket.handshake.auth.token || socket.handshake.headers.authorization?.replace('Bearer ', '')
        
        if (!token) {
          return next(new Error('Authentication token required'))
        }

        // Verify JWT token
        const decoded = verify(token, process.env.NEXTAUTH_SECRET!) as any
        
        // Get user from database
        const user = await prisma.user.findUnique({
          where: { id: decoded.userId || decoded.sub },
          select: {
            id: true,
            name: true,
            email: true
          }
        })

        if (!user) {
          return next(new Error('User not found'))
        }

        // Attach user to socket
        socket.data.user = user
        next()
      } catch (error) {
        logger.error('WebSocket authentication error:', error)
        next(new Error('Authentication failed'))
      }
    })
  }

  private setupEventHandlers(): void {
    this.io.on('connection', (socket) => {
      const user = socket.data.user
      logger.info(`User connected: ${user.email} (${socket.id})`)

      // Register user
      this.registerUser(socket, user)

      // Set up event handlers
      this.setupChatHandlers(socket)
      this.setupNotificationHandlers(socket)
      this.setupRentalHandlers(socket)
      this.setupPresenceHandlers(socket)

      // Handle disconnection
      socket.on('disconnect', () => {
        this.unregisterUser(socket, user)
        logger.info(`User disconnected: ${user.email} (${socket.id})`)
      })
    })
  }

  private registerUser(socket: any, user: any): void {
    const socketUser: SocketUser = {
      id: user.id,
      name: user.name,
      email: user.email,
      socketId: socket.id
    }

    this.connectedUsers.set(socket.id, socketUser)
    
    if (!this.userSockets.has(user.id)) {
      this.userSockets.set(user.id, new Set())
    }
    this.userSockets.get(user.id)!.add(socket.id)

    // Join user-specific room
    socket.join(`user:${user.id}`)

    // Send pending notifications
    this.sendPendingNotifications(user.id)
  }

  private unregisterUser(socket: any, user: any): void {
    this.connectedUsers.delete(socket.id)
    
    if (this.userSockets.has(user.id)) {
      this.userSockets.get(user.id)!.delete(socket.id)
      if (this.userSockets.get(user.id)!.size === 0) {
        this.userSockets.delete(user.id)
      }
    }
  }

  private setupChatHandlers(socket: any): void {
    // Send message
    socket.on('send_message', async (data: {
      receiverId: string
      content: string
      rentalId?: string
      type?: 'text' | 'image' | 'file'
      metadata?: any
    }) => {
      try {
        const sender = socket.data.user
        
        // Validate that users are connected via a rental
        if (data.rentalId) {
          const rental = await prisma.rental.findFirst({
            where: {
              id: data.rentalId,
              OR: [
                { renterId: sender.id, ownerId: data.receiverId },
                { ownerId: sender.id, renterId: data.receiverId }
              ]
            }
          })

          if (!rental) {
            socket.emit('error', { message: 'Not authorized to send message for this rental' })
            return
          }
        }

        // Create message in database
        const message = await prisma.message.create({
          data: {
            content: data.content,
            senderId: sender.id,
            receiverId: data.receiverId,
            rentalId: data.rentalId,
            type: data.type || 'text',
            metadata: data.metadata
          },
          include: {
            sender: {
              select: { id: true, name: true, email: true }
            }
          }
        })

        const chatMessage: ChatMessage = {
          id: message.id,
          content: message.content,
          senderId: message.senderId,
          receiverId: message.receiverId,
          rentalId: message.rentalId || undefined,
          timestamp: message.createdAt,
          type: (message.type as any) || 'text',
          metadata: message.metadata as any
        }

        // Send to receiver
        this.sendToUser(data.receiverId, 'new_message', chatMessage)
        
        // Send confirmation to sender
        socket.emit('message_sent', { messageId: message.id, timestamp: message.createdAt })

        // Create notification for receiver
        await this.createNotification({
          userId: data.receiverId,
          type: 'message',
          title: `Neue Nachricht von ${sender.name}`,
          message: (data.content && typeof data.content === 'string' && data.content.length > 50) ? data.content.substring(0, 50) + '...' : data.content || '',
          data: { messageId: message.id, senderId: sender.id }
        })

        logger.info(`Message sent from ${sender.id} to ${data.receiverId}`)
      } catch (error) {
        logger.error('Error sending message:', error)
        socket.emit('error', { message: 'Failed to send message' })
      }
    })

    // Mark messages as read
    socket.on('mark_messages_read', async (data: { senderId: string, rentalId?: string }) => {
      try {
        const user = socket.data.user
        
        await prisma.message.updateMany({
          where: {
            receiverId: user.id,
            senderId: data.senderId,
            rentalId: data.rentalId || undefined,
            readAt: null
          },
          data: {
            readAt: new Date()
          }
        })

        // Notify sender that messages were read
        this.sendToUser(data.senderId, 'messages_read', {
          readBy: user.id,
          rentalId: data.rentalId
        })
      } catch (error) {
        logger.error('Error marking messages as read:', error)
      }
    })

    // Get chat history
    socket.on('get_chat_history', async (data: { 
      userId: string, 
      rentalId?: string, 
      limit?: number, 
      offset?: number 
    }) => {
      try {
        const user = socket.data.user
        
        const messages = await prisma.message.findMany({
          where: {
            OR: [
              { senderId: user.id, receiverId: data.userId },
              { senderId: data.userId, receiverId: user.id }
            ],
            rentalId: data.rentalId || undefined
          },
          include: {
            sender: {
              select: { id: true, name: true }
            }
          },
          orderBy: { createdAt: 'desc' },
          take: data.limit || 50,
          skip: data.offset || 0
        })

        socket.emit('chat_history', messages.reverse())
      } catch (error) {
        logger.error('Error getting chat history:', error)
        socket.emit('error', { message: 'Failed to get chat history' })
      }
    })
  }

  private setupNotificationHandlers(socket: any): void {
    // Get notifications
    socket.on('get_notifications', async (data: { limit?: number, offset?: number }) => {
      try {
        const user = socket.data.user
        
        const notifications = await prisma.notification.findMany({
          where: { userId: user.id },
          orderBy: { createdAt: 'desc' },
          take: data.limit || 20,
          skip: data.offset || 0
        })

        socket.emit('notifications', notifications)
      } catch (error) {
        logger.error('Error getting notifications:', error)
      }
    })

    // Mark notification as read
    socket.on('mark_notification_read', async (data: { notificationId: string }) => {
      try {
        const user = socket.data.user
        
        await prisma.notification.update({
          where: {
            id: data.notificationId,
            userId: user.id
          },
          data: { read: true }
        })

        socket.emit('notification_read', { notificationId: data.notificationId })
      } catch (error) {
        logger.error('Error marking notification as read:', error)
      }
    })

    // Mark all notifications as read
    socket.on('mark_all_notifications_read', async () => {
      try {
        const user = socket.data.user
        
        await prisma.notification.updateMany({
          where: {
            userId: user.id,
            read: false
          },
          data: { read: true }
        })

        socket.emit('all_notifications_read')
      } catch (error) {
        logger.error('Error marking all notifications as read:', error)
      }
    })
  }

  private setupRentalHandlers(socket: any): void {
    // Join rental room
    socket.on('join_rental', (data: { rentalId: string }) => {
      socket.join(`rental:${data.rentalId}`)
      logger.info(`User ${socket.data.user.id} joined rental room ${data.rentalId}`)
    })

    // Leave rental room
    socket.on('leave_rental', (data: { rentalId: string }) => {
      socket.leave(`rental:${data.rentalId}`)
      logger.info(`User ${socket.data.user.id} left rental room ${data.rentalId}`)
    })

    // Update rental status
    socket.on('update_rental_status', async (data: { 
      rentalId: string, 
      status: string, 
      message?: string 
    }) => {
      try {
        const user = socket.data.user
        
        // Verify user is owner of the rental
        const rental = await prisma.rental.findFirst({
          where: {
            id: data.rentalId,
            ownerId: user.id
          }
        })

        if (!rental) {
          socket.emit('error', { message: 'Not authorized to update this rental' })
          return
        }

        // Update rental status
        await prisma.rental.update({
          where: { id: data.rentalId },
          data: { status: data.status as any }
        })

        const update: RentalUpdate = {
          rentalId: data.rentalId,
          status: data.status,
          message: data.message,
          timestamp: new Date()
        }

        // Notify all users in rental room
        this.io.to(`rental:${data.rentalId}`).emit('rental_updated', update)
        
        logger.info(`Rental ${data.rentalId} status updated to ${data.status}`)
      } catch (error) {
        logger.error('Error updating rental status:', error)
        socket.emit('error', { message: 'Failed to update rental status' })
      }
    })
  }

  private setupPresenceHandlers(socket: any): void {
    // User typing indicator
    socket.on('typing_start', (data: { receiverId: string, rentalId?: string }) => {
      this.sendToUser(data.receiverId, 'user_typing', {
        userId: socket.data.user.id,
        userName: socket.data.user.name,
        rentalId: data.rentalId
      })
    })

    socket.on('typing_stop', (data: { receiverId: string, rentalId?: string }) => {
      this.sendToUser(data.receiverId, 'user_stopped_typing', {
        userId: socket.data.user.id,
        rentalId: data.rentalId
      })
    })

    // Get online users
    socket.on('get_online_users', () => {
      const onlineUsers = Array.from(this.userSockets.keys())
      socket.emit('online_users', onlineUsers)
    })
  }

  // Public methods for external use
  public sendToUser(userId: string, event: string, data: any): void {
    this.io.to(`user:${userId}`).emit(event, data)
  }

  public sendToRental(rentalId: string, event: string, data: any): void {
    this.io.to(`rental:${rentalId}`).emit(event, data)
  }

  public async createNotification(notification: Omit<Notification, 'id' | 'timestamp' | 'read'>): Promise<void> {
    try {
      const newNotification = await prisma.notification.create({
        data: {
          ...notification,
          read: false,
          data: notification.data || {}
        }
      })

      // Send real-time notification
      this.sendToUser(notification.userId, 'new_notification', newNotification)
      
      logger.info(`Notification created for user ${notification.userId}: ${notification.title}`)
    } catch (error) {
      logger.error('Error creating notification:', error)
    }
  }

  public async broadcastToAllUsers(event: string, data: any): Promise<void> {
    this.io.emit(event, data)
    logger.info(`Broadcasted ${event} to all connected users`)
  }

  public async sendPendingNotifications(userId: string): Promise<void> {
    try {
      const notifications = await prisma.notification.findMany({
        where: {
          userId,
          read: false
        },
        orderBy: { createdAt: 'desc' },
        take: 10
      })

      if (notifications.length > 0) {
        this.sendToUser(userId, 'pending_notifications', notifications)
      }
    } catch (error) {
      logger.error('Error sending pending notifications:', error)
    }
  }

  public getConnectedUsersCount(): number {
    return this.connectedUsers.size
  }

  public isUserOnline(userId: string): boolean {
    return this.userSockets.has(userId)
  }

  public getConnectedUsers(): SocketUser[] {
    return Array.from(this.connectedUsers.values())
  }

  public getStats(): {
    connectedUsers: number
    totalConnections: number
    onlineUsers: number
  } {
    return {
      connectedUsers: this.connectedUsers.size,
      totalConnections: this.connectedUsers.size,
      onlineUsers: this.userSockets.size
    }
  }
}

// Singleton instance
let webSocketServer: WebSocketServer | null = null

export function initializeWebSocketServer(httpServer: HTTPServer): WebSocketServer {
  if (!webSocketServer) {
    webSocketServer = new WebSocketServer(httpServer)
  }
  return webSocketServer
}

export function getWebSocketServer(): WebSocketServer | null {
  return webSocketServer
}

export default WebSocketServer