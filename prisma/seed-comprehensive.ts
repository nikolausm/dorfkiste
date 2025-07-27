import { PrismaClient } from '@prisma/client'
import { hash } from 'bcryptjs'
import { addDays, subDays, addHours } from 'date-fns'
import { getImages } from '../src/lib/images'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Starting comprehensive database seed...')

  // Clean existing data
  await prisma.message.deleteMany()
  await prisma.review.deleteMany()
  await prisma.rental.deleteMany()
  await prisma.itemImage.deleteMany()
  await prisma.item.deleteMany()
  await prisma.user.deleteMany()
  await prisma.category.deleteMany()

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
    { name: 'Baumaschinen', slug: 'baumaschinen', icon: '🚜', description: 'Bagger, Rüttelplatten und schwere Maschinen' },
    { name: 'Sonstiges', slug: 'sonstiges', icon: '📦', description: 'Alles andere' }
  ]

  const createdCategories = await Promise.all(
    categories.map(cat => prisma.category.create({ data: cat }))
  )

  console.log(`✅ Created ${createdCategories.length} categories`)

  // Create 4 test users
  const hashedPassword = await hash('password123', 10)
  
  const users = await Promise.all([
    prisma.user.create({
      data: {
        email: 'max.mustermann@example.com',
        password: hashedPassword,
        name: 'Max Mustermann',
        bio: 'Handwerker und Hobbyheimwerker. Teile gerne meine Werkzeuge mit der Nachbarschaft.',
        verified: true,
        avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=max',
        createdAt: subDays(new Date(), 180) // User since 6 months
      }
    }),
    prisma.user.create({
      data: {
        email: 'anna.schmidt@example.com',
        password: hashedPassword,
        name: 'Anna Schmidt',
        bio: 'Gartenliebhaberin mit vielen Geräten. Sharing is caring!',
        verified: true,
        avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=anna',
        createdAt: subDays(new Date(), 150)
      }
    }),
    prisma.user.create({
      data: {
        email: 'thomas.mueller@example.com',
        password: hashedPassword,
        name: 'Thomas Müller',
        bio: 'Technik-Enthusiast und Outdoor-Fan. Verleihe gerne meine Ausrüstung.',
        verified: true,
        avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=thomas',
        createdAt: subDays(new Date(), 90)
      }
    }),
    prisma.user.create({
      data: {
        email: 'lisa.weber@example.com',
        password: hashedPassword,
        name: 'Lisa Weber',
        bio: 'Junge Familie mit vielen Kinder- und Haushaltssachen zum Teilen.',
        verified: true,
        avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=lisa',
        createdAt: subDays(new Date(), 120)
      }
    })
  ])

  console.log('✅ Created 4 test users')

  // Define items for each user (10 items per user)
  const itemsData = [
    // Max's items (Werkzeuge)
    {
      userId: users[0].id,
      items: [
        { title: 'Bosch Professional Schlagbohrmaschine', condition: 'sehr gut', pricePerDay: 15, deposit: 50, categorySlug: 'werkzeuge' },
        { title: 'Makita Akkuschrauber Set', condition: 'gut', pricePerDay: 12, deposit: 40, categorySlug: 'werkzeuge' },
        { title: 'Stichsäge Bosch PST 900', condition: 'sehr gut', pricePerDay: 10, deposit: 30, categorySlug: 'werkzeuge' },
        { title: 'Werkzeugkoffer 216-teilig', condition: 'gut', pricePerDay: 8, deposit: 25, categorySlug: 'werkzeuge' },
        { title: 'Leiter 3m Aluminium', condition: 'gut', pricePerDay: 7, deposit: 20, categorySlug: 'werkzeuge' },
        { title: 'Hochdruckreiniger Kärcher K5', condition: 'sehr gut', pricePerDay: 20, deposit: 60, categorySlug: 'haushalt' },
        { title: 'Fliesenschneider Profi', condition: 'gut', pricePerDay: 15, deposit: 40, categorySlug: 'werkzeuge' },
        { title: 'Betonmischer 140L', condition: 'gut', pricePerDay: 25, deposit: 80, categorySlug: 'werkzeuge' },
        { title: 'Winkelschleifer Bosch', condition: 'sehr gut', pricePerDay: 12, deposit: 35, categorySlug: 'werkzeuge' },
        { title: 'Schweißgerät MIG/MAG', condition: 'gut', pricePerDay: 30, deposit: 100, categorySlug: 'werkzeuge' }
      ]
    },
    // Anna's items (Garten)
    {
      userId: users[1].id,
      items: [
        { title: 'Rasenmäher Benzin Honda', condition: 'sehr gut', pricePerDay: 25, deposit: 70, categorySlug: 'gartengeraete' },
        { title: 'Heckenschere elektrisch Bosch', condition: 'sehr gut', pricePerDay: 12, deposit: 30, categorySlug: 'gartengeraete' },
        { title: 'Vertikutierer elektrisch', condition: 'gut', pricePerDay: 20, deposit: 50, categorySlug: 'gartengeraete' },
        { title: 'Laubsauger/Bläser Stihl', condition: 'sehr gut', pricePerDay: 15, deposit: 40, categorySlug: 'gartengeraete' },
        { title: 'Gartenhäcksler', condition: 'gut', pricePerDay: 18, deposit: 45, categorySlug: 'gartengeraete' },
        { title: 'Motorhacke/Gartenfräse', condition: 'gut', pricePerDay: 22, deposit: 60, categorySlug: 'gartengeraete' },
        { title: 'Bewässerungssystem komplett', condition: 'sehr gut', pricePerDay: 10, deposit: 25, categorySlug: 'gartengeraete' },
        { title: 'Gewächshaus faltbar 2x3m', condition: 'gut', pricePerDay: 15, deposit: 40, categorySlug: 'gartengeraete' },
        { title: 'Gartenparty-Set (Pavillons + Stehtische)', condition: 'gut', pricePerDay: 35, deposit: 80, categorySlug: 'partybedarf' },
        { title: 'Outdoor-Grill Weber', condition: 'sehr gut', pricePerDay: 20, deposit: 50, categorySlug: 'gartengeraete' }
      ]
    },
    // Thomas's items (Elektronik & Outdoor)
    {
      userId: users[2].id,
      items: [
        { title: 'Sony Alpha 7III Kamera + Objektive', condition: 'sehr gut', pricePerDay: 50, deposit: 200, categorySlug: 'elektronik' },
        { title: 'DJI Mavic Pro Drohne', condition: 'sehr gut', pricePerDay: 40, deposit: 150, categorySlug: 'elektronik' },
        { title: 'Beamer 4K Epson + Leinwand', condition: 'sehr gut', pricePerDay: 30, deposit: 100, categorySlug: 'elektronik' },
        { title: '6-Personen Camping-Zelt', condition: 'gut', pricePerDay: 25, deposit: 60, categorySlug: 'camping' },
        { title: 'Schlafsack-Set (4 Stück) -15°C', condition: 'gut', pricePerDay: 20, deposit: 40, categorySlug: 'camping' },
        { title: 'Campingkocher + Geschirr-Set', condition: 'sehr gut', pricePerDay: 12, deposit: 25, categorySlug: 'camping' },
        { title: 'Fahrradträger für 4 Räder', condition: 'gut', pricePerDay: 18, deposit: 45, categorySlug: 'sport-freizeit' },
        { title: 'Stand-Up-Paddle Board Set', condition: 'sehr gut', pricePerDay: 25, deposit: 70, categorySlug: 'sport-freizeit' },
        { title: 'GoPro Hero 11 + Zubehör', condition: 'sehr gut', pricePerDay: 20, deposit: 60, categorySlug: 'elektronik' },
        { title: 'Powerstation 1000W Solar', condition: 'sehr gut', pricePerDay: 35, deposit: 120, categorySlug: 'camping' }
      ]
    },
    // Lisa's items (Kinder & Haushalt)
    {
      userId: users[3].id,
      items: [
        { title: 'Kinderwagen Bugaboo Fox', condition: 'sehr gut', pricePerDay: 15, deposit: 50, categorySlug: 'kinderbedarf' },
        { title: 'Babywippe elektrisch', condition: 'sehr gut', pricePerDay: 8, deposit: 20, categorySlug: 'kinderbedarf' },
        { title: 'Reisebett + Matratze', condition: 'gut', pricePerDay: 10, deposit: 25, categorySlug: 'kinderbedarf' },
        { title: 'Hochstuhl Stokke Tripp Trapp', condition: 'gut', pricePerDay: 5, deposit: 15, categorySlug: 'kinderbedarf' },
        { title: 'Laufrad Puky', condition: 'gut', pricePerDay: 5, deposit: 15, categorySlug: 'kinderbedarf' },
        { title: 'Thermomix TM6', condition: 'sehr gut', pricePerDay: 25, deposit: 80, categorySlug: 'kuechengeraete' },
        { title: 'Kitchenaid Küchenmaschine', condition: 'gut', pricePerDay: 15, deposit: 40, categorySlug: 'kuechengeraete' },
        { title: 'Raclette-Grill für 8 Personen', condition: 'sehr gut', pricePerDay: 10, deposit: 25, categorySlug: 'kuechengeraete' },
        { title: 'Dampfreiniger Kärcher', condition: 'gut', pricePerDay: 12, deposit: 30, categorySlug: 'haushalt' },
        { title: 'Nähmaschine Singer + Zubehör', condition: 'sehr gut', pricePerDay: 15, deposit: 40, categorySlug: 'haushalt' }
      ]
    }
  ]

  // Create all items
  const allItems = []
  for (const userData of itemsData) {
    for (const itemData of userData.items) {
      const category = createdCategories.find(c => c.slug === itemData.categorySlug)
      if (!category) continue

      const images = await getImages(itemData.title);
      const item = await prisma.item.create({
        data: {
          title: itemData.title,
          description: `${itemData.title} in ${itemData.condition}em Zustand. Regelmäßig gewartet und gepflegt.`,
          condition: itemData.condition,
          pricePerDay: itemData.pricePerDay,
          deposit: itemData.deposit,
          available: true,
          location: 'Musterstadt',
          latitude: 48.1351 + (Math.random() - 0.5) * 0.1,
          longitude: 11.5820 + (Math.random() - 0.5) * 0.1,
          userId: userData.userId,
          categoryId: category.id,
          images: {
            create: images.map((url, i) => ({ url, order: i }))
          }
        }
      })
      allItems.push(item)
    }
  }

  console.log(`✅ Created ${allItems.length} items`)

  // Create rental history with various statuses
  const rentalHistories = []
  
  // Helper function to create rentals with messages and reviews
  async function createRentalWithHistory(
    item: any,
    renter: any,
    owner: any,
    startDate: Date,
    endDate: Date,
    status: string,
    includeReviews: boolean = false
  ) {
    const rental = await prisma.rental.create({
      data: {
        itemId: item.id,
        ownerId: owner.id,
        renterId: renter.id,
        startDate,
        endDate,
        totalPrice: Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) * item.pricePerDay,
        depositPaid: item.deposit,
        status
      }
    })

    // Add messages
    const messages = [
      { content: `Hallo, ist ${item.title} an den gewünschten Tagen verfügbar?`, senderId: renter.id },
      { content: 'Ja, das passt perfekt! Du kannst es gerne abholen.', senderId: owner.id },
      { content: 'Super, dann komme ich morgen vorbei. Danke!', senderId: renter.id }
    ]

    for (const msg of messages) {
      await prisma.message.create({
        data: {
          ...msg,
          rentalId: rental.id,
          read: true,
          createdAt: addHours(startDate, Math.random() * 24)
        }
      })
    }

    // Add reviews for completed rentals
    if (includeReviews && status === 'completed') {
      await prisma.review.create({
        data: {
          rentalId: rental.id,
          reviewerId: renter.id,
          reviewedId: owner.id,
          rating: 4 + Math.floor(Math.random() * 2), // 4 or 5 stars
          comment: 'Alles hat super geklappt! Gerne wieder.',
          createdAt: addDays(endDate, 1)
        }
      })

      await prisma.review.create({
        data: {
          rentalId: rental.id,
          reviewerId: owner.id,
          reviewedId: renter.id,
          rating: 5,
          comment: 'Sehr zuverlässiger Mieter, jederzeit wieder!',
          createdAt: addDays(endDate, 2)
        }
      })
    }

    return rental
  }

  // Create rental history for each user
  // Each user rents at least 3 items with different time periods
  
  // User 0 (Max) rents from others
  await createRentalWithHistory(
    allItems.find(i => i.userId === users[1].id), // Anna's item
    users[0], users[1],
    subDays(new Date(), 60), subDays(new Date(), 58),
    'completed', true
  )
  
  await createRentalWithHistory(
    allItems.find(i => i.userId === users[2].id), // Thomas's item  
    users[0], users[2],
    subDays(new Date(), 30), subDays(new Date(), 27),
    'completed', true
  )
  
  await createRentalWithHistory(
    allItems.find(i => i.userId === users[3].id), // Lisa's item
    users[0], users[3],
    subDays(new Date(), 10), subDays(new Date(), 8),
    'active', false
  )

  // User 1 (Anna) rents from others
  await createRentalWithHistory(
    allItems.find(i => i.userId === users[0].id), // Max's item
    users[1], users[0],
    subDays(new Date(), 45), subDays(new Date(), 42),
    'completed', true
  )
  
  await createRentalWithHistory(
    allItems.find(i => i.userId === users[2].id && i.title.includes('Drohne')),
    users[1], users[2],
    subDays(new Date(), 20), subDays(new Date(), 18),
    'completed', true
  )
  
  await createRentalWithHistory(
    allItems.find(i => i.userId === users[3].id && i.title.includes('Thermomix')),
    users[1], users[3],
    addDays(new Date(), 5), addDays(new Date(), 7),
    'confirmed', false
  )

  // User 2 (Thomas) rents from others
  await createRentalWithHistory(
    allItems.find(i => i.userId === users[0].id && i.title.includes('Betonmischer')),
    users[2], users[0],
    subDays(new Date(), 90), subDays(new Date(), 85),
    'completed', true
  )
  
  await createRentalWithHistory(
    allItems.find(i => i.userId === users[1].id && i.title.includes('Gartenhäcksler')),
    users[2], users[1],
    subDays(new Date(), 15), subDays(new Date(), 13),
    'completed', true
  )
  
  await createRentalWithHistory(
    allItems.find(i => i.userId === users[3].id && i.title.includes('Nähmaschine')),
    users[2], users[3],
    new Date(), addDays(new Date(), 3),
    'pending', false
  )

  // User 3 (Lisa) rents from others
  await createRentalWithHistory(
    allItems.find(i => i.userId === users[0].id && i.title.includes('Hochdruckreiniger')),
    users[3], users[0],
    subDays(new Date(), 75), subDays(new Date(), 74),
    'completed', true
  )
  
  await createRentalWithHistory(
    allItems.find(i => i.userId === users[1].id && i.title.includes('Gartenparty')),
    users[3], users[1],
    subDays(new Date(), 40), subDays(new Date(), 38),
    'completed', true
  )
  
  await createRentalWithHistory(
    allItems.find(i => i.userId === users[2].id && i.title.includes('Beamer')),
    users[3], users[2],
    subDays(new Date(), 5), subDays(new Date(), 3),
    'completed', true
  )

  // Add some cancelled rentals for variety
  await createRentalWithHistory(
    allItems.find(i => i.userId === users[1].id && i.title.includes('Rasenmäher')),
    users[0], users[1],
    subDays(new Date(), 25), subDays(new Date(), 23),
    'cancelled', false
  )

  console.log('✅ Created rental history with messages and reviews')

  // Summary
  const stats = {
    users: await prisma.user.count(),
    items: await prisma.item.count(),
    rentals: await prisma.rental.count(),
    reviews: await prisma.review.count(),
    messages: await prisma.message.count()
  }

  console.log('\n📊 Database seeded with:')
  console.log(`   - ${stats.users} users`)
  console.log(`   - ${stats.items} items`)
  console.log(`   - ${stats.rentals} rentals`)
  console.log(`   - ${stats.reviews} reviews`)
  console.log(`   - ${stats.messages} messages`)

  console.log('\n📧 Test accounts (all passwords: password123):')
  console.log('   - max.mustermann@example.com')
  console.log('   - anna.schmidt@example.com')
  console.log('   - thomas.mueller@example.com')
  console.log('   - lisa.weber@example.com')
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })