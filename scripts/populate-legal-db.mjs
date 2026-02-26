#!/usr/bin/env node

/**
 * Populate Legal Content Script
 * 
 * This script populates the database with complete legal texts:
 * - Privacy Policy (GDPR)
 * - Terms of Service
 * 
 * For all languages: SR, EN (DE and IT will use EN as fallback)
 */

import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'fs'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'
import dotenv from 'dotenv'

// Load environment variables
dotenv.config({ path: '.env.local' })

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.NEXT_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing required environment variables:')
  console.error('   NEXT_PUBLIC_SUPABASE_URL:', supabaseUrl ? '✓' : '✗')
  console.error('   NEXT_SERVICE_ROLE_KEY:', supabaseServiceKey ? '✓' : '✗')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

// Legal content data structure
const legalContent = {
  sr: {
    privacy: {
      title: 'Politika privatnosti',
      lastUpdated: 'Poslednje ažurirano: Februar 2026',
      intro: 'Apartmani Jovča poštuju vašu privatnost i posvećeni su zaštiti vaših ličnih podataka. Ova politika objašnjava kako prikupljamo, koristimo, čuvamo i štitimo vaše informacije u skladu sa zakonima Republike Srbije.',
      'dataCollection.title': '1. Koje podatke prikupljamo',
      'dataCollection.content': 'Prilikom rezervacije i boravka u našim apartmanima, prikupljamo sledeće podatke:\n\nPodaci koje prikupljamo:\n• Lični podaci: Ime i prezime, broj telefona, email adresa\n• Identifikacioni podaci: Broj lične karte ili pasoša (obavezno po zakonu za prijavu gostiju)\n• Podaci o rezervaciji: Datumi boravka, broj gostiju, izabrani apartman\n• Finansijski podaci: Informacije o plaćanju i depozitu\n• Komunikacija: Prepiska putem email-a, WhatsApp-a ili telefona',
      'dataUsage.title': '2. Kako koristimo vaše podatke',
      'dataUsage.content': 'Vaše lične podatke koristimo isključivo u sledeće svrhe:\n• Obrada rezervacija i potvrda boravka\n• Prijava gostiju nadležnim organima (zakonska obaveza)\n• Komunikacija o vašem boravku, instrukcijama za dolazak i dodatnim uslugama\n• Obrada plaćanja i povraćaj depozita',
      'dataProtection.title': '3. Zaštita podataka',
      'dataProtection.content': 'Primenjujemo stroge mere zaštite vaših ličnih podataka:\n• Podaci se čuvaju na sigurnim serverima sa enkripcijom\n• Pristup podacima imaju samo ovlašćena lica (vlasnik i administratori)\n• Ne delimo vaše podatke sa trećim stranama osim kada je to zakonski obavezno (policija, turistička inspekcija)',
      'userRights.title': '5. Vaša prava',
      'userRights.content': 'U skladu sa zakonima o zaštiti podataka, imate pravo da:\n• Zatražite uvid u svoje lične podatke koje čuvamo\n• Zatražite ispravku netačnih podataka\n• Zatražite brisanje podataka nakon isteka zakonskog roka čuvanja\n• Povučete saglasnost za obradu podataka (osim zakonski obaveznih)',
      'cookies.title': '4. Kolačići (Cookies)',
      'cookies.content': 'Naš veb sajt koristi kolačiće za:\n• Pamćenje vaših jezičkih podešavanja\n• Analizu posećenosti sajta (anonimni podaci)\n• Poboljšanje korisničkog iskustva',
      'gdpr.title': '6. Rok čuvanja podataka',
      'gdpr.content': 'Vaše podatke čuvamo u skladu sa zakonskim obavezama: podaci o prijavama gostiju se čuvaju 1 godinu, finansijski podaci 5 godina, a ostali podaci se brišu nakon 2 godine od poslednjeg boravka.',
      'contact.title': 'Kontakt za pitanja o privatnosti',
      'contact.content': 'Za sva pitanja o zaštiti vaših ličnih podataka, možete nas kontaktirati:\n\nEmail: apartmanijovca@gmail.com\nTelefon: +381 65 237 8080\nWhatsApp: +381 65 237 8080'
    },
    terms: {
      title: 'Uslovi korišćenja i Kućni red',
      lastUpdated: 'Poslednje ažurirano: Februar 2026',
      intro: 'Rezervacijom i boravkom u Apartmanima Jovča, prihvatate sledeće uslove korišćenja i kućni red. Molimo vas da pažljivo pročitate ova pravila kako bi vaš boravak bio prijatan i bez nesporazuma.',
      'booking.title': '1. Rezervacija i potvrda',
      'booking.content': 'Proces rezervacije i uslovi potvrde:\n• Rezervacija se smatra važećom tek nakon naše pisane potvrde putem email-a ili WhatsApp-a\n• Depozit od 50€ je obavezan za potvrdu rezervacije i vraća se nakon provere stanja objekta pri odlasku\n• Puna uplata se vrši najkasnije 7 dana pre dolaska ili po dolasku (gotovina ili bankovna transakcija)\n• Rezervacija obavezuje obe strane - gosta i vlasnika - na poštovanje dogovorenih uslova',
      'payment.title': '2. Prijava i odjava',
      'payment.content': 'Pravila za check-in i check-out:\n• Prijava (check-in): od 14:00 časova. Ranija prijava moguća uz prethodnu najavu i dostupnost (doplata 10€/sat)\n• Odjava (check-out): do 10:00 časova. Kasnija odjava moguća uz prethodnu najavu i dostupnost (doplata 10€/sat)\n• Prijava gostiju je zakonski obavezna - potreban je važeći lični dokument (lična karta ili pasoš) za sve goste',
      'cancellation.title': '3. Politika otkazivanja',
      'cancellation.content': 'Uslovi otkazivanja rezervacije:\n\nPravila otkazivanja:\n• Otkazivanje više od 14 dana pre dolaska: povraćaj 100% uplaćenog iznosa (osim depozita od 30€)\n• Otkazivanje 7-14 dana pre dolaska: povraćaj 50% uplaćenog iznosa\n• Otkazivanje manje od 7 dana pre dolaska: bez povraćaja novca (100% naknada)',
      'houseRules.title': '4. Kućni red - Osnovna pravila',
      'houseRules.content': 'Pravila ponašanja u objektu za prijatan boravak svih gostiju:\n• Vreme tišine: 22:00 - 08:00. Glasna muzika, vikanje i buka su strogo zabranjeni. Kršenje može dovesti do prekida boravka bez povraćaja novca.\n• Maksimalan broj gostiju: prema kapacitetu apartmana. Dodatni gosti nisu dozvoljeni bez prethodne najave i doplate (20€/osoba/noć).\n• Pušenje je strogo zabranjeno u zatvorenom prostoru. Dozvoljeno je samo na označenoj terasi. Kazna za pušenje u objektu: 100€.\n• Kućni ljubimci su dozvoljeni uz prethodnu najavu i doplatu od 15€/dan. Vlasnik je odgovoran za ponašanje i čistoću.',
      'liability.title': '5. Zabrane i bezbednost',
      'liability.content': 'Strogo zabranjene aktivnosti:\n• Organizovanje žurki, proslava ili okupljanja sa više od 2 dodatna gosta koji nisu registrovani. Kazna: 200€.\n• Iznošenje inventara (peškiri, posteljina, kuhinjski aparati) iz objekta. Kazna: naknada po tržišnoj vrednosti.\n• Svaka upotreba prostora za ilegalne aktivnosti (droga, prostitucija) biće prijavljena policiji i dovesti će do trenutnog prekida ugovora.\n\n6. Šteta i odgovornost\nSvaka namerna ili nehatna šteta na inventaru ili objektu biće naplaćena po stvarnoj vrednosti popravke ili zamene. Depozit od 50€ služi kao garancija i vraća se u roku od 24 sata nakon provere stanja objekta.',
      'changes.title': '7. Dodatne obaveze',
      'changes.content': 'Gosti su dužni da: ostave objekat urednim, odlože smeće u označene kontejnere, isključe sve uređaje (klima, grejanje, svetla) pri odlasku. Za izuzetno zagađene prostore naplaćuje se dodatno čišćenje od 30€. Gubitak ključa nosi kaznu od 50€.'
    }
  },
  en: {
    privacy: {
      title: 'Privacy Policy',
      lastUpdated: 'Last updated: February 2026',
      intro: 'Apartmani Jovča respects your privacy and is committed to protecting your personal data. This policy explains how we collect, use, store, and protect your information in accordance with the laws of the Republic of Serbia.',
      'dataCollection.title': '1. What Data We Collect',
      'dataCollection.content': 'When making a reservation and during your stay at our apartments, we collect the following data:\n\nData we collect:\n• Personal data: Full name, phone number, email address\n• Identification data: ID card or passport number (legally required for guest registration)\n• Reservation data: Stay dates, number of guests, selected apartment\n• Financial data: Payment and deposit information\n• Communication: Correspondence via email, WhatsApp, or phone',
      'dataUsage.title': '2. How We Use Your Data',
      'dataUsage.content': 'We use your personal data exclusively for the following purposes:\n• Processing reservations and stay confirmations\n• Guest registration with authorities (legal obligation)\n• Communication about your stay, arrival instructions, and additional services\n• Payment processing and deposit refunds',
      'dataProtection.title': '3. Data Protection',
      'dataProtection.content': 'We implement strict measures to protect your personal data:\n• Data is stored on secure servers with encryption\n• Only authorized personnel (owner and administrators) have access to data\n• We do not share your data with third parties except when legally required (police, tourism inspection)',
      'userRights.title': '5. Your Rights',
      'userRights.content': 'In accordance with data protection laws, you have the right to:\n• Request access to your personal data that we store\n• Request correction of inaccurate data\n• Request deletion of data after the legal retention period expires\n• Withdraw consent for data processing (except legally required)',
      'cookies.title': '4. Cookies',
      'cookies.content': 'Our website uses cookies for:\n• Remembering your language preferences\n• Website traffic analysis (anonymous data)\n• Improving user experience',
      'gdpr.title': '6. Data Retention Period',
      'gdpr.content': 'We store your data in accordance with legal obligations: guest registration data is kept for 1 year, financial data for 5 years, and other data is deleted 2 years after your last stay.',
      'contact.title': 'Privacy Contact',
      'contact.content': 'For all questions about the protection of your personal data, you can contact us:\n\nEmail: apartmanijovca@gmail.com\nPhone: +381 65 237 8080\nWhatsApp: +381 65 237 8080'
    },
    terms: {
      title: 'Terms of Service & House Rules',
      lastUpdated: 'Last updated: February 2026',
      intro: 'By making a reservation and staying at Apartmani Jovča, you accept the following terms of service and house rules. Please read these rules carefully to ensure a pleasant stay without misunderstandings.',
      'booking.title': '1. Reservation and Confirmation',
      'booking.content': 'Reservation process and confirmation terms:\n• A reservation is considered valid only after our written confirmation via email or WhatsApp\n• A deposit of €50 is required to confirm the reservation and will be refunded after property inspection upon departure\n• Full payment must be made no later than 7 days before arrival or upon arrival (cash or bank transfer)\n• The reservation binds both parties - guest and owner - to respect the agreed terms',
      'payment.title': '2. Check-in and Check-out',
      'payment.content': 'Check-in and check-out rules:\n• Check-in: from 2:00 PM. Early check-in possible with prior notice and availability (€10/hour surcharge)\n• Check-out: by 10:00 AM. Late check-out possible with prior notice and availability (€10/hour surcharge)\n• Guest registration is legally mandatory - a valid ID (ID card or passport) is required for all guests',
      'cancellation.title': '3. Cancellation Policy',
      'cancellation.content': 'Reservation cancellation terms:\n\nCancellation rules:\n• Cancellation more than 14 days before arrival: 100% refund of paid amount (except €30 deposit)\n• Cancellation 7-14 days before arrival: 50% refund of paid amount\n• Cancellation less than 7 days before arrival: no refund (100% charge)',
      'houseRules.title': '4. House Rules - Basic Rules',
      'houseRules.content': 'Behavior rules in the property for a pleasant stay for all guests:\n• Quiet hours: 10:00 PM - 8:00 AM. Loud music, shouting, and noise are strictly prohibited. Violation may result in termination of stay without refund.\n• Maximum number of guests: according to apartment capacity. Additional guests are not allowed without prior notice and surcharge (€20/person/night).\n• Smoking is strictly prohibited indoors. Allowed only on designated terrace. Penalty for indoor smoking: €100.\n• Pets are allowed with prior notice and a surcharge of €15/day. Owner is responsible for behavior and cleanliness.',
      'liability.title': '5. Prohibitions and Safety',
      'liability.content': 'Strictly prohibited activities:\n• Organizing parties, celebrations, or gatherings with more than 2 additional unregistered guests. Penalty: €200.\n• Removing inventory (towels, linens, kitchen appliances) from the property. Penalty: compensation at market value.\n• Any use of the premises for illegal activities (drugs, prostitution) will be reported to police and result in immediate contract termination.\n\n6. Damage and Liability\nAny intentional or negligent damage to inventory or property will be charged at the actual repair or replacement cost. The €50 deposit serves as a guarantee and will be refunded within 24 hours after property inspection.',
      'changes.title': '7. Additional Obligations',
      'changes.content': 'Guests are required to: leave the property tidy, dispose of trash in designated containers, turn off all devices (AC, heating, lights) upon departure. For exceptionally dirty premises, additional cleaning of €30 will be charged. Loss of key carries a €50 penalty.'
    }
  }
}

async function populateLegalContent() {
  console.log('🚀 Starting legal content population...\n')

  let totalInserted = 0
  let totalUpdated = 0
  let totalErrors = 0

  // Process all languages (SR, EN, DE, IT)
  // DE and IT will use EN content as fallback
  const languages = ['sr', 'en', 'de', 'it']

  for (const lang of languages) {
    console.log(`\n📝 Processing ${lang.toUpperCase()} content...`)
    
    // Use English content as fallback for DE and IT
    const sourceContent = legalContent[lang] || legalContent.en
    
    // Process privacy policy
    for (const [key, value] of Object.entries(sourceContent.privacy)) {
      const fullKey = `privacy.${key}`
      
      try {
        const { data, error } = await supabase
          .from('content')
          .upsert({
            key: fullKey,
            language: lang,
            value: value,
            published: true
          }, {
            onConflict: 'key,language'
          })
          .select()

        if (error) throw error
        
        if (data && data.length > 0) {
          totalInserted++
          console.log(`  ✓ ${fullKey} (${lang})`)
        } else {
          totalUpdated++
          console.log(`  ↻ ${fullKey} (${lang}) - updated`)
        }
      } catch (error) {
        totalErrors++
        console.error(`  ✗ ${fullKey} (${lang}):`, error.message)
      }
    }

    // Process terms of service
    for (const [key, value] of Object.entries(sourceContent.terms)) {
      const fullKey = `terms.${key}`
      
      try {
        const { data, error } = await supabase
          .from('content')
          .upsert({
            key: fullKey,
            language: lang,
            value: value,
            published: true
          }, {
            onConflict: 'key,language'
          })
          .select()

        if (error) throw error
        
        if (data && data.length > 0) {
          totalInserted++
          console.log(`  ✓ ${fullKey} (${lang})`)
        } else {
          totalUpdated++
          console.log(`  ↻ ${fullKey} (${lang}) - updated`)
        }
      } catch (error) {
        totalErrors++
        console.error(`  ✗ ${fullKey} (${lang}):`, error.message)
      }
    }
  }

  console.log('\n' + '='.repeat(60))
  console.log('📊 SUMMARY')
  console.log('='.repeat(60))
  console.log(`✅ Inserted: ${totalInserted}`)
  console.log(`↻  Updated:  ${totalUpdated}`)
  console.log(`❌ Errors:   ${totalErrors}`)
  console.log('='.repeat(60))

  if (totalErrors === 0) {
    console.log('\n✨ Legal content successfully populated!')
  } else {
    console.log('\n⚠️  Completed with some errors. Please check the logs above.')
  }
}

// Run the script
populateLegalContent()
  .then(() => {
    console.log('\n✅ Script completed')
    process.exit(0)
  })
  .catch((error) => {
    console.error('\n❌ Script failed:', error)
    process.exit(1)
  })
