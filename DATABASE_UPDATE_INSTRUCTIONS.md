# Uputstvo za Ažuriranje Kontakt Informacija u Bazi

## 📋 Šta ova migracija radi

Ažurira SVE kontakt informacije u Supabase bazi da koriste centralizovane vrednosti:
- Email: `apartmanijovca@gmail.com`
- Telefon: `+381 65 237 8080`
- WhatsApp: `+381 65 237 8080`

## 🚀 Kako da primenite migraciju

### Opcija 1: Kroz Supabase Dashboard (PREPORUČENO)

1. Otvori Supabase Dashboard: https://supabase.com/dashboard
2. Izaberi svoj projekat
3. Idi na **SQL Editor** (leva strana)
4. Klikni **New Query**
5. Kopiraj sadržaj fajla `supabase/migrations/20260301_update_contact_info.sql`
6. Nalepi u SQL Editor
7. Klikni **Run** (ili pritisni Ctrl+Enter)
8. Proveri rezultate u Output sekciji

### Opcija 2: Kroz Supabase CLI

```bash
# Ako imaš Supabase CLI instaliran
supabase db push

# Ili direktno primeni migraciju
supabase migration up
```

## ✅ Provera da li je uspelo

Nakon primene migracije, proveri u Supabase Dashboard:

1. Idi na **Table Editor**
2. Otvori tabelu `content`
3. Filtriraj po `section = 'site_settings'`
4. Proveri da li su vrednosti:
   - `contact_email`: "apartmanijovca@gmail.com"
   - `contact_phone`: "+381 65 237 8080"
   - `whatsapp`: "+381 65 237 8080"

Ili pokreni ovaj SQL upit:

```sql
SELECT 
  lang,
  section,
  data->>'contact_email' as email,
  data->>'contact_phone' as phone,
  data->>'whatsapp' as whatsapp
FROM content 
WHERE section = 'site_settings'
ORDER BY lang;
```

Trebalo bi da vidiš 4 reda (sr, en, de, it) sa istim kontakt informacijama.

## 🔄 Rollback (ako nešto pođe po zlu)

Ako trebaš da vratiš nazad, možeš ručno ažurirati vrednosti kroz Supabase Dashboard ili pokrenuti:

```sql
-- Vrati na stare vrednosti (ako ih znaš)
UPDATE content 
SET data = jsonb_set(
  data,
  '{contact_email}',
  '"stari_email@example.com"'
)
WHERE section = 'site_settings';
```

## 📝 Napomene

- Ova migracija je **IDEMPOTENTNA** - možeš je pokrenuti više puta bez problema
- Ažurira samo `site_settings` sekciju u `content` tabeli
- Ne dira ostale podatke u bazi
- Bezbedno za produkciju

## 🎯 Posle migracije

Nakon što primenite migraciju:
1. Restartuj aplikaciju (ako je potrebno)
2. Proveri kontakt stranicu na sajtu
3. Proveri da li se prikazuju ispravni kontakt podaci
4. Testiraj kontakt formu

## 💡 Važno

Sada kada promeniš kontakt informacije, treba da ih promeniš na **2 mesta**:

1. **Kod**: `src/lib/seo/config.ts` (za frontend)
2. **Baza**: Pokreni SQL update (za backend/CMS)

Ili još bolje - napravi API endpoint koji čita iz config.ts i ažurira bazu automatski!
