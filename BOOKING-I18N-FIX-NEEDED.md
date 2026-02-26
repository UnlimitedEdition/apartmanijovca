# Booking Flow i18n Fix - Hardcoded Text

## Problem

BookingFlow.tsx ima hardcoded tekst na više jezika (mešavina SR i IT):
- "Zahtevi" (SR) - hardcoded u step label
- "Pregled rezervacije" (SR) - hardcoded
- "noć" / "noći" (SR) - hardcoded
- "Posebni zahtevi" (SR) - hardcoded
- "Imate li neke posebne zahteve ili pitanja?" (SR) - hardcoded
- "Šta je uključeno:" (SR) - hardcoded
- "Besplatan parking", "WiFi", "Posteljina i peškiri", "Osnovna kuhinjska oprema" (SR) - hardcoded
- "Vaši zahtevi ili pitanja (opciono)" (SR) - hardcoded
- "Kontaktiraćemo vas u vezi vaših zahteva nakon rezervacije." (SR) - hardcoded

## Rešenje

### 1. Dodati nove ključeve u sve translation fajlove

**messages/sr.json** - ✅ DONE
**messages/en.json** - TODO
**messages/de.json** - TODO
**messages/it.json** - TODO

Novi ključevi:
```json
"booking": {
  "step": {
    "requests": "Zahtevi" // SR, "Requests" EN, "Anfragen" DE, "Richieste" IT
  },
  "summary": {
    "preview": "Pregled rezervacije" // SR, "Booking Preview" EN, "Buchungsvorschau" DE, "Anteprima prenotazione" IT
  },
  "requestsTitle": "Posebni zahtevi",
  "requestsDescription": "Imate li neke posebne zahteve ili pitanja?",
  "requestsPlaceholder": "Npr: Rani dolazak, kasni odlazak, dodatne informacije...",
  "requestsNote": "Kontaktiraćemo vas u vezi vaših zahteva nakon rezervacije.",
  "included": {
    "title": "Šta je uključeno:",
    "parking": "Besplatan parking",
    "wifi": "WiFi",
    "linens": "Posteljina i peškiri",
    "kitchen": "Osnovna kuhinjska oprema"
  },
  "night": "noć",
  "nights": "noći"
}
```

### 2. Zameniti hardcoded tekst u BookingFlow.tsx

**Line 308**: `{ num: 2, label: 'Zahtevi' },`
→ `{ num: 2, label: t('step.requests') },`

**Line 363**: `<h3 className="text-sm font-semibold text-gray-900 mb-4">Pregled rezervacije</h3>`
→ `<h3 className="text-sm font-semibold text-gray-900 mb-4">{t('summary.preview')}</h3>`

**Line 370**: `{nights} {nights === 1 ? 'noć' : 'noći'}`
→ `{nights} {nights === 1 ? t('night') : t('nights')}`

**Line 403**: `<h2 className="text-xl font-semibold text-gray-900">Posebni zahtevi</h2>`
→ `<h2 className="text-xl font-semibold text-gray-900">{t('requestsTitle')}</h2>`

**Line 404**: `<p className="text-sm text-gray-600">Imate li neke posebne zahteve ili pitanja?</p>`
→ `<p className="text-sm text-gray-600">{t('requestsDescription')}</p>`

**Line 417**: `<p className="font-semibold mb-1">Šta je uključeno:</p>`
→ `<p className="font-semibold mb-1">{t('included.title')}</p>`

**Lines 419-422**: Hardcoded list items
→ Replace with translation keys:
```tsx
<li>✓ {t('included.parking')}</li>
<li>✓ {t('included.wifi')}</li>
<li>✓ {t('included.linens')}</li>
<li>✓ {t('included.kitchen')}</li>
```

**Line 430**: `Vaši zahtevi ili pitanja (opciono)`
→ `{t('requestsPlaceholder')}`

**Line 436**: `placeholder="Npr: Rani dolazak, kasni odlazak, dodatne informacije..."`
→ `placeholder={t('requestsPlaceholder')}`

**Line 440**: `Kontaktiraćemo vas u vezi vaših zahteva nakon rezervacije.`
→ `{t('requestsNote')}`

## Translation Keys Needed

### EN (English)
```json
"step": { "requests": "Requests" },
"summary": { "preview": "Booking Preview" },
"requestsTitle": "Special Requests",
"requestsDescription": "Do you have any special requests or questions?",
"requestsPlaceholder": "E.g.: Early arrival, late departure, additional information...",
"requestsNote": "We will contact you regarding your requests after booking.",
"included": {
  "title": "What's included:",
  "parking": "Free parking",
  "wifi": "WiFi",
  "linens": "Bed linen and towels",
  "kitchen": "Basic kitchen equipment"
},
"night": "night",
"nights": "nights"
```

### DE (German)
```json
"step": { "requests": "Anfragen" },
"summary": { "preview": "Buchungsvorschau" },
"requestsTitle": "Besondere Wünsche",
"requestsDescription": "Haben Sie besondere Wünsche oder Fragen?",
"requestsPlaceholder": "Z.B.: Frühe Ankunft, späte Abreise, zusätzliche Informationen...",
"requestsNote": "Wir werden Sie nach der Buchung bezüglich Ihrer Wünsche kontaktieren.",
"included": {
  "title": "Was ist inbegriffen:",
  "parking": "Kostenloser Parkplatz",
  "wifi": "WLAN",
  "linens": "Bettwäsche und Handtücher",
  "kitchen": "Grundlegende Küchenausstattung"
},
"night": "Nacht",
"nights": "Nächte"
```

### IT (Italian)
```json
"step": { "requests": "Richieste" },
"summary": { "preview": "Anteprima prenotazione" },
"requestsTitle": "Richieste speciali",
"requestsDescription": "Hai richieste speciali o domande?",
"requestsPlaceholder": "Es.: Arrivo anticipato, partenza posticipata, informazioni aggiuntive...",
"requestsNote": "Ti contatteremo riguardo alle tue richieste dopo la prenotazione.",
"included": {
  "title": "Cosa è incluso:",
  "parking": "Parcheggio gratuito",
  "wifi": "WiFi",
  "linens": "Biancheria da letto e asciugamani",
  "kitchen": "Attrezzatura da cucina di base"
},
"night": "notte",
"nights": "notti"
```

## Files to Modify

1. ✅ `messages/sr.json` - DONE
2. ❌ `messages/en.json` - TODO
3. ❌ `messages/de.json` - TODO
4. ❌ `messages/it.json` - TODO
5. ❌ `src/app/[lang]/booking/BookingFlow.tsx` - TODO (replace hardcoded text)

---

**Priority**: HIGH - User reported mixed languages in booking flow
**Status**: IN PROGRESS
