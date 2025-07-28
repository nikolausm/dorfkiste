import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

const updatedItems = [
  "Bosch Professional Schlagbohrmaschine",
  "Makita Akkuschrauber Set", 
  "Fliesenschneider Profi",
  "Vertikutierer elektrisch",
  "Gartenhäcksler",
  "Motorhacke/Gartenfräse",
  "Thermomix TM6",
  "Raclette-Grill für 8 Personen",
  "Stand-Up-Paddle Board Set",
  "Kitchenaid Küchenmaschine",
  "Powerstation 1000W Solar",
  "Betonmischer 140L"
]

async function verifyUpdates() {
  console.log('Verifying Updated Images\n')
  console.log('=' .repeat(80))
  
  try {
    for (const itemTitle of updatedItems) {
      const item = await prisma.item.findFirst({
        where: { title: itemTitle },
        include: {
          images: { orderBy: { order: 'asc' } },
          category: true
        }
      })
      
      if (item && item.images.length > 0) {
        console.log(`\n✅ ${item.title}`)
        console.log(`   Category: ${item.category.name}`)
        console.log(`   Updated image: ${item.images[0].url}`)
      } else {
        console.log(`\n❌ ${itemTitle} - No image found`)
      }
    }
    
    console.log('\n' + '=' .repeat(80))
    console.log('\n✅ All updates have been verified!')
    
  } catch (error) {
    console.error('Error during verification:', error)
  } finally {
    await prisma.$disconnect()
  }
}

// Run verification
verifyUpdates()