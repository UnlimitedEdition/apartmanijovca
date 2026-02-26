# SEO-Optimized Pages & PWA

## Scope

Implementacija svih public-facing stranica sa SSG/SSR za SEO optimizaciju (#1 na Google-u) i PWA funkcionalnost.

**Included:**
- ✅ Homepage (SSG) - Hero, featured apartments, reviews, multiple CTAs
- ✅ Gallery (SSG) - Masonry grid, lightbox, lazy loading
- ✅ Prices (SSG) - Apartment cards, inline CTAs, reviews
- ✅ Attractions (SSG) - Grid layout, mapa
- ✅ Contact (SSG) - Contact info, mapa, click-to-call
- ✅ SEO optimizacija:
  - Meta tags (title, description, OG tags)
  - Structured data (JSON-LD for apartments, reviews)
  - Sitemap.xml, robots.txt
  - Canonical URLs
- ✅ PWA setup:
  - Service worker
  - Web app manifest
  - Offline support
  - Install prompt
- ✅ Mobile optimizations:
  - Touch targets (min 48px)
  - Click-to-call, WhatsApp buttons
  - Responsive images (Next.js Image)
- ✅ Performance optimizations:
  - Image optimization (WebP, lazy load)
  - Code splitting
  - Core Web Vitals (LCP < 2.5s, FID < 100ms, CLS < 0.1)

**Explicitly Out:**
- ❌ Booking flow (Ticket #4)
- ❌ Guest portal (Ticket #6)
- ❌ Admin panel (Ticket #7)

## Spec References

- `spec:29240173-654b-408c-b23c-b9a7362879c8/f6845df1-8cba-42ca-a558-bbe01d9b56bf` - Core Flows (Flow 1, 2, 3)
- `spec:29240173-654b-408c-b23c-b9a7362879c8/c2e4d049-5b58-42f6-af1e-098e560cc581` - Tech Plan (SSG/SSR strategy, PWA)
- `spec:29240173-654b-408c-b23c-b9a7362879c8/463fe2f3-6b6c-42de-90f2-7ff37afc64ee` - Epic Brief (SEO #1 prioritet)

## Acceptance Criteria

1. ✅ Sve stranice implementirane sa SSG (Homepage, Gallery, Prices, Attractions, Contact)
2. ✅ Meta tags i structured data za SEO
3. ✅ Sitemap.xml generisan automatski
4. ✅ Reviews prikazani na homepage i prices (svuda)
5. ✅ Multiple CTAs na svim stranicama (hero, sticky, inline, floating)
6. ✅ PWA manifest i service worker
7. ✅ Offline support za cached pages
8. ✅ Install prompt funkcioniše
9. ✅ Core Web Vitals < target (LCP < 2.5s, FID < 100ms, CLS < 0.1)
10. ✅ Mobile-first responsive dizajn
11. ✅ Click-to-call i WhatsApp buttons na mobile
12. ✅ Lighthouse score > 90 (Performance, SEO, Accessibility, Best Practices)

## Dependencies

**Depends on:** 
- Ticket #1 (Infrastructure)
- Ticket #2 (Database - za content i apartments data)

## Technical Notes

- SSG sa `generateStaticParams` za multi-language
- Next.js Image component za optimizaciju
- Service worker sa Workbox
- Structured data za rich snippets
- Cena kao prioritet #1 (vidljiva odmah)