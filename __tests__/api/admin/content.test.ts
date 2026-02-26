/**
 * Unit Test: Content API Section-Based Queries
 * 
 * Tests the content API's ability to handle section-based queries:
 * 1. GET with section parameter returns all keys matching 'section.*' pattern
 * 2. POST with section and data creates multiple database rows
 * 3. Backward compatibility: GET/POST with key parameter still works
 * 
 * Validates Task 3.1 requirements
 */

import { NextRequest } from 'next/server'
import { GET, POST } from '@/app/api/admin/content/route'
import { createClient } from '@supabase/supabase-js'

// Mock environment variables
process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://test.supabase.co'
process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'test-anon-key'
process.env.NEXT_SERVICE_ROLE_KEY = 'test-service-key'

// Mock Supabase client
jest.mock('@supabase/supabase-js')

describe('Content API - Section-Based Queries', () => {
  let mockSupabase: any
  const mockCreateClient = createClient as jest.MockedFunction<typeof createClient>

  // Sample content data
  const mockHomeContent = [
    { id: '1', key: 'home.hero.title', language: 'en', value: 'Welcome', updated_at: '2024-01-01' },
    { id: '2', key: 'home.hero.subtitle', language: 'en', value: 'Hello', updated_at: '2024-01-01' },
    { id: '3', key: 'home.hero.title', language: 'sr', value: 'Dobrodošli', updated_at: '2024-01-01' },
    { id: '4', key: 'home.hero.subtitle', language: 'sr', value: 'Zdravo', updated_at: '2024-01-01' }
  ]

  const mockContactContent = [
    { id: '5', key: 'contact.email', language: 'en', value: 'test@example.com', updated_at: '2024-01-01' },
    { id: '6', key: 'contact.phone', language: 'en', value: '+123456789', updated_at: '2024-01-01' }
  ]

  beforeEach(() => {
    jest.clearAllMocks()

    // Setup mock Supabase client
    mockSupabase = {
      from: jest.fn((table: string) => {
        if (table === 'content') {
          return {
            select: jest.fn().mockReturnThis(),
            like: jest.fn().mockReturnThis(),
            eq: jest.fn().mockReturnThis(),
            order: jest.fn().mockReturnThis(),
            limit: jest.fn().mockReturnThis(),
            single: jest.fn().mockReturnThis(),
            insert: jest.fn().mockReturnThis(),
            update: jest.fn().mockReturnThis(),
            then: jest.fn((callback) => callback({ data: mockHomeContent, error: null }))
          }
        }
        return {
          select: jest.fn().mockResolvedValue({ data: [], error: null })
        }
      })
    }

    mockCreateClient.mockReturnValue(mockSupabase as any)
  })

  describe('GET - Section-Based Queries', () => {
    it('should fetch all content for a section and group by language', async () => {
      // Mock the query chain
      const mockQuery = {
        data: mockHomeContent,
        error: null
      }
      
      mockSupabase.from.mockReturnValue({
        select: jest.fn().mockReturnValue({
          like: jest.fn().mockReturnValue({
            order: jest.fn().mockResolvedValue(mockQuery)
          })
        })
      })

      const url = new URL('http://localhost:3000/api/admin/content?section=home')
      const request = new NextRequest(url)

      const response = await GET(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.content).toBeDefined()
      expect(Array.isArray(data.content)).toBe(true)
      
      // Should group by language
      const enContent = data.content.find((c: any) => c.lang === 'en')
      const srContent = data.content.find((c: any) => c.lang === 'sr')
      
      expect(enContent).toBeDefined()
      expect(srContent).toBeDefined()
      
      // Should strip section prefix from keys
      expect(enContent.data['hero.title']).toBe('Welcome')
      expect(enContent.data['hero.subtitle']).toBe('Hello')
      expect(srContent.data['hero.title']).toBe('Dobrodošli')
      expect(srContent.data['hero.subtitle']).toBe('Zdravo')
    })

    it('should fetch content for a section with specific language', async () => {
      const mockQuery = {
        data: mockHomeContent.filter(c => c.language === 'en'),
        error: null
      }
      
      mockSupabase.from.mockReturnValue({
        select: jest.fn().mockReturnValue({
          like: jest.fn().mockReturnValue({
            eq: jest.fn().mockReturnValue({
              order: jest.fn().mockResolvedValue(mockQuery)
            })
          })
        })
      })

      const url = new URL('http://localhost:3000/api/admin/content?section=home&lang=en')
      const request = new NextRequest(url)

      const response = await GET(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.content).toBeDefined()
      
      // Should only have English content
      expect(data.content.length).toBe(1)
      expect(data.content[0].lang).toBe('en')
    })

    it('should maintain backward compatibility with key-based queries', async () => {
      const mockQuery = {
        data: [mockHomeContent[0]],
        error: null
      }
      
      mockSupabase.from.mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            order: jest.fn().mockResolvedValue(mockQuery)
          })
        })
      })

      const url = new URL('http://localhost:3000/api/admin/content?key=home.hero.title')
      const request = new NextRequest(url)

      const response = await GET(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.content).toBeDefined()
      expect(Array.isArray(data.content)).toBe(true)
      
      // Should return flat array format (backward compatibility)
      expect(data.content[0]).toHaveProperty('id')
      expect(data.content[0]).toHaveProperty('key')
      expect(data.content[0]).toHaveProperty('language')
      expect(data.content[0]).toHaveProperty('value')
    })
  })

  describe('POST - Section-Based Saves', () => {
    it('should save multiple fields for a section', async () => {
      const insertedRecords: any[] = []
      
      mockSupabase.from.mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            eq: jest.fn().mockReturnValue({
              limit: jest.fn().mockResolvedValue({ data: [], error: null })
            })
          })
        }),
        insert: jest.fn().mockReturnValue({
          select: jest.fn().mockReturnValue({
            single: jest.fn().mockImplementation(() => {
              const record = { id: 'new-id', key: 'test', language: 'en', value: 'test' }
              insertedRecords.push(record)
              return Promise.resolve({ data: record, error: null })
            })
          })
        })
      })

      const url = new URL('http://localhost:3000/api/admin/content')
      const request = new NextRequest(url, {
        method: 'POST',
        body: JSON.stringify({
          section: 'home',
          lang: 'en',
          data: {
            'hero.title': 'New Title',
            'hero.subtitle': 'New Subtitle'
          }
        })
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
      expect(data.results).toBeDefined()
      expect(insertedRecords.length).toBe(2)
    })

    it('should maintain backward compatibility with key-based saves', async () => {
      mockSupabase.from.mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            eq: jest.fn().mockReturnValue({
              limit: jest.fn().mockResolvedValue({ data: [], error: null })
            })
          })
        }),
        insert: jest.fn().mockReturnValue({
          select: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({
              data: { id: 'new-id', key: 'home.hero.title', language: 'en', value: 'Test' },
              error: null
            })
          })
        })
      })

      const url = new URL('http://localhost:3000/api/admin/content')
      const request = new NextRequest(url, {
        method: 'POST',
        body: JSON.stringify({
          key: 'home.hero.title',
          language: 'en',
          value: 'Test'
        })
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(201)
      expect(data).toHaveProperty('id')
      expect(data).toHaveProperty('key')
      expect(data).toHaveProperty('value')
    })

    it('should update existing content when saving section data', async () => {
      const updatedRecords: any[] = []
      
      mockSupabase.from.mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            eq: jest.fn().mockReturnValue({
              limit: jest.fn().mockResolvedValue({
                data: [{ id: 'existing-id' }],
                error: null
              })
            })
          })
        }),
        update: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            select: jest.fn().mockReturnValue({
              single: jest.fn().mockImplementation(() => {
                const record = { id: 'existing-id', key: 'test', language: 'en', value: 'updated' }
                updatedRecords.push(record)
                return Promise.resolve({ data: record, error: null })
              })
            })
          })
        })
      })

      const url = new URL('http://localhost:3000/api/admin/content')
      const request = new NextRequest(url, {
        method: 'POST',
        body: JSON.stringify({
          section: 'home',
          lang: 'en',
          data: {
            'hero.title': 'Updated Title'
          }
        })
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
      expect(updatedRecords.length).toBe(1)
    })
  })

  describe('Error Handling', () => {
    it('should handle database errors in GET', async () => {
      mockSupabase.from.mockReturnValue({
        select: jest.fn().mockReturnValue({
          like: jest.fn().mockReturnValue({
            order: jest.fn().mockResolvedValue({
              data: null,
              error: { message: 'Database error' }
            })
          })
        })
      })

      const url = new URL('http://localhost:3000/api/admin/content?section=home')
      const request = new NextRequest(url)

      const response = await GET(request)
      const data = await response.json()

      expect(response.status).toBe(500)
      expect(data.error).toBe('Failed to fetch content')
    })

    it('should handle database errors in POST', async () => {
      mockSupabase.from.mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            eq: jest.fn().mockReturnValue({
              limit: jest.fn().mockResolvedValue({
                data: null,
                error: { message: 'Database error' }
              })
            })
          })
        })
      })

      const url = new URL('http://localhost:3000/api/admin/content')
      const request = new NextRequest(url, {
        method: 'POST',
        body: JSON.stringify({
          section: 'home',
          lang: 'en',
          data: { 'hero.title': 'Test' }
        })
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(500)
      expect(data.error).toBe('Failed to save content')
    })
  })
})
