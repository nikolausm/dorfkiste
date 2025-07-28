import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// Direkte Unsplash-Bild-URLs für spezifische Produkte
const directImageUrls = {
  'Fliesenschneider Profi': [
    'https://images.unsplash.com/photo-1565844778267-05046c432f02?w=800&h=600&fit=crop',
    'https://images.unsplash.com/photo-1590534561520-e7920fdc90f8?w=800&h=600&fit=crop'
  ],
  'Schweißgerät MIG/MAG': [
    'https://images.unsplash.com/photo-1548613053-22087dd8edb8?w=800&h=600&fit=crop',
    'https://images.unsplash.com/photo-1565793979491-568ea2b60b3f?w=800&h=600&fit=crop'
  ],
  'Vertikutierer elektrisch': [
    'https://images.unsplash.com/photo-1558902197-e0f34f2de87f?w=800&h=600&fit=crop',
    'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=800&h=600&fit=crop'
  ],
  'Gartenhäcksler': [
    'https://images.unsplash.com/photo-1604762436326-224c891405ad?w=800&h=600&fit=crop',
    'https://images.unsplash.com/photo-1589308078059-be1415eab4c3?w=800&h=600&fit=crop'
  ],
  'Motorhacke/Gartenfräse': [
    'https://images.unsplash.com/photo-1589922657702-ddeb28ab5a86?w=800&h=600&fit=crop',
    'https://images.unsplash.com/photo-1520038410233-7141be7e6f97?w=800&h=600&fit=crop'
  ],
  'Powerstation 1000W Solar': [
    'https://images.unsplash.com/photo-1620641309404-5e4a75e5d7e0?w=800&h=600&fit=crop',
    'https://images.unsplash.com/photo-1593941707874-ef25b8b4a92b?w=800&h=600&fit=crop'
  ],
  'Hochstuhl Stokke Tripp Trapp': [
    'https://images.unsplash.com/photo-1594736797933-d0501ba2fe65?w=800&h=600&fit=crop',
    'https://images.unsplash.com/photo-1522771930-78848d9293e8?w=800&h=600&fit=crop'
  ],
  'Laufrad Puky': [
    'https://images.unsplash.com/photo-1520175480921-4edfa2983e0f?w=800&h=600&fit=crop',
    'https://images.unsplash.com/photo-1545558014-8692077e9b5c?w=800&h=600&fit=crop'
  ],
  'Raclette-Grill für 8 Personen': [
    'https://images.unsplash.com/photo-1556269923-e4ef51d69638?w=800&h=600&fit=crop',
    'https://images.unsplash.com/photo-1466220549276-aef9ce186540?w=800&h=600&fit=crop'
  ],
  'Dampfreiniger Kärcher': [
    'https://images.unsplash.com/photo-1527515637462-cff94eecc1ac?w=800&h=600&fit=crop',
    'https://images.unsplash.com/photo-1563453392212-326f5e854473?w=800&h=600&fit=crop'
  ],
  'Nähmaschine Singer + Zubehör': [
    'https://images.unsplash.com/photo-1582213782179-e0d53f98f2ca?w=800&h=600&fit=crop',
    'https://images.unsplash.com/photo-1605003868284-d3e63970e037?w=800&h=600&fit=crop'
  ],
  'Hochdruckreiniger Kärcher': [
    'https://images.unsplash.com/photo-1563453392212-326f5e854473?w=800&h=600&fit=crop',
    'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&h=600&fit=crop'
  ],
  'Drohne DJI Mavic Pro': [
    'https://images.unsplash.com/photo-1473968512647-3e447244af8f?w=800&h=600&fit=crop',
    'https://images.unsplash.com/photo-1524143986875-3b098d78b363?w=800&h=600&fit=crop'
  ]
}

async function fixRemainingImages() {
  console.log('🔧 Korrigiere verbleibende Bilder...\n')
  
  // Find items with photo-search URLs
  const items = await prisma.item.findMany({
    include: {
      images: true
    }
  })
  
  const itemsToFix = items.filter(item => 
    item.images.some(img => img.url.includes('photo-search'))
  )
  
  console.log(`📊 ${itemsToFix.length} Artikel haben noch fehlerhafte Bild-URLs\n`)
  
  for (const item of itemsToFix) {
    if (directImageUrls[item.title]) {
      console.log(`📸 Korrigiere: ${item.title}`)
      
      // Delete existing images
      await prisma.itemImage.deleteMany({
        where: { itemId: item.id }
      })
      
      // Add correct images
      const urls = directImageUrls[item.title]
      for (let i = 0; i < urls.length; i++) {
        await prisma.itemImage.create({
          data: {
            itemId: item.id,
            url: urls[i],
            order: i
          }
        })
        console.log(`  ✅ Bild ${i + 1} hinzugefügt`)
      }
    }
  }
  
  console.log('\n✨ Alle Bilder wurden korrigiert!')
}

fixRemainingImages()
  .catch(console.error)
  .finally(() => prisma.$disconnect())