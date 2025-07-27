#!/usr/bin/env ts-node

import { PrismaClient } from '@prisma/client'
import { format, subDays } from 'date-fns'
import { de } from 'date-fns/locale'

const prisma = new PrismaClient()

async function analyzeRentalData() {
  console.log('📊 Rental System Data Analysis\n')

  try {
    // 1. User Statistics
    console.log('👥 USER STATISTICS')
    console.log('==================')
    
    const users = await prisma.user.findMany({
      include: {
        items: true,
        rentalsAsOwner: true,
        rentalsAsRenter: true,
        reviewsGiven: true,
        reviewsReceived: true
      }
    })

    for (const user of users) {
      console.log(`\n${user.name} (${user.email})`)
      console.log(`  📅 Mitglied seit: ${format(user.createdAt, 'dd.MM.yyyy', { locale: de })}`)
      console.log(`  📦 Eigene Artikel: ${user.items.length}`)
      console.log(`  🔄 Ausleihen als Mieter: ${user.rentalsAsRenter.length}`)
      console.log(`  🏠 Vermietungen: ${user.rentalsAsOwner.length}`)
      console.log(`  ⭐ Bewertungen abgegeben: ${user.reviewsGiven.length}`)
      console.log(`  ⭐ Bewertungen erhalten: ${user.reviewsReceived.length}`)
      
      // Calculate average rating
      if (user.reviewsReceived.length > 0) {
        const avgRating = user.reviewsReceived.reduce((sum, r) => sum + r.rating, 0) / user.reviewsReceived.length
        console.log(`  🌟 Durchschnittsbewertung: ${avgRating.toFixed(1)}/5`)
      }
    }

    // 2. Rental Statistics
    console.log('\n\n📈 RENTAL STATISTICS')
    console.log('====================')
    
    const rentalStats = await prisma.rental.groupBy({
      by: ['status'],
      _count: true
    })

    console.log('\nStatus-Verteilung:')
    for (const stat of rentalStats) {
      console.log(`  ${stat.status}: ${stat._count} Ausleihen`)
    }

    // 3. Most Popular Items
    console.log('\n\n🏆 MOST POPULAR ITEMS')
    console.log('=====================')
    
    const popularItems = await prisma.item.findMany({
      include: {
        rentals: true,
        category: true
      },
      orderBy: {
        rentals: {
          _count: 'desc'
        }
      },
      take: 10
    })

    console.log('\nTop 10 meistgeliehene Artikel:')
    for (let i = 0; i < popularItems.length; i++) {
      const item = popularItems[i]
      console.log(`  ${i + 1}. ${item.title} (${item.category.name})`)
      console.log(`     Ausgeliehen: ${item.rentals.length}x | Preis: ${item.pricePerDay}€/Tag`)
    }

    // 4. Category Analysis
    console.log('\n\n📂 CATEGORY ANALYSIS')
    console.log('====================')
    
    const categories = await prisma.category.findMany({
      include: {
        items: {
          include: {
            rentals: true
          }
        }
      }
    })

    for (const category of categories) {
      const totalRentals = category.items.reduce((sum, item) => sum + item.rentals.length, 0)
      console.log(`\n${category.icon} ${category.name}:`)
      console.log(`  Artikel: ${category.items.length}`)
      console.log(`  Gesamtausleihen: ${totalRentals}`)
      if (category.items.length > 0) {
        console.log(`  Durchschnitt pro Artikel: ${(totalRentals / category.items.length).toFixed(1)}`)
      }
    }

    // 5. Revenue Analysis
    console.log('\n\n💰 REVENUE ANALYSIS')
    console.log('===================')
    
    const completedRentals = await prisma.rental.findMany({
      where: { status: 'completed' },
      include: {
        owner: true,
        item: true
      }
    })

    const revenueByUser = new Map<string, number>()
    let totalRevenue = 0

    for (const rental of completedRentals) {
      const currentRevenue = revenueByUser.get(rental.owner.id) || 0
      revenueByUser.set(rental.owner.id, currentRevenue + rental.totalPrice)
      totalRevenue += rental.totalPrice
    }

    console.log(`\nGesamtumsatz (abgeschlossene Ausleihen): ${totalRevenue}€`)
    console.log('\nUmsatz pro Vermieter:')
    revenueByUser.forEach((revenue, userId) => {
      const user = users.find(u => u.id === userId)
      console.log(`  ${user?.name}: ${revenue}€`)
    })

    // 6. Time-based Analysis
    console.log('\n\n📅 TIME-BASED ANALYSIS')
    console.log('======================')
    
    const last30Days = await prisma.rental.count({
      where: {
        createdAt: {
          gte: subDays(new Date(), 30)
        }
      }
    })

    const last60Days = await prisma.rental.count({
      where: {
        createdAt: {
          gte: subDays(new Date(), 60)
        }
      }
    })

    console.log(`\nAusleihen letzte 30 Tage: ${last30Days}`)
    console.log(`Ausleihen letzte 60 Tage: ${last60Days}`)

    // 7. Communication Analysis
    console.log('\n\n💬 COMMUNICATION ANALYSIS')
    console.log('========================')
    
    const totalMessages = await prisma.message.count()
    const unreadMessages = await prisma.message.count({
      where: { read: false }
    })

    console.log(`\nGesamtnachrichten: ${totalMessages}`)
    console.log(`Ungelesene Nachrichten: ${unreadMessages}`)

    const avgMessagesPerRental = totalMessages / (await prisma.rental.count())
    console.log(`Durchschnitt pro Ausleihe: ${avgMessagesPerRental.toFixed(1)} Nachrichten`)

    // 8. Item Availability
    console.log('\n\n🔍 ITEM AVAILABILITY')
    console.log('====================')
    
    const totalItems = await prisma.item.count()
    const currentlyRented = await prisma.item.count({
      where: {
        rentals: {
          some: {
            status: {
              in: ['active', 'confirmed']
            }
          }
        }
      }
    })

    console.log(`\nGesamtartikel: ${totalItems}`)
    console.log(`Aktuell verliehen: ${currentlyRented}`)
    console.log(`Verfügbar: ${totalItems - currentlyRented}`)
    console.log(`Auslastung: ${((currentlyRented / totalItems) * 100).toFixed(1)}%`)

    // 9. Review Analysis
    console.log('\n\n⭐ REVIEW ANALYSIS')
    console.log('==================')
    
    const reviews = await prisma.review.findMany({
      include: {
        reviewer: true,
        reviewed: true
      }
    })

    const ratingDistribution = [0, 0, 0, 0, 0]
    for (const review of reviews) {
      ratingDistribution[review.rating - 1]++
    }

    console.log('\nBewertungsverteilung:')
    for (let i = 4; i >= 0; i--) {
      const stars = '⭐'.repeat(i + 1)
      const percentage = reviews.length > 0 ? (ratingDistribution[i] / reviews.length * 100).toFixed(1) : '0'
      console.log(`  ${stars}: ${ratingDistribution[i]} (${percentage}%)`)
    }

    const avgRating = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
    console.log(`\nDurchschnittliche Bewertung: ${avgRating.toFixed(2)}/5`)

    console.log('\n✅ Analysis completed!')

  } catch (error) {
    console.error('❌ Analysis failed:', error)
  } finally {
    await prisma.$disconnect()
  }
}

// Run the analysis
analyzeRentalData()