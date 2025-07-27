import { notFound } from 'next/navigation'
import { Suspense } from 'react'
import CategoryContent from './CategoryContent'

interface Props {
  params: Promise<{
    id: string
  }>
}

export default async function CategoryPage({ params }: Props) {
  const { id } = await params
  
  // Category mapping
  const categoryMap: Record<string, { name: string, description: string }> = {
    elektronik: { name: "Elektronik", description: "Kameras, Drohnen, Spielkonsolen und mehr" },
    werkzeuge: { name: "Werkzeuge", description: "Handwerkzeuge, Elektrowerkzeuge und Gartengeräte" },
    sport: { name: "Sport & Freizeit", description: "Sportgeräte, Camping-Ausrüstung und Outdoor-Equipment" },
    haushalt: { name: "Haushalt", description: "Küchengeräte, Reinigungsgeräte und Haushaltshelfer" },
    garten: { name: "Garten", description: "Gartengeräte, Grills und Gartenmöbel" },
    fahrzeuge: { name: "Fahrzeuge", description: "Fahrräder, E-Scooter und Anhänger" },
    medien: { name: "Bücher & Medien", description: "Bücher, Spiele und Unterhaltungsmedien" },
    sonstiges: { name: "Sonstiges", description: "Alles andere, was nicht in die anderen Kategorien passt" }
  }

  const category = categoryMap[id]
  if (!category) {
    notFound()
  }

  return (
    <Suspense fallback={<div>Laden...</div>}>
      <CategoryContent categoryId={id} categoryName={category.name} categoryDescription={category.description} />
    </Suspense>
  )
}