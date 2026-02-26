import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { Resend } from 'https://esm.sh/resend@2.0.0'

const supabase = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!)
const resend = new Resend(Deno.env.get('RESEND_API_KEY')!)

export default async (req: Request) => {
  // Review request: 1 day after checkout
  const yesterday = new Date()
  yesterday.setDate(yesterday.getDate() - 1)
  const checkoutDate = yesterday.toISOString().split('T')[0]

  const { data: bookings } = await supabase
    .from('bookings')
    .select('*, guests(email)')
    .eq('check_out', checkoutDate)
    .eq('status', 'confirmed')

  for (const booking of bookings) {
    await resend.emails.send({
      from: 'bookings@apartmani-jovca.com',
      to: booking.guests.email,
      subject: 'How Was Your Stay?',
      html: `
        <h1>How Was Your Stay?</h1>
        <p>Dear Guest,</p>
        <p>We hope you enjoyed your stay at Apartmani Jovča.</p>
        <p>Please take a moment to share your experience and leave a review.</p>
        <a href="https://apartmani-jovca.com/review">Leave a Review</a>
      `
    })
  }

  return new Response('OK')
}
