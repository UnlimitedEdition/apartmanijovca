# Availability Integration - Requirements

## Problem Statement

Availability tabela postoji u bazi sa 1464 zapisa ali se NE koristi nigde u kodu. Trenutno sistem koristi samo `bookings` tabelu za proveru dostupnosti, što znači da:

1. Manuelno blokirani datumi (maintenance, blocked) se ne prikazuju
2. Price overrides se ne primenjuju
3. Admin ne može da upravlja dostupnošću van bookinga

## Current State

### Database Schema
```sql
availability (
  id uuid PRIMARY KEY,
  apartment_id uuid NOT NULL,
  date date NOT NULL,
  is_available boolean DEFAULT true,
  price_override numeric(10,2),
  reason text CHECK (reason IN ('booked', 'maintenance', 'blocked')),
  booking_id uuid,
  UNIQUE(apartment_id, date)
)
```

### Current Code Behavior
- `src/app/api/availability/route.ts` - koristi SAMO bookings tabelu
- `src/hooks/useAvailability.ts` - koristi SAMO bookings tabelu
- Admin panel - NEMA UI za upravljanje availability tabelom

## Requirements

### R1: Availability API Integration
API mora da:
- Proveri `availability` tabelu PRVO
- Ako datum postoji u availability i `is_available = false`, vratiti kao nedostupan
- Ako datum postoji u availability sa `price_override`, koristiti tu cenu
- Ako datum NE postoji u availability, proveriti bookings tabelu (trenutno ponašanje)

### R2: Admin Panel - Availability Manager
Admin mora moći da:
- Vidi kalendar sa svim datumima za svaki apartman
- Blokira datume (reason: 'maintenance' ili 'blocked')
- Postavi price override za specifične datume
- Vidi koje datume su blokirani bookingom vs manuelno

### R3: Public Calendar Display
Javni kalendar mora da:
- Prikaže nedostupne datume iz BOTH availability i bookings tabela
- Prikaže custom cene ako postoje price overrides
- Razlikuje tipove nedostupnosti (booked, maintenance, blocked)

## Success Criteria

1. Availability tabela se koristi u svim availability provera
2. Admin može da blokira/odblokira datume
3. Admin može da postavi custom cene
4. Javni kalendar prikazuje sve nedostupne datume
5. Price overrides se primenjuju u booking procesu
