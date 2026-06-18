# npm Dependency Audit — apartmani-jovca-next

**Datum:** 2026-06-18
**Status:** read-only analiza (nijedan paket nije menjan)
**Baseline:** Next.js 14.2 App Router · React 18.3 · Node 20
**Napomena:** sve "latest" verzije proverene uživo na npm registry-ju na dan 2026-06-18.

---

## TL;DR

Trenutni `package.json` je konzistentan — **nema aktivnog konflikta**. Ali projekat zaostaje 1–2 major verzije na više paketa, a jedan paket je **deprecated** (`@react-email/components` 0.0.x → bezbednosni dug). Upgrade se deli na: trivijalno čišćenje, "Tier A" (sve na max bez konflikta), srednje migracije (svaka zaseban PR), i "Tier B" (veliki koordinisani potez React 19 + Next 16).

---

## 1. Tabela verzija

### Production dependencies

| Paket | Trenutno | Latest (jun 2026) | Major iza | Tip |
|---|---|---|---|---|
| `@heroicons/react` | ^2.2.0 | 2.2.0 | 0 | current |
| `@hookform/resolvers` | ^3.9.1 | 5.4.0 | 2 | MAJOR |
| `@radix-ui/react-dropdown-menu` | ^2.1.4 | 2.1.18 | 0 | minor/patch |
| `@radix-ui/react-slot` | ^1.1.1 | 1.3.0 | 0 | minor |
| `@radix-ui/react-switch` | ^1.1.2 | 1.3.1 | 0 | minor |
| `@radix-ui/react-tabs` | ^1.1.2 | 1.1.15 | 0 | patch |
| `@react-email/components` | ^0.0.25 | 1.0.12 | 1 | MAJOR + **deprecated u 0.x** |
| `@react-email/render` | ^1.0.2 | 2.0.9 | 1 | MAJOR |
| `@supabase/ssr` | ^0.5.2 | 0.12.0 | 0 | minor (0.x) |
| `@supabase/supabase-js` | ^2.47.10 | 2.108.2 | 0 | minor |
| `@tanstack/react-query` | ^5.62.7 | 5.101.0 | 0 | minor |
| `class-variance-authority` | ^0.7.1 | 0.7.1 | 0 | current |
| `cloudinary` | ^2.9.0 | 2.10.0 | 0 | patch |
| `clsx` | ^2.1.1 | 2.1.1 | 0 | current |
| `date-fns` | ^4.1.0 | 4.4.0 | 0 | minor |
| `firebase` | ^12.9.0 | 12.15.0 | 0 | minor |
| `leaflet` | ^1.9.4 | 1.9.4 | 0 | current |
| `lucide-react` | ^0.460.0 | 1.21.0 | 1 | MAJOR (0.x→1.x) |
| `next` | ^14.2.35 | 16.2.9 | 2 | MAJOR |
| `next-i18next` | ^15.4.3 | 16.0.7 | — | **REDUNDANTAN — izbaciti** |
| `next-intl` | ^3.26.3 | 4.13.0 | 1 | MAJOR |
| `next-themes` | ^0.4.4 | 0.4.6 | 0 | patch |
| `nodemailer` | ^8.0.1 | 9.0.1 | 1 | MAJOR |
| `qrcode` | ^1.5.4 | 1.5.4 | 0 | current |
| `react` | ^18.3.1 | 19.2.7 | 1 | MAJOR |
| `react-dom` | ^18.3.1 | 19.2.7 | 1 | MAJOR |
| `react-hook-form` | ^7.53.2 | 7.79.0 | 0 | minor |
| `react-leaflet` | ^4.2.1 | 5.0.0 | 1 | MAJOR (traži React 19) |
| `resend` | ^4.0.0 | 6.14.0 | 2 | MAJOR |
| `zod` | ^3.24.1 | 4.4.3 | 1 | MAJOR |

### Dev dependencies

| Paket | Trenutno | Latest (jun 2026) | Major iza | Tip |
|---|---|---|---|---|
| `@eslint/eslintrc` | ^3.1.0 | 3.3.5 | 0 | minor |
| `@testing-library/jest-dom` | ^6.6.3 | 6.9.1 | 0 | patch |
| `@testing-library/react` | ^16.0.1 | 16.3.2 | 0 | minor |
| `@testing-library/user-event` | ^14.5.2 | 14.6.1 | 0 | patch |
| `@types/jest` | ^29.5.14 | 30.0.0 | 1 | MAJOR (uz Jest 30) |
| `@types/leaflet` | ^1.9.21 | 1.9.21 | 0 | current |
| `@types/node` | ^22.10.2 | 25.9.3 | 0 | minor (ostati na 22 za Node 20) |
| `@types/nodemailer` | ^7.0.11 | 8.0.1 | 1 | MAJOR |
| `@types/react` | ^18.3.14 | 19.2.17 | 1 | MAJOR (uz React) |
| `@types/react-dom` | ^18.3.5 | 19.2.3 | 1 | MAJOR (uz React) |
| `autoprefixer` | ^10.4.20 | 10.5.0 | 0 | patch |
| `dotenv` | ^16.4.7 | 17.4.2 | 1 | MAJOR |
| `eslint` | ^8.57.1 | 10.5.0 | 2 | MAJOR |
| `eslint-config-next` | ^14.2.35 | 16.2.9 | 2 | MAJOR (uz Next.js) |
| `eslint-plugin-jest` | ^28.9.0 | 29.15.2 | 0 | minor |
| `fast-check` | ^4.5.3 | 4.8.0 | 0 | minor |
| `jest` | ^29.7.0 | 30.4.2 | 1 | MAJOR |
| `jest-environment-jsdom` | ^29.7.0 | 30.4.2 | 1 | MAJOR |
| `postcss` | ^8.4.49 | 8.5.15 | 0 | patch |
| `tailwind-merge` | ^2.6.0 | 3.6.0 | 1 | MAJOR |
| `tailwindcss` | ^3.4.17 | 4.3.1 | 1 | MAJOR |
| `typescript` | ^5.7.2 | 6.0.3 | 1 | MAJOR |

---

## 2. Ključni lanci kompatibilnosti

### Next.js 14 → 15 → 16
- **Next 15:** prihvata React 18 i 19. Glavni breaking: `cookies()`, `headers()`, `draftMode()`, `searchParams`, `params` postaju async (await). Caching default-i promenjeni (fetch/GET route handler/navigacija se više ne kešuju automatski). `eslint-config-next` v15 traži ESLint ≥9.
- **Next 16 (production-ready od apr 2026):** **zahteva React 19 minimum**, sinhroni `cookies()`/`headers()` potpuno uklonjeni, `middleware.ts` → `proxy.ts` (novi runtime model), Turbopack default bundler, Node ≥20.9, TS ≥5.1.

### React 18 → 19
Kompatibilni sa React 19: `react-hook-form` 7.x, `@tanstack/react-query` 5.x, `next-intl` 4.x, svi `@radix-ui/*`, `next-themes` 0.4.x, `@testing-library/react` 16.x.
**Blokira:** `react-leaflet` v4 traži React 18, v5 traži React 19 — ne postoji verzija za oba. React upgrade tvrdo povlači react-leaflet upgrade.

### next-intl 3 → 4
Radi na Next 12–16 i React 16.8–19 (NE zahteva React 19 ni Next 15). Breaking: `NextIntlClientProvider` sada obavezan, `getRequestConfig` mora vraćati locale, deprecated navigacioni API-ji uklonjeni (`createNavigation`), ESM-only. Preporuka: uraditi pre Next 15/16.

### ESLint 8 → 9 → 10
ESLint 9 = flat config default; ESLint 10 = legacy `.eslintrc` potpuno uklonjen. `eslint-config-next` v16 traži ESLint ≥9. Potrebna migracija `.eslintrc.*` → `eslint.config.js` (preduslov za Next 15/16).

### Tailwind 3 → 4
Config seli iz `tailwind.config.js` u `@theme {}` CSS blokove; `@tailwind base/...` → `@import "tailwindcss"`; PostCSS plugin `tailwindcss` → `@tailwindcss/postcss`. Novi Oxide engine (2–5× brži build). **`tailwind-merge` mora na v3 istovremeno.** Ne zahteva Next 15.

### react-leaflet 4 → 5
v5 tvrdi peer `react ^19.0.0`. `leaflet` ostaje 1.9.4. Hard gate na React 19.

### zod 3 → 4
Breaking u type inference (`z.input`/`z.output`), `.passthrough()/.strict()/.strip()` deprecated, `zod/v4` + `zod/v3` compat sub-path. **Kaskada:** traži `@hookform/resolvers` ≥5.2.1 (znači 3→5 skok istovremeno).

### nodemailer 8 → 9
v9 forsira TLS validaciju sertifikata po defaultu. Za standardni SMTP relay (Resend itd.) nema uticaja. Pošto projekat koristi Resend, nodemailer je verovatno redundantan.

### jest 29 → 30
jsdom 21→26, neki `expect` alias-i uklonjeni, `--testPathPattern` → `--testPathPatterns`. `@types/jest` i `jest-environment-jsdom` moraju zajedno na 30. Node 20 OK.

---

## 3. Dva nivoa upgrade-a

### TIER A — sigurno odmah (React 18 + Next 14, nula konflikta, jedan PR)

| Paket | Cilj |
|---|---|
| `@radix-ui/react-dropdown-menu` | ^2.1.18 |
| `@radix-ui/react-slot` | ^1.3.0 |
| `@radix-ui/react-switch` | ^1.3.1 |
| `@radix-ui/react-tabs` | ^1.1.15 |
| `@supabase/supabase-js` | ^2.108.2 |
| `@supabase/ssr` | ^0.12.0 |
| `@tanstack/react-query` | ^5.101.0 |
| `cloudinary` | ^2.10.0 |
| `date-fns` | ^4.4.0 |
| `firebase` | ^12.15.0 |
| `next-themes` | ^0.4.6 |
| `react-hook-form` | ^7.79.0 |
| `@eslint/eslintrc` | ^3.3.5 |
| `@testing-library/jest-dom` | ^6.9.1 |
| `@testing-library/react` | ^16.3.2 |
| `@testing-library/user-event` | ^14.6.1 |
| `autoprefixer` | ^10.5.0 |
| `eslint-plugin-jest` | ^29.15.2 |
| `fast-check` | ^4.8.0 |
| `postcss` | ^8.5.15 |
| `@types/node` | ostati na ^22 (Node 20) |

**Izbaciti odmah:** `next-i18next` (ne koristi se), `@types/nodemailer` (ako se izbaci nodemailer).

**Standalone safe PR-ovi (svaki za sebe, kompatibilni sa Next 14 + React 18):**
- `@react-email/components` → 1.0.12 + `@react-email/render` → 2.0.9 — **0.0.x je deprecated, prioritet**
- `zod` → 4.4.3 + `@hookform/resolvers` → 5.4.0 (zajedno, uz codemod)
- `tailwindcss` → 4.3.1 + `tailwind-merge` → 3.6.0 (zajedno, uz upgrade tool + vizuelni regresioni test)
- `next-intl` → 4.13.0 (pre Next 15/16)
- `lucide-react` → 1.21.0 (proveriti imena ikonica)
- `jest` → 30.4.2 + `jest-environment-jsdom` → 30.4.2 + `@types/jest` → 30.0.0 (zajedno)
- `eslint` → 10.5.0 + `eslint-config-next` → 16.2.9 (tek posle flat-config migracije)
- `resend` → 6.14.0 (proveriti API promene)

### TIER B — veliki koordinisani potez (sve zajedno ili nikako)

| Paket | Iz → U | Dobijamo | Cena / rizik |
|---|---|---|---|
| `react` / `react-dom` | 18.3.1 → 19.2.7 | Actions API, bolji Suspense, future-proofing | suptilne promene u concurrent modu |
| `@types/react` / `@types/react-dom` | 18 → 19 | type tačnost | nizak, prati react |
| `next` | 14.2.35 → 16.2.9 | Turbopack default, eliminacija caching footgun-a, izlazak sa Next 14 | async API codemod svuda + `middleware.ts` → `proxy.ts` |
| `eslint-config-next` | 14 → 16 | ESLint 9/10 | traži flat-config migraciju |
| `react-leaflet` | 4.2.1 → 5.0.0 | React 19 kompatibilnost | mala API promena, hard gate na React 19 |
| `typescript` | 5.7.2 → 6.0.3 | brži cold build, ES2023 default | `types: []` default lomi auto-injection `@types/*` — eksplicitno deklarisati u tsconfig |

**Procena truda Tier B:** ~3–5 developerskih dana + temeljno testiranje booking/auth/i18n/admin flowa.

---

## 4. Eksplicitna upozorenja na konflikte

| Scenario | Konflikt |
|---|---|
| `react-leaflet` 5 + React 18 | tvrd peer error (traži ^19) |
| `next` 16 + React 18 | tvrd error (Next 16 traži React 19) |
| `eslint-config-next` 15/16 + ESLint 8 | tvrd peer error (traži ≥9) |
| `@types/react` 19 + React 18 | type-level konflikt |
| `zod` 4 bez `@hookform/resolvers` ≥5.2.1 | type greške na resolver granici |
| `tailwindcss` 4 bez `tailwind-merge` 3 | pogrešno merge-ovanje klasa |
| `next-intl` 4 + Next 16 bez `proxy.ts` | runtime routing fail (locale detekcija) |
| `jest` 30 bez `@types/jest`+`jest-environment-jsdom` 30 | type/jsdom mismatch |
| `typescript` 6 bez `"types": []` u tsconfig | build fail ("Cannot find name 'process'" itd.) |
| `@react-email/components` 1 bez `@react-email/render` 2 | API mismatch |

---

## 5. Redundantni / uklonjivi paketi

- **`next-i18next` — izbaciti odmah.** Projekat koristi `next-intl`; ovaj se ne koristi nigde, samo vuče `i18next`/`react-i18next`.
- **`nodemailer` — proveriti pa izbaciti.** Resend je primarni email provider. Ako nodemailer nije u živom flowu, izbaciti uz `@types/nodemailer`.
- **`firebase` — smanjiti.** Koristi se samo za Analytics, a vuče ceo SDK. Izolovati na `firebase/analytics` import ili zameniti Vercel Analytics.
- **`@react-email/components` 0.0.25 — hitan upgrade.** Cela 0.0.x serija je na npm-u označena "Package no longer supported" (nema security fixeva).

---

## Decision matrica

| Odluka | Trud | Kada |
|---|---|---|
| Tier A minor/patch bump-ovi | trivijalno | sada, jedan PR |
| Izbaciti `next-i18next` | trivijalno | sada |
| `@react-email/*` → 1.x/2.x | nizak | sada (deprecated) |
| `resend` → 6.x | nizak-srednji | uskoro (proveriti API) |
| `jest` → 30 klaster | srednji | uskoro |
| `next-intl` → 4.x | srednji | uskoro (radi na Next 14) |
| `zod` → 4 + `@hookform/resolvers` → 5 | srednji | uskoro (codemod) |
| `tailwindcss` → 4 + `tailwind-merge` → 3 | srednji | uskoro (upgrade tool) |
| ESLint → 9/10 flat config | srednji | pre Tier B |
| `lucide-react` → 1.x | nizak | uskoro |
| Tier B: React 19 + Next 16 + TS 6 + react-leaflet 5 | visok | planiran sprint, posle Tier A |
| Proveriti/izbaciti `nodemailer` | nizak | sada |
| `firebase` → analytics-only | nizak | sada |

---

## Izvori
- next-intl 4.0 release notes — https://next-intl.dev/blog/next-intl-4-0
- Next.js 16 upgrade guide — https://nextjs.org/docs/app/guides/upgrading/version-16
- Next.js 15 upgrade guide — https://nextjs.org/docs/app/guides/upgrading/version-15
- Tailwind CSS v4 upgrade guide — https://tailwindcss.com/docs/upgrade-guide
- Jest 30 release / migration — https://jestjs.io/docs/upgrading-to-jest30
- Zod v4 migration guide — https://zod.dev
- react-hook-form/resolvers — https://github.com/react-hook-form/resolvers
- Nodemailer v9.0.0 release — https://github.com/nodemailer/nodemailer/releases/tag/v9.0.0
- TypeScript 6.0 release notes — https://devblogs.microsoft.com/typescript/

---

## Tier A applied — 2026-06-18

Applied the Tier A dependency refresh while keeping React 18 and Next.js 14:

- Updated Tier A minor/patch-compatible packages in `package.json` / `package-lock.json`.
- Removed unused `next-i18next` from runtime dependencies.
- Removed unused `nodemailer` and `@types/nodemailer` after confirming no runtime imports.
- Kept major migrations out of this pass: React 19, Next 16, next-intl 4, Zod 4, Tailwind 4, Jest 30, ESLint flat-config, React Email major, Resend major.

Verification after the change:

- `npm test` — 18 suites passed, 367 tests passed.
- `npm run lint` — passed with no warnings or errors.
- `npm run build` — passed. Build emits a non-fatal Supabase Edge Runtime warning from `@supabase/supabase-js` runtime metadata detection; no runtime code changes were made for that warning in this Tier A pass.

Remaining audit items are the standalone safe PRs and Tier B migration listed above.
