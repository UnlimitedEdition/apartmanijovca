# i18n (Internationalization) Setup Guide

This document explains how the internationalization system works in the Apartmani Jovča Next.js application.

## Overview

The application supports 4 languages:
- **English (en)** - Default language
- **Serbian (sr)** - Native language
- **German (de)** - German speaking tourists
- **Italian (it)** - Italian speaking tourists

## Architecture

The project uses two i18n libraries for different purposes:

### 1. next-i18next (Client-side)
- Used for client-side translations in React components
- Configuration: [`next-i18next.config.js`](../next-i18next.config.js)
- Translation files: [`public/locales/{locale}/common.json`](../public/locales/)

### 2. next-intl (Server-side)
- Used for server-side translations in Server Components
- Configuration: [`src/i18n/request.ts`](../src/i18n/request.ts)
- Translation files: [`messages/{locale}.json`](../messages/)

## File Structure

```
apartmani-jovca-next/
├── public/
│   └── locales/
│       ├── en/
│       │   └── common.json    # English translations
│       ├── sr/
│       │   └── common.json    # Serbian translations
│       ├── de/
│       │   └── common.json    # German translations
│       └── it/
│           └── common.json    # Italian translations
├── messages/
│   ├── en.json                # English (server-side)
│   ├── sr.json                # Serbian (server-side)
│   ├── de.json                # German (server-side)
│   └── it.json                # Italian (server-side)
├── next-i18next.config.js     # next-i18next configuration
└── middleware.ts              # Locale detection & redirection
```

## Using Translations in Components

### Client Components (next-i18next)

```tsx
'use client';

import { useTranslation } from 'next-i18next';

export function MyComponent() {
  const { t } = useTranslation('common');
  
  return (
    <div>
      <h1>{t('home.title')}</h1>
      <p>{t('home.description')}</p>
    </div>
  );
}
```

### Server Components (next-intl)

```tsx
import { useTranslations } from 'next-intl';

export default function ServerComponent() {
  const t = useTranslations();
  
  return (
    <div>
      <h1>{t('home.title')}</h1>
      <p>{t('home.description')}</p>
    </div>
  );
}
```

### With Interpolation

```tsx
// Translation: "distance": "{{distance}} km away"
<p>{t('attractions.distance', { distance: 5 })}</p>
// Output: "5 km away"
```

### With Pluralization

```tsx
// Translations:
// "nights": "{{count}} night",
// "nights_plural": "{{count}} nights"
<p>{t('booking.summary.nights', { count: 3 })}</p>
// Output: "3 nights"
```

## Language Switching

### Language Switcher Component

The language switcher is located at [`src/app/[lang]/components/shared/language-switcher.tsx`](../src/app/[lang]/components/shared/language-switcher.tsx):

```tsx
'use client';

import { useRouter } from 'next/router';
import { useTranslation } from 'next-i18next';

export function LanguageSwitcher() {
  const router = useRouter();
  const { t } = useTranslation('common');
  const currentLang = router.locale || 'en';

  const languages = [
    { code: 'en', name: t('language.en') },
    { code: 'sr', name: t('language.sr') },
    { code: 'de', name: t('language.de') },
    { code: 'it', name: t('language.it') },
  ];

  const changeLanguage = (lang: string) => {
    router.push(router.pathname, router.asPath, { locale: lang });
  };

  return (
    <select 
      value={currentLang} 
      onChange={(e) => changeLanguage(e.target.value)}
    >
      {languages.map((lang) => (
        <option key={lang.code} value={lang.code}>
          {lang.name}
        </option>
      ))}
    </select>
  );
}
```

### URL Structure

The app uses a URL-based locale strategy:
- English: `https://example.com/en/...`
- Serbian: `https://example.com/sr/...`
- German: `https://example.com/de/...`
- Italian: `https://example.com/it/...`

## Adding New Translations

### Step 1: Add the Key to All Locale Files

Add the new translation key to all 4 locale files:

**English (`public/locales/en/common.json`):**
```json
{
  "newSection": {
    "title": "New Section Title",
    "description": "This is a new section"
  }
}
```

**Serbian (`public/locales/sr/common.json`):**
```json
{
  "newSection": {
    "title": "Naslov novog odeljka",
    "description": "Ovo je novi odeljak"
  }
}
```

**German (`public/locales/de/common.json`):**
```json
{
  "newSection": {
    "title": "Neuer Abschnitt Titel",
    "description": "Dies ist ein neuer Abschnitt"
  }
}
```

**Italian (`public/locales/it/common.json`):**
```json
{
  "newSection": {
    "title": "Titolo nuova sezione",
    "description": "Questa è una nuova sezione"
  }
}
```

### Step 2: Copy to Messages Directory

After updating the locale files, copy them to the messages directory:

```bash
npm run db:migrate-i18n
```

Or manually copy:
```bash
cp public/locales/*/common.json messages/*.json
```

### Step 3: Use in Components

```tsx
<h1>{t('newSection.title')}</h1>
<p>{t('newSection.description')}</p>
```

## Translation Keys Organization

The translation keys are organized by feature/section:

| Key Prefix | Description |
|------------|-------------|
| `app.*` | App-wide settings (title, description) |
| `header.*` | Header navigation items |
| `footer.*` | Footer content |
| `nav.*` | Navigation links |
| `common.*` | Common UI elements (buttons, labels) |
| `home.*` | Home page content |
| `gallery.*` | Gallery page content |
| `prices.*` | Prices page content |
| `attractions.*` | Attractions page content |
| `contact.*` | Contact page content |
| `booking.*` | Booking flow content |
| `apartments.*` | Apartments listing |
| `location.*` | Location page |
| `reviews.*` | Reviews section |
| `admin.*` | Admin panel content |
| `portal.*` | Guest portal content |
| `pwa.*` | PWA install prompts |
| `errors.*` | Error pages content |

## Running the Migration Script

The migration script consolidates translations from legacy frontend:

```bash
npm run db:migrate-i18n
```

This script:
1. Reads legacy translation files from `frontend/public/locales/`
2. Reads existing Next.js translations
3. Merges them together (legacy takes precedence)
4. Ensures all locales have the same keys
5. Writes to both `public/locales/` and `messages/`
6. Provides a summary of migrated keys

## Best Practices

### 1. Keep Keys Organized
Use nested objects to group related translations:
```json
{
  "booking": {
    "form": {
      "checkIn": "Check-in Date",
      "checkOut": "Check-out Date"
    }
  }
}
```

### 2. Use Descriptive Key Names
```json
// Good
"booking.form.submit": "Submit Booking Request"

// Avoid
"booking.submit": "Submit"
```

### 3. Handle Pluralization
```json
{
  "nights": "{{count}} night",
  "nights_plural": "{{count}} nights"
}
```

### 4. Use Interpolation for Dynamic Content
```json
{
  "welcome": "Welcome, {{name}}!",
  "distance": "{{distance}} km away"
}
```

### 5. Keep Translations Consistent
Ensure all locales have the same structure and keys.

## Middleware Configuration

The middleware handles locale detection and redirection:

```typescript
// middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const locales = ['en', 'sr', 'de', 'it'];
const defaultLocale = 'en';

export function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  
  // Check if pathname already has a locale
  const pathnameHasLocale = locales.some(
    (locale) => pathname.startsWith(`/${locale}/`) || pathname === `/${locale}`
  );
  
  if (pathnameHasLocale) return;
  
  // Redirect to default locale
  const locale = defaultLocale;
  request.nextUrl.pathname = `/${locale}${pathname}`;
  return NextResponse.redirect(request.nextUrl);
}
```

## SEO Considerations

### hreflang Tags

Add hreflang tags in your layout for SEO:

```tsx
// src/app/[lang]/layout.tsx
export async function generateMetadata({ params }) {
  const { lang } = params;
  
  return {
    alternates: {
      canonical: `https://example.com/${lang}`,
      languages: {
        'en': 'https://example.com/en',
        'sr': 'https://example.com/sr',
        'de': 'https://example.com/de',
        'it': 'https://example.com/it',
      },
    },
  };
}
```

## Troubleshooting

### Missing Translations
If translations are not showing:
1. Check that the key exists in all locale files
2. Verify the file path is correct
3. Restart the development server

### Locale Not Detected
If the locale is not being detected:
1. Check the middleware configuration
2. Verify the URL structure
3. Check browser language settings

### Server-Client Mismatch
If you see hydration errors:
1. Ensure server and client use the same translations
2. Check that both `public/locales/` and `messages/` are in sync
3. Run `npm run db:migrate-i18n` to sync files

## Resources

- [next-i18next Documentation](https://github.com/i18next/next-i18next)
- [next-intl Documentation](https://next-intl-docs.vercel.app/)
- [i18next Documentation](https://www.i18next.com/)
