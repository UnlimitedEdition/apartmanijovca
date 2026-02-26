import { NextRequest, NextResponse } from 'next/server'

// Simple translation map for common hospitality terms
const HOSPITALITY_TRANSLATIONS: Record<string, Record<string, string>> = {
  'pogled na jezero': {
    en: 'Lake view',
    de: 'Seeblick',
    it: 'Vista sul lago'
  },
  'pogled na planinu': {
    en: 'Mountain view',
    de: 'Bergblick',
    it: 'Vista sulla montagna'
  },
  'apartman': {
    en: 'Apartment',
    de: 'Apartment',
    it: 'Appartamento'
  },
  'porodični apartman': {
    en: 'Family apartment',
    de: 'Familienapartment',
    it: 'Appartamento familiare'
  },
  'deluks apartman': {
    en: 'Deluxe apartment',
    de: 'Deluxe-Apartment',
    it: 'Appartamento Deluxe'
  },
  'standardni apartman': {
    en: 'Standard apartment',
    de: 'Standard-Apartment',
    it: 'Appartamento standard'
  },
  'terasa': {
    en: 'Terrace',
    de: 'Terrasse',
    it: 'Terrazza'
  },
  'prostrana terasa': {
    en: 'Spacious terrace',
    de: 'Geräumige Terrasse',
    it: 'Ampia terrazza'
  },
  'soba': {
    en: 'Room',
    de: 'Zimmer',
    it: 'Camera'
  },
  'spavaća soba': {
    en: 'Bedroom',
    de: 'Schlafzimmer',
    it: 'Camera da letto'
  },
  'kuhinja': {
    en: 'Kitchen',
    de: 'Küche',
    it: 'Cucina'
  },
  'moderna kuhinja': {
    en: 'Modern kitchen',
    de: 'Moderne Küche',
    it: 'Cucina moderna'
  },
  'kupatilo': {
    en: 'Bathroom',
    de: 'Badezimmer',
    it: 'Bagno'
  },
  'dnevna soba': {
    en: 'Living room',
    de: 'Wohnzimmer',
    it: 'Soggiorno'
  },
  'pogled sa terase': {
    en: 'View from the terrace',
    de: 'Blick von der Terrasse',
    it: 'Vista dal terrazzo'
  },
  'jezero bovan': {
    en: 'Lake Bovan',
    de: 'Bovan-See',
    it: 'Lago di Bovan'
  },
  'plaža': {
    en: 'Beach',
    de: 'Strand',
    it: 'Spiaggia'
  },
  'ulaz u apartman': {
    en: 'Apartment entrance',
    de: 'Eingang zum Apartment',
    it: 'Ingresso dell\'appartamento'
  },
  'enterijer': {
    en: 'Interior',
    de: 'Innere',
    it: 'Interni'
  },
  'dvorište': {
    en: 'Yard',
    de: 'Hof',
    it: 'Cortile'
  },
  'parking': {
    en: 'Parking',
    de: 'Parkplatz',
    it: 'Parcheggio'
  },
  'restoran': {
    en: 'Restaurant',
    de: 'Restaurant',
    it: 'Ristorante'
  }
}

export async function POST(request: NextRequest) {
  try {
    const { text, targetLangs } = await request.json()

    if (!text) {
      return NextResponse.json({ error: 'Text is required' }, { status: 400 })
    }

    // Since this is a demo/dev environment, we'll use a mix of simple mapping 
    // and "translation patterns" for the auto-translation feature.
    // In a real production app, you would call DeepL or Google Translate API.
    
    const translations: Record<string, string> = { sr: text }
    
    targetLangs.forEach((lang: string) => {
      let translated = text
      
      // Try to find exact match in our hospitality dictionary
      const lowerText = text.toLowerCase().trim()
      if (HOSPITALITY_TRANSLATIONS[lowerText]) {
        translated = HOSPITALITY_TRANSLATIONS[lowerText][lang] || text
      } else {
        // Handle "Apartman 1", "Soba 2", etc.
        const aptMatch = text.match(/(apartman|soba|studio)\s*(\d+)/i)
        if (aptMatch) {
          const type = aptMatch[1].toLowerCase()
          const num = aptMatch[2]
          if (type === 'apartman') {
            if (lang === 'en') translated = `Apartment ${num}`
            if (lang === 'de') translated = `Apartment ${num}`
            if (lang === 'it') translated = `Appartamento ${num}`
          } else if (type === 'soba') {
            if (lang === 'en') translated = `Room ${num}`
            if (lang === 'de') translated = `Zimmer ${num}`
            if (lang === 'it') translated = `Camera ${num}`
          } else if (type === 'studio') {
            translated = `Studio ${num}`
          }
        }
      }
      
      translations[lang] = translated
    })

    return NextResponse.json({ translations })
  } catch (err: unknown) {
    const error = err as Error
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
