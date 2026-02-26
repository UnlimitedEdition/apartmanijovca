import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { Resend } from 'https://esm.sh/resend@2.0.0'

const supabase = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!)
const resend = new Resend(Deno.env.get('RESEND_API_KEY')!)

export default async (req: Request) => {
  // Pre-arrival reminder: 7 days before check-in
  const sevenDaysFromNow = new Date()
  sevenDaysFromNow.setDate(sevenDaysFromNow.getDate() + 7)
  const checkinDate = sevenDaysFromNow.toISOString().split('T')[0]

  const { data: bookings } = await supabase
    .from('bookings')
    .select('*, guests(email)')
    .eq('check_in', checkinDate)
    .eq('status', 'confirmed')

  for (const booking of bookings) {
    await resend.emails.send({
      from: 'bookings@apartmani-jovca.com',
      to: booking.guests.email,
      subject: 'Pre-Arrival Reminder',
      html: `
        <h1>Pre-Arrival Reminder</h1>
        <p>Dear Guest,</p>
        <p>Your stay at Apartmani Jovča starts in 7 days.</p>
        <p>Check-in: ${booking.check_in}</p>
        <p>Please prepare your documents and contact us if needed.</p>
      `
    })
  }

  return new Response('OK')
}
