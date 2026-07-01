# SEO Maksimizacija — Audit + Plan (2026-06-18)

> **Cilj (vlasnik):** Globalni (NE lokalni) #1 na Google-u **i** AI pretragama (ChatGPT / Perplexity / Gemini / Google AI Overviews) za pojmove: `Bovan`, `Bovansko jezero`, `Jovča / Apartmani Jovča`, `apartman / soba / izdavanje / smeštaj uz Bovansko jezero`. Cilj: iznad Booking.com-a.
>
> **Status:** Audit ZAVRŠEN i verifikovan (34 agenta, svaki HIGH/CRITICAL nalaz proveren protiv izvora). Implementacija NIJE počela — čeka se nastavak posle restart/resume.
>
> **Live prevodi:** `messages/{sr,en,de,it}.json` + `messages/legal-{lang}.json`. Folder `public/locales/**` je MRTAV legacy (next-intl učitava iz `messages/` po `src/i18n/request.ts`).
>
> **Napomena o verziji:** Projekat je delom na Next 16 putanji — routing je u `src/proxy.ts` (ne `middleware.ts`). Proveriti pri implementaciji.

---

## ✅ Potvrđene odluke (vlasnik, 2026-06-18)

1. **Domen:** Ostajemo na `apartmanijovca.rs` ZA SAD. Kod centralizovati tako da se ceo URL meња **jednim env var-om** `NEXT_PUBLIC_BASE_URL`. Kad dođe pravi domen (`apartmanijovca.rs` / `apartmanijovca.rs`) → jedna izmena env-a + Vercel domain + DNS, bez diranja koda. Ukloniti SVE hardkodovane `vercel.app` reference (robots.txt, vercel.json CORS).
2. **NAP — JEDNA ISTINA SVUDA** (ispravljeno vlasnikom 2026-06-18):
   - Naziv: **Apartmani Jovča**
   - Puna adresa: **Bukovička 125, 18230 Bovan, opština Aleksinac, Nišavski okrug, Srbija**
     - schema.org PostalAddress: `streetAddress: "Bukovička 125"`, `addressLocality: "Bovan"`, `postalCode: "18230"`, `addressRegion: "Nišavski okrug"`, `addressCountry: "RS"`
     - ⚠️ NIJE "Jovča bb". Vlasnikova forma je imala poštanski `85340` (NEVAŽEĆI — to je crnogorski/Herceg Novi kod); potvrđeno **18230 Bovan**.
   - Koordinate: **43.64592019, 21.70277774** (lat, lng) — vlasnikov GPS pin (potvrđen, ~identičan ranijem map pin-u)
   - Telefon: **+381 65 237 8080** · Email: **apartmanijovca@gmail.com**
   - `addressCountry`: **RS** (ISO kod, ne "Serbia")
   - Najbliži grad / supermarketi / izlaz s autoputa E75: **Aleksinac (~15 km)**
   - **Niš: ~55 km** (NE 30 km)
   - Sokobanja: obližnji turistički grad (izleti)
   - Plaža: **2–3 min hoda** (standardizovati svuda)
3. **Politika ljubimaca:** **NISU dozvoljeni** (ispravka vlasnika 2026-06-18 — „dozvoljeni uz najavu + 15€/dan" u Uslovima je GREŠKOM zavedeno). Uskladiti sve na zabranu, sva 4 jezika:
   - FAQ: SR/EN već kažu „nisu dozvoljeni" (OK); **DE/IT kažu „zavisi od apartmana" → promeniti na „nisu dozvoljeni"**.
   - **`legal.terms.s4.item4`** u `messages/legal-{sr,en,de,it}.json` trenutno kaže „dozvoljeni uz najavu + 15€" → **promeniti u „nisu dozvoljeni"** (ukloniti pomen naknade).
4. **Obim:** SVE — tehnika + schema + i18n ispravke + NOVI long-form sadržaj (vodiči/blog) na sva 4 jezika.

---

## 📊 Audit rezime: 65 nalaza (4 CRITICAL / 20 HIGH / 30 MEDIUM / 11 LOW)

### 🔴 CRITICAL
- `non-branded-subdomain` — vercel.app kao produkcija = tvrd plafon rangiranja. **Mitigacija:** centralizacija URL-a (odluka #1), domen kasnije.
- `booking-page-missing-metadata` — `src/app/[lang]/booking/page.tsx` nema `generateMetadata` uopšte.
- `nap-inconsistency-location-coordinates` / `structured-data-nap-mismatch` — config `43.5333/21.7000` & `18220` vs mapa `43.6461/21.7023` & prevodi `18230`. **Rešeno odlukom #2.**
- `airport-exit-wrong-city` — "izlaz Bovan" umesto "Aleksinac" u sva 4 jezika (`location.byCarDesc`).

### 🟠 HIGH — Schema / GEO-AEO
- `missing-website-schema` — nema `WebSite` + `SearchAction` (sitelinks searchbox, AI vidljivost).
- `no-offer-price-specification` — `LodgingBusiness` koristi string `priceRange` umesto `Offer` (priceCurrency EUR, availability, validFrom).
- `no-tourist-attraction-schema` — nema `TouristAttraction`/`TouristDestination` (a `src/data/attractions.ts` ima 11 atrakcija na 4 jezika!).
- `no-areaserved-geo-marking` — nema `areaServed`/geo radius (regionalni doseg za AI: Bovan/Aleksinac/Sokobanja/Niš).
- `review-schema-not-aggregated-on-home` — `aggregateRating` se ne emituje na home (recenzije se dohvataju ali ne ulaze u schema).
- `lodeging-business-missing-fields` — nedostaju bed/occupancy/floorSize/telephone/email/starRating; `bathroom_count` pogrešno mapiran na `numberOfRooms`.
- `missing-person-organization-eeeat` (MED→HIGH za AI) — nema Person/Organization autoritet (owner, foundingDate, areaServed).

### 🟠 HIGH — Tehnika
- `x-default-hreflang-filtered-out` — `convertHreflangToMetadata()` (`metadata-adapter.ts`) + inline filteri u 8 stranica izbacuju `x-default`.
- `home-page-duplicate-json-ld` — JSON-LD se injektuje DUPLO (metadata.other + body `<script>`); ukloniti body verziju (linije ~170-194).
- `homepage-force-dynamic` / `force-dynamic-harms-isr` / `attractions-page-also-force-dynamic` — `export const dynamic='force-dynamic'` na home/gallery/attractions → nema ISR/CDN keša. Prebaciti na `revalidate` (home 3600, attractions 7200, gallery 3600) + vratiti `generateStaticParams` gde treba.
- `static-robots-txt-conflict` — `public/robots.txt` (statični) gazi `src/app/robots.ts` (dinamički). Obrisati statični.
- `sitemap-no-image-entries` — sitemap bez `<image:image>` (Image Search za "Bovansko jezero apartmani").
- `nap-inconsistency-config-vs-vault` / `nap-inconsistency-coordinates` — rešeno odlukom #2.
- Perf: `lcp-hero-background-unoptimized` — `background.jpg` 472KB, CSS bg, nepreloadovan na svakoj stranici (FCP).

### 🟠 HIGH — i18n činjenične greške (sve potvrđene vs `docs/nikola-propusti-i18n.md`)
- `supermarket-locations-wrong` — `home.faq.a7` (SR/EN: "Bovan"), `home.faq.a10` (DE/IT: "Sokobanja") → svi na **Aleksinac (~15 km)**.
- `distance-to-nis-inconsistent` — `location.nisDesc` 30km → **55km** (sva 4 jezika).
- `pet-policy-contradictory` — uskladiti na **NISU dozvoljeni** (odluka #3, ispravljena 2026-06-18); promeniti i `legal.terms.s4.item4` koji greškom kaže suprotno.

### 🟡 MEDIUM (izbor)
- `gallery-prices-attractions-missing-twitter` — nedostaju Twitter Card tagovi.
- `root-layout-hardcoded-sr` / `layout-lang-not-set-dynamically` — `<html lang>` hardkodovan na `sr`; treba dinamički po locale.
- `google-site-verification-missing` — dodati `metadata.verification.google` placeholder.
- `manifest-lang-incorrect` (`en`→`sr`), `manifest-missing-png-icons` (192/512 PNG + apple-touch-icon), theme_color (`#ffffff`→`#2563eb`).
- `missing-opengraph-image-route` — dinamički OG (`opengraph-image.tsx`) za home + apartman.
- `no-image-object-schema` (`ImageSchema` definisan ali neiskorišćen), `no-sameAs-graph-linking` (@id graf), `no-localbusiness-openinghours`.
- `missing-preconnect-image-domains` — preconnect za supabase/cloudinary/unsplash.
- `custom-lazy-image-not-next-image`, `gallery-images-large-uncompressed`, `image-sizes-prop-missing`, `no-webp-avif-variants-served`.
- `csp-content-security-policy-too-strict` — dozvoliti GA4/analytics u `connect-src`.
- `preview-to-production-redirect-308` — 308→307 ili robots disallow za preview hostove.
- `english-word-in-serbian-text` ("many"→"mnogo"), `featured-section-subtitle-divergence` (DE/IT vs SR/EN).

### 🟢 LOW (izbor)
- `schema-context-country-code-inconsistent` ("Serbia"→"RS"), `beach-distance-minor-variance` (2 vs 2–3 min), `typo-word-spacing` ("dopl ata"→"doplata"), `www-redirect-missing` (po domenu), `dead-public-locales-folder` (obrisati), `metadata-title-length`.

---

## 🚀 Plan implementacije (faze)

> Pravilo: flow-check pre svake izmene koda. Build STRIKTAN (`ignoreBuildErrors:false`). Posle svake faze: `npm run build` + `npm run lint`. Commit/push SAMO na eksplicitno OK.

### Faza 0 — Single source of truth (URL + NAP)
- `src/lib/seo/config.ts`: `PRODUCTION_URL` čita iz `NEXT_PUBLIC_BASE_URL` (fallback vercel.app). NAP po odluci #2. `addressCountry: 'RS'`. Dodati `areaServed`, `openingHours`, owner/foundingDate u `SEOConfig`.
- Ukloniti hardkodovan vercel.app: `public/robots.txt` (obrisati ceo fajl), `vercel.json` CORS origin (dokumentovati kao swap-tačku).
- **Domain swap dokument (kad dođe domen):** (1) Vercel: add domain + DNS, (2) env `NEXT_PUBLIC_BASE_URL=https://novi-domen`, (3) `vercel.json` CORS origin, (4) `EMAIL_FROM`, (5) GSC nova property + redeploy.

### Faza 1 — i18n istina (messages/*.json × 4) + legal
- Ispraviti svih 9 nikola grešaka + NAP + ljubimci (odluka #3) + Niš 55km + Aleksinac izlaz/supermarketi + plaža 2–3min + "many"→"mnogo" + "dopl ata".
- Uskladiti `home.featured.subtitle` (jedna poruka, prevedena na 4 jezika).
- Obrisati `public/locales/**`.

### Faza 2 — Schema / structured-data (GEO/AEO jezgro)
- `src/lib/seo/structured-data.ts` + `src/lib/types/seo.ts`:
  - `generateWebSiteSchema()` + `SearchAction`.
  - `generateTouristAttractionSchema()` + `TouristDestination` (iz `src/data/attractions.ts`) → na `/attractions`.
  - `Offer`/`priceSpecification` (EUR, availability) u `LodgingBusiness`; bed/occupancy/floorSize/telephone/email/starRating; fix `bathroom_count`→ pravo polje.
  - `areaServed` (Bovan/Aleksinac/Sokobanja/Niš radius) na LocalBusiness/Organization.
  - `aggregateRating` na home (iz Supabase recenzija).
  - Person/Organization E-E-A-T (owner, foundingDate, sameAs, @id graf).
  - `generateImageSchema()` za galeriju; `openingHoursSpecification`.
  - `LocalBusiness` → razmotriti `LodgingBusiness`/`Resort` tip za home.

### Faza 3 — Per-page metadata + tehnika
- `booking/page.tsx`: dodati `generateMetadata` (po obrascu `prices`).
- `metadata-adapter.ts` + 8 stranica: uključiti `x-default` hreflang.
- Ukloniti dupli JSON-LD sa home (body `<script>`).
- `force-dynamic` → `revalidate` (home/gallery/attractions) + `generateStaticParams`.
- `robots.ts` (obrisati `public/robots.txt`); preview disallow + 308→307.
- `sitemap.ts`: ukloniti `lastModified=new Date()` za statične, dodati `x-default`, dodati image entries (custom XML namespace).
- Twitter Card na gallery/prices/attractions.
- `<html lang>` dinamički; `manifest` (lang sr, theme #2563eb, PNG ikone, apple-touch-icon); GSC verification; `opengraph-image.tsx`; preconnect; CSP za GA4.

### Faza 4 — Long-form sadržaj (E-E-A-T / AEO) na 4 jezika
- Nova ruta `/[lang]/vodic` (ili `/blog`) + flagship članci (1500+ reči): "Vodič za Bovansko jezero", "Kako doći do Bovana (Beograd/Niš/aerodrom)", "Šta videti i raditi", "Bovan vs Sokobanja".
- Owner-bio sekcija (autoritet: od kada, broj apartmana, jezici).
- Proširen FAQ (8+ novih Q&A koje AI citira) + `Article`/`HowTo`/`FAQPage` schema.
- Bogati opisi apartmana (proza, ne samo labele).
- Interno linkovanje sa opisnim anchor tekstom.

### Faza 5 — Verifikacija
- `npm run build` + `npm run lint` + `npm run test`.
- Rich Results Test / Schema validator (lokalno renderovan JSON-LD).
- Lighthouse (CWV) pre/posle.
- Sve javne rute 200 (sr/en/de/it).

---

## Reference
- Audit (pun, verifikovan): workflow `wf_934eb254-42c` — output snapshot ugrađen gore.
- i18n greške: `docs/nikola-propusti-i18n.md`
- SEO lib: `src/lib/seo/` · prevodi: `messages/` · atrakcije: `src/data/attractions.ts`
- Projektni CLAUDE.md, `security-profile.md`
