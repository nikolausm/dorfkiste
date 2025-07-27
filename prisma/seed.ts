import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
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

  console.log('Database seeded successfully!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })