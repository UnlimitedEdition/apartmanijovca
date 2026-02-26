# Custom Analytics & Tracking

## Scope

Implementacija lightweight custom analytics sistema za tracking user behavior, conversion funnel, i success metrics.

**Included:**
- ✅ Analytics tracking:
  - Page views (sa referrer, device, language)
  - Booking funnel steps (step 1-4 completion rates)
  - CTA clicks (which CTAs convert best)
  - Calendar interactions (date selections)
  - Bounce rate calculation
  - Time on site
- ✅ Analytics API:
  - POST /api/analytics (track event)
  - GET /api/analytics/dashboard (aggregated data)
- ✅ Client-side tracking:
  - Lightweight tracker (< 1KB)
  - Session management
  - Device detection
  - Geo data (from Vercel edge)
- ✅ Privacy compliance:
  - No third-party tracking
  - GDPR compliant
  - Cookie consent (optional, za analytics)
- ✅ Analytics aggregation:
  - Daily rollup (Supabase Edge Function)
  - Conversion funnel analysis
  - Drop-off points identification

**Explicitly Out:**
- ❌ Admin analytics dashboard UI (Ticket #7)
- ❌ Advanced analytics (heatmaps, session recordings)

## Spec References

- `spec:29240173-654b-408c-b23c-b9a7362879c8/c2e4d049-5b58-42f6-af1e-098e560cc581` - Tech Plan (Custom Analytics)
- `spec:29240173-654b-408c-b23c-b9a7362879c8/463fe2f3-6b6c-42de-90f2-7ff37afc64ee` - Epic Brief (Success Metrics)

## Acceptance Criteria

1. ✅ Analytics tracker implementiran (< 1KB)
2. ✅ Page view tracking funkcioniše
3. ✅ Booking funnel tracking (step 1-4)
4. ✅ CTA click tracking
5. ✅ Session management (session ID)
6. ✅ Device detection (mobile/tablet/desktop)
7. ✅ Geo data capture (country, city)
8. ✅ Analytics API endpoints
9. ✅ Daily aggregation Edge Function
10. ✅ Conversion rate calculation
11. ✅ Bounce rate calculation
12. ✅ GDPR compliant (no PII tracking)
13. ✅ Performance impact < 50ms
14. ✅ Analytics data stored u Supabase

## Dependencies

**Depends on:**
- Ticket #1 (Infrastructure - analytics_events table)
- Ticket #2 (Database - analytics_events table)
- Ticket #3 (Pages - tracking integration)
- Ticket #4 (Booking - funnel tracking)

## Technical Notes

- Lightweight tracker (vanilla JS, no dependencies)
- Server-side tracking (Vercel edge functions)
- Session ID (localStorage + UUID)
- No cookies (privacy-friendly)
- Aggregation queries za dashboard
- Partitioning analytics table by month