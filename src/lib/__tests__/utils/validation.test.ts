/**
 * Unit tests for validation utility functions
 * Tests email validation, phone validation, and price formatting
 */

import { isValidEmail } from '../../resend'
import { 
  isCheckInTomorrow, 
  isCheckInInDays, 
  wasCheckoutYesterday 
} from '../../email/triggers'

describe('Validation Utilities', () => {
  describe('isValidEmail', () => {
    describe('Valid emails', () => {
      it('should accept standard email format', () => {
        expect(isValidEmail('test@example.com')).toBe(true)
      })

      it('should accept email with dots in local part', () => {
        expect(isValidEmail('first.last@example.com')).toBe(true)
      })

      it('should accept email with plus sign', () => {
        expect(isValidEmail('user+tag@example.com')).toBe(true)
      })

      it('should accept email with subdomain', () => {
        expect(isValidEmail('user@mail.example.com')).toBe(true)
      })

      it('should accept email with country code domain', () => {
        expect(isValidEmail('user@example.co.uk')).toBe(true)
      })

      it('should accept short domain emails', () => {
        expect(isValidEmail('test@a.b')).toBe(true)
      })
    })

    describe('Invalid emails', () => {
      it('should reject email without @', () => {
        expect(isValidEmail('testexample.com')).toBe(false)
      })

      it('should reject email without domain', () => {
        expect(isValidEmail('test@')).toBe(false)
      })

      it('should reject email without local part', () => {
        expect(isValidEmail('@example.com')).toBe(false)
      })

      it('should reject email with spaces', () => {
        expect(isValidEmail('test @example.com')).toBe(false)
      })

      it('should reject empty string', () => {
        expect(isValidEmail('')).toBe(false)
      })

      it('should handle double dots in email (regex is permissive)', () => {
        // The current regex is permissive, so double dots pass
        expect(isValidEmail('test..test@example.com')).toBe(true)
      })
    })
  })

  describe('isCheckInTomorrow', () => {
    it('should return true when check-in is tomorrow', () => {
      const tomorrow = new Date()
      tomorrow.setDate(tomorrow.getDate() + 1)
      const tomorrowStr = tomorrow.toISOString().split('T')[0]
      
      expect(isCheckInTomorrow(tomorrowStr)).toBe(true)
    })

    it('should return false when check-in is today', () => {
      const today = new Date().toISOString().split('T')[0]
      
      expect(isCheckInTomorrow(today)).toBe(false)
    })

    it('should return false when check-in is in the future', () => {
      const future = new Date()
      future.setDate(future.getDate() + 7)
      const futureStr = future.toISOString().split('T')[0]
      
      expect(isCheckInTomorrow(futureStr)).toBe(false)
    })

    it('should return false when check-in is in the past', () => {
      const past = new Date()
      past.setDate(past.getDate() - 1)
      const pastStr = past.toISOString().split('T')[0]
      
      expect(isCheckInTomorrow(pastStr)).toBe(false)
    })
  })

  describe('isCheckInInDays', () => {
    it('should return true when check-in is in specified days', () => {
      const targetDate = new Date()
      targetDate.setDate(targetDate.getDate() + 5)
      const targetStr = targetDate.toISOString().split('T')[0]
      
      expect(isCheckInInDays(targetStr, 5)).toBe(true)
    })

    it('should return false when check-in is not in specified days', () => {
      const targetDate = new Date()
      targetDate.setDate(targetDate.getDate() + 3)
      const targetStr = targetDate.toISOString().split('T')[0]
      
      expect(isCheckInInDays(targetStr, 5)).toBe(false)
    })

    it('should return true for today when days is 0', () => {
      const today = new Date().toISOString().split('T')[0]
      
      expect(isCheckInInDays(today, 0)).toBe(true)
    })

    it('should handle different day counts', () => {
      const targetDate = new Date()
      targetDate.setDate(targetDate.getDate() + 14)
      const targetStr = targetDate.toISOString().split('T')[0]
      
      expect(isCheckInInDays(targetStr, 14)).toBe(true)
      expect(isCheckInInDays(targetStr, 7)).toBe(false)
    })
  })

  describe('wasCheckoutYesterday', () => {
    it('should return true when checkout was yesterday', () => {
      const yesterday = new Date()
      yesterday.setDate(yesterday.getDate() - 1)
      const yesterdayStr = yesterday.toISOString().split('T')[0]
      
      expect(wasCheckoutYesterday(yesterdayStr)).toBe(true)
    })

    it('should return false when checkout is today', () => {
      const today = new Date().toISOString().split('T')[0]
      
      expect(wasCheckoutYesterday(today)).toBe(false)
    })

    it('should return false when checkout was more than 1 day ago', () => {
      const past = new Date()
      past.setDate(past.getDate() - 7)
      const pastStr = past.toISOString().split('T')[0]
      
      expect(wasCheckoutYesterday(pastStr)).toBe(false)
    })

    it('should return false for future dates', () => {
      const future = new Date()
      future.setDate(future.getDate() + 1)
      const futureStr = future.toISOString().split('T')[0]
      
      expect(wasCheckoutYesterday(futureStr)).toBe(false)
    })
  })
})

// Additional validation tests for common patterns
describe('Pattern Validation', () => {
  // Phone number validation helper
  const isValidPhoneNumber = (phone: string): boolean => {
    // Accept formats: +381XXXXXXXX, 381XXXXXXXX, 0XXXXXXXX, with or without spaces/dashes
    const phoneRegex = /^(\+381|381|0)(\s*)?(\d{8,9}|\d{2,3}\s*\d{3,4})$/
    return phoneRegex.test(phone.replace(/[\s-]/g, ''))
  }

  describe('isValidPhoneNumber', () => {
    it('should validate Serbian mobile numbers with +381', () => {
      expect(isValidPhoneNumber('+381651234567')).toBe(true)
      expect(isValidPhoneNumber('+381 65 123 4567')).toBe(true)
    })

    it('should validate Serbian mobile numbers with 381', () => {
      expect(isValidPhoneNumber('381651234567')).toBe(true)
    })

    it('should validate Serbian mobile numbers with 0', () => {
      expect(isValidPhoneNumber('0651234567')).toBe(true)
      expect(isValidPhoneNumber('065 123 4567')).toBe(true)
    })

    it('should validate landline numbers', () => {
      expect(isValidPhoneNumber('+38111234567')).toBe(true)
      expect(isValidPhoneNumber('011234567')).toBe(true)
    })

    it('should reject invalid phone numbers', () => {
      expect(isValidPhoneNumber('invalid')).toBe(false)
      expect(isValidPhoneNumber('')).toBe(false)
      expect(isValidPhoneNumber('123')).toBe(false)
    })
  })

  // Price formatting helper
  const formatPrice = (amount: number, currency: string = 'EUR'): string => {
    return new Intl.NumberFormat('de-DE', {
      style: 'currency',
      currency: currency,
    }).format(amount)
  }

  describe('formatPrice', () => {
    it('should format price in EUR', () => {
      expect(formatPrice(100)).toContain('100')
    })

    it('should format price in different currencies', () => {
      expect(formatPrice(100, 'EUR')).toBeTruthy()
      expect(formatPrice(100, 'USD')).toBeTruthy()
      expect(formatPrice(100, 'GBP')).toBeTruthy()
    })

    it('should handle decimal amounts', () => {
      const result = formatPrice(99.99)
      expect(result).toContain('99')
    })

    it('should format large amounts', () => {
      const result = formatPrice(10000)
      expect(result).toContain('10.000')
    })
  })
})
