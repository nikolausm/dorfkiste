import { PrismaClient } from '@prisma/client'
import { createApi } from 'unsplash-js'
import * as fs from 'fs/promises'

const prisma = new PrismaClient()

// Unsplash API configuration
const UNSPLASH_ACCESS_KEY = process.env.UNSPLASH_ACCESS_KEY

if (!UNSPLASH_ACCESS_KEY || UNSPLASH_ACCESS_KEY === 'your-unsplash-access-key-here') {
  console.error('❌ UNSPLASH_ACCESS_KEY is not set in your environment variables')
  console.error('Please add it to your .env file:')
  console.error('UNSPLASH_ACCESS_KEY=your-actual-api-key')
  console.error('\nYou can get a free API key at: https://unsplash.com/developers')
  process.exit(1)
}

// Create Unsplash client
const unsplash = createApi({
  accessKey: UNSPLASH_ACCESS_KEY,
  fetch: fetch,
})

// Specific search queries for items that need better images
const updateTargets = [
  { title: "Bosch Professional Schlagbohrmaschine", search: "Bosch Professional hammer drill blue tool" },
  { title: "Makita Akkuschrauber Set", search: "Makita cordless drill set complete kit case" },
  { title: "Thermomix TM6", search: "Thermomix TM6 Vorwerk kitchen appliance" },
  { title: "Hochstuhl Stokke Tripp Trapp", search: "Stokke Tripp Trapp wooden high chair" },
  { title: "Vertikutierer elektrisch", search: "electric lawn scarifier dethatcher machine" },
  { title: "Gartenhäcksler", search: "garden shredder chipper machine green" },
  { title: "Motorhacke/Gartenfräse", search: "garden tiller cultivator soil machine" },
  { title: "Fliesenschneider Profi", search: "professional tile cutter ceramic cutting machine" },
  { title: "Powerstation 1000W Solar", search: "portable power station solar generator battery 1000W" },
  { title: "Raclette-Grill für 8 Personen", search: "raclette grill party table top melting cheese" },
  { title: "DJI Mavic Pro Drohne", search: "DJI Mavic Pro drone folded compact" },
  { title: "Laufrad Puky", search: "Puky balance bike children red blue" },
  { title: "Stand-Up-Paddle Board Set", search: "SUP stand up paddle board complete set inflatable" },
  { title: "GoPro Hero 11 + Zubehör", search: "GoPro Hero 11 black action camera accessories" },
  { title: "Kitchenaid Küchenmaschine", search: "KitchenAid stand mixer artisan red" },
  { title: "Betonmischer 140L", search: "concrete mixer machine 140 liter construction orange" },
]

async function searchAndUpdateImage(itemTitle: string, searchQuery: string): Promise<boolean> {
  try {
    // Find the item in database
    const item = await prisma.item.findFirst({
      where: { title: itemTitle },
      include: { images: { orderBy: { order: 'asc' } } }
    })
    
    if (!item) {
      console.log(`❌ Item not found: ${itemTitle}`)
      return false
    }
    
    if (!item.images || item.images.length === 0) {
      console.log(`❌ No images to update for: ${itemTitle}`)
      return false
    }
    
    console.log(`\n🔍 Searching for: ${itemTitle}`)
    console.log(`   Query: "${searchQuery}"`)
    
    // Search Unsplash
    const response = await unsplash.search.getPhotos({
      query: searchQuery,
      perPage: 5,
      orientation: 'landscape',
    })
    
    if (response.errors) {
      console.error('   ❌ Unsplash API error:', response.errors)
      return false
    }
    
    if (!response.response || response.response.results.length === 0) {
      console.log('   ⚠️  No images found')
      return false
    }
    
    // Get the best image (first result)
    const newImageUrl = response.response.results[0].urls.regular
    const photographer = response.response.results[0].user.name
    const imageDescription = response.response.results[0].description || response.response.results[0].alt_description
    
    // Update the first image
    await prisma.itemImage.update({
      where: { id: item.images[0].id },
      data: { url: newImageUrl }
    })
    
    console.log(`   ✅ Updated with new image`)
    console.log(`   📸 Photo by ${photographer}`)
    console.log(`   📝 Description: ${imageDescription}`)
    console.log(`   🔗 ${newImageUrl}`)
    
    return true
  } catch (error) {
    console.error(`   ❌ Error updating ${itemTitle}:`, error)
    return false
  }
}

async function updateAllImages() {
  console.log('Starting targeted image updates...')
  console.log('=' .repeat(80))
  
  let successCount = 0
  let failCount = 0
  
  // Process updates with rate limiting
  for (const target of updateTargets) {
    const success = await searchAndUpdateImage(target.title, target.search)
    
    if (success) {
      successCount++
    } else {
      failCount++
    }
    
    // Rate limiting: wait 2 seconds between requests to respect Unsplash limits
    await new Promise(resolve => setTimeout(resolve, 2000))
  }
  
  console.log('\n' + '=' .repeat(80))
  console.log('\n📊 Update Summary:')
  console.log(`   Total items targeted: ${updateTargets.length}`)
  console.log(`   ✅ Successfully updated: ${successCount}`)
  console.log(`   ❌ Failed to update: ${failCount}`)
  
  // Create a log file
  const logContent = {
    timestamp: new Date().toISOString(),
    totalTargeted: updateTargets.length,
    successCount,
    failCount,
    details: updateTargets
  }
  
  await fs.writeFile(
    'image-update-log.json',
    JSON.stringify(logContent, null, 2)
  )
  
  console.log('\n📄 Update log saved to image-update-log.json')
  
  await prisma.$disconnect()
}

// Run the update
updateAllImages().catch(console.error)