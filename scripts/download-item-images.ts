import { PrismaClient } from '@prisma/client'
import { createWriteStream } from 'fs'
import { mkdir } from 'fs/promises'
import { join } from 'path'
import { pipeline } from 'stream/promises'
import { Readable } from 'stream'

const prisma = new PrismaClient()

// Map of item titles to appropriate image search queries
const itemImageQueries: Record<string, string[]> = {
  // Werkzeuge
  'Bosch Professional Schlagbohrmaschine': ['bosch drill professional', 'power drill bosch', 'impact drill'],
  'Makita Akkuschrauber Set': ['makita cordless drill set', 'makita drill kit', 'makita power tools'],
  'Stichsäge Bosch PST 900': ['bosch jigsaw pst 900', 'bosch jigsaw', 'electric jigsaw'],
  'Werkzeugkoffer 216-teilig': ['tool kit case', 'professional tool box', 'complete toolset'],
  'Leiter 3m Aluminium': ['aluminum ladder 3m', 'step ladder', 'aluminum folding ladder'],
  'Fliesenschneider Profi': ['tile cutter professional', 'ceramic tile cutter', 'manual tile cutter'],
  'Betonmischer 140L': ['concrete mixer 140l', 'cement mixer', 'construction mixer'],
  'Winkelschleifer Bosch': ['bosch angle grinder', 'angle grinder tool', 'bosch grinder'],
  'Schweißgerät MIG/MAG': ['mig mag welder', 'welding machine', 'mig welder professional'],
  
  // Gartengeräte
  'Rasenmäher Benzin Honda': ['honda lawn mower', 'honda gas mower', 'petrol lawn mower'],
  'Heckenschere elektrisch Bosch': ['bosch hedge trimmer', 'electric hedge cutter', 'bosch garden tools'],
  'Vertikutierer elektrisch': ['electric scarifier', 'lawn scarifier', 'grass dethatcher'],
  'Laubsauger/Bläser Stihl': ['stihl leaf blower', 'leaf vacuum stihl', 'stihl blower'],
  'Gartenhäcksler': ['garden shredder', 'wood chipper', 'branch shredder'],
  'Motorhacke/Gartenfräse': ['garden tiller', 'rotary tiller', 'cultivator machine'],
  'Bewässerungssystem komplett': ['irrigation system', 'garden watering system', 'sprinkler system'],
  'Gewächshaus faltbar 2x3m': ['portable greenhouse', 'folding greenhouse', 'garden greenhouse'],
  'Outdoor-Grill Weber': ['weber grill', 'weber bbq', 'outdoor barbecue weber'],
  
  // Haushalt & Küche
  'Hochdruckreiniger Kärcher K5': ['karcher k5 pressure washer', 'karcher cleaner', 'pressure washer'],
  'Thermomix TM6': ['thermomix tm6', 'thermomix cooking', 'thermomix kitchen'],
  'Kitchenaid Küchenmaschine': ['kitchenaid mixer', 'kitchenaid stand mixer', 'kitchen aid'],
  'Raclette-Grill für 8 Personen': ['raclette grill', 'raclette party', 'table grill raclette'],
  'Dampfreiniger Kärcher': ['karcher steam cleaner', 'steam mop karcher', 'floor steam cleaner'],
  'Nähmaschine Singer + Zubehör': ['singer sewing machine', 'sewing machine kit', 'singer sewing'],
  
  // Elektronik
  'Sony Alpha 7III Kamera + Objektive': ['sony alpha 7iii', 'sony a7iii camera', 'sony mirrorless camera'],
  'DJI Mavic Pro Drohne': ['dji mavic pro', 'mavic pro drone', 'dji drone'],
  'Beamer 4K Epson + Leinwand': ['epson 4k projector', 'home cinema projector', 'epson beamer'],
  'GoPro Hero 11 + Zubehör': ['gopro hero 11', 'gopro action camera', 'gopro hero11'],
  'Powerstation 1000W Solar': ['portable power station', 'solar generator 1000w', 'power bank station'],
  
  // Camping & Sport
  '6-Personen Camping-Zelt': ['6 person tent', 'family camping tent', 'large camping tent'],
  'Schlafsack-Set (4 Stück) -15°C': ['sleeping bag cold weather', 'winter sleeping bag', 'camping sleeping bag'],
  'Campingkocher + Geschirr-Set': ['camping stove set', 'portable camp stove', 'camping cookware'],
  'Fahrradträger für 4 Räder': ['bike rack 4 bikes', 'car bike carrier', 'bicycle rack'],
  'Stand-Up-Paddle Board Set': ['sup board', 'stand up paddle board', 'inflatable sup'],
  
  // Partybedarf
  'Gartenparty-Set (Pavillons + Stehtische)': ['party tent pavilion', 'garden party tent', 'event tent tables'],
  
  // Kinderbedarf
  'Kinderwagen Bugaboo Fox': ['bugaboo fox stroller', 'bugaboo pram', 'luxury stroller'],
  'Babywippe elektrisch': ['electric baby bouncer', 'baby swing electric', 'baby rocker'],
  'Reisebett + Matratze': ['travel cot baby', 'portable baby bed', 'travel crib'],
  'Hochstuhl Stokke Tripp Trapp': ['stokke tripp trapp', 'high chair stokke', 'baby high chair'],
  'Laufrad Puky': ['puky balance bike', 'kids balance bike', 'puky bicycle']
}

// Use Unsplash API to fetch images
async function fetchImageFromUnsplash(query: string, index: number = 0): Promise<string | null> {
  const accessKey = process.env.UNSPLASH_ACCESS_KEY || 'YOUR_ACCESS_KEY'
  
  try {
    const response = await fetch(
      `https://api.unsplash.com/search/photos?query=${encodeURIComponent(query)}&per_page=5&orientation=landscape`,
      {
        headers: {
          'Authorization': `Client-ID ${accessKey}`
        }
      }
    )
    
    if (!response.ok) {
      console.error(`Unsplash API error: ${response.status}`)
      return null
    }
    
    const data = await response.json()
    
    if (data.results && data.results.length > index) {
      return data.results[index].urls.regular
    }
    
    return null
  } catch (error) {
    console.error('Error fetching from Unsplash:', error)
    return null
  }
}

// Download image from URL and save locally
async function downloadImage(url: string, filepath: string): Promise<boolean> {
  try {
    const response = await fetch(url)
    if (!response.ok || !response.body) {
      console.error(`Failed to download image: ${response.status}`)
      return false
    }
    
    const stream = Readable.fromWeb(response.body as any)
    const writeStream = createWriteStream(filepath)
    
    await pipeline(stream, writeStream)
    console.log(`Downloaded: ${filepath}`)
    return true
  } catch (error) {
    console.error(`Error downloading image from ${url}:`, error)
    return false
  }
}

// Use a free image service as fallback
async function getFallbackImage(query: string, index: number = 0): Promise<string> {
  // Use Lorem Picsum for fallback images with consistent dimensions
  const width = 800
  const height = 600
  // Use a seed based on query and index for consistent images
  const seed = `${query}-${index}`.replace(/[^a-zA-Z0-9]/g, '')
  
  return `https://picsum.photos/seed/${seed}/${width}/${height}`
}

async function updateItemImages() {
  console.log('🖼️  Starting image download and update process...')
  
  // Create images directory if it doesn't exist
  const imagesDir = join(process.cwd(), 'public', 'item-images')
  await mkdir(imagesDir, { recursive: true })
  
  // Get all items with their current images
  const items = await prisma.item.findMany({
    include: {
      images: true,
      category: true
    }
  })
  
  console.log(`Found ${items.length} items to process`)
  
  for (const item of items) {
    console.log(`\n📦 Processing: ${item.title}`)
    
    // Skip if item already has real images (not generated ones)
    if (item.images.length > 0 && !item.images[0].url.includes('source.unsplash.com')) {
      console.log('  ✅ Already has custom images, skipping...')
      continue
    }
    
    // Delete existing generated images
    if (item.images.length > 0) {
      await prisma.itemImage.deleteMany({
        where: { itemId: item.id }
      })
    }
    
    // Get search queries for this item
    const queries = itemImageQueries[item.title] || [item.title.toLowerCase()]
    const imagesToDownload = Math.min(queries.length, 3) // Download up to 3 images
    
    const newImages: string[] = []
    
    for (let i = 0; i < imagesToDownload; i++) {
      const query = queries[i]
      console.log(`  🔍 Searching for: "${query}"`)
      
      // Try Unsplash first
      let imageUrl = await fetchImageFromUnsplash(query, 0)
      
      // If Unsplash fails, use fallback
      if (!imageUrl) {
        console.log('  ⚠️  Unsplash failed, using fallback...')
        imageUrl = await getFallbackImage(query, i)
      }
      
      // Download the image
      const filename = `${item.id}-${i + 1}.jpg`
      const filepath = join(imagesDir, filename)
      const publicPath = `/item-images/${filename}`
      
      const downloaded = await downloadImage(imageUrl, filepath)
      
      if (downloaded) {
        newImages.push(publicPath)
      } else {
        // If download failed, use the online URL directly
        newImages.push(imageUrl)
      }
    }
    
    // Update database with new images
    if (newImages.length > 0) {
      await prisma.itemImage.createMany({
        data: newImages.map((url, index) => ({
          itemId: item.id,
          url,
          order: index
        }))
      })
      
      console.log(`  ✅ Added ${newImages.length} images for ${item.title}`)
    }
    
    // Add a small delay to avoid rate limiting
    await new Promise(resolve => setTimeout(resolve, 1000))
  }
  
  console.log('\n✅ Image update process completed!')
}

// Run the script
updateItemImages()
  .catch(console.error)
  .finally(() => prisma.$disconnect())