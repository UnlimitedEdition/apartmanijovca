# PUBLIC TEMPLATE - Plan za 100% Prikaz

## TRENUTNO: 20/41 polja (49%)
## CILJ: 41/41 polja (100%)

---

## 📋 POLJA ZA DODAVANJE (21)

### 1. Osnovne informacije sekcija
- ✅ Već prikazano: capacity, bed_type, bathroom_count, size_sqm
- ➕ **floor** - Dodati ikonu + "Sprat X"
- ➕ **balcony** - Dodati ikonu ako true
- ➕ **bed_counts** - Detaljan prikaz kreveta (umesto samo bed_type)

### 2. Sadržaji sekcija
- ✅ Već prikazano: selected_amenities (WiFi, parking, AC, TV, kuhinja)
- ➕ **kitchen_type** - Prikazati tip kuhinje
- ➕ **features** - Lista dodatnih karakteristika
- ➕ **selected_view** - Tip pogleda (more, planine, grad)

### 3. Pravila kuće sekcija
- ✅ Već prikazano: check_in_time, check_out_time, selected_rules
- ➕ **house_rules** - Detaljan tekst pravila (multi-language)
- ➕ **min_stay_nights** - Minimalan boravak
- ➕ **max_stay_nights** - Maksimalan boravak

### 4. Cenovnik sekcija (NOVA)
- ✅ Već prikazano: base_price_eur
- ➕ **weekend_price_eur** - Vikend cena
- ➕ **weekly_discount_percent** - Nedeljni popust
- ➕ **monthly_discount_percent** - Mesečni popust
- ➕ **seasonal_pricing** - Sezonske cene (tabela)

### 5. Politika otkazivanja sekcija (NOVA)
- ➕ **cancellation_policy** - Multi-language tekst

### 6. Multimedija sekcija (NOVA)
- ➕ **video_url** - Embed YouTube video
- ➕ **virtual_tour_url** - Embed virtuelna tura

### 7. Galerija
- ✅ Već prikazano: images
- ➕ **gallery** - Galerija sa caption-ima (umesto images)

### 8. Lokacija
- ✅ Već prikazano: address, city, country, latitude, longitude (mapa)
- ➕ **postal_code** - Dodati u adresu

### 9. Meta polja (ne prikazuju se na stranici)
- ✅ meta_title, meta_description, meta_keywords - Koriste se za SEO

---

## 🎨 NOVI UI LAYOUT

```
┌─────────────────────────────────────────────────────────┐
│ HERO - Galerija slika + Naziv + Lokacija               │
└─────────────────────────────────────────────────────────┘

┌──────────────────────────┬──────────────────────────────┐
│ LEVA KOLONA (2/3)        │ DESNA KOLONA (1/3)          │
│                          │                              │
│ ┌──────────────────────┐ │ ┌──────────────────────────┐│
│ │ Osnovne informacije  │ │ │ Booking CTA              ││
│ │ - Kapacitet          │ │ │ - Osnovna cena           ││
│ │ - Kreveti (detalji)  │ │ │ - Vikend cena            ││
│ │ - Kupatila           │ │ │ - Popusti                ││
│ │ - Veličina           │ │ │ - Sezonske cene          ││
│ │ - Sprat ⭐           │ │ │ - CTA button             ││
│ │ - Balkon ⭐          │ │ └──────────────────────────┘│
│ └──────────────────────┘ │                              │
│                          │                              │
│ ┌──────────────────────┐ │                              │
│ │ O apartmanu          │ │                              │
│ │ - Opis               │ │                              │
│ └──────────────────────┘ │                              │
│                          │                              │
│ ┌──────────────────────┐ │                              │
│ │ Sadržaji ⭐          │ │                              │
│ │ - Amenities          │ │                              │
│ │ - Tip kuhinje        │ │                              │
│ │ - Features lista     │ │                              │
│ │ - Pogled             │ │                              │
│ └──────────────────────┘ │                              │
│                          │                              │
│ ┌──────────────────────┐ │                              │
│ │ Pravila kuće ⭐      │ │                              │
│ │ - Check-in/out       │ │                              │
│ │ - Min/max boravak    │ │                              │
│ │ - Pravila (detalji)  │ │                              │
│ │ - House rules tekst  │ │                              │
│ └──────────────────────┘ │                              │
│                          │                              │
│ ┌──────────────────────┐ │                              │
│ │ Politika otkazivanja │ │                              │
│ │ ⭐ NOVA SEKCIJA      │ │                              │
│ └──────────────────────┘ │                              │
│                          │                              │
│ ┌──────────────────────┐ │                              │
│ │ Video i tura ⭐      │ │                              │
│ │ - YouTube embed      │ │                              │
│ │ - Virtual tour       │ │                              │
│ └──────────────────────┘ │                              │
│                          │                              │
│ ┌──────────────────────┐ │                              │
│ │ Lokacija             │ │                              │
│ │ - Adresa + poštanski │ │                              │
│ │ - Mapa               │ │                              │
│ └──────────────────────┘ │                              │
└──────────────────────────┴──────────────────────────────┘
```

---

## 🔧 IMPLEMENTACIJA

### Fajlovi za izmenu
1. `src/app/[lang]/apartments/[slug]/ApartmentDetailView.tsx` - Glavni template
2. `src/lib/transformers/database.ts` - Transformer (dodati nova polja)

### Koraci
1. ✅ Dodati floor + balcony u Osnovne informacije
2. ✅ Prikazati bed_counts detalje
3. ✅ Dodati kitchen_type, features, selected_view u Sadržaje
4. ✅ Dodati house_rules, min/max_stay u Pravila
5. ✅ Kreirati novu sekciju Cenovnik
6. ✅ Kreirati novu sekciju Politika otkazivanja
7. ✅ Kreirati novu sekciju Video i tura
8. ✅ Dodati postal_code u Lokaciju
9. ✅ Ažurirati transformer da uključuje sva polja

---

## 🎯 PRIORITET

1. **VISOK** - Osnovne info (floor, balcony, bed_counts)
2. **VISOK** - Sadržaji (kitchen_type, features, view)
3. **SREDNJI** - Pravila (house_rules, min/max_stay)
4. **SREDNJI** - Cenovnik (weekend, popusti, sezonske)
5. **NIZAK** - Video/tura, Politika otkazivanja

---

SLEDEĆI KORAK: Implementacija!
