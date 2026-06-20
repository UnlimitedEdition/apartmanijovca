# AGENTS.md — jedinstveni izvor istine (Claude Code + Codex / ChatGPT)

> **OBAVEZNO ZA OBA AGENTA (Claude Code I Codex).**
> 1. **Pre rada:** pročitaj ovaj fajl (+ projektni `CLAUDE.md`).
> 2. **Na kraju SVAKE izmene:** ažuriraj **STATUS** blok ispod — prebaci urađeno u „✅ Završeno" (sa datumom, najnovije gore) i dopuni/skini iz „📋 Planirano".
> 3. Commit/push/deploy **samo na eksplicitno OK** korisnika. Brisanje fajlova samo na eksplicitno „DA".
> 4. Jezik: **sr-RS latinica**; kod i tehnički termini engleski.
>
> Ovaj fajl je obaveza i za Claude i za ChatGPT/Codex. Ne preskakati ažuriranje STATUS-a.

---

## STATUS

### ✅ Završeno (najnovije gore)

**2026-06-20 (fix — galerija LCP, mobilni Lighthouse Perf 74→cilj 90+)**
- Lighthouse mobilni galerije: Performance 74, **LCP 10.6s** uz FCP 1.1s. Uzrok (potvrđen `curl`-om prod HTML-a — SSR je vraćao SAMO spinner, 0 grid slika): galerija iza `mounted` gate-a → grid+slike se renderuju tek posle JS hydratacije → na sporom mobilnom CPU-u slike kreću ~10s.
- Fix: uklonjen `mounted` gate u `GalleryClient` → grid se **SSR-uje** (`●` prerendered), slike u inicijalnom HTML-u, prvih 6 `eager`+`fetchPriority` kreće odmah. Uklonjen `opacity/onLoad` fade iz `GalleryTile` (bez `img.complete` check-a keširana slika bi mogla ostati nevidljiva u SSR-u); blur LQIP ostaje za percepciju.
- Slike dodatno stegnute: `cldThumb` `q_auto`→`q_auto:eco`, `cldSrcSet` bez 1200w (grid je max ~360px).
- Build `● /[lang]/gallery` prerendered + 379 testova ✅. (AI Lighthouse „image delivery" savet je promašio uzrok — problem je bio KAD slike krenu, ne veličina.)

**2026-06-20 (fix — baseUrl konzistentnost, otkriven proverom prod HTML-a)**
- BUG (AI SEO analize ga PROMAŠILE — našao se tek `curl`-om produkcije): `og:url`, `og:image` i svih 5 `hrefLang` koristili **deployment URL** (`...1fxfb2xhs-milans-projects.vercel.app`, menja se svakim deploy-om), dok je `canonical` na stabilnom `apartmani-jovca.vercel.app` → nekonzistentni signali zbunjuju Google.
- Uzrok/fix: `getBaseUrl()` (`config.ts`) je na produkciji vraćao `VERCEL_URL`; dodato `VERCEL_ENV==='production' → PRODUCTION_URL` pre `VERCEL_URL`. Preview deploy-ovi i dalje koriste deployment host; `.rs` domen kasnije preko `NEXT_PUBLIC_BASE_URL` (najviši prioritet).
- Napomena: 2 AI (Gemini) SEO „revizije" tvrdile da nema meta/OG/canonical/alt/sitemap — SVE postoji (provereno prod HTML-om). Pravi preostali levci su EKSTERNI: `.rs` domen, Google Business (Mape) link, GSC sitemap submit.

**2026-06-20 (sesija — SEO krug 2)**
- `<html lang>` dinamičan po locale — **klijentski sync** (`src/app/[lang]/HtmlLang.tsx`) umesto SSR refaktora root layout-a. Razlog: root `<html>` (`app/layout.tsx`) nosi font/theme/analytics/background, a admin/portal/root-redirect zavise od njega — premeštanje je previše rizično bez vizuelne verifikacije. Googlebot renderuje JS → čita tačan `lang`.
- **`GeoCircle` areaServed** (radius 50 km iz `config.geoRadius`) u LocalBusiness + Organization schema — regionalni AI doseg (Aleksinac/Niš/Sokobanja). Nov `GeoCircleSchema` tip; `areaServed` sada `(Place | GeoCircle)[]`.
- Build ✅ + 379 testova ✅.
- **Ostaje (marginalno / traži sadržaj):** SSR `<html lang>` (refaktor root + admin/portal vizuelni test), `@graph` `@id` linkovanje (`mergeSchemas` postoji; mnogo mesta, marginalan efekat), `openingHoursSpecification` (semantika za smeštaj nejasna), FAQPage na prices/location (zahteva vidljiv FAQ sadržaj + prevode × 4 — Faza 4 long-form).

**2026-06-20 (sesija — perf javnih stranica + SEO krug 1)**
- **Perf (Lighthouse mobilni 72)** — analiza (2 agenta) pokazala: nije JS/bundle, nego slike/LCP. Popravke:
  - Logo 206 KB PNG (`header.tsx`) → `next/image` (AVIF/WebP, priority).
  - Globalni `background.jpg` 188 KB (`layout.tsx`) → `next/image fill priority q70` (AVIF preko Vercel); uklonjen zastareli `.jpg` preload.
  - `apartments/[slug]`: **dynamic → ISR/SSG** — uklonjen `cookies()` (činио rutu dinamičnom), anon `createClient`, `generateStaticParams` + `revalidate=3600`, `cache()` dedup (3–4 ista upita → 1). Build potvrdio `●` prerendered.
  - `next/image` migracija: attractions (lokalne; DB-eksterne ostaju `<img loading=lazy>` zbog nepoznatog host-a), apartments-lista (+`revalidate`), home (amenities + featured; skinut pogrešan `priority` s below-fold slike; `LazyImage` uklonjen).
- **SEO krug 1:**
  - `addressCountry` `Serbia` → **`RS`** (ISO; curi u sve PostalAddress schema). Test ažuriran.
  - Schema 404 slike popravljene: `/images/og-home.jpg` → `background.jpg` (×2), `/images/logo.png` → `logo2.png`.
  - `sitemap.ts`: dodati **image entries** (`<image:image>`) — home/gallery/location + prva slika svakog apartmana (Image Search).
  - Nov **`/llms.txt`** route (AEO za ChatGPT/Perplexity/Gemini) — NAP iz config-a + svih 9 stranica × 4 jezika.
  - `manifest.json` description → NAP-usklađen SR. (manifest ikone rade — `/icon.png`,`/apple-icon.png` su Next rute, NISU 404.)
- Build ✅ + 379 testova ✅ + `tsc --noEmit` ✅.
- **Ostaje (rizično, krug 2):** `<html lang>` dinamičan po locale (refaktor root layout-a, admin/portal), `@graph` `@id` linkovanje (`mergeSchemas` postoji, ne koristi se), `GeoCircle`/`openingHoursSpecification` u schema, FAQPage na prices/location.

**2026-06-20 (sesija — performanse galerije / brzina slika)**
- Nalaz: galerija je servirala **sirove Cloudinary originale** (grid `<img src={url}>` bez transformacije; lightbox `<Image unoptimized>` bez transformacije) → par MB po slici. Slike NISU bile optimizovane uprkos tome što su na Cloudinary-ju.
- Nov helper `src/lib/images/cloudinary.ts` — `cldThumb`/`cldFull`/`cldBlur`/`cldSrcSet`; čiste string fn bez SDK-a (bezbedne za client), no-op za ne-Cloudinary URL. Obrazac kao `optimizeImageForSocial`.
- Grid: `c_fill,ar_4:3,w_600,f_auto,q_auto` + responsive `srcSet`/`sizes` + LQIP blur (~100 B) + fade-in + `fetchPriority=high` za prvih 6 (LCP). Lightbox: `cldFull` (`c_limit,w_1920`) + preload susednih za instant nav. `unoptimized` zadržan **namerno** → Cloudinary CDN keš, nula Vercel Image kvote ([[gallery-images-cloudinary-onfly]]).
- Rezultat: grid 448 KB → 58 KB (**7.7×**; krupnije slike 10–40×). Apartmani (`ApartmentDetailView`) nedirani (već koriste Vercel optimizer + `sizes`, rade).
- Build ✅ + 379 testova + 7 novih helper testova ✅; Cloudinary sintaksa HTTP-provereno (200). Commit `4e23e15b`, **push-ovan na master** (deploy fra1).

**2026-06-19 (sesija — admin panel)**
- Statističke kartice: svih 8 klikabilno. Dolasci/Odlasci danas, Na čekanju, Potvrđeno, Ukupno → Rezervacije (filtrirano, svi apartmani); Ukupan/Mesečni prihod → Analitika; Popunjenost → Dostupnost. Uklonjene „Nedavne rezervacije" sa početne.
- Bookings API: dodati `arrival_on` / `departure_on` filteri.
- „Zauzeto na dan" + pretraga: **debounce + year-guard** (rešen fetch-na-svaki-keystroke / prazna lista dok se kuca godina).
- Kalendar dostupnosti: rewrite — kompaktan, ponedeljak-prvi, ručno blokiranje (range forma + single-day popover).
- Kalendar — 2 bug-a rešena: **UUID 400** (apartmani imaju ne-RFC4122 ID-jeve `1111…/2222…/3333…/4444…`; olabavljen `UUID_RE`) — deploy-ovan; **reason `'external'` kršio DB CHECK** (`availability.reason ∈ NULL/booked/maintenance/blocked`) → promenjen na `'booked'` — commit `5638e561`, čeka push.
- `DatePopoverPicker` (custom calendar-popover, klik na dan, bez kucanja) umesto native `<input type=date>` — Rezervacije + kalendar Od/Do.
- `contact.info.addressValue` = „Bukovička 125, Bovan" na sva 4 jezika (bila stara jezerska adresa; SR typo) — commit `e75414f7`, čeka push.
- Migracije napisane (čekaju pokretanje u SQL Editoru): atrakcije ćirilica→latinica (`20260619110000_*`), gallery re-tag (`20260619090000_*`).

### 📋 Planirano / u toku

**0 — Odmah (mehanički)**
- [ ] `git push origin master` (commiti `5638e561` kalendar + `e75414f7` adresa) → deploy → kalendar manuelno blokiranje radi.
- [ ] Supabase SQL Editor: pokreni `supabase/migrations/20260619110000_attractions_cyrillic_to_latin.sql` i `supabase/migrations/20260619090000_gallery_retag_folders.sql`.

**1 — „Upravljanje sadržajem" (ContentEditor) je 100% ODVOJEN od sajta** — čeka odluku korisnika
- Nalaz: svih 9 sekcija / ~60 polja nepovezano. Editor piše u `content` tabelu (`PUT /api/admin/content`); jedini čitač `getContent`/`getContentValue` (`src/lib/content.ts`) se **nigde ne poziva**; stranice čitaju next-intl JSON (`messages/*.json`). Upis u editor = zabluda.
- Opcije: (a) **ukloni** tab + content API; (b) **DB-driven** — stranice da čitaju `getContent('<sekcija>', lang)` uz JSON fallback (veći posao, 9 stranica) — slaže se s „ja ću sređivati u bazi"; (c) hibrid (ukloni sad, poveži kasnije).

**2 — Prihod kartice → Rezervacije (ne Analitika)**
- „Ukupan prihod"/„Mesečni prihod" da vode na Rezervacije i izdvoje booking-e iz kojih je iznos. Semantika (`api/admin/stats`): total = status `checked_in|checked_out`; monthly = + `created_at` ovaj mesec.
- Koraci: `api/admin/bookings` dodaj `paid` + `created_this_month` filtere → `AdminDashboard.handleCardClick` (revenue/monthlyRevenue → bookings tab sa filterom, ne `analytics`) → `BookingList` primi `paid`/`createdThisMonth` → (poželjno) zbir cena na vrhu = poklapa se sa karticom.

**3 — Paginacija 10–50 na Rezervacijama**
- `BookingList`: sada fiksno `limit = propLimit || 20`. Dodaj `pageSize` state + `<select>` (10/20/30/40/50), koristi kao `limit`, `setPage(1)` na promenu, dodaj u `fetchBookings` deps. API već prima `limit`.

**4 — Poruke: odgovor klijentu preko Resend-a**
- Izvodljivo (email u `messages` tabeli, Resend radi). Nova ruta `POST /api/admin/messages/[id]/reply` (Resend send, `replyTo`=apartmanijovca@gmail.com, status→`replied`) + `Textarea`+dugme u `MessagesManager`. Ograničenje: samo odlazno (inbound = zaseban posao).

---

## Pravila projekta (kratko — puno u `CLAUDE.md`)
- Build mora da prođe: TS strict (`ignoreBuildErrors:false`) + **ESLint se vrti u buildu** (bez unused imports/vars). Brza provera: `npx tsc --noEmit` + `npx next lint --file <fajl>`.
- Deploy = Vercel preko `git push` (region fra1). `npm run deploy` (firebase) je **legacy** — ne koristiti.
- Supabase project ref: `aeyctgzddvxhpxymcetf`. Apartmani ID-jevi su ne-RFC4122 (`1111…`–`4444…`) — ne koristiti strogi v4 UUID regex za njih.
- `removeConsole:true` u prod — `console.log` se briše u buildu (ne oslanjati se na njega za debug u Vercel logu).
- Sve `/api/admin/*` rute moraju same da provere auth (`requireAdmin`) — middleware preskače `/api/*`.
