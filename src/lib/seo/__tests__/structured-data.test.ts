/**
 * Unit Tests for Structured Data Base Module
 * 
 * Tests validation, embedding, and helper functions for Schema.org structured data.
 */

import {
  validateSchema,
  embedJsonLd,
  createJsonLdScript,
  validateSchemas,
  mergeSchemas,
} from '../structured-data'

describe('validateSchema', () => {
  describe('valid schemas', () => {
    it('should validate a simple valid schema', () => {
      const schema = {
        '@context': 'https://schema.org',
        '@type': 'Organization',
        name: 'Apartmani Jovča',
      }
      expect(validateSchema(schema)).toBe(true)
    })

    it('should validate schema with multiple types', () => {
      const schema = {
        '@context': 'https://schema.org',
        '@type': ['Organization', 'LocalBusiness'],
        name: 'Apartmani Jovča',
      }
      expect(validateSchema(schema)).toBe(true)
    })

    it('should validate schema with @id', () => {
      const schema = {
        '@context': 'https://schema.org',
        '@type': 'Organization',
        '@id': 'https://example.com/#organization',
        name: 'Apartmani Jovča',
      }
      expect(validateSchema(schema)).toBe(true)
    })

    it('should validate schema with nested objects', () => {
      const schema = {
        '@context': 'https://schema.org',
        '@type': 'LocalBusiness',
        name: 'Apartmani Jovča',
        address: {
          '@type': 'PostalAddress',
          streetAddress: 'Jovča bb',
          addressLocality: 'Aleksinac',
        },
      }
      expect(validateSchema(schema)).toBe(true)
    })

    it('should validate schema with array of nested objects', () => {
      const schema = {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: [
          {
            '@type': 'ListItem',
            position: 1,
            name: 'Home',
          },
          {
            '@type': 'ListItem',
            position: 2,
            name: 'Apartments',
          },
        ],
      }
      expect(validateSchema(schema)).toBe(true)
    })

    it('should validate complex LocalBusiness schema', () => {
      const schema = {
        '@context': 'https://schema.org',
        '@type': 'LocalBusiness',
        '@id': 'https://example.com/#business',
        name: 'Apartmani Jovča',
        image: ['https://example.com/image1.jpg', 'https://example.com/image2.jpg'],
        telephone: '+381 65 237 8080',
        address: {
          '@type': 'PostalAddress',
          streetAddress: 'Jovča bb',
          addressLocality: 'Aleksinac',
          addressCountry: 'RS',
        },
        geo: {
          '@type': 'GeoCoordinates',
          latitude: 43.5333,
          longitude: 21.7000,
        },
      }
      expect(validateSchema(schema)).toBe(true)
    })

    it('should validate array of schemas', () => {
      const schemas = [
        {
          '@context': 'https://schema.org',
          '@type': 'Organization',
          name: 'Acme',
        },
        {
          '@context': 'https://schema.org',
          '@type': 'LocalBusiness',
          name: 'Store',
        },
      ]
      expect(validateSchema(schemas)).toBe(true)
    })
  })

  describe('invalid schemas', () => {
    it('should reject null', () => {
      expect(validateSchema(null as unknown as object)).toBe(false)
    })

    it('should reject undefined', () => {
      expect(validateSchema(undefined as unknown as object)).toBe(false)
    })

    it('should reject non-object types', () => {
      expect(validateSchema('string' as unknown as object)).toBe(false)
      expect(validateSchema(123 as unknown as object)).toBe(false)
      expect(validateSchema(true as unknown as object)).toBe(false)
    })

    it('should reject schema without @context', () => {
      const schema = {
        '@type': 'Organization',
        name: 'Apartmani Jovča',
      }
      expect(validateSchema(schema)).toBe(false)
    })

    it('should reject schema without @type', () => {
      const schema = {
        '@context': 'https://schema.org',
        name: 'Apartmani Jovča',
      }
      expect(validateSchema(schema)).toBe(false)
    })

    it('should reject schema with invalid @context type', () => {
      const schema = {
        '@context': 123,
        '@type': 'Organization',
        name: 'Apartmani Jovča',
      }
      expect(validateSchema(schema)).toBe(false)
    })

    it('should reject schema with invalid @type type', () => {
      const schema = {
        '@context': 'https://schema.org',
        '@type': 123,
        name: 'Apartmani Jovča',
      }
      expect(validateSchema(schema)).toBe(false)
    })

    it('should reject schema with invalid nested object', () => {
      const schema = {
        '@context': 'https://schema.org',
        '@type': 'LocalBusiness',
        name: 'Apartmani Jovča',
        address: {
          '@type': 123, // Invalid type
          streetAddress: 'Jovča bb',
        },
      }
      expect(validateSchema(schema)).toBe(false)
    })

    it('should reject array with invalid schema', () => {
      const schemas = [
        {
          '@context': 'https://schema.org',
          '@type': 'Organization',
          name: 'Acme',
        },
        {
          '@type': 'LocalBusiness', // Missing @context
          name: 'Store',
        },
      ]
      expect(validateSchema(schemas)).toBe(false)
    })

    it('should reject schema with invalid @context array', () => {
      const schema = {
        '@context': ['https://schema.org', 123], // Mixed types
        '@type': 'Organization',
        name: 'Acme',
      }
      expect(validateSchema(schema)).toBe(false)
    })

    it('should reject schema with invalid @type array', () => {
      const schema = {
        '@context': 'https://schema.org',
        '@type': ['Organization', 123], // Mixed types
        name: 'Acme',
      }
      expect(validateSchema(schema)).toBe(false)
    })
  })
})

describe('embedJsonLd', () => {
  it('should embed valid schema in script tag', () => {
    const schema = {
      '@context': 'https://schema.org',
      '@type': 'Organization',
      name: 'Apartmani Jovča',
    }
    const result = embedJsonLd(schema)
    expect(result).toContain('<script type="application/ld+json">')
    expect(result).toContain('</script>')
    expect(result).toContain('"@context":"https://schema.org"')
    expect(result).toContain('"@type":"Organization"')
    expect(result).toContain('"name":"Apartmani Jovča"')
  })

  it('should embed complex schema correctly', () => {
    const schema = {
      '@context': 'https://schema.org',
      '@type': 'LocalBusiness',
      name: 'Apartmani Jovča',
      address: {
        '@type': 'PostalAddress',
        streetAddress: 'Jovča bb',
      },
    }
    const result = embedJsonLd(schema)
    expect(result).toContain('<script type="application/ld+json">')
    expect(result).toContain('"address"')
    expect(result).toContain('"PostalAddress"')
  })

  it('should throw error for invalid schema', () => {
    const invalidSchema = {
      '@type': 'Organization', // Missing @context
      name: 'Apartmani Jovča',
    }
    expect(() => embedJsonLd(invalidSchema)).toThrow('Invalid schema')
  })

  it('should handle special characters in content', () => {
    const schema = {
      '@context': 'https://schema.org',
      '@type': 'Organization',
      name: 'Apartmani "Jovča" & More',
    }
    const result = embedJsonLd(schema)
    expect(result).toContain('<script type="application/ld+json">')
    // JSON.stringify should escape quotes
    expect(result).toContain('\\"Jovča\\"')
  })

  it('should produce valid JSON in script tag', () => {
    const schema = {
      '@context': 'https://schema.org',
      '@type': 'Organization',
      name: 'Apartmani Jovča',
      url: 'https://example.com',
    }
    const result = embedJsonLd(schema)
    
    // Extract JSON from script tag
    const jsonMatch = result.match(/<script type="application\/ld\+json">(.*?)<\/script>/)
    expect(jsonMatch).not.toBeNull()
    
    if (jsonMatch) {
      const jsonContent = jsonMatch[1]
      // Should be valid JSON
      expect(() => JSON.parse(jsonContent)).not.toThrow()
      const parsed = JSON.parse(jsonContent)
      expect(parsed['@context']).toBe('https://schema.org')
      expect(parsed['@type']).toBe('Organization')
    }
  })
})

describe('createJsonLdScript', () => {
  it('should create React-compatible script object', () => {
    const schema = {
      '@context': 'https://schema.org',
      '@type': 'Organization',
      name: 'Apartmani Jovča',
    }
    const result = createJsonLdScript(schema)
    expect(result).toHaveProperty('__html')
    expect(typeof result.__html).toBe('string')
  })

  it('should contain valid JSON in __html property', () => {
    const schema = {
      '@context': 'https://schema.org',
      '@type': 'Organization',
      name: 'Apartmani Jovča',
    }
    const result = createJsonLdScript(schema)
    
    // Should be valid JSON
    expect(() => JSON.parse(result.__html)).not.toThrow()
    const parsed = JSON.parse(result.__html)
    expect(parsed['@context']).toBe('https://schema.org')
    expect(parsed['@type']).toBe('Organization')
    expect(parsed.name).toBe('Apartmani Jovča')
  })

  it('should throw error for invalid schema', () => {
    const invalidSchema = {
      '@type': 'Organization', // Missing @context
      name: 'Apartmani Jovča',
    }
    expect(() => createJsonLdScript(invalidSchema)).toThrow('Invalid schema')
  })

  it('should handle complex nested structures', () => {
    const schema = {
      '@context': 'https://schema.org',
      '@type': 'LocalBusiness',
      name: 'Apartmani Jovča',
      address: {
        '@type': 'PostalAddress',
        streetAddress: 'Jovča bb',
      },
      geo: {
        '@type': 'GeoCoordinates',
        latitude: 43.5333,
        longitude: 21.7000,
      },
    }
    const result = createJsonLdScript(schema)
    const parsed = JSON.parse(result.__html)
    expect(parsed.address['@type']).toBe('PostalAddress')
    expect(parsed.geo.latitude).toBe(43.5333)
  })
})

describe('validateSchemas', () => {
  it('should validate array of valid schemas', () => {
    const schemas = [
      {
        '@context': 'https://schema.org',
        '@type': 'Organization',
        name: 'Acme',
      },
      {
        '@context': 'https://schema.org',
        '@type': 'LocalBusiness',
        name: 'Store',
      },
    ]
    expect(validateSchemas(schemas)).toBe(true)
  })

  it('should reject array with invalid schema', () => {
    const schemas = [
      {
        '@context': 'https://schema.org',
        '@type': 'Organization',
        name: 'Acme',
      },
      {
        '@type': 'LocalBusiness', // Missing @context
        name: 'Store',
      },
    ]
    expect(validateSchemas(schemas)).toBe(false)
  })

  it('should reject non-array input', () => {
    expect(validateSchemas('not an array' as unknown as object[])).toBe(false)
    expect(validateSchemas({} as unknown as object[])).toBe(false)
  })

  it('should validate empty array', () => {
    expect(validateSchemas([])).toBe(true)
  })

  it('should validate single schema in array', () => {
    const schemas = [
      {
        '@context': 'https://schema.org',
        '@type': 'Organization',
        name: 'Acme',
      },
    ]
    expect(validateSchemas(schemas)).toBe(true)
  })
})

describe('mergeSchemas', () => {
  it('should merge multiple schemas into graph', () => {
    const schemas = [
      {
        '@context': 'https://schema.org',
        '@type': 'Organization',
        name: 'Acme',
      },
      {
        '@context': 'https://schema.org',
        '@type': 'WebSite',
        name: 'Acme Site',
      },
    ]
    const result = mergeSchemas(schemas) as Record<string, unknown>
    
    expect(result['@context']).toBe('https://schema.org')
    expect(result['@graph']).toBeDefined()
    expect(Array.isArray(result['@graph'])).toBe(true)
    
    const graph = result['@graph'] as Array<Record<string, unknown>>
    expect(graph).toHaveLength(2)
    expect(graph[0]['@type']).toBe('Organization')
    expect(graph[1]['@type']).toBe('WebSite')
  })

  it('should remove @context from individual schemas in graph', () => {
    const schemas = [
      {
        '@context': 'https://schema.org',
        '@type': 'Organization',
        name: 'Acme',
      },
      {
        '@context': 'https://schema.org',
        '@type': 'WebSite',
        name: 'Acme Site',
      },
    ]
    const result = mergeSchemas(schemas) as Record<string, unknown>
    const graph = result['@graph'] as Array<Record<string, unknown>>
    
    // Individual items should not have @context
    expect(graph[0]['@context']).toBeUndefined()
    expect(graph[1]['@context']).toBeUndefined()
  })

  it('should throw error for invalid schemas', () => {
    const schemas = [
      {
        '@context': 'https://schema.org',
        '@type': 'Organization',
        name: 'Acme',
      },
      {
        '@type': 'WebSite', // Missing @context
        name: 'Acme Site',
      },
    ]
    expect(() => mergeSchemas(schemas)).toThrow('Invalid schemas')
  })

  it('should throw error for empty array', () => {
    expect(() => mergeSchemas([])).toThrow('Cannot merge empty schema array')
  })

  it('should merge single schema', () => {
    const schemas = [
      {
        '@context': 'https://schema.org',
        '@type': 'Organization',
        name: 'Acme',
      },
    ]
    const result = mergeSchemas(schemas) as Record<string, unknown>
    
    expect(result['@context']).toBe('https://schema.org')
    expect(result['@graph']).toBeDefined()
    
    const graph = result['@graph'] as Array<Record<string, unknown>>
    expect(graph).toHaveLength(1)
    expect(graph[0]['@type']).toBe('Organization')
  })

  it('should preserve all properties except @context in graph items', () => {
    const schemas = [
      {
        '@context': 'https://schema.org',
        '@type': 'Organization',
        '@id': 'https://example.com/#org',
        name: 'Acme',
        url: 'https://example.com',
      },
    ]
    const result = mergeSchemas(schemas) as Record<string, unknown>
    const graph = result['@graph'] as Array<Record<string, unknown>>
    
    expect(graph[0]['@type']).toBe('Organization')
    expect(graph[0]['@id']).toBe('https://example.com/#org')
    expect(graph[0]['name']).toBe('Acme')
    expect(graph[0]['url']).toBe('https://example.com')
    expect(graph[0]['@context']).toBeUndefined()
  })
})
