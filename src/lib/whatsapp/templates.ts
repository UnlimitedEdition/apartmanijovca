// WhatsApp Templates for Apartmani Jovca
// Pre-defined message templates with multi-language support

import type { 
  WhatsAppLanguage, 
  WhatsAppTemplateMessage,
  // WhatsAppTemplateComponent,
} from './types'

// WhatsApp template strings for localization
export interface WhatsAppTemplateStrings {
  bookingConfirmationTitle: string
  bookingConfirmationBody: string
  bookingConfirmationDetails: string
  bookingConfirmationFooter: string
  
  bookingCancelledTitle: string
  bookingCancelledBody: string
  bookingCancelledDetails: string
  
  bookingReminderTitle: string
  bookingReminderBody: string
  bookingReminderDetails: string
  
  checkInInstructionsTitle: string
  checkInInstructionsBody: string
  checkInInstructionsDetails: string
  
  checkOutReminderTitle: string
  checkOutReminderBody: string
  checkOutReminderDetails: string
  
  reviewRequestTitle: string
  reviewRequestBody: string
  reviewRequestDetails: string
  
  paymentReceivedTitle: string
  paymentReceivedBody: string
  paymentReceivedDetails: string
  
  paymentReminderTitle: string
  paymentReminderBody: string
  paymentReminderDetails: string
}

// Template variables interface
export interface TemplateVariables {
  guestName?: string
  apartmentName?: string
  checkInDate?: string
  checkOutDate?: string
  bookingNumber?: string
  totalPrice?: string
  amount?: string
  amountDue?: string
  dueDate?: string
  daysUntilArrival?: string
  checkInTime?: string
  checkOutTime?: string
  address?: string
  contactPhone?: string
  wifiPassword?: string
  reason?: string
  reviewUrl?: string
}

// WhatsApp language codes for templates
const WHATSAPP_LANG_CODES: Record<WhatsAppLanguage, string> = {
  sr: 'sr',
  en: 'en',
  de: 'de',
  it: 'it',
}

// Template names (must be registered in WhatsApp Business Manager)
export const TEMPLATE_NAMES = {
  booking_confirmation: 'booking_confirmation',
  booking_cancelled: 'booking_cancelled',
  booking_reminder: 'booking_reminder',
  check_in_instructions: 'check_in_instructions',
  check_out_reminder: 'check_out_reminder',
  review_request: 'review_request',
  payment_received: 'payment_received',
  payment_reminder: 'payment_reminder',
  welcome_message: 'welcome_message',
} as const

// Language-specific strings for templates
const templateStrings: Record<WhatsAppLanguage, WhatsAppTemplateStrings> = {
  sr: {
    bookingConfirmationTitle: 'Rezervacija potvrđena!',
    bookingConfirmationBody: 'Poštovani {{1}}, Vaša rezervacija je potvrđena!',
    bookingConfirmationDetails: 'Apartman: {{1}}\nPrijava: {{2}}\nOdjava: {{3}}\nBroj rezervacije: {{4}}\nUkupna cena: {{5}}',
    bookingConfirmationFooter: 'Radujemo se Vašem dolasku!',
    
    bookingCancelledTitle: 'Rezervacija otkazana',
    bookingCancelledBody: 'Poštovani {{1}}, Vaša rezervacija je otkazana.',
    bookingCancelledDetails: 'Broj rezervacije: {{1}}\nApartman: {{2}}\n{{3}}',
    
    bookingReminderTitle: 'Podsetnik za dolazak',
    bookingReminderBody: 'Poštovani {{1}}, dolazak je za {{2}} dana!',
    bookingReminderDetails: 'Apartman: {{1}}\nDatum prijave: {{2}}',
    
    checkInInstructionsTitle: 'Uputstva za prijavu',
    checkInInstructionsBody: 'Poštovani {{1}}, evo informacija za Vaš dolazak:',
    checkInInstructionsDetails: 'Apartman: {{1}}\nDatum prijave: {{2}}\nVreme prijave: {{3}}\nAdresa: {{4}}\nKontakt: {{5}}',
    
    checkOutReminderTitle: 'Podsetnik za odjavu',
    checkOutReminderBody: 'Poštovani {{1}}, želimo Vam srećan put!',
    checkOutReminderDetails: 'Apartman: {{1}}\nDatum odjave: {{2}}\nVreme odjave: {{3}}',
    
    reviewRequestTitle: 'Kako je bilo?',
    reviewRequestBody: 'Poštovani {{1}}, nadamo se da ste uživali u boravku!',
    reviewRequestDetails: 'Ostavite utisak: {{1}}',
    
    paymentReceivedTitle: 'Uplata primljena!',
    paymentReceivedBody: 'Poštovani {{1}}, primili smo Vašu uplatu.',
    paymentReceivedDetails: 'Iznos: {{1}}\nBroj rezervacije: {{2}}',
    
    paymentReminderTitle: 'Podsetnik za uplatu',
    paymentReminderBody: 'Poštovani {{1}}, podsećamo Vas na neplaćenu rezervaciju.',
    paymentReminderDetails: 'Broj rezervacije: {{1}}\nIznos: {{2}}\nRok za uplatu: {{3}}',
  },
  en: {
    bookingConfirmationTitle: 'Booking Confirmed!',
    bookingConfirmationBody: 'Dear {{1}}, Your booking has been confirmed!',
    bookingConfirmationDetails: 'Apartment: {{1}}\nCheck-in: {{2}}\nCheck-out: {{3}}\nBooking #: {{4}}\nTotal: {{5}}',
    bookingConfirmationFooter: 'We look forward to welcoming you!',
    
    bookingCancelledTitle: 'Booking Cancelled',
    bookingCancelledBody: 'Dear {{1}}, Your booking has been cancelled.',
    bookingCancelledDetails: 'Booking #: {{1}}\nApartment: {{2}}\n{{3}}',
    
    bookingReminderTitle: 'Arrival Reminder',
    bookingReminderBody: 'Dear {{1}}, Your arrival is in {{2}} days!',
    bookingReminderDetails: 'Apartment: {{1}}\nCheck-in date: {{2}}',
    
    checkInInstructionsTitle: 'Check-In Instructions',
    checkInInstructionsBody: 'Dear {{1}}, here is your arrival information:',
    checkInInstructionsDetails: 'Apartment: {{1}}\nCheck-in: {{2}}\nCheck-in time: {{3}}\nAddress: {{4}}\nContact: {{5}}',
    
    checkOutReminderTitle: 'Check-Out Reminder',
    checkOutReminderBody: 'Dear {{1}}, we hope you had a wonderful stay!',
    checkOutReminderDetails: 'Apartment: {{1}}\nCheck-out: {{2}}\nCheck-out time: {{3}}',
    
    reviewRequestTitle: 'How was your stay?',
    reviewRequestBody: 'Dear {{1}}, we hope you enjoyed your stay!',
    reviewRequestDetails: 'Leave a review: {{1}}',
    
    paymentReceivedTitle: 'Payment Received!',
    paymentReceivedBody: 'Dear {{1}}, we have received your payment.',
    paymentReceivedDetails: 'Amount: {{1}}\nBooking #: {{2}}',
    
    paymentReminderTitle: 'Payment Reminder',
    paymentReminderBody: 'Dear {{1}}, this is a reminder about your outstanding booking.',
    paymentReminderDetails: 'Booking #: {{1}}\nAmount due: {{2}}\nDue date: {{3}}',
  },
  de: {
    bookingConfirmationTitle: 'Buchung bestätigt!',
    bookingConfirmationBody: 'Sehr geehrte/r {{1}}, Ihre Buchung wurde bestätigt!',
    bookingConfirmationDetails: 'Wohnung: {{1}}\nAnreise: {{2}}\nAbreise: {{3}}\nBuchungsnr.: {{4}}\nGesamt: {{5}}',
    bookingConfirmationFooter: 'Wir freuen uns auf Sie!',
    
    bookingCancelledTitle: 'Buchung storniert',
    bookingCancelledBody: 'Sehr geehrte/r {{1}}, Ihre Buchung wurde storniert.',
    bookingCancelledDetails: 'Buchungsnr.: {{1}}\nWohnung: {{2}}\n{{3}}',
    
    bookingReminderTitle: 'Anreise-Erinnerung',
    bookingReminderBody: 'Sehr geehrte/r {{1}}, Ihre Anreise ist in {{2}} Tagen!',
    bookingReminderDetails: 'Wohnung: {{1}}\nAnreisedatum: {{2}}',
    
    checkInInstructionsTitle: 'Anreiseinformationen',
    checkInInstructionsBody: 'Sehr geehrte/r {{1}}, hier sind Ihre Ankunftsinformationen:',
    checkInInstructionsDetails: 'Wohnung: {{1}}\nAnreise: {{2}}\nAnreisezeit: {{3}}\nAdresse: {{4}}\nKontakt: {{5}}',
    
    checkOutReminderTitle: 'Abreise-Erinnerung',
    checkOutReminderBody: 'Sehr geehrte/r {{1}}, wir hoffen, Sie hatten einen tollen Aufenthalt!',
    checkOutReminderDetails: 'Wohnung: {{1}}\nAbreise: {{2}}\nAbreisezeit: {{3}}',
    
    reviewRequestTitle: 'Wie war Ihr Aufenthalt?',
    reviewRequestBody: 'Sehr geehrte/r {{1}}, wir hoffen, Ihnen hat der Aufenthalt gefallen!',
    reviewRequestDetails: 'Bewertung abgeben: {{1}}',
    
    paymentReceivedTitle: 'Zahlung eingegangen!',
    paymentReceivedBody: 'Sehr geehrte/r {{1}}, wir haben Ihre Zahlung erhalten.',
    paymentReceivedDetails: 'Betrag: {{1}}\nBuchungsnr.: {{2}}',
    
    paymentReminderTitle: 'Zahlungserinnerung',
    paymentReminderBody: 'Sehr geehrte/r {{1}}, wir erinnern Sie an Ihre ausstehende Buchung.',
    paymentReminderDetails: 'Buchungsnr.: {{1}}\nFälliger Betrag: {{2}}\nFälligkeitsdatum: {{3}}',
  },
  it: {
    bookingConfirmationTitle: 'Prenotazione confermata!',
    bookingConfirmationBody: 'Gentile {{1}}, la Sua prenotazione è stata confermata!',
    bookingConfirmationDetails: 'Appartamento: {{1}}\nCheck-in: {{2}}\nCheck-out: {{3}}\nN. prenotazione: {{4}}\nTotale: {{5}}',
    bookingConfirmationFooter: 'Non vediamo l\'ora di accoglierLa!',
    
    bookingCancelledTitle: 'Prenotazione annullata',
    bookingCancelledBody: 'Gentile {{1}}, la Sua prenotazione è stata annullata.',
    bookingCancelledDetails: 'N. prenotazione: {{1}}\nAppartamento: {{2}}\n{{3}}',
    
    bookingReminderTitle: 'Promemoria arrivo',
    bookingReminderBody: 'Gentile {{1}}, il Suo arrivo è tra {{2}} giorni!',
    bookingReminderDetails: 'Appartamento: {{1}}\nData check-in: {{2}}',
    
    checkInInstructionsTitle: 'Istruzioni check-in',
    checkInInstructionsBody: 'Gentile {{1}}, ecco le informazioni per il Suo arrivo:',
    checkInInstructionsDetails: 'Appartamento: {{1}}\nCheck-in: {{2}}\nOrario check-in: {{3}}\nIndirizzo: {{4}}\nContatto: {{5}}',
    
    checkOutReminderTitle: 'Promemoria check-out',
    checkOutReminderBody: 'Gentile {{1}}, speriamo che il Suo soggiorno sia stato piacevole!',
    checkOutReminderDetails: 'Appartamento: {{1}}\nCheck-out: {{2}}\nOrario check-out: {{3}}',
    
    reviewRequestTitle: 'Come è andato il soggiorno?',
    reviewRequestBody: 'Gentile {{1}}, speriamo che il Suo soggiorno sia stato piacevole!',
    reviewRequestDetails: 'Lascia una recensione: {{1}}',
    
    paymentReceivedTitle: 'Pagamento ricevuto!',
    paymentReceivedBody: 'Gentile {{1}}, abbiamo ricevuto il Suo pagamento.',
    paymentReceivedDetails: 'Importo: {{1}}\nN. prenotazione: {{2}}',
    
    paymentReminderTitle: 'Promemoria pagamento',
    paymentReminderBody: 'Gentile {{1}}, La ricordiamo della Sua prenotazione in sospeso.',
    paymentReminderDetails: 'N. prenotazione: {{1}}\nImporto dovuto: {{2}}\nData di scadenza: {{3}}',
  },
}

// Get template strings for a specific language
export function getTemplateStrings(lang: WhatsAppLanguage): WhatsAppTemplateStrings {
  return templateStrings[lang] || templateStrings.en
}

// Get WhatsApp language code
export function getWhatsAppLangCode(lang: WhatsAppLanguage): string {
  return WHATSAPP_LANG_CODES[lang] || 'en'
}

// Create template message with variables
export function getTemplateMessage(
  templateType: keyof typeof TEMPLATE_NAMES,
  language: WhatsAppLanguage,
  variables: TemplateVariables
): WhatsAppTemplateMessage {
  const langCode = getWhatsAppLangCode(language)

  switch (templateType) {
    case 'booking_confirmation':
      return {
        name: TEMPLATE_NAMES.booking_confirmation,
        language: { code: langCode },
        components: [
          {
            type: 'body',
            parameters: [
              { type: 'text', text: variables.guestName || '' },
              { type: 'text', text: variables.apartmentName || '' },
              { type: 'text', text: variables.checkInDate || '' },
              { type: 'text', text: variables.checkOutDate || '' },
              { type: 'text', text: variables.bookingNumber || '' },
              { type: 'text', text: variables.totalPrice || '' },
            ],
          },
        ],
      }

    case 'booking_cancelled':
      return {
        name: TEMPLATE_NAMES.booking_cancelled,
        language: { code: langCode },
        components: [
          {
            type: 'body',
            parameters: [
              { type: 'text', text: variables.guestName || '' },
              { type: 'text', text: variables.bookingNumber || '' },
              { type: 'text', text: variables.apartmentName || '' },
              { type: 'text', text: variables.reason || '' },
            ],
          },
        ],
      }

    case 'booking_reminder':
      return {
        name: TEMPLATE_NAMES.booking_reminder,
        language: { code: langCode },
        components: [
          {
            type: 'body',
            parameters: [
              { type: 'text', text: variables.guestName || '' },
              { type: 'text', text: variables.daysUntilArrival || '' },
              { type: 'text', text: variables.apartmentName || '' },
              { type: 'text', text: variables.checkInDate || '' },
            ],
          },
        ],
      }

    case 'check_in_instructions':
      return {
        name: TEMPLATE_NAMES.check_in_instructions,
        language: { code: langCode },
        components: [
          {
            type: 'body',
            parameters: [
              { type: 'text', text: variables.guestName || '' },
              { type: 'text', text: variables.apartmentName || '' },
              { type: 'text', text: variables.checkInDate || '' },
              { type: 'text', text: variables.checkInTime || '' },
              { type: 'text', text: variables.address || '' },
              { type: 'text', text: variables.contactPhone || '' },
            ],
          },
        ],
      }

    case 'check_out_reminder':
      return {
        name: TEMPLATE_NAMES.check_out_reminder,
        language: { code: langCode },
        components: [
          {
            type: 'body',
            parameters: [
              { type: 'text', text: variables.guestName || '' },
              { type: 'text', text: variables.apartmentName || '' },
              { type: 'text', text: variables.checkOutDate || '' },
              { type: 'text', text: variables.checkOutTime || '' },
            ],
          },
        ],
      }

    case 'review_request':
      return {
        name: TEMPLATE_NAMES.review_request,
        language: { code: langCode },
        components: [
          {
            type: 'body',
            parameters: [
              { type: 'text', text: variables.guestName || '' },
              { type: 'text', text: variables.apartmentName || '' },
              { type: 'text', text: variables.reviewUrl || '' },
            ],
          },
        ],
      }

    case 'payment_received':
      return {
        name: TEMPLATE_NAMES.payment_received,
        language: { code: langCode },
        components: [
          {
            type: 'body',
            parameters: [
              { type: 'text', text: variables.guestName || '' },
              { type: 'text', text: variables.amount || '' },
              { type: 'text', text: variables.bookingNumber || '' },
            ],
          },
        ],
      }

    case 'payment_reminder':
      return {
        name: TEMPLATE_NAMES.payment_reminder,
        language: { code: langCode },
        components: [
          {
            type: 'body',
            parameters: [
              { type: 'text', text: variables.guestName || '' },
              { type: 'text', text: variables.bookingNumber || '' },
              { type: 'text', text: variables.amountDue || '' },
              { type: 'text', text: variables.dueDate || '' },
            ],
          },
        ],
      }

    default:
      // Fallback to a simple text template
      return {
        name: TEMPLATE_NAMES.welcome_message,
        language: { code: langCode },
        components: [
          {
            type: 'body',
            parameters: [
              { type: 'text', text: variables.guestName || 'Guest' },
            ],
          },
        ],
      }
  }
}

// Get template variables from booking data
export function getTemplateVariables(
  type: keyof typeof TEMPLATE_NAMES,
  variables: TemplateVariables
): Record<string, string> {
  return { ...variables }
}

// Helper function to replace template variables in plain text
export function replaceTemplateVariables(
  template: string,
  variables: Record<string, string>
): string {
  let result = template
  Object.entries(variables).forEach(([, value], index) => {
    result = result.replace(new RegExp(`{{${index + 1}}}`, 'g'), value)
  })
  return result
}

// Get all available template names
export function getAvailableTemplates(): string[] {
  return Object.values(TEMPLATE_NAMES)
}
