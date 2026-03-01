# 🚀 Brzo Ažuriranje Kontakt Informacija u Bazi

## Najbrži način (1 komanda):

```bash
npm run db:update-contact
```

Ova komanda će:
- ✅ Pročitati kontakt informacije iz `src/lib/seo/config.ts`
- ✅ Ažurirati SVE jezike (sr, en, de, it) u bazi
- ✅ Verifikovati da su izmene uspešno primenjene
- ✅ Prikazati rezultate u tabeli

## Šta se ažurira:

- **Email**: apartmanijovca@gmail.com
- **Telefon**: +381 65 237 8080
- **WhatsApp**: +381 65 237 8080

## Primer output-a:

```
🚀 Starting contact information update...

📋 Contact information to update:
   Email: apartmanijovca@gmail.com
   Phone: +381 65 237 8080
   WhatsApp: +381 65 237 8080

📝 Updating SR site settings...
   ✅ Successfully updated sr
📝 Updating EN site settings...
   ✅ Successfully updated en
📝 Updating DE site settings...
   ✅ Successfully updated de
📝 Updating IT site settings...
   ✅ Successfully updated it

🔍 Verifying updates...

📊 Current database values:
────────────────────────────────────────────────────────────────────────────────
Lang | Email                      | Phone            | WhatsApp
────────────────────────────────────────────────────────────────────────────────
sr   | apartmanijovca@gmail.com ✅ | +381 65 237 8080 ✅ | +381 65 237 8080 ✅
en   | apartmanijovca@gmail.com ✅ | +381 65 237 8080 ✅ | +381 65 237 8080 ✅
de   | apartmanijovca@gmail.com ✅ | +381 65 237 8080 ✅ | +381 65 237 8080 ✅
it   | apartmanijovca@gmail.com ✅ | +381 65 237 8080 ✅ | +381 65 237 8080 ✅
────────────────────────────────────────────────────────────────────────────────

✅ All contact information updated successfully!
🎉 Database is now in sync with src/lib/seo/config.ts
```

## Kada koristiti:

1. **Posle promene kontakt informacija** u `src/lib/seo/config.ts`
2. **Posle deploy-a** na produkciju
3. **Kada primetiš** da se prikazuju stari kontakt podaci

## Alternativni način (SQL):

Ako preferiraš SQL, možeš pokrenuti migraciju direktno:

```bash
# Kopiraj sadržaj iz supabase/migrations/20260301_update_contact_info.sql
# Nalepi u Supabase Dashboard > SQL Editor > Run
```

## Provera da li je uspelo:

Posle ažuriranja, proveri:
1. Otvori sajt: https://apartmani-jovca.vercel.app/sr/contact
2. Proveri da li se prikazuje: apartmanijovca@gmail.com i +381 65 237 8080
3. Proveri footer - trebalo bi da ima iste podatke

## Troubleshooting:

### Greška: "Supabase credentials not found"
```bash
# Proveri da li imaš .env.local fajl sa:
NEXT_PUBLIC_SUPABASE_URL=your_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_key
```

### Greška: "Permission denied"
```bash
# Proveri RLS policies u Supabase Dashboard
# Možda trebaš da koristiš SERVICE_ROLE_KEY umesto ANON_KEY
```

### Skripta ne radi
```bash
# Pokreni direktno:
node scripts/update-contact-info-db.mjs
```

## 💡 Pro Tip:

Dodaj ovu komandu u svoj deployment workflow:

```bash
npm run build && npm run db:update-contact && vercel deploy
```

Tako će kontakt informacije uvek biti sinhronizovane! 🎯
