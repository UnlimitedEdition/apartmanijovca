# Centralizovana Konfiguracija - URL i Email

## 📍 VAŽNO: Gde se menjaju URL i Email

Svi URL-ovi i kontakt informacije su centralizovani na **JEDNOM mestu**:

```
src/lib/seo/config.ts
```

## 🎯 Šta treba da promeniš

Otvori fajl `src/lib/seo/config.ts` i izmeni sledeće konstante:

```typescript
// ============================================
// CENTRALIZED CONFIGURATION - EDIT HERE ONLY
// ============================================
export const PRODUCTION_URL = 'https://apartmani-jovca.vercel.app'
export const CONTACT_EMAIL = 'apartmanijovca@gmail.com'
export const CONTACT_PHONE = '+381 65 237 8080'
export const WHATSAPP_NUMBER = '+381 65 237 8080'
// ============================================
```

## ✅ Gde se automatski koriste

Kada promeniš vrednosti u `config.ts`, automatski se ažuriraju na:

### URL (`PRODUCTION_URL`):
- Sitemap.xml
- robots.txt
- Open Graph meta tagovi
- Twitter Card meta tagovi
- Structured data (Schema.org)
- Hreflang tagovi
- Canonical URL-ovi
- Sve SEO meta tagove

### Email (`CONTACT_EMAIL`):
- Privacy stranica
- Terms stranica
- Contact forma
- Footer
- Structured data
- Business schema

### Telefon (`CONTACT_PHONE`, `WHATSAPP_NUMBER`):
- Privacy stranica
- Terms stranica
- Contact forma
- Footer
- Structured data
- Business schema
- WhatsApp dugme

## 🚀 Kako funkcioniše

Fajl `src/lib/seo/config.ts` exportuje:

1. **Konstante** - Direktne vrednosti koje se koriste svuda
2. **Funkcije** - `getBaseUrl()`, `getSEOConfig()` koje vraćaju konfiguraciju

### Primer korišćenja:

```typescript
import { PRODUCTION_URL, CONTACT_EMAIL, CONTACT_PHONE } from '@/lib/seo/config'

// Koristi direktno
const email = CONTACT_EMAIL
const phone = CONTACT_PHONE
const url = PRODUCTION_URL
```

## 📝 Environment Variables

Za production deployment, postavi u Vercel:

```bash
NEXT_PUBLIC_BASE_URL=https://apartmani-jovca.vercel.app
```

Ako ova varijabla nije postavljena, sistem automatski koristi `PRODUCTION_URL` iz `config.ts`.

## ⚠️ Važne napomene

1. **NE menjaj** hardcoded vrednosti u drugim fajlovima
2. **UVEK** koristi konstante iz `config.ts`
3. **NE dodavaj** trailing slash na URL (`/` na kraju)
4. **PROVERI** da li je email validan format
5. **PROVERI** da li telefon ima međunarodni format (+381...)

## 🔄 Posle izmene

1. Restartuj development server (`npm run dev`)
2. Proveri da li se izmene primenjuju
3. Build projekat (`npm run build`)
4. Deploy na Vercel (`git push`)

## 📞 Kontakt za podršku

Ako imaš problema sa konfiguracijom, proveri:
- Da li si sačuvao fajl
- Da li si restartovao server
- Da li ima sintaksnih grešaka u `config.ts`
