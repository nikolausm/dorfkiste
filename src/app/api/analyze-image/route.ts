import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import fs from 'fs/promises'
import path from 'path'

// Erweiterte Kategorie-Zuordnung mit Schlüsselwörtern
const CATEGORY_KEYWORDS = {
  'Werkzeuge': ['bohrer', 'säge', 'hammer', 'schraubenzieher', 'werkzeug', 'akkuschrauber', 'schleifer', 'zange', 'schraubenschlüssel', 'stichsäge', 'flex', 'winkelschleifer'],
  'Gartengeräte': ['rasenmäher', 'garten', 'heckenschere', 'spaten', 'schaufel', 'rechen', 'gießkanne', 'schubkarre', 'vertikutierer', 'laubsauger', 'häcksler'],
  'Küchengeräte': ['mixer', 'küche', 'kochen', 'backen', 'mikrowelle', 'toaster', 'kaffeemaschine', 'küchenmaschine', 'entsafter', 'waage', 'rührgerät'],
  'Sport & Freizeit': ['fahrrad', 'sport', 'fitness', 'zelt', 'camping', 'ski', 'snowboard', 'skateboard', 'ball', 'schläger', 'helm', 'rucksack'],
  'Elektronik': ['computer', 'laptop', 'tablet', 'monitor', 'drucker', 'kamera', 'projektor', 'lautsprecher', 'kopfhörer', 'spielkonsole', 'elektronik'],
  'Camping': ['zelt', 'schlafsack', 'campingstuhl', 'campingtisch', 'gaskocher', 'kühlbox', 'isomatte', 'campinglampe', 'outdoor'],
  'Partybedarf': ['party', 'lichterkette', 'musikanlage', 'pavillon', 'biertisch', 'stehtisch', 'grill', 'zapfanlage', 'sound', 'deko'],
  'Kinderbedarf': ['kinderwagen', 'babysitz', 'spielzeug', 'hochstuhl', 'laufrad', 'kinderfahrrad', 'babyphone', 'wickeltisch', 'kind', 'baby'],
  'Haushalt': ['staubsauger', 'bügeleisen', 'nähmaschine', 'leiter', 'reinigung', 'putzen', 'wischen', 'kehren', 'haushalt'],
}

// Verbesserte Zustandserkennung
const CONDITION_INDICATORS = {
  'neu': ['neu', 'unbenutzt', 'originalverpackt', 'ovp', 'nagelneu', 'fabrikneu'],
  'sehr gut': ['sehr gut', 'kaum benutzt', 'top zustand', 'wie neu', 'selten benutzt', 'gepflegt'],
  'gut': ['gut', 'normale gebrauchsspuren', 'funktionsfähig', 'intakt', 'ordentlich'],
  'gebraucht': ['gebraucht', 'deutliche gebrauchsspuren', 'älter', 'benutzt', 'abgenutzt']
}

// Intelligente Preisvorschläge basierend auf Kategorie
const PRICE_RANGES: Record<string, { min: number; max: number; factor: number }> = {
  'Werkzeuge': { min: 5, max: 50, factor: 0.08 },
  'Gartengeräte': { min: 10, max: 60, factor: 0.1 },
  'Küchengeräte': { min: 5, max: 30, factor: 0.07 },
  'Sport & Freizeit': { min: 10, max: 40, factor: 0.09 },
  'Elektronik': { min: 15, max: 100, factor: 0.12 },
  'Camping': { min: 10, max: 50, factor: 0.1 },
  'Partybedarf': { min: 20, max: 150, factor: 0.15 },
  'Kinderbedarf': { min: 5, max: 30, factor: 0.08 },
  'Haushalt': { min: 5, max: 40, factor: 0.08 },
  'Sonstiges': { min: 10, max: 50, factor: 0.1 }
}

async function analyzeImageWithAI(imageUrl: string) {
  const openaiApiKey = process.env.OPENAI_API_KEY
  
  console.log('OpenAI API Key vorhanden:', !!openaiApiKey)
  console.log('API Key Länge:', openaiApiKey?.length)
  
  if (!openaiApiKey) {
    console.log('Keine API Key gefunden, verwende Mock-Daten')
    return await getIntelligentMockAnalysis(imageUrl)
  }

  // Konvertiere lokale URL zu base64
  let imageData = imageUrl
  if (imageUrl.startsWith('/uploads/')) {
    try {
      const filePath = path.join(process.cwd(), 'public', imageUrl)
      const imageBuffer = await fs.readFile(filePath)
      const base64 = imageBuffer.toString('base64')
      const fileExtension = path.extname(filePath).slice(1)
      const mimeType = fileExtension === 'jpg' ? 'jpeg' : fileExtension
      imageData = `data:image/${mimeType};base64,${base64}`
    } catch (error) {
      console.error('Fehler beim Lesen der Bilddatei:', error)
      return await getIntelligentMockAnalysis(imageUrl)
    }
  }

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openaiApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages: [
          {
            role: 'system',
            content: `Du bist ein deutschsprachiger Experte für Produkterkennung auf einer Nachbarschafts-Verleihplattform.

DEINE AUFGABE:
Analysiere das Bild genau und identifiziere das Hauptprodukt, das verliehen werden soll.

WICHTIGE REGELN:
1. Fokussiere dich auf das zentrale Objekt im Bild
2. Ignoriere Hintergründe, Personen oder unwichtige Details
3. Verwende klare, deutsche Produktbezeichnungen
4. Sei spezifisch bei der Produktbeschreibung (Marke, Modell, Größe wenn erkennbar)

KATEGORIEN (wähle die passendste):
- Werkzeuge: Bohrmaschinen, Sägen, Schleifer, etc.
- Gartengeräte: Rasenmäher, Heckenscheren, etc.
- Küchengeräte: Mixer, Küchenmaschinen, etc.
- Sport & Freizeit: Fahrräder, Sportgeräte, etc.
- Elektronik: Computer, Kameras, etc.
- Camping: Zelte, Schlafsäcke, etc.
- Partybedarf: Soundanlagen, Pavillons, etc.
- Kinderbedarf: Kinderwagen, Spielzeug, etc.
- Haushalt: Staubsauger, Leitern, etc.
- Sonstiges: Alles andere

ZUSTAND BEWERTUNG:
- neu: Keine Gebrauchsspuren erkennbar
- sehr gut: Minimale Gebrauchsspuren
- gut: Normale Gebrauchsspuren
- gebraucht: Deutliche Gebrauchsspuren

Antworte IMMER in diesem JSON-Format:
{
  "produktname": "Spezifischer Produktname",
  "kategorie": "Eine der obigen Kategorien",
  "zustand": "neu/sehr gut/gut/gebraucht",
  "beschreibung": "2-3 Sätze Beschreibung mit wichtigen Details",
  "marke": "Marke falls erkennbar",
  "besonderheiten": ["Feature 1", "Feature 2"],
  "geschaetzter_neupreis": Zahl
}`
          },
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: 'Analysiere dieses Produkt für eine Verleihplattform. Sei präzise und fokussiere dich auf das Hauptobjekt.'
              },
              {
                type: 'image_url',
                image_url: {
                  url: imageData
                }
              }
            ]
          }
        ],
        max_tokens: 500,
        temperature: 0.3 // Niedrigere Temperatur für konsistentere Ergebnisse
      })
    })

    if (!response.ok) {
      const errorData = await response.json()
      console.error('OpenAI API error:', errorData)
      console.log('Verwende Mock-Daten wegen API Fehler')
      throw new Error('OpenAI API error')
    }

    const data = await response.json()
    const content = data.choices[0]?.message?.content
    
    console.log('OpenAI Response erhalten:', !!content)

    if (content) {
      try {
        const parsed = JSON.parse(content)
        console.log('OpenAI Analyse:', parsed.produktname)
        
        // Kategorie-ID finden
        const categories = await prisma.category.findMany()
        const category = findBestMatchingCategory(parsed.kategorie, categories)
        
        // Intelligente Preisberechnung
        const suggestedPrice = calculateSuggestedPrice(
          parsed.kategorie || 'Sonstiges',
          parsed.zustand || 'gut',
          parsed.geschaetzter_neupreis
        )

        return {
          title: parsed.produktname || parsed.titel || 'Unbekanntes Produkt',
          description: formatDescription(parsed),
          categoryId: category?.id || '',
          condition: normalizeCondition(parsed.zustand),
          suggestedPricePerDay: suggestedPrice.perDay,
          suggestedPricePerHour: suggestedPrice.perHour,
          deposit: suggestedPrice.deposit,
          metadata: {
            brand: parsed.marke,
            features: parsed.besonderheiten,
            estimatedNewPrice: parsed.geschaetzter_neupreis
          }
        }
      } catch (e) {
        console.error('Error parsing AI response:', e, content)
        return await getIntelligentMockAnalysis(imageUrl)
      }
    }
  } catch (error) {
    console.error('Error calling OpenAI API:', error)
    return await getIntelligentMockAnalysis(imageUrl)
  }

  return await getIntelligentMockAnalysis(imageUrl)
}

// Verbesserte Mock-Analyse mit intelligenteren Beispielen
async function getIntelligentMockAnalysis(imageUrl?: string) {
  // Kategorien aus der Datenbank laden
  const categories = await prisma.category.findMany()
  
  const mockResults = [
    {
      title: "Bosch Professional GSB 18V-55 Akku-Schlagbohrschrauber",
      description: "Professioneller 18V Akku-Schlagbohrschrauber von Bosch mit 2 Akkus (2.0Ah), Ladegerät und Transportkoffer. 55 Nm Drehmoment, ideal für anspruchsvolle Bohr- und Schraubarbeiten.",
      categoryName: "Werkzeuge",
      condition: "sehr gut",
      suggestedPricePerDay: 25,
      suggestedPricePerHour: 5,
      deposit: 50,
      metadata: {
        brand: "Bosch Professional",
        features: ["2 Akkus inklusive", "Mit Koffer", "55 Nm Drehmoment"],
        estimatedNewPrice: 280
      }
    },
    {
      title: "Cube Kathmandu Hybrid Pro 625 E-Trekkingrad",
      description: "Hochwertiges E-Trekkingrad mit Bosch Performance Line Motor (625 Wh Akku). Shimano Deore 10-Gang Schaltung, hydraulische Scheibenbremsen. Rahmengröße 54cm, für Fahrer 170-185cm.",
      categoryName: "Sport & Freizeit",
      condition: "gut",
      suggestedPricePerDay: 45,
      suggestedPricePerHour: 8,
      deposit: 100,
      metadata: {
        brand: "Cube",
        features: ["625 Wh Akku", "Bosch Motor", "10-Gang Shimano"],
        estimatedNewPrice: 3200
      }
    },
    {
      title: "Coleman Darwin 4+ Familienzelt",
      description: "Geräumiges 4-Personen Kuppelzelt mit extra Vorraum. Wassersäule 3000mm, verschweißte Nähte. Aufbauzeit ca. 15 Minuten. Packmaß 58x18x18cm, Gewicht 5,2kg.",
      categoryName: "Camping",
      condition: "gut",
      suggestedPricePerDay: 30,
      suggestedPricePerHour: null,
      deposit: 60,
      metadata: {
        brand: "Coleman",
        features: ["4+ Personen", "Wassersäule 3000mm", "Mit Vorraum"],
        estimatedNewPrice: 220
      }
    },
    {
      title: "Kärcher K5 Premium Full Control Plus Hochdruckreiniger",
      description: "Leistungsstarker Hochdruckreiniger mit 145 bar Druck, 500 l/h Fördermenge. Inklusive Dreckfräser, Flächenreiniger und 8m Hochdruckschlauch. LED-Display für Druckanzeige.",
      categoryName: "Gartengeräte",
      condition: "sehr gut",
      suggestedPricePerDay: 35,
      suggestedPricePerHour: 7,
      deposit: 70,
      metadata: {
        brand: "Kärcher",
        features: ["145 bar", "LED-Display", "Viel Zubehör"],
        estimatedNewPrice: 380
      }
    },
    {
      title: "Makita DUH523Z Akku-Heckenschere 18V",
      description: "Leichte und handliche Akku-Heckenschere mit 52cm Schnittlänge. Beidseitig geschliffenes Messer, 22mm Schnittstärke. Ohne Akku und Ladegerät (separat erhältlich).",
      categoryName: "Gartengeräte",
      condition: "gut",
      suggestedPricePerDay: 20,
      suggestedPricePerHour: 4,
      deposit: 40,
      metadata: {
        brand: "Makita",
        features: ["52cm Schnittlänge", "22mm Schnittstärke", "Sehr leicht"],
        estimatedNewPrice: 150
      }
    }
  ]
  
  // Zufällige Auswahl mit etwas Variation
  const selected = { ...mockResults[Math.floor(Math.random() * mockResults.length)] }
  
  // Kleine Variationen hinzufügen
  if (Math.random() > 0.5) {
    selected.suggestedPricePerDay = Math.round(selected.suggestedPricePerDay * (0.9 + Math.random() * 0.2))
  }
  
  // Kategorie-ID finden
  const category = categories.find(c => c.name === selected.categoryName)
  
  return {
    ...selected,
    categoryId: category?.id || categories.find(c => c.name === 'Sonstiges')?.id || ''
  }
}

// Hilfsfunktionen
function findBestMatchingCategory(categoryName: string, categories: any[]) {
  if (!categoryName) return null
  
  const normalizedInput = categoryName.toLowerCase()
  
  // Exakte Übereinstimmung
  const exactMatch = categories.find(c => 
    c.name.toLowerCase() === normalizedInput
  )
  if (exactMatch) return exactMatch
  
  // Keyword-basierte Zuordnung
  for (const [catName, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
    if (keywords.some(keyword => normalizedInput.includes(keyword))) {
      const category = categories.find(c => c.name === catName)
      if (category) return category
    }
  }
  
  // Teilübereinstimmung
  const partialMatch = categories.find(c => 
    c.name.toLowerCase().includes(normalizedInput) || 
    normalizedInput.includes(c.name.toLowerCase())
  )
  if (partialMatch) return partialMatch
  
  // Fallback auf "Sonstiges"
  return categories.find(c => c.name === 'Sonstiges')
}

function normalizeCondition(condition: string): string {
  if (!condition) return 'gut'
  
  const normalized = condition.toLowerCase()
  
  for (const [conditionKey, indicators] of Object.entries(CONDITION_INDICATORS)) {
    if (indicators.some(indicator => normalized.includes(indicator))) {
      return conditionKey
    }
  }
  
  return 'gut'
}

function calculateSuggestedPrice(category: string, condition: string, estimatedNewPrice?: number) {
  const priceRange = PRICE_RANGES[category] || PRICE_RANGES['Sonstiges']
  
  let basePrice = priceRange.min
  
  // Wenn Neupreis geschätzt wurde, verwende diesen als Basis
  if (estimatedNewPrice && estimatedNewPrice > 0) {
    basePrice = estimatedNewPrice * priceRange.factor
  } else {
    // Sonst verwende Durchschnitt des Preisbereichs
    basePrice = (priceRange.min + priceRange.max) / 2
  }
  
  // Zustand berücksichtigen
  const conditionMultipliers: Record<string, number> = {
    'neu': 1.2,
    'sehr gut': 1.0,
    'gut': 0.85,
    'gebraucht': 0.7
  }
  
  const multiplier = conditionMultipliers[condition] || 0.85
  const adjustedPrice = basePrice * multiplier
  
  // Preise berechnen
  const perDay = Math.round(Math.max(priceRange.min, Math.min(adjustedPrice, priceRange.max)))
  const perHour = perDay >= 20 ? Math.round(perDay / 5) : null // Stundensatz nur bei höheren Tagespreisen
  const deposit = Math.round(perDay * 2) // Kaution = 2 Tagesmieten
  
  return { perDay, perHour, deposit }
}

function formatDescription(parsed: any): string {
  let description = parsed.beschreibung || ''
  
  if (parsed.marke && !description.includes(parsed.marke)) {
    description = `${parsed.marke} ${description}`
  }
  
  if (parsed.besonderheiten && parsed.besonderheiten.length > 0) {
    const features = parsed.besonderheiten.slice(0, 3).join(', ')
    if (!description.includes(features)) {
      description += ` Besonderheiten: ${features}.`
    }
  }
  
  return description.trim()
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const { imageUrl } = await request.json()
    
    if (!imageUrl) {
      return NextResponse.json(
        { error: 'Kein Bild hochgeladen' },
        { status: 400 }
      )
    }
    
    // Bild analysieren
    const analysis = await analyzeImageWithAI(imageUrl)
    
    return NextResponse.json(analysis)
  } catch (error) {
    console.error('Fehler bei der Bildanalyse:', error)
    return NextResponse.json(
      { error: 'Fehler bei der Bildanalyse' },
      { status: 500 }
    )
  }
}