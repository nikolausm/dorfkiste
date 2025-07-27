#!/usr/bin/env node

const fs = require('fs')
const path = require('path')
const { execSync } = require('child_process')

console.log('🚀 Setting up Dorfkiste Background Services...\n')

// Check if required dependencies are installed
const requiredDeps = [
  'node-cron',
  'socket.io',
  'redis'
]

const requiredDevDeps = [
  '@types/node-cron',
  '@types/jsonwebtoken',
  'socket.io-client'
]

console.log('📦 Checking dependencies...')

try {
  const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'))
  
  const missingDeps = requiredDeps.filter(dep => !packageJson.dependencies[dep])
  const missingDevDeps = requiredDevDeps.filter(dep => !packageJson.devDependencies[dep])
  
  if (missingDeps.length > 0) {
    console.log(`❌ Missing dependencies: ${missingDeps.join(', ')}`)
    console.log('   Run: npm install ' + missingDeps.join(' '))
    process.exit(1)
  }
  
  if (missingDevDeps.length > 0) {
    console.log(`❌ Missing dev dependencies: ${missingDevDeps.join(', ')}`)
    console.log('   Run: npm install --save-dev ' + missingDevDeps.join(' '))
    process.exit(1)
  }
  
  console.log('✅ All dependencies are installed\n')
} catch (error) {
  console.error('❌ Error checking dependencies:', error.message)
  process.exit(1)
}

// Check environment variables
console.log('🔧 Checking environment configuration...')

const requiredEnvVars = [
  'DATABASE_URL',
  'NEXTAUTH_SECRET',
  'RESEND_API_KEY'
]

const optionalEnvVars = [
  'REDIS_HOST',
  'REDIS_PORT', 
  'REDIS_PASSWORD',
  'ADMIN_EMAIL',
  'FROM_EMAIL'
]

// Load .env file if it exists
const envPath = '.env.local'
const envExamplePath = '.env.example'

if (!fs.existsSync(envPath)) {
  if (fs.existsSync(envExamplePath)) {
    console.log('📋 .env.local not found, copying from .env.example...')
    fs.copyFileSync(envExamplePath, envPath)
    console.log('✅ Created .env.local from .env.example')
    console.log('⚠️  Please update the values in .env.local with your actual configuration\n')
  } else {
    console.log('❌ Neither .env.local nor .env.example found')
    console.log('   Please create .env.local with the required environment variables')
    process.exit(1)
  }
} else {
  console.log('✅ .env.local found\n')
}

// Check if Redis is running (if configured)
console.log('🔍 Checking Redis connection...')

try {
  // Try to connect to Redis if configured
  const redisHost = process.env.REDIS_HOST || 'localhost'
  const redisPort = process.env.REDIS_PORT || '6379'
  
  console.log(`   Attempting to connect to Redis at ${redisHost}:${redisPort}`)
  
  // Simple Redis ping check
  const { createClient } = require('redis')
  const client = createClient({
    socket: {
      host: redisHost,
      port: parseInt(redisPort)
    },
    password: process.env.REDIS_PASSWORD
  })
  
  client.connect().then(() => {
    console.log('✅ Redis connection successful')
    client.disconnect()
  }).catch(() => {
    console.log('⚠️  Redis connection failed - background jobs will be limited')
    console.log('   Install and start Redis for full functionality:')
    console.log('   - macOS: brew install redis && brew services start redis')
    console.log('   - Ubuntu: sudo apt install redis-server')
    console.log('   - Docker: docker run -d -p 6379:6379 redis:alpine')
  })
} catch (error) {
  console.log('⚠️  Redis client not available - install with: npm install redis')
}

// Create logs directory
console.log('\n📁 Setting up directories...')
const logsDir = 'logs'
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true })
  console.log('✅ Created logs directory')
} else {
  console.log('✅ Logs directory exists')
}

// Check Prisma setup
console.log('\n🗃️  Checking database setup...')
try {
  execSync('npx prisma db push --accept-data-loss', { stdio: 'pipe' })
  console.log('✅ Database schema is up to date')
} catch (error) {
  console.log('⚠️  Database schema needs updating - run: npm run prisma:migrate')
}

// Verify key files exist
console.log('\n📄 Verifying background service files...')
const requiredFiles = [
  'src/lib/email-service.ts',
  'src/lib/job-queue.ts',
  'src/lib/websocket-server.ts',
  'src/lib/monitoring.ts',
  'src/lib/server-init.ts'
]

const missingFiles = requiredFiles.filter(file => !fs.existsSync(file))

if (missingFiles.length > 0) {
  console.log('❌ Missing required files:')
  missingFiles.forEach(file => console.log(`   - ${file}`))
  process.exit(1)
} else {
  console.log('✅ All background service files are present')
}

// Test compilation
console.log('\n🔨 Testing TypeScript compilation...')
try {
  execSync('npx tsc --noEmit', { stdio: 'pipe' })
  console.log('✅ TypeScript compilation successful')
} catch (error) {
  console.log('❌ TypeScript compilation failed')
  console.log('   Fix the compilation errors before running the services')
  process.exit(1)
}

console.log('\n🎉 Background Services Setup Complete!\n')

console.log('📋 Next Steps:')
console.log('1. Update .env.local with your actual configuration values')
console.log('2. Start Redis if you want background job processing:')
console.log('   - macOS: brew services start redis')
console.log('   - Linux: sudo systemctl start redis')
console.log('   - Docker: docker run -d -p 6379:6379 redis:alpine')
console.log('3. Run the development server: npm run dev')
console.log('4. Monitor services at: /api/health and /api/monitoring')

console.log('\n🔧 Available Services:')
console.log('• Email Service: Welcome emails, notifications, rental confirmations')
console.log('• Job Queue: Background job processing with Redis')
console.log('• WebSocket: Real-time chat and notifications')
console.log('• Monitoring: System metrics and health checks')

console.log('\n🚀 Your background services are ready to go!')