# Implementation Plan: Comprehensive SEO Optimization

## Overview

This implementation plan breaks down the comprehensive SEO optimization feature into discrete, actionable coding tasks. The implementation follows a phased approach: foundation setup, metadata generation, structured data, dynamic content integration, sitemaps/robots, performance optimization, and validation. All tasks build incrementally, with each step validating functionality through code integration.

The implementation covers all 4 languages (SR, EN, DE, IT) and integrates with Next.js 14 Metadata API, next-intl for translations, Supabase for dynamic content, and Cloudinary for image optimization.

## Tasks

- [x] 1. Set up SEO infrastructure and configuration
  - [x] 1.1 Create SEO configuration module with base URL management
    - Create `src/lib/seo/config.ts` with `SEOConfig` interface
    - Implement `getBaseUrl()` function with environment detection (localhost, Vercel preview, production)
    - Implement `getSEOConfig()` function returning site name, locales, social profiles, business info
    - Implement `validateBaseUrl()` function to ensure protocol and domain
    - Add environment variable `NEXT_PUBLIC_BASE_URL` to `.env.local` and `.env.example`
    - Requirements: 13.1, 13.2, 13.3, 13.4, 13.10
  
  - [x] 1.2 Create SEO type definitions
    - Create `src/lib/types/seo.ts` with all TypeScript interfaces
    - Define `SEOMetadata`, `MetaTagsInput`, `MetaTagsOutput`, `HreflangTag`, `PageType`, `PageSEOConfig`
    - Define structured data types: `LocalBusinessSchema`, `LodgingBusinessSchema`, `BreadcrumbSchema`, `FAQSchema`
    - Define `SitemapEntry`, `RobotsConfig`, `OpenGraphTags`, `TwitterCardTags`
    - Requirements: Design specification
  
  - [x] 1.3 Create SEO utility functions
    - Create `src/lib/seo/utils.ts` with helper functions
    - Implement `truncateText(text: string, maxLength: number): string`
    - Implement `sanitizeMetaContent(text: string): string` to remove HTML and special chars
    - Implement `makeAbsoluteUrl(path: string, baseUrl: string): string`
    - Implement `isValidUrl(url: string): boolean`
    - Implement `generateSlug(text: string): string`
    - Requirements: 1.5, 1.6, Design specification

- [x] 2. Implement meta tag generation
  - [x] 2.1 Create meta generator module
    - Create `src/lib/seo/meta-generator.ts` with `MetaTagsInput` and `MetaTagsOutput` interfaces
    - Implement `generateMetaTags(input: MetaTagsInput): MetaTagsOutput` function
    - Implement `generateTitle(title: string, locale: Locale): string` with 50-60 char limit
    - Implement `generateDescription(desc: string): string` with 150-160 char limit
    - Implement `generateCanonicalUrl(path: string, locale: Locale): string`
    - Include viewport, charset, and robots meta tags
    - Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 1.7, 1.8
  
  - [ ]* 2.2 Write unit tests for meta generator
    - Test title truncation at 60 characters
    - Test description truncation at 160 characters
    - Test canonical URL generation with base URL
    - Test meta tag sanitization
    - Requirements: 1.5, 1.6

- [x] 3. Implement hreflang management
  - [x] 3.1 Create hreflang manager module
    - Create `src/lib/seo/hreflang.ts` with `HreflangTag` and `HreflangInput` interfaces
    - Implement `generateHreflangTags(input: HreflangInput): HreflangTag[]` function
    - Implement `getAlternateUrls(path: string): Record<Locale, string>` for all 4 locales
    - Implement `getSelfReferentialTag(path: string, locale: Locale): HreflangTag`
    - Include x-default hreflang pointing to Serbian (sr) locale
    - Ensure all hreflang URLs are absolute using base URL
    - Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 2.6, 2.7, 2.8
  
  - [ ]* 3.2 Write unit tests for hreflang manager
    - Test generation of all 4 locale tags plus x-default
    - Test absolute URL generation
    - Test self-referential tag
    - Test consistent slug across languages
    - Requirements: 2.1, 2.8

- [x] 4. Implement social media optimization
  - [x] 4.1 Create social media optimizer module
    - Create `src/lib/seo/social-media.ts` with `SocialMediaInput`, `OpenGraphTags`, `TwitterCardTags` interfaces
    - Implement `generateOpenGraphTags(input: SocialMediaInput): OpenGraphTags` function
    - Implement `generateTwitterCardTags(input: SocialMediaInput): TwitterCardTags` function
    - Implement `optimizeImageForSocial(imageUrl: string): string` for 1200x630 dimensions using Cloudinary
    - Include og:locale and og:locale:alternate for all 4 languages
    - Set og:site_name to "Apartmani Jovča"
    - Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 3.6, 3.7, 3.8, 3.9, 3.10
  
  - [ ]* 4.2 Write unit tests for social media optimizer
    - Test Open Graph tag generation
    - Test Twitter Card tag generation
    - Test image optimization for 1200x630
    - Test locale and alternate locale tags
    - Requirements: 3.4, 3.5, 3.6

- [x] 5. Checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [x] 6. Implement structured data engine
  - [x] 6.1 Create structured data base module
    - Create `src/lib/seo/structured-data.ts` with base structured data types
    - Implement `validateSchema(schema: object): boolean` function
    - Create helper function to embed JSON-LD in script tags
    - Requirements: 4.7, 4.8, 4.10
  
  - [x] 6.2 Implement LocalBusiness schema generator
    - Implement `generateLocalBusinessSchema(locale: Locale): LocalBusinessSchema` function
    - Include name, address, phone, geo coordinates, opening hours
    - Include sameAs links to social media profiles (Facebook, Instagram)
    - Include @id and url properties
    - Requirements: 4.1, 4.11, 10.3, 10.7, 10.8
  
  - [x] 6.3 Implement LodgingBusiness schema generator
    - Implement `generateLodgingBusinessSchema(apartment: Apartment, locale: Locale): LodgingBusinessSchema` function
    - Include name, description, image array, address, geo coordinates
    - Include amenityFeature array, numberOfRooms, priceRange
    - Include aggregateRating if reviews exist
    - Requirements: 4.2, 4.9, 19.4
  
  - [x] 6.4 Implement Breadcrumb schema generator
    - Implement `generateBreadcrumbSchema(path: string, locale: Locale): BreadcrumbSchema` function
    - Generate itemListElement array with position, name, and item URL
    - Support multi-level breadcrumbs (Home > Apartments > Apartment Name)
    - Translate breadcrumb labels using next-intl
    - Requirements: 4.3, 17.2, 17.8, 17.10
  
  - [x] 6.5 Implement FAQ schema generator
    - Implement `generateFAQSchema(faqs: FAQ[], locale: Locale): FAQSchema` function
    - Include question name and acceptedAnswer.text for each FAQ
    - Format as valid JSON-LD with @context and @type
    - Requirements: 4.4, 18.1, 18.2, 18.3, 18.4, 18.5, 18.10
  
  - [x] 6.6 Implement Review schema generator
    - Implement `generateReviewSchema(reviews: Review[]): AggregateRating` function
    - Calculate average rating from review data
    - Include ratingValue, bestRating (5), reviewCount
    - Include individual review items with author, datePublished, reviewRating, reviewBody
    - Only include approved reviews
    - Return null if no reviews exist
    - Requirements: 4.5, 19.1, 19.2, 19.3, 19.5, 19.6, 19.7, 19.8, 19.9
  
  - [x] 6.7 Implement Organization schema generator
    - Implement `generateOrganizationSchema(): Organization` function
    - Include logo, contact information, social media links
    - Requirements: 4.12
  
  - [ ]* 6.8 Write unit tests for structured data generators
    - Test LocalBusiness schema validation
    - Test LodgingBusiness schema with apartment data
    - Test Breadcrumb schema generation
    - Test FAQ schema formatting
    - Test Review schema calculation
    - Validate all schemas against Schema.org specs
    - Requirements: 4.10, 15.1

- [x] 7. Implement translation integration for SEO
  - [x] 7.1 Add SEO translations to message files
    - Add SEO namespace to `messages/sr.json`, `messages/en.json`, `messages/de.json`, `messages/it.json`
    - Include meta titles, descriptions, keywords for each page type
    - Include breadcrumb labels, FAQ content, alt text templates
    - Include locale-specific keywords (e.g., "apartmani" for SR, "apartments" for EN, "Ferienwohnung" for DE, "appartamenti" for IT)
    - Requirements: 1.6, 11.1, 11.2, 11.4, 11.9
  
  - [x] 7.2 Create keyword configuration per locale
    - Create `src/lib/seo/keywords.ts` with keyword mappings per page type and locale
    - Define primary and secondary keywords for home, apartment-list, apartment-detail, location, contact pages
    - Include long-tail keywords for each locale
    - Include semantic variations and synonyms
    - Requirements: 16.1, 16.5, 16.6, 16.7, 16.11, 16.12

- [x] 8. Integrate metadata with Next.js pages
  - [x] 8.1 Implement generateMetadata for home page
    - Update `src/app/[lang]/page.tsx` with `generateMetadata()` function
    - Load translations using next-intl `getTranslations()`
    - Generate meta tags using `generateMetaTags()`
    - Generate hreflang tags using `generateHreflangTags()`
    - Generate Open Graph and Twitter Card tags
    - Include LocalBusiness and Organization structured data
    - Include FAQ schema if FAQ section exists
    - Requirements: 1.1, 1.2, 1.3, 2.1, 3.1, 4.1, 4.12, 18.7
  
  - [x] 8.2 Implement generateMetadata for apartment list page
    - Update `src/app/[lang]/apartments/page.tsx` with `generateMetadata()` function
    - Include category and location in title
    - Generate hreflang tags for apartment list page
    - Include Breadcrumb schema (Home > Apartments)
    - Requirements: 1.10, 2.1, 4.3
  
  - [x] 8.3 Implement generateMetadata for apartment detail pages
    - Update `src/app/[lang]/apartments/[slug]/page.tsx` with `generateMetadata()` function
    - Fetch apartment data from Supabase in generateMetadata
    - Include apartment name, price, location in title
    - Use apartment description for meta description (truncated to 160 chars)
    - Use first apartment image for og:image (optimized to 1200x630)
    - Generate LodgingBusiness schema with apartment data
    - Include Review schema if reviews exist
    - Include Breadcrumb schema (Home > Apartments > Apartment Name)
    - Generate hreflang tags with consistent slug across languages
    - Requirements: 1.9, 3.4, 4.2, 4.5, 4.9, 14.1, 14.4, 14.5, 14.6, 14.9, 19.4
  
  - [x] 8.4 Implement generateMetadata for location page
    - Update `src/app/[lang]/location/page.tsx` with `generateMetadata()` function
    - Include location keywords (Jovča, Bovan Lake, Aleksinac, Serbia)
    - Include LocalBusiness schema with geo coordinates
    - Include tourist attraction structured data if applicable
    - Requirements: 10.1, 10.4, 10.6, 10.10
  
  - [x] 8.5 Implement generateMetadata for contact page
    - Update `src/app/[lang]/contact/page.tsx` with `generateMetadata()` function
    - Include NAP (Name, Address, Phone) in meta description
    - Include LocalBusiness schema
    - Requirements: 10.2
  
  - [x] 8.6 Implement generateMetadata for remaining static pages
    - Update gallery, attractions, prices, privacy, terms pages with `generateMetadata()`
    - Generate appropriate meta tags, hreflang, and breadcrumbs for each
    - Requirements: 1.1, 2.1, 4.3

- [x] 9. Checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [x] 10. Implement semantic HTML improvements
  - [x] 10.1 Audit and fix heading hierarchy
    - Review all pages to ensure proper h1, h2, h3 hierarchy without skipping levels
    - Ensure exactly one h1 per page containing primary topic
    - Update components to use semantic heading structure
    - Requirements: 7.1, 7.2
  
  - [x] 10.2 Implement semantic HTML5 elements
    - Update layout components to use header, nav, main, article, section, aside, footer
    - Update `src/app/[lang]/components/layout/header.tsx` with semantic nav
    - Update `src/app/[lang]/components/layout/footer.tsx` with semantic footer
    - Use appropriate list elements (ul, ol) for navigation and content lists
    - Requirements: 7.3, 7.4, 9.1, 9.6
  
  - [x] 10.3 Implement image alt text system
    - Create `generateAltText(imageName: string, context: string, locale: Locale): string` utility
    - Update all apartment images with descriptive alt text including apartment name
    - Update gallery images with descriptive alt text
    - Use empty alt="" for decorative images
    - Load alt text templates from translation files
    - Requirements: 7.6, 7.7, 7.8, 8.1, 8.2, 15.6
  
  - [x] 10.4 Implement descriptive link text
    - Update all "click here" or "read more" links with descriptive anchor text
    - Use apartment names as anchor text for apartment links
    - Ensure all internal links use descriptive text
    - Requirements: 7.9, 9.7, 9.10

- [x] 11. Implement breadcrumb navigation UI
  - [x] 11.1 Create Breadcrumb component
    - Create `src/components/Breadcrumb.tsx` component
    - Accept breadcrumb items as props (label, href, current)
    - Render breadcrumbs with proper semantic markup (nav with aria-label="breadcrumb")
    - Style current page differently (not a link)
    - Make all items except current clickable
    - Translate labels using next-intl
    - Requirements: 17.1, 17.4, 17.5, 17.7, 17.9, 17.10
  
  - [x] 11.2 Integrate Breadcrumb component in pages
    - Add Breadcrumb component to apartment list page (Home > Apartments)
    - Add Breadcrumb component to apartment detail pages (Home > Apartments > Apartment Name)
    - Add Breadcrumb component to other pages as appropriate
    - Ensure breadcrumbs appear near top of page
    - Requirements: 17.1, 17.3, 17.6

- [x] 12. Implement image optimization
  - [x] 12.1 Update image components for SEO
    - Ensure all images use Next.js Image component or CloudinaryImage component
    - Add width and height attributes to all images
    - Implement lazy loading for below-the-fold images
    - Use modern formats (WebP, AVIF) with Cloudinary transformations
    - Implement responsive images with srcset and sizes
    - Requirements: 8.4, 8.5, 8.6, 8.7, 8.8, 8.10, 20.5, 20.6
  
  - [x] 12.2 Optimize hero and critical images
    - Preload hero images on home page
    - Optimize apartment listing thumbnails
    - Ensure first apartment image is optimized for og:image (1200x630)
    - Requirements: 3.4, 20.11

- [x] 13. Implement dynamic sitemap generation
  - [x] 13.1 Create sitemap generator
    - Create `src/app/sitemap.ts` using Next.js sitemap API
    - Implement `generateSitemap(): Promise<SitemapEntry[]>` function
    - Implement `getStaticPages(): SitemapEntry[]` for home, apartments, location, contact, etc.
    - Implement `getDynamicPages(): Promise<SitemapEntry[]>` to fetch apartments from Supabase
    - Generate URLs for all 4 locales (sr, en, de, it)
    - Set appropriate priority values (1.0 for home, 0.8 for main pages, 0.6 for detail pages)
    - Set appropriate changefreq values (daily for home, weekly for apartments, monthly for static)
    - Include lastmod timestamps from database updated_at fields
    - Use absolute URLs with base URL
    - Exclude admin and portal pages
    - Requirements: 5.1, 5.2, 5.3, 5.4, 5.5, 5.6, 5.7, 5.8, 5.9, 5.11
  
  - [x] 13.2 Add hreflang annotations to sitemap
    - Implement `addHreflangToSitemap(entry: SitemapEntry): SitemapEntry` function
    - Add xhtml:link elements for language alternates
    - Include all 4 locales in alternates.languages
    - Requirements: 5.12
  
  - [ ]* 13.3 Write unit tests for sitemap generator
    - Test static page generation
    - Test dynamic page fetching from Supabase
    - Test URL generation for all locales
    - Test priority and changefreq values
    - Requirements: 5.1, 5.4, 5.5

- [x] 14. Implement robots.txt generation
  - [x] 14.1 Create robots.txt generator
    - Create `src/app/robots.ts` using Next.js robots API
    - Implement `generateRobots(): RobotsConfig` function
    - Allow all user agents for public pages
    - Disallow /admin/*, /portal/*, /api/*, /_next/* paths
    - Allow all language-prefixed routes (/{locale}/*)
    - Include sitemap reference to /sitemap.xml
    - Implement environment detection (disallow all in dev/staging)
    - Requirements: 6.1, 6.2, 6.3, 6.4, 6.5, 6.6, 6.7, 6.8, 6.9
  
  - [ ]* 14.2 Write unit tests for robots.txt generator
    - Test production rules
    - Test development/staging rules (disallow all)
    - Test sitemap reference
    - Requirements: 6.9

- [ ] 15. Checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 16. Implement internal linking strategy
  - [ ] 16.1 Add contextual internal links
    - Add related apartment links on apartment detail pages
    - Add location links in apartment descriptions
    - Add attraction links in location content
    - Ensure all links use descriptive anchor text
    - Keep total links under 100 per page
    - Requirements: 9.2, 9.5, 9.7, 9.9
  
  - [ ] 16.2 Update navigation components
    - Ensure header navigation includes all main pages
    - Ensure footer includes important pages (contact, privacy, terms)
    - Use relative URLs or absolute URLs with base URL
    - Requirements: 9.1, 9.6, 9.8

- [x] 17. Implement performance optimizations
  - [x] 17.1 Optimize JavaScript and CSS
    - Implement code splitting for SEO utilities
    - Minimize and compress CSS and JavaScript
    - Defer non-critical JavaScript
    - Ensure SEO-critical content is server-side rendered
    - Requirements: 12.7, 12.8, 14.3, 14.7, 20.7, 20.8, 20.12
  
  - [x] 17.2 Implement caching strategies
    - Add Cache-Control headers for static assets
    - Implement metadata caching with appropriate TTL
    - Balance freshness and performance for dynamic content
    - Requirements: 12.6, 14.10, 20.10
  
  - [x] 17.3 Optimize web fonts
    - Use font-display: swap for web fonts
    - Preload critical fonts
    - Requirements: 20.9, 20.11
  
  - [ ]* 17.4 Run Lighthouse performance audit
    - Test First Contentful Paint (<3s target)
    - Test Largest Contentful Paint (<2.5s target)
    - Test Cumulative Layout Shift (<0.1 target)
    - Test First Input Delay (<100ms target)
    - Achieve 90+ on PageSpeed Insights mobile
    - Achieve 95+ on PageSpeed Insights desktop
    - Requirements: 20.1, 20.2, 20.3, 20.4, 20.13, 20.14

- [x] 18. Implement technical SEO requirements
  - [x] 18.1 Ensure proper HTTP status codes
    - Verify 200 status for successful pages
    - Create custom 404 page with proper status code
    - Implement 301 redirects for any URL changes
    - Avoid redirect chains
    - Requirements: 12.3, 12.4, 12.10, 12.11
  
  - [x] 18.2 Ensure HTTPS and security
    - Verify HTTPS is enforced for all pages
    - Check security headers
    - Requirements: 12.12
  
  - [x] 18.3 Ensure mobile responsiveness
    - Verify all pages are mobile-first responsive
    - Test viewport meta tag on all pages
    - Requirements: 12.2, 1.7

- [ ] 19. Implement SEO validation and testing
  - [ ]* 19.1 Validate structured data
    - Test all pages with Google Rich Results Test
    - Validate LocalBusiness schema
    - Validate LodgingBusiness schema
    - Validate Breadcrumb schema
    - Validate FAQ schema
    - Validate Review schema
    - Requirements: 15.1, 18.6, 19.10
  
  - [ ]* 19.2 Validate hreflang implementation
    - Test hreflang tags with Google Search Console
    - Verify all 4 locales are properly configured
    - Verify x-default tag
    - Requirements: 15.5, 2.1, 2.3
  
  - [ ]* 19.3 Validate social media metadata
    - Test Open Graph tags with Facebook Sharing Debugger
    - Test Twitter Cards with Twitter Card Validator
    - Verify og:image displays correctly
    - Requirements: 15.9, 15.10, 3.1, 3.3
  
  - [ ]* 19.4 Run Lighthouse SEO audit
    - Achieve 90+ SEO score on all pages
    - Verify no duplicate title tags
    - Verify no duplicate meta descriptions
    - Verify all images have alt text
    - Pass mobile-friendly test
    - Requirements: 12.1, 15.3, 15.4, 15.6, 15.11, 15.12
  
  - [ ]* 19.5 Validate HTML and sitemap
    - Run W3C HTML validation
    - Validate XML sitemap format
    - Check for broken internal links
    - Requirements: 15.2, 15.7, 15.8
  
  - [ ]* 19.6 Test multi-language SEO
    - Verify all pages work in all 4 locales
    - Verify translations are complete
    - Verify locale-specific keywords are used
    - Verify URL slugs are consistent across languages
    - Requirements: 11.1, 11.3, 11.10

- [ ] 20. Final integration and documentation
  - [ ] 20.1 Update environment configuration
    - Document NEXT_PUBLIC_BASE_URL in README
    - Add example values for localhost, staging, production
    - Update .env.example with all SEO-related variables
    - Requirements: 13.1, 13.4
  
  - [ ] 20.2 Create SEO configuration documentation
    - Document how to add new page types
    - Document how to update keywords per locale
    - Document how to add new structured data types
    - Document how to test SEO implementation
    - Requirements: Design specification
  
  - [ ] 20.3 Verify complete coverage of all pages and languages
    - Create comprehensive checklist script `scripts/verify-seo-coverage.mjs`
    - Verify ALL pages have generateMetadata: home, apartments (list + detail), contact, location, gallery, attractions, prices, privacy, terms
    - Verify ALL 4 languages (SR, EN, DE, IT) have complete translations in messages files
    - Verify ALL pages work in ALL 4 languages (test /sr/*, /en/*, /de/*, /it/* routes)
    - Verify sitemap includes ALL pages in ALL 4 languages
    - Verify hreflang tags exist on ALL pages for ALL 4 languages
    - Verify meta tags are unique for each page and language combination
    - Verify structured data exists where required (LocalBusiness on home/contact/location, LodgingBusiness on apartments, Breadcrumbs on all pages except home)
    - Verify Open Graph images exist and are optimized for ALL pages
    - Generate coverage report showing: ✅ Complete pages, ⚠️ Missing translations, ❌ Missing metadata
    - Requirements: All requirements, complete coverage validation
  
  - [ ] 20.4 Final checkpoint - Ensure all tests pass
    - Run all unit tests
    - Run Lighthouse audits on all page types in all languages
    - Verify sitemap generation includes all pages and languages
    - Verify robots.txt in all environments
    - Test social media previews for all page types
    - Run coverage verification script from task 20.3
    - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional testing/validation tasks and can be skipped for faster MVP
- All implementation tasks reference specific requirements for traceability
- The implementation uses TypeScript throughout for type safety
- All metadata generation happens server-side using Next.js 14 App Router
- Translation integration uses next-intl with messages files for all 4 locales
- Dynamic content fetching from Supabase happens in generateMetadata functions
- Image optimization uses Cloudinary transformations
- Checkpoints ensure incremental validation at key milestones
- Testing tasks validate SEO implementation with industry-standard tools
