# Security Profile — Apartmani Jovča

**Audit datum:** 2026-06-14
**Auditor:** Claude (Sonnet 4.6) via `/bezbednost` skill
**Re-audit:** 2026-06-14 — Claude (Opus 4.8): svih 20 originalnih nalaza re-verifikovano (svi stoje), +6 novih (H7, M6, M7, M8, M9, L5) + npm audit
**Status:** KRITIČNO — nije production-safe do fix-a C1-C5
**Ukupno:** 26 nalaza — 5 CRITICAL / 7 HIGH / 9 MEDIUM / 5 LOW (+ dep vulns: 2 HIGH transitive)

---

## Attack Surface Map

### API rute

| Ruta | Metode | Auth | Status |
|---|---|---|---|
| `/api/admin/bookings` | GET, POST | Nema | KRITIČNO |
| `/api/admin/bookings/[id]` | GET, PATCH | Nema | KRITIČNO |
| `/api/admin/apartments` | GET, POST | Nema | KRITIČNO |
| `/api/admin/apartments/[id]` | GET, PUT, DELETE | Nema | KRITIČNO |
| `/api/admin/content` | GET, POST, PUT, DELETE | Nema | KRITIČNO |
| `/api/admin/messages` | GET | Nema | KRITIČNO |
| `/api/admin/messages/[id]` | GET, PUT, DELETE | Nema | KRITIČNO |
| `/api/admin/gallery` | GET, POST | Nema | KRITIČNO |
| `/api/admin/gallery/[id]` | GET, PUT, DELETE | Nema | KRITIČNO |
| `/api/admin/gallery/upload` | POST | Nema | KRITIČNO |
| `/api/admin/setup` | POST | Nema | VISOKO |
| `/api/admin/stats` | GET | Nema | KRITIČNO |
| `/api/admin/analytics` | GET | Nema | KRITIČNO |
| `/api/admin/availability` | GET, PUT | Nema | KRITIČNO |
| `/api/admin/translate` | POST | Nema | KRITIČNO |
| `/api/booking` | GET, POST | GET: Nema, POST: rate limit | KRITIČNO (GET) |
| `/api/booking/[id]` | GET, PUT, DELETE | Nema | KRITIČNO |
| `/api/booking/check` | GET | Javno (availability) | OK |
| `/api/availability` | GET | Javno (availability) | OK |
| `/api/portal/bookings` | GET | Broken | KRITIČNO |
| `/api/portal/profile` | GET, PUT | Broken | KRITIČNO |
| `/api/portal/login` | POST | Javno (initiates magic link) | OK |
| `/api/upload` | POST | Nema | VISOKO |
| `/api/email` | POST | Nema | VISOKO |
| `/api/whatsapp` | GET, POST | GET: Meta verify (OK), POST send: Nema | VISOKO |
| `/api/contact` | POST | Rate limit missing | SREDNJE |
| `/api/analytics` | POST | Javno (intentional) | OK |
| `/api/gallery` | GET | Javno (intentional) | OK |
| `/api/webhooks/resend` | GET, POST | Conditional sig verify | VISOKO |
| `/portal/auth/callback` | GET | Supabase OTP (OK, ali open redirect) | VISOKO |

### Input točke

- Booking forma: Zod validacija + rate limit — DOBRO
- Contact forma: Zod validacija, nema rate limit — OSREDNJE
- Admin panel API: service role key, bez auth — KRITIČNO
- Cloudinary upload: bez auth, bez file type check — KRITIČNO
- Resend webhook: bez sig verify ako env var nedostaje — VISOKO
- WhatsApp send: bez auth — VISOKO

---

## Findings

### CRITICAL

#### C1. Sve `/api/admin/*` rute bez autentikacije
**Fajlovi:** `src/app/api/admin/**/*.ts` (13+ ruta)
**Problem:** Middleware namerno preskače sve `/api/*` rute (middleware.ts:26). Nijedna admin ruta nema auth provjeru u kodu. CORS wildcard iz `vercel.json` omogućava pozive iz bilo kojeg browsera.

**Uticaj:** Bilo ko može čitati sve rezervacije (PII), mijenjati apartmane, brisati content, uploadovati fajlove.

**Fix — napraviti centralni helper `src/lib/auth/require-admin.ts`:**
```typescript
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

const ADMIN_EMAILS = (process.env.ADMIN_EMAILS || 'mtosic0450@gmail.com,apartmanijovca@gmail.com')
  .split(',').map(s => s.trim())

export async function requireAdmin() {
  const cookieStore = cookies()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { get: (n) => cookieStore.get(n)?.value, set: () => {}, remove: () => {} } }
  )
  const { data: { user } } = await supabase.auth.getUser()  // verifikuje JWT potpis
  if (!user || !ADMIN_EMAILS.includes(user.email || '')) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  return null
}
```

Dodat na svaku admin rutu:
```typescript
export async function GET() {
  const denied = await requireAdmin(); if (denied) return denied
  // ...
}
```

---

#### C2. `/api/portal/bookings` — IDOR + masivni PII leak
**Fajl:** `src/app/api/portal/bookings/route.ts:13-107`
**Problem:** Email dolazi iz `?email=` query parametra, ne iz JWT-a. Auth check se preskače ako postoji `sb-access-token` cookie (ne provjerava se da li je taj token za dati email).

**Napad:** `GET /api/portal/bookings?email=zrtva@gmail.com` sa bilo kojim cookie-em → sve rezervacije žrtve.

**Fix:**
```typescript
const { data: { user } } = await supabase.auth.getUser()
if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
const guestEmail = user.email  // NE iz URL-a
```

---

#### C3. `/api/portal/profile` GET/PUT — IDOR za sve goste
**Fajl:** `src/app/api/portal/profile/route.ts:13-109`
**Problem:** Identičan pattern kao C2. Email iz body/query, ne iz auth tokena. PUT bez auth → mijenja podatke bilo kojeg gosta.

**Fix:** Isti princip kao C2 — email iz `auth.getUser()`.

---

#### C4. `/api/booking/[id]` PUT/DELETE bez auth
**Fajl:** `src/app/api/booking/[id]/route.ts`
**Problem:** UUID curiti u email konfirmacijama. Ko ima UUID može DELETE rezervacije (i `?hard=true` za trajno brisanje) ili mijenjati status/datume.

**Fix:** Admin mutacije → `requireAdmin()`. Javni GET zahtijeva vlasništvo: email iz `auth.getUser()` mora matchovati booking.guest.email.

---

#### C5. `GET /api/booking` — lista svih rezervacija javno
**Fajl:** `src/app/api/booking/route.ts:27-72`
**Problem:** GET bez filtera vraća sve rezervacije sa PII. GDPR breach.

**Fix:** `requireAdmin()` na GET handler ili ukloniti endpoint.

---

### HIGH

#### H1. `/api/upload` — javni Cloudinary upload
**Fajl:** `src/app/api/upload/route.ts`
**Problem:** Nema auth, nema MIME provjere, nema veličinskog limita, `folder` je user-controlled. Cloudinary `resource_type: 'auto'` prihvata bilo koji tip fajla.

**Fix:**
```typescript
const denied = await requireAdmin(); if (denied) return denied
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/avif']
if (!ALLOWED_TYPES.includes(file.type)) return NextResponse.json({ error: 'Invalid type' }, { status: 400 })
if (file.size > 5 * 1024 * 1024) return NextResponse.json({ error: 'Too large' }, { status: 413 })
const folder = 'apartmani-jovca'  // hardkodovan, NE iz formData
```

---

#### H2. `/api/email` — javni Resend send
**Fajl:** `src/app/api/email/route.ts`
**Problem:** Nema auth. Spam, phishing kroz vaš Resend nalog, DDoS kvote.

**Fix:** `requireAdmin()`. Email-ovi za booking confirmation treba da idu interno iz `bookings/service.ts`.

---

#### H3. `/api/whatsapp` POST — javni WhatsApp send
**Fajl:** `src/app/api/whatsapp/route.ts`
**Problem:** `action=send` bez auth. Spam kroz WhatsApp Business nalog.

**Fix:** `requireAdmin()` na send path. GET (Meta webhook verify) ostaje javan.

---

#### H4. `/api/admin/setup` — javni DB reset
**Fajl:** `src/app/api/admin/setup/route.ts`
**Problem:** Bez auth, service role key. POST prepiše sav content u DB iz JSON fajlova.

**Fix:** Pokriveno C1 (`requireAdmin()`).

---

#### H5. Open redirect u portal auth callback
**Fajl:** `src/app/portal/auth/callback/route.ts:7-46`
**Problem:** `next` parametar ide direktno u redirect. `?next=//evil.com` → redirect na externi sajt sa validnim sessionom.

**Fix:**
```typescript
const next = searchParams.get('next') ?? '/portal'
const safeNext = next.startsWith('/') && !next.startsWith('//') ? next : '/portal'
return NextResponse.redirect(`${origin}${safeNext}`)
```

---

#### H6. PII u console logs (GDPR)
**Fajl:** `src/app/api/booking/route.ts:102, 162-163, 198`
**Problem:** `console.log` loguje pun request body sa imenom, emailom, telefonom, IP-om, fingerprintom gosta u Vercel Logs.

**Fix:**
```typescript
console.log('[Booking API] Received body:', {
  apartmentId: body.apartmentId,
  checkIn: body.checkIn,
  checkOut: body.checkOut,
  guest: '[redacted]'
})
```

---

#### H7. `/api/whatsapp` — dupli `request.json()` lomi send path (funkcionalni bug, fail-closed)
**Fajl:** `src/app/api/whatsapp/route.ts:45, 86`
**Problem:** Webhook grana pozove `await request.json()` (linija 45), pa send grana pokuša drugi `await request.json()` (linija 86) na već konzumiranom stream-u → throw "body already used". Send-message put je time **mrtav** — nikad se ne izvrši.
**Sigurnosni aspekt:** Trenutno fail-CLOSED (H3 spam put nije dostižan kroz JSON content-type — dobra strana slučajno). ALI ruta sa service role pristupom je u polomljenom stanju; pri "fixu" H3 lako se i ovaj bug nesvjesno "popravi" i otvori spam put bez auth-a ako se H3 ne odradi do kraja.
**Fix:** Jedan `const body = await request.json()` na vrhu try-a, pa grananje po `body.object`/`body.action`. Plus `requireAdmin()` na send granu (H3).

---

### MEDIUM

#### M1. CORS wildcard na svim API rutama
**Fajl:** `vercel.json:48-50`
**Problem:** `Access-Control-Allow-Origin: *` — cross-site pozivi iz browsera.

**Fix:** `"value": "https://apartmanijovca.rs"`

---

#### M2. Resend webhook — conditional signature verify
**Fajl:** `src/app/api/webhooks/resend/route.ts:100-112`
**Problem:** Ako `RESEND_WEBHOOK_SECRET` env var nedostaje → verifikacija se preskače.

**Fix:**
```typescript
if (!webhookSecret) return NextResponse.json({ error: 'Webhook not configured' }, { status: 503 })
```
Plus: `timingSafeEqual` baca `RangeError` ako buffers nisu iste dužine — dodati provjeru dužine prije poziva.

---

#### M3. `sanitizeContent` ne escapuje HTML
**Fajl:** `src/lib/validations/content.ts:133-149`
**Problem:** Script tagovi prolaze neescapovani u DB. Trenutno nema unsafe HTML render u app-u, ali potencijalan problem pri budućim promjenama.

**Fix:** Dodati strip opasnih tagova (`isomorphic-dompurify`) ili whitelist allowed tags.

---

#### M4. `/api/contact` bez rate limita
**Fajl:** `src/app/api/contact/route.ts`
**Problem:** Nema rate limiting → spam u `messages` tabelu.

**Fix:** Reuse `check_booking_rate_limit` RPC pattern ili hCaptcha na formi.

---

#### M5. Admin email hardkodovan u client bundle
**Fajlovi:** `src/app/admin/login/AdminLoginForm.tsx:14-17`, `src/app/admin/page.tsx:30-33`
**Problem:** Admin emailovi vidljivi u JS bundle-u → ciljani phishing.

**Fix:** `ADMIN_EMAILS` env var, čitati samo server-side.

---

#### M6. Info-disclosure — raw `error.message` vraćen klijentu (6 ruta)
**Fajlovi:** `/api/admin/translate`, `/api/admin/analytics`, `/api/admin/gallery` (GET/POST), `/api/admin/gallery/[id]` (DELETE/PATCH), `/api/admin/gallery/upload`, `/api/gallery`
**Problem:** `return NextResponse.json({ error: error.message }, { status: 500 })` curi interne detalje — SQL constraint/column imena, Cloudinary error format, library naming. Uz C1 (nema auth) → recon trivijalan.
**Fix:**
```typescript
console.error('[route] error:', error)  // server-side, lokalno
return NextResponse.json({ error: 'Internal error' }, { status: 500 })
```

---

#### M7. `/api/admin/availability` — bez UUID validacije (+ bez auth, C1)
**Fajl:** `src/app/api/admin/availability/route.ts`
**Problem:** DELETE prima `id` query param bez validacije; POST/PUT primaju `apartmentId`/`bookingId` bez šeme. Pgsql parametrizacija sprječava SQL injection, ali nevalidiran UUID može poremetiti integritet (pogrešan slot označen zauzet/slobodan).
**Fix:** Zod schema + `z.string().uuid()` na svaki path/query/body parametar. Plus `requireAdmin()` (C1).

---

#### M8. `/api/admin/translate` — bez input size/shape limita
**Fajl:** `src/app/api/admin/translate/route.ts`
**Problem:** `text` može biti proizvoljno velik; `targetLangs` nije validiran kao niz dozvoljenih jezika. Jedan poziv može iscrpsti translation provider kvotu (DoS po novcu).
**Fix:** `z.string().max(5000)` za text + `z.array(z.enum(['sr','en','de','it'])).max(4)` za jezike.

---

#### M9. `/api/admin/stats` — dev priznao auth gap u komentaru
**Fajl:** `src/app/api/admin/stats/route.ts`
**Problem:** Eksplicitan komentar u kodu: `// In production, you would verify admin auth here / For now, we'll allow access but you should add proper auth check`. Dio C1 grupe, izdvojeno jer je dev svjestan — prioritetno.
**Fix:** `requireAdmin()` (C1). Ukloniti komentar nakon fix-a.

---

### LOW

#### L1. Service role key tihi fallback na anon key
**Fajlovi:** sve `/api/admin/*` rute — `|| supabaseAnonKey` fallback
**Fix:** Throw na startu ako key nedostaje, ne fallback.

---

#### L2. `getSession()` umjesto `getUser()` u admin auth-u
**Fajlovi:** `src/app/admin/page.tsx:22`, `src/middleware.ts:62`
**Problem:** `getSession()` ne verifikuje JWT — sesija se može lažirati cookie manipulacijom.
**Fix:** Zamijeniti sa `supabase.auth.getUser()`.

---

#### L3. Error stack u admin UI
**Fajl:** `src/app/admin/page.tsx:65-67`
**Problem:** `{error.stack}` u browser-u — curenje internih putanja i library verzija.
**Fix:** Ukloniti `error.stack` iz render outputa.

---

#### L4. `/api/analytics` neograničen `event_data`
**Fajl:** `src/app/api/analytics/route.ts:34-49`
**Problem:** JSONB bez veličinskog limita → DB bloating.
**Fix:** `if (JSON.stringify(event_data).length > 4000) return 400`

---

#### L5. RLS policy pokriva samo jedan admin email
**Fajl:** `supabase/migrations/02_RLS_POLICIES_COMPLETE.sql`
**Problem:** Svaki "Admin can manage X" policy je hardkodovan `auth.jwt() ->> 'email' = 'mtosic0450@gmail.com'`. `apartmanijovca@gmail.com` radi SAMO zato što sve admin rute idu kroz `supabaseAdmin` (service role, zaobilazi RLS). Pravilan auth refactor (kad se odustane od service role) ostavlja drugog admina bez ikakvog pristupa kroz RLS.
**Fix:** `auth.jwt() ->> 'email' IN ('mtosic0450@gmail.com', 'apartmanijovca@gmail.com')` u svakom admin policy-ju, ili tabela `admin_users(email)` + `EXISTS` subquery.

---

## Dependency vulnerabilities (npm audit — 2026-06-14)

| Paket | Severity | Putanja | Napomena / Fix |
|---|---|---|---|
| `@grpc/grpc-js` <1.9.16 | HIGH | transitive (Firebase) | DoS via malformed request — `npm audit fix` |
| `@next/eslint-plugin-next` | HIGH | dev-only (transitive `glob`) | zahtijeva `eslint-config-next` v16 (major bump) |
| `@protobufjs/utf8` | moderate | transitive | overlong UTF-8 decode — `npm audit fix` |
| `prismjs` (via `@react-email/code-block`) | moderate | transitive | `@react-email/components` v1 (major bump) |
| `ajv` <6.14, `brace-expansion` | moderate | transitive | ReDoS — `npm audit fix` |

**Napomena:** HIGH-ovi su transitivni preko Firebase-a (legacy per CLAUDE.md) i react-email. `npm audit fix` rješava većinu; `eslint-config-next` i `react-email` traže major bump — testirati build prije commit-a.

---

## Known-good patterns

| Pattern | Lokacija | Napomena |
|---|---|---|
| Zod booking validacija | `src/lib/validations/booking.ts` | Dobro — disposable email block, max 30 dana |
| Rate limiting booking | `src/lib/rate-limiting/service.ts` | Dobra ideja, fails open — fixovati |
| React Email templates | `src/lib/email/` | Dobro strukturirani |
| RLS policy na tabelama | `supabase/migrations/02_RLS_POLICIES_COMPLETE.sql` | Striktne policy, ali samo 1 admin email (vidi L5) |
| GDPR consent na booking | `src/lib/validations/booking.ts` | Consent zapis — dobro |
| Admin server component check | `src/app/admin/page.tsx` | Dobra arhitektura, loš auth metod |

---

## Prioritetna lista fix-ova

**Odmah (blocker za prod):**
1. Napraviti `src/lib/auth/require-admin.ts`
2. `requireAdmin()` na svih 13+ `/api/admin/*` ruta
3. Fix C2/C3 — email iz `auth.getUser()`, ne iz query/body
4. Fix H5 — open redirect u portal callback

**Ova sedmica:**
5. Fix C4/C5 booking endpoints
6. Fix H1 upload auth + MIME + size
7. Fix H2/H3 email/whatsapp auth
8. Fix H6 PII redact u logovima

**Sljedeća sedmica:**
9. M1 CORS allowlist
10. M2 Webhook fail-fast
11. M4/M5 contact rate limit + admin emails u env
12. M6 generic error responses (6 ruta — ne vraćaj `error.message`)
13. M7 UUID validacija na availability
14. M8 translate input limit (size + jezici)
15. L1-L5 manji fix-ovi (L5: RLS multi-admin policy)
16. H7 whatsapp dupli `json()` (uz H3 fix, da se ne otvori spam put)
17. `npm audit fix` (provjeriti `eslint-config-next` major bump build)

---

## Projektna sigurnosna pravila

- **API ruta = mora sama auth-ovati.** Middleware ne pokriva `/api/*`.
- **supabaseAdmin = service role = zaobilazi RLS.** Koristiti SAMO nakon provjere auth-a.
- **`auth.getUser()` ne `getSession()`** za pravi JWT verify.
- **ADMIN_EMAILS** — env var, nikad u client bundle.
- **Cloudinary upload** — samo iz zaštićenih endpointa, folder server-side hardkodovan.
- **PII u logovima = GDPR prekršaj.** Redact ime/email/telefon/IP.

---

## Prethodni sigurnosni incidenti

**Incident (datum: nepoznat, dokumentovano u SECURITY_INCIDENT_RESPONSE.md):**
Firebase API ključevi i Supabase service role key izloženi na GitHub-u.
Status: Sanirano — ključevi rotovani, fajlovi gitignoreani.
Supabase project ID: `aeyctgzddvxhpxymcetf`
