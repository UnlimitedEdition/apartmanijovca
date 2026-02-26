// Email Templates Helper for Apartmani Jovca
// Renders React Email templates and generates HTML/text versions

import type { ReactElement } from 'react'
import type { EmailLanguage, EmailContent } from './types'
import { formatDateForEmail, getApartmentName } from '../resend'

// Import React Email templates
import BookingConfirmationEmail from '@/emails/BookingConfirmationEmail'
import BookingRequestEmail from '@/emails/BookingRequestEmail'
import CheckInInstructionsEmail from '@/emails/CheckInInstructionsEmail'
import PreArrivalReminderEmail from '@/emails/PreArrivalReminderEmail'
import ReviewRequestEmail from '@/emails/ReviewRequestEmail'

// Dynamic import for @react-email/render to avoid SSR issues
async function renderEmail(emailComponent: ReactElement): Promise<string> {
  const { render } = await import('@react-email/render')
  return render(emailComponent)
}

// Language-specific email strings
const emailStrings: Record<EmailLanguage, {
  bookingConfirmed: string
  newBookingRequest: string
  checkInInstructions: string
  preArrivalReminder: string
  reviewRequest: string
  greeting: string
  bookingDetails: string
  bookingNumber: string
  apartment: string
  checkIn: string
  checkOut: string
  totalPrice: string
  guestInformation: string
  name: string
  email: string
  phone: string
  specialRequests: string
  numberOfGuests: string
  closing: string
  contact: string
  checkInTime: string
  checkOutTime: string
  bringValidId: string
  contactUponArrival: string
  wifiCode: string
  safeTravels: string
  whatToPrepare: string
  validIdForCheckIn: string
  specialRequestsRequirements: string
  transportationArrangements: string
  cantWaitToWelcome: string
  howWasYourStay: string
  enjoyedStay: string
  feedbackHelps: string
  leaveReview: string
  thankYouForChoosing: string
  daysUntilArrival: string
  reviewButton: string
}> = {
  sr: {
    bookingConfirmed: 'Rezervacija potvrđena!',
    newBookingRequest: 'Novi zahtev za rezervaciju',
    checkInInstructions: 'Uputstva za prijavu',
    preArrivalReminder: 'Podsetnik pre dolaska',
    reviewRequest: 'Kako je bilo tokom boravka?',
    greeting: 'Poštovani',
    bookingDetails: 'Detalji rezervacije',
    bookingNumber: 'Broj rezervacije',
    apartment: 'Apartman',
    checkIn: 'Prijava',
    checkOut: 'Odjava',
    totalPrice: 'Ukupna cena',
    guestInformation: 'Informacije o gostu',
    name: 'Ime',
    email: 'Email',
    phone: 'Telefon',
    specialRequests: 'Posebni zahtevi',
    numberOfGuests: 'Broj gostiju',
    closing: 'Srdačan pozdrav',
    contact: 'Kontakt',
    checkInTime: 'Vreme za prijavu: 14:00 - 20:00',
    checkOutTime: 'Vreme za odjavu: 10:00',
    bringValidId: 'Ponesite važeću ličnu kartu/pasoš',
    contactUponArrival: 'Kontaktirajte nas po dolasku na +381 65 237 8080',
    wifiCode: 'WiFi lozinka će biti data pri prijavi',
    safeTravels: 'Srećan put! Radujemo se vašem dolasku.',
    whatToPrepare: 'Šta pripremiti',
    validIdForCheckIn: 'Važeća lična dokumenta za prijavu',
    specialRequestsRequirements: 'Posebni zahtevi ili potrebe',
    transportationArrangements: 'Prevoz do smeštaja',
    cantWaitToWelcome: 'Jedva čekamo da vas ugostimo!',
    howWasYourStay: 'Kako je bilo tokom boravka?',
    enjoyedStay: 'Dragi {name}, nadamo se da ste uživali u boravku u Apartmanima Jovča!',
    feedbackHelps: 'Vaš nam pomaže da poboljšamo usluge i pomaže drugim putnicima da pronađu savršen smeštaj.',
    leaveReview: 'Ostavite utisak',
    thankYouForChoosing: 'Hvala što ste izabrali Apartmane Jovča.',
    daysUntilArrival: 'Do vašeg dolaska je ostalo {days} dana',
    reviewButton: 'Ostavite utisak',
  },
  en: {
    bookingConfirmed: 'Booking Confirmed!',
    newBookingRequest: 'New Booking Request',
    checkInInstructions: 'Check-In Instructions',
    preArrivalReminder: 'Pre-Arrival Reminder',
    reviewRequest: 'How Was Your Stay?',
    greeting: 'Dear',
    bookingDetails: 'Booking Details',
    bookingNumber: 'Booking Number',
    apartment: 'Apartment',
    checkIn: 'Check-in',
    checkOut: 'Check-out',
    totalPrice: 'Total Price',
    guestInformation: 'Guest Information',
    name: 'Name',
    email: 'Email',
    phone: 'Phone',
    specialRequests: 'Special Requests',
    numberOfGuests: 'Number of Guests',
    closing: 'Best regards',
    contact: 'Contact',
    checkInTime: 'Check-in time: 14:00 - 20:00',
    checkOutTime: 'Check-out time: 10:00',
    bringValidId: 'Please bring valid ID',
    contactUponArrival: 'Contact us at +381 65 237 8080 upon arrival',
    wifiCode: 'WiFi code will be provided at check-in',
    safeTravels: 'Safe travels! We look forward to your arrival.',
    whatToPrepare: 'What to Prepare',
    validIdForCheckIn: 'Valid ID for check-in',
    specialRequestsRequirements: 'Any special requests or requirements',
    transportationArrangements: 'Transportation arrangements',
    cantWaitToWelcome: "We can't wait to welcome you!",
    howWasYourStay: 'How Was Your Stay?',
    enjoyedStay: 'Dear {name}, we hope you enjoyed your stay at Apartmani Jovča!',
    feedbackHelps: 'Your feedback helps us improve and helps other travelers find the perfect accommodation.',
    leaveReview: 'Leave a Review',
    thankYouForChoosing: 'Thank you for choosing Apartmani Jovča.',
    daysUntilArrival: 'Your arrival is in {days} days',
    reviewButton: 'Leave a Review',
  },
  de: {
    bookingConfirmed: 'Buchung bestätigt!',
    newBookingRequest: 'Neue Buchungsanfrage',
    checkInInstructions: 'Anreiseinformationen',
    preArrivalReminder: 'Anreise-Erinnerung',
    reviewRequest: 'Wie war Ihr Aufenthalt?',
    greeting: 'Sehr geehrte(r)',
    bookingDetails: 'Buchungsdetails',
    bookingNumber: 'Buchungsnummer',
    apartment: 'Wohnung',
    checkIn: 'Anreise',
    checkOut: 'Abreise',
    totalPrice: 'Gesamtpreis',
    guestInformation: 'Gastinformationen',
    name: 'Name',
    email: 'E-Mail',
    phone: 'Telefon',
    specialRequests: 'Besondere Wünsche',
    numberOfGuests: 'Anzahl der Gäste',
    closing: 'Mit freundlichen Grüßen',
    contact: 'Kontakt',
    checkInTime: 'Anreisezeit: 14:00 - 20:00',
    checkOutTime: 'Abreisezeit: 10:00',
    bringValidId: 'Bitte bringen Sie einen gültigen Ausweis mit',
    contactUponArrival: 'Kontaktieren Sie uns bei Ankunft unter +381 65 237 8080',
    wifiCode: 'WLAN-Code wird bei der Anreise bereitgestellt',
    safeTravels: 'Gute Reise! Wir freuen uns auf Ihre Ankunft.',
    whatToPrepare: 'Was vorzubereiten ist',
    validIdForCheckIn: 'Gültiger Ausweis für Check-in',
    specialRequestsRequirements: 'Besondere Wünsche oder Anforderungen',
    transportationArrangements: 'Transport安排',
    cantWaitToWelcome: 'Wir freuen uns darauf, Sie begrüßen zu dürfen!',
    howWasYourStay: 'Wie war Ihr Aufenthalt?',
    enjoyedStay: 'Sehr geehrte(r) {name}, wir hoffen, Sie hatten einen tollen Aufenthalt bei Apartmani Jovča!',
    feedbackHelps: 'Ihr Feedback hilft uns, uns zu verbessern, und hilft anderen Reisenden, die perfekte Unterkunft zu finden.',
    leaveReview: 'Bewertung hinterlassen',
    thankYouForChoosing: 'Vielen Dank, dass Sie sich für Apartmani Jovča entschieden haben.',
    daysUntilArrival: 'Ihre Ankunft ist in {days} Tagen',
    reviewButton: 'Bewertung hinterlassen',
  },
  it: {
    bookingConfirmed: 'Prenotazione confermata!',
    newBookingRequest: 'Nuova richiesta di prenotazione',
    checkInInstructions: 'Istruzioni per il check-in',
    preArrivalReminder: 'Promemoria pre-arrivo',
    reviewRequest: 'Come è andato il soggiorno?',
    greeting: 'Gentile',
    bookingDetails: 'Dettagli della prenotazione',
    bookingNumber: 'Numero di prenotazione',
    apartment: 'Appartamento',
    checkIn: 'Check-in',
    checkOut: 'Check-out',
    totalPrice: 'Prezzo totale',
    guestInformation: 'Informazioni sull\'ospite',
    name: 'Nome',
    email: 'Email',
    phone: 'Telefono',
    specialRequests: 'Richieste speciali',
    numberOfGuests: 'Numero di ospiti',
    closing: 'Cordiali saluti',
    contact: 'Contatto',
    checkInTime: 'Orario check-in: 14:00 - 20:00',
    checkOutTime: 'Orario check-out: 10:00',
    bringValidId: 'Si prega di portare un documento d\'identità valido',
    contactUponArrival: 'Contattateci al +381 65 237 8080 all\'arrivo',
    wifiCode: 'Il codice WiFi verrà fornito al check-in',
    safeTravels: 'Buon viaggio! Non vediamo l\'ora di accogliervi.',
    whatToPrepare: 'Cosa preparare',
    validIdForCheckIn: 'Documento d\'identità valido per il check-in',
    specialRequestsRequirements: 'Eventuali richieste o esigenze speciali',
    transportationArrangements: 'Accordi per il trasporto',
    cantWaitToWelcome: 'Non vediamo l\'ora di darvi il benvenuto!',
    howWasYourStay: 'Come è andato il soggiorno?',
    enjoyedStay: 'Gentile {name}, speriamo che il vostro soggiorno presso Apartmani Jovča sia stato piacevole!',
    feedbackHelps: 'Il vostro feedback ci aiuta a migliorare e aiuta altri viaggiatori a trovare l\'alloggio perfetto.',
    leaveReview: 'Lascia una recensione',
    thankYouForChoosing: 'Grazie per aver scelto Apartmani Jovča.',
    daysUntilArrival: 'Il vostro arrivo è tra {days} giorni',
    reviewButton: 'Lascia una recensione',
  },
}

// Get email strings for a specific language
export function getEmailStrings(lang: EmailLanguage) {
  return emailStrings[lang] || emailStrings.en
}

// Render booking confirmation email
export async function renderBookingConfirmationEmail(props: {
  booking: {
    bookingNumber: string
    checkIn: string
    checkOut: string
    totalPrice: number
    apartment: { name: string; nameSr?: string; nameDe?: string; nameIt?: string }
  }
  guest: { full_name: string }
  language: EmailLanguage
}): Promise<EmailContent> {
  const { booking, guest, language } = props
  const strings = getEmailStrings(language)
  
  const apartmentName = getApartmentName(booking.apartment, language)
  const formattedCheckIn = formatDateForEmail(booking.checkIn, language)
  const formattedCheckOut = formatDateForEmail(booking.checkOut, language)
  
  const emailComponent = BookingConfirmationEmail({
    booking: {
      ...booking,
      apartment: { name: apartmentName },
      checkIn: formattedCheckIn,
      checkOut: formattedCheckOut,
    },
    guest,
  })
  
  const html = await renderEmail(emailComponent as ReactElement)
  const text = generatePlainTextFromHtml(html)
  
  return {
    subject: `${strings.bookingConfirmed} - ${booking.bookingNumber}`,
    html,
    text,
  }
}

// Render booking request email (admin notification)
export async function renderBookingRequestEmail(props: {
  booking: {
    bookingNumber: string
    checkIn: string
    checkOut: string
    totalPrice: number
    apartment: { name: string; nameSr?: string; nameDe?: string; nameIt?: string }
  }
  guest: { full_name: string; email: string; phone: string }
  language: EmailLanguage
}): Promise<EmailContent> {
  const { booking, guest, language } = props
  const strings = getEmailStrings(language)
  
  const apartmentName = getApartmentName(booking.apartment, language)
  const formattedCheckIn = formatDateForEmail(booking.checkIn, language)
  const formattedCheckOut = formatDateForEmail(booking.checkOut, language)
  
  const emailComponent = BookingRequestEmail({
    booking: {
      ...booking,
      apartment: { name: apartmentName },
      checkIn: formattedCheckIn,
      checkOut: formattedCheckOut,
    },
    guest,
  })
  
  const html = await renderEmail(emailComponent as ReactElement)
  const text = generatePlainTextFromHtml(html)
  
  return {
    subject: `${strings.newBookingRequest} - ${booking.bookingNumber}`,
    html,
    text,
  }
}

// Render check-in instructions email
export async function renderCheckInInstructionsEmail(props: {
  booking: {
    bookingNumber: string
    checkIn: string
    checkOut: string
    apartment: { name: string; nameSr?: string; nameDe?: string; nameIt?: string }
  }
  guest: { full_name: string }
  language: EmailLanguage
}): Promise<EmailContent> {
  const { booking, guest, language } = props
  const strings = getEmailStrings(language)
  
  const apartmentName = getApartmentName(booking.apartment, language)
  const formattedCheckIn = formatDateForEmail(booking.checkIn, language)
  const formattedCheckOut = formatDateForEmail(booking.checkOut, language)
  
  const emailComponent = CheckInInstructionsEmail({
    booking: {
      ...booking,
      apartment: { name: apartmentName },
      checkIn: formattedCheckIn,
      checkOut: formattedCheckOut,
    },
    guest,
  })
  
  const html = await renderEmail(emailComponent as ReactElement)
  const text = generatePlainTextFromHtml(html)
  
  return {
    subject: `${strings.checkInInstructions} - ${booking.bookingNumber}`,
    html,
    text,
  }
}

// Render pre-arrival reminder email
export async function renderPreArrivalReminderEmail(props: {
  booking: {
    bookingNumber: string
    checkIn: string
    checkOut: string
    apartment: { name: string; nameSr?: string; nameDe?: string; nameIt?: string }
  }
  guest: { full_name: string }
  language: EmailLanguage
}): Promise<EmailContent> {
  const { booking, guest, language } = props
  const strings = getEmailStrings(language)
  
  const apartmentName = getApartmentName(booking.apartment, language)
  const formattedCheckIn = formatDateForEmail(booking.checkIn, language)
  const formattedCheckOut = formatDateForEmail(booking.checkOut, language)
  
  const emailComponent = PreArrivalReminderEmail({
    booking: {
      ...booking,
      apartment: { name: apartmentName },
      checkIn: formattedCheckIn,
      checkOut: formattedCheckOut,
    },
    guest,
  })
  
  const html = await renderEmail(emailComponent as ReactElement)
  const text = generatePlainTextFromHtml(html)
  
  return {
    subject: `${strings.preArrivalReminder} - ${booking.bookingNumber}`,
    html,
    text,
  }
}

// Render review request email
export async function renderReviewRequestEmail(props: {
  booking: {
    bookingNumber: string
    checkOut: string
    apartment: { name: string; nameSr?: string; nameDe?: string; nameIt?: string }
  }
  guest: { full_name: string }
  language: EmailLanguage
  reviewUrl?: string
}): Promise<EmailContent> {
  const { booking, guest, language } = props
  const strings = getEmailStrings(language)
  
  const apartmentName = getApartmentName(booking.apartment, language)
  const formattedCheckOut = formatDateForEmail(booking.checkOut, language)
  
  const emailComponent = ReviewRequestEmail({
    booking: {
      ...booking,
      apartment: { name: apartmentName },
      checkOut: formattedCheckOut,
    },
    guest,
  })
  
  const html = await renderEmail(emailComponent as ReactElement)
  const text = generatePlainTextFromHtml(html)
  
  return {
    subject: `${strings.reviewRequest} - ${booking.bookingNumber}`,
    html,
    text,
  }
}

// Helper to generate plain text from HTML
function generatePlainTextFromHtml(html: string): string {
  return html
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .replace(/\s*\n\s*/g, '\n')
    .trim()
}

// Get email subject for a given type and language
export function getEmailSubject(type: string, language: EmailLanguage): string {
  const strings = getEmailStrings(language)
  
  switch (type) {
    case 'booking_confirmation':
      return strings.bookingConfirmed
    case 'booking_request':
      return strings.newBookingRequest
    case 'check_in_instructions':
      return strings.checkInInstructions
    case 'pre_arrival_reminder':
      return strings.preArrivalReminder
    case 'review_request':
      return strings.reviewRequest
    default:
      return 'Apartmani Jovča'
  }
}
