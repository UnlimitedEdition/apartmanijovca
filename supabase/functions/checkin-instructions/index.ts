import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { Resend } from 'https://esm.sh/resend@2.0.0'

const supabase = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!)
const resend = new Resend(Deno.env.get('RESEND_API_KEY')!)

export default async (req: Request) => {
  // Check-in instructions: 24h before check-in
  const tomorrow = new Date()
  tomorrow.setDate(tomorrow.getDate() + 1)
  const checkinDate = tomorrow.toISOString().split('T')[0]

  const { data: bookings } = await supabase
    .from('bookings')
    .select('*, guests(email)')
    .eq('check_in', checkinDate)
    .eq('status', 'confirmed')

  for (const booking of bookings) {
    await resend.emails.send({
      from: 'bookings@apartmani-jovca.com',
      to: booking.guests.email,
      subject: 'Check-In Instructions',
      html: `
        <h1>Check-In Instructions</h1>
        <p>Dear Guest,</p>
        <p>Your check-in is tomorrow at Apartmani Jovča.</p>
        <p>Check-in time: 14:00 - 20:00</p>
        <p>Please bring valid ID and contact us upon arrival.</p>
        <p>Phone: +381 65 237 8080</p>
      `
    })
  }

  return new Response('OK')
}
