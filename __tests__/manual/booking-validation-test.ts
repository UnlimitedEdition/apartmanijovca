/**
 * Manual test for booking validation fixes
 * 
 * Tests:
 * 1. Phone validation accepts empty string
 * 2. Phone validation accepts valid phone numbers
 * 3. Phone validation rejects short phone numbers
 */

import { CreateBookingSchema } from '../../src/lib/validations/booking'

console.log('Testing booking validation fixes...\n')

// Test 1: Empty phone should be accepted
const testData1 = {
  apartmentId: '123e4567-e89b-12d3-a456-426614174000',
  checkIn: '2026-02-25',
  checkOut: '2026-02-27',
  guest: {
    name: 'Test User',
    email: 'test@example.com',
    phone: '' // Empty phone
  },
  options: {
    crib: false,
    parking: false,
    earlyCheckIn: false,
    notes: ''
  }
}

console.log('Test 1: Empty phone string')
const result1 = CreateBookingSchema.safeParse(testData1)
if (result1.success) {
  console.log('✅ PASS: Empty phone accepted')
  console.log('   Phone value:', result1.data.guest.phone)
} else {
  console.log('❌ FAIL: Empty phone rejected')
  console.log('   Errors:', result1.error.flatten().fieldErrors)
}

// Test 2: Valid phone should be accepted
const testData2 = {
  ...testData1,
  guest: {
    ...testData1.guest,
    phone: '+381641234567'
  }
}

console.log('\nTest 2: Valid phone number')
const result2 = CreateBookingSchema.safeParse(testData2)
if (result2.success) {
  console.log('✅ PASS: Valid phone accepted')
  console.log('   Phone value:', result2.data.guest.phone)
} else {
  console.log('❌ FAIL: Valid phone rejected')
  console.log('   Errors:', result2.error.flatten().fieldErrors)
}

// Test 3: Short phone should be rejected
const testData3 = {
  ...testData1,
  guest: {
    ...testData1.guest,
    phone: '12345' // Too short
  }
}

console.log('\nTest 3: Short phone number (should fail)')
const result3 = CreateBookingSchema.safeParse(testData3)
if (!result3.success) {
  console.log('✅ PASS: Short phone rejected as expected')
  console.log('   Error:', (result3.error.flatten().fieldErrors as any).phone)
} else {
  console.log('❌ FAIL: Short phone accepted (should be rejected)')
}

// Test 4: Undefined phone should be accepted
const testData4 = {
  apartmentId: '123e4567-e89b-12d3-a456-426614174000',
  checkIn: '2026-02-25',
  checkOut: '2026-02-27',
  guest: {
    name: 'Test User',
    email: 'test@example.com',
    phone: undefined
  },
  options: {
    crib: false,
    parking: false,
    earlyCheckIn: false,
    notes: ''
  }
}

console.log('\nTest 4: Undefined phone (optional field)')
const result4 = CreateBookingSchema.safeParse(testData4)
if (result4.success) {
  console.log('✅ PASS: Undefined phone accepted')
  console.log('   Phone value:', (result4.data as any).guest?.phone)
} else {
  console.log('❌ FAIL: Undefined phone rejected')
  console.log('   Errors:', result4.error.flatten().fieldErrors)
}

console.log('\n--- Test Summary ---')
const passed = [result1.success, result2.success, !result3.success, result4.success].filter(Boolean).length
console.log(`Passed: ${passed}/4 tests`)
