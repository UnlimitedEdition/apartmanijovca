import { Html, Head, Body, Container, Section, Text, Heading } from '@react-email/components'

interface BookingConfirmationEmailProps {
  booking: {
    bookingNumber: string
    checkIn: string
    checkOut: string
    totalPrice: number
    apartment: { name: string }
  }
  guest: {
    full_name: string
  }
}

export default function BookingConfirmationEmail({ booking, guest }: BookingConfirmationEmailProps) {
  return (
    <Html>
      <Head />
      <Body style={{ fontFamily: 'Arial, sans-serif', backgroundColor: '#f4f4f4', padding: '20px' }}>
        <Container style={{ maxWidth: '600px', margin: '0 auto', backgroundColor: '#ffffff', padding: '20px', borderRadius: '8px' }}>
          <Heading style={{ color: '#333', textAlign: 'center' }}>Booking Confirmed!</Heading>
          
          <Section style={{ textAlign: 'center', margin: '20px 0' }}>
            <Text style={{ fontSize: '18px', color: '#666' }}>
              Dear {guest.full_name}, your booking has been confirmed.
            </Text>
          </Section>

          <Section style={{ margin: '20px 0' }}>
            <Text style={{ fontSize: '16px', margin: '10px 0' }}>
              <strong>Booking Number:</strong> {booking.bookingNumber}
            </Text>
            <Text style={{ fontSize: '16px', margin: '10px 0' }}>
              <strong>Apartment:</strong> {booking.apartment.name}
            </Text>
            <Text style={{ fontSize: '16px', margin: '10px 0' }}>
              <strong>Check-in:</strong> {booking.checkIn}
            </Text>
            <Text style={{ fontSize: '16px', margin: '10px 0' }}>
              <strong>Check-out:</strong> {booking.checkOut}
            </Text>
            <Text style={{ fontSize: '16px', margin: '10px 0' }}>
              <strong>Total Price:</strong> ${booking.totalPrice}
            </Text>
          </Section>

          <Section style={{ textAlign: 'center', margin: '30px 0' }}>
            <Text style={{ fontSize: '16px', color: '#666' }}>
              We look forward to welcoming you to Apartmani Jovča!
            </Text>
            <Text style={{ fontSize: '14px', color: '#999', marginTop: '10px' }}>
              If you have any questions, please contact us at +381 65 237 8080
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  )
}
