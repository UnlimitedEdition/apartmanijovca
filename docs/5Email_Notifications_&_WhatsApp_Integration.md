# Email Notifications & WhatsApp Integration

## Scope

Implementacija email notification sistema sa Resend i WhatsApp Business API integracija za live chat.

**Included:**
- ✅ Resend integration:
  - API setup i konfiguracija
  - React Email templates:
    - Booking request received (instant)
    - Booking confirmed (< 2 sata)
    - Pre-arrival reminder (7 dana pre)
    - Check-in instructions (24h pre)
    - Review request (nakon checkout-a)
  - Email sending logic (Server Actions)
- ✅ Supabase Edge Functions:
  - booking-confirmation (trigger on booking insert)
  - pre-arrival-reminder (cron job)
  - checkin-instructions (cron job)
  - review-request (cron job)
- ✅ WhatsApp Business API:
  - Floating WhatsApp button
  - Pre-filled message
  - Click-to-WhatsApp link
  - Business hours indicator (9-21h)
- ✅ Admin notifications:
  - Email na novi booking request
  - SMS opciono (za kasnije)

**Explicitly Out:**
- ❌ Guest portal messaging (Ticket #6)
- ❌ Admin panel email management (Ticket #7)

## Spec References

- `spec:29240173-654b-408c-b23c-b9a7362879c8/f6845df1-8cba-42ca-a558-bbe01d9b56bf` - Core Flows (Flow 5, 7)
- `spec:29240173-654b-408c-b23c-b9a7362879c8/c2e4d049-5b58-42f6-af1e-098e560cc581` - Tech Plan (Resend, WhatsApp, Edge Functions)

## Acceptance Criteria

1. ✅ Resend API key konfigurisan
2. ✅ React Email templates kreirani (5 templates)
3. ✅ Booking request email šalje se instant
4. ✅ Booking confirmation email šalje se nakon admin potvrde
5. ✅ Pre-arrival reminder (7 dana pre check-in)
6. ✅ Check-in instructions (24h pre check-in)
7. ✅ Review request (nakon checkout-a)
8. ✅ Supabase Edge Functions deployed
9. ✅ Cron jobs konfigurisani za scheduled emails
10. ✅ WhatsApp floating button implementiran
11. ✅ WhatsApp link sa pre-filled message
12. ✅ Business hours indicator (9-21h)
13. ✅ Admin email notifications na novi booking
14. ✅ Email deliverability testirana (inbox, ne spam)

## Dependencies

**Depends on:**
- Ticket #1 (Infrastructure - Resend API key)
- Ticket #2 (Database - bookings table)
- Ticket #4 (Booking System - booking creation)

## Technical Notes

- React Email za templates (reuse React components)
- Supabase Edge Functions za scheduled emails
- Cron jobs: `0 9 * * *` (daily at 9am)
- WhatsApp link: `https://wa.me/381693349457?text=...`
- Email from: `bookings@apartmani-jovca.vercel.app` (custom domain)