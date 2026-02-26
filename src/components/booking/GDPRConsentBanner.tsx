'use client'

import { useEffect } from 'react'
import { AlertCircle, Shield, Info } from 'lucide-react'
import { Button } from '../../app/[lang]/components/ui/button'

interface GDPRConsentBannerProps {
  onAccept: () => void
  onDecline: () => void
  locale?: string
}

const content = {
  sr: {
    title: 'Zaštita Vaših Podataka',
    description: 'Pre nego što nastavite sa rezervacijom, molimo Vas da pročitate i prihvatite sledeće:',
    dataCollection: 'Podaci koje prikupljamo:',
    dataItems: [
      'Vaše ime i prezime',
      'Email adresa',
      'Broj telefona',
      'IP adresa Vašeg uređaja',
      'Informacije o pregledaču i uređaju',
      'Datum i vreme zahteva'
    ],
    purpose: 'Svrha prikupljanja:',
    purposeItems: [
      'Obrada Vaše rezervacije',
      'Komunikacija u vezi sa boravkom',
      'Sprečavanje zloupotrebe i spam-a',
      'Poboljšanje kvaliteta usluge'
    ],
    retention: 'Čuvanje podataka:',
    retentionText: 'Vaše podatke čuvamo 3 godine od datuma rezervacije radi računovodstvenih i pravnih obaveza. Nakon isteka ovog perioda, podaci se automatski brišu.',
    security: 'Bezbednost:',
    securityText: 'Vaši podaci su zaštićeni i neće biti deljeni sa trećim licima. Koristimo napredne mere zaštite protiv spam-a i zloupotrebe.',
    rights: 'Vaša prava (GDPR):',
    rightsText: 'Imate pravo na pristup, ispravku i brisanje Vaših podataka. Zahtev za brisanje možete poslati na email: privacy@apartmani-jovca.com',
    rightsResponse: 'Odgovaramo na sve zahteve u roku od 30 dana.',
    accept: 'Prihvatam i nastavljam sa unosom',
    decline: 'Ne prihvatam - Vrati me na početnu',
    learnMore: 'Saznajte više u našoj',
    privacyPolicy: 'Politici privatnosti',
    warning: '⚠️ Bez prihvatanja ne možete nastaviti sa rezervacijom'
  },
  en: {
    title: 'Your Data Protection',
    description: 'Before proceeding with your booking, please read and accept the following:',
    dataCollection: 'Data we collect:',
    dataItems: [
      'Your full name',
      'Email address',
      'Phone number',
      'Your device IP address',
      'Browser and device information',
      'Request date and time'
    ],
    purpose: 'Purpose of collection:',
    purposeItems: [
      'Processing your reservation',
      'Communication regarding your stay',
      'Preventing abuse and spam',
      'Improving service quality'
    ],
    retention: 'Data retention:',
    retentionText: 'We retain your data for 3 years from the booking date for accounting and legal obligations. After this period, data is automatically deleted.',
    security: 'Security:',
    securityText: 'Your data is protected and will not be shared with third parties. We use advanced anti-spam and abuse protection measures.',
    rights: 'Your rights (GDPR):',
    rightsText: 'You have the right to access, correct, and delete your data. You can submit a deletion request via email: privacy@apartmani-jovca.com',
    rightsResponse: 'We respond to all requests within 30 days.',
    accept: 'I accept and continue',
    decline: 'I decline - Return to home',
    learnMore: 'Learn more in our',
    privacyPolicy: 'Privacy Policy',
    warning: '⚠️ You cannot proceed without accepting'
  },
  de: {
    title: 'Ihr Datenschutz',
    description: 'Bevor Sie mit Ihrer Buchung fortfahren, lesen und akzeptieren Sie bitte Folgendes:',
    dataCollection: 'Daten, die wir sammeln:',
    dataItems: [
      'Ihr vollständiger Name',
      'E-Mail-Adresse',
      'Telefonnummer',
      'IP-Adresse Ihres Geräts',
      'Browser- und Geräteinformationen',
      'Datum und Uhrzeit der Anfrage'
    ],
    purpose: 'Zweck der Erhebung:',
    purposeItems: [
      'Bearbeitung Ihrer Reservierung',
      'Kommunikation bezüglich Ihres Aufenthalts',
      'Verhinderung von Missbrauch und Spam',
      'Verbesserung der Servicequalität'
    ],
    retention: 'Datenspeicherung:',
    retentionText: 'Wir speichern Ihre Daten 3 Jahre ab Buchungsdatum für buchhalterische und rechtliche Verpflichtungen. Nach Ablauf dieser Frist werden die Daten automatisch gelöscht.',
    security: 'Sicherheit:',
    securityText: 'Ihre Daten sind geschützt und werden nicht an Dritte weitergegeben. Wir verwenden fortschrittliche Anti-Spam- und Missbrauchsschutzmaßnahmen.',
    rights: 'Ihre Rechte (DSGVO):',
    rightsText: 'Sie haben das Recht auf Zugang, Berichtigung und Löschung Ihrer Daten. Löschanträge können Sie per E-Mail senden an: privacy@apartmani-jovca.com',
    rightsResponse: 'Wir antworten auf alle Anfragen innerhalb von 30 Tagen.',
    accept: 'Ich akzeptiere und fahre fort',
    decline: 'Ich lehne ab - Zurück zur Startseite',
    learnMore: 'Erfahren Sie mehr in unserer',
    privacyPolicy: 'Datenschutzerklärung',
    warning: '⚠️ Ohne Zustimmung können Sie nicht fortfahren'
  },
  it: {
    title: 'Protezione dei Tuoi Dati',
    description: 'Prima di procedere con la prenotazione, leggi e accetta quanto segue:',
    dataCollection: 'Dati che raccogliamo:',
    dataItems: [
      'Il tuo nome completo',
      'Indirizzo email',
      'Numero di telefono',
      'Indirizzo IP del tuo dispositivo',
      'Informazioni su browser e dispositivo',
      'Data e ora della richiesta'
    ],
    purpose: 'Scopo della raccolta:',
    purposeItems: [
      'Elaborazione della tua prenotazione',
      'Comunicazione riguardo al tuo soggiorno',
      'Prevenzione di abusi e spam',
      'Miglioramento della qualità del servizio'
    ],
    retention: 'Conservazione dei dati:',
    retentionText: 'Conserviamo i tuoi dati per 3 anni dalla data di prenotazione per obblighi contabili e legali. Dopo questo periodo, i dati vengono automaticamente cancellati.',
    security: 'Sicurezza:',
    securityText: 'I tuoi dati sono protetti e non saranno condivisi con terze parti. Utilizziamo misure avanzate di protezione anti-spam e anti-abuso.',
    rights: 'I tuoi diritti (GDPR):',
    rightsText: 'Hai il diritto di accedere, correggere ed eliminare i tuoi dati. Puoi inviare una richiesta di cancellazione via email: privacy@apartmani-jovca.com',
    rightsResponse: 'Rispondiamo a tutte le richieste entro 30 giorni.',
    accept: 'Accetto e continuo',
    decline: 'Rifiuto - Torna alla home',
    learnMore: 'Scopri di più nella nostra',
    privacyPolicy: 'Informativa sulla privacy',
    warning: '⚠️ Non puoi procedere senza accettare'
  }
}

export default function GDPRConsentBanner({ onAccept, onDecline, locale = 'sr' }: GDPRConsentBannerProps) {
  const t = content[locale as keyof typeof content] || content.sr

  // Block body scroll when modal is open
  useEffect(() => {
    // Save original overflow style
    const originalOverflow = document.body.style.overflow
    
    // Block scroll
    document.body.style.overflow = 'hidden'
    
    // Restore scroll on unmount
    return () => {
      document.body.style.overflow = originalOverflow
    }
  }, [])

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-6 text-white">
          <div className="flex items-center gap-3">
            <Shield className="h-8 w-8" />
            <h2 className="text-2xl font-bold">{t.title}</h2>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Warning Banner */}
          <div className="bg-amber-50 border-l-4 border-amber-500 p-4 rounded">
            <div className="flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-amber-600 mt-0.5 flex-shrink-0" />
              <p className="text-sm text-amber-900">{t.description}</p>
            </div>
          </div>

          {/* Data Collection */}
          <div>
            <h3 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
              <Info className="h-5 w-5 text-blue-600" />
              {t.dataCollection}
            </h3>
            <ul className="list-disc list-inside space-y-1 text-sm text-gray-700 ml-7">
              {t.dataItems.map((item, i) => (
                <li key={i}>{item}</li>
              ))}
            </ul>
          </div>

          {/* Purpose */}
          <div>
            <h3 className="font-semibold text-gray-900 mb-2">{t.purpose}</h3>
            <ul className="list-disc list-inside space-y-1 text-sm text-gray-700 ml-7">
              {t.purposeItems.map((item, i) => (
                <li key={i}>{item}</li>
              ))}
            </ul>
          </div>

          {/* Data Retention */}
          <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg">
            <h3 className="font-semibold text-blue-900 mb-2">{t.retention}</h3>
            <p className="text-sm text-blue-800">{t.retentionText}</p>
          </div>

          {/* Security */}
          <div className="bg-green-50 border border-green-200 p-4 rounded-lg">
            <h3 className="font-semibold text-green-900 mb-2">{t.security}</h3>
            <p className="text-sm text-green-800">{t.securityText}</p>
          </div>

          {/* Rights */}
          <div className="bg-purple-50 border border-purple-200 p-4 rounded-lg">
            <h3 className="font-semibold text-purple-900 mb-2">{t.rights}</h3>
            <p className="text-sm text-purple-800 mb-2">{t.rightsText}</p>
            <p className="text-sm text-purple-700 font-medium">{t.rightsResponse}</p>
          </div>

          {/* Privacy Policy Link */}
          <div className="text-sm text-gray-600">
            {t.learnMore}{' '}
            <a href={`/${locale}/privacy`} target="_blank" className="text-blue-600 hover:underline font-medium">
              {t.privacyPolicy}
            </a>
          </div>

          {/* Warning */}
          <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded">
            <p className="text-sm font-semibold text-red-900">{t.warning}</p>
          </div>
        </div>

        {/* Actions */}
        <div className="bg-gray-50 p-6 flex flex-col sm:flex-row gap-3 justify-end border-t">
          <Button
            variant="outline"
            onClick={onDecline}
            className="px-6 border-red-300 text-red-700 hover:bg-red-50"
          >
            {t.decline}
          </Button>
          <Button
            onClick={onAccept}
            className="px-6 bg-green-600 hover:bg-green-700"
          >
            {t.accept}
          </Button>
        </div>
      </div>
    </div>
  )
}
