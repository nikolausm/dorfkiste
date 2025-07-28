# Running Dorfkiste Application

## Quick Start

```bash
# Use the startup script
./start.sh
```

The application will run on **http://localhost:3000**

## Manual Setup

### 1. Prerequisites
- Node.js 18+ installed
- PostgreSQL running
- Redis (optional, for rate limiting)

### 2. Environment Setup
```bash
# Copy environment example
cp .env.example .env.local

# Edit .env.local with your settings
```

### 3. Database Setup
```bash
# Install dependencies
npm install

# Generate Prisma client
npm run prisma:generate

# Run migrations
npm run prisma:migrate

# (Optional) Seed database
npm run prisma:seed
```

### 4. Start the Application
```bash
# Development mode (port 3000)
npm run dev

# Production build
npm run build
npm start
```

## Available Scripts

- `npm run dev` - Start development server on port 3000
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run prisma:studio` - Open Prisma Studio (database GUI)
- `npm run test` - Run tests
- `npm run lint` - Run linting

## Troubleshooting

### Port 3000 Already in Use
```bash
# Find process using port 3000
lsof -i :3000

# Kill the process
kill -9 <PID>
```

### Database Connection Issues
1. Ensure PostgreSQL is running
2. Check DATABASE_URL in .env.local
3. Run `npm run prisma:migrate` to ensure database is up to date

### Redis Connection (Optional)
```bash
# Start Redis
redis-server --daemonize yes

# Check Redis status
redis-cli ping
```

## Security Features

The application includes:
- ✅ Rate limiting on all API endpoints
- ✅ CORS configuration
- ✅ Security headers (CSP, HSTS, etc.)
- ✅ Input validation
- ✅ XSS protection
- ✅ Authentication with NextAuth

## Important URLs

- Application: http://localhost:3000
- Prisma Studio: http://localhost:5555 (when running)
- API Routes: http://localhost:3000/api/*

## Testing Different Features

1. **User Registration**: http://localhost:3000/auth/signup
2. **Browse Items**: http://localhost:3000/items
3. **Categories**: http://localhost:3000/categories
4. **Create Listing**: http://localhost:3000/items/new (requires login)
5. **Admin Panel**: http://localhost:3000/admin (requires admin role)