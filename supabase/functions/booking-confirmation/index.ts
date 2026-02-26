import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { Resend } from 'https://esm.sh/resend@2.0.0'

const supabase = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!)
const resend = new Resend(Deno.env.get('RESEND_API_KEY')!)

export default async (req: Request) => {
  const payload = await req.json()
  const { type, record, old_record } = payload

  if (type === 'UPDATE' && record.status === 'confirmed' && old_record.status !== 'confirmed') {
    // Get guest email
    const { data: guest } = await supabase
      .from('guests')
      .select('email')
      .eq('id', record.guest_id)
      .single()

    if (guest) {
      await resend.emails.send({
        from: 'bookings@apartmani-jovca.com',
        to: guest.email,
        subject: 'Booking Confirmed',
        html: `
          <h1>Booking Confirmed</h1>
          <p>Dear Guest,</p>
          <p>Your booking has been confirmed.</p>
          <p>Check-in: ${record.check_in}</p>
          <p>Check-out: ${record.check_out}</p>
          <p>We look forward to welcoming you!</p>
        `
      })
    }
  }

  return new Response('OK')
}
