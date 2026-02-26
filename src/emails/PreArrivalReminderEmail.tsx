import { Html, Head, Body, Container, Section, Text, Heading } from '@react-email/components'

interface PreArrivalReminderEmailProps {
  booking: {
    bookingNumber: string
    checkIn: string
    checkOut: string
    apartment: { name: string }
  }
  guest: {
    full_name: string
  }
}

export default function PreArrivalReminderEmail({ booking, guest }: PreArrivalReminderEmailProps) {
  return (
    <Html>
      <Head />
      <Body style={{ fontFamily: 'Arial, sans-serif', backgroundColor: '#f4f4f4', padding: '20px' }}>
        <Container style={{ maxWidth: '600px', margin: '0 auto', backgroundColor: '#ffffff', padding: '20px', borderRadius: '8px' }}>
          <Heading style={{ color: '#333', textAlign: 'center' }}>Pre-Arrival Reminder</Heading>
          
          <Section style={{ textAlign: 'center', margin: '20px 0' }}>
            <Text style={{ fontSize: '18px', color: '#666' }}>
              Dear {guest.full_name}, your stay is approaching!
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
          </Section>

          <Section style={{ margin: '20px 0' }}>
            <Heading as="h2" style={{ color: '#333' }}>What to Prepare</Heading>
            <Text style={{ fontSize: '16px', margin: '10px 0' }}>
              • Valid ID for check-in
            </Text>
            <Text style={{ fontSize: '16px', margin: '10px 0' }}>
              • Any special requests or requirements
            </Text>
            <Text style={{ fontSize: '16px', margin: '10px 0' }}>
              • Transportation arrangements
            </Text>
          </Section>

          <Section style={{ textAlign: 'center', margin: '30px 0' }}>
            <Text style={{ fontSize: '16px', color: '#666' }}>
              We can&apos;t wait to welcome you! Contact us if you need any assistance.
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  )
}
