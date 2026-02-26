import { Html, Head, Body, Container, Section, Text, Heading } from '@react-email/components'

interface CheckInInstructionsEmailProps {
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

export default function CheckInInstructionsEmail({ booking, guest }: CheckInInstructionsEmailProps) {
  return (
    <Html>
      <Head />
      <Body style={{ fontFamily: 'Arial, sans-serif', backgroundColor: '#f4f4f4', padding: '20px' }}>
        <Container style={{ maxWidth: '600px', margin: '0 auto', backgroundColor: '#ffffff', padding: '20px', borderRadius: '8px' }}>
          <Heading style={{ color: '#333', textAlign: 'center' }}>Check-In Instructions</Heading>
          
          <Section style={{ textAlign: 'center', margin: '20px 0' }}>
            <Text style={{ fontSize: '18px', color: '#666' }}>
              Dear {guest.full_name}, your check-in is tomorrow!
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
            <Heading as="h2" style={{ color: '#333' }}>Check-In Instructions</Heading>
            <Text style={{ fontSize: '16px', margin: '10px 0' }}>
              • Check-in time: 14:00 - 20:00
            </Text>
            <Text style={{ fontSize: '16px', margin: '10px 0' }}>
              • Please bring valid ID
            </Text>
            <Text style={{ fontSize: '16px', margin: '10px 0' }}>
              • Contact us at +381 65 237 8080 upon arrival
            </Text>
            <Text style={{ fontSize: '16px', margin: '10px 0' }}>
              • WiFi code and keys will be provided at check-in
            </Text>
          </Section>

          <Section style={{ textAlign: 'center', margin: '30px 0' }}>
            <Text style={{ fontSize: '16px', color: '#666' }}>
              Safe travels! We look forward to your arrival.
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  )
}
