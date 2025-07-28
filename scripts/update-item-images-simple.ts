import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// Map of item titles to appropriate image URLs using Lorem Picsum
const itemImageUrls: Record<string, string[]> = {
  // Werkzeuge
  'Bosch Professional Schlagbohrmaschine': [
    'https://images.unsplash.com/photo-1572981779307-38b8cabb2407?w=800&h=600&fit=crop', // drill
    'https://images.unsplash.com/photo-1504148455328-c376907d081c?w=800&h=600&fit=crop', // power tools
    'https://images.unsplash.com/photo-1609205807490-4c6b8d6faa2e?w=800&h=600&fit=crop'  // drilling
  ],
  'Makita Akkuschrauber Set': [
    'https://images.unsplash.com/photo-1609205807491-c6b839d386cc?w=800&h=600&fit=crop', // makita drill
    'https://images.unsplash.com/photo-1530124566582-a618bc2615dc?w=800&h=600&fit=crop', // tool set
    'https://images.unsplash.com/photo-1586864387967-d02ef85d93e8?w=800&h=600&fit=crop'  // cordless tools
  ],
  'Stichsäge Bosch PST 900': [
    'https://images.unsplash.com/photo-1609205749452-8bf7c5326304?w=800&h=600&fit=crop', // jigsaw
    'https://images.unsplash.com/photo-1580901369227-308f6f40bdeb?w=800&h=600&fit=crop', // cutting wood
  ],
  'Werkzeugkoffer 216-teilig': [
    'https://images.unsplash.com/photo-1581147036324-c17ac41dfa6c?w=800&h=600&fit=crop', // toolbox
    'https://images.unsplash.com/photo-1609205565107-fbe531e45531?w=800&h=600&fit=crop', // tool case
    'https://images.unsplash.com/photo-1426927308491-6380b6a9936f?w=800&h=600&fit=crop'  // tools
  ],
  'Leiter 3m Aluminium': [
    'https://images.unsplash.com/photo-1618221941158-9fc2876d7e0e?w=800&h=600&fit=crop', // ladder
    'https://images.unsplash.com/photo-1600585152220-90363fe7e115?w=800&h=600&fit=crop', // aluminum ladder
  ],
  'Hochdruckreiniger Kärcher K5': [
    'https://images.unsplash.com/photo-1563453392212-326f5e854473?w=800&h=600&fit=crop', // pressure washer
    'https://images.unsplash.com/photo-1558355122-7820a9bb6c9e?w=800&h=600&fit=crop', // cleaning
  ],
  'Fliesenschneider Profi': [
    'https://images.unsplash.com/photo-1609207825181-df49bdc09d1a?w=800&h=600&fit=crop', // tile cutter
    'https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?w=800&h=600&fit=crop', // tiles
  ],
  'Betonmischer 140L': [
    'https://images.unsplash.com/photo-1590736969955-71cc94901144?w=800&h=600&fit=crop', // cement mixer
    'https://images.unsplash.com/photo-1587582345426-bf07f534b063?w=800&h=600&fit=crop', // construction
  ],
  'Winkelschleifer Bosch': [
    'https://images.unsplash.com/photo-1609205740105-2aa72f67b5e0?w=800&h=600&fit=crop', // angle grinder
    'https://images.unsplash.com/photo-1572195322049-14fd35d3af83?w=800&h=600&fit=crop', // grinding
  ],
  'Schweißgerät MIG/MAG': [
    'https://images.unsplash.com/photo-1565689157206-0fddef7589a2?w=800&h=600&fit=crop', // welding
    'https://images.unsplash.com/photo-1609094259681-a96a5e0ab222?w=800&h=600&fit=crop', // welder
  ],
  
  // Gartengeräte
  'Rasenmäher Benzin Honda': [
    'https://images.unsplash.com/photo-1589923158776-cb4485d99fd6?w=800&h=600&fit=crop', // lawn mower
    'https://images.unsplash.com/photo-1558904541-efa843a96f01?w=800&h=600&fit=crop', // mowing
    'https://images.unsplash.com/photo-1592417817038-d13fd7342605?w=800&h=600&fit=crop'  // garden
  ],
  'Heckenschere elektrisch Bosch': [
    'https://images.unsplash.com/photo-1609358906607-9eb629e7c6fa?w=800&h=600&fit=crop', // hedge trimmer
    'https://images.unsplash.com/photo-1603313952246-2754b3364f0f?w=800&h=600&fit=crop', // trimming
  ],
  'Vertikutierer elektrisch': [
    'https://images.unsplash.com/photo-1558904541-efa843a96f01?w=800&h=600&fit=crop', // lawn care
    'https://images.unsplash.com/photo-1595351298020-038700daf092?w=800&h=600&fit=crop', // garden tools
  ],
  'Laubsauger/Bläser Stihl': [
    'https://images.unsplash.com/photo-1570784332176-a2c8f5c9ecb8?w=800&h=600&fit=crop', // leaf blower
    'https://images.unsplash.com/photo-1605117882932-f9e32b03fea9?w=800&h=600&fit=crop', // autumn leaves
  ],
  'Gartenhäcksler': [
    'https://images.unsplash.com/photo-1609358906667-6e6a4bdbdbc1?w=800&h=600&fit=crop', // garden shredder
    'https://images.unsplash.com/photo-1558217074-2bedb3c6a707?w=800&h=600&fit=crop', // wood chips
  ],
  'Motorhacke/Gartenfräse': [
    'https://images.unsplash.com/photo-1613213026117-d6e1a5dd08fa?w=800&h=600&fit=crop', // tiller
    'https://images.unsplash.com/photo-1593851043873-507df8cb7721?w=800&h=600&fit=crop', // soil preparation
  ],
  'Bewässerungssystem komplett': [
    'https://images.unsplash.com/photo-1546971587-02375cbbdade?w=800&h=600&fit=crop', // irrigation
    'https://images.unsplash.com/photo-1582567730378-6ff8ce130d05?w=800&h=600&fit=crop', // watering system
  ],
  'Gewächshaus faltbar 2x3m': [
    'https://images.unsplash.com/photo-1549488344-cbb6c34f7b1f?w=800&h=600&fit=crop', // greenhouse
    'https://images.unsplash.com/photo-1585399000684-d2f72660f092?w=800&h=600&fit=crop', // plants growing
  ],
  'Gartenparty-Set (Pavillons + Stehtische)': [
    'https://images.unsplash.com/photo-1519225421980-715cb0215aed?w=800&h=600&fit=crop', // party tent
    'https://images.unsplash.com/photo-1530103862676-de8c9debad1d?w=800&h=600&fit=crop', // outdoor party
  ],
  'Outdoor-Grill Weber': [
    'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=800&h=600&fit=crop', // bbq grill
    'https://images.unsplash.com/photo-1523301343968-6a6ebf63c672?w=800&h=600&fit=crop', // grilling
  ],
  
  // Haushalt & Küche
  'Thermomix TM6': [
    'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=800&h=600&fit=crop', // kitchen appliance
    'https://images.unsplash.com/photo-1565183928294-7063f23ce0f8?w=800&h=600&fit=crop', // cooking
  ],
  'Kitchenaid Küchenmaschine': [
    'https://images.unsplash.com/photo-1574269909862-7e1d70bb8078?w=800&h=600&fit=crop', // stand mixer
    'https://images.unsplash.com/photo-1601000937735-d86c7f9d5c79?w=800&h=600&fit=crop', // baking
  ],
  'Raclette-Grill für 8 Personen': [
    'https://images.unsplash.com/photo-1619126438773-92556604bb8c?w=800&h=600&fit=crop', // raclette
    'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=800&h=600&fit=crop', // table grill
  ],
  'Dampfreiniger Kärcher': [
    'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=800&h=600&fit=crop', // steam cleaner
    'https://images.unsplash.com/photo-1527515545081-5db817172677?w=800&h=600&fit=crop', // cleaning floor
  ],
  'Nähmaschine Singer + Zubehör': [
    'https://images.unsplash.com/photo-1593963758623-232b41754cb5?w=800&h=600&fit=crop', // sewing machine
    'https://images.unsplash.com/photo-1586038693838-e72f2a7a2e76?w=800&h=600&fit=crop', // sewing
  ],
  
  // Elektronik
  'Sony Alpha 7III Kamera + Objektive': [
    'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=800&h=600&fit=crop', // camera
    'https://images.unsplash.com/photo-1502920917128-1aa500764cbd?w=800&h=600&fit=crop', // photography
    'https://images.unsplash.com/photo-1612198188060-c7c2a3b66eae?w=800&h=600&fit=crop'  // lenses
  ],
  'DJI Mavic Pro Drohne': [
    'https://images.unsplash.com/photo-1579829366248-204fe8413f31?w=800&h=600&fit=crop', // drone
    'https://images.unsplash.com/photo-1527977966376-1c8408f9f108?w=800&h=600&fit=crop', // flying drone
  ],
  'Beamer 4K Epson + Leinwand': [
    'https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?w=800&h=600&fit=crop', // projector
    'https://images.unsplash.com/photo-1535016120720-40c646be5580?w=800&h=600&fit=crop', // home cinema
  ],
  'GoPro Hero 11 + Zubehör': [
    'https://images.unsplash.com/photo-1607462109225-6b64ae2dd3cb?w=800&h=600&fit=crop', // gopro
    'https://images.unsplash.com/photo-1573047330191-fb342b4de0c0?w=800&h=600&fit=crop', // action camera
  ],
  'Powerstation 1000W Solar': [
    'https://images.unsplash.com/photo-1609941856878-290fa2473f31?w=800&h=600&fit=crop', // power station
    'https://images.unsplash.com/photo-1509391366360-2e959784a276?w=800&h=600&fit=crop', // solar power
  ],
  
  // Camping & Sport
  '6-Personen Camping-Zelt': [
    'https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?w=800&h=600&fit=crop', // camping tent
    'https://images.unsplash.com/photo-1478131143081-80f7f84ca84d?w=800&h=600&fit=crop', // camping
  ],
  'Schlafsack-Set (4 Stück) -15°C': [
    'https://images.unsplash.com/photo-1605540436563-5bca919ae766?w=800&h=600&fit=crop', // sleeping bags
    'https://images.unsplash.com/photo-1520095972714-909e91b038e5?w=800&h=600&fit=crop', // camping gear
  ],
  'Campingkocher + Geschirr-Set': [
    'https://images.unsplash.com/photo-1598245319451-f05bfc14c708?w=800&h=600&fit=crop', // camping stove
    'https://images.unsplash.com/photo-1560184653-d567ad3629b6?w=800&h=600&fit=crop', // camp cooking
  ],
  'Fahrradträger für 4 Räder': [
    'https://images.unsplash.com/photo-1558637845-c8b7ead71a3e?w=800&h=600&fit=crop', // bike rack
    'https://images.unsplash.com/photo-1594736797933-d0501ba2fe65?w=800&h=600&fit=crop', // car with bikes
  ],
  'Stand-Up-Paddle Board Set': [
    'https://images.unsplash.com/photo-1547919307-1ecb10702e6f?w=800&h=600&fit=crop', // SUP
    'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=800&h=600&fit=crop', // paddleboarding
  ],
  
  // Kinderbedarf
  'Kinderwagen Bugaboo Fox': [
    'https://images.unsplash.com/photo-1606923231878-6b47c4032fa2?w=800&h=600&fit=crop', // stroller
    'https://images.unsplash.com/photo-1585027760939-c968dc67e21f?w=800&h=600&fit=crop', // baby stroller
  ],
  'Babywippe elektrisch': [
    'https://images.unsplash.com/photo-1522771930-78848d9293e8?w=800&h=600&fit=crop', // baby bouncer
    'https://images.unsplash.com/photo-1596468602595-aeabf0a7c887?w=800&h=600&fit=crop', // baby gear
  ],
  'Reisebett + Matratze': [
    'https://images.unsplash.com/photo-1566479179817-5f73e75ddb7c?w=800&h=600&fit=crop', // travel cot
    'https://images.unsplash.com/photo-1519340241574-2cec6aef0c01?w=800&h=600&fit=crop', // baby bed
  ],
  'Hochstuhl Stokke Tripp Trapp': [
    'https://images.unsplash.com/photo-1569163139394-de4798c38baa?w=800&h=600&fit=crop', // high chair
    'https://images.unsplash.com/photo-1585843436865-e2e8703cc6cf?w=800&h=600&fit=crop', // baby eating
  ],
  'Laufrad Puky': [
    'https://images.unsplash.com/photo-1520175480921-4edfa2983e0f?w=800&h=600&fit=crop', // balance bike
    'https://images.unsplash.com/photo-1597007066704-67bf2068d5b3?w=800&h=600&fit=crop', // kid biking
  ]
}

// Use Lorem Picsum as fallback for items without specific images
function getPlaceholderImages(itemTitle: string, count: number = 3): string[] {
  const images: string[] = []
  for (let i = 0; i < count; i++) {
    // Use item title as seed for consistent images
    const seed = `${itemTitle}-${i}`.replace(/[^a-zA-Z0-9]/g, '')
    images.push(`https://picsum.photos/seed/${seed}/800/600`)
  }
  return images
}

async function updateItemImages() {
  console.log('🖼️  Starting image update process...')
  
  // Get all items with their current images
  const items = await prisma.item.findMany({
    include: {
      images: true,
      category: true
    }
  })
  
  console.log(`Found ${items.length} items to process`)
  
  let updatedCount = 0
  
  for (const item of items) {
    console.log(`\n📦 Processing: ${item.title}`)
    
    // Skip if item already has real images (not placeholder)
    if (item.images.length > 0 && !item.images[0].url.includes('placeholder') && !item.images[0].url.includes('source.unsplash.com')) {
      console.log('  ✅ Already has custom images, skipping...')
      continue
    }
    
    // Delete existing generated images
    if (item.images.length > 0) {
      await prisma.itemImage.deleteMany({
        where: { itemId: item.id }
      })
    }
    
    // Get images for this item
    const images = itemImageUrls[item.title] || getPlaceholderImages(item.title)
    
    // Create new image records
    await prisma.itemImage.createMany({
      data: images.map((url, index) => ({
        itemId: item.id,
        url,
        order: index
      }))
    })
    
    console.log(`  ✅ Added ${images.length} images for ${item.title}`)
    updatedCount++
  }
  
  console.log(`\n✅ Updated images for ${updatedCount} items!`)
}

// Run the script
updateItemImages()
  .catch(console.error)
  .finally(() => prisma.$disconnect())