/**
 * Content validation utilities for admin content management
 * Provides client-side and server-side validation functions
 */

export interface ValidationResult {
  valid: boolean
  errors: string[]
}

/**
 * Validates that content data has the correct structure
 * - Must be an object
 * - All values must be strings
 */
export function validateContentStructure(data: unknown): ValidationResult {
  const errors: string[] = []
  
  // Check that data is an object
  if (typeof data !== 'object' || data === null || Array.isArray(data)) {
    errors.push('Content data must be an object')
    return { valid: false, errors }
  }
  
  // Check that all values are strings
  for (const [key, value] of Object.entries(data)) {
    if (typeof value !== 'string') {
      errors.push(`Field "${key}" must be a string, got ${typeof value}`)
    }
  }
  
  return {
    valid: errors.length === 0,
    errors
  }
}

/**
 * Returns the list of required fields for a given section
 */
export function getRequiredFieldsForSection(section: string): string[] {
  const requiredFieldsMap: Record<string, string[]> = {
    home: ['title', 'hero.title', 'hero.subtitle'],
    apartments: ['title', 'description'],
    attractions: ['title', 'description'],
    location: ['title', 'description'],
    prices: ['title', 'description'],
    contact: ['title', 'description'],
    gallery: ['title', 'description'],
    footer: ['rights']
  }
  
  return requiredFieldsMap[section] || []
}

/**
 * Validates that all required fields for a section have non-empty content
 * Used before publishing content
 */
export function validateRequiredFields(
  section: string,
  data: Record<string, string>
): ValidationResult {
  const errors: string[] = []
  const requiredFields = getRequiredFieldsForSection(section)
  
  for (const field of requiredFields) {
    const value = data[field]
    if (!value || value.trim() === '') {
      errors.push(`Field "${field}" is required for publishing`)
    }
  }
  
  return {
    valid: errors.length === 0,
    errors
  }
}

/**
 * Server-side input validation for API requests
 * Validates section, language, and data parameters
 */
export function validateApiInput(body: unknown): ValidationResult {
  const errors: string[] = []
  
  // Type guard to check if body is an object
  if (typeof body !== 'object' || body === null) {
    errors.push('Request body must be an object')
    return { valid: false, errors }
  }
  
  const requestBody = body as Record<string, unknown>
  
  // Check required fields
  if (!requestBody.section || typeof requestBody.section !== 'string') {
    errors.push('Section is required and must be a string')
  }
  
  if (!requestBody.lang || typeof requestBody.lang !== 'string') {
    errors.push('Language is required and must be a string')
  }
  
  if (!requestBody.data || typeof requestBody.data !== 'object' || requestBody.data === null) {
    errors.push('Data is required and must be an object')
  }
  
  // Validate language code
  const validLanguages = ['sr', 'en', 'de', 'it']
  if (requestBody.lang && typeof requestBody.lang === 'string' && !validLanguages.includes(requestBody.lang)) {
    errors.push(`Language must be one of: ${validLanguages.join(', ')}`)
  }
  
  // Validate section
  const validSections = ['home', 'apartments', 'attractions', 'location', 'prices', 'contact', 'gallery', 'footer']
  if (requestBody.section && typeof requestBody.section === 'string' && !validSections.includes(requestBody.section)) {
    errors.push(`Section must be one of: ${validSections.join(', ')}`)
  }
  
  return {
    valid: errors.length === 0,
    errors
  }
}

/**
 * Sanitizes content by:
 * - Trimming whitespace
 * - Normalizing line breaks to \n
 * - Removing null bytes
 * - Limiting length to 10,000 characters
 */
export function sanitizeContent(value: string): string {
  // Trim whitespace
  let sanitized = value.trim()
  
  // Normalize line breaks (convert \r\n to \n)
  sanitized = sanitized.replace(/\r\n/g, '\n')
  
  // Remove null bytes
  sanitized = sanitized.replace(/\0/g, '')
  
  // Limit length to 10,000 characters
  if (sanitized.length > 10000) {
    sanitized = sanitized.substring(0, 10000)
  }
  
  return sanitized
}
