import { getBookedDatesForRange } from '@/lib/admin/availability-calendar'

describe('availability calendar helpers', () => {
  it('expands booked nights and keeps checkout day available', () => {
    expect(getBookedDatesForRange({
      id: 'booking-1',
      check_in: '2026-07-03',
      check_out: '2026-07-06',
    }, '2026-07-01', '2026-07-31')).toEqual([
      '2026-07-03',
      '2026-07-04',
      '2026-07-05',
    ])
  })

  it('keeps the requested calendar end date inclusive', () => {
    expect(getBookedDatesForRange({
      id: 'booking-3',
      check_in: '2026-07-31',
      check_out: '2026-08-02',
    }, '2026-07-01', '2026-07-31')).toEqual([
      '2026-07-31',
    ])
  })

  it('clips booking dates to the requested calendar range', () => {
    expect(getBookedDatesForRange({
      id: 'booking-2',
      check_in: '2026-06-29',
      check_out: '2026-07-03',
    }, '2026-07-01', '2026-07-31')).toEqual([
      '2026-07-01',
      '2026-07-02',
    ])
  })
})
