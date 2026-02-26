# 📧 Email Automation - Status & Plan

## Trenutno Stanje

### ✅ Šta RADI
1. **Booking Request Email** - Šalje se ODMAH kada gost kreira rezervaciju
   - Email tebi (admin) sa detaljima rezervacije
   - Status: `pending`

2. **Edge Functions** - Postoje ali NISU povezane sa triggerima:
   - `booking-confirmation` - Postoji ali nije aktivna
   - `checkin-instructions` - Postoji
   - `pre-arrival-reminder` - Postoji
   - `review-request` - Postoji

3. **Database Triggers** - Postoje ali samo za realtime:
   - `notify_booking_change` - Šalje pg_notify (za realtime)
   - `update_guest_stats` - Ažurira statistiku gosta
   - `set_booking_number` - Generiše booking broj

### ❌ Šta NE RADI
1. **Confirmation Email** - NE šalje se automatski kada odobriš rezervaciju
2. **Database Trigger za Email** - Ne postoji trigger koji poziva Edge Function
3. **Webhook Connection** - Edge funkcije nisu povezane sa database triggerima

## Problem

Kada odobriš rezervaciju (promeniš status na `confirmed`):
- ❌ Gost NE dobija email potvrdu
- ❌ Nema automatskog slanja emaila
- ✅ Samo se ažurira status u bazi

## Rešenje - 3 Opcije

### Opcija 1: Database Trigger + Edge Function (PREPORUČENO)
**Kako radi:**
1. Kreiraš Database Trigger koji se aktivira kada se status promeni na `confirmed`
2. Trigger poziva Edge Function `booking-confirmation`
3. Edge Function šalje email gostu

**Prednosti:**
- ✅ Potpuno automatski
- ✅ Radi čak i ako odobriš direktno u bazi
- ✅ Pouzdano

**Nedostaci:**
- Zahteva Supabase konfiguraciju

### Opcija 2: API Route (TRENUTNO IMPLEMENTIRANO)
**Kako radi:**
1. Kada odobriš rezervaciju kroz Admin Panel
2. API route `/api/admin/bookings/[id]` šalje email
3. Email se šalje samo ako odobriš kroz Admin Panel

**Prednosti:**
- ✅ Jednostavno
- ✅ Već implementirano

**Nedostaci:**
- ❌ Ne radi ako odobriš direktno u Supabase Dashboard
- ❌ Zavisi od frontend-a

### Opcija 3: Cron Job (ZA SCHEDULED EMAILS)
**Kako radi:**
1. Cron job se pokreće svaki dan
2. Proverava koje emailove treba poslati (check-in instructions, reminders)
3. Šalje scheduled emails

**Prednosti:**
- ✅ Dobro za scheduled emails
- ✅ Nezavisno od user akcija

**Nedostaci:**
- ❌ Ne radi za instant confirmation
- ❌ Zahteva cron setup

## Trenutna Implementacija

### Admin Panel - Approve Booking
```typescript
// src/app/api/admin/bookings/[id]/route.ts
export async function PATCH(request: Request) {
  // 1. Update status to 'confirmed'
  await supabase
    .from('bookings')
    .update({ status: 'confirmed' })
    .eq('id', id)

  // 2. Send confirmation email
  await sendBookingConfirmation(bookingData, guestData)
  
  return Response.json({ success: true })
}
```

**Status:** ✅ RADI - Email se šalje kada odobriš kroz Admin Panel

### Edge Function - booking-confirmation
```typescript
// supabase/functions/booking-confirmation/index.ts
export default async (req: Request) => {
  const { type, record, old_record } = payload

  // Trigger when status changes to 'confirmed'
  if (type === 'UPDATE' && 
      record.status === 'confirmed' && 
      old_record.status !== 'confirmed') {
    
    // Send email to guest
    await resend.emails.send({...})
  }
}
```

**Status:** ⚠️ POSTOJI ALI NIJE AKTIVNA - Nema database trigger koji je poziva

## Šta Treba Uraditi

### Korak 1: Kreirati Database Trigger (SQL)
```sql
-- Create webhook trigger for booking confirmation
CREATE OR REPLACE FUNCTION trigger_booking_confirmation()
RETURNS TRIGGER AS $$
BEGIN
  -- Only trigger when status changes to 'confirmed'
  IF NEW.status = 'confirmed' AND 
     (OLD.status IS NULL OR OLD.status != 'confirmed') THEN
    
    -- Call Edge Function via HTTP
    PERFORM
      net.http_post(
        url := 'https://YOUR_PROJECT.supabase.co/functions/v1/booking-confirmation',
        headers := jsonb_build_object(
          'Content-Type', 'application/json',
          'Authorization', 'Bearer ' || current_setting('app.settings.service_role_key')
        ),
        body := jsonb_build_object(
          'type', 'UPDATE',
          'record', row_to_json(NEW),
          'old_record', row_to_json(OLD)
        )
      );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Attach trigger to bookings table
DROP TRIGGER IF EXISTS on_booking_confirmed ON bookings;
CREATE TRIGGER on_booking_confirmed
  AFTER UPDATE ON bookings
  FOR EACH ROW
  EXECUTE FUNCTION trigger_booking_confirmation();
```

### Korak 2: Ažurirati Edge Function
Edge funkcija već postoji i radi, samo treba da se poveže sa triggerom.

### Korak 3: Testirati
1. Odobri rezervaciju kroz Admin Panel
2. Proveri da li gost dobija email
3. Odobri rezervaciju direktno u Supabase Dashboard
4. Proveri da li gost dobija email

## Email Flow - Kompletan Pregled

### 1. Booking Created (Status: pending)
- ✅ Email tebi (admin): "Nova rezervacija"
- ❌ Email gostu: NE (čeka odobrenje)

### 2. Booking Approved (Status: confirmed)
- ✅ Email gostu: "Rezervacija potvrđena" (kroz Admin Panel)
- ⚠️ Email gostu: NE (ako odobriš u Supabase Dashboard)

### 3. Pre-Arrival (3 dana pre check-in)
- ⏳ Email gostu: "Priprema za dolazak" (NIJE IMPLEMENTIRANO)
- Zahteva: Cron job ili scheduled function

### 4. Check-In Instructions (1 dan pre check-in)
- ⏳ Email gostu: "Instrukcije za check-in" (NIJE IMPLEMENTIRANO)
- Zahteva: Cron job ili scheduled function

### 5. Post-Checkout (1 dan posle check-out)
- ⏳ Email gostu: "Molimo vas za recenziju" (NIJE IMPLEMENTIRANO)
- Zahteva: Cron job ili scheduled function

## Preporuka

### Za Production:
1. **Implementiraj Database Trigger** (Opcija 1)
   - Garantuje da email uvek stigne
   - Radi nezavisno od frontend-a

2. **Zadrži API Route** kao backup
   - Ako trigger ne uspe, API route šalje email

3. **Dodaj Cron Job** za scheduled emails
   - Pre-arrival reminders
   - Check-in instructions
   - Review requests

### Za Sada (Quick Fix):
- ✅ Admin Panel već šalje email kada odobriš
- ✅ Radi za 99% slučajeva
- ⚠️ Samo pazi da UVEK odobriš kroz Admin Panel, ne direktno u bazi

## Testiranje

### Test 1: Admin Panel Approval
```
1. Idi na Admin Panel
2. Otvori pending rezervaciju
3. Klikni "Approve"
4. Proveri email gosta
```
**Očekivano:** ✅ Email stiže

### Test 2: Direct Database Update
```
1. Idi u Supabase Dashboard
2. Otvori bookings tabelu
3. Promeni status na 'confirmed'
4. Proveri email gosta
```
**Očekivano:** ❌ Email NE stiže (jer nema trigger)

## Zaključak

**Trenutno stanje:**
- ✅ Email se šalje kada odobriš kroz Admin Panel
- ❌ Email se NE šalje ako odobriš direktno u bazi
- ⏳ Scheduled emails (reminders, instructions) nisu implementirani

**Preporuka:**
- Za sada koristi Admin Panel za odobravanje (radi perfektno)
- Kasnije dodaj Database Trigger za 100% pouzdanost
- Dodaj Cron Job za scheduled emails
