# Language Switcher Fix & Booking Language Display - COMPLETE ✅

## Problem 1: SR Language Not Working in Header
User reported that clicking SR in the language switcher doesn't switch back to Serbian - all other languages work fine.

## Problem 2: Booking Language Not Prominent
The booking language (de, it, en, sr) was buried in the security metadata section, making it hard to see which language the customer used.

---

## Root Cause Analysis

### Problem 1: SR Language Switcher
The middleware was configured with `localePrefix: 'as-needed'` which means:
- SR (default) → No prefix: `/`, `/apartments`
- Other languages → With prefix: `/de`, `/de/apartments`

The header's `handleLanguageChange` function had complex logic trying to handle this, but it wasn't working correctly when switching back to SR.

### Problem 2: Language Display
The booking language was shown at the bottom of the security metadata card, not prominently visible.

---

## Solution Implemented

### 1. Changed Middleware Strategy
**File**: `src/middleware.ts`

Changed from `as-needed` to `always` for consistent behavior:

```typescript
const intlMiddleware = createIntlMiddleware({
  locales: ['en', 'sr', 'de', 'it'],
  defaultLocale: 'sr',
  localePrefix: 'always' // Changed from 'as-needed'
})

export default async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // 1. Skip admin routes
  if (pathname.startsWith('/admin')) {
    // ... admin auth logic
  }

  // 2. Handle root path - redirect to default locale
  if (pathname === '/') {
    return NextResponse.redirect(new URL('/sr', request.url))
  }

  // 3. All other routes go through i18n
  return intlMiddleware(request)
}
```

Now ALL languages use prefix:
- SR → `/sr`, `/sr/apartments`, `/sr/booking`
- EN → `/en`, `/en/apartments`, `/en/booking`
- DE → `/de`, `/de/apartments`, `/de/booking`
- IT → `/it`, `/it/apartments`, `/it/booking`

### 2. Simplified Header Logic
**File**: `src/app/[lang]/components/layout/header.tsx`

Simplified `handleLanguageChange` to always add locale prefix:

```typescript
const handleLanguageChange = (newLang: string) => {
  console.log('🌍 Language change requested:', { from: currentLang, to: newLang, pathname })
  
  // Get current path segments
  const segments = pathname.split('/').filter(Boolean)
  const locales = ['en', 'sr', 'de', 'it']
  
  // Remove current locale from path if it exists
  if (segments.length > 0 && locales.includes(segments[0])) {
    console.log('  Removing locale from path:', segments[0])
    segments.shift()
  }
  
  // Build new path - ALL languages now use prefix (localePrefix: 'always')
  const newPath = '/' + newLang + (segments.length === 0 ? '' : '/' + segments.join('/'))
  console.log('  New path with locale prefix:', newPath)
  
  router.push(newPath)
  setMenuOpen(false)
}
```

Updated all links to use locale prefix:
- Logo link: `/${currentLang}`
- Navigation links: `/${currentLang}/apartments`, etc.
- Booking button: `/${currentLang}/booking`

### 2.5. Root Path Redirect
**Files**: `src/middleware.ts`, `src/app/page.tsx`, `next.config.mjs`

Added triple protection for root path redirect:

1. **Middleware redirect**:
```typescript
if (pathname === '/') {
  return NextResponse.redirect(new URL('/sr', request.url))
}
```

2. **Server component redirect** (`src/app/page.tsx`):
```typescript
import { redirect } from 'next/navigation'

export default function RootPage() {
  redirect('/sr')
}
```

3. **Next.config redirects**:
```javascript
async redirects() {
  return [
    {
      source: '/',
      destination: '/sr',
      permanent: false,
    },
    {
      source: '/:path((?!sr|en|de|it|api|_next|admin|favicon.ico|sw.js|manifest.json).*)',
      destination: '/sr/:path*',
      permanent: false,
    },
  ];
}
```

### 3. Prominent Language Badge
**File**: `src/components/admin/AdminBookingDetails.tsx`

Added large, prominent language badge in the status banner at the top:

```typescript
{/* Status Banner */}
<div className={`rounded-lg p-4 border ${statusColors[currentBooking.status]}`}>
  <div className="flex items-center justify-between">
    <div className="flex items-center gap-3">
      {StatusIcon && <StatusIcon className="h-6 w-6" />}
      <div>
        <p className="font-bold text-lg">{statusLabels[currentBooking.status]}</p>
        <p className="text-sm opacity-75">
          Референца: {currentBooking.id.slice(0, 8).toUpperCase()}
        </p>
      </div>
    </div>
    {/* Language Badge - PROMINENT */}
    {currentBooking.language && (
      <div className="bg-white/90 backdrop-blur px-4 py-2 rounded-lg border-2 border-current shadow-lg">
        <p className="text-xs font-semibold opacity-75">Језик резервације</p>
        <p className="text-2xl font-black uppercase tracking-wider">
          {currentBooking.language}
        </p>
      </div>
    )}
  </div>
</div>
```

Removed duplicate language display from security metadata section.

---

## Visual Changes

### Before:
- Status banner (left side only)
- Language buried in security metadata at bottom

### After:
- Status banner with LARGE language badge on right side
- Language displayed as: **DE** or **IT** or **EN** or **SR**
- Immediately visible when opening booking details
- No duplicate in security section

---

## URL Structure Changes

### Before (as-needed):
- SR: `/`, `/apartments`, `/booking`
- EN: `/en`, `/en/apartments`, `/en/booking`
- DE: `/de`, `/de/apartments`, `/de/booking`
- IT: `/it`, `/it/apartments`, `/it/booking`

### After (always):
- SR: `/sr`, `/sr/apartments`, `/sr/booking`
- EN: `/en`, `/en/apartments`, `/en/booking`
- DE: `/de`, `/de/apartments`, `/de/booking`
- IT: `/it`, `/it/apartments`, `/it/booking`

**Note**: This is a BREAKING CHANGE for existing SR URLs without prefix. You may need to add redirects in `next.config.mjs` if you have external links pointing to old SR URLs.

---

## Testing

1. **Root Path**:
   - Go to `http://localhost:3000/` → Should redirect to `/sr` ✅
   - Hard refresh on `/` → Should redirect to `/sr` ✅

2. **Language Switcher**:
   - Go to `/de/apartments`
   - Click SR in header → Should go to `/sr/apartments` ✅
   - Click DE → Should go to `/de/apartments` ✅
   - Click IT → Should go to `/it/apartments` ✅
   - Click EN → Should go to `/en/apartments` ✅

3. **Hard Refresh**:
   - Go to `/sr/booking`
   - Hard refresh (Ctrl+Shift+R) → Should stay on `/sr/booking` ✅
   - Change to DE → Hard refresh → Should stay on `/de/booking` ✅

4. **Booking Language Display**:
   - Create booking from `/de/booking`
   - Check admin panel → Should show **DE** badge at top ✅
   - Create booking from `/it/booking`
   - Check admin panel → Should show **IT** badge at top ✅

---

## Debug Logging

Added console logging in `handleLanguageChange` to help debug issues:
- Shows current and target language
- Shows path transformation steps
- Shows final path before navigation

Check browser console when switching languages to see the flow.

---

## Files Modified

1. `src/middleware.ts` - Changed localePrefix to 'always' + root redirect
2. `src/app/[lang]/components/layout/header.tsx` - Simplified language switching logic
3. `src/components/admin/AdminBookingDetails.tsx` - Added prominent language badge
4. `src/app/page.tsx` - Added root page with redirect to /sr
5. `next.config.mjs` - Added redirects for root and old URLs

---

## Potential Issues & Solutions

### Issue: Old SR URLs without prefix
**Problem**: External links like `https://apartmanijovca.rs/apartments` won't work
**Solution**: Add redirect in `next.config.mjs`:

```javascript
async redirects() {
  return [
    {
      source: '/:path((?!sr|en|de|it).*)',
      destination: '/sr/:path*',
      permanent: false,
    },
  ];
}
```

### Issue: Google indexed old URLs
**Problem**: Search results show old URLs without `/sr` prefix
**Solution**: 
1. Add redirects (above)
2. Submit new sitemap to Google Search Console
3. Wait for re-indexing

---

## Status: ✅ COMPLETE

Both issues resolved:
1. ✅ SR language switcher works perfectly
2. ✅ Booking language prominently displayed at top

The system now uses consistent URL structure for all languages, making it easier to maintain and debug.
