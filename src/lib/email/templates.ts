// Email Templates Helper for Apartmani Jovca
// Renders React Email templates and generates HTML/text versions

import type { ReactElement } from 'react'
import type { EmailLanguage, EmailContent } from './types'
import { formatDateForEmail, getApartmentName, formatCurrency } from '../resend'
import { CONTACT_PHONE, CONTACT_EMAIL, PRODUCTION_URL } from '../seo/config'
import type { EmailFooter } from '@/emails/EmailLayout'

// Single generic, brand-consistent email component (block-based content)
import TransactionalEmail, { type EmailBlock } from '@/emails/TransactionalEmail'

// Default Google review link (CID-based). Swap for a g.page/r/.../review link when available.
const GOOGLE_REVIEW_URL = 'https://www.google.com/maps?cid=16333597221475296551'

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
  confirmationLead: string
  confirmationBody: string
  confirmationOutro: string
  questionsContact: string
  footerRights: string
  addressLine: string
  requestReceivedTitle: string
  requestReceivedLead: string
  requestReceivedBody: string
  requestReceivedOutro: string
  rejectedTitle: string
  rejectedLead: string
  rejectedBody: string
  checkInLead: string
  checkInBody: string
  preArrivalLead: string
  preArrivalBody: string
  adminNewBookingLead: string
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
    contactUponArrival: `Kontaktirajte nas po dolasku na ${CONTACT_PHONE}`,
    wifiCode: 'WiFi lozinka će biti data pri prijavi',
    safeTravels: 'Srećan put! Radujemo se vašem dolasku.',
    whatToPrepare: 'Šta pripremiti',
    validIdForCheckIn: 'Važeća lična dokumenta za prijavu',
    specialRequestsRequirements: 'Posebni zahtevi ili potrebe',
    transportationArrangements: 'Prevoz do smeštaja',
    cantWaitToWelcome: 'Jedva čekamo da vas ugostimo!',
    howWasYourStay: 'Kako je bilo tokom boravka?',
    enjoyedStay: 'Dragi {name}, nadamo se da ste uživali u boravku u Apartmanima Jovča!',
    feedbackHelps: 'Vaš utisak nam pomaže da poboljšamo usluge i pomaže drugim putnicima da pronađu savršen smeštaj.',
    leaveReview: 'Ostavite utisak',
    thankYouForChoosing: 'Hvala što ste izabrali Apartmane Jovča.',
    daysUntilArrival: 'Do vašeg dolaska je ostalo {days} dana',
    reviewButton: 'Ostavite utisak',
    confirmationLead: 'Poštovani/a {name}, vaša rezervacija je potvrđena.',
    confirmationBody: 'Vaš termin je od ovog trenutka rezervisan baš za vas. U nastavku su detalji rezervacije.',
    confirmationOutro: 'Radujemo se vašem dolasku u Apartmane Jovča.',
    questionsContact: 'Imate pitanje? Odgovorite na ovaj email ili nas pozovite na {phone}.',
    footerRights: '© {year} Apartmani Jovča. Sva prava zadržana.',
    addressLine: 'Čačak, Srbija',
    requestReceivedTitle: 'Primili smo vaš zahtev',
    requestReceivedLead: 'Poštovani/a {name}, hvala na zahtevu za rezervaciju.',
    requestReceivedBody: 'Vaš zahtev je zaprimljen i trenutno ga proveravamo. Potvrdu vam šaljemo u najkraćem roku.',
    requestReceivedOutro: 'Napomena: ovo još nije potvrda. Dobićete posebnu poruku čim termin bude potvrđen.',
    rejectedTitle: 'O vašem zahtevu za rezervaciju',
    rejectedLead: 'Poštovani/a {name}, hvala na interesovanju za Apartmane Jovča.',
    rejectedBody: 'Nažalost, izabrani termin trenutno nije dostupan, pa vašu rezervaciju ovog puta ne možemo da potvrdimo. Rado ćemo vam pomoći da pronađete drugi slobodan termin — slobodno nas kontaktirajte.',
    checkInLead: 'Poštovani/a {name}, vaš dolazak se približava.',
    checkInBody: 'U nastavku su informacije za prijavu i sve što vam treba za bezbrižan dolazak.',
    preArrivalLead: 'Poštovani/a {name}, radujemo se vašem skorom dolasku!',
    preArrivalBody: 'Ovo je kratak podsetnik na vašu predstojeću rezervaciju. Detalji su ispod.',
    adminNewBookingLead: 'Stigao je novi zahtev za rezervaciju. Detalji su ispod.',
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
    contactUponArrival: `Contact us at ${CONTACT_PHONE} upon arrival`,
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
    confirmationLead: 'Dear {name}, your booking is confirmed.',
    confirmationBody: 'Your dates are now reserved exclusively for you. The booking details are below.',
    confirmationOutro: 'We look forward to welcoming you to Apartmani Jovča.',
    questionsContact: 'Questions? Reply to this email or call us at {phone}.',
    footerRights: '© {year} Apartmani Jovča. All rights reserved.',
    addressLine: 'Čačak, Serbia',
    requestReceivedTitle: 'We received your request',
    requestReceivedLead: 'Dear {name}, thank you for your booking request.',
    requestReceivedBody: 'Your request has been received and we are reviewing it. We will send you a confirmation as soon as possible.',
    requestReceivedOutro: 'Please note: this is not a confirmation yet. You will receive a separate email once your dates are confirmed.',
    rejectedTitle: 'About your booking request',
    rejectedLead: 'Dear {name}, thank you for your interest in Apartmani Jovča.',
    rejectedBody: 'Unfortunately, the selected dates are not available, so we are unable to confirm your booking this time. We would be glad to help you find alternative dates — please feel free to contact us.',
    checkInLead: 'Dear {name}, your arrival is coming up.',
    checkInBody: 'Below are your check-in details and everything you need for a smooth arrival.',
    preArrivalLead: 'Dear {name}, we look forward to your upcoming stay!',
    preArrivalBody: 'This is a friendly reminder about your upcoming booking. The details are below.',
    adminNewBookingLead: 'A new booking request has arrived. Details below.',
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
    contactUponArrival: `Kontaktieren Sie uns bei Ankunft unter ${CONTACT_PHONE}`,
    wifiCode: 'WLAN-Code wird bei der Anreise bereitgestellt',
    safeTravels: 'Gute Reise! Wir freuen uns auf Ihre Ankunft.',
    whatToPrepare: 'Was vorzubereiten ist',
    validIdForCheckIn: 'Gültiger Ausweis für Check-in',
    specialRequestsRequirements: 'Besondere Wünsche oder Anforderungen',
    transportationArrangements: 'Transportmöglichkeiten',
    cantWaitToWelcome: 'Wir freuen uns darauf, Sie begrüßen zu dürfen!',
    howWasYourStay: 'Wie war Ihr Aufenthalt?',
    enjoyedStay: 'Sehr geehrte(r) {name}, wir hoffen, Sie hatten einen tollen Aufenthalt bei Apartmani Jovča!',
    feedbackHelps: 'Ihr Feedback hilft uns, uns zu verbessern, und hilft anderen Reisenden, die perfekte Unterkunft zu finden.',
    leaveReview: 'Bewertung hinterlassen',
    thankYouForChoosing: 'Vielen Dank, dass Sie sich für Apartmani Jovča entschieden haben.',
    daysUntilArrival: 'Ihre Ankunft ist in {days} Tagen',
    reviewButton: 'Bewertung hinterlassen',
    confirmationLead: 'Sehr geehrte(r) {name}, Ihre Buchung ist bestätigt.',
    confirmationBody: 'Ihr Zeitraum ist ab sofort exklusiv für Sie reserviert. Die Buchungsdetails finden Sie unten.',
    confirmationOutro: 'Wir freuen uns darauf, Sie in den Apartmani Jovča begrüßen zu dürfen.',
    questionsContact: 'Fragen? Antworten Sie auf diese E-Mail oder rufen Sie uns an: {phone}.',
    footerRights: '© {year} Apartmani Jovča. Alle Rechte vorbehalten.',
    addressLine: 'Čačak, Serbien',
    requestReceivedTitle: 'Wir haben Ihre Anfrage erhalten',
    requestReceivedLead: 'Sehr geehrte(r) {name}, vielen Dank für Ihre Buchungsanfrage.',
    requestReceivedBody: 'Ihre Anfrage ist eingegangen und wird derzeit geprüft. Wir senden Ihnen schnellstmöglich eine Bestätigung.',
    requestReceivedOutro: 'Hinweis: Dies ist noch keine Bestätigung. Sie erhalten eine separate E-Mail, sobald Ihr Zeitraum bestätigt ist.',
    rejectedTitle: 'Zu Ihrer Buchungsanfrage',
    rejectedLead: 'Sehr geehrte(r) {name}, vielen Dank für Ihr Interesse an Apartmani Jovča.',
    rejectedBody: 'Leider ist der gewählte Zeitraum nicht verfügbar, daher können wir Ihre Buchung diesmal nicht bestätigen. Gerne helfen wir Ihnen, einen anderen freien Termin zu finden — kontaktieren Sie uns einfach.',
    checkInLead: 'Sehr geehrte(r) {name}, Ihre Anreise steht bevor.',
    checkInBody: 'Nachfolgend finden Sie Ihre Check-in-Informationen und alles für eine reibungslose Anreise.',
    preArrivalLead: 'Sehr geehrte(r) {name}, wir freuen uns auf Ihren baldigen Aufenthalt!',
    preArrivalBody: 'Dies ist eine kurze Erinnerung an Ihre bevorstehende Buchung. Die Details finden Sie unten.',
    adminNewBookingLead: 'Eine neue Buchungsanfrage ist eingegangen. Details unten.',
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
    contactUponArrival: `Contattateci al ${CONTACT_PHONE} all\'arrivo`,
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
    confirmationLead: 'Gentile {name}, la tua prenotazione è confermata.',
    confirmationBody: 'Le tue date sono ora riservate esclusivamente a te. Di seguito trovi i dettagli della prenotazione.',
    confirmationOutro: 'Non vediamo l\'ora di darti il benvenuto presso Apartmani Jovča.',
    questionsContact: 'Domande? Rispondi a questa email o chiamaci al {phone}.',
    footerRights: '© {year} Apartmani Jovča. Tutti i diritti riservati.',
    addressLine: 'Čačak, Serbia',
    requestReceivedTitle: 'Abbiamo ricevuto la tua richiesta',
    requestReceivedLead: 'Gentile {name}, grazie per la tua richiesta di prenotazione.',
    requestReceivedBody: 'La tua richiesta è stata ricevuta ed è in fase di verifica. Ti invieremo una conferma il prima possibile.',
    requestReceivedOutro: 'Nota: questa non è ancora una conferma. Riceverai un\'email separata una volta confermate le date.',
    rejectedTitle: 'Riguardo alla tua richiesta di prenotazione',
    rejectedLead: 'Gentile {name}, grazie per il tuo interesse per Apartmani Jovča.',
    rejectedBody: 'Purtroppo le date selezionate non sono disponibili, quindi non possiamo confermare la tua prenotazione questa volta. Saremo lieti di aiutarti a trovare date alternative — non esitare a contattarci.',
    checkInLead: 'Gentile {name}, il tuo arrivo si avvicina.',
    checkInBody: 'Di seguito trovi i dettagli per il check-in e tutto ciò che ti serve per un arrivo senza pensieri.',
    preArrivalLead: 'Gentile {name}, non vediamo l\'ora del tuo prossimo soggiorno!',
    preArrivalBody: 'Questo è un breve promemoria della tua prossima prenotazione. I dettagli sono qui sotto.',
    adminNewBookingLead: 'È arrivata una nuova richiesta di prenotazione. Dettagli sotto.',
  },
}

// Get email strings for a specific language
export function getEmailStrings(lang: EmailLanguage) {
  return emailStrings[lang] || emailStrings.en
}

// Build the shared footer (NAP + contact) for a given language
function buildFooter(strings: ReturnType<typeof getEmailStrings>): EmailFooter {
  return {
    tagline: strings.thankYouForChoosing,
    contactLabel: strings.contact,
    phone: CONTACT_PHONE,
    email: CONTACT_EMAIL,
    website: PRODUCTION_URL,
    address: strings.addressLine,
    rights: strings.footerRights.replace('{year}', String(new Date().getFullYear())),
  }
}

const BRAND_NAME = 'Apartmani Jovča'

// Shared renderer — composes TransactionalEmail with the standard footer and returns HTML + text.
async function renderTransactional(opts: {
  preview: string
  title: string
  subject: string
  blocks: EmailBlock[]
  strings: ReturnType<typeof getEmailStrings>
}): Promise<EmailContent> {
  const component = TransactionalEmail({
    preview: opts.preview,
    brandName: BRAND_NAME,
    title: opts.title,
    blocks: opts.blocks,
    footer: buildFooter(opts.strings),
  })
  const html = await renderEmail(component as ReactElement)
  const text = generatePlainTextFromHtml(html)
  return { subject: opts.subject, html, text }
}

// Standard booking detail rows (reused across email types)
function bookingRows(
  strings: ReturnType<typeof getEmailStrings>,
  data: { bookingNumber: string; apartmentName: string; checkIn?: string; checkOut?: string; totalPrice?: number },
  language: EmailLanguage,
  withPrice = false,
) {
  const rows: { label: string; value: string; highlight?: boolean }[] = [
    { label: strings.bookingNumber, value: data.bookingNumber },
    { label: strings.apartment, value: data.apartmentName },
  ]
  if (data.checkIn) rows.push({ label: strings.checkIn, value: formatDateForEmail(data.checkIn, language) })
  if (data.checkOut) rows.push({ label: strings.checkOut, value: formatDateForEmail(data.checkOut, language) })
  if (withPrice && typeof data.totalPrice === 'number') {
    rows.push({ label: strings.totalPrice, value: formatCurrency(data.totalPrice, 'EUR'), highlight: true })
  }
  return rows
}

// Render booking confirmation email (guest, on confirmed)
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
  const lead = strings.confirmationLead.replace('{name}', guest.full_name)

  const blocks: EmailBlock[] = [
    { kind: 'lead', text: lead },
    { kind: 'para', text: strings.confirmationBody },
    { kind: 'details', rows: bookingRows(strings, { bookingNumber: booking.bookingNumber, apartmentName, checkIn: booking.checkIn, checkOut: booking.checkOut, totalPrice: booking.totalPrice }, language, true) },
    { kind: 'para', text: strings.confirmationOutro },
    { kind: 'muted', text: strings.questionsContact.replace('{phone}', CONTACT_PHONE) },
  ]

  return renderTransactional({
    preview: lead,
    title: strings.bookingConfirmed,
    subject: `${strings.bookingConfirmed} - ${booking.bookingNumber}`,
    blocks,
    strings,
  })
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

  const blocks: EmailBlock[] = [
    { kind: 'lead', text: strings.adminNewBookingLead },
    { kind: 'details', rows: bookingRows(strings, { bookingNumber: booking.bookingNumber, apartmentName, checkIn: booking.checkIn, checkOut: booking.checkOut, totalPrice: booking.totalPrice }, language, true) },
    { kind: 'list', title: strings.guestInformation, items: [
      `${strings.name}: ${guest.full_name}`,
      `${strings.email}: ${guest.email}`,
      `${strings.phone}: ${guest.phone || '—'}`,
    ] },
  ]

  return renderTransactional({
    preview: strings.adminNewBookingLead,
    title: strings.newBookingRequest,
    subject: `${strings.newBookingRequest} - ${booking.bookingNumber}`,
    blocks,
    strings,
  })
}

// Render check-in instructions email (guest, before arrival)
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
  const lead = strings.checkInLead.replace('{name}', guest.full_name)

  const blocks: EmailBlock[] = [
    { kind: 'lead', text: lead },
    { kind: 'para', text: strings.checkInBody },
    { kind: 'details', rows: bookingRows(strings, { bookingNumber: booking.bookingNumber, apartmentName, checkIn: booking.checkIn, checkOut: booking.checkOut }, language) },
    { kind: 'list', title: strings.whatToPrepare, items: [
      strings.checkInTime,
      strings.checkOutTime,
      strings.bringValidId,
      strings.contactUponArrival,
      strings.wifiCode,
    ] },
    { kind: 'muted', text: strings.safeTravels },
  ]

  return renderTransactional({
    preview: lead,
    title: strings.checkInInstructions,
    subject: `${strings.checkInInstructions} - ${booking.bookingNumber}`,
    blocks,
    strings,
  })
}

// Render pre-arrival reminder email (guest, days before arrival)
export async function renderPreArrivalReminderEmail(props: {
  booking: {
    bookingNumber: string
    checkIn: string
    checkOut: string
    apartment: { name: string; nameSr?: string; nameDe?: string; nameIt?: string }
  }
  guest: { full_name: string }
  language: EmailLanguage
  daysUntilArrival?: number
}): Promise<EmailContent> {
  const { booking, guest, language, daysUntilArrival } = props
  const strings = getEmailStrings(language)
  const apartmentName = getApartmentName(booking.apartment, language)
  const lead = strings.preArrivalLead.replace('{name}', guest.full_name)

  const closing =
    typeof daysUntilArrival === 'number'
      ? strings.daysUntilArrival.replace('{days}', String(daysUntilArrival))
      : strings.cantWaitToWelcome

  const blocks: EmailBlock[] = [
    { kind: 'lead', text: lead },
    { kind: 'para', text: strings.preArrivalBody },
    { kind: 'details', rows: bookingRows(strings, { bookingNumber: booking.bookingNumber, apartmentName, checkIn: booking.checkIn, checkOut: booking.checkOut }, language) },
    { kind: 'muted', text: closing },
  ]

  return renderTransactional({
    preview: lead,
    title: strings.preArrivalReminder,
    subject: `${strings.preArrivalReminder} - ${booking.bookingNumber}`,
    blocks,
    strings,
  })
}

// Render review request email (guest, after checkout)
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
  const { booking, guest, language, reviewUrl } = props
  const strings = getEmailStrings(language)

  const blocks: EmailBlock[] = [
    { kind: 'lead', text: strings.enjoyedStay.replace('{name}', guest.full_name) },
    { kind: 'para', text: strings.feedbackHelps },
    { kind: 'button', href: reviewUrl || GOOGLE_REVIEW_URL, label: strings.reviewButton },
    { kind: 'muted', text: strings.cantWaitToWelcome },
  ]

  return renderTransactional({
    preview: strings.howWasYourStay,
    title: strings.reviewRequest,
    subject: `${strings.reviewRequest} - ${booking.bookingNumber}`,
    blocks,
    strings,
  })
}

// Render "request received" email (guest, on pending — acknowledges the request)
export async function renderRequestReceivedEmail(props: {
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
  const lead = strings.requestReceivedLead.replace('{name}', guest.full_name)

  const blocks: EmailBlock[] = [
    { kind: 'lead', text: lead },
    { kind: 'para', text: strings.requestReceivedBody },
    { kind: 'details', rows: bookingRows(strings, { bookingNumber: booking.bookingNumber, apartmentName, checkIn: booking.checkIn, checkOut: booking.checkOut, totalPrice: booking.totalPrice }, language, true) },
    { kind: 'para', text: strings.requestReceivedOutro },
    { kind: 'muted', text: strings.questionsContact.replace('{phone}', CONTACT_PHONE) },
  ]

  return renderTransactional({
    preview: lead,
    title: strings.requestReceivedTitle,
    subject: `${strings.requestReceivedTitle} - ${booking.bookingNumber}`,
    blocks,
    strings,
  })
}

// Render booking rejection email (guest, on cancelled/declined)
export async function renderRejectionEmail(props: {
  booking: { bookingNumber: string }
  guest: { full_name: string }
  language: EmailLanguage
}): Promise<EmailContent> {
  const { booking, guest, language } = props
  const strings = getEmailStrings(language)
  const lead = strings.rejectedLead.replace('{name}', guest.full_name)

  const blocks: EmailBlock[] = [
    { kind: 'lead', text: lead },
    { kind: 'para', text: strings.rejectedBody },
    { kind: 'muted', text: strings.questionsContact.replace('{phone}', CONTACT_PHONE) },
  ]

  return renderTransactional({
    preview: lead,
    title: strings.rejectedTitle,
    subject: `${strings.rejectedTitle} - ${booking.bookingNumber}`,
    blocks,
    strings,
  })
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
