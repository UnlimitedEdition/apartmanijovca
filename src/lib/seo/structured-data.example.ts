/**
 * Structured Data Usage Examples
 * 
 * This file demonstrates how to use the structured data base module
 * for generating and embedding Schema.org JSON-LD markup.
 */

import {
  validateSchema,
  embedJsonLd,
  createJsonLdScript,
  validateSchemas,
  mergeSchemas,
} from './structured-data'
import { PRODUCTION_URL, CONTACT_EMAIL, CONTACT_PHONE } from './config'

// ============================================================================
// Example 1: Simple Organization Schema
// ============================================================================

const organizationSchema = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  '@id': `${PRODUCTION_URL}/#organization`,
  name: 'Apartmani Jovča',
  url: PRODUCTION_URL,
  logo: `${PRODUCTION_URL}/logo.png`,
  telephone: CONTACT_PHONE,
  email: CONTACT_EMAIL,
}

// Validate the schema
if (validateSchema(organizationSchema)) {
  console.log('✓ Organization schema is valid')
}

// Embed in HTML (for server-side rendering)
const _htmlScript = embedJsonLd(organizationSchema)
void _htmlScript // Example variable - suppress unused warning
// Output: <script type="application/ld+json">{"@context":"https://schema.org",...}</script>

// ============================================================================
// Example 2: LocalBusiness Schema with Nested Objects
// ============================================================================

const localBusinessSchema = {
  '@context': 'https://schema.org',
  '@type': 'LocalBusiness',
  '@id': `${PRODUCTION_URL}/#business`,
  name: 'Apartmani Jovča',
  image: [
    `${PRODUCTION_URL}/images/exterior.jpg`,
    `${PRODUCTION_URL}/images/interior.jpg`,
  ],
  telephone: CONTACT_PHONE,
  email: CONTACT_EMAIL,
  address: {
    '@type': 'PostalAddress',
    streetAddress: 'Jovča bb',
    addressLocality: 'Aleksinac',
    addressRegion: 'Nišavski okrug',
    postalCode: '18220',
    addressCountry: 'RS',
  },
  geo: {
    '@type': 'GeoCoordinates',
    latitude: 43.5333,
    longitude: 21.7000,
  },
  openingHoursSpecification: [
    {
      '@type': 'OpeningHoursSpecification',
      dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
      opens: '00:00',
      closes: '23:59',
    },
  ],
  sameAs: [
    'https://www.facebook.com/apartmani.jovca',
    'https://www.instagram.com/bovanapartmanijovca',
  ],
}

// Validate and embed
if (validateSchema(localBusinessSchema)) {
  const _script = embedJsonLd(localBusinessSchema)
  void _script // Example variable - suppress unused warning
  console.log('✓ LocalBusiness schema embedded')
}

// ============================================================================
// Example 3: React Component Usage
// ============================================================================

// In a Next.js page or React component:
// Use createJsonLdScript(schema) with dangerouslySetInnerHTML
// Example:
// <script type="application/ld+json" dangerouslySetInnerHTML={createJsonLdScript(schema)} />

const apartmentPageSchema = {
  '@context': 'https://schema.org',
  '@type': 'LodgingBusiness',
  name: 'Studio Apartment 1',
  description: 'Cozy studio apartment near Bovan Lake',
  image: ['https://apartmani-jovca.rs/images/studio-1.jpg'],
  address: {
    '@type': 'PostalAddress',
    streetAddress: 'Jovča bb',
    addressLocality: 'Aleksinac',
    addressCountry: 'RS',
  },
  priceRange: '€30-€50',
}

const _apartmentPageScript = createJsonLdScript(apartmentPageSchema)
void _apartmentPageScript // Example variable - suppress unused warning

// ============================================================================
// Example 4: Breadcrumb Schema
// ============================================================================

const breadcrumbSchema = {
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: [
    {
      '@type': 'ListItem',
      position: 1,
      name: 'Home',
      item: 'https://apartmani-jovca.rs',
    },
    {
      '@type': 'ListItem',
      position: 2,
      name: 'Apartments',
      item: 'https://apartmani-jovca.rs/apartments',
    },
    {
      '@type': 'ListItem',
      position: 3,
      name: 'Studio 1',
      item: 'https://apartmani-jovca.rs/apartments/studio-1',
    },
  ],
}

// ============================================================================
// Example 5: FAQ Schema
// ============================================================================

const faqSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: 'What is the check-in time?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Check-in is from 2:00 PM. Early check-in may be available upon request.',
      },
    },
    {
      '@type': 'Question',
      name: 'Are pets allowed?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Yes, pets are welcome in our apartments. Additional cleaning fee may apply.',
      },
    },
  ],
}

// ============================================================================
// Example 6: Validating Multiple Schemas
// ============================================================================

const schemas = [organizationSchema, localBusinessSchema, breadcrumbSchema, faqSchema]

if (validateSchemas(schemas)) {
  console.log('✓ All schemas are valid')
}

// ============================================================================
// Example 7: Merging Multiple Schemas into a Graph
// ============================================================================

// When you want to embed multiple schemas in a single script tag:
const mergedSchema = mergeSchemas([
  {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'Apartmani Jovča',
    url: 'https://apartmani-jovca.rs',
  },
  {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'Apartmani Jovča Website',
    url: 'https://apartmani-jovca.rs',
  },
])

// Result:
// {
//   '@context': 'https://schema.org',
//   '@graph': [
//     { '@type': 'Organization', name: 'Apartmani Jovča', ... },
//     { '@type': 'WebSite', name: 'Apartmani Jovča Website', ... }
//   ]
// }

const _mergedScript = embedJsonLd(mergedSchema)
void _mergedScript // Example variable - suppress unused warning

// ============================================================================
// Example 8: Error Handling
// ============================================================================

try {
  const invalidSchema = {
    '@type': 'Organization', // Missing @context
    name: 'Invalid',
  }

  embedJsonLd(invalidSchema) // This will throw an error
} catch (error) {
  console.error('Schema validation failed:', error)
}

// ============================================================================
// Example 9: Dynamic Schema Generation
// ============================================================================

function generateApartmentSchemaExample(apartment: {
  id: string
  slug: string
  name: string
  description: string
  images: string[]
  basePrice: number
  capacity: number
  amenities: string[]
}) {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'LodgingBusiness',
    name: apartment.name,
    description: apartment.description,
    image: apartment.images,
    priceRange: `€${apartment.basePrice - 10}-€${apartment.basePrice + 10}`,
    address: {
      '@type': 'PostalAddress',
      streetAddress: 'Jovča bb',
      addressLocality: 'Aleksinac',
      addressCountry: 'RS',
    },
  }

  // Validate before returning
  if (!validateSchema(schema)) {
    throw new Error('Generated schema is invalid')
  }

  return schema
}

// Usage:
const apartmentDataExample = {
  id: '1',
  slug: 'studio-apartment-1',
  name: 'Studio Apartment 1',
  description: 'Cozy studio near Bovan Lake',
  images: ['https://example.com/image1.jpg'],
  basePrice: 40,
  capacity: 2,
  amenities: ['WiFi', 'Kitchen'],
}

const apartmentSchemaExample = generateApartmentSchemaExample(apartmentDataExample)
const _apartmentScriptExample = createJsonLdScript(apartmentSchemaExample)
void _apartmentScriptExample // Example variable - suppress unused warning

export {
  organizationSchema,
  localBusinessSchema,
  breadcrumbSchema,
  faqSchema,
  generateApartmentSchemaExample,
  apartmentDetailExample,
  homePageExample,
}

// ============================================================================
// Example 10: Using Schema Generators
// ============================================================================

import {
  generateLocalBusinessSchema,
  generateLodgingBusinessSchema,
  generateBreadcrumbSchema,
  generateFAQSchema,
  generateReviewSchema,
  generateOrganizationSchema,
  type Apartment,
  type Review,
} from './structured-data'
import type { FAQ } from '@/lib/types/seo'

// Generate LocalBusiness schema for home page
const localBusiness = generateLocalBusinessSchema('sr')
console.log('LocalBusiness schema:', localBusiness)

// Generate LodgingBusiness schema for apartment page
const apartmentData: Apartment = {
  id: '1',
  slug: 'studio-apartment-1',
  name: 'Studio Apartment 1',
  description: 'Cozy studio apartment with lake view',
  images: ['/images/studio-1.jpg', '/images/studio-1-2.jpg'],
  basePrice: 40,
  capacity: 2,
  numberOfRooms: 1,
  amenities: ['WiFi', 'Air Conditioning', 'Kitchen', 'Parking'],
}

const lodgingBusiness = generateLodgingBusinessSchema(apartmentData, 'en')
console.log('LodgingBusiness schema:', lodgingBusiness)

// Generate Breadcrumb schema
const breadcrumb = generateBreadcrumbSchema('/apartments/studio-apartment-1', 'en')
console.log('Breadcrumb schema:', breadcrumb)

// Generate FAQ schema
const faqs: FAQ[] = [
  {
    question: 'What is the check-in time?',
    answer: 'Check-in is from 2:00 PM. Early check-in may be available upon request.',
  },
  {
    question: 'Are pets allowed?',
    answer: 'Yes, pets are welcome in our apartments. Additional cleaning fee may apply.',
  },
]

const faqSchemaGenerated = generateFAQSchema(faqs, 'en')
console.log('FAQ schema:', faqSchemaGenerated)

// Generate Review schema
const reviews: Review[] = [
  {
    id: '1',
    author: 'John Doe',
    rating: 5,
    comment: 'Amazing place! Very clean and comfortable.',
    createdAt: '2024-01-15',
    approved: true,
  },
  {
    id: '2',
    author: 'Jane Smith',
    rating: 4,
    comment: 'Great location near the lake. Highly recommend!',
    createdAt: '2024-01-20',
    approved: true,
  },
]

const reviewSchema = generateReviewSchema(reviews)
console.log('Review schema:', reviewSchema)

// Generate Organization schema
const organization = generateOrganizationSchema()
console.log('Organization schema:', organization)

// ============================================================================
// Example 11: Complete Page with Multiple Schemas
// ============================================================================

// Example of combining multiple schemas for an apartment detail page
const apartmentDetailExample = () => {
  const apartment: Apartment = {
    id: '1',
    slug: 'studio-apartment-1',
    name: 'Studio Apartment 1',
    description: 'Cozy studio apartment with lake view',
    images: ['/images/studio-1.jpg'],
    basePrice: 40,
    capacity: 2,
    numberOfRooms: 1,
    amenities: ['WiFi', 'Air Conditioning', 'Kitchen'],
  }

  const reviews: Review[] = [
    {
      id: '1',
      author: 'John Doe',
      rating: 5,
      comment: 'Amazing place!',
      createdAt: '2024-01-15',
      approved: true,
    },
  ]

  // Generate all schemas
  const lodgingSchema = generateLodgingBusinessSchema(apartment, 'en')
  const breadcrumbSchema = generateBreadcrumbSchema('/apartments/studio-apartment-1', 'en')
  const reviewData = generateReviewSchema(reviews)

  // Add reviews to lodging schema if available
  if (reviewData) {
    lodgingSchema.aggregateRating = reviewData.aggregateRating
    lodgingSchema.review = reviewData.review
  }

  // Merge all schemas
  const allSchemas = mergeSchemas([lodgingSchema, breadcrumbSchema])
  
  // Use createJsonLdScript(allSchemas) with dangerouslySetInnerHTML in your component
  return allSchemas
}

// ============================================================================
// Example 12: Home Page with LocalBusiness and FAQ
// ============================================================================

// Example of combining schemas for home page
const homePageExample = () => {
  const localBusinessSchema = generateLocalBusinessSchema('sr')
  const organizationSchema = generateOrganizationSchema()

  const faqs: FAQ[] = [
    {
      question: 'Gde se nalaze apartmani?',
      answer: 'Apartmani se nalaze u Jovči, pored Bovanskog jezera.',
    },
  ]

  const faqSchema = generateFAQSchema(faqs, 'sr')

  // Combine schemas
  const schemas: object[] = [localBusinessSchema, organizationSchema]
  if (faqSchema) {
    schemas.push(faqSchema)
  }

  const combinedSchema = mergeSchemas(schemas)
  
  // Use createJsonLdScript(combinedSchema) with dangerouslySetInnerHTML in your component
  return combinedSchema
}
