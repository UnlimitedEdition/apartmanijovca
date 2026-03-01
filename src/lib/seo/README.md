# SEO Module

Comprehensive SEO optimization module for Apartmani Jovča website.

## Configuration Module (`config.ts`)

### Overview

The configuration module provides centralized SEO configuration with environment-aware base URL management. It automatically detects the environment (localhost, Vercel preview, production) and provides the appropriate base URL.

### Functions

#### `getBaseUrl(): string`

Returns the base URL for the application based on environment detection.

**Priority:**
1. `NEXT_PUBLIC_BASE_URL` environment variable (explicit configuration)
2. `NEXT_PUBLIC_VERCEL_URL` or `VERCEL_URL` (Vercel deployments)
3. `http://localhost:3000` (development fallback)

**Example:**
```typescript
import { getBaseUrl } from '@/lib/seo/config'

const baseUrl = getBaseUrl()
// Returns: 'https://apartmani-jovca.rs' (production)
// or: 'https://preview-branch.vercel.app' (Vercel preview)
// or: 'http://localhost:3000' (local development)
```

#### `validateBaseUrl(url: string): boolean`

Validates that a URL has proper protocol (http/https) and domain.

**Example:**
```typescript
import { validateBaseUrl } from '@/lib/seo/config'

validateBaseUrl('https://example.com') // true
validateBaseUrl('http://localhost:3000') // true
validateBaseUrl('example.com') // false (no protocol)
validateBaseUrl('ftp://example.com') // false (wrong protocol)
```

#### `getSEOConfig(): SEOConfig`

Returns the complete SEO configuration object including site information, locales, social profiles, and business details.

**Example:**
```typescript
import { getSEOConfig } from '@/lib/seo/config'

const config = getSEOConfig()
console.log(config.siteName) // 'Apartmani Jovča'
console.log(config.locales) // ['sr', 'en', 'de', 'it']
console.log(config.business.geo) // { latitude: 43.5333, longitude: 21.7000 }
```

### Types

#### `Locale`

Supported language codes:
```typescript
type Locale = 'sr' | 'en' | 'de' | 'it'
```

#### `SEOConfig`

Complete SEO configuration interface:
```typescript
interface SEOConfig {
  baseUrl: string
  siteName: string
  defaultLocale: Locale
  locales: Locale[]
  social: {
    twitter?: string
    facebook?: string
    instagram?: string
  }
  business: {
    name: string
    phone: string
    email: string
    address: {
      street: string
      city: string
      region: string
      postalCode: string
      country: string
    }
    geo: {
      latitude: number
      longitude: number
    }
  }
}
```

## Environment Variables

### Required

- `NEXT_PUBLIC_BASE_URL` - The base URL for the application (e.g., `https://apartmani-jovca.rs`)

### Optional (Auto-detected)

- `NEXT_PUBLIC_VERCEL_URL` - Automatically set by Vercel for preview deployments
- `VERCEL_URL` - Automatically set by Vercel (fallback)

### Configuration

Add to `.env.local`:
```env
NEXT_PUBLIC_BASE_URL=http://localhost:3000
```

Add to `.env.production`:
```env
NEXT_PUBLIC_BASE_URL=https://apartmani-jovca.rs
```

## Usage Examples

### In Next.js Metadata API

```typescript
import { getSEOConfig } from '@/lib/seo/config'
import type { Metadata } from 'next'

export async function generateMetadata(): Promise<Metadata> {
  const config = getSEOConfig()
  
  return {
    title: 'Home - ' + config.siteName,
    description: 'Vacation rentals at Bovan Lake',
    alternates: {
      canonical: `${config.baseUrl}/en`,
    },
  }
}
```

### In Server Components

```typescript
import { getSEOConfig } from '@/lib/seo/config'

export default function Page() {
  const config = getSEOConfig()
  
  return (
    <div>
      <h1>{config.siteName}</h1>
      <p>Contact: {config.business.phone}</p>
    </div>
  )
}
```

### In API Routes

```typescript
import { getBaseUrl } from '@/lib/seo/config'

export async function GET() {
  const baseUrl = getBaseUrl()
  
  return Response.json({
    canonical: `${baseUrl}/api/apartments`,
  })
}
```

## Testing

Run tests:
```bash
npm test -- src/lib/seo/__tests__/config.test.ts
```

## Requirements Validation

This module satisfies the following requirements from the spec:

- **13.1**: SEO_System SHALL read Base_URL from environment configuration ✓
- **13.2**: WHEN Base_URL is not configured, SEO_System SHALL use sensible default ✓
- **13.3**: SEO_System SHALL use Base_URL for all absolute URLs ✓
- **13.4**: SEO_System SHALL support different Base_URLs for dev/staging/production ✓
- **13.10**: SEO_System SHALL validate Base_URL format ✓
