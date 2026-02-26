/**
 * Unit tests for date utility functions
 * Tests date formatting, date difference calculations, and timezone handling
 */

// Import date utilities from resend module
import {
  formatCurrency,
  formatDateForEmail,
  getApartmentName,
  isValidEmail,
  getGreeting,
  getEmailSignature,
} from '../../resend'

describe('Date and Formatting Utilities', () => {
  describe('formatCurrency', () => {
    it('should format amount in EUR by default', () => {
      const result = formatCurrency(100)
      expect(result).toContain('100')
    })

    it('should format amount in specified currency', () => {
      const eurResult = formatCurrency(100, 'EUR')
      const usdResult = formatCurrency(100, 'USD')
      const gbpResult = formatCurrency(100, 'GBP')

      expect(eurResult).toContain('100')
      expect(usdResult).toContain('100')
      expect(gbpResult).toContain('100')
    })

    it('should handle decimal amounts', () => {
      const result = formatCurrency(99.99)
      expect(result).toContain('99')
    })

    it('should handle large amounts', () => {
      const result = formatCurrency(10000)
      // German locale formats as 10.000,00
      expect(result).toMatch(/10[.,]000/)
    })

    it('should handle zero amount', () => {
      const result = formatCurrency(0)
      expect(result).toContain('0')
    })

    it('should handle negative amounts', () => {
      const result = formatCurrency(-50)
      expect(result).toContain('50')
    })
  })

  describe('formatDateForEmail', () => {
    it('should format date in English', () => {
      const result = formatDateForEmail('2024-06-01', 'en')
      expect(result).toBeTruthy()
      expect(typeof result).toBe('string')
    })

    it('should format date in Serbian', () => {
      const result = formatDateForEmail('2024-06-01', 'sr')
      expect(result).toBeTruthy()
    })

    it('should format date in German', () => {
      const result = formatDateForEmail('2024-06-01', 'de')
      expect(result).toBeTruthy()
    })

    it('should format date in Italian', () => {
      const result = formatDateForEmail('2024-06-01', 'it')
      expect(result).toBeTruthy()
    })

    it('should handle Date objects', () => {
      const date = new Date('2024-06-01')
      const result = formatDateForEmail(date, 'en')
      expect(result).toBeTruthy()
    })

    it('should handle various date formats', () => {
      const dates = [
        '2024-01-01',
        '2024-12-31',
        '2024-06-15',
      ]

      dates.forEach(date => {
        const result = formatDateForEmail(date, 'en')
        expect(result).toBeTruthy()
      })
    })
  })

  describe('getApartmentName', () => {
    const apartment = {
      name: 'Standard Apartment',
      nameSr: 'Standardni Apartman',
      nameDe: 'Standard Wohnung',
      nameIt: 'Appartamento Standard',
    }

    it('should return English name for English language', () => {
      const result = getApartmentName(apartment, 'en')
      expect(result).toBe('Standard Apartment')
    })

    it('should return Serbian name for Serbian language', () => {
      const result = getApartmentName(apartment, 'sr')
      expect(result).toBe('Standardni Apartman')
    })

    it('should return German name for German language', () => {
      const result = getApartmentName(apartment, 'de')
      expect(result).toBe('Standard Wohnung')
    })

    it('should return Italian name for Italian language', () => {
      const result = getApartmentName(apartment, 'it')
      expect(result).toBe('Appartamento Standard')
    })

    it('should fallback to default name when language-specific name is missing', () => {
      const apartmentNoTranslation = {
        name: 'Test Apartment',
      }

      const result = getApartmentName(apartmentNoTranslation, 'de')
      expect(result).toBe('Test Apartment')
    })

    it('should handle apartments without translations', () => {
      const apartment = {
        name: 'Main Apartment',
      }

      const result = getApartmentName(apartment, 'sr')
      expect(result).toBe('Main Apartment')
    })
  })

  describe('isValidEmail', () => {
    it('should validate correct email addresses', () => {
      expect(isValidEmail('test@example.com')).toBe(true)
      expect(isValidEmail('user.name@domain.co.uk')).toBe(true)
      expect(isValidEmail('user+tag@example.org')).toBe(true)
    })

    it('should reject invalid email addresses', () => {
      expect(isValidEmail('invalid')).toBe(false)
      expect(isValidEmail('invalid@')).toBe(false)
      expect(isValidEmail('@domain.com')).toBe(false)
      expect(isValidEmail('user@domain')).toBe(false)
      expect(isValidEmail('user@.com')).toBe(false)
      expect(isValidEmail('')).toBe(false)
    })

    it('should handle email with subdomains', () => {
      expect(isValidEmail('user@mail.example.com')).toBe(true)
    })

    it('should handle email with hyphens and dots', () => {
      expect(isValidEmail('first.last@sub.domain.com')).toBe(true)
    })
  })

  describe('getGreeting', () => {
    it('should return English greeting', () => {
      const result = getGreeting('en', 'John')
      expect(result).toContain('John')
    })

    it('should return Serbian greeting', () => {
      const result = getGreeting('sr', 'John')
      expect(result).toBeTruthy()
    })

    it('should return German greeting', () => {
      const result = getGreeting('de', 'John')
      expect(result).toBeTruthy()
    })

    it('should return Italian greeting', () => {
      const result = getGreeting('it', 'John')
      expect(result).toBeTruthy()
    })

    it('should handle empty guest name', () => {
      const result = getGreeting('en', '')
      expect(result).toBeTruthy()
    })
  })

  describe('getEmailSignature', () => {
    it('should return English signature', () => {
      const result = getEmailSignature('en')
      expect(result).toBeTruthy()
    })

    it('should return Serbian signature', () => {
      const result = getEmailSignature('sr')
      expect(result).toBeTruthy()
    })

    it('should return German signature', () => {
      const result = getEmailSignature('de')
      expect(result).toBeTruthy()
    })

    it('should return Italian signature', () => {
      const result = getEmailSignature('it')
      expect(result).toBeTruthy()
    })

    it('should include company name in signature', () => {
      const result = getEmailSignature('en')
      expect(result.toLowerCase()).toContain('jovca')
    })
  })
})

// Additional date calculation tests
describe('Date Calculations', () => {
  // Helper function similar to calculateNights in bookings service
  const calculateNights = (checkIn: string, checkOut: string): number => {
    const checkInDate = new Date(checkIn)
    const checkOutDate = new Date(checkOut)
    const diffTime = Math.abs(checkOutDate.getTime() - checkInDate.getTime())
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  }

  describe('calculateNights', () => {
    it('should calculate correct number of nights', () => {
      expect(calculateNights('2024-06-01', '2024-06-07')).toBe(6)
      expect(calculateNights('2024-06-01', '2024-06-02')).toBe(1)
    })

    it('should handle date order independence', () => {
      expect(calculateNights('2024-06-07', '2024-06-01')).toBe(6)
    })

    it('should handle same day as 0 nights', () => {
      expect(calculateNights('2024-06-01', '2024-06-01')).toBe(0)
    })
  })

  // Helper for date difference
  const getDaysUntil = (targetDate: string): number => {
    const today = new Date()
    const target = new Date(targetDate)
    const diffTime = target.getTime() - today.getTime()
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  }

  describe('getDaysUntil', () => {
    it('should calculate positive days for future dates', () => {
      const futureDate = new Date()
      futureDate.setDate(futureDate.getDate() + 10)
      const futureStr = futureDate.toISOString().split('T')[0]
      
      const result = getDaysUntil(futureStr)
      expect(result).toBeGreaterThan(0)
    })

    it('should calculate negative days for past dates', () => {
      const pastDate = new Date()
      pastDate.setDate(pastDate.getDate() - 10)
      const pastStr = pastDate.toISOString().split('T')[0]
      
      const result = getDaysUntil(pastStr)
      expect(result).toBeLessThan(0)
    })
  })
})
