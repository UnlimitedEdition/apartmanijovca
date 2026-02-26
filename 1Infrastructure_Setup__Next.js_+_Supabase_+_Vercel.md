# Infrastructure Setup: Next.js + Supabase + Vercel

## Scope

Setup kompletne infrastrukture za transformaciju sajta: Next.js 14 projekat, Supabase backend, Vercel deployment, i custom analytics foundation.

**Included:**
- ✅ Kreiranje Next.js 14 projekta (App Router, TypeScript)
- ✅ Supabase projekat setup (database, auth, storage)
- ✅ Vercel deployment konfiguracija
- ✅ Custom domain setup (apartmani-jovca.com)
- ✅ Environment variables (Supabase keys, Resend API key)
- ✅ Git repository setup (main, staging, feature branches)
- ✅ Basic analytics infrastructure (analytics_events table)
- ✅ TailwindCSS konfiguracija
- ✅ Multi-language setup (i18next)

**Explicitly Out:**
- ❌ Database schema (Ticket #2)
- ❌ Content migration (Ticket #2)
- ❌ Page implementation (Ticket #3)
- ❌ Booking system (Ticket #4)

## Spec References

- `spec:29240173-654b-408c-b23c-b9a7362879c8/c2e4d049-5b58-42f6-af1e-098e560cc581` - Tech Plan (Architectural Approach, Migration Strategy)

## Acceptance Criteria

1. ✅ Next.js 14 projekat kreiran sa App Router i TypeScript
2. ✅ Supabase projekat kreiran i konfigurisan
3. ✅ Vercel deployment funkcioniše (staging + production)
4. ✅ Custom domain povezan (apartmani-jovca.com)
5. ✅ Environment variables postavljene (Vercel + local .env)
6. ✅ Git workflow setup (main, staging, feature/*)
7. ✅ TailwindCSS i i18next konfigurisani
8. ✅ Analytics events table kreirana u Supabase
9. ✅ Basic layout (Header, Footer) implementiran
10. ✅ Deployment pipeline testiran (push → auto-deploy)

## Dependencies

**None** - Ovo je prvi ticket, foundation za sve ostalo.

## Technical Notes

- Next.js 14 App Router (ne Pages Router)
- TypeScript strict mode
- Supabase free tier (500MB database, 1GB storage)
- Vercel free tier (100GB bandwidth)
- Git branching: `main` (prod), `staging`, `feature/*`