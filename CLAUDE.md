# apartmani-jovca-next — CLAUDE.md

> # 🔴 PRE SVEGA pročitaj `READ-FIRST-SECURITY.md` (root)
> Git istorija je prepisana 2026-06-21 (uklonjeni procureli secrets). Ako imaš stari
> klon (pre 2026-06-21): NE guraj ga i NE pull-uj — kloniraj iznova. Detalji + obavezni
> koraci u `READ-FIRST-SECURITY.md`.

> ⚠️ **OBAVEZNO PRE RADA:** pročitaj `AGENTS.md` (root) — deljeni izvor istine za Claude Code i Codex.
> Na **kraju svake izmene** ažuriraj STATUS blok (✅ Završeno / 📋 Planirano) na vrhu `AGENTS.md`.

## Projekat

Sajt za kratkoročni najam apartmana (Čačak). Next.js 14 App Router + Supabase + Vercel.
Naslednik starog Astro sajta; DB ima stare slike, planirana migracija na Cloudinary.

## Komande

```bash
npm run dev          # localhost:3000
npm run build        # TypeScript build (ignoreBuildErrors: false — STRICTNO)
npm run lint         # ESLint (ignoreDuringBuilds: true u next.config.mjs)
npm run test         # Jest unit testovi
npm run test:watch   # Jest watch mode
npm start            # production server lokalno (posle build-a)

# Deploy: prod ide na Vercel preko `git push` (auto-deploy, fra1).
# `npm run deploy` (build && firebase deploy) je LEGACY — NE koristiti za prod.

# DB skripte (Node.js, ne Next.js API)
npm run db:check              # provjeri migracije
npm run db:migrate-content    # sinhronizuj content iz JSON-a
npm run db:migrate-i18n       # i18n migracija
npm run db:update-contact     # ažuriraj kontakt info

# Dodatne one-off skripte u scripts/ (populate-*, test-cloudinary-upload) — ručno, van npm-a.
```

## Arhitektura

### Routing

```
/[lang]/...          → javni sajt (next-intl: sr | en | de | it, default: sr, localePrefix: 'always')
/admin/...           → admin panel (nema i18n, Supabase auth)
/portal/...          → gostinski portal (magic link auth)
/api/...             → REST API rute (middleware ih PRESKACE u potpunosti)
```

**Kritično:** Middleware (`src/middleware.ts`) ne diže ruke od `/api/*` ruta — API rute nemaju middleware auth zaštitu. Svaka ruta mora sama da provjeri auth.

### Stack

| Sloj | Tehnologija |
|---|---|
| Framework | Next.js 14.2 App Router |
| DB + Auth | Supabase (PostgreSQL, RLS, SSR) |
| i18n | next-intl 3.26 |
| Slike | Cloudinary |
| Email | Resend + React Email templates |
| Hosting/Deploy | Vercel (prod, region fra1) — `git push` auto-deploy |
| Analitika | Firebase (legacy hosting; sad samo Analytics) |
| Notifikacije | WhatsApp Business API |
| Maps | Leaflet / react-leaflet |
| Forms | react-hook-form + Zod |
| Styling | Tailwind CSS + Radix UI + CVA |

### Supabase klijenti

```typescript
// src/lib/supabase.ts
supabase      // anon key — javni, client-side
supabaseAdmin // service role — SERVER ONLY, zaobilazi RLS
```

**Kritično:** `supabaseAdmin` zaobilazi sve RLS policy-je. Koristi SAMO u server-side kodevim gdje si već verifikovao auth.

**Project ref:** `aeyctgzddvxhpxymcetf` — ne brkati sa globalno zabranjenim `vjpghsjvekkmwweqtbxr` (drugi projekat).

### i18n pattern

```typescript
// Svi prevodi su u: public/locales/{sr,en,de,it}/common.json
// U server komponentama:
const { t } = await getTranslations({ locale, namespace: 'common' })
// U klijentskim komponentama:
const t = useTranslations('common')
```

Defaultni locale je `sr`. Ruta `/` → redirect na `/sr/`.

### Admin

- Auth: Supabase email+password → session cookie → `getSession()` u middleware
- Admin emailovi: `mtosic0450@gmail.com`, `apartmanijovca@gmail.com`
- RLS policy: **samo** `mtosic0450@gmail.com` je u `02_RLS_POLICIES_COMPLETE.sql` — `apartmanijovca@gmail.com` nije pokriven RLS-om
- Admin panel nema sopstvenu i18n (srpski hardkodiran)

### Rate limiting

Booking API koristi `check_booking_rate_limit` Supabase RPC. Ako DB nije dostupan → **fails open** (`allowed: true`). Ostale rute (contact, email, whatsapp) nemaju rate limiting.

## Ključni fajlovi

```
src/middleware.ts                    — i18n routing + admin auth redirect
src/lib/supabase.ts                  — dva Supabase klijenta
src/lib/validations/booking.ts       — Zod schema za rezervacije (dobra)
src/lib/validations/content.ts       — sanitizacija CMS content-a
src/lib/rate-limiting/service.ts     — rate limit (fails open na grešci!)
src/lib/bookings/service.ts          — booking CRUD logika
src/lib/email/                       — React Email templates
supabase/migrations/                 — SQL migracije (kronološki)
public/locales/                      — JSON prevodi (sr/en/de/it)
```

## Env varijable

```bash
NEXT_PUBLIC_SUPABASE_URL             # obavezno
NEXT_PUBLIC_SUPABASE_ANON_KEY        # obavezno, javno
SUPABASE_SERVICE_ROLE_KEY            # tajno, server-only
NEXT_SERVICE_ROLE_KEY                # alternativno ime (legacy)
CLOUDINARY_CLOUD_NAME                # slike
CLOUDINARY_API_KEY
CLOUDINARY_API_SECRET
RESEND_API_KEY                       # email (provider: Resend)
RESEND_WEBHOOK_SECRET                # webhook verifikacija (opcionalno — bez toga skip)
BREVO_API_KEY                        # email (provider: Brevo — alternativa Resend-u)
EMAIL_PROVIDER                       # 'brevo' | 'resend' (opciono; bez toga auto: Brevo ako ima ključ, pa Resend)
EMAIL_FROM                           # sender adresa — MORA biti verifikovana kod aktivnog providera
ADMIN_EMAILS                         # TODO: premjestiti emailove ovde iz koda
```

> Email: vidi `docs/BREVO_SETUP.md`. Provider bira `getEmailProvider()` u `src/lib/resend.ts`; `src/lib/email/brevo.ts` šalje preko Brevo REST API-ja.

## Gotchas

- **`getSession()` vs `getUser()`**: `getSession()` ne verifikuje JWT potpis (može se lažirati cookie-em). Koristi `getUser()` za pravi auth check.
- **Preview URL redirect**: Middleware preusmjerava `*milans-projects*` i `*-git-*` hostnameove na produkciju (308). Testiranje u preview okruženju ne radi kako se očekuje.
- **`eslint.ignoreDuringBuilds: true`** ali TypeScript build je STRICTAN — `npm run lint` zasebno.
- **`removeConsole: true`** u produkciji — `console.log` debug logovi se uklanjaju u buildu.
- **Service role key fallback**: Ako env var nedostaje, pada na anon key tiho. Provjeri na startu.
- **Cloudinary `resource_type: 'auto'`**: Prihvata bilo koji tip fajla — upload endpoint mora biti zaštićen autom.
- **Booking UUID u emailovima**: UUID rezervacije curiti u email konfirmacijama; `/api/booking/[id]` mora imati auth provjeru.
- **RLS pokriva samo jedan admin email** u migracijama — `apartmanijovca@gmail.com` mora biti dodan ručno ili kroz `ADMIN_EMAILS` pattern.
- **Deploy = Vercel, ne Firebase**: prod je Vercel (`git push`). `npm run deploy` (firebase) je legacy iz Astro/Firebase ere — ne koristiti.
- **Dangling cron**: `vercel.json` definiše dnevni cron `/api/cron/cleanup`, ali ruta ne postoji — cron tiho ne radi (napravi rutu ili ukloni cron).

## Sigurnost — kritično

Pročitaj `security-profile.md` u root-u projekta (audit + re-audit 2026-06-14): **26 nalaza** — 5 CRITICAL / 7 HIGH / 9 MEDIUM / 5 LOW (+ npm audit: 2 HIGH transitive deps). Sve `/api/admin/*` rute su bez auth.
Prioritet #1: `src/lib/auth/require-admin.ts` helper + dodati na sve `/api/admin/*` rute.
