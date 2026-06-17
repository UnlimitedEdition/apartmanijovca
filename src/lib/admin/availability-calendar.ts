export interface BookingDateRange {
  id: string
  check_in: string
  check_out: string
}

function parseDate(date: string): Date {
  const [year, month, day] = date.split('-').map(Number)
  return new Date(year, month - 1, day)
}

function formatDate(date: Date): string {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return year + '-' + month + '-' + day
}

export function getBookedDatesForRange(
  booking: BookingDateRange,
  startDate: string,
  endDate: string
): string[] {
  const rangeStart = parseDate(startDate)
  const rangeEnd = parseDate(endDate)
  const bookingStart = parseDate(booking.check_in)
  const bookingEnd = parseDate(booking.check_out)
  const dates: string[] = []

  const current = new Date(Math.max(bookingStart.getTime(), rangeStart.getTime()))
  const last = new Date(Math.min(bookingEnd.getTime(), rangeEnd.getTime()))

  while (current < last) {
    dates.push(formatDate(current))
    current.setDate(current.getDate() + 1)
  }

  return dates
}
