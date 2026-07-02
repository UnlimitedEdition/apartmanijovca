/**
 * Unit tests for getAdminNotificationEmails (resend.ts)
 * Booking admin notifikacija mora ići na SVE admin adrese (ADMIN_EMAILS),
 * ne samo na jednu (ADMIN_EMAIL) — regresija za "jedan admin dobija mejl, drugi ne".
 */

const ORIGINAL_ENV = process.env

function loadGetAdminNotificationEmails(): () => string[] {
  let fn: (() => string[]) | undefined
  jest.isolateModules(() => {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    fn = require('../../resend').getAdminNotificationEmails
  })
  if (!fn) throw new Error('Failed to load getAdminNotificationEmails')
  return fn
}

describe('getAdminNotificationEmails', () => {
  beforeEach(() => {
    process.env = { ...ORIGINAL_ENV }
    delete process.env.ADMIN_EMAILS
    delete process.env.ADMIN_EMAIL
  })

  afterAll(() => {
    process.env = ORIGINAL_ENV
  })

  it('falls back to the single admin address when ADMIN_EMAILS is not set', () => {
    const getAdminNotificationEmails = loadGetAdminNotificationEmails()

    expect(getAdminNotificationEmails()).toEqual(['apartmanijovca@gmail.com'])
  })

  it('includes every address from ADMIN_EMAILS plus the ADMIN_EMAIL fallback', () => {
    process.env.ADMIN_EMAILS = 'Prvi@example.com, drugi@example.com'
    const getAdminNotificationEmails = loadGetAdminNotificationEmails()

    expect(getAdminNotificationEmails()).toEqual([
      'prvi@example.com',
      'drugi@example.com',
      'apartmanijovca@gmail.com',
    ])
  })

  it('deduplicates when ADMIN_EMAIL is already in ADMIN_EMAILS', () => {
    process.env.ADMIN_EMAILS = 'prvi@example.com,drugi@example.com'
    process.env.ADMIN_EMAIL = 'DRUGI@example.com'
    const getAdminNotificationEmails = loadGetAdminNotificationEmails()

    expect(getAdminNotificationEmails()).toEqual([
      'prvi@example.com',
      'drugi@example.com',
    ])
  })

  it('ignores empty entries and surrounding whitespace', () => {
    process.env.ADMIN_EMAILS = ' prvi@example.com ,, drugi@example.com , '
    const getAdminNotificationEmails = loadGetAdminNotificationEmails()

    expect(getAdminNotificationEmails()).toEqual([
      'prvi@example.com',
      'drugi@example.com',
      'apartmanijovca@gmail.com',
    ])
  })
})
