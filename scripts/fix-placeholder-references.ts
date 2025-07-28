import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function fixPlaceholderReferences() {
  console.log('🔧 Fixing placeholder references...')
  
  // Find all images with placeholder.jpg
  const placeholderImages = await prisma.itemImage.findMany({
    where: {
      url: '/placeholder.jpg'
    }
  })
  
  console.log(`Found ${placeholderImages.length} images with placeholder.jpg`)
  
  if (placeholderImages.length > 0) {
    // Update all placeholder.jpg references to placeholder.svg
    const result = await prisma.itemImage.updateMany({
      where: {
        url: '/placeholder.jpg'
      },
      data: {
        url: '/placeholder.svg'
      }
    })
    
    console.log(`✅ Updated ${result.count} placeholder references to use placeholder.svg`)
  } else {
    console.log('✅ No placeholder.jpg references found!')
  }
  
  // Also check for any items without images and add placeholder.svg
  const itemsWithoutImages = await prisma.item.findMany({
    where: {
      images: {
        none: {}
      }
    }
  })
  
  console.log(`\nFound ${itemsWithoutImages.length} items without any images`)
  
  for (const item of itemsWithoutImages) {
    await prisma.itemImage.create({
      data: {
        itemId: item.id,
        url: '/placeholder.svg',
        order: 0
      }
    })
    console.log(`  ✅ Added placeholder.svg to: ${item.title}`)
  }
  
  console.log('\n✨ All placeholder references have been fixed!')
}

fixPlaceholderReferences()
  .catch(console.error)
  .finally(() => prisma.$disconnect())