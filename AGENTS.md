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
