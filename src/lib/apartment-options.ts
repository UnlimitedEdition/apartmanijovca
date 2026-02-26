// Predefined apartment options with translations
// User just checks what they have - no manual translation needed!

export interface ApartmentOption {
  id: string
  label: {
    sr: string
    en: string
    de: string
    it: string
  }
}

// 🛏️ BED TYPES - Predefined options
export const BED_OPTIONS: ApartmentOption[] = [
  {
    id: 'double_bed',
    label: {
      sr: '1 bračni krevet (160x200 cm)',
      en: '1 double bed (160x200 cm)',
      de: '1 Doppelbett (160x200 cm)',
      it: '1 letto matrimoniale (160x200 cm)'
    }
  },
  {
    id: 'queen_bed',
    label: {
      sr: '1 queen size krevet (180x200 cm)',
      en: '1 queen size bed (180x200 cm)',
      de: '1 Queen-Size-Bett (180x200 cm)',
      it: '1 letto queen size (180x200 cm)'
    }
  },
  {
    id: 'single_bed',
    label: {
      sr: '1 krevet za jednu osobu (90x200 cm)',
      en: '1 single bed (90x200 cm)',
      de: '1 Einzelbett (90x200 cm)',
      it: '1 letto singolo (90x200 cm)'
    }
  },
  {
    id: 'two_single_beds',
    label: {
      sr: '2 kreveta za jednu osobu',
      en: '2 single beds',
      de: '2 Einzelbetten',
      it: '2 letti singoli'
    }
  },
  {
    id: 'sofa_bed',
    label: {
      sr: '1 kauč na razvlačenje',
      en: '1 sofa bed',
      de: '1 Schlafsofa',
      it: '1 divano letto'
    }
  },
  {
    id: 'bunk_bed',
    label: {
      sr: '1 krevet na sprat',
      en: '1 bunk bed',
      de: '1 Etagenbett',
      it: '1 letto a castello'
    }
  }
]

// ✨ AMENITIES - Predefined options
export const AMENITY_OPTIONS: ApartmentOption[] = [
  // Internet & Entertainment
  {
    id: 'wifi',
    label: {
      sr: 'WiFi besplatan',
      en: 'Free WiFi',
      de: 'Kostenloses WLAN',
      it: 'WiFi gratuito'
    }
  },
  {
    id: 'tv',
    label: {
      sr: 'TV sa kablovskom',
      en: 'Cable TV',
      de: 'Kabel-TV',
      it: 'TV via cavo'
    }
  },
  {
    id: 'smart_tv',
    label: {
      sr: 'Smart TV',
      en: 'Smart TV',
      de: 'Smart TV',
      it: 'Smart TV'
    }
  },
  
  // Climate Control
  {
    id: 'ac',
    label: {
      sr: 'Klima uređaj',
      en: 'Air conditioning',
      de: 'Klimaanlage',
      it: 'Aria condizionata'
    }
  },
  {
    id: 'heating',
    label: {
      sr: 'Grejanje',
      en: 'Heating',
      de: 'Heizung',
      it: 'Riscaldamento'
    }
  },
  
  // Kitchen
  {
    id: 'kitchen',
    label: {
      sr: 'Kuhinja potpuno opremljena',
      en: 'Fully equipped kitchen',
      de: 'Voll ausgestattete Küche',
      it: 'Cucina completamente attrezzata'
    }
  },
  {
    id: 'kitchenette',
    label: {
      sr: 'Čajna kuhinja',
      en: 'Kitchenette',
      de: 'Kochnische',
      it: 'Angolo cottura'
    }
  },
  {
    id: 'fridge',
    label: {
      sr: 'Frižider',
      en: 'Refrigerator',
      de: 'Kühlschrank',
      it: 'Frigorifero'
    }
  },
  {
    id: 'microwave',
    label: {
      sr: 'Mikrotalasna',
      en: 'Microwave',
      de: 'Mikrowelle',
      it: 'Microonde'
    }
  },
  {
    id: 'coffee_maker',
    label: {
      sr: 'Aparat za kafu',
      en: 'Coffee maker',
      de: 'Kaffeemaschine',
      it: 'Macchina per il caffè'
    }
  },
  {
    id: 'dishwasher',
    label: {
      sr: 'Mašina za pranje sudova',
      en: 'Dishwasher',
      de: 'Geschirrspüler',
      it: 'Lavastoviglie'
    }
  },
  
  // Bathroom
  {
    id: 'washing_machine',
    label: {
      sr: 'Mašina za pranje veša',
      en: 'Washing machine',
      de: 'Waschmaschine',
      it: 'Lavatrice'
    }
  },
  {
    id: 'hair_dryer',
    label: {
      sr: 'Fen za kosu',
      en: 'Hair dryer',
      de: 'Haartrockner',
      it: 'Asciugacapelli'
    }
  },
  {
    id: 'towels',
    label: {
      sr: 'Peškiri obezbeđeni',
      en: 'Towels provided',
      de: 'Handtücher vorhanden',
      it: 'Asciugamani forniti'
    }
  },
  
  // Outdoor
  {
    id: 'balcony',
    label: {
      sr: 'Balkon',
      en: 'Balcony',
      de: 'Balkon',
      it: 'Balcone'
    }
  },
  {
    id: 'terrace',
    label: {
      sr: 'Terasa',
      en: 'Terrace',
      de: 'Terrasse',
      it: 'Terrazza'
    }
  },
  {
    id: 'garden',
    label: {
      sr: 'Bašta',
      en: 'Garden',
      de: 'Garten',
      it: 'Giardino'
    }
  },
  
  // Parking & Access
  {
    id: 'parking',
    label: {
      sr: 'Parking besplatan',
      en: 'Free parking',
      de: 'Kostenloser Parkplatz',
      it: 'Parcheggio gratuito'
    }
  },
  {
    id: 'garage',
    label: {
      sr: 'Garaža',
      en: 'Garage',
      de: 'Garage',
      it: 'Garage'
    }
  },
  {
    id: 'elevator',
    label: {
      sr: 'Lift',
      en: 'Elevator',
      de: 'Aufzug',
      it: 'Ascensore'
    }
  },
  
  // Safety & Security
  {
    id: 'safe',
    label: {
      sr: 'Sef',
      en: 'Safe',
      de: 'Safe',
      it: 'Cassaforte'
    }
  },
  {
    id: 'smoke_detector',
    label: {
      sr: 'Detektor dima',
      en: 'Smoke detector',
      de: 'Rauchmelder',
      it: 'Rilevatore di fumo'
    }
  },
  {
    id: 'first_aid',
    label: {
      sr: 'Prva pomoć',
      en: 'First aid kit',
      de: 'Erste-Hilfe-Set',
      it: 'Kit di pronto soccorso'
    }
  },
  
  // Other
  {
    id: 'iron',
    label: {
      sr: 'Pegla i daska za peglanje',
      en: 'Iron and ironing board',
      de: 'Bügeleisen und Bügelbrett',
      it: 'Ferro e asse da stiro'
    }
  },
  {
    id: 'bed_linen',
    label: {
      sr: 'Posteljina obezbeđena',
      en: 'Bed linen provided',
      de: 'Bettwäsche vorhanden',
      it: 'Biancheria da letto fornita'
    }
  },
  {
    id: 'hangers',
    label: {
      sr: 'Vešalice',
      en: 'Hangers',
      de: 'Kleiderbügel',
      it: 'Grucce'
    }
  }
]

// 📋 HOUSE RULES - Predefined options
export const RULE_OPTIONS: ApartmentOption[] = [
  // Smoking
  {
    id: 'no_smoking',
    label: {
      sr: 'Pušenje nije dozvoljeno',
      en: 'No smoking',
      de: 'Rauchen verboten',
      it: 'Vietato fumare'
    }
  },
  {
    id: 'smoking_balcony',
    label: {
      sr: 'Pušenje dozvoljeno samo na balkonu',
      en: 'Smoking allowed on balcony only',
      de: 'Rauchen nur auf dem Balkon erlaubt',
      it: 'Fumare consentito solo sul balcone'
    }
  },
  
  // Pets
  {
    id: 'no_pets',
    label: {
      sr: 'Kućni ljubimci nisu dozvoljeni',
      en: 'No pets allowed',
      de: 'Haustiere nicht erlaubt',
      it: 'Animali non ammessi'
    }
  },
  {
    id: 'pets_allowed',
    label: {
      sr: 'Kućni ljubimci dozvoljeni (uz doplatu)',
      en: 'Pets allowed (extra charge)',
      de: 'Haustiere erlaubt (gegen Aufpreis)',
      it: 'Animali ammessi (supplemento)'
    }
  },
  
  // Parties & Events
  {
    id: 'no_parties',
    label: {
      sr: 'Žurke i eventi nisu dozvoljeni',
      en: 'No parties or events',
      de: 'Keine Partys oder Veranstaltungen',
      it: 'Vietate feste ed eventi'
    }
  },
  
  // Quiet Hours
  {
    id: 'quiet_hours_22',
    label: {
      sr: 'Tiha noć od 22:00 do 08:00',
      en: 'Quiet hours from 10 PM to 8 AM',
      de: 'Ruhezeit von 22:00 bis 08:00 Uhr',
      it: 'Silenzio dalle 22:00 alle 08:00'
    }
  },
  {
    id: 'quiet_hours_23',
    label: {
      sr: 'Tiha noć od 23:00 do 08:00',
      en: 'Quiet hours from 11 PM to 8 AM',
      de: 'Ruhezeit von 23:00 bis 08:00 Uhr',
      it: 'Silenzio dalle 23:00 alle 08:00'
    }
  },
  
  // Children
  {
    id: 'children_welcome',
    label: {
      sr: 'Deca su dobrodošla',
      en: 'Children welcome',
      de: 'Kinder willkommen',
      it: 'Bambini benvenuti'
    }
  },
  {
    id: 'no_children',
    label: {
      sr: 'Nije pogodno za decu',
      en: 'Not suitable for children',
      de: 'Nicht für Kinder geeignet',
      it: 'Non adatto ai bambini'
    }
  },
  
  // Guest Limits
  {
    id: 'max_guests',
    label: {
      sr: 'Maksimalan broj gostiju mora biti poštovan',
      en: 'Maximum number of guests must be respected',
      de: 'Maximale Gästezahl muss eingehalten werden',
      it: 'Il numero massimo di ospiti deve essere rispettato'
    }
  },
  {
    id: 'no_visitors',
    label: {
      sr: 'Posetioci nisu dozvoljeni',
      en: 'No visitors allowed',
      de: 'Keine Besucher erlaubt',
      it: 'Visitatori non ammessi'
    }
  },
  
  // Damage & Responsibility
  {
    id: 'damage_responsibility',
    label: {
      sr: 'Gosti su odgovorni za štetu',
      en: 'Guests are responsible for any damage',
      de: 'Gäste haften für Schäden',
      it: 'Gli ospiti sono responsabili per eventuali danni'
    }
  },
  
  // Keys & Access
  {
    id: 'key_loss_fee',
    label: {
      sr: 'Naknada za izgubljene ključeve: 50€',
      en: 'Lost key fee: 50€',
      de: 'Gebühr für verlorene Schlüssel: 50€',
      it: 'Costo chiavi smarrite: 50€'
    }
  }
]

// 👁️ VIEW TYPES - Predefined options
export const VIEW_OPTIONS: ApartmentOption[] = [
  {
    id: 'lake_view',
    label: {
      sr: 'Pogled na jezero',
      en: 'Lake view',
      de: 'Seeblick',
      it: 'Vista lago'
    }
  },
  {
    id: 'sea_view',
    label: {
      sr: 'Pogled na more',
      en: 'Sea view',
      de: 'Meerblick',
      it: 'Vista mare'
    }
  },
  {
    id: 'mountain_view',
    label: {
      sr: 'Pogled na planinu',
      en: 'Mountain view',
      de: 'Bergblick',
      it: 'Vista montagna'
    }
  },
  {
    id: 'city_view',
    label: {
      sr: 'Pogled na grad',
      en: 'City view',
      de: 'Stadtblick',
      it: 'Vista città'
    }
  },
  {
    id: 'garden_view',
    label: {
      sr: 'Pogled na baštu',
      en: 'Garden view',
      de: 'Gartenblick',
      it: 'Vista giardino'
    }
  },
  {
    id: 'courtyard_view',
    label: {
      sr: 'Pogled na dvorište',
      en: 'Courtyard view',
      de: 'Hofblick',
      it: 'Vista cortile'
    }
  },
  {
    id: 'street_view',
    label: {
      sr: 'Pogled na ulicu',
      en: 'Street view',
      de: 'Straßenblick',
      it: 'Vista strada'
    }
  }
]

// Helper function to get selected options by IDs
export function getSelectedOptions(
  allOptions: ApartmentOption[],
  selectedIds: string[]
): ApartmentOption[] {
  return allOptions.filter(option => selectedIds.includes(option.id))
}

// Helper function to get labels in specific language
export function getOptionLabels(
  options: ApartmentOption[],
  lang: 'sr' | 'en' | 'de' | 'it'
): string[] {
  return options.map(option => option.label[lang])
}
