import { PrismaClient } from '@prisma/client'
import { createApi } from 'unsplash-js'

const prisma = new PrismaClient()

// Unsplash API configuration
const UNSPLASH_ACCESS_KEY = process.env.UNSPLASH_ACCESS_KEY || 'your-unsplash-access-key-here'

// Create Unsplash client
const unsplash = createApi({
  accessKey: UNSPLASH_ACCESS_KEY,
  fetch: fetch, // Use native fetch from Node.js 18+
})

async function searchUnsplashImage(query: string): Promise<string | null> {
  try {
    const response = await unsplash.search.getPhotos({
      query,
      perPage: 5,
      orientation: 'landscape',
    })
    
    if (response.errors) {
      console.error('Unsplash API errors:', response.errors)
      return null
    }
    
    if (response.response && response.response.results.length > 0) {
      // Return the first relevant image
      return response.response.results[0].urls.regular
    }
    
    return null
  } catch (error) {
    console.error('Error searching Unsplash:', error)
    return null
  }
}

// Keywords that indicate generic or placeholder images
const genericImagePatterns = [
  'placeholder',
  'default',
  'generic',
  'sample',
  'demo',
  'test',
  'example',
  'stock'
]

function isGenericImage(imageUrl: string): boolean {
  const lowerUrl = imageUrl.toLowerCase()
  return genericImagePatterns.some(pattern => lowerUrl.includes(pattern))
}

// Extract key product terms from title for better search
function extractSearchTerms(title: string): string {
  // Remove common rental-related words to focus on the actual product
  const cleanedTitle = title
    .replace(/\b(zu vermieten|for rent|rental|mieten|leihen|ausleihen)\b/gi, '')
    .replace(/\b(neu|gebraucht|gut|sehr gut|wie neu)\b/gi, '')
    .trim()
  
  return cleanedTitle
}

async function checkAndUpdateImages() {
  console.log('Starting image check and update process...\n')
  
  try {
    // Get all items with their images
    const items = await prisma.item.findMany({
      include: {
        images: {
          orderBy: { order: 'asc' }
        },
        category: true
      }
    })
    
    console.log(`Found ${items.length} items to check\n`)
    
    let updatedCount = 0
    let checkedCount = 0
    
    for (const item of items) {
      checkedCount++
      console.log(`\n[${checkedCount}/${items.length}] Checking: ${item.title}`)
      console.log(`Category: ${item.category.name}`)
      
      // Check if item has images
      if (!item.images || item.images.length === 0) {
        console.log('❌ No images found for this item')
        
        // Search for a relevant image
        const searchQuery = `${extractSearchTerms(item.title)} ${item.category.name}`
        console.log(`🔍 Searching Unsplash for: "${searchQuery}"`)
        
        const newImageUrl = await searchUnsplashImage(searchQuery)
        
        if (newImageUrl) {
          // Add the new image
          await prisma.itemImage.create({
            data: {
              itemId: item.id,
              url: newImageUrl,
              order: 0
            }
          })
          console.log('✅ Added new image from Unsplash')
          updatedCount++
        } else {
          console.log('⚠️  Could not find a suitable image on Unsplash')
        }
      } else {
        // Check existing images
        let needsUpdate = false
        const firstImage = item.images[0]
        
        console.log(`Current image: ${firstImage.url}`)
        
        // Check if image seems generic or inappropriate
        if (isGenericImage(firstImage.url)) {
          needsUpdate = true
          console.log('❌ Image appears to be generic/placeholder')
        } else {
          // Additional check: if the image URL doesn't seem to match the product
          const itemKeywords = extractSearchTerms(item.title).toLowerCase().split(' ')
          const imageUrlLower = firstImage.url.toLowerCase()
          
          const hasRelevantKeyword = itemKeywords.some(keyword => 
            keyword.length > 3 && imageUrlLower.includes(keyword)
          )
          
          if (!hasRelevantKeyword && !firstImage.url.includes('unsplash')) {
            console.log('⚠️  Image URL doesn\'t seem to match product keywords')
            needsUpdate = true
          } else {
            console.log('✅ Image appears appropriate')
          }
        }
        
        if (needsUpdate) {
          // Search for a better image
          const searchQuery = `${extractSearchTerms(item.title)} ${item.category.name}`
          console.log(`🔍 Searching for better image: "${searchQuery}"`)
          
          const newImageUrl = await searchUnsplashImage(searchQuery)
          
          if (newImageUrl) {
            // Update the first image
            await prisma.itemImage.update({
              where: { id: firstImage.id },
              data: { url: newImageUrl }
            })
            console.log('✅ Updated with new image from Unsplash')
            updatedCount++
          } else {
            console.log('⚠️  Could not find a better image on Unsplash')
          }
        }
      }
      
      // Add a small delay to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 1000))
    }
    
    console.log('\n' + '='.repeat(50))
    console.log(`\nImage check completed!`)
    console.log(`Total items checked: ${checkedCount}`)
    console.log(`Images updated: ${updatedCount}`)
    
  } catch (error) {
    console.error('Error during image check:', error)
  } finally {
    await prisma.$disconnect()
  }
}

// Run the script
checkAndUpdateImages()