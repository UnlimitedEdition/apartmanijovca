import { Html, Head, Body, Container, Section, Text, Heading } from '@react-email/components'

interface ReviewRequestEmailProps {
  booking: {
    bookingNumber: string
    checkOut: string
    apartment: { name: string }
  }
  guest: {
    full_name: string
  }
}

export default function ReviewRequestEmail({ booking, guest }: ReviewRequestEmailProps) {
  return (
    <Html>
      <Head />
      <Body style={{ fontFamily: 'Arial, sans-serif', backgroundColor: '#f4f4f4', padding: '20px' }}>
        <Container style={{ maxWidth: '600px', margin: '0 auto', backgroundColor: '#ffffff', padding: '20px', borderRadius: '8px' }}>
          <Heading style={{ color: '#333', textAlign: 'center' }}>How Was Your Stay?</Heading>
          
          <Section style={{ textAlign: 'center', margin: '20px 0' }}>
            <Text style={{ fontSize: '18px', color: '#666' }}>
              Dear {guest.full_name}, we hope you enjoyed your stay at Apartmani Jovča!
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
              <strong>Check-out:</strong> {booking.checkOut}
            </Text>
          </Section>

          <Section style={{ margin: '20px 0' }}>
            <Text style={{ fontSize: '16px', color: '#666' }}>
              Your feedback helps us improve and helps other travelers find the perfect accommodation.
              Please take a moment to share your experience.
            </Text>
          </Section>

          <Section style={{ textAlign: 'center', margin: '30px 0' }}>
            <a
              href="https://apartmani-jovca.com/review"
              style={{
                backgroundColor: '#2563eb',
                color: '#ffffff',
                padding: '12px 24px',
                textDecoration: 'none',
                borderRadius: '6px',
                fontSize: '16px',
                display: 'inline-block'
              }}
            >
              Leave a Review
            </a>
          </Section>

          <Section style={{ textAlign: 'center', margin: '20px 0' }}>
            <Text style={{ fontSize: '14px', color: '#999' }}>
              Thank you for choosing Apartmani Jovča. We look forward to welcoming you again!
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  )
}
