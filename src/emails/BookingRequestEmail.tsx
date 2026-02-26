import { Html, Head, Body, Container, Section, Text, Heading } from '@react-email/components'

interface BookingRequestEmailProps {
  booking: {
    bookingNumber: string
    checkIn: string
    checkOut: string
    totalPrice: number
    apartment: { name: string }
  }
  guest: {
    full_name: string
    email: string
    phone: string
  }
}

export default function BookingRequestEmail({ booking, guest }: BookingRequestEmailProps) {
  return (
    <Html>
      <Head />
      <Body style={{ fontFamily: 'Arial, sans-serif', backgroundColor: '#f4f4f4', padding: '20px' }}>
        <Container style={{ maxWidth: '600px', margin: '0 auto', backgroundColor: '#ffffff', padding: '20px', borderRadius: '8px' }}>
          <Heading style={{ color: '#333', textAlign: 'center' }}>New Booking Request</Heading>
          
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

          <Section style={{ margin: '20px 0' }}>
            <Heading as="h2" style={{ color: '#333' }}>Guest Information</Heading>
            <Text style={{ fontSize: '16px', margin: '10px 0' }}>
              <strong>Name:</strong> {guest.full_name}
            </Text>
            <Text style={{ fontSize: '16px', margin: '10px 0' }}>
              <strong>Email:</strong> {guest.email}
            </Text>
            <Text style={{ fontSize: '16px', margin: '10px 0' }}>
              <strong>Phone:</strong> {guest.phone}
            </Text>
          </Section>

          <Section style={{ textAlign: 'center', margin: '30px 0' }}>
            <Text style={{ fontSize: '16px', color: '#666' }}>
              Please review and confirm this booking request.
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  )
}
