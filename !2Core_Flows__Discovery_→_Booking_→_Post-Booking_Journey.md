# Core Flows: Discovery → Booking → Post-Booking Journey

## Overview

Ovaj dokument definiše ključne korisničke tokove (user flows) za Apartmani Jovča sajt, od discovery-ja preko booking-a do post-booking iskustva. Flows su dizajnirani da maksimizuju konverziju, grade trust, i omoguće direktne rezervacije bez zavisnosti od platformi.

**Ključni Principi:**

- **Request to Book model** - Korisnik šalje zahtev, dobija potvrdu u < 2 sata
- **Real-time kalendar** - Tačna dostupnost i cene
- **4-Step booking** - Datumi → Apartman → Opcije → Kontakt
- **Multiple CTAs** - Svuda dostupni call-to-action dugmad
- **Trust bez urgency** - Faktičke informacije, bez agresivnih taktika
- **Mobile-first** - Optimizovano za mobilne uređaje
- **SEO fokus** - Organic discovery kao primarni kanal

---

## Flow 1: SEO Discovery & Landing

**Opis:** Kako korisnici pronalaze sajt preko Google pretrage i šta vide kada stignu.

**Trigger:** Korisnik pretražuje Google za "apartmani bovansko jezero", "smeštaj bovansko jezero", ili slične termine.

### Koraci:

1. **Google Search**
  - Korisnik unosi search query
  - Vidi Apartmani Jovča na #1 poziciji (cilj)
  - Meta description: "Apartmani Jovča - Od 30€/noć | 4.9★ | Bovansko jezero | Direktna rezervacija"
  - Rich snippets: Rating stars, cena, dostupnost
2. **Landing na Homepage**
  - Instant load (< 2s) - kritično za SEO i bounce rate
  - Hero sekcija odmah vidljiva:
    - Velika hero slika Bovanskog jezera
    - Headline: "Apartmani Jovča - Vaš mir na Bovanskom jezeru"
    - Subheadline: "Od 30€ po noći" (cena kao prioritet)
    - Rating: "4.9★ od 150 gostiju" (trust signal)
    - Prominentni CTA: "Proverite dostupnost"
3. **First Impression (Above the Fold)**
  - Sticky header sa:
    - Logo
    - Navigacija (Početna, Galerija, Cene, Atrakcije, Kontakt)
    - Language switcher (SR, EN, IT, DE)
    - "Rezervišite sada" dugme (sticky CTA)
  - Hero booking widget (desktop) ili floating CTA (mobile)
  - Scroll indicator: "Saznajte više ↓"
4. **Scroll Exploration**
  - Featured apartmani sa cenama
  - Reviews section: "Šta kažu naši gosti"
  - Lokacija i atrakcije preview
  - Trust badges: "Verified Property", "COVID-Safe"
  - Multiple CTAs na različitim mestima

**Exit Points:**

- Klik na "Rezervišite sada" → Booking Flow
- Klik na "Galerija" → Exploration Flow
- Klik na "Cene" → Prices Flow
- Bounce (cilj: < 30%)

**UI Feedback:**

- Smooth scroll animations
- Hover effects na CTAs
- Loading indicators za slike
- Mobile: Touch-optimized, larger tap targets

---

## Flow 2: Homepage First Impression

**Opis:** Detaljni prikaz homepage-a i kako korisnik interaguje sa njim.

**Trigger:** Korisnik stiže na homepage (bilo kojim putem).

### Koraci:

1. **Hero Section Load**
  - Hero image: Panorama Bovanskog jezera (optimizovana, lazy load)
  - Headline: "Apartmani Jovča - Vaš mir na Bovanskom jezeru"
  - Cena: "Od 30€ po noći" (veliki, bold font)
  - Rating: "4.9★ (150 recenzija)" sa linkom na reviews
  - Primary CTA: "Proverite dostupnost" (plavi, veliki dugme)
  - Secondary CTA: "Pogledajte galeriju" (outline dugme)
2. **Quick Info Cards**
  - 3-4 kartice sa key features:
    - "Direktno na jezeru" + ikona
    - "Besplatan parking" + ikona
    - "WiFi uključen" + ikona
    - "Porodično okruženje" + ikona
3. **Featured Apartments Preview**
  - 2-3 apartmana sa:
    - Slika apartmana
    - Naziv (npr. "Apartman Deluxe")
    - Cena: "Od 35€/noć"
    - Rating: "4.9★"
    - Kapacitet: "2-4 osobe"
    - Inline CTA: "Rezerviši" dugme
4. **Reviews Section**
  - Naslov: "Šta kažu naši gosti"
  - 3 featured reviews sa:
    - Avatar (inicijali)
    - Ime gosta
    - Rating (5 zvezdica)
    - Komentar (2-3 linije)
    - Datum
  - CTA: "Pročitajte sve recenzije (150)"
5. **Location & Attractions Preview**
  - Mapa lokacije
  - 3-4 top atrakcije sa ikonama
  - CTA: "Otkrijte okolinu"
6. **Final CTA Section**
  - Headline: "Spremni za nezaboravan odmor?"
  - CTA: "Rezervišite sada" (veliki, centriran)
  - Kontakt info: Telefon, email, WhatsApp

**Multiple CTA Locations:**

- Hero section (primary)
- Sticky header (uvek vidljiv)
- Inline sa apartmanima
- Floating action button (donji desni ugao)
- End of page
- Sidebar widget (desktop only)

**Mobile Optimizations:**

- Hero: Vertikalni layout, veći font
- CTAs: Larger touch targets (min 48px)
- Click-to-call: Telefon broj je klikabilan
- WhatsApp: Floating WhatsApp dugme
- Simplified navigation: Hamburger menu

```wireframe
<!DOCTYPE html>
<html lang="sr">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Homepage Hero - Apartmani Jovča</title>
<style>
* { margin: 0; padding: 0; box-sizing: border-box; }
body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; }

/* Header */
.header {
  position: sticky;
  top: 0;
  background: white;
  border-bottom: 1px solid #e5e7eb;
  padding: 1rem 2rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  z-index: 100;
}
.logo { font-size: 1.5rem; font-weight: bold; color: #1e40af; }
.nav { display: flex; gap: 2rem; }
.nav a { text-decoration: none; color: #374151; }
.header-cta {
  background: #2563eb;
  color: white;
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  border: none;
  font-weight: 600;
  cursor: pointer;
}

/* Hero Section */
.hero {
  position: relative;
  height: 600px;
  background: linear-gradient(rgba(0,0,0,0.3), rgba(0,0,0,0.3)), 
              url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 600"><rect fill="%234299e1" width="1200" height="600"/><text x="50%" y="50%" text-anchor="middle" fill="white" font-size="48">Bovansko Jezero</text></svg>');
  background-size: cover;
  background-position: center;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  text-align: center;
}
.hero-content { max-width: 800px; padding: 2rem; }
.hero h1 { font-size: 3rem; margin-bottom: 1rem; }
.hero .price { font-size: 2rem; color: #fbbf24; margin: 1rem 0; }
.hero .rating { font-size: 1.25rem; margin: 1rem 0; }
.hero .rating span { color: #fbbf24; }
.hero-ctas { display: flex; gap: 1rem; justify-content: center; margin-top: 2rem; }
.btn-primary {
  background: #2563eb;
  color: white;
  padding: 1rem 2rem;
  border-radius: 8px;
  border: none;
  font-size: 1.125rem;
  font-weight: 600;
  cursor: pointer;
}
.btn-secondary {
  background: transparent;
  color: white;
  padding: 1rem 2rem;
  border-radius: 8px;
  border: 2px solid white;
  font-size: 1.125rem;
  font-weight: 600;
  cursor: pointer;
}

/* Quick Info */
.quick-info {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 2rem;
  max-width: 1200px;
  margin: -3rem auto 4rem;
  padding: 0 2rem;
  position: relative;
  z-index: 10;
}
.info-card {
  background: white;
  padding: 2rem;
  border-radius: 12px;
  box-shadow: 0 4px 6px rgba(0,0,0,0.1);
  text-align: center;
}
.info-card .icon {
  width: 48px;
  height: 48px;
  background: #dbeafe;
  border-radius: 50%;
  margin: 0 auto 1rem;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
}

/* Featured Apartments */
.featured {
  max-width: 1200px;
  margin: 4rem auto;
  padding: 0 2rem;
}
.featured h2 { font-size: 2rem; margin-bottom: 2rem; text-align: center; }
.apartments {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 2rem;
}
.apartment-card {
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  overflow: hidden;
}
.apartment-card .image {
  height: 200px;
  background: #e5e7eb;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #6b7280;
}
.apartment-card .content { padding: 1.5rem; }
.apartment-card h3 { font-size: 1.25rem; margin-bottom: 0.5rem; }
.apartment-card .price { color: #2563eb; font-size: 1.5rem; font-weight: bold; margin: 0.5rem 0; }
.apartment-card .rating { color: #fbbf24; margin: 0.5rem 0; }
.apartment-card .capacity { color: #6b7280; margin: 0.5rem 0; }
.apartment-card button {
  width: 100%;
  background: #2563eb;
  color: white;
  padding: 0.75rem;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  margin-top: 1rem;
}

/* Floating CTA */
.floating-cta {
  position: fixed;
  bottom: 2rem;
  right: 2rem;
  background: #2563eb;
  color: white;
  width: 60px;
  height: 60px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 12px rgba(0,0,0,0.3);
  cursor: pointer;
  font-size: 24px;
  z-index: 50;
}

@media (max-width: 768px) {
  .hero h1 { font-size: 2rem; }
  .quick-info { grid-template-columns: 1fr 1fr; }
  .apartments { grid-template-columns: 1fr; }
  .nav { display: none; }
}
</style>
</head>
<body>

<!-- Sticky Header -->
<header class="header" data-element-id="sticky-header">
  <div class="logo">Apartmani Jovča</div>
  <nav class="nav">
    <a href="#home">Početna</a>
    <a href="#gallery">Galerija</a>
    <a href="#prices">Cene</a>
    <a href="#attractions">Atrakcije</a>
    <a href="#contact">Kontakt</a>
  </nav>
  <button class="header-cta" data-element-id="header-cta">Rezervišite sada</button>
</header>

<!-- Hero Section -->
<section class="hero" data-element-id="hero-section">
  <div class="hero-content">
    <h1>Apartmani Jovča<br>Vaš mir na Bovanskom jezeru</h1>
    <div class="price">Od 30€ po noći</div>
    <div class="rating">
      <span>★★★★★</span> 4.9 (150 recenzija)
    </div>
    <div class="hero-ctas">
      <button class="btn-primary" data-element-id="hero-primary-cta">Proverite dostupnost</button>
      <button class="btn-secondary" data-element-id="hero-secondary-cta">Pogledajte galeriju</button>
    </div>
  </div>
</section>

<!-- Quick Info Cards -->
<section class="quick-info">
  <div class="info-card">
    <div class="icon">🏖️</div>
    <h3>Direktno na jezeru</h3>
    <p>Pogled na vodu</p>
  </div>
  <div class="info-card">
    <div class="icon">🅿️</div>
    <h3>Besplatan parking</h3>
    <p>Sigurno parkiranje</p>
  </div>
  <div class="info-card">
    <div class="icon">📶</div>
    <h3>WiFi uključen</h3>
    <p>Brzi internet</p>
  </div>
  <div class="info-card">
    <div class="icon">👨‍👩‍👧‍👦</div>
    <h3>Porodično</h3>
    <p>Idealno za porodice</p>
  </div>
</section>

<!-- Featured Apartments -->
<section class="featured">
  <h2>Naši Apartmani</h2>
  <div class="apartments">
    <div class="apartment-card">
      <div class="image">Apartman Deluxe</div>
      <div class="content">
        <h3>Apartman Deluxe</h3>
        <div class="price">Od 35€/noć</div>
        <div class="rating">★★★★★ 4.9</div>
        <div class="capacity">👥 2-4 osobe</div>
        <button data-element-id="apartment-cta-1">Rezerviši</button>
      </div>
    </div>
    <div class="apartment-card">
      <div class="image">Apartman Standard</div>
      <div class="content">
        <h3>Apartman Standard</h3>
        <div class="price">Od 30€/noć</div>
        <div class="rating">★★★★★ 4.8</div>
        <div class="capacity">👥 2-3 osobe</div>
        <button data-element-id="apartment-cta-2">Rezerviši</button>
      </div>
    </div>
    <div class="apartment-card">
      <div class="image">Apartman Family</div>
      <div class="content">
        <h3>Apartman Family</h3>
        <div class="price">Od 40€/noć</div>
        <div class="rating">★★★★★ 5.0</div>
        <div class="capacity">👥 4-6 osoba</div>
        <button data-element-id="apartment-cta-3">Rezerviši</button>
      </div>
    </div>
  </div>
</section>

<!-- Floating CTA -->
<div class="floating-cta" data-element-id="floating-cta">📅</div>

</body>
</html>
```

---

## Flow 3: Apartment Exploration

**Opis:** Kako korisnik istražuje apartmane, galeriju, i atrakcije pre nego što odluči da rezerviše.

**Trigger:** Klik na "Galerija", "Cene", ili "Atrakcije" u navigaciji.

### Koraci:

1. **Gallery Page**
  - Masonry grid layout sa slikama
  - Lightbox za pregled slika (prev/next, zoom)
  - Kategorije: "Apartmani", "Jezero", "Okolina"
  - Reviews inline: "Slike od naših gostiju"
  - CTA na kraju: "Videli ste dovoljno? Rezervišite sada"
2. **Prices Page**
  - Hero: "Transparentne cene bez skrivenih troškova"
  - Rating: "4.9★ od 150 gostiju" (trust signal)
  - Grid sa apartmanima:
    - Slika
    - Naziv
    - Cena: "Od X€/noć"
    - Rating inline
    - Kapacitet, tip kreveta
    - Amenities (WiFi, parking, itd.)
    - Inline CTA: "Rezerviši ovaj apartman"
  - Sidebar (desktop): Booking widget sa kalendarom
  - Faktičke informacije: "Rezervisano 45 puta u poslednjih 30 dana" (bez urgency)
3. **Attractions Page**
  - Hero: "Otkrijte lepote Bovanskog jezera"
  - Grid sa atrakcijama:
    - Ikona
    - Naziv (npr. "Bovansko jezero")
    - Opis
    - Udaljenost od apartmana
  - Mapa sa pinovima
  - CTA: "Rezervišite i istražite okolinu"
4. **Navigation Between Pages**
  - Breadcrumbs: "Početna > Galerija"
  - Sticky header sa navigacijom
  - "Sledeća stranica" suggestions na kraju

**Exit Points:**

- Klik na bilo koji CTA → Booking Flow
- Back to homepage
- Bounce

**UI Feedback:**

- Smooth page transitions
- Image lazy loading
- Skeleton screens tokom učitavanja
- Mobile: Swipe gestures za galeriju

---

## Flow 4: Booking Flow (4-Step Process)

**Opis:** Detaljni 4-step booking proces od izbora datuma do slanja zahteva.

**Trigger:** Klik na bilo koji "Rezervišite sada" / "Proverite dostupnost" CTA.

### Step 1: Izbor Datuma

**UI:**

- Headline: "Kada želite da dođete?"
- Single calendar (kao Airbnb):
  - Check-in datum (klik)
  - Check-out datum (klik)
  - Dostupni datumi: zeleno
  - Zauzeti datumi: sivo (disabled)
  - Cena po noći prikazana na svakom datumu
- Real-time total kalkulacija:
  - "3 noći x 30€ = 90€ total"
  - Prikazuje se dok korisnik bira datume
- Broj gostiju selector: "Koliko vas dolazi?"
  - Dropdown: 1, 2, 3, 4, 5, 6+ osoba
- Progress indicator: "Korak 1 od 4"
- CTA: "Dalje" (disabled dok ne izabere datume)

**Validacija:**

- Minimum stay: 2 noći (prikazano u kalendaru)
- Check-in/check-out: Ne može isti dan
- Broj gostiju: Obavezno

**UI Feedback:**

- Kalendar se ažurira u real-time
- Total cena se kalkuliše dok bira
- Disabled datumi su jasno označeni
- Mobile: Touch-friendly calendar

**Exit:**

- Klik "Dalje" → Step 2
- Klik "Nazad" → Prethodna stranica
- Close (X) → Potvrda: "Sigurni ste da želite da napustite?"

### Step 2: Izbor Apartmana

**UI:**

- Headline: "Izaberite apartman"
- Subheadline: "Za 3 noći, 2 osobe, 15-18 Maj" (recap izbora)
- Lista dostupnih apartmana za izabrane datume:
  - Slika apartmana
  - Naziv
  - Rating: "4.9★ (45 recenzija)"
  - Kapacitet: "2-4 osobe"
  - Amenities: WiFi, parking, pogled na jezero
  - Cena: "30€/noć"
  - Total: "90€ za 3 noći"
  - Radio button za izbor
  - "Više detalja" link (expand)
- Faktičke informacije: "Rezervisan 12 puta u poslednjih 30 dana"
- Progress indicator: "Korak 2 od 4"
- CTAs: "Nazad" | "Dalje"

**Validacija:**

- Mora izabrati jedan apartman

**UI Feedback:**

- Selected apartman: Highlighted border
- Expand/collapse detalja
- Mobile: Swipe za više apartmana

**Exit:**

- Klik "Dalje" → Step 3
- Klik "Nazad" → Step 1 (zadržava izbor datuma)

### Step 3: Dodatne Opcije

**UI:**

- Headline: "Dodatne opcije i posebni zahtevi"
- Subheadline: Recap (datumi, apartman, cena)
- Opcije (checkboxes):
  - "Dečiji krevetac" (besplatno)
  - "Dodatni parking" (besplatno)
  - "Rani check-in (pre 14h)" (na upit)
  - "Kasni check-out (posle 10h)" (na upit)
- Posebni zahtevi (textarea):
  - "Imate li posebne zahteve ili pitanja?"
  - Placeholder: "Npr. alergije, prehrambene potrebe, itd."
- Vreme dolaska (select):
  - "Kada planirate da stignete?"
  - Opcije: 14-16h, 16-18h, 18-20h, Posle 20h
- Progress indicator: "Korak 3 od 4"
- CTAs: "Nazad" | "Dalje"

**Validacija:**

- Sve opciono (može skip)

**UI Feedback:**

- Character count za textarea (max 500)
- Checkboxes: Instant feedback

**Exit:**

- Klik "Dalje" → Step 4
- Klik "Nazad" → Step 2

### Step 4: Kontakt Informacije

**UI:**

- Headline: "Vaše kontakt informacije"
- Subheadline: "Odgovorićemo u roku od 2 sata (9-21h)"
- Forma:
  - Ime i prezime* (text input)
  - Email* (email input)
  - Telefon* (tel input)
  - Broj gostiju* (number, pre-filled iz Step 1)
- Booking Summary (sidebar ili card):
  - Apartman: "Deluxe"
  - Datumi: "15-18 Maj (3 noći)"
  - Gosti: "2 osobe"
  - Opcije: Lista izabranih opcija
  - Total: "90€"
- Checkbox: "Prihvatam uslove korišćenja i politiku privatnosti"*
- Progress indicator: "Korak 4 od 4"
- CTAs: "Nazad" | "Pošaljite zahtev"

**Validacija:**

- Sva polja obavezna (*)
- Email: Validacija formata
- Telefon: Validacija formata
- Checkbox: Mora biti checked

**UI Feedback:**

- Real-time validacija
- Error messages ispod polja
- "Pošaljite zahtev" disabled dok forma nije validna
- Loading state na submit

**Exit:**

- Klik "Pošaljite zahtev" → Confirmation Page
- Klik "Nazad" → Step 3

```wireframe
<!DOCTYPE html>
<html lang="sr">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Booking Flow - 4 Steps</title>
<style>
* { margin: 0; padding: 0; box-sizing: border-box; }
body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; background: #f9fafb; }

.container { max-width: 1200px; margin: 0 auto; padding: 2rem; }

/* Progress Indicator */
.progress {
  display: flex;
  justify-content: space-between;
  margin-bottom: 3rem;
  position: relative;
}
.progress::before {
  content: '';
  position: absolute;
  top: 20px;
  left: 0;
  right: 0;
  height: 2px;
  background: #e5e7eb;
  z-index: 0;
}
.progress-step {
  display: flex;
  flex-direction: column;
  align-items: center;
  position: relative;
  z-index: 1;
  flex: 1;
}
.progress-step .circle {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: #e5e7eb;
  color: #6b7280;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  margin-bottom: 0.5rem;
}
.progress-step.active .circle {
  background: #2563eb;
  color: white;
}
.progress-step.completed .circle {
  background: #10b981;
  color: white;
}
.progress-step .label {
  font-size: 0.875rem;
  color: #6b7280;
  text-align: center;
}

/* Step Container */
.step {
  background: white;
  border-radius: 12px;
  padding: 2rem;
  box-shadow: 0 1px 3px rgba(0,0,0,0.1);
}
.step h2 { font-size: 1.75rem; margin-bottom: 0.5rem; }
.step .subtitle { color: #6b7280; margin-bottom: 2rem; }

/* Step 1: Calendar */
.calendar-container {
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 2rem;
}
.calendar {
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  padding: 1rem;
}
.calendar-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}
.calendar-grid {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 0.5rem;
}
.calendar-day {
  aspect-ratio: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  border: 1px solid #e5e7eb;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.875rem;
}
.calendar-day.available {
  background: #ecfdf5;
  border-color: #10b981;
}
.calendar-day.selected {
  background: #2563eb;
  color: white;
}
.calendar-day.disabled {
  background: #f3f4f6;
  color: #9ca3af;
  cursor: not-allowed;
}
.calendar-day .price {
  font-size: 0.75rem;
  color: #6b7280;
}

.booking-summary {
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  padding: 1.5rem;
  height: fit-content;
}
.booking-summary h3 { margin-bottom: 1rem; }
.summary-item {
  display: flex;
  justify-content: space-between;
  margin-bottom: 0.75rem;
  padding-bottom: 0.75rem;
  border-bottom: 1px solid #e5e7eb;
}
.summary-total {
  display: flex;
  justify-content: space-between;
  font-size: 1.25rem;
  font-weight: bold;
  margin-top: 1rem;
  padding-top: 1rem;
  border-top: 2px solid #e5e7eb;
}

/* Step 2: Apartments */
.apartment-list {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}
.apartment-option {
  display: grid;
  grid-template-columns: 200px 1fr auto;
  gap: 1.5rem;
  border: 2px solid #e5e7eb;
  border-radius: 12px;
  padding: 1.5rem;
  cursor: pointer;
}
.apartment-option.selected {
  border-color: #2563eb;
  background: #eff6ff;
}
.apartment-image {
  width: 200px;
  height: 150px;
  background: #e5e7eb;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #6b7280;
}
.apartment-details h3 { margin-bottom: 0.5rem; }
.apartment-details .rating { color: #fbbf24; margin-bottom: 0.5rem; }
.apartment-details .amenities {
  display: flex;
  gap: 1rem;
  margin-top: 0.75rem;
  color: #6b7280;
  font-size: 0.875rem;
}
.apartment-price {
  text-align: right;
}
.apartment-price .per-night {
  font-size: 1.5rem;
  font-weight: bold;
  color: #2563eb;
}
.apartment-price .total {
  color: #6b7280;
  margin-top: 0.5rem;
}

/* Step 3: Options */
.options-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 2rem;
}
.option-group h3 { margin-bottom: 1rem; }
.checkbox-option {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  margin-bottom: 0.75rem;
  cursor: pointer;
}
.checkbox-option input[type="checkbox"] {
  width: 20px;
  height: 20px;
}
textarea {
  width: 100%;
  min-height: 100px;
  padding: 0.75rem;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  font-family: inherit;
  resize: vertical;
}
select {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  font-family: inherit;
}

/* Step 4: Contact */
.contact-form {
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 2rem;
}
.form-group {
  margin-bottom: 1.5rem;
}
.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
}
.form-group input {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  font-family: inherit;
}
.form-group.error input {
  border-color: #ef4444;
}
.form-group .error-message {
  color: #ef4444;
  font-size: 0.875rem;
  margin-top: 0.25rem;
}
.checkbox-group {
  display: flex;
  align-items: start;
  gap: 0.75rem;
}
.checkbox-group input[type="checkbox"] {
  width: 20px;
  height: 20px;
  margin-top: 0.25rem;
}

/* Actions */
.actions {
  display: flex;
  justify-content: space-between;
  margin-top: 2rem;
  padding-top: 2rem;
  border-top: 1px solid #e5e7eb;
}
.btn {
  padding: 0.75rem 2rem;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  border: none;
  font-size: 1rem;
}
.btn-secondary {
  background: white;
  color: #374151;
  border: 1px solid #e5e7eb;
}
.btn-primary {
  background: #2563eb;
  color: white;
}
.btn-primary:disabled {
  background: #9ca3af;
  cursor: not-allowed;
}

@media (max-width: 768px) {
  .calendar-container,
  .apartment-option,
  .options-grid,
  .contact-form {
    grid-template-columns: 1fr;
  }
}
</style>
</head>
<body>

<div class="container">
  <!-- Progress Indicator -->
  <div class="progress">
    <div class="progress-step active">
      <div class="circle">1</div>
      <div class="label">Datumi</div>
    </div>
    <div class="progress-step">
      <div class="circle">2</div>
      <div class="label">Apartman</div>
    </div>
    <div class="progress-step">
      <div class="circle">3</div>
      <div class="label">Opcije</div>
    </div>
    <div class="progress-step">
      <div class="circle">4</div>
      <div class="label">Kontakt</div>
    </div>
  </div>

  <!-- Step 1: Datumi -->
  <div class="step" data-element-id="step-1">
    <h2>Kada želite da dođete?</h2>
    <p class="subtitle">Izaberite check-in i check-out datum</p>
    
    <div class="calendar-container">
      <div class="calendar">
        <div class="calendar-header">
          <button>←</button>
          <h3>Maj 2024</h3>
          <button>→</button>
        </div>
        <div class="calendar-grid">
          <div class="calendar-day disabled">1</div>
          <div class="calendar-day disabled">2</div>
          <div class="calendar-day available" data-element-id="date-3">
            <div>3</div>
            <div class="price">30€</div>
          </div>
          <div class="calendar-day available">
            <div>4</div>
            <div class="price">30€</div>
          </div>
          <div class="calendar-day selected" data-element-id="checkin">
            <div>15</div>
            <div class="price">30€</div>
          </div>
          <div class="calendar-day selected">
            <div>16</div>
            <div class="price">30€</div>
          </div>
          <div class="calendar-day selected" data-element-id="checkout">
            <div>17</div>
            <div class="price">30€</div>
          </div>
        </div>
      </div>
      
      <div class="booking-summary">
        <h3>Rezime</h3>
        <div class="summary-item">
          <span>Check-in:</span>
          <strong>15 Maj</strong>
        </div>
        <div class="summary-item">
          <span>Check-out:</span>
          <strong>18 Maj</strong>
        </div>
        <div class="summary-item">
          <span>Noći:</span>
          <strong>3</strong>
        </div>
        <div class="summary-item">
          <span>Gosti:</span>
          <select data-element-id="guests-select">
            <option>1 osoba</option>
            <option selected>2 osobe</option>
            <option>3 osobe</option>
            <option>4 osobe</option>
          </select>
        </div>
        <div class="summary-total">
          <span>Total:</span>
          <span>90€</span>
        </div>
      </div>
    </div>

    <div class="actions">
      <button class="btn btn-secondary" data-element-id="back-btn">Nazad</button>
      <button class="btn btn-primary" data-element-id="next-btn">Dalje</button>
    </div>
  </div>

  <!-- Step 2: Apartman (Hidden, shown when Step 1 complete) -->
  <div class="step" style="display:none;" data-element-id="step-2">
    <h2>Izaberite apartman</h2>
    <p class="subtitle">Za 3 noći, 2 osobe, 15-18 Maj</p>
    
    <div class="apartment-list">
      <div class="apartment-option selected" data-element-id="apartment-1">
        <div class="apartment-image">Apartman Deluxe</div>
        <div class="apartment-details">
          <h3>Apartman Deluxe</h3>
          <div class="rating">★★★★★ 4.9 (45 recenzija)</div>
          <p>Prostran apartman sa pogledom na jezero</p>
          <div class="amenities">
            <span>👥 2-4 osobe</span>
            <span>📶 WiFi</span>
            <span>🅿️ Parking</span>
            <span>🏖️ Pogled</span>
          </div>
          <p style="margin-top:0.75rem; color:#6b7280; font-size:0.875rem;">
            Rezervisan 12 puta u poslednjih 30 dana
          </p>
        </div>
        <div class="apartment-price">
          <div class="per-night">30€/noć</div>
          <div class="total">90€ za 3 noći</div>
        </div>
      </div>

      <div class="apartment-option" data-element-id="apartment-2">
        <div class="apartment-image">Apartman Family</div>
        <div class="apartment-details">
          <h3>Apartman Family</h3>
          <div class="rating">★★★★★ 5.0 (28 recenzija)</div>
          <p>Idealan za porodice, dve spavaće sobe</p>
          <div class="amenities">
            <span>👥 4-6 osoba</span>
            <span>📶 WiFi</span>
            <span>🅿️ Parking</span>
            <span>👶 Dečiji krevetac</span>
          </div>
          <p style="margin-top:0.75rem; color:#6b7280; font-size:0.875rem;">
            Rezervisan 8 puta u poslednjih 30 dana
          </p>
        </div>
        <div class="apartment-price">
          <div class="per-night">40€/noć</div>
          <div class="total">120€ za 3 noći</div>
        </div>
      </div>
    </div>

    <div class="actions">
      <button class="btn btn-secondary">Nazad</button>
      <button class="btn btn-primary">Dalje</button>
    </div>
  </div>

  <!-- Step 3: Opcije (Hidden) -->
  <div class="step" style="display:none;" data-element-id="step-3">
    <h2>Dodatne opcije i posebni zahtevi</h2>
    <p class="subtitle">Apartman Deluxe, 15-18 Maj, 90€</p>
    
    <div class="options-grid">
      <div class="option-group">
        <h3>Dodatne opcije</h3>
        <div class="checkbox-option">
          <input type="checkbox" id="crib" data-element-id="option-crib">
          <label for="crib">Dečiji krevetac (besplatno)</label>
        </div>
        <div class="checkbox-option">
          <input type="checkbox" id="parking" data-element-id="option-parking">
          <label for="parking">Dodatni parking (besplatno)</label>
        </div>
        <div class="checkbox-option">
          <input type="checkbox" id="early" data-element-id="option-early">
          <label for="early">Rani check-in pre 14h (na upit)</label>
        </div>
        <div class="checkbox-option">
          <input type="checkbox" id="late" data-element-id="option-late">
          <label for="late">Kasni check-out posle 10h (na upit)</label>
        </div>
      </div>

      <div class="option-group">
        <h3>Vreme dolaska</h3>
        <select data-element-id="arrival-time">
          <option>14-16h</option>
          <option>16-18h</option>
          <option>18-20h</option>
          <option>Posle 20h</option>
        </select>
      </div>
    </div>

    <div class="option-group" style="margin-top:2rem;">
      <h3>Posebni zahtevi</h3>
      <textarea placeholder="Imate li posebne zahteve ili pitanja? (npr. alergije, prehrambene potrebe, itd.)" data-element-id="special-requests"></textarea>
      <p style="text-align:right; color:#6b7280; font-size:0.875rem; margin-top:0.25rem;">0/500</p>
    </div>

    <div class="actions">
      <button class="btn btn-secondary">Nazad</button>
      <button class="btn btn-primary">Dalje</button>
    </div>
  </div>

  <!-- Step 4: Kontakt (Hidden) -->
  <div class="step" style="display:none;" data-element-id="step-4">
    <h2>Vaše kontakt informacije</h2>
    <p class="subtitle">Odgovorićemo u roku od 2 sata (9-21h)</p>
    
    <div class="contact-form">
      <div>
        <div class="form-group">
          <label for="name">Ime i prezime *</label>
          <input type="text" id="name" placeholder="Marko Marković" data-element-id="input-name">
        </div>
        <div class="form-group">
          <label for="email">Email *</label>
          <input type="email" id="email" placeholder="marko@example.com" data-element-id="input-email">
        </div>
        <div class="form-group">
          <label for="phone">Telefon *</label>
          <input type="tel" id="phone" placeholder="+381 69 123 4567" data-element-id="input-phone">
        </div>
        <div class="form-group">
          <label for="guests">Broj gostiju *</label>
          <input type="number" id="guests" value="2" data-element-id="input-guests">
        </div>
        <div class="checkbox-group">
          <input type="checkbox" id="terms" data-element-id="checkbox-terms">
          <label for="terms">Prihvatam uslove korišćenja i politiku privatnosti *</label>
        </div>
      </div>

      <div class="booking-summary">
        <h3>Rezime rezervacije</h3>
        <div class="summary-item">
          <span>Apartman:</span>
          <strong>Deluxe</strong>
        </div>
        <div class="summary-item">
          <span>Datumi:</span>
          <strong>15-18 Maj</strong>
        </div>
        <div class="summary-item">
          <span>Noći:</span>
          <strong>3</strong>
        </div>
        <div class="summary-item">
          <span>Gosti:</span>
          <strong>2 osobe</strong>
        </div>
        <div class="summary-item">
          <span>Opcije:</span>
          <div>
            <div>✓ Dečiji krevetac</div>
            <div>✓ Rani check-in</div>
          </div>
        </div>
        <div class="summary-total">
          <span>Total:</span>
          <span>90€</span>
        </div>
      </div>
    </div>

    <div class="actions">
      <button class="btn btn-secondary">Nazad</button>
      <button class="btn btn-primary" data-element-id="submit-btn">Pošaljite zahtev</button>
    </div>
  </div>

</div>

</body>
</html>
```

---

## Flow 5: Post-Booking Confirmation & Next Steps

**Opis:** Šta se dešava odmah nakon što korisnik pošalje booking zahtev.

**Trigger:** Submit forme u Step 4 booking flow-a.

### Koraci:

1. **Instant Confirmation Page**
  - Headline: "✓ Zahtev uspešno poslat!"
  - Subheadline: "Hvala vam! Vaš booking zahtev je primljen."
  - Booking ID: "#BJ-2024-0123"
  - Rezime rezervacije:
    - Apartman, datumi, gosti, opcije, total
  - Timeline: "Šta se dešava dalje?"
    - "✓ Sada: Zahtev primljen"
    - "⏱️ Za 2 sata: Dobićete potvrdu na email"
    - "📧 24h pre dolaska: Dobićete check-in instrukcije"
  - CTA: "Pristupite Guest Portal-u"
  - Secondary CTA: "Nazad na početnu"
2. **Email Confirmation (Instant)**
  - Subject: "Booking zahtev primljen - Apartmani Jovča #BJ-2024-0123"
  - Body:
    - Pozdrav sa imenom
    - Potvrda prijema zahteva
    - Rezime rezervacije
    - Timeline
    - Kontakt informacije
    - Link ka Guest Portal-u
    - FAQ: "Često postavljana pitanja"
3. **Admin Notification (Instant)**
  - Email/SMS notifikacija za vas
  - Detalji zahteva
  - Link za potvrdu/odbijanje
4. **Response (< 2 sata tokom 9-21h)**
  - Email sa potvrdom ili pitanjima
  - Subject: "Potvrda rezervacije - Apartmani Jovča #BJ-2024-0123"
  - Body:
    - Potvrda rezervacije
    - Payment instrukcije (ako treba)
    - Check-in/check-out detalji
    - Kontakt za pitanja
    - Link ka Guest Portal-u

**UI Feedback:**

- Success animation (checkmark)
- Confetti effect (optional)
- Auto-scroll to timeline
- Print/Save PDF opcija

```wireframe
<!DOCTYPE html>
<html lang="sr">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Booking Confirmation</title>
<style>
* { margin: 0; padding: 0; box-sizing: border-box; }
body { 
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; 
  background: #f9fafb;
  padding: 2rem;
}

.confirmation-container {
  max-width: 800px;
  margin: 0 auto;
  background: white;
  border-radius: 12px;
  padding: 3rem;
  box-shadow: 0 4px 6px rgba(0,0,0,0.1);
}

.success-icon {
  width: 80px;
  height: 80px;
  background: #10b981;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 2rem;
  font-size: 48px;
  color: white;
}

.confirmation-container h1 {
  text-align: center;
  font-size: 2rem;
  margin-bottom: 0.5rem;
  color: #111827;
}

.confirmation-container .subtitle {
  text-align: center;
  color: #6b7280;
  margin-bottom: 1rem;
}

.booking-id {
  text-align: center;
  font-size: 1.25rem;
  color: #2563eb;
  font-weight: 600;
  margin-bottom: 3rem;
}

.summary-section {
  background: #f9fafb;
  border-radius: 8px;
  padding: 2rem;
  margin-bottom: 3rem;
}

.summary-section h2 {
  font-size: 1.25rem;
  margin-bottom: 1.5rem;
  color: #111827;
}

.summary-item {
  display: flex;
  justify-content: space-between;
  padding: 0.75rem 0;
  border-bottom: 1px solid #e5e7eb;
}

.summary-item:last-child {
  border-bottom: none;
}

.summary-total {
  display: flex;
  justify-content: space-between;
  font-size: 1.5rem;
  font-weight: bold;
  margin-top: 1rem;
  padding-top: 1rem;
  border-top: 2px solid #e5e7eb;
}

.timeline {
  margin-bottom: 3rem;
}

.timeline h2 {
  font-size: 1.25rem;
  margin-bottom: 1.5rem;
  color: #111827;
}

.timeline-item {
  display: flex;
  gap: 1rem;
  margin-bottom: 1.5rem;
  align-items: start;
}

.timeline-icon {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  flex-shrink: 0;
}

.timeline-icon.completed {
  background: #10b981;
  color: white;
}

.timeline-icon.pending {
  background: #fbbf24;
  color: white;
}

.timeline-icon.future {
  background: #e5e7eb;
  color: #6b7280;
}

.timeline-content h3 {
  font-size: 1rem;
  margin-bottom: 0.25rem;
  color: #111827;
}

.timeline-content p {
  color: #6b7280;
  font-size: 0.875rem;
}

.actions {
  display: flex;
  gap: 1rem;
  justify-content: center;
}

.btn {
  padding: 1rem 2rem;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  border: none;
  font-size: 1rem;
  text-decoration: none;
  display: inline-block;
}

.btn-primary {
  background: #2563eb;
  color: white;
}

.btn-secondary {
  background: white;
  color: #374151;
  border: 1px solid #e5e7eb;
}

.contact-info {
  background: #eff6ff;
  border-left: 4px solid #2563eb;
  padding: 1.5rem;
  margin-top: 3rem;
  border-radius: 4px;
}

.contact-info h3 {
  margin-bottom: 0.75rem;
  color: #1e40af;
}

.contact-info p {
  color: #1e40af;
  margin-bottom: 0.5rem;
}

@media (max-width: 768px) {
  .confirmation-container {
    padding: 2rem 1rem;
  }
  .actions {
    flex-direction: column;
  }
  .btn {
    width: 100%;
  }
}
</style>
</head>
<body>

<div class="confirmation-container">
  <div class="success-icon">✓</div>
  
  <h1>Zahtev uspešno poslat!</h1>
  <p class="subtitle">Hvala vam! Vaš booking zahtev je primljen.</p>
  <div class="booking-id">Booking ID: #BJ-2024-0123</div>

  <div class="summary-section">
    <h2>Rezime rezervacije</h2>
    <div class="summary-item">
      <span>Apartman:</span>
      <strong>Apartman Deluxe</strong>
    </div>
    <div class="summary-item">
      <span>Datumi:</span>
      <strong>15-18 Maj 2024</strong>
    </div>
    <div class="summary-item">
      <span>Broj noći:</span>
      <strong>3 noći</strong>
    </div>
    <div class="summary-item">
      <span>Gosti:</span>
      <strong>2 osobe</strong>
    </div>
    <div class="summary-item">
      <span>Dodatne opcije:</span>
      <div>
        <div>✓ Dečiji krevetac</div>
        <div>✓ Rani check-in</div>
      </div>
    </div>
    <div class="summary-total">
      <span>Ukupno:</span>
      <span>90€</span>
    </div>
  </div>

  <div class="timeline">
    <h2>Šta se dešava dalje?</h2>
    
    <div class="timeline-item">
      <div class="timeline-icon completed">✓</div>
      <div class="timeline-content">
        <h3>Zahtev primljen</h3>
        <p>Upravo sada - Vaš zahtev je uspešno primljen i prosleđen našem timu</p>
      </div>
    </div>

    <div class="timeline-item">
      <div class="timeline-icon pending">⏱️</div>
      <div class="timeline-content">
        <h3>Potvrda rezervacije</h3>
        <p>Za 2 sata (9-21h) - Dobićete email sa potvrdom ili dodatnim pitanjima</p>
      </div>
    </div>

    <div class="timeline-item">
      <div class="timeline-icon future">📧</div>
      <div class="timeline-content">
        <h3>Pre-arrival informacije</h3>
        <p>7 dana pre dolaska - Dobićete korisne informacije za pripremu</p>
      </div>
    </div>

    <div class="timeline-item">
      <div class="timeline-icon future">🗝️</div>
      <div class="timeline-content">
        <h3>Check-in instrukcije</h3>
        <p>24h pre dolaska - Dobićete detaljne check-in instrukcije i kontakt</p>
      </div>
    </div>
  </div>

  <div class="actions">
    <a href="#portal" class="btn btn-primary" data-element-id="portal-btn">Pristupite Guest Portal-u</a>
    <a href="/" class="btn btn-secondary" data-element-id="home-btn">Nazad na početnu</a>
  </div>

  <div class="contact-info">
    <h3>Imate pitanja?</h3>
    <p>📞 Telefon: +381 69 123 4567</p>
    <p>📧 Email: apartmanijovca@gmail.com</p>
    <p>💬 WhatsApp: +381 69 123 4567</p>
    <p style="margin-top:1rem; font-size:0.875rem;">
      Dostupni smo svakog dana od 9-21h
    </p>
  </div>
</div>

</body>
</html>
```

---

## Flow 6: Guest Portal (Post-Booking)

**Opis:** Full-featured guest portal gde gosti mogu da upravljaju rezervacijom i pristupe informacijama.

**Trigger:** Klik na "Pristupite Guest Portal-u" ili link iz email-a.

### Koraci:

1. **Portal Login**
  - Email + Booking ID autentifikacija
  - Ili magic link iz email-a (auto-login)
2. **Portal Dashboard**
  - Navigacija:
    - Moja rezervacija
    - Komunikacija
    - Lokalne preporuke
    - FAQ
  - Booking status: "Potvrđeno" / "Na čekanju"
  - Countdown: "15 dana do dolaska"
3. **Moja Rezervacija Tab**
  - Rezime rezervacije (sve detalje)
  - QR kod za check-in
  - Mapa lokacije sa GPS koordinatama
  - Check-in/check-out instrukcije
  - House rules
  - WiFi password
  - Parking informacije
  - Kontakt za hitne slučajeve
4. **Komunikacija Tab**
  - Messaging sa vama
  - Dodavanje specijalnih zahteva
  - Upload dokumenata (ako treba)
  - Istorija komunikacije
5. **Lokalne Preporuke Tab**
  - Restorani (sa mapom, ocenama)
  - Atrakcije (sa udaljenostima)
  - Aktivnosti (pecanje, šetnje, itd.)
  - Praktične informacije (prodavnice, apoteke)
6. **FAQ Tab**
  - Često postavljana pitanja
  - Check-in/check-out procedure
  - Cancellation policy
  - Payment informacije
7. **Post-Stay Review**
  - Nakon check-out-a: Poziv za review
  - Rating (1-5 zvezdica)
  - Komentar
  - Upload slika (opciono)

**UI Feedback:**

- Real-time messaging
- Notification badges
- Mobile-optimized
- Offline access (PWA)

---

## Flow 7: Support Flow (Live Chat & Contact)

**Opis:** Kako korisnici dobijaju podršku tokom browsing-a i booking-a.

**Trigger:** Klik na live chat ili kontakt.

### Koraci:

1. **Live Chat (Business Hours 9-21h)**
  - Floating chat icon (donji desni ugao)
  - Klik otvara chat window
  - Ako je 9-21h:
    - "Zdravo! Kako vam možemo pomoći?"
    - Real-time messaging
    - Typing indicators
    - Quick replies: "Cene", "Dostupnost", "Lokacija"
  - Ako je van radnog vremena:
    - "Trenutno nismo dostupni. Radimo 9-21h."
    - "Ostavite poruku i odgovorićemo sutra"
    - Forma za poruku
    - Alternative: "Pozovite nas sutra" ili "Pošaljite email"
2. **WhatsApp Integration**
  - Floating WhatsApp dugme
  - Klik otvara WhatsApp sa pre-filled porukom
  - "Zdravo! Interesuje me rezervacija apartmana..."
3. **Contact Page**
  - Kontakt forma
  - Telefon (click-to-call na mobile)
  - Email
  - Adresa sa mapom
  - Radno vreme: "9-21h, svakog dana"

**UI Feedback:**

- Online/offline status
- Response time indicator
- Unread message badge

---

## Mobile-Specific Optimizations

**Sve flows su optimizovane za mobilne uređaje:**

1. **Mobile-First Design**
  - Larger touch targets (min 48px)
  - Simplified navigation (hamburger menu)
  - Vertical layouts
  - Thumb-friendly CTAs (bottom of screen)
2. **Progressive Web App (PWA)**
  - Installable kao app
  - Offline functionality
  - Push notifications za booking updates
  - Add to home screen prompt
3. **Simplified Mobile Flow**
  - Booking: Manje koraka, veći font
  - Calendar: Touch-optimized date picker
  - Forms: Auto-fill, keyboard optimization
4. **Click-to-Call/WhatsApp**
  - Telefon broj: Instant call
  - WhatsApp: Instant message
  - Floating action buttons
5. **Performance**
  - Lazy loading slika
  - Optimized images (WebP)
  - Minimal JavaScript
  - Fast page loads (< 2s)

---

## Key UX Principles

1. **Trust bez Urgency**
  - Faktičke informacije: "Rezervisan 12 puta u poslednjih 30 dana"
  - BEZ: "Samo 1 apartman preostao!" ili "Cena raste za 2 sata!"
  - Reviews svuda za trust building
2. **Cena kao Prioritet**
  - "Od 30€/noć" odmah vidljivo
  - Real-time total kalkulacija
  - Transparentne cene bez skrivenih troškova
3. **Multiple CTAs**
  - Hero, sticky header, inline, floating, end of page, sidebar
  - Uvek dostupan način da rezervišu
4. **Request to Book**
  - 4-step proces sa jasnim feedback-om
  - Potvrda u < 2 sata
  - Timeline šta se dešava dalje
5. **Full-Featured Portal**
  - Sve informacije na jednom mestu
  - Komunikacija, preporuke, FAQ
  - Post-stay review

---

## Success Metrics

**Kako merimo uspeh ovih flows:**

1. **Conversion Rate**
  - % posetilaca koji završe booking (cilj: 5%+)
  - Drop-off po koracima booking flow-a
2. **Bounce Rate**
  - % posetilaca koji napuste sajt (cilj: < 30%)
3. **Time on Site**
  - Prosečno vreme (cilj: 3+ minuta)
4. **Mobile vs Desktop**
  - Conversion rate po device-u
5. **SEO Rankings**
  - Pozicija za ključne termine (cilj: #1)
6. **Direct Bookings**
  - % rezervacija direktno vs platforme (cilj: 60%+)
7. **Response Time**
  - Prosečno vreme odgovora (cilj: < 2 sata)
8. **Guest Satisfaction**
  - Portal usage rate
  - Review submission rate
  - Repeat booking rate

&nbsp;