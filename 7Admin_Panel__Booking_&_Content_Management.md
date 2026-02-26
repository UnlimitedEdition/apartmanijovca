# Admin Panel: Booking & Content Management

## Scope

Implementacija modernog admin panel-a za upravljanje bookings, content, i analytics.

**Included:**
- ✅ Admin Authentication:
  - Supabase Auth (email/password)
  - Protected routes
- ✅ Booking Management:
  - Lista svih bookings (pending, confirmed, cancelled)
  - Potvrda/odbijanje booking requests
  - Calendar view (svi apartmani)
  - Booking detalji i edit
  - Guest komunikacija (odgovori na poruke)
- ✅ Content Management:
  - Multi-language content editor (4 jezika)
  - Rich text editor za opise
  - Image upload i management (Supabase Storage)
  - Preview changes
- ✅ Apartment Management:
  - CRUD za apartmane
  - Cene i availability override
  - Image galleries
- ✅ Reviews Management:
  - Approve/reject reviews
  - Moderate komentare
- ✅ Analytics Dashboard:
  - Booking funnel metrics
  - Conversion rates
  - Page views, bounce rate
  - Device breakdown (mobile/desktop)
  - Top referrers
- ✅ Calendar Management:
  - Block dates (maintenance)
  - Price overrides za specific dates
  - Bulk operations

**Explicitly Out:**
- ❌ Guest portal (Ticket #6)
- ❌ Email template editing (hardcoded templates)

## Spec References

- `spec:29240173-654b-408c-b23c-b9a7362879c8/c2e4d049-5b58-42f6-af1e-098e560cc581` - Tech Plan (Admin Panel, Component Architecture)
- `spec:29240173-654b-408c-b23c-b9a7362879c8/463fe2f3-6b6c-42de-90f2-7ff37afc64ee` - Epic Brief (Smanjiti admin vreme sa 10h na 2h)

## Acceptance Criteria

1. ✅ Admin login funkcioniše (Supabase Auth)
2. ✅ Protected routes (samo admin pristup)
3. ✅ Booking lista sa filterima (status, datumi)
4. ✅ Potvrda/odbijanje bookings (< 2 sata response time)
5. ✅ Calendar view sa svim apartmanima
6. ✅ Guest messaging (odgovori na poruke)
7. ✅ Content editor za 4 jezika
8. ✅ Rich text editor za opise
9. ✅ Image upload i management
10. ✅ Apartment CRUD operations
11. ✅ Reviews approve/reject
12. ✅ Analytics dashboard sa key metrics
13. ✅ Calendar management (block dates, price overrides)
14. ✅ Mobile-responsive admin panel
15. ✅ Admin vreme smanjeno (efikasan UI)

## Dependencies

**Depends on:**
- Ticket #1 (Infrastructure)
- Ticket #2 (Database - sve tabele)
- Ticket #4 (Booking System - bookings data)
- Ticket #6 (Guest Portal - messaging)

## Technical Notes

- Supabase Auth za admin
- RLS policies (admin role)
- Server Actions za CRUD operations
- Rich text editor (Tiptap ili Lexical)
- Analytics aggregation queries
- Calendar library (react-big-calendar ili custom)