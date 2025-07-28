import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// Manual image updates with better matching images from Unsplash
// These are direct Unsplash URLs that better match the specific products
const manualUpdates = [
  {
    title: "Bosch Professional Schlagbohrmaschine",
    newImageUrl: "https://images.unsplash.com/photo-1504148455328-c376907d081c?ixlib=rb-4.0.3&w=800&h=600&fit=crop",
    description: "Professional blue Bosch hammer drill"
  },
  {
    title: "Makita Akkuschrauber Set",
    newImageUrl: "https://images.unsplash.com/photo-1513467535987-fd81bc7d62f8?ixlib=rb-4.0.3&w=800&h=600&fit=crop",
    description: "Complete Makita drill set with case"
  },
  {
    title: "Fliesenschneider Profi",
    newImageUrl: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?ixlib=rb-4.0.3&w=800&h=600&fit=crop",
    description: "Professional tile cutting machine"
  },
  {
    title: "Vertikutierer elektrisch",
    newImageUrl: "https://images.unsplash.com/photo-1564869733874-79e73b37de7e?ixlib=rb-4.0.3&w=800&h=600&fit=crop",
    description: "Electric lawn scarifier/dethatcher"
  },
  {
    title: "Gartenhäcksler",
    newImageUrl: "https://images.unsplash.com/photo-1416879595882-3373a0480b5b?ixlib=rb-4.0.3&w=800&h=600&fit=crop",
    description: "Garden wood chipper/shredder machine"
  },
  {
    title: "Motorhacke/Gartenfräse",
    newImageUrl: "https://images.unsplash.com/photo-1601986571921-e8d13c3d47aa?ixlib=rb-4.0.3&w=800&h=600&fit=crop",
    description: "Garden tiller/cultivator machine"
  },
  {
    title: "Thermomix TM6",
    newImageUrl: "https://images.unsplash.com/photo-1556912167-f556f1f39faa?ixlib=rb-4.0.3&w=800&h=600&fit=crop",
    description: "Thermomix TM6 kitchen appliance"
  },
  {
    title: "Raclette-Grill für 8 Personen",
    newImageUrl: "https://images.unsplash.com/photo-1556909212-d5b604d0c90d?ixlib=rb-4.0.3&w=800&h=600&fit=crop",
    description: "Raclette party grill for 8 people"
  },
  {
    title: "Stand-Up-Paddle Board Set",
    newImageUrl: "https://images.unsplash.com/photo-1570406028519-e02a27565308?ixlib=rb-4.0.3&w=800&h=600&fit=crop",
    description: "Complete SUP board set with paddle"
  },
  {
    title: "Kitchenaid Küchenmaschine",
    newImageUrl: "https://images.unsplash.com/photo-1578985545062-69928b1d9587?ixlib=rb-4.0.3&w=800&h=600&fit=crop",
    description: "KitchenAid stand mixer"
  },
  {
    title: "Powerstation 1000W Solar",
    newImageUrl: "https://images.unsplash.com/photo-1605289355680-75fb41239154?ixlib=rb-4.0.3&w=800&h=600&fit=crop",
    description: "Portable power station with solar capability"
  },
  {
    title: "Betonmischer 140L",
    newImageUrl: "https://images.unsplash.com/photo-1581094288338-2314dddb7ece?ixlib=rb-4.0.3&w=800&h=600&fit=crop",
    description: "140L concrete mixer machine"
  }
]

async function performManualUpdates() {
  console.log('Performing manual image updates...\n')
  console.log('=' .repeat(80))
  
  let successCount = 0
  let failCount = 0
  const updateResults = []
  
  for (const update of manualUpdates) {
    try {
      // Find the item
      const item = await prisma.item.findFirst({
        where: { title: update.title },
        include: { images: { orderBy: { order: 'asc' } } }
      })
      
      if (!item) {
        console.log(`❌ Item not found: ${update.title}`)
        failCount++
        updateResults.push({
          title: update.title,
          status: 'failed',
          reason: 'Item not found'
        })
        continue
      }
      
      if (!item.images || item.images.length === 0) {
        // Create new image if none exists
        await prisma.itemImage.create({
          data: {
            itemId: item.id,
            url: update.newImageUrl,
            order: 0
          }
        })
        console.log(`✅ Added image for: ${update.title}`)
        console.log(`   📝 ${update.description}`)
      } else {
        // Update existing image
        await prisma.itemImage.update({
          where: { id: item.images[0].id },
          data: { url: update.newImageUrl }
        })
        console.log(`✅ Updated image for: ${update.title}`)
        console.log(`   📝 ${update.description}`)
      }
      
      successCount++
      updateResults.push({
        title: update.title,
        status: 'success',
        newImage: update.newImageUrl,
        description: update.description
      })
      
    } catch (error) {
      console.error(`❌ Error updating ${update.title}:`, error)
      failCount++
      updateResults.push({
        title: update.title,
        status: 'failed',
        reason: String(error)
      })
    }
  }
  
  console.log('\n' + '=' .repeat(80))
  console.log('\n📊 Manual Update Summary:')
  console.log(`   Total items: ${manualUpdates.length}`)
  console.log(`   ✅ Successfully updated: ${successCount}`)
  console.log(`   ❌ Failed: ${failCount}`)
  
  // Save results
  const fs = require('fs').promises
  await fs.writeFile(
    'manual-update-results.json',
    JSON.stringify({
      timestamp: new Date().toISOString(),
      summary: {
        total: manualUpdates.length,
        success: successCount,
        failed: failCount
      },
      details: updateResults
    }, null, 2)
  )
  
  console.log('\n📄 Results saved to manual-update-results.json')
  
  await prisma.$disconnect()
}

// Run the manual updates
performManualUpdates().catch(console.error)