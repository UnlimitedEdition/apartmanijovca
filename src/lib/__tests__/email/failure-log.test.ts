/**
 * Unit tests for email/failure-log.ts
 * Neuspešno slanje mejla mora ostaviti trajan zapis u email_events
 * (ne samo console.error u efemernom Vercel logu).
 */

const insertMock = jest.fn().mockResolvedValue({ error: null })
const fromMock = jest.fn(() => ({ insert: insertMock }))

jest.mock('../../supabase', () => ({
  supabase: null,
  supabaseAdmin: { from: (...args: unknown[]) => fromMock(...args) },
}))

import { recordEmailFailure } from '../../email/failure-log'

describe('recordEmailFailure', () => {
  beforeEach(() => {
    insertMock.mockClear()
    fromMock.mockClear()
  })

  it('inserts a send_failure row into email_events', async () => {
    await recordEmailFailure({
      emailType: 'booking_request',
      recipient: 'prvi@example.com, drugi@example.com',
      subject: 'Nova rezervacija',
      bookingId: '123e4567-e89b-12d3-a456-426614174000',
      error: 'Brevo API error 400',
    })

    expect(fromMock).toHaveBeenCalledWith('email_events')
    expect(insertMock).toHaveBeenCalledWith(
      expect.objectContaining({
        event_type: 'send_failure',
        email_to: 'prvi@example.com, drugi@example.com',
        email_subject: 'Nova rezervacija',
        booking_id: '123e4567-e89b-12d3-a456-426614174000',
        payload: expect.objectContaining({
          emailType: 'booking_request',
          error: 'Brevo API error 400',
        }),
      })
    )
    const inserted = insertMock.mock.calls[0][0]
    expect(inserted.event_id).toMatch(/^send-failure-/)
  })

  it('stores null booking_id when the value is not a valid UUID', async () => {
    await recordEmailFailure({
      recipient: 'admin@example.com',
      bookingId: 'nije-uuid',
      error: 'timeout',
    })

    expect(insertMock).toHaveBeenCalledWith(
      expect.objectContaining({ booking_id: null })
    )
  })

  it('never throws when the insert fails', async () => {
    insertMock.mockResolvedValueOnce({ error: { message: 'db down' } })

    await expect(
      recordEmailFailure({ recipient: 'admin@example.com', error: 'x' })
    ).resolves.toBeUndefined()
  })

  it('never throws when the insert rejects', async () => {
    insertMock.mockRejectedValueOnce(new Error('network'))

    await expect(
      recordEmailFailure({ recipient: 'admin@example.com', error: 'x' })
    ).resolves.toBeUndefined()
  })
})
