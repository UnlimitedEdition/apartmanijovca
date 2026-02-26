/**
 * Unit tests for bookings/service.ts
 * Tests price calculation, date validation, and booking number generation
 */

import {
  calculateTotalPrice,
  calculateNights,
  generateBookingNumber,
  isValidStatusTransition,
} from '../../bookings/service'

describe('Bookings Service', () => {
  describe('calculateTotalPrice', () => {
    const pricePerNight = 100

    it('should calculate base price for standard booking', () => {
      const total = calculateTotalPrice(pricePerNight, '2024-06-01', '2024-06-07')
      // 6 nights * 100 = 600
      expect(total).toBe(600)
    })

    it('should calculate price for single night', () => {
      const total = calculateTotalPrice(pricePerNight, '2024-06-01', '2024-06-02')
      expect(total).toBe(100)
    })

    it('should add crib cost when crib option is selected', () => {
      const total = calculateTotalPrice(pricePerNight, '2024-06-01', '2024-06-07', {
        crib: true,
        parking: false,
        earlyCheckIn: false,
        lateCheckOut: false,
      })
      // 6 nights * 100 + 6 nights * 10 (CRIB_PER_NIGHT) = 600 + 60 = 660
      expect(total).toBe(660)
    })

    it('should add parking cost when parking option is selected', () => {
      const total = calculateTotalPrice(pricePerNight, '2024-06-01', '2024-06-07', {
        crib: false,
        parking: true,
        earlyCheckIn: false,
        lateCheckOut: false,
      })
      // 6 nights * 100 + 6 nights * 5 (PARKING_PER_NIGHT) = 600 + 30 = 630
      expect(total).toBe(630)
    })

    it('should add early check-in fee when early check-in is selected', () => {
      const total = calculateTotalPrice(pricePerNight, '2024-06-01', '2024-06-07', {
        crib: false,
        parking: false,
        earlyCheckIn: true,
        lateCheckOut: false,
      })
      // 6 nights * 100 + 20 (EARLY_CHECK_IN) = 600 + 20 = 620
      expect(total).toBe(620)
    })

    it('should add late check-out fee when late check-out is selected', () => {
      const total = calculateTotalPrice(pricePerNight, '2024-06-01', '2024-06-07', {
        crib: false,
        parking: false,
        earlyCheckIn: false,
        lateCheckOut: true,
      })
      // 6 nights * 100 + 15 (LATE_CHECK_OUT) = 600 + 15 = 615
      expect(total).toBe(615)
    })

    it('should calculate total with all options selected', () => {
      const total = calculateTotalPrice(pricePerNight, '2024-06-01', '2024-06-07', {
        crib: true,
        parking: true,
        earlyCheckIn: true,
        lateCheckOut: true,
      })
      // Base: 600
      // Crib: 60
      // Parking: 30
      // Early check-in: 20
      // Late check-out: 15
      // Total: 725
      expect(total).toBe(725)
    })

    it('should handle zero nights (same day check-in/out) edge case', () => {
      const total = calculateTotalPrice(pricePerNight, '2024-06-01', '2024-06-01')
      expect(total).toBe(0) // 0 nights * price
    })

    it('should handle long-term bookings', () => {
      const total = calculateTotalPrice(pricePerNight, '2024-01-01', '2024-02-01')
      // 31 nights * 100 = 3100
      expect(total).toBe(3100)
    })
  })

  describe('calculateNights', () => {
    it('should calculate correct number of nights', () => {
      expect(calculateNights('2024-06-01', '2024-06-07')).toBe(6)
      expect(calculateNights('2024-06-01', '2024-06-02')).toBe(1)
      expect(calculateNights('2024-06-01', '2024-06-15')).toBe(14)
    })

    it('should calculate nights regardless of date order', () => {
      expect(calculateNights('2024-06-07', '2024-06-01')).toBe(6)
    })

    it('should handle same day check-in/out as 0 nights', () => {
      expect(calculateNights('2024-06-01', '2024-06-01')).toBe(0)
    })

    it('should handle leap year dates', () => {
      expect(calculateNights('2024-02-28', '2024-03-01')).toBe(2) // Includes Feb 29
    })

    it('should handle month boundaries', () => {
      expect(calculateNights('2024-01-31', '2024-02-01')).toBe(1)
    })

    it('should handle year boundaries', () => {
      expect(calculateNights('2024-12-31', '2025-01-01')).toBe(1)
    })
  })

  describe('generateBookingNumber', () => {
    it('should generate a valid booking number format', () => {
      const bookingNumber = generateBookingNumber()
      
      // Format should be: BJ-YYYY-XXXX
      const regex = /^BJ-\d{4}-[A-Z0-9]{4}$/
      expect(bookingNumber).toMatch(regex)
    })

    it('should generate unique booking numbers', () => {
      const numbers = new Set()
      for (let i = 0; i < 100; i++) {
        numbers.add(generateBookingNumber())
      }
      // All numbers should be unique (very high probability)
      expect(numbers.size).toBe(100)
    })

    it('should include current year in booking number', () => {
      const bookingNumber = generateBookingNumber()
      const currentYear = new Date().getFullYear().toString()
      expect(bookingNumber).toContain(currentYear)
    })

    it('should start with BJ- prefix', () => {
      const bookingNumber = generateBookingNumber()
      expect(bookingNumber.startsWith('BJ-')).toBe(true)
    })
  })

  describe('isValidStatusTransition', () => {
    it('should allow pending to confirmed transition', () => {
      expect(isValidStatusTransition('pending', 'confirmed')).toBe(true)
    })

    it('should allow pending to cancelled transition', () => {
      expect(isValidStatusTransition('pending', 'cancelled')).toBe(true)
    })

    it('should allow confirmed to checked_in transition', () => {
      expect(isValidStatusTransition('confirmed', 'checked_in')).toBe(true)
    })

    it('should allow confirmed to cancelled transition', () => {
      expect(isValidStatusTransition('confirmed', 'cancelled')).toBe(true)
    })

    it('should allow checked_in to checked_out transition', () => {
      expect(isValidStatusTransition('checked_in', 'checked_out')).toBe(true)
    })

    it('should allow checked_in to no_show transition', () => {
      expect(isValidStatusTransition('checked_in', 'no_show')).toBe(true)
    })

    it('should NOT allow reverse transitions', () => {
      expect(isValidStatusTransition('confirmed', 'pending')).toBe(false)
      expect(isValidStatusTransition('checked_in', 'confirmed')).toBe(false)
      expect(isValidStatusTransition('checked_out', 'checked_in')).toBe(false)
    })

    it('should NOT allow transitions from terminal states', () => {
      expect(isValidStatusTransition('checked_out', 'confirmed')).toBe(false)
      expect(isValidStatusTransition('cancelled', 'pending')).toBe(false)
      expect(isValidStatusTransition('no_show', 'pending')).toBe(false)
    })

    it('should NOT allow invalid transitions', () => {
      expect(isValidStatusTransition('pending', 'checked_in')).toBe(false)
      expect(isValidStatusTransition('pending', 'no_show')).toBe(false)
      expect(isValidStatusTransition('confirmed', 'checked_out')).toBe(false)
    })

    it('should return false for unknown current status', () => {
      expect(isValidStatusTransition('unknown_status', 'confirmed')).toBe(false)
    })

    it('should return false for unknown new status', () => {
      expect(isValidStatusTransition('pending', 'unknown_status')).toBe(false)
    })
  })
})
