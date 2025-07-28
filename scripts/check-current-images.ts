import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function checkImages() {
  const items = await prisma.item.findMany({
    include: {
      images: true
    },
    take: 5
  })
  
  console.log('First 5 items and their images:')
  items.forEach(item => {
    console.log(`\n📦 ${item.title}`)
    if (item.images.length === 0) {
      console.log('  ❌ No images')
    } else {
      item.images.forEach((img, idx) => {
        console.log(`  🖼️  Image ${idx + 1}: ${img.url}`)
      })
    }
  })
}

checkImages()
  .catch(console.error)
  .finally(() => prisma.$disconnect())