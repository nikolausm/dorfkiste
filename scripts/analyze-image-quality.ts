import { PrismaClient } from '@prisma/client'
import { createApi } from 'unsplash-js'

const prisma = new PrismaClient()

// Unsplash API configuration
const UNSPLASH_ACCESS_KEY = process.env.UNSPLASH_ACCESS_KEY || 'your-unsplash-access-key-here'

// Create Unsplash client
const unsplash = createApi({
  accessKey: UNSPLASH_ACCESS_KEY,
  fetch: fetch,
})

// Mapping of items that might need better images based on their titles
const itemsNeedingReview = [
  { title: "Babywippe elektrisch", betterSearch: "electric baby bouncer chair" },
  { title: "Hochstuhl Stokke Tripp Trapp", betterSearch: "Stokke Tripp Trapp high chair" },
  { title: "Laufrad Puky", betterSearch: "Puky balance bike children" },
  { title: "Fliesenschneider Profi", betterSearch: "professional tile cutter tool" },
  { title: "Vertikutierer elektrisch", betterSearch: "electric lawn scarifier dethatcher" },
  { title: "Gartenhäcksler", betterSearch: "garden shredder chipper machine" },
  { title: "Motorhacke/Gartenfräse", betterSearch: "garden tiller cultivator machine" },
  { title: "Powerstation 1000W Solar", betterSearch: "portable power station solar generator 1000w" },
  { title: "Thermomix TM6", betterSearch: "Thermomix TM6 kitchen appliance" },
  { title: "Raclette-Grill für 8 Personen", betterSearch: "raclette grill party 8 person" },
]

async function searchBetterImage(query: string): Promise<string | null> {
  try {
    const response = await unsplash.search.getPhotos({
      query,
      perPage: 3,
      orientation: 'landscape',
    })
    
    if (response.errors) {
      console.error('Unsplash API errors:', response.errors)
      return null
    }
    
    if (response.response && response.response.results.length > 0) {
      // Return the first high-quality image
      return response.response.results[0].urls.regular
    }
    
    return null
  } catch (error) {
    console.error('Error searching Unsplash:', error)
    return null
  }
}

async function analyzeAndUpdateImages() {
  console.log('Analyzing image quality and updating where needed...\n')
  
  try {
    const updatePromises = []
    
    for (const itemToReview of itemsNeedingReview) {
      const item = await prisma.item.findFirst({
        where: { title: itemToReview.title },
        include: { images: { orderBy: { order: 'asc' } } }
      })
      
      if (item && item.images.length > 0) {
        console.log(`\nChecking: ${item.title}`)
        console.log(`Current image: ${item.images[0].url}`)
        console.log(`Searching for better match with: "${itemToReview.betterSearch}"`)
        
        const newImageUrl = await searchBetterImage(itemToReview.betterSearch)
        
        if (newImageUrl && newImageUrl !== item.images[0].url) {
          console.log(`✅ Found better image: ${newImageUrl}`)
          
          updatePromises.push(
            prisma.itemImage.update({
              where: { id: item.images[0].id },
              data: { url: newImageUrl }
            })
          )
        } else {
          console.log('⚠️  No better image found or same image returned')
        }
        
        // Small delay to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 1000))
      }
    }
    
    if (updatePromises.length > 0) {
      console.log(`\nUpdating ${updatePromises.length} images...`)
      await Promise.all(updatePromises)
      console.log('✅ All updates completed!')
    } else {
      console.log('\n✅ No updates needed - all images look appropriate!')
    }
    
  } catch (error) {
    console.error('Error during analysis:', error)
  } finally {
    await prisma.$disconnect()
  }
}

// Only run if UNSPLASH_ACCESS_KEY is set
if (UNSPLASH_ACCESS_KEY === 'your-unsplash-access-key-here') {
  console.log('⚠️  Please set UNSPLASH_ACCESS_KEY environment variable to use this script')
  console.log('You can get a free API key at: https://unsplash.com/developers')
  process.exit(1)
}

// Run the script
analyzeAndUpdateImages()