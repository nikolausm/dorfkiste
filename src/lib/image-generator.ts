// Dynamic image generation service
const UNSPLASH_ACCESS_KEY = process.env.NEXT_PUBLIC_UNSPLASH_ACCESS_KEY || 'demo'
const PLACEHOLDER_API = 'https://source.unsplash.com'

// Category to search terms mapping
const categoryImageMap: Record<string, string[]> = {
  elektronik: ['electronics', 'gadgets', 'technology', 'computer', 'phone'],
  werkzeuge: ['tools', 'hammer', 'drill', 'toolbox', 'workshop'],
  sport: ['sports', 'fitness', 'gym', 'outdoor', 'exercise'],
  haushalt: ['household', 'kitchen', 'home', 'appliance', 'furniture'],
  garten: ['garden', 'plants', 'outdoor', 'gardening', 'lawn'],
  fahrzeuge: ['bicycle', 'scooter', 'car', 'vehicle', 'transport'],
  medien: ['books', 'media', 'entertainment', 'games', 'reading'],
  sonstiges: ['rental', 'items', 'stuff', 'objects', 'things']
}

// Generate a deterministic image URL based on item properties
export function generateItemImageUrl(
  itemId: string,
  title: string,
  category?: string,
  index: number = 0
): string {
  // Extract keywords from title
  const titleWords = typeof title === 'string' ? title.toLowerCase().split(' ').filter(word => word.length > 3) : []
  const searchTerm = titleWords[0] || 'item'
  
  // Get category-specific terms
  const categoryTerms = category && typeof category === 'string' ? categoryImageMap[category.toLowerCase()] || ['rental'] : ['rental']
  const categoryTerm = categoryTerms[index % categoryTerms.length]
  
  // Use Unsplash Source API for high-quality images
  // Format: https://source.unsplash.com/640x480/?{keyword}
  const width = 640
  const height = 480
  const query = `${categoryTerm},${searchTerm}`
  
  // Add randomness based on itemId to get different images for same category
  const seed = (itemId && typeof itemId === 'string') ? itemId.slice(-6) : '000000'
  
  return `${PLACEHOLDER_API}/${width}x${height}/?${encodeURIComponent(query)}&sig=${seed}`
}

// Generate placeholder with text overlay (for fallback)
export function generatePlaceholderDataUrl(
  text: string,
  width: number = 640,
  height: number = 480,
  bgColor: string = '#f3f4f6',
  textColor: string = '#6b7280'
): string {
  const canvas = typeof document !== 'undefined' ? document.createElement('canvas') : null
  if (!canvas) {
    // Server-side fallback
    return generateItemImageUrl('placeholder', text)
  }
  
  canvas.width = width
  canvas.height = height
  const ctx = canvas.getContext('2d')
  
  if (!ctx) return ''
  
  // Background
  ctx.fillStyle = bgColor
  ctx.fillRect(0, 0, width, height)
  
  // Text
  ctx.fillStyle = textColor
  ctx.font = 'bold 24px Arial'
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  
  // Wrap text if too long
  const maxWidth = width * 0.8
  const words = typeof text === 'string' ? text.split(' ') : []
  const lines: string[] = []
  let currentLine = ''
  
  words.forEach(word => {
    const testLine = currentLine + (currentLine ? ' ' : '') + word
    const metrics = ctx.measureText(testLine)
    if (metrics.width > maxWidth && currentLine) {
      lines.push(currentLine)
      currentLine = word
    } else {
      currentLine = testLine
    }
  })
  if (currentLine) lines.push(currentLine)
  
  // Draw lines
  const lineHeight = 30
  const startY = height / 2 - (lines.length - 1) * lineHeight / 2
  lines.forEach((line, index) => {
    ctx.fillText(line, width / 2, startY + index * lineHeight)
  })
  
  return canvas.toDataURL()
}

// Get category icon emoji
export function getCategoryIcon(category?: string): string {
  const icons: Record<string, string> = {
    elektronik: '📱',
    werkzeuge: '🔧',
    sport: '⚽',
    haushalt: '🏠',
    garten: '🌱',
    fahrzeuge: '🚗',
    medien: '📚',
    sonstiges: '📦'
  }
  
  return category && typeof category === 'string' ? icons[category.toLowerCase()] || '📦' : '📦'
}

// Generate multiple images for an item
export function generateItemImages(
  itemId: string,
  title: string,
  category?: string,
  count: number = 3
): string[] {
  return Array.from({ length: count }, (_, index) => 
    generateItemImageUrl(itemId, title, category, index)
  )
}