# Reviews & Social Proof System

## Scope

Implementacija review sistema sa ratings, komentarima, i guest photos za trust building.

**Included:**
- ✅ Review submission:
  - Post-stay review form (guest portal)
  - Rating (1-5 zvezdica)
  - Title i komentar
  - Upload slika (opciono)
- ✅ Review display:
  - Homepage reviews section (featured reviews)
  - Inline reviews sa apartmanima (Prices page)
  - Overall rating calculation (4.9★ od 150 gostiju)
  - Individual apartment ratings
- ✅ Review moderation:
  - Admin approve/reject (Ticket #7 UI)
  - Status: pending → approved/rejected
- ✅ Guest photos:
  - Upload slika sa reviews
  - Display u gallery ("Slike od naših gostiju")
- ✅ Faktičke informacije (bez urgency):
  - "Rezervisan 12 puta u poslednjih 30 dana"
  - "95% gostiju preporučuje"
  - Booking stats calculation
- ✅ Trust badges:
  - "Verified Property"
  - "COVID-Safe"
  - Custom badges

**Explicitly Out:**
- ❌ Third-party review integration (Google Reviews, TripAdvisor)
- ❌ Review responses (admin replies)

## Spec References

- `spec:29240173-654b-408c-b23c-b9a7362879c8/f6845df1-8cba-42ca-a558-bbe01d9b56bf` - Core Flows (Reviews svuda, faktičke informacije)
- `spec:29240173-654b-408c-b23c-b9a7362879c8/c2e4d049-5b58-42f6-af1e-098e560cc581` - Tech Plan (Reviews table, RLS policies)

## Acceptance Criteria

1. ✅ Review submission form u guest portal
2. ✅ Rating (1-5 zvezdica) sa validacijom
3. ✅ Title i komentar fields
4. ✅ Upload slika (max 5 slika)
5. ✅ Reviews prikazani na homepage (featured 3-5)
6. ✅ Reviews inline sa apartmanima (Prices page)
7. ✅ Overall rating calculation (average)
8. ✅ Individual apartment ratings
9. ✅ Review moderation (pending → approved)
10. ✅ Guest photos u gallery
11. ✅ Booking stats prikazani (faktički, bez urgency)
12. ✅ Trust badges prikazani
13. ✅ RLS policies (guests can create, public can view approved)
14. ✅ Review request email nakon checkout-a (Ticket #5)

## Dependencies

**Depends on:**
- Ticket #1 (Infrastructure)
- Ticket #2 (Database - reviews table)
- Ticket #5 (Email - review request)
- Ticket #6 (Guest Portal - review submission UI)

## Technical Notes

- Reviews table sa status (pending, approved, rejected)
- RLS policies za security
- Image upload za guest photos (Supabase Storage)
- Rating calculation (average, weighted)
- Booking stats queries (COUNT, GROUP BY)
- No fake urgency - samo faktičke informacije