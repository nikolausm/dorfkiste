# Dorfkiste Background Services

Production-scale background services für die Dorfkiste Nachbarschafts-Verleihplattform.

## Übersicht

Das Background Service System besteht aus vier Hauptkomponenten:

1. **Email Service** - Transactional Email System mit Resend Integration
2. **Job Queue** - Background Job Processing mit Redis und Node-Cron
3. **WebSocket Service** - Real-time Communication für Chat und Notifications
4. **Monitoring Service** - System Metrics und Health Monitoring

## Quick Start

### 1. Setup ausführen
```bash
npm run setup:background
```

### 2. Redis starten (optional, für Job Queue)
```bash
# macOS mit Homebrew
brew install redis
brew services start redis

# Ubuntu/Debian
sudo apt install redis-server
sudo systemctl start redis

# Docker
docker run -d -p 6379:6379 redis:alpine
```

### 3. Environment Variablen konfigurieren
Kopiere `.env.example` zu `.env.local` und konfiguriere:

```env
# Required
DATABASE_URL="postgresql://..."
NEXTAUTH_SECRET="your-secret"
RESEND_API_KEY="re_..."

# Optional (Redis für Job Queue)
REDIS_HOST="localhost"
REDIS_PORT="6379"
REDIS_PASSWORD=""

# Email Configuration
FROM_EMAIL="Dorfkiste <noreply@yourdomain.com>"
ADMIN_EMAIL="admin@yourdomain.com"
```

### 4. Services starten
```bash
npm run dev
```

## Services im Detail

### 📧 Email Service (`/src/lib/email-service.ts`)

**Features:**
- Welcome Email bei Registrierung
- Rental Confirmation bei Buchungsbestätigung  
- Payment Receipt nach erfolgreicher Zahlung
- Rental Reminder 1 Tag vor Mietbeginn
- Review Request nach Mietende
- Password Reset Emails
- Admin Notifications

**Email Templates:**
- Responsive HTML Design mit Dorfkiste Branding
- Plain Text Fallback
- Deutsche Lokalisierung
- Mobile-optimiert

**Verwendung:**
```typescript
import { sendWelcomeEmail } from '@/lib/email-service'

await sendWelcomeEmail({
  id: user.id,
  name: user.name,
  email: user.email
})
```

### ⚙️ Job Queue (`/src/lib/job-queue.ts`)

**Features:**
- Redis-basierte Job Queue mit Bull Queue ähnlicher API
- Cron-basierte Scheduled Jobs
- Retry Logic mit exponential backoff
- Job Status Monitoring
- Parallele Job-Verarbeitung

**Job Types:**
- `send_email` - Email Versand
- `rental_reminder` - Miet-Erinnerungen
- `review_request` - Bewertungsanfragen
- `payment_processing` - Zahlungsverarbeitung
- `cleanup_expired_tokens` - Token Cleanup
- `daily_stats` - Tägliche Statistiken

**Scheduled Jobs:**
- Tägliche Cleanup (2:00 Uhr)
- Tägliche Statistiken (6:00 Uhr)
- Wöchentliche Reports (Montag 8:00 Uhr)
- Rental Reminders (täglich 9:00 Uhr)

**Verwendung:**
```typescript
import { getJobQueue } from '@/lib/job-queue'

const queue = await getJobQueue()

// Sofortiger Job
await queue.addJob('send_email', { 
  emailFunction: 'sendWelcomeEmail',
  params: [user]
})

// Delayed Job
await queue.addJob('rental_reminder', 
  { rentalId }, 
  { delay: 24 * 60 * 60 * 1000 } // 24h
)
```

### 🔌 WebSocket Service (`/src/lib/websocket-server.ts`)

**Features:**
- Socket.io basierte Real-time Communication
- JWT Authentication
- Chat Messaging zwischen Usern
- Live Notifications
- Rental Status Updates
- Typing Indicators
- Online User Presence

**Supported Events:**
- `send_message` - Nachricht senden
- `new_message` - Neue Nachricht empfangen
- `typing_start/stop` - Typing Indicators
- `new_notification` - Push Notifications
- `rental_updated` - Rental Status Changes

**Verwendung (Client):**
```typescript
import { io } from 'socket.io-client'

const socket = io({
  auth: { token: 'jwt-token' }
})

socket.emit('send_message', {
  receiverId: 'user-id',
  content: 'Hello!',
  rentalId: 'rental-id'
})
```

**Verwendung (Server):**
```typescript
import { getWebSocketServer } from '@/lib/websocket-server'

const wsServer = getWebSocketServer()
wsServer?.sendToUser(userId, 'new_notification', notification)
```

### 📊 Monitoring Service (`/src/lib/monitoring.ts`)

**Features:**
- System Health Monitoring
- Performance Metrics Tracking
- Alert Management
- Request Response Time Tracking
- Memory und Database Monitoring

**Metriken:**
- Job Queue Status (pending, active, completed, failed)
- WebSocket Connections
- Database Response Time
- Memory Usage
- API Response Times
- Error Rates

**Alerts:**
- Memory Usage >80% (Warning) / >90% (Critical)
- Database Response Time >1s
- Error Rate >5% (Warning) / >15% (Critical)
- Hohe Anzahl pending/failed Jobs

**API Endpoints:**
```bash
# Health Check
GET /api/health

# Current Metrics
GET /api/monitoring?action=current

# Metrics History
GET /api/monitoring?action=history&hours=24

# Active Alerts
GET /api/monitoring?action=alerts
```

## API Integration

### Email Triggers

**User Registration:**
```typescript
// In /api/auth/register
await sendWelcomeEmail(user)
await sendAdminNotificationEmail('new_user', user)
```

**Rental Creation:**
```typescript
// In /api/rentals
await sendNewRentalRequestEmail(rental)
await jobQueue.scheduleRentalReminder(rental.id, reminderDate)
await jobQueue.scheduleReviewRequest(rental.id, reviewDate)
```

**Rental Confirmation:**
```typescript
// In /api/rentals/[id] 
await sendRentalConfirmationEmail(rental)
wsServer?.createNotification({
  userId: rental.renterId,
  type: 'rental_confirmed',
  title: 'Buchung bestätigt!',
  message: `Ihre Buchung wurde bestätigt.`
})
```

### Performance Tracking

```typescript
import { withPerformanceTracking } from '@/lib/middleware/performance-tracking'

export const GET = withPerformanceTracking(async (req: NextRequest) => {
  // Your API logic
})
```

## Monitoring & Observability

### Health Checks
```bash
# Service Health
npm run services:health

# Detailed Monitoring
npm run services:monitoring

# Redis Status
npm run redis:status
```

### Log Files
- Anwendungs-Logs: `logs/application-YYYY-MM-DD.log`
- Error-Logs: `logs/error-YYYY-MM-DD.log`
- Job-Logs: In Redis mit TTL

### Performance Metrics
- Request Response Times
- Database Query Performance
- Email Delivery Status
- Job Processing Times
- WebSocket Connection Stats

## Production Deployment

### Environment Setup
```env
NODE_ENV=production
REDIS_URL=redis://production-redis:6379
DATABASE_URL=postgresql://prod-db
RESEND_API_KEY=re_live_...
```

### Process Management
```bash
# PM2 Configuration
npm install -g pm2
pm2 start ecosystem.config.js
```

### Monitoring Alerts
- Setup Webhooks für Critical Alerts
- Configure Email Notifications für Admin
- Monitor Job Queue Backlogs
- Track Response Time Degradation

### Scaling Considerations
- Redis Cluster für High Availability
- Multiple Job Workers
- WebSocket Load Balancing
- Database Connection Pooling

## Troubleshooting

### Job Queue Issues
```bash
# Check Redis connection
npm run redis:status

# View queue statistics
curl http://localhost:3000/api/monitoring?action=current
```

### Email Delivery Problems
```bash
# Check Resend API key
curl -H "Authorization: Bearer $RESEND_API_KEY" https://api.resend.com/domains

# View email logs
grep "email" logs/application-$(date +%Y-%m-%d).log
```

### WebSocket Connection Issues
```bash
# Check WebSocket server status
curl http://localhost:3000/api/health

# Monitor WebSocket connections
curl http://localhost:3000/api/monitoring?action=current | jq '.metrics.webSocket'
```

### Performance Issues
```bash
# View slow endpoints
curl http://localhost:3000/api/monitoring?action=current | jq '.metrics.performance'

# Check system alerts
curl http://localhost:3000/api/monitoring?action=alerts
```

## API Reference

### Email Service
```typescript
// Send welcome email
sendWelcomeEmail(user: User): Promise<any>

// Send rental confirmation
sendRentalConfirmationEmail(rental: Rental): Promise<any>

// Send payment receipt
sendPaymentReceiptEmail(rental: Rental, paymentId: string): Promise<any>

// Send admin notification
sendAdminNotificationEmail(type: string, data: any): Promise<any>
```

### Job Queue
```typescript
// Add immediate job
addJob(type: JobType, data: any, options?: JobOptions): Promise<string>

// Schedule job
scheduleRentalReminder(rentalId: string, date: Date): Promise<string>

// Get queue statistics
getStats(): Promise<QueueStats>
```

### WebSocket Server
```typescript
// Send to specific user
sendToUser(userId: string, event: string, data: any): void

// Send to rental participants
sendToRental(rentalId: string, event: string, data: any): void

// Create notification
createNotification(notification: NotificationData): Promise<void>
```

### Monitoring Service
```typescript
// Get current metrics
getLatestMetrics(): SystemMetrics | null

// Get metrics history
getMetricsHistory(hours: number): SystemMetrics[]

// Check system health
isHealthy(): boolean

// Get health score
getHealthScore(): number
```

## Support

Bei Problemen oder Fragen zu den Background Services:

1. Überprüfe die Logs in `/logs/`
2. Teste die Health Endpoints
3. Verifiziere Environment Variablen
4. Prüfe Redis/Database Connections

Für produktive Deployments sollten zusätzliche Monitoring Tools wie Prometheus, Grafana oder DataDog integriert werden.