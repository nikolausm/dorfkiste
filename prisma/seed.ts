import { PrismaClient } from '@prisma/client'
import { hash } from 'bcryptjs'
import { getImages } from '../src/lib/images'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Starting database seed...')

  // Clean existing data (optional - comment out if you want to keep existing data)
  // await prisma.message.deleteMany()
  // await prisma.review.deleteMany()
  // await prisma.rental.deleteMany()
  // await prisma.itemImage.deleteMany()
  // await prisma.item.deleteMany()
  // await prisma.user.deleteMany()
  // await prisma.category.deleteMany()

  // Create categories
  const categories = [
    { name: 'Werkzeuge', slug: 'werkzeuge', icon: '🔧', description: 'Handwerkzeuge und Elektrowerkzeuge' },
    { name: 'Gartengeräte', slug: 'gartengeraete', icon: '🌱', description: 'Rasenmäher, Heckenscheren und mehr' },
    { name: 'Küchengeräte', slug: 'kuechengeraete', icon: '🍳', description: 'Mixer, Küchenmaschinen und Spezialgeräte' },
    { name: 'Sport & Freizeit', slug: 'sport-freizeit', icon: '⚽', description: 'Sportgeräte und Freizeitartikel' },
    { name: 'Elektronik', slug: 'elektronik', icon: '📱', description: 'Kameras, Beamer und andere Elektronik' },
    { name: 'Camping', slug: 'camping', icon: '🏕️', description: 'Zelte, Schlafsäcke und Campingausrüstung' },
    { name: 'Partybedarf', slug: 'partybedarf', icon: '🎉', description: 'Pavillons, Biertischgarnituren und mehr' },
    { name: 'Kinderbedarf', slug: 'kinderbedarf', icon: '👶', description: 'Kinderwagen, Autositze und Spielzeug' },
    { name: 'Haushalt', slug: 'haushalt', icon: '🏠', description: 'Reinigungsgeräte und Haushaltshelfer' },
    { name: 'Sonstiges', slug: 'sonstiges', icon: '📦', description: 'Alles andere' }
  ]

  for (const category of categories) {
    await prisma.category.upsert({
      where: { slug: category.slug },
      update: {},
      create: category,
    })
  }

  console.log('✅ Categories seeded successfully!')

  // Create test users
  const hashedPassword = await hash('password123', 10)

  const user1 = await prisma.user.upsert({
    where: { email: 'max.mustermann@example.com' },
    update: {},
    create: {
      email: 'max.mustermann@example.com',
      password: hashedPassword,
      name: 'Max Mustermann',
      bio: 'Ich bin Max und verleihe gerne meine Werkzeuge an Nachbarn.',
      verified: true,
      avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=max'
    }
  })

  const user2 = await prisma.user.upsert({
    where: { email: 'anna.schmidt@example.com' },
    update: {},
    create: {
      email: 'anna.schmidt@example.com',
      password: hashedPassword,
      name: 'Anna Schmidt',
      bio: 'Hallo! Ich bin Anna und teile gerne meine Gartengeräte mit der Nachbarschaft.',
      verified: true,
      avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=anna'
    }
  })

  console.log('✅ Created 2 test users')

  // Get categories
  const werkzeugCategory = await prisma.category.findUnique({ where: { slug: 'werkzeuge' } })
  const gartenCategory = await prisma.category.findUnique({ where: { slug: 'gartengeraete' } })
  const elektronikCategory = await prisma.category.findUnique({ where: { slug: 'elektronik' } })
  const sportCategory = await prisma.category.findUnique({ where: { slug: 'sport-freizeit' } })

  if (!werkzeugCategory || !gartenCategory || !elektronikCategory || !sportCategory) {
    throw new Error('Failed to find categories')
  }

  // Create items for user1
  const bohrmaschineImages = await getImages('drill');
  const bohrmaschine = await prisma.item.upsert({
    where: { 
      id: 'bohrmaschine-1' // Using a stable ID for upsert
    },
    update: {},
    create: {
      id: 'bohrmaschine-1',
      title: 'Bosch Schlagbohrmaschine PSB 750 RCE',
      description: 'Leistungsstarke Schlagbohrmaschine für alle Heimwerkerarbeiten. Inkl. Koffer und Bohrer-Set.\n\n- 750 Watt\n- Schnellspannbohrfutter\n- Elektronische Drehzahlregelung\n- Rechts-/Linkslauf',
      condition: 'sehr gut',
      pricePerDay: 15,
      pricePerHour: 5,
      deposit: 50,
      available: true,
      location: 'Musterstadt, Hauptstraße 10',
      latitude: 48.1351,
      longitude: 11.5820,
      userId: user1.id,
      categoryId: werkzeugCategory.id,
      images: {
        create: bohrmaschineImages.map((url: string, i: number) => ({ url, order: i }))
      }
    }
  })

  const rasenmaeherImages = await getImages('lawn mower');
  const rasenmaeher = await prisma.item.upsert({
    where: { id: 'rasenmaeher-1' },
    update: {},
    create: {
      id: 'rasenmaeher-1',
      title: 'Elektro-Rasenmäher mit Fangkorb',
      description: 'Zuverlässiger Elektro-Rasenmäher für kleine bis mittlere Gärten.\n\n- Schnittbreite: 35cm\n- 40L Fangkorb\n- Höhenverstellbar\n- Inkl. Verlängerungskabel',
      condition: 'gut',
      pricePerDay: 20,
      deposit: 40,
      available: true,
      location: 'Musterstadt, Hauptstraße 10',
      latitude: 48.1351,
      longitude: 11.5820,
      userId: user1.id,
      categoryId: gartenCategory.id,
      images: {
        create: rasenmaeherImages.map((url: string, i: number) => ({ url, order: i }))
      }
    }
  })

  // Create items for user2
  const heckenschereImages = await getImages('hedge trimmer');
  const heckenschere = await prisma.item.upsert({
    where: { id: 'heckenschere-1' },
    update: {},
    create: {
      id: 'heckenschere-1',
      title: 'Bosch Heckenschere AHS 50-20',
      description: 'Elektrische Heckenschere für perfekt geschnittene Hecken.\n\n- Messerlänge: 50cm\n- Schnittstärke: 20mm\n- Gewicht: 2,8kg\n- Inkl. Messerschutz',
      condition: 'sehr gut',
      pricePerDay: 12,
      pricePerHour: 4,
      deposit: 30,
      available: true,
      location: 'Musterstadt, Gartenweg 5',
      latitude: 48.1400,
      longitude: 11.5850,
      userId: user2.id,
      categoryId: gartenCategory.id,
      images: {
        create: heckenschereImages.map((url: string, i: number) => ({ url, order: i }))
      }
    }
  })

  const beamerImages = await getImages('projector');
  const beamer = await prisma.item.upsert({
    where: { id: 'beamer-1' },
    update: {},
    create: {
      id: 'beamer-1',
      title: 'Full HD Beamer mit Leinwand',
      description: 'Perfekt für Filmabende oder Präsentationen.\n\n- Full HD Auflösung\n- 3000 Lumen\n- HDMI, USB, VGA Anschlüsse\n- Inkl. 100" Leinwand und Kabel',
      condition: 'sehr gut',
      pricePerDay: 30,
      deposit: 100,
      available: true,
      location: 'Musterstadt, Gartenweg 5',
      latitude: 48.1400,
      longitude: 11.5850,
      userId: user2.id,
      categoryId: elektronikCategory.id,
      images: {
        create: beamerImages.map((url: string, i: number) => ({ url, order: i }))
      }
    }
  })

  const fahrradanhaengerImages = await getImages('bike trailer');
  const fahrradanhaenger = await prisma.item.upsert({
    where: { id: 'fahrradanhaenger-1' },
    update: {},
    create: {
      id: 'fahrradanhaenger-1',
      title: 'Fahrradanhänger für 2 Kinder',
      description: 'Sicherer und komfortabler Fahrradanhänger.\n\n- Platz für 2 Kinder\n- 5-Punkt-Gurtsystem\n- Regenverdeck\n- Federung\n- Inkl. Kupplung',
      condition: 'gut',
      pricePerDay: 25,
      deposit: 50,
      available: true,
      location: 'Musterstadt, Gartenweg 5',
      latitude: 48.1400,
      longitude: 11.5850,
      userId: user2.id,
      categoryId: sportCategory.id,
      images: {
        create: fahrradanhaengerImages.map((url: string, i: number) => ({ url, order: i }))
      }
    }
  })

  console.log('✅ Created 5 items with images')

  // Create a test rental (user2 wants to rent bohrmaschine from user1)
  const existingRental = await prisma.rental.findFirst({
    where: {
      itemId: bohrmaschine.id,
      renterId: user2.id,
      status: 'pending'
    }
  })

  if (!existingRental) {
    const rental = await prisma.rental.create({
      data: {
        itemId: bohrmaschine.id,
        ownerId: user1.id,
        renterId: user2.id,
        startDate: new Date(Date.now() + 24 * 60 * 60 * 1000), // Tomorrow
        endDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // In 3 days
        totalPrice: 30,
        depositPaid: 50,
        status: 'pending'
      }
    })

    // Create a message in the rental
    await prisma.message.create({
      data: {
        content: 'Hallo Max, ist die Bohrmaschine am Wochenende verfügbar? Ich würde sie gerne für ein Heimwerkerprojekt ausleihen.',
        senderId: user2.id,
        rentalId: rental.id
      }
    })

    console.log('✅ Created 1 test rental with message')
  }

  console.log('\n🎉 Seed completed successfully!')
  console.log('\n📧 Test accounts:')
  console.log('  - max.mustermann@example.com (password: password123)')
  console.log('  - anna.schmidt@example.com (password: password123)')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })