import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// Mapping von Produkttiteln zu spezifischen Suchbegriffen für bessere Bilder
const productImageMapping = {
  // Werkzeuge
  'Bosch Professional Schlagbohrmaschine': ['bosch hammer drill professional', 'bosch impact drill blue'],
  'Makita Akkuschrauber Set': ['makita cordless drill set', 'makita drill kit box'],
  'Winkelschleifer Flex 125mm': ['flex angle grinder 125mm', 'professional angle grinder'],
  'Bohrhammer Hilti': ['hilti hammer drill', 'hilti rotary hammer'],
  'Akkuschrauber Bosch': ['bosch cordless screwdriver', 'bosch drill driver'],
  'Stichsäge Bosch Professional': ['bosch jigsaw professional', 'bosch jigsaw blue'],
  'Kreissäge Makita': ['makita circular saw', 'makita saw professional'],
  'Schwingschleifer': ['orbital sander', 'random orbit sander'],
  'Oberfräse': ['router tool', 'wood router professional'],
  'Fliesenschneider Profi': ['tile cutter professional', 'tile cutting machine'],
  'Betonmischer 140L': ['concrete mixer 140 liter', 'cement mixer machine'],
  'Schweißgerät MIG/MAG': ['mig mag welder', 'welding machine mig'],
  
  // Garten
  'Rasenmäher Honda': ['honda lawn mower', 'honda grass mower red'],
  'Vertikutierer elektrisch': ['electric scarifier', 'lawn scarifier machine'],
  'Heckenschere Stihl': ['stihl hedge trimmer', 'stihl hedge cutter'],
  'Kettensäge Husqvarna': ['husqvarna chainsaw', 'husqvarna chain saw'],
  'Laubbläser Akku': ['cordless leaf blower', 'battery leaf blower'],
  'Hochdruckreiniger Kärcher': ['karcher pressure washer', 'karcher high pressure cleaner'],
  'Gartenhäcksler': ['garden shredder', 'wood chipper machine'],
  'Motorhacke/Gartenfräse': ['garden tiller', 'rotary tiller cultivator'],
  
  // Haushalt
  'Hochdruckreiniger Kärcher K7': ['karcher k7', 'karcher k7 pressure washer'],
  'Dampfreiniger Kärcher': ['karcher steam cleaner', 'steam cleaning machine'],
  'Teppichreiniger Profi': ['carpet cleaner professional', 'carpet cleaning machine'],
  'Industriestaubsauger': ['industrial vacuum cleaner', 'wet dry vacuum professional'],
  'Thermomix TM6': ['thermomix tm6', 'thermomix vorwerk'],
  'Kitchenaid Küchenmaschine': ['kitchenaid stand mixer', 'kitchenaid artisan mixer'],
  'Raclette-Grill für 8 Personen': ['raclette grill 8 person', 'raclette party grill'],
  'Nähmaschine Singer + Zubehör': ['singer sewing machine', 'sewing machine with accessories'],
  
  // Elektronik
  'Beamer Epson Full HD': ['epson projector full hd', 'epson beamer'],
  'Leinwand 100 Zoll': ['projector screen 100 inch', 'projection screen large'],
  'Drohne DJI Mavic Pro': ['dji mavic pro drone', 'dji mavic pro flying'],
  'GoPro Hero 11 + Zubehör': ['gopro hero 11', 'gopro hero 11 accessories'],
  'Spiegelreflexkamera Canon': ['canon dslr camera', 'canon eos camera'],
  'Kamera Sony Alpha 7 III': ['sony alpha 7 iii', 'sony a7 iii camera'],
  'Powerstation 1000W Solar': ['portable power station 1000w', 'solar generator power station'],
  
  // Sport & Camping
  'Zelt 4 Personen': ['4 person tent camping', 'family tent 4 person'],
  'Schlafsack -10°C': ['winter sleeping bag', 'cold weather sleeping bag'],
  'Campingkocher + Gaskartusche': ['camping stove gas', 'portable camping cooker'],
  'Kühlbox elektrisch 40L': ['electric cool box 40l', 'electric cooler camping'],
  'Stand-Up-Paddle Board Set': ['stand up paddle board complete', 'sup board set'],
  
  // Fahrzeuge
  'Fahrradträger für Anhängerkupplung': ['bike rack tow bar', 'bicycle carrier hitch'],
  'Kinderfahrradanhänger': ['child bike trailer', 'kids bicycle trailer'],
  
  // Kinder
  'Kinderwagen Bugaboo': ['bugaboo stroller', 'bugaboo pram'],
  'Hochstuhl Stokke Tripp Trapp': ['stokke tripp trapp', 'stokke high chair'],
  'Laufrad Puky': ['puky balance bike', 'puky learner bike']
}

// Bessere Unsplash-URLs für spezifische Produkte
const specificImageUrls = {
  'Thermomix TM6': [
    'https://images.unsplash.com/photo-1609501676725-7186f017a4b7?w=800&h=600&fit=crop',
    'https://images.unsplash.com/photo-1570222094114-d054a817e56b?w=800&h=600&fit=crop'
  ],
  'Bosch Professional Schlagbohrmaschine': [
    'https://images.unsplash.com/photo-1504148455328-c376907d081c?w=800&h=600&fit=crop',
    'https://images.unsplash.com/photo-1572981779307-38b8cabb2407?w=800&h=600&fit=crop'
  ],
  'Makita Akkuschrauber Set': [
    'https://images.unsplash.com/photo-1513467535987-fd81bc7d62f8?w=800&h=600&fit=crop',
    'https://images.unsplash.com/photo-1609205807490-89c1b0a26696?w=800&h=600&fit=crop'
  ],
  'Hochdruckreiniger Kärcher': [
    'https://images.unsplash.com/photo-1563453392212-326f5e854473?w=800&h=600&fit=crop',
    'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&h=600&fit=crop'
  ],
  'Kitchenaid Küchenmaschine': [
    'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=800&h=600&fit=crop',
    'https://images.unsplash.com/photo-1556912167-f556f1f39faa?w=800&h=600&fit=crop'
  ],
  'Drohne DJI Mavic Pro': [
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&h=600&fit=crop',
    'https://images.unsplash.com/photo-1521405924368-64c5b84bec60?w=800&h=600&fit=crop'
  ],
  'GoPro Hero 11 + Zubehör': [
    'https://images.unsplash.com/photo-1502920917128-1aa500764cbd?w=800&h=600&fit=crop',
    'https://images.unsplash.com/photo-1625948515291-69613efd103f?w=800&h=600&fit=crop'
  ],
  'Stand-Up-Paddle Board Set': [
    'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=800&h=600&fit=crop',
    'https://images.unsplash.com/photo-1544551763-92ab472cad5d?w=800&h=600&fit=crop'
  ],
  'Betonmischer 140L': [
    'https://images.unsplash.com/photo-1600880292203-757bb62b4baf?w=800&h=600&fit=crop',
    'https://images.unsplash.com/photo-1581094651181-35942459ef62?w=800&h=600&fit=crop'
  ]
}

async function generateBetterImageUrl(title: string, index: number = 0): string {
  // Check if we have specific URLs for this product
  if (specificImageUrls[title]) {
    return specificImageUrls[title][index % specificImageUrls[title].length]
  }
  
  // Use mapped search terms or fall back to title
  const searchTerms = productImageMapping[title] || [title.toLowerCase()]
  const searchTerm = searchTerms[index % searchTerms.length]
  
  // Generate Unsplash URL with specific search
  const width = 800
  const height = 600
  const timestamp = Date.now()
  
  return `https://images.unsplash.com/photo-search?query=${encodeURIComponent(searchTerm)}&w=${width}&h=${height}&fit=crop&sig=${timestamp}`
}

async function analyzeAndUpdateImages() {
  console.log('🔍 Claude-Flow Image Correction gestartet...\n')
  
  // Get all items with their images
  const items = await prisma.item.findMany({
    include: {
      images: {
        orderBy: { order: 'asc' }
      },
      category: true
    }
  })
  
  console.log(`📊 Analysiere ${items.length} Artikel...\n`)
  
  const itemsToUpdate = []
  
  // Analyze each item
  for (const item of items) {
    const needsUpdate = 
      // Check if title contains specific brands/models that need exact images
      Object.keys(productImageMapping).includes(item.title) ||
      Object.keys(specificImageUrls).includes(item.title) ||
      // Check if current images might be generic
      item.images.some(img => 
        img.url.includes('random') || 
        img.url.includes('featured') ||
        !img.url.includes('photo-')
      )
    
    if (needsUpdate) {
      itemsToUpdate.push(item)
    }
  }
  
  console.log(`🎯 ${itemsToUpdate.length} Artikel benötigen bessere Bilder\n`)
  
  // Update images for identified items
  for (const item of itemsToUpdate) {
    console.log(`\n📸 Aktualisiere Bilder für: ${item.title}`)
    
    // Delete existing images
    await prisma.itemImage.deleteMany({
      where: { itemId: item.id }
    })
    
    // Add new, better images
    const imageUrls = []
    for (let i = 0; i < 2; i++) {
      imageUrls.push(generateBetterImageUrl(item.title, i))
    }
    
    // Create new images
    for (let i = 0; i < imageUrls.length; i++) {
      const url = await imageUrls[i]
      await prisma.itemImage.create({
        data: {
          itemId: item.id,
          url: url,
          order: i
        }
      })
      console.log(`  ✅ Bild ${i + 1}: ${url.substring(0, 50)}...`)
    }
  }
  
  console.log('\n✨ Claude-Flow Image Correction abgeschlossen!')
  console.log(`📊 ${itemsToUpdate.length} Artikel wurden mit besseren Bildern aktualisiert`)
}

analyzeAndUpdateImages()
  .catch(console.error)
  .finally(() => prisma.$disconnect())