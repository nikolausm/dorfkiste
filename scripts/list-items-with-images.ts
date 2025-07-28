import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function listItemsWithImages() {
  console.log('Fetching all items from the database...\n')
  
  try {
    const items = await prisma.item.findMany({
      include: {
        images: {
          orderBy: { order: 'asc' }
        },
        category: true,
        user: {
          select: {
            name: true,
            email: true
          }
        }
      }
    })
    
    console.log(`Total items found: ${items.length}\n`)
    console.log('='.repeat(80))
    
    items.forEach((item, index) => {
      console.log(`\n${index + 1}. ${item.title}`)
      console.log(`   Category: ${item.category.name}`)
      console.log(`   Condition: ${item.condition}`)
      console.log(`   Price/Day: €${item.pricePerDay || 'N/A'}`)
      console.log(`   Location: ${item.location}`)
      console.log(`   Owner: ${item.user.name || item.user.email}`)
      console.log(`   Available: ${item.available ? 'Yes' : 'No'}`)
      
      if (item.images.length > 0) {
        console.log(`   Images (${item.images.length}):`)
        item.images.forEach((img, imgIndex) => {
          console.log(`     ${imgIndex + 1}. ${img.url}`)
        })
      } else {
        console.log(`   Images: ❌ No images`)
      }
    })
    
    // Summary statistics
    console.log('\n' + '='.repeat(80))
    console.log('\nSummary:')
    console.log(`Total items: ${items.length}`)
    console.log(`Items with images: ${items.filter(i => i.images.length > 0).length}`)
    console.log(`Items without images: ${items.filter(i => i.images.length === 0).length}`)
    
    // Group by category
    const categoryCounts = items.reduce((acc, item) => {
      acc[item.category.name] = (acc[item.category.name] || 0) + 1
      return acc
    }, {} as Record<string, number>)
    
    console.log('\nItems by category:')
    Object.entries(categoryCounts).forEach(([category, count]) => {
      console.log(`  ${category}: ${count}`)
    })
    
  } catch (error) {
    console.error('Error fetching items:', error)
  } finally {
    await prisma.$disconnect()
  }
}

// Run the script
listItemsWithImages()