#!/usr/bin/env ts-node

import { chromium } from 'playwright'

async function testRentalSystemUI() {
  const browser = await chromium.launch({ headless: false })
  const context = await browser.newContext()
  const page = await context.newPage()

  try {
    console.log('🎭 Starting Playwright UI tests...\n')

    // Test 1: Homepage and Navigation
    console.log('📍 Test 1: Homepage Navigation')
    await page.goto('http://localhost:3002')
    await page.waitForLoadState('networkidle')
    console.log('   ✅ Homepage loaded')

    // Test 2: Login as Max
    console.log('\n🔐 Test 2: User Authentication')
    await page.click('text=Anmelden')
    await page.fill('input[name="email"]', 'max.mustermann@example.com')
    await page.fill('input[name="password"]', 'password123')
    await page.click('button[type="submit"]')
    await page.waitForURL('**/items')
    console.log('   ✅ Logged in as Max Mustermann')

    // Test 3: Browse items
    console.log('\n🔍 Test 3: Browse Available Items')
    await page.waitForSelector('.grid')
    const itemCount = await page.locator('.grid > div').count()
    console.log(`   Found ${itemCount} items on the page`)
    
    // Click on an item from Anna (Gartengeräte)
    await page.click('text=Rasenmäher Benzin Honda')
    await page.waitForLoadState('networkidle')
    console.log('   ✅ Opened item detail page')

    // Test 4: Create a rental request
    console.log('\n📅 Test 4: Create Rental Request')
    const tomorrow = new Date()
    tomorrow.setDate(tomorrow.getDate() + 1)
    const dayAfter = new Date()
    dayAfter.setDate(dayAfter.getDate() + 3)

    await page.fill('input[type="date"]:first-of-type', tomorrow.toISOString().split('T')[0])
    await page.fill('input[type="date"]:last-of-type', dayAfter.toISOString().split('T')[0])
    await page.click('text=Anfrage senden')
    await page.waitForURL('**/rentals/**')
    console.log('   ✅ Rental request created')

    // Test 5: Check rental details
    console.log('\n📋 Test 5: Rental Details Page')
    await page.waitForSelector('text=Buchungsdetails')
    const status = await page.textContent('.flex.items-center.gap-2 span:last-child')
    console.log(`   Rental status: ${status}`)
    
    // Send a message
    await page.fill('textarea[placeholder*="Nachricht"]', 'Hallo Anna, wann kann ich den Rasenmäher abholen?')
    await page.click('button:has-text("Senden")')
    console.log('   ✅ Message sent')

    // Test 6: My Rentals Overview
    console.log('\n📊 Test 6: My Rentals Overview')
    await page.click('text=Meine Buchungen')
    await page.waitForSelector('text=Als Mieter')
    
    // Count rentals as renter
    const renterRentals = await page.locator('.space-y-4 > div').count()
    console.log(`   Rentals as renter: ${renterRentals}`)
    
    // Switch to owner view
    await page.click('text=Als Vermieter')
    await page.waitForTimeout(1000)
    const ownerRentals = await page.locator('.space-y-4 > div').count()
    console.log(`   Rentals as owner: ${ownerRentals}`)

    // Test 7: Logout and login as Anna
    console.log('\n🔄 Test 7: Switch Users')
    await page.click('button[aria-label*="Profil"]')
    await page.click('text=Abmelden')
    await page.waitForURL('**/')
    console.log('   ✅ Logged out')

    await page.click('text=Anmelden')
    await page.fill('input[name="email"]', 'anna.schmidt@example.com')
    await page.fill('input[name="password"]', 'password123')
    await page.click('button[type="submit"]')
    await page.waitForURL('**/items')
    console.log('   ✅ Logged in as Anna Schmidt')

    // Test 8: Check incoming rental requests
    console.log('\n📥 Test 8: Manage Incoming Requests')
    await page.click('text=Meine Buchungen')
    await page.click('text=Als Vermieter')
    await page.waitForTimeout(1000)
    
    // Find pending rental
    const pendingRental = await page.locator('text=Ausstehend').first()
    if (await pendingRental.isVisible()) {
      await pendingRental.click()
      await page.waitForSelector('text=Buchungsdetails')
      
      // Confirm the rental
      await page.click('text=Bestätigen')
      await page.waitForTimeout(1000)
      console.log('   ✅ Rental confirmed by owner')
      
      // Mark as handed over
      await page.click('text=Als übergeben markieren')
      await page.waitForTimeout(1000)
      console.log('   ✅ Item marked as handed over')
    }

    // Test 9: Create item listing
    console.log('\n➕ Test 9: Create New Item Listing')
    await page.click('text=Meine Artikel')
    await page.click('text=Neuer Artikel')
    
    await page.fill('input[name="title"]', 'Elektrische Kettensäge Stihl')
    await page.selectOption('select[name="category"]', { label: 'Gartengeräte' })
    await page.fill('textarea[name="description"]', 'Profi Kettensäge für große Bäume. Schwertlänge 40cm.')
    await page.selectOption('select[name="condition"]', 'sehr gut')
    await page.fill('input[name="pricePerDay"]', '25')
    await page.fill('input[name="deposit"]', '80')
    await page.fill('input[name="location"]', 'Musterstadt, Gartenweg 5')
    
    // Upload image (placeholder)
    await page.setInputFiles('input[type="file"]', '/Users/michaelnikolaus/RiderProjects/dorfkiste/public/placeholder.svg')
    
    await page.click('button:has-text("Artikel erstellen")')
    await page.waitForURL('**/items/**')
    console.log('   ✅ New item created')

    // Test 10: Search and Filter
    console.log('\n🔎 Test 10: Search and Filter Items')
    await page.goto('http://localhost:3002/items')
    await page.fill('input[placeholder*="Suchen"]', 'Bosch')
    await page.keyboard.press('Enter')
    await page.waitForTimeout(1000)
    
    const searchResults = await page.locator('.grid > div').count()
    console.log(`   Search results for "Bosch": ${searchResults} items`)
    
    // Filter by category
    await page.click('text=Werkzeuge')
    await page.waitForTimeout(1000)
    const categoryResults = await page.locator('.grid > div').count()
    console.log(`   Items in Werkzeuge category: ${categoryResults}`)

    console.log('\n✅ All UI tests completed successfully!')

  } catch (error) {
    console.error('❌ Test failed:', error)
    await page.screenshot({ path: 'test-error.png' })
  } finally {
    await browser.close()
  }
}

// Run the test
testRentalSystemUI().catch(console.error)