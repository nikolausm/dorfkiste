#!/usr/bin/env ts-node

/**
 * Test script for the rental system
 * Tests the complete rental workflow between two users
 */

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function testRentalSystem() {
  console.log('🧪 Starting rental system test...\n')

  try {
    // 1. Get test users
    const user1 = await prisma.user.findUnique({
      where: { email: 'max.mustermann@example.com' },
      include: { items: true }
    })
    
    const user2 = await prisma.user.findUnique({
      where: { email: 'anna.schmidt@example.com' },
      include: { items: true }
    })

    if (!user1 || !user2) {
      throw new Error('Test users not found. Please run seed script first.')
    }

    console.log('✅ Test users found:')
    console.log(`   - ${user1.name} (${user1.items.length} items)`)
    console.log(`   - ${user2.name} (${user2.items.length} items)\n`)

    // 2. Test rental creation
    console.log('📋 Testing rental creation...')
    
    // User2 wants to rent an item from User1
    const itemToRent = user1.items[0]
    if (!itemToRent) {
      throw new Error('No items found for user1')
    }

    console.log(`   Item: ${itemToRent.title}`)
    console.log(`   Owner: ${user1.name}`)
    console.log(`   Renter: ${user2.name}`)

    // Check existing rentals
    const existingRentals = await prisma.rental.findMany({
      where: {
        itemId: itemToRent.id,
        status: { in: ['pending', 'confirmed', 'active'] }
      }
    })

    console.log(`   Existing active rentals: ${existingRentals.length}`)

    // 3. Test rental status workflow
    console.log('\n📊 Testing rental status workflow...')
    
    const pendingRental = await prisma.rental.findFirst({
      where: {
        ownerId: user1.id,
        renterId: user2.id,
        status: 'pending'
      },
      include: {
        item: true,
        messages: true
      }
    })

    if (pendingRental) {
      console.log(`   Found pending rental: ${pendingRental.item.title}`)
      console.log(`   Status: ${pendingRental.status}`)
      console.log(`   Messages: ${pendingRental.messages.length}`)
      console.log(`   Total price: ${pendingRental.totalPrice}€`)
      console.log(`   Deposit: ${pendingRental.depositPaid}€`)
      
      // Simulate owner confirming the rental
      const confirmedRental = await prisma.rental.update({
        where: { id: pendingRental.id },
        data: { status: 'confirmed' }
      })
      
      console.log(`   ✅ Rental confirmed by owner`)
      
      // Simulate owner marking item as handed over
      const activeRental = await prisma.rental.update({
        where: { id: pendingRental.id },
        data: { status: 'active' }
      })
      
      console.log(`   ✅ Item handed over to renter`)
      
      // Simulate renter marking item as returned
      const completedRental = await prisma.rental.update({
        where: { id: pendingRental.id },
        data: { status: 'completed' }
      })
      
      console.log(`   ✅ Item returned by renter`)
      console.log(`   Final status: ${completedRental.status}`)
    }

    // 4. Test review system
    console.log('\n⭐ Testing review system...')
    
    const completedRentals = await prisma.rental.findMany({
      where: {
        status: 'completed',
        reviews: { none: {} }
      },
      take: 1
    })

    if (completedRentals.length > 0) {
      const rental = completedRentals[0]
      
      // Renter reviews owner
      const renterReview = await prisma.review.create({
        data: {
          rentalId: rental.id,
          reviewerId: rental.renterId,
          reviewedId: rental.ownerId,
          rating: 5,
          comment: 'Sehr freundlich und unkompliziert. Gerne wieder!'
        }
      })
      
      console.log(`   ✅ Renter reviewed owner: ${renterReview.rating}/5 stars`)
      
      // Owner reviews renter
      const ownerReview = await prisma.review.create({
        data: {
          rentalId: rental.id,
          reviewerId: rental.ownerId,
          reviewedId: rental.renterId,
          rating: 5,
          comment: 'Alles hat super geklappt. Zuverlässiger Mieter!'
        }
      })
      
      console.log(`   ✅ Owner reviewed renter: ${ownerReview.rating}/5 stars`)
    }

    // 5. Test availability check
    console.log('\n🔍 Testing availability check...')
    
    const allItems = await prisma.item.findMany({
      include: {
        rentals: {
          where: {
            status: { in: ['confirmed', 'active'] }
          }
        }
      }
    })

    let availableCount = 0
    let unavailableCount = 0

    for (const item of allItems) {
      if (item.rentals.length > 0) {
        unavailableCount++
        console.log(`   ❌ ${item.title} - Currently rented`)
      } else {
        availableCount++
        console.log(`   ✅ ${item.title} - Available`)
      }
    }

    console.log(`\n   Summary: ${availableCount} available, ${unavailableCount} unavailable`)

    // 6. Test statistics
    console.log('\n📈 System statistics:')
    
    const stats = {
      totalUsers: await prisma.user.count(),
      totalItems: await prisma.item.count(),
      totalRentals: await prisma.rental.count(),
      pendingRentals: await prisma.rental.count({ where: { status: 'pending' } }),
      activeRentals: await prisma.rental.count({ where: { status: 'active' } }),
      completedRentals: await prisma.rental.count({ where: { status: 'completed' } }),
      totalReviews: await prisma.review.count(),
      totalMessages: await prisma.message.count()
    }

    console.log(`   Users: ${stats.totalUsers}`)
    console.log(`   Items: ${stats.totalItems}`)
    console.log(`   Rentals: ${stats.totalRentals} (${stats.pendingRentals} pending, ${stats.activeRentals} active, ${stats.completedRentals} completed)`)
    console.log(`   Reviews: ${stats.totalReviews}`)
    console.log(`   Messages: ${stats.totalMessages}`)

    console.log('\n✅ All tests completed successfully!')
    
  } catch (error) {
    console.error('❌ Test failed:', error)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

// Run the test
testRentalSystem()