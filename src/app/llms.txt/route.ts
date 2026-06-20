import { getSEOConfig, getBaseUrl } from '@/lib/seo/config'

// llms.txt — strukturirani sažetak za AI crawler-e (ChatGPT, Perplexity, Gemini).
// Cilj: tačan NAP + ključne činjenice + linkovi (sva 4 jezika) koje AI citira.
export const revalidate = 86400

const LOCALES = ['sr', 'en', 'de', 'it'] as const

const PAGES: Array<{ path: string; en: string; sr: string }> = [
  { path: '', en: 'Home', sr: 'Početna' },
  { path: '/apartments', en: 'Apartments', sr: 'Apartmani' },
  { path: '/gallery', en: 'Gallery', sr: 'Galerija' },
  { path: '/prices', en: 'Prices', sr: 'Cene' },
  { path: '/location', en: 'Location', sr: 'Lokacija' },
  { path: '/attractions', en: 'Attractions', sr: 'Atrakcije' },
  { path: '/guide', en: 'Guide', sr: 'Vodič' },
  { path: '/contact', en: 'Contact', sr: 'Kontakt' },
  { path: '/booking', en: 'Booking', sr: 'Rezervacije' },
]

export async function GET() {
  const c = getSEOConfig()
  const b = getBaseUrl()
  const a = c.business.address

  // Each page in all 4 languages (sr · en · de · it)
  const pagesBlock = PAGES.map(
    (p) => `- ${p.en} / ${p.sr}: ${LOCALES.map((l) => `${b}/${l}${p.path}`).join(' · ')}`
  ).join('\n')

  const body = `# ${c.siteName}

> Apartmani / smeštaj na Bovanskom jezeru (Bovan), Srbija — privatna plaža, priroda, porodični odmor.
> Holiday apartments on Bovan Lake (Bovansko jezero), Serbia — private beach, nature, family stays.

## Key facts / Osnovno
- Name / Naziv: ${c.business.name}
- Address / Adresa: ${a.street}, ${a.postalCode} ${a.city}, ${a.region}, ${a.country}
- Coordinates / Koordinate: ${c.business.geo.latitude}, ${c.business.geo.longitude}
- Phone / Telefon: ${c.business.phone}
- Email: ${c.business.email}
- Beach / Plaža: 2–3 min walk / hoda
- Aleksinac ~15 km (E75 exit, supermarkets), Niš ~55 km, Sokobanja nearby
- Pets / Ljubimci: not allowed / nisu dozvoljeni
- Check-in ${c.business.checkinTime}, check-out ${c.business.checkoutTime}

## Languages / Jezici
Site is available in 4 languages — sr (default), en, de, it. URL pattern: ${b}/{lang}/...

## Pages / Stranice (sr · en · de · it)
${pagesBlock}

## About / O lokaciji
Bovan Lake (Bovansko jezero) is a reservoir on the Moravica river near the village of Bovan, Aleksinac municipality, ${a.region}, Serbia. Surrounded by forested hills; swimming, fishing and nature tourism. ${c.business.name} offers lakeside apartments with a private beach, Wi-Fi, parking and BBQ.

## Sitemap
${b}/sitemap.xml
`

  return new Response(body, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'public, max-age=3600, stale-while-revalidate=86400',
    },
  })
}
