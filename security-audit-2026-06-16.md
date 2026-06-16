# Security Audit — Apartmani Jovča (revizija celog projekta)

**Datum:** 2026-06-16
**Metod:** 6 paralelnih Sonnet 4.6 agenata + lična verifikacija (Opus) najtežih nalaza
**Obuhvat:** sve API rute, middleware/sesije, RLS/Supabase, input validacija/XSS, secrets/deps/config, frontend/testovi/GDPR
**Status:** 🔴 NIJE production-safe — 1 hitan incident (izložene tajne) + više CRITICAL rupa bez auth

> Ovo je nezavisna re-revizija u odnosu na `security-profile.md` (2026-06-14). Verifikovano je **trenutno stanje koda**, ne stari nalazi. Bitna promena: svih 15 `/api/admin/*` ruta je u međuvremenu zaštićeno (`requireAdmin`) — stari C1 je REŠEN. Pojavili su se novi/preostali kritični nalazi (portal rute, booking rute, upload, izložene tajne).

---

## 0. HITNO — Izložene tajne u JAVNOM git repou (P0, incident)

**Verifikovano lično.** GitHub repo `UnlimitedEdition/apartmanijovca` je **`private: false` (JAVAN)**. U git istoriji stoje žive tajne:

| Tajna | Gde | Status |
|---|---|---|
| Supabase **`service_role`** JWT (pun pristup bazi, zaobilazi RLS) | commit `88f2ff9` (`VERCEL_DEPLOYMENT.md`) | role claim potvrđen = `service_role` |
| Supabase URL + anon/publishable key | commit `88f2ff9` | izložen |
| Firebase API key `FIREBASE_KEY_REMOVED…` | commit `0bedb10` (`src/app/firebase.js`) | izložen (commit poruka `e78d7b0` priznaje izloženost) |
| ImgBB key `515c43cd…`, PostImages key `257f64d4…` | commit `88f2ff9` | izložen |

Radni fajl je redaktovan i `.env*` je u `.gitignore` (dobro), ALI istorija javnog repo-a je svima dostupna (`git show 88f2ff9`).

**Akcija (samo ti možeš, traži dashboard):**
1. **Rotirati Supabase service_role + anon key ODMAH** (Supabase dashboard → Settings → API → Reset). Project ref `aeyctgzddvxhpxymcetf`.
2. Rotirati Firebase API key i ImgBB/PostImages ključeve.
3. Razmotriti repo → private dok se ne sanira, ili purge istorije (git filter-repo) + force-push.
4. Proveriti Supabase logove na zloupotrebu od datuma izlaganja (2026-02-26).

---

## 1. CRITICAL — kod bez auth / IDOR (live exploitable)

| ID | Ruta / fajl | Problem | PoC |
|---|---|---|---|
| C1 | `/api/portal/profile` GET/PUT (`portal/profile/route.ts:12,62`) | **Nema auth**, service role klijent. GET vraća PII bilo kog gosta po `?email=`; PUT menja ime/telefon/državu bilo kog gosta | `GET /api/portal/profile?email=zrtva@x.com` |
| C2 | `/api/portal/bookings` GET (`portal/bookings/route.ts:13-106`) | Lažna auth — proverava se samo **prisustvo** `sb-access-token` cookie-a ILI `Authorization` headera (bilo koja vrednost prolazi), pa se identitet uzima iz `?email=`. Service role | login kao bilo ko → `?email=zrtva` → sve njene rezervacije + IP/fingerprint |
| C3 | `/api/upload` POST (`api/upload/route.ts`) | **Nema auth**, `folder` je user-controlled, Cloudinary `resource_type:'auto'` (svaki tip fajla) | `curl -F file=@x -F folder=… /api/upload` |
| C4 | `/api/booking/[id]` GET (`booking/[id]/route.ts:23-66`) | **Nema auth** — vraća guestName/email/phone po UUID-u. UUID curi u email konfirmacijama | `GET /api/booking/<uuid>` |
| C5 | `booking_rate_limits` tabela (`20260222000002…sql:13`) | **RLS NIJE uključen** — anon preko REST API čita IP/email/fingerprint svih, i može DELETE svoje zapise → potpun bypass rate limita | direktan PostgREST poziv |
| C6 | PII u logovima (`api/booking/route.ts:102`) | `console.log(JSON.stringify(body))` loguje ime/email/telefon/fingerprint/device u Vercel Logs — GDPR | svaka rezervacija |

**Napomena C4 (PUT/PATCH/DELETE):** mutacije `/api/booking/[id]` koriste anon klijent koji *bi* trebalo da padne na RLS-u za anon, ali nema eksplicitne auth provere — treba potvrditi RLS pokrivenost UPDATE/DELETE i u svakom slučaju dodati `requireAdmin`. `?hard=true` poziva trajno brisanje.

---

## 2. HIGH

| ID | Lokacija | Problem |
|---|---|---|
| H1 | `/api/email` (`api/email/route.ts`) | Nema auth → spam/phishing kroz Resend nalog, trošenje kvote |
| H2 | `/api/whatsapp` POST send (`whatsapp/route.ts`) | Send put bez auth; **trenutno mrtav** zbog duplog `await request.json()` (linije 45 i 86 → 500). Pri „fixu" lako se otvori spam put bez auth-a |
| H3 | `api/gallery/route.ts:23` (+ ~9 admin ruta) | Sirov `error.message` vraćen klijentu — curi Supabase/Cloudinary interne detalje. `/api/gallery` je **javan** |
| H4 | `AdminLoginForm.tsx:14-16` | Admin emailovi hardkodovani u **client bundle** (`'use client'`) → enumeracija/phishing. Plus `console.log` emailova u browseru |
| H5 | `admin/page.tsx:65` | `{error.stack}` renderovan u HTML admin panela — curenje putanja/struktura |
| H6 | `portal/auth/callback/route.ts:10` | Open redirect — `?next=` bez validacije (`//evil.com`) |
| H7 | `gallery` tabela | **RLS nije uključen** ni u jednoj migraciji |
| H8 | `20260301_create_email_events_table.sql:25` | Admin policy pokriva **samo** `apartmanijovca@gmail.com`; sve ostale tabele pokrivaju **samo** `mtosic0450@gmail.com` → drugi admin nepokriven RLS-om |
| H9 | `vercel.json` cron + nepostojeća ruta | Dangling cron `/api/cron/cleanup` (ruta ne postoji) → **nema data retention**, PII/IP se čuvaju zauvek (GDPR čl. 5(1)(e)) |
| H10 | `src/lib/security/fingerprint.ts:62-92` | Canvas+WebGL fingerprinting bez granularnog GDPR pristanka po svrsi |
| H11 | npm deps | `next@14.2.18` — 2 **CRITICAL** CVE (Image Optimizer DoS, RSC cache poisoning); `i18next-fs-backend` path traversal; firebase tranzitivno (`protobufjs`, `ws`); `lodash` |
| H12 | `/api/contact` | Nema rate limit, nema length limit, nema validaciju telefona; service role za javni insert |

---

## 3. MEDIUM

- **`getSession()` umesto `getUser()`** (ne verifikuje JWT potpis): `middleware.ts:62`, `admin/page.tsx:22`, `portal/page.tsx:35`. Cookie se može lažirati za pristup admin/portal UI-ju (API je zaštićen).
- **CORS `Access-Control-Allow-Origin: *`** na svim `/api/*` (`vercel.json`). Nema **CSP** headera.
- **Resend webhook** preskače verifikaciju potpisa ako `RESEND_WEBHOOK_SECRET` nedostaje (`webhooks/resend/route.ts`); `timingSafeEqual` može baciti `RangeError` na različitim dužinama.
- **supabaseAdmin** tihi fallback na anon key / `null` ako env var nedostaje (`lib/supabase.ts:5`) → tihi gubitak admin operacija i rate limita.
- **Rate limiting fails open** u 3 grane (`rate-limiting/service.ts:28,42,62`) — DoS na DB gasi rate limit. `recordSuccessfulBooking` briše sve limite po identifikatoru (reset-after-success).
- **availability** (`admin/availability/route.ts`): nema UUID/date validaciju, nema gornju granicu `limit`.
- **translate** (`admin/translate/route.ts`): nema size limit na `text`, `targetLangs` nije validiran kao niz/enum.
- **analytics** (`api/analytics/route.ts`): neograničen JSONB, javni insert (namerno, ali bez limita).
- **GDPR consent**: `consentTimestamp` generiše server (`booking/route.ts:179`), nije granularan po svrsi.
- **Portal signup** (`portal/login/page.tsx:128`): `Math.random()` lozinka, client-side, bez provere postojeće rezervacije.
- **Dve konfliktne migracije** za double-booking constraint (`01_SCHEMA_COMPLETE.sql:145` vs `20260213000000_initial_schema.sql:143`) — različite kolone/uslovi; nejasno koja je u produkciji.
- **Build krhkost**: module-level `createClient` → `next build` pada bez env vara; nedostaje `export const dynamic` na par admin ruta.

---

## 4. LOW

- Debug `console.log` sa PII/booking ID u `admin/bookings/[id]/route.ts:156` i drugde.
- `tel:`/`mailto:` href sa nesanitizovanim telefonom iz DB u admin panelu (slaba eksploatabilnost).
- `createJsonLdScript` ne escapuje `</script>` (trenutno nekorišćen).
- Nema Right-to-erasure (GDPR čl. 17) endpointa.
- `GET /api/webhooks/resend` health-check info disclosure.
- Privacy stranica `/[locale]/privacy` — proveriti da postoji (link u GDPR baneru).

---

## 5. DOBRO / već rešeno (da se zna šta NE dirati)

- ✅ Svih **15 `/api/admin/*` ruta** zaštićeno `requireAdmin()` (helper koristi `getUser()`, pokriva oba admin emaila). Stari C1 REŠEN.
- ✅ `requireAdmin` helper ispravan (`lib/auth/require-admin.ts`).
- ✅ Booking Zod validacija jaka (disposable email block, max 30 dana, consent).
- ✅ Double-booking **DB-level GIST constraint** postoji (`idx_bookings_no_overlap`) — race je pokriven na nivou baze.
- ✅ **354/354 testova prolaze**, TypeScript build prolazi (sa env varima).
- ✅ `.env*` u `.gitignore`, radno stablo čisto od živih tajni.
- ✅ React Email templates dobro strukturirani.

---

## 6. Predlog redosleda popravki

**P0 (ti, dashboard — odmah):** rotacija svih izloženih ključeva + repo→private/purge istorije.

**Batch A — auth rupe (kod, na branču):** C1 portal/profile, C2 portal/bookings, C4 booking/[id], C3 upload, H1 email, H2 whatsapp send (+ dupli json), H6 open redirect. Pattern: `requireAdmin()` za admin akcije, `getUser()` identitet za portal (nikad `?email=`).

**Batch B — DB/RLS (migracije):** C5 RLS na `booking_rate_limits`, H7 RLS na `gallery`, H8 multi-admin policy, H9 cron cleanup ruta (data retention).

**Batch C — hardening:** H3 generičke greške, H4/H5 client leak/stack, getSession→getUser, CORS allowlist + CSP, webhook fail-closed, rate-limit fail-closed, input limiti (availability/translate/contact/analytics).

**Batch D — deps & GDPR:** `next` update (CRITICAL CVE), `npm audit fix`, granularni consent, retention.
