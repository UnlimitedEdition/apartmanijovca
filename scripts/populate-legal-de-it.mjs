#!/usr/bin/env node

/**
 * Populate German and Italian Legal Content
 * 
 * This script adds proper German and Italian translations for legal texts
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

const legalContent = {
  de: {
    privacy: {
      title: 'Datenschutzrichtlinie',
      lastUpdated: 'Zuletzt aktualisiert: Februar 2026',
      intro: 'Apartmani Jovča respektiert Ihre Privatsphäre und verpflichtet sich zum Schutz Ihrer persönlichen Daten. Diese Richtlinie erklärt, wie wir Ihre Informationen gemäß den Gesetzen der Republik Serbien sammeln, verwenden, speichern und schützen.',
      'dataCollection.title': '1. Welche Daten wir sammeln',
      'dataCollection.content': 'Bei der Buchung und während Ihres Aufenthalts in unseren Apartments sammeln wir folgende Daten:\n\nGesammelte Daten:\n• Persönliche Daten: Vollständiger Name, Telefonnummer, E-Mail-Adresse\n• Identifikationsdaten: Personalausweis- oder Reisepassnummer (gesetzlich vorgeschrieben für Gästeregistrierung)\n• Buchungsdaten: Aufenthaltsdaten, Anzahl der Gäste, ausgewähltes Apartment\n• Finanzdaten: Zahlungs- und Kautionsinformationen\n• Kommunikation: Korrespondenz per E-Mail, WhatsApp oder Telefon',
      'dataUsage.title': '2. Wie wir Ihre Daten verwenden',
      'dataUsage.content': 'Wir verwenden Ihre persönlichen Daten ausschließlich für folgende Zwecke:\n• Bearbeitung von Buchungen und Aufenthaltsbestätigungen\n• Gästeregistrierung bei Behörden (gesetzliche Verpflichtung)\n• Kommunikation über Ihren Aufenthalt, Anreiseinformationen und zusätzliche Dienstleistungen\n• Zahlungsabwicklung und Kautionsrückerstattung',
      'dataProtection.title': '3. Datenschutz',
      'dataProtection.content': 'Wir implementieren strenge Maßnahmen zum Schutz Ihrer persönlichen Daten:\n• Daten werden auf sicheren Servern mit Verschlüsselung gespeichert\n• Nur autorisiertes Personal (Eigentümer und Administratoren) hat Zugriff auf Daten\n• Wir geben Ihre Daten nicht an Dritte weiter, außer wenn gesetzlich vorgeschrieben (Polizei, Tourismusinspektion)',
      'userRights.title': '5. Ihre Rechte',
      'userRights.content': 'Gemäß den Datenschutzgesetzen haben Sie das Recht:\n• Zugang zu Ihren persönlichen Daten zu verlangen, die wir speichern\n• Korrektur ungenauer Daten zu verlangen\n• Löschung von Daten nach Ablauf der gesetzlichen Aufbewahrungsfrist zu verlangen\n• Einwilligung zur Datenverarbeitung zu widerrufen (außer gesetzlich vorgeschrieben)',
      'cookies.title': '4. Cookies',
      'cookies.content': 'Unsere Website verwendet Cookies für:\n• Speicherung Ihrer Spracheinstellungen\n• Website-Traffic-Analyse (anonyme Daten)\n• Verbesserung der Benutzererfahrung',
      'gdpr.title': '6. Datenaufbewahrungsfrist',
      'gdpr.content': 'Wir speichern Ihre Daten gemäß gesetzlichen Verpflichtungen: Gästeregistrierungsdaten werden 1 Jahr aufbewahrt, Finanzdaten 5 Jahre, und andere Daten werden 2 Jahre nach Ihrem letzten Aufenthalt gelöscht.',
      'contact.title': 'Datenschutzkontakt',
      'contact.content': 'Für alle Fragen zum Schutz Ihrer persönlichen Daten können Sie uns kontaktieren:\n\nE-Mail: apartmanijovca@gmail.com\nTelefon: +381 65 237 8080\nWhatsApp: +381 65 237 8080'
    },
    terms: {
      title: 'Nutzungsbedingungen & Hausordnung',
      lastUpdated: 'Zuletzt aktualisiert: Februar 2026',
      intro: 'Mit der Buchung und dem Aufenthalt in Apartmani Jovča akzeptieren Sie die folgenden Nutzungsbedingungen und Hausregeln. Bitte lesen Sie diese Regeln sorgfältig durch, um einen angenehmen Aufenthalt ohne Missverständnisse zu gewährleisten.',
      'booking.title': '1. Buchung und Bestätigung',
      'booking.content': 'Buchungsprozess und Bestätigungsbedingungen:\n• Eine Buchung gilt erst nach unserer schriftlichen Bestätigung per E-Mail oder WhatsApp als gültig\n• Eine Kaution von 50€ ist erforderlich, um die Buchung zu bestätigen und wird nach Inspektion der Unterkunft bei Abreise zurückerstattet\n• Die vollständige Zahlung muss spätestens 7 Tage vor Anreise oder bei Ankunft erfolgen (Bargeld oder Banküberweisung)\n• Die Buchung verpflichtet beide Parteien - Gast und Eigentümer - zur Einhaltung der vereinbarten Bedingungen',
      'payment.title': '2. Check-in und Check-out',
      'payment.content': 'Check-in- und Check-out-Regeln:\n• Check-in: ab 14:00 Uhr. Früher Check-in möglich nach vorheriger Ankündigung und Verfügbarkeit (10€/Stunde Aufpreis)\n• Check-out: bis 10:00 Uhr. Später Check-out möglich nach vorheriger Ankündigung und Verfügbarkeit (10€/Stunde Aufpreis)\n• Gästeregistrierung ist gesetzlich vorgeschrieben - ein gültiger Ausweis (Personalausweis oder Reisepass) ist für alle Gäste erforderlich',
      'cancellation.title': '3. Stornierungsbedingungen',
      'cancellation.content': 'Buchungsstornierungsbedingungen:\n\nStornierungsregeln:\n• Stornierung mehr als 14 Tage vor Anreise: 100% Rückerstattung des gezahlten Betrags (außer 30€ Kaution)\n• Stornierung 7-14 Tage vor Anreise: 50% Rückerstattung des gezahlten Betrags\n• Stornierung weniger als 7 Tage vor Anreise: keine Rückerstattung (100% Gebühr)',
      'houseRules.title': '4. Hausordnung - Grundregeln',
      'houseRules.content': 'Verhaltensregeln in der Unterkunft für einen angenehmen Aufenthalt aller Gäste:\n• Ruhezeiten: 22:00 - 08:00 Uhr. Laute Musik, Schreien und Lärm sind streng verboten. Verstöße können zur Beendigung des Aufenthalts ohne Rückerstattung führen.\n• Maximale Gästezahl: gemäß Apartment-Kapazität. Zusätzliche Gäste sind ohne vorherige Ankündigung und Aufpreis nicht erlaubt (20€/Person/Nacht).\n• Rauchen ist in Innenräumen streng verboten. Nur auf der ausgewiesenen Terrasse erlaubt. Strafe für Rauchen in Innenräumen: 100€.\n• Haustiere sind nach vorheriger Ankündigung und gegen einen Aufpreis von 15€/Tag erlaubt. Der Eigentümer ist für Verhalten und Sauberkeit verantwortlich.',
      'liability.title': '5. Verbote und Sicherheit',
      'liability.content': 'Streng verbotene Aktivitäten:\n• Organisation von Partys, Feiern oder Versammlungen mit mehr als 2 zusätzlichen nicht registrierten Gästen. Strafe: 200€.\n• Entfernung von Inventar (Handtücher, Bettwäsche, Küchengeräte) aus der Unterkunft. Strafe: Entschädigung zum Marktwert.\n• Jede Nutzung der Räumlichkeiten für illegale Aktivitäten (Drogen, Prostitution) wird der Polizei gemeldet und führt zur sofortigen Vertragsbeendigung.\n\n6. Schäden und Haftung\nJeder vorsätzliche oder fahrlässige Schaden an Inventar oder Eigentum wird zu den tatsächlichen Reparatur- oder Ersatzkosten berechnet. Die 50€ Kaution dient als Garantie und wird innerhalb von 24 Stunden nach Inspektion der Unterkunft zurückerstattet.',
      'changes.title': '7. Zusätzliche Verpflichtungen',
      'changes.content': 'Gäste sind verpflichtet: die Unterkunft ordentlich zu hinterlassen, Müll in ausgewiesenen Containern zu entsorgen, alle Geräte (Klimaanlage, Heizung, Lichter) bei Abreise auszuschalten. Für außergewöhnlich verschmutzte Räumlichkeiten wird eine zusätzliche Reinigung von 30€ berechnet. Schlüsselverlust führt zu einer Strafe von 50€.'
    }
  },
  it: {
    privacy: {
      title: 'Informativa sulla privacy',
      lastUpdated: 'Ultimo aggiornamento: Febbraio 2026',
      intro: 'Apartmani Jovča rispetta la tua privacy ed è impegnato a proteggere i tuoi dati personali. Questa politica spiega come raccogliamo, utilizziamo, conserviamo e proteggiamo le tue informazioni in conformità con le leggi della Repubblica di Serbia.',
      'dataCollection.title': '1. Quali dati raccogliamo',
      'dataCollection.content': 'Durante la prenotazione e il soggiorno nei nostri appartamenti, raccogliamo i seguenti dati:\n\nDati raccolti:\n• Dati personali: Nome completo, numero di telefono, indirizzo email\n• Dati di identificazione: Numero di carta d\'identità o passaporto (richiesto per legge per la registrazione degli ospiti)\n• Dati di prenotazione: Date di soggiorno, numero di ospiti, appartamento selezionato\n• Dati finanziari: Informazioni su pagamento e deposito\n• Comunicazione: Corrispondenza via email, WhatsApp o telefono',
      'dataUsage.title': '2. Come utilizziamo i tuoi dati',
      'dataUsage.content': 'Utilizziamo i tuoi dati personali esclusivamente per i seguenti scopi:\n• Elaborazione di prenotazioni e conferme di soggiorno\n• Registrazione degli ospiti presso le autorità (obbligo legale)\n• Comunicazione sul tuo soggiorno, istruzioni per l\'arrivo e servizi aggiuntivi\n• Elaborazione dei pagamenti e rimborso del deposito',
      'dataProtection.title': '3. Protezione dei dati',
      'dataProtection.content': 'Implementiamo misure rigorose per proteggere i tuoi dati personali:\n• I dati sono conservati su server sicuri con crittografia\n• Solo il personale autorizzato (proprietario e amministratori) ha accesso ai dati\n• Non condividiamo i tuoi dati con terze parti tranne quando richiesto per legge (polizia, ispezione turistica)',
      'userRights.title': '5. I tuoi diritti',
      'userRights.content': 'In conformità con le leggi sulla protezione dei dati, hai il diritto di:\n• Richiedere l\'accesso ai tuoi dati personali che conserviamo\n• Richiedere la correzione di dati inesatti\n• Richiedere la cancellazione dei dati dopo la scadenza del periodo di conservazione legale\n• Revocare il consenso per il trattamento dei dati (tranne quando richiesto per legge)',
      'cookies.title': '4. Cookie',
      'cookies.content': 'Il nostro sito web utilizza i cookie per:\n• Ricordare le tue preferenze linguistiche\n• Analisi del traffico del sito web (dati anonimi)\n• Miglioramento dell\'esperienza utente',
      'gdpr.title': '6. Periodo di conservazione dei dati',
      'gdpr.content': 'Conserviamo i tuoi dati in conformità con gli obblighi legali: i dati di registrazione degli ospiti sono conservati per 1 anno, i dati finanziari per 5 anni, e altri dati vengono cancellati 2 anni dopo il tuo ultimo soggiorno.',
      'contact.title': 'Contatto per la privacy',
      'contact.content': 'Per tutte le domande sulla protezione dei tuoi dati personali, puoi contattarci:\n\nEmail: apartmanijovca@gmail.com\nTelefono: +381 65 237 8080\nWhatsApp: +381 65 237 8080'
    },
    terms: {
      title: 'Termini di servizio e Regolamento interno',
      lastUpdated: 'Ultimo aggiornamento: Febbraio 2026',
      intro: 'Effettuando una prenotazione e soggiornando presso Apartmani Jovča, accetti i seguenti termini di servizio e regolamento interno. Si prega di leggere attentamente queste regole per garantire un soggiorno piacevole senza incomprensioni.',
      'booking.title': '1. Prenotazione e conferma',
      'booking.content': 'Processo di prenotazione e termini di conferma:\n• Una prenotazione è considerata valida solo dopo la nostra conferma scritta via email o WhatsApp\n• È richiesto un deposito di 50€ per confermare la prenotazione e verrà rimborsato dopo l\'ispezione della proprietà alla partenza\n• Il pagamento completo deve essere effettuato entro 7 giorni prima dell\'arrivo o all\'arrivo (contanti o bonifico bancario)\n• La prenotazione vincola entrambe le parti - ospite e proprietario - a rispettare i termini concordati',
      'payment.title': '2. Check-in e Check-out',
      'payment.content': 'Regole di check-in e check-out:\n• Check-in: dalle 14:00. Check-in anticipato possibile con preavviso e disponibilità (supplemento di 10€/ora)\n• Check-out: entro le 10:00. Check-out posticipato possibile con preavviso e disponibilità (supplemento di 10€/ora)\n• La registrazione degli ospiti è obbligatoria per legge - è richiesto un documento d\'identità valido (carta d\'identità o passaporto) per tutti gli ospiti',
      'cancellation.title': '3. Politica di cancellazione',
      'cancellation.content': 'Termini di cancellazione della prenotazione:\n\nRegole di cancellazione:\n• Cancellazione più di 14 giorni prima dell\'arrivo: rimborso del 100% dell\'importo pagato (tranne 30€ di deposito)\n• Cancellazione 7-14 giorni prima dell\'arrivo: rimborso del 50% dell\'importo pagato\n• Cancellazione meno di 7 giorni prima dell\'arrivo: nessun rimborso (addebito del 100%)',
      'houseRules.title': '4. Regolamento interno - Regole di base',
      'houseRules.content': 'Regole di comportamento nella proprietà per un soggiorno piacevole per tutti gli ospiti:\n• Orario di silenzio: 22:00 - 08:00. Musica ad alto volume, urla e rumori sono severamente vietati. La violazione può comportare la cessazione del soggiorno senza rimborso.\n• Numero massimo di ospiti: secondo la capacità dell\'appartamento. Ospiti aggiuntivi non sono ammessi senza preavviso e supplemento (20€/persona/notte).\n• È severamente vietato fumare all\'interno. Consentito solo sulla terrazza designata. Penale per fumare all\'interno: 100€.\n• Gli animali domestici sono ammessi con preavviso e un supplemento di 15€/giorno. Il proprietario è responsabile del comportamento e della pulizia.',
      'liability.title': '5. Divieti e sicurezza',
      'liability.content': 'Attività severamente vietate:\n• Organizzazione di feste, celebrazioni o riunioni con più di 2 ospiti aggiuntivi non registrati. Penale: 200€.\n• Rimozione di inventario (asciugamani, biancheria, elettrodomestici da cucina) dalla proprietà. Penale: compensazione al valore di mercato.\n• Qualsiasi uso dei locali per attività illegali (droga, prostituzione) sarà segnalato alla polizia e comporterà la cessazione immediata del contratto.\n\n6. Danni e responsabilità\nQualsiasi danno intenzionale o negligente all\'inventario o alla proprietà sarà addebitato al costo effettivo di riparazione o sostituzione. Il deposito di 50€ serve come garanzia e verrà rimborsato entro 24 ore dopo l\'ispezione della proprietà.',
      'changes.title': '7. Obblighi aggiuntivi',
      'changes.content': 'Gli ospiti sono tenuti a: lasciare la proprietà in ordine, smaltire i rifiuti nei contenitori designati, spegnere tutti i dispositivi (aria condizionata, riscaldamento, luci) alla partenza. Per locali eccezionalmente sporchi verrà addebitata una pulizia aggiuntiva di 30€. La perdita della chiave comporta una penale di 50€.'
    }
  }
}

async function populateLegalContent() {
  console.log('🚀 Populating German and Italian legal content...\n')

  let totalInserted = 0
  let totalErrors = 0

  for (const lang of ['de', 'it']) {
    console.log(`\n📝 Processing ${lang.toUpperCase()}...`)
    
    // Process privacy policy
    for (const [key, value] of Object.entries(legalContent[lang].privacy)) {
      const fullKey = `privacy.${key}`
      
      try {
        const { error } = await supabase
          .from('content')
          .upsert({
            key: fullKey,
            language: lang,
            value: value,
            published: true
          }, {
            onConflict: 'key,language'
          })

        if (error) throw error
        
        totalInserted++
        console.log(`  ✓ ${fullKey}`)
      } catch (error) {
        totalErrors++
        console.error(`  ✗ ${fullKey}:`, error.message)
      }
    }

    // Process terms of service
    for (const [key, value] of Object.entries(legalContent[lang].terms)) {
      const fullKey = `terms.${key}`
      
      try {
        const { error } = await supabase
          .from('content')
          .upsert({
            key: fullKey,
            language: lang,
            value: value,
            published: true
          }, {
            onConflict: 'key,language'
          })

        if (error) throw error
        
        totalInserted++
        console.log(`  ✓ ${fullKey}`)
      } catch (error) {
        totalErrors++
        console.error(`  ✗ ${fullKey}:`, error.message)
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
    console.log('\n✨ German and Italian legal content successfully populated!')
  }
}

populateLegalContent()
  .then(() => {
    console.log('\n✅ Script completed')
    process.exit(0)
  })
  .catch((error) => {
    console.error('\n❌ Script failed:', error)
    process.exit(1)
  })
