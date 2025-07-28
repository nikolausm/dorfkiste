import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  const categories = [
    { id: 'elektronik', name: 'Elektronik', slug: 'elektronik', description: 'Kameras, Drohnen, Spielkonsolen und mehr' },
    { id: 'werkzeuge', name: 'Werkzeuge', slug: 'werkzeuge', description: 'Handwerkzeuge, Elektrowerkzeuge und Gartengeräte' },
    { id: 'sport', name: 'Sport & Freizeit', slug: 'sport', description: 'Sportgeräte, Camping-Ausrüstung und Outdoor-Equipment' },
    { id: 'haushalt', name: 'Haushalt', slug: 'haushalt', description: 'Küchengeräte, Reinigungsgeräte und Haushaltshelfer' },
    { id: 'garten', name: 'Garten', slug: 'garten', description: 'Gartengeräte, Grills und Gartenmöbel' },
    { id: 'fahrzeuge', name: 'Fahrzeuge', slug: 'fahrzeuge', description: 'Fahrräder, E-Scooter und Anhänger' },
    { id: 'medien', name: 'Bücher & Medien', slug: 'medien', description: 'Bücher, Spiele und Unterhaltungsmedien' },
    { id: 'sonstiges', name: 'Sonstiges', slug: 'sonstiges', description: 'Alles andere, was nicht in die anderen Kategorien passt' }
  ]

  for (const category of categories) {
    await prisma.category.upsert({
      where: { id: category.id },
      update: category,
      create: category,
    })
  }

  console.log('Categories seeded successfully!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })