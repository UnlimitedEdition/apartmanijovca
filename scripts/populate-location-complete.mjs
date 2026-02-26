#!/usr/bin/env node

/**
 * Populate Complete Location Content
 * 
 * This script populates ALL location page content for ALL 4 languages (SR, EN, DE, IT)
 */

import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.NEXT_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing environment variables')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

const locationContent = {
  sr: {
    'location.title': 'Lokacija',
    'location.description': 'Kako do nas',
    'location.address': 'Adresa',
    'location.addressName': 'Apartmani Jovča',
    'location.addressStreet': 'Vikend naselje (Jovča)',
    'location.addressLake': 'Bovansko jezero',
    'location.addressCity': '18230 Aleksinac, Srbija',
    'location.googleMaps': 'Otvori u Google Mapama',
    'location.callDirections': 'Pozovite za instrukcije',
    'location.reachTitle': 'Kako do nas',
    'location.byCarTitle': 'Automobilom',
    'location.byCarDesc': 'Iz pravca Beograda/Niša (autoput E75): Isključite se kod Aleksinca i pratite znakove za Bovansko jezero. Nalazimo se u naselju "Vikend naselje".',
    'location.byBusTitle': 'Autobusom',
    'location.byBusDesc': 'Idite autobusom do Aleksinca. Sa stanice, taksi do jezera Bovan traje oko 15 minuta (oko 10€).',
    'location.nearbyTitle': 'U blizini',
    'location.bovanLake': 'Bovansko jezero',
    'location.bovanLakeDesc': 'Na samom pragu - kupanje, ribolov i sportovi na vodi',
    'location.sokolica': 'Tvrđava Sokolica',
    'location.sokolicaDesc': 'Srednjovekovna tvrđava sa panoramskim pogledom - 20 km udaljena',
    'location.nis': 'Niš',
    'location.nisDesc': 'Istorijski grad sa many atrakcijama - 30 km udaljen'
  },
  en: {
    'location.title': 'Location',
    'location.description': 'How to find us',
    'location.address': 'Address',
    'location.addressName': 'Jovča Apartments',
    'location.addressStreet': 'Weekend Resort (Jovča)',
    'location.addressLake': 'Bovan Lake',
    'location.addressCity': '18230 Aleksinac, Serbia',
    'location.googleMaps': 'Open in Google Maps',
    'location.callDirections': 'Call for Directions',
    'location.reachTitle': 'How to reach us',
    'location.byCarTitle': 'By Car',
    'location.byCarDesc': 'From Belgrade/Niš (E75 highway): Exit at Aleksinac and follow signs for Bovan Lake. We are located in the "Vikend naselje" area.',
    'location.byBusTitle': 'By Bus',
    'location.byBusDesc': 'Take a bus to Aleksinac. From the station, a taxi to Bovan Lake takes approx. 15 minutes (approx. 10€).',
    'location.nearbyTitle': 'Nearby Attractions',
    'location.bovanLake': 'Bovan Lake',
    'location.bovanLakeDesc': 'Right at your doorstep - swimming, fishing, and water sports',
    'location.sokolica': 'Sokolica Fortress',
    'location.sokolicaDesc': 'Medieval fortress with panoramic views - 20 km away',
    'location.nis': 'Niš',
    'location.nisDesc': 'Historic city with many attractions - 30 km away'
  },
  de: {
    'location.title': 'Lage',
    'location.description': 'So finden Sie uns',
    'location.address': 'Adresse',
    'location.addressName': 'Apartments Jovča',
    'location.addressStreet': 'Wochenendsiedlung (Jovča)',
    'location.addressLake': 'Bovan-See',
    'location.addressCity': '18230 Aleksinac, Serbien',
    'location.googleMaps': 'In Google Maps öffnen',
    'location.callDirections': 'Anrufen für Wegbeschreibung',
    'location.reachTitle': 'So erreichen Sie uns',
    'location.byCarTitle': 'Mit dem Auto',
    'location.byCarDesc': 'Von Belgrad/Niš (Autobahn E75): Ausfahrt Aleksinac nehmen und den Schildern zum Bovan-See folgen. Wir befinden uns im Gebiet "Vikend naselje".',
    'location.byBusTitle': 'Mit dem Bus',
    'location.byBusDesc': 'Nehmen Sie einen Bus nach Aleksinac. Vom Bahnhof dauert eine Taxifahrt zum Bovan-See ca. 15 Minuten (ca. 10€).',
    'location.nearbyTitle': 'Nahegelegene Sehenswürdigkeiten',
    'location.bovanLake': 'Bovan-See',
    'location.bovanLakeDesc': 'Direkt vor der Haustür - Schwimmen, Angeln und Wassersport',
    'location.sokolica': 'Festung Sokolica',
    'location.sokolicaDesc': 'Mittelalterliche Festung mit Panoramablick - 20 km entfernt',
    'location.nis': 'Niš',
    'location.nisDesc': 'Historische Stadt mit vielen Sehenswürdigkeiten - 30 km entfernt'
  },
  it: {
    'location.title': 'Posizione',
    'location.description': 'Come trovarci',
    'location.address': 'Indirizzo',
    'location.addressName': 'Appartamenti Jovča',
    'location.addressStreet': 'Insediamento weekend (Jovča)',
    'location.addressLake': 'Lago Bovan',
    'location.addressCity': '18230 Aleksinac, Serbia',
    'location.googleMaps': 'Apri in Google Maps',
    'location.callDirections': 'Chiama per indicazioni',
    'location.reachTitle': 'Come raggiungerci',
    'location.byCarTitle': 'In auto',
    'location.byCarDesc': 'Da Belgrado/Niš (autostrada E75): Uscita ad Aleksinac e seguire le indicazioni per il Lago Bovan. Ci troviamo nell\'area "Vikend naselje".',
    'location.byBusTitle': 'In autobus',
    'location.byBusDesc': 'Prendere un autobus per Aleksinac. Dalla stazione, un taxi per il Lago Bovan impiega circa 15 minuti (circa 10€).',
    'location.nearbyTitle': 'Attrazioni vicine',
    'location.bovanLake': 'Lago Bovan',
    'location.bovanLakeDesc': 'Proprio a portata di mano - nuoto, pesca e sport acquatici',
    'location.sokolica': 'Fortezza Sokolica',
    'location.sokolicaDesc': 'Fortezza medievale con vista panoramica - 20 km di distanza',
    'location.nis': 'Niš',
    'location.nisDesc': 'Città storica con molte attrazioni - 30 km di distanza'
  }
}

async function populateLocationContent() {
  console.log('🚀 Populating complete location content for ALL languages...\n')

  let totalInserted = 0
  let totalErrors = 0

  for (const [lang, content] of Object.entries(locationContent)) {
    console.log(`\n📝 Processing ${lang.toUpperCase()}...`)
    
    for (const [key, value] of Object.entries(content)) {
      try {
        const { error } = await supabase
          .from('content')
          .upsert({
            key,
            language: lang,
            value,
            published: true
          }, {
            onConflict: 'key,language'
          })

        if (error) throw error
        
        totalInserted++
        console.log(`  ✓ ${key}`)
      } catch (error) {
        totalErrors++
        console.error(`  ✗ ${key}:`, error.message)
      }
    }
  }

  console.log('\n' + '='.repeat(60))
  console.log('📊 SUMMARY')
  console.log('='.repeat(60))
  console.log(`✅ Inserted/Updated: ${totalInserted}`)
  console.log(`❌ Errors: ${totalErrors}`)
  console.log('='.repeat(60))

  if (totalErrors === 0) {
    console.log('\n✨ Location content successfully populated for ALL languages!')
  }
}

populateLocationContent()
  .then(() => {
    console.log('\n✅ Script completed')
    process.exit(0)
  })
  .catch((error) => {
    console.error('\n❌ Script failed:', error)
    process.exit(1)
  })
