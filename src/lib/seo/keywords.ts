/**
 * SEO Keywords Configuration
 * 
 * Defines primary, secondary, and long-tail keywords for each page type and locale.
 * Includes semantic variations and synonyms to improve search visibility.
 */

import { Locale } from '@/lib/types/database';

export type PageType = 
  | 'home'
  | 'apartment-list'
  | 'apartment-detail'
  | 'location'
  | 'contact'
  | 'gallery'
  | 'attractions'
  | 'prices'
  | 'privacy'
  | 'terms';

export interface KeywordSet {
  primary: string[];
  secondary: string[];
  longTail: string[];
}

export type KeywordConfig = Record<PageType, Record<Locale, KeywordSet>>;

/**
 * Keyword configuration for all page types and locales
 */
export const keywords: KeywordConfig = {
  home: {
    sr: {
      primary: ['apartmani', 'Jovča', 'Bovan', 'Aleksinac'],
      secondary: ['smeštaj', 'jezero', 'odmor', 'vikendica', 'apartman'],
      longTail: [
        'apartmani na Bovanu',
        'smeštaj Bovan jezero',
        'apartmani Aleksinac',
        'vikendice Jovča',
        'odmor na jezeru Bovan',
        'apartmani pored jezera',
        'smeštaj Srbija jezero',
        'apartmani za porodicu Bovan'
      ]
    },
    en: {
      primary: ['apartments', 'Jovča', 'Bovan', 'Aleksinac'],
      secondary: ['accommodation', 'lake', 'vacation', 'rental', 'lodging'],
      longTail: [
        'apartments Bovan Lake',
        'accommodation Bovan Lake Serbia',
        'vacation rentals Aleksinac',
        'lakeside apartments Serbia',
        'Bovan Lake lodging',
        'family apartments Bovan',
        'holiday rentals Serbia',
        'apartments near Bovan Lake'
      ]
    },
    de: {
      primary: ['Ferienwohnung', 'Jovča', 'Bovan', 'Aleksinac'],
      secondary: ['Unterkunft', 'See', 'Urlaub', 'Vermietung', 'Apartment'],
      longTail: [
        'Ferienwohnung Bovan See',
        'Unterkunft Bovan See Serbien',
        'Urlaub Aleksinac',
        'Apartments am See Serbien',
        'Bovan See Unterkunft',
        'Familienwohnung Bovan',
        'Ferienhaus Serbien',
        'Apartments in der Nähe von Bovan See'
      ]
    },
    it: {
      primary: ['appartamenti', 'Jovča', 'Bovan', 'Aleksinac'],
      secondary: ['alloggio', 'lago', 'vacanza', 'affitto', 'sistemazione'],
      longTail: [
        'appartamenti Lago Bovan',
        'alloggio Lago Bovan Serbia',
        'vacanze Aleksinac',
        'appartamenti sul lago Serbia',
        'sistemazione Lago Bovan',
        'appartamenti per famiglie Bovan',
        'case vacanza Serbia',
        'appartamenti vicino al Lago Bovan'
      ]
    }
  },

  'apartment-list': {
    sr: {
      primary: ['apartmani', 'smeštaj', 'Bovan', 'cenovnik'],
      secondary: ['studio', 'dvokrevetni', 'porodični', 'lux', 'cena'],
      longTail: [
        'svi apartmani Bovan',
        'lista apartmana Jovča',
        'cene apartmana Bovan',
        'dostupni apartmani',
        'apartmani različitih veličina',
        'studio apartmani Bovan',
        'porodični apartmani jezero'
      ]
    },
    en: {
      primary: ['apartments', 'accommodation', 'Bovan', 'prices'],
      secondary: ['studio', 'double', 'family', 'luxury', 'rates'],
      longTail: [
        'all apartments Bovan Lake',
        'apartment list Jovča',
        'apartment prices Bovan',
        'available apartments',
        'apartments different sizes',
        'studio apartments Bovan',
        'family apartments lake'
      ]
    },
    de: {
      primary: ['Ferienwohnungen', 'Unterkunft', 'Bovan', 'Preise'],
      secondary: ['Studio', 'Doppel', 'Familie', 'Luxus', 'Tarife'],
      longTail: [
        'alle Ferienwohnungen Bovan See',
        'Wohnungsliste Jovča',
        'Wohnungspreise Bovan',
        'verfügbare Wohnungen',
        'Wohnungen verschiedene Größen',
        'Studio Apartments Bovan',
        'Familienwohnungen See'
      ]
    },
    it: {
      primary: ['appartamenti', 'alloggio', 'Bovan', 'prezzi'],
      secondary: ['monolocale', 'doppia', 'famiglia', 'lusso', 'tariffe'],
      longTail: [
        'tutti gli appartamenti Lago Bovan',
        'elenco appartamenti Jovča',
        'prezzi appartamenti Bovan',
        'appartamenti disponibili',
        'appartamenti diverse dimensioni',
        'monolocali Bovan',
        'appartamenti per famiglie lago'
      ]
    }
  },

  'apartment-detail': {
    sr: {
      primary: ['apartman', 'rezervacija', 'cena', 'sadržaj'],
      secondary: ['sobe', 'kuhinja', 'kupatilo', 'terasa', 'parking', 'wifi'],
      longTail: [
        'rezerviši apartman Bovan',
        'apartman sa terasom',
        'apartman sa parkingom',
        'apartman wifi besplatan',
        'apartman pogled na jezero',
        'apartman klimatizovan',
        'apartman opremljen kuhinja'
      ]
    },
    en: {
      primary: ['apartment', 'booking', 'price', 'amenities'],
      secondary: ['rooms', 'kitchen', 'bathroom', 'terrace', 'parking', 'wifi'],
      longTail: [
        'book apartment Bovan',
        'apartment with terrace',
        'apartment with parking',
        'apartment free wifi',
        'apartment lake view',
        'air conditioned apartment',
        'apartment equipped kitchen'
      ]
    },
    de: {
      primary: ['Ferienwohnung', 'Buchung', 'Preis', 'Ausstattung'],
      secondary: ['Zimmer', 'Küche', 'Bad', 'Terrasse', 'Parkplatz', 'WLAN'],
      longTail: [
        'Ferienwohnung buchen Bovan',
        'Wohnung mit Terrasse',
        'Wohnung mit Parkplatz',
        'Wohnung kostenloses WLAN',
        'Wohnung Seeblick',
        'klimatisierte Wohnung',
        'Wohnung ausgestattete Küche'
      ]
    },
    it: {
      primary: ['appartamento', 'prenotazione', 'prezzo', 'servizi'],
      secondary: ['camere', 'cucina', 'bagno', 'terrazza', 'parcheggio', 'wifi'],
      longTail: [
        'prenota appartamento Bovan',
        'appartamento con terrazza',
        'appartamento con parcheggio',
        'appartamento wifi gratuito',
        'appartamento vista lago',
        'appartamento climatizzato',
        'appartamento cucina attrezzata'
      ]
    }
  },

  location: {
    sr: {
      primary: ['lokacija', 'Bovan', 'Aleksinac', 'Niš'],
      secondary: ['jezero', 'priroda', 'plaža', 'pecanje', 'šetnja'],
      longTail: [
        'gde se nalazi Bovan',
        'kako doći do Bovana',
        'Bovan jezero lokacija',
        'udaljenost od Niša',
        'Aleksinac Bovan',
        'plaže na Bovanu',
        'aktivnosti Bovan jezero'
      ]
    },
    en: {
      primary: ['location', 'Bovan', 'Aleksinac', 'Niš'],
      secondary: ['lake', 'nature', 'beach', 'fishing', 'hiking'],
      longTail: [
        'where is Bovan Lake',
        'how to get to Bovan',
        'Bovan Lake location',
        'distance from Niš',
        'Aleksinac Bovan',
        'beaches at Bovan',
        'activities Bovan Lake'
      ]
    },
    de: {
      primary: ['Lage', 'Bovan', 'Aleksinac', 'Niš'],
      secondary: ['See', 'Natur', 'Strand', 'Angeln', 'Wandern'],
      longTail: [
        'wo liegt Bovan See',
        'wie kommt man nach Bovan',
        'Bovan See Lage',
        'Entfernung von Niš',
        'Aleksinac Bovan',
        'Strände am Bovan',
        'Aktivitäten Bovan See'
      ]
    },
    it: {
      primary: ['posizione', 'Bovan', 'Aleksinac', 'Niš'],
      secondary: ['lago', 'natura', 'spiaggia', 'pesca', 'escursioni'],
      longTail: [
        'dove si trova Lago Bovan',
        'come arrivare a Bovan',
        'posizione Lago Bovan',
        'distanza da Niš',
        'Aleksinac Bovan',
        'spiagge a Bovan',
        'attività Lago Bovan'
      ]
    }
  },

  contact: {
    sr: {
      primary: ['kontakt', 'rezervacija', 'telefon', 'email'],
      secondary: ['pitanja', 'informacije', 'dostupnost', 'cene'],
      longTail: [
        'kontakt apartmani Jovča',
        'rezervacija apartmana Bovan',
        'telefon broj apartmani',
        'email apartmani Jovča',
        'kako rezervisati',
        'pitanja o smeštaju'
      ]
    },
    en: {
      primary: ['contact', 'booking', 'phone', 'email'],
      secondary: ['questions', 'information', 'availability', 'rates'],
      longTail: [
        'contact Jovča apartments',
        'book apartments Bovan',
        'phone number apartments',
        'email Jovča apartments',
        'how to book',
        'accommodation questions'
      ]
    },
    de: {
      primary: ['Kontakt', 'Buchung', 'Telefon', 'E-Mail'],
      secondary: ['Fragen', 'Informationen', 'Verfügbarkeit', 'Preise'],
      longTail: [
        'Kontakt Jovča Apartments',
        'Ferienwohnungen buchen Bovan',
        'Telefonnummer Apartments',
        'E-Mail Jovča Apartments',
        'wie buchen',
        'Fragen zur Unterkunft'
      ]
    },
    it: {
      primary: ['contatto', 'prenotazione', 'telefono', 'email'],
      secondary: ['domande', 'informazioni', 'disponibilità', 'tariffe'],
      longTail: [
        'contatto appartamenti Jovča',
        'prenotare appartamenti Bovan',
        'numero di telefono appartamenti',
        'email appartamenti Jovča',
        'come prenotare',
        'domande sull\'alloggio'
      ]
    }
  },

  gallery: {
    sr: {
      primary: ['galerija', 'slike', 'apartmani', 'Bovan'],
      secondary: ['fotografije', 'izgled', 'enterijer', 'eksterijer'],
      longTail: [
        'galerija slika apartmana',
        'fotografije apartmana Bovan',
        'kako izgledaju apartmani',
        'slike smeštaja Jovča',
        'enterijer apartmana',
        'pogled na jezero slike'
      ]
    },
    en: {
      primary: ['gallery', 'photos', 'apartments', 'Bovan'],
      secondary: ['pictures', 'view', 'interior', 'exterior'],
      longTail: [
        'apartment photo gallery',
        'photos apartments Bovan',
        'what apartments look like',
        'accommodation pictures Jovča',
        'apartment interior',
        'lake view photos'
      ]
    },
    de: {
      primary: ['Galerie', 'Fotos', 'Apartments', 'Bovan'],
      secondary: ['Bilder', 'Ansicht', 'Innenraum', 'Außenbereich'],
      longTail: [
        'Apartment Fotogalerie',
        'Fotos Apartments Bovan',
        'wie Apartments aussehen',
        'Unterkunft Bilder Jovča',
        'Apartment Innenraum',
        'Seeblick Fotos'
      ]
    },
    it: {
      primary: ['galleria', 'foto', 'appartamenti', 'Bovan'],
      secondary: ['immagini', 'vista', 'interni', 'esterni'],
      longTail: [
        'galleria fotografica appartamenti',
        'foto appartamenti Bovan',
        'come sono gli appartamenti',
        'immagini alloggio Jovča',
        'interni appartamento',
        'foto vista lago'
      ]
    }
  },

  attractions: {
    sr: {
      primary: ['atrakcije', 'Bovan', 'turizam', 'aktivnosti'],
      secondary: ['manastir', 'plaža', 'pecanje', 'šetnja', 'izleti'],
      longTail: [
        'šta videti na Bovanu',
        'atrakcije Bovan jezero',
        'manastiri blizu Bovana',
        'aktivnosti na jezeru',
        'izleti Aleksinac',
        'turističke destinacije'
      ]
    },
    en: {
      primary: ['attractions', 'Bovan', 'tourism', 'activities'],
      secondary: ['monastery', 'beach', 'fishing', 'hiking', 'trips'],
      longTail: [
        'what to see at Bovan',
        'attractions Bovan Lake',
        'monasteries near Bovan',
        'lake activities',
        'trips Aleksinac',
        'tourist destinations'
      ]
    },
    de: {
      primary: ['Sehenswürdigkeiten', 'Bovan', 'Tourismus', 'Aktivitäten'],
      secondary: ['Kloster', 'Strand', 'Angeln', 'Wandern', 'Ausflüge'],
      longTail: [
        'was zu sehen am Bovan',
        'Sehenswürdigkeiten Bovan See',
        'Klöster in der Nähe von Bovan',
        'See Aktivitäten',
        'Ausflüge Aleksinac',
        'touristische Ziele'
      ]
    },
    it: {
      primary: ['attrazioni', 'Bovan', 'turismo', 'attività'],
      secondary: ['monastero', 'spiaggia', 'pesca', 'escursioni', 'gite'],
      longTail: [
        'cosa vedere a Bovan',
        'attrazioni Lago Bovan',
        'monasteri vicino a Bovan',
        'attività sul lago',
        'gite Aleksinac',
        'destinazioni turistiche'
      ]
    }
  },

  prices: {
    sr: {
      primary: ['cene', 'cenovnik', 'apartmani', 'rezervacija'],
      secondary: ['tarife', 'popusti', 'sezona', 'noćenje'],
      longTail: [
        'cene apartmana Bovan',
        'cenovnik smeštaja Jovča',
        'koliko košta noćenje',
        'popusti za duži boravak',
        'cene po sezoni',
        'tarife apartmana'
      ]
    },
    en: {
      primary: ['prices', 'rates', 'apartments', 'booking'],
      secondary: ['tariffs', 'discounts', 'season', 'night'],
      longTail: [
        'apartment prices Bovan',
        'accommodation rates Jovča',
        'how much per night',
        'discounts longer stay',
        'seasonal prices',
        'apartment tariffs'
      ]
    },
    de: {
      primary: ['Preise', 'Tarife', 'Apartments', 'Buchung'],
      secondary: ['Gebühren', 'Rabatte', 'Saison', 'Übernachtung'],
      longTail: [
        'Apartment Preise Bovan',
        'Unterkunft Tarife Jovča',
        'wie viel pro Nacht',
        'Rabatte längerer Aufenthalt',
        'saisonale Preise',
        'Apartment Gebühren'
      ]
    },
    it: {
      primary: ['prezzi', 'tariffe', 'appartamenti', 'prenotazione'],
      secondary: ['costi', 'sconti', 'stagione', 'notte'],
      longTail: [
        'prezzi appartamenti Bovan',
        'tariffe alloggio Jovča',
        'quanto costa per notte',
        'sconti soggiorno lungo',
        'prezzi stagionali',
        'tariffe appartamenti'
      ]
    }
  },

  privacy: {
    sr: {
      primary: ['privatnost', 'politika', 'podaci', 'zaštita'],
      secondary: ['GDPR', 'kolačići', 'sigurnost', 'informacije'],
      longTail: [
        'politika privatnosti',
        'zaštita podataka',
        'kako čuvamo podatke',
        'GDPR usklađenost',
        'politika kolačića'
      ]
    },
    en: {
      primary: ['privacy', 'policy', 'data', 'protection'],
      secondary: ['GDPR', 'cookies', 'security', 'information'],
      longTail: [
        'privacy policy',
        'data protection',
        'how we protect data',
        'GDPR compliance',
        'cookie policy'
      ]
    },
    de: {
      primary: ['Datenschutz', 'Richtlinie', 'Daten', 'Schutz'],
      secondary: ['DSGVO', 'Cookies', 'Sicherheit', 'Informationen'],
      longTail: [
        'Datenschutzrichtlinie',
        'Datenschutz',
        'wie wir Daten schützen',
        'DSGVO-Konformität',
        'Cookie-Richtlinie'
      ]
    },
    it: {
      primary: ['privacy', 'politica', 'dati', 'protezione'],
      secondary: ['GDPR', 'cookie', 'sicurezza', 'informazioni'],
      longTail: [
        'politica sulla privacy',
        'protezione dei dati',
        'come proteggiamo i dati',
        'conformità GDPR',
        'politica sui cookie'
      ]
    }
  },

  terms: {
    sr: {
      primary: ['uslovi', 'korišćenje', 'pravila', 'rezervacija'],
      secondary: ['otkazivanje', 'plaćanje', 'odgovornost', 'garancija'],
      longTail: [
        'uslovi korišćenja',
        'pravila rezervacije',
        'politika otkazivanja',
        'uslovi plaćanja',
        'pravila ponašanja'
      ]
    },
    en: {
      primary: ['terms', 'conditions', 'rules', 'booking'],
      secondary: ['cancellation', 'payment', 'liability', 'guarantee'],
      longTail: [
        'terms of use',
        'booking rules',
        'cancellation policy',
        'payment terms',
        'house rules'
      ]
    },
    de: {
      primary: ['Bedingungen', 'Nutzung', 'Regeln', 'Buchung'],
      secondary: ['Stornierung', 'Zahlung', 'Haftung', 'Garantie'],
      longTail: [
        'Nutzungsbedingungen',
        'Buchungsregeln',
        'Stornierungsbedingungen',
        'Zahlungsbedingungen',
        'Hausordnung'
      ]
    },
    it: {
      primary: ['termini', 'condizioni', 'regole', 'prenotazione'],
      secondary: ['cancellazione', 'pagamento', 'responsabilità', 'garanzia'],
      longTail: [
        'termini di utilizzo',
        'regole di prenotazione',
        'politica di cancellazione',
        'termini di pagamento',
        'regole della casa'
      ]
    }
  }
};

/**
 * Get keywords for a specific page type and locale
 */
export function getKeywords(pageType: PageType, locale: Locale): KeywordSet {
  return keywords[pageType][locale];
}

/**
 * Get all keywords as a comma-separated string for meta keywords tag
 * (Note: meta keywords are largely ignored by search engines, but included for completeness)
 */
export function getKeywordsString(pageType: PageType, locale: Locale): string {
  const keywordSet = getKeywords(pageType, locale);
  return [...keywordSet.primary, ...keywordSet.secondary].join(', ');
}

/**
 * Get primary keyword for a page (used in title optimization)
 */
export function getPrimaryKeyword(pageType: PageType, locale: Locale): string {
  const keywordSet = getKeywords(pageType, locale);
  return keywordSet.primary[0];
}

/**
 * Get long-tail keywords for content optimization
 */
export function getLongTailKeywords(pageType: PageType, locale: Locale): string[] {
  const keywordSet = getKeywords(pageType, locale);
  return keywordSet.longTail;
}
