import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// Define specific image recommendations for each item based on their titles
const imageRecommendations: Record<string, {
  concern: string
  suggestion: string
  searchTerms: string[]
}> = {
  "Bosch Professional Schlagbohrmaschine": {
    concern: "Generic drill image might not show the specific Bosch model",
    suggestion: "Search for 'Bosch Professional hammer drill blue' for brand-specific image",
    searchTerms: ["Bosch Professional hammer drill", "Bosch blue drill", "Bosch impact drill"]
  },
  "Makita Akkuschrauber Set": {
    concern: "Should show the complete Makita set with accessories",
    suggestion: "Search for 'Makita cordless drill set case' to show the full kit",
    searchTerms: ["Makita drill set complete", "Makita cordless drill kit", "Makita power tool set"]
  },
  "Thermomix TM6": {
    concern: "Generic kitchen appliance image might not show the distinctive Thermomix",
    suggestion: "Search for 'Thermomix TM6 Vorwerk' for the specific model",
    searchTerms: ["Thermomix TM6", "Vorwerk Thermomix", "Thermomix kitchen robot"]
  },
  "Stokke Tripp Trapp": {
    concern: "Generic high chair image might not show the iconic Stokke design",
    suggestion: "Search for 'Stokke Tripp Trapp wooden high chair' for the specific model",
    searchTerms: ["Stokke Tripp Trapp", "Tripp Trapp high chair", "Stokke wooden chair"]
  },
  "Vertikutierer elektrisch": {
    concern: "May show a regular lawn mower instead of a scarifier",
    suggestion: "Search for 'electric lawn scarifier dethatcher' for correct equipment",
    searchTerms: ["electric scarifier", "lawn dethatcher", "Vertikutierer machine"]
  },
  "Gartenhäcksler": {
    concern: "Might show generic garden tools instead of a shredder",
    suggestion: "Search for 'garden shredder chipper' for the specific machine",
    searchTerms: ["garden shredder", "wood chipper", "branch shredder machine"]
  },
  "Motorhacke/Gartenfräse": {
    concern: "Could show a lawn mower instead of a tiller",
    suggestion: "Search for 'garden tiller cultivator' for the correct tool",
    searchTerms: ["garden tiller", "soil cultivator", "motorized tiller"]
  },
  "Fliesenschneider Profi": {
    concern: "Might show basic hand tools instead of professional tile cutter",
    suggestion: "Search for 'professional tile cutter machine' for proper equipment",
    searchTerms: ["professional tile cutter", "ceramic tile cutter", "tile cutting machine"]
  },
  "Powerstation 1000W Solar": {
    concern: "Should show a portable power station, not regular solar panels",
    suggestion: "Search for 'portable power station 1000W' for the correct device",
    searchTerms: ["portable power station", "solar generator 1000W", "battery power station"]
  },
  "Raclette-Grill für 8 Personen": {
    concern: "Should show a raclette grill specifically, not a regular grill",
    suggestion: "Search for 'raclette grill party 8 person' for the right appliance",
    searchTerms: ["raclette grill", "raclette party grill", "Swiss raclette machine"]
  },
  "DJI Mavic Pro Drohne": {
    concern: "Should show the specific DJI Mavic Pro model",
    suggestion: "Search for 'DJI Mavic Pro drone' for the exact model",
    searchTerms: ["DJI Mavic Pro", "Mavic Pro drone", "DJI drone Mavic"]
  },
  "Puky Laufrad": {
    concern: "Should show a Puky brand balance bike",
    suggestion: "Search for 'Puky balance bike' for brand-specific image",
    searchTerms: ["Puky balance bike", "Puky Laufrad", "Puky children bike"]
  },
  "Stand-Up-Paddle Board Set": {
    concern: "Should show the complete SUP set with paddle and accessories",
    suggestion: "Search for 'SUP board complete set' to show all components",
    searchTerms: ["SUP board set", "stand up paddle complete", "inflatable SUP kit"]
  },
  "GoPro Hero 11 + Zubehör": {
    concern: "Should show GoPro Hero 11 specifically with accessories",
    suggestion: "Search for 'GoPro Hero 11 accessories kit' for complete set",
    searchTerms: ["GoPro Hero 11", "GoPro Hero 11 kit", "GoPro accessories set"]
  },
  "Kitchenaid Küchenmaschine": {
    concern: "Should show the iconic KitchenAid stand mixer",
    suggestion: "Search for 'KitchenAid stand mixer' for brand recognition",
    searchTerms: ["KitchenAid stand mixer", "KitchenAid mixer", "KitchenAid kitchen machine"]
  },
  "Betonmischer 140L": {
    concern: "Should show a 140L concrete mixer specifically",
    suggestion: "Search for 'concrete mixer 140 liter' for correct capacity",
    searchTerms: ["concrete mixer 140L", "cement mixer machine", "construction concrete mixer"]
  }
}

async function analyzeCurrentImages() {
  console.log('Comprehensive Image Quality Analysis\n')
  console.log('=' .repeat(80))
  
  try {
    const items = await prisma.item.findMany({
      include: {
        images: { orderBy: { order: 'asc' } },
        category: true
      },
      orderBy: { title: 'asc' }
    })
    
    let issuesFound = 0
    const recommendations: any[] = []
    
    for (const item of items) {
      const recommendation = imageRecommendations[item.title]
      
      if (recommendation) {
        issuesFound++
        console.log(`\n❗ ${item.title}`)
        console.log(`   Category: ${item.category.name}`)
        console.log(`   Current image: ${item.images[0]?.url || 'No image'}`)
        console.log(`   Concern: ${recommendation.concern}`)
        console.log(`   Suggestion: ${recommendation.suggestion}`)
        console.log(`   Better search terms:`)
        recommendation.searchTerms.forEach(term => {
          console.log(`     - "${term}"`)
        })
        
        recommendations.push({
          itemId: item.id,
          title: item.title,
          currentImage: item.images[0]?.url,
          recommendation
        })
      }
    }
    
    console.log('\n' + '=' .repeat(80))
    console.log('\nSummary:')
    console.log(`Total items analyzed: ${items.length}`)
    console.log(`Items with potential image issues: ${issuesFound}`)
    console.log(`Items with appropriate images: ${items.length - issuesFound}`)
    
    if (issuesFound > 0) {
      console.log('\n📋 Action Items:')
      console.log('1. Set up Unsplash API key in .env file')
      console.log('2. Run the update script to replace images')
      console.log('3. Review updated images for accuracy')
      
      // Save recommendations to a file for reference
      const fs = require('fs').promises
      await fs.writeFile(
        'image-update-recommendations.json',
        JSON.stringify(recommendations, null, 2)
      )
      console.log('\n✅ Recommendations saved to image-update-recommendations.json')
    } else {
      console.log('\n✅ All images appear to be appropriate!')
    }
    
  } catch (error) {
    console.error('Error during analysis:', error)
  } finally {
    await prisma.$disconnect()
  }
}

// Run the analysis
analyzeCurrentImages()