import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'

export async function POST() {
  try {
    // Create categories
    const categories = [
      { id: 'elektronik', name: 'Elektronik', slug: 'elektronik', description: 'Smartphones, Laptops, Kameras und mehr' },
      { id: 'werkzeuge', name: 'Werkzeuge', slug: 'werkzeuge', description: 'Bohrmaschinen, Sägen, Handwerkzeug' },
      { id: 'sport', name: 'Sport & Freizeit', slug: 'sport', description: 'Sportgeräte, Fahrräder, Outdoor-Equipment' },
      { id: 'haushalt', name: 'Haushalt', slug: 'haushalt', description: 'Küchengeräte, Reinigungsgeräte, Möbel' },
      { id: 'garten', name: 'Garten', slug: 'garten', description: 'Rasenmäher, Gartengeräte, Werkzeug für den Garten' },
      { id: 'fahrzeuge', name: 'Fahrzeuge', slug: 'fahrzeuge', description: 'Fahrräder, E-Scooter, Anhänger' },
      { id: 'medien', name: 'Medien & Unterhaltung', slug: 'medien', description: 'Bücher, Spiele, Musikinstrumente' },
      { id: 'sonstiges', name: 'Sonstiges', slug: 'sonstiges', description: 'Alles andere' }
    ]

    for (const category of categories) {
      await prisma.category.upsert({
        where: { id: category.id },
        update: {},
        create: category
      })
    }

    // Create admin user
    const hashedPassword = await bcrypt.hash('admin123', 12)
    const adminUser = await prisma.user.upsert({
      where: { email: 'admin@dorfkiste.de' },
      update: {},
      create: {
        email: 'admin@dorfkiste.de',
        password: hashedPassword,
        name: 'Admin User',
        isAdmin: true,
        verified: true
      }
    })

    // Create test user
    const testUser = await prisma.user.upsert({
      where: { email: 'test@example.com' },
      update: {},
      create: {
        email: 'test@example.com',
        password: hashedPassword,
        name: 'Test User',
        verified: true
      }
    })

    // Create platform settings
    await prisma.platformSettings.upsert({
      where: { id: 'default' },
      update: {},
      create: {
        id: 'default',
        platformFeePercentage: 10,
        paypalMode: 'sandbox'
      }
    })

    // Create sample items
    const sampleItems = [
      {
        title: 'Bosch Akkuschrauber',
        description: 'Professioneller Akkuschrauber von Bosch, 18V, mit 2 Akkus und Ladegerät.',
        condition: 'sehr gut',
        pricePerDay: 15,
        pricePerHour: 3,
        deposit: 50,
        location: 'München',
        userId: testUser.id,
        categoryId: 'werkzeuge'
      },
      {
        title: 'Canon EOS Kamera',
        description: 'Spiegelreflexkamera Canon EOS 800D mit 18-55mm Objektiv.',
        condition: 'sehr gut',
        pricePerDay: 25,
        pricePerHour: 5,
        deposit: 200,
        location: 'Hamburg',
        userId: testUser.id,
        categoryId: 'elektronik'
      },
      {
        title: 'Mountainbike Trek',
        description: 'Trek Mountainbike 29 Zoll, 21 Gänge, für alle Trails geeignet.',
        condition: 'gut',
        pricePerDay: 20,
        pricePerHour: 4,
        deposit: 100,
        location: 'Berlin',
        userId: testUser.id,
        categoryId: 'fahrzeuge'
      },
      {
        title: 'KitchenAid Küchenmaschine',
        description: 'Professionelle Küchenmaschine mit verschiedenen Aufsätzen.',
        condition: 'neu',
        pricePerDay: 12,
        pricePerHour: 2.5,
        deposit: 80,
        location: 'Köln',
        userId: testUser.id,
        categoryId: 'haushalt'
      }
    ]

    for (const itemData of sampleItems) {
      await prisma.item.create({
        data: itemData
      })
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Database seeded successfully',
      adminCredentials: {
        email: 'admin@dorfkiste.de',
        password: 'admin123'
      }
    })
  } catch (error) {
    console.error('Seeding error:', error)
    return NextResponse.json({ error: 'Failed to seed database' }, { status: 500 })
  }
}