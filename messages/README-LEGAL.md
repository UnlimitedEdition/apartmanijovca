# Ažuriranje Pravnog Sadržaja

## Struktura

Pravni sadržaj (Uslovi korišćenja i Politika privatnosti) je organizovan u posebne fajlove za lakše održavanje:

```
messages/
├── legal-sr.json    # Srpski pravni sadržaj
├── legal-en.json    # Engleski pravni sadržaj
├── legal-de.json    # Nemački pravni sadržaj
├── legal-it.json    # Italijanski pravni sadržaj
├── sr.json          # Glavni srpski prevodi
├── en.json          # Glavni engleski prevodi
├── de.json          # Glavni nemački prevodi
└── it.json          # Glavni italijanski prevodi
```

## Kako Ažurirati Pravni Sadržaj

### 1. Izmeni Sadržaj

Otvori odgovarajući `legal-XX.json` fajl i izmeni sadržaj:

```json
{
  "legal": {
    "privacy": {
      "s1": {
        "title": "1. Novi naslov",
        "content": "Novi sadržaj...",
        "item1": "Nova stavka 1"
      }
    },
    "terms": {
      "s1": {
        "title": "1. Novi naslov",
        "content": "Novi sadržaj...",
        "item1": "Nova stavka 1"
      }
    }
  }
}
```

### 2. Pokreni Skriptu za Ažuriranje

```bash
node scripts/update-legal-translations.cjs
```

Ova skripta će automatski ažurirati sve glavne translation fajlove (sr.json, en.json, de.json, it.json).

### 3. Proveri Izmene

Otvori stranice u browseru:
- `/sr/terms` i `/sr/privacy`
- `/en/terms` i `/en/privacy`
- `/de/terms` i `/de/privacy`
- `/it/terms` i `/it/privacy`

## Struktura Pravnog Sadržaja

### Privacy Policy (Politika privatnosti)

```
- title: Naslov stranice
- intro: Uvodni tekst
- lastUpdated: Datum poslednjeg ažuriranja
- s1-s6: Sekcije (title, content, item1-itemN)
- contact: Kontakt informacije
```

### Terms of Service (Uslovi korišćenja)

```
- title: Naslov stranice
- intro: Uvodni tekst
- lastUpdated: Datum poslednjeg ažuriranja
- s1-s7: Sekcije (title, content, item1-itemN)
- contact: Kontakt informacije
```

## Dodavanje Nove Sekcije

1. Dodaj novu sekciju u `legal-XX.json`:

```json
"s8": {
  "title": "8. Nova sekcija",
  "content": "Sadržaj nove sekcije",
  "item1": "Stavka 1",
  "item2": "Stavka 2"
}
```

2. Ažuriraj stranicu (`src/app/[lang]/terms/page.tsx` ili `privacy/page.tsx`):

```tsx
<Card>
  <CardHeader>
    <CardTitle>{t('s8.title')}</CardTitle>
  </CardHeader>
  <CardContent>
    <p>{t('s8.content')}</p>
    <ul>
      <li>{t('s8.item1')}</li>
      <li>{t('s8.item2')}</li>
    </ul>
  </CardContent>
</Card>
```

3. Pokreni skriptu za ažuriranje

## Važne Napomene

- **Uvek ažuriraj sve jezike** - ne ostavljaj nepotpune prevode
- **Proveri datum** - ažuriraj `lastUpdated` polje
- **Testiraj sve jezike** - proveri da sve stranice rade
- **Backup** - pravi backup pre velikih izmena
- **Pravna provera** - konsultuj pravnika za važne izmene

## Kontakt Informacije

Kontakt informacije se prikazuju na kraju svake stranice. Ažuriraj ih u:
- Stranicama: `src/app/[lang]/terms/page.tsx` i `privacy/page.tsx`
- Hardkodirane su trenutno, ali mogu se prebaciti u translations

```tsx
<p className="font-bold">Email: apartmanijovca@gmail.com</p>
<p className="font-bold">Telefon: +381 65 237 8080</p>
<p className="font-bold">WhatsApp: +381 65 237 8080</p>
```
