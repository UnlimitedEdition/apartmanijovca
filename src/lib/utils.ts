import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Serbian plural-form selector.
 * Returns the correct form based on the number:
 *  - one:  1, 21, 31, ... (n % 10 === 1 && n % 100 !== 11)
 *  - few:  2-4, 22-24, ... (n % 10 in 2..4 && n % 100 not in 12..14)
 *  - many: everything else (0, 5-20, 25-30, ...)
 */
export function serbianPlural<T>(n: number, forms: { one: T; few: T; many: T }): T {
  const abs = Math.abs(n)
  const mod10 = abs % 10
  const mod100 = abs % 100

  if (mod10 === 1 && mod100 !== 11) return forms.one
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)) return forms.few
  return forms.many
}

/** "1 gost", "2 gosta", "5 gostiju" */
export function pluralizeGuests(n: number): string {
  return `${n} ${serbianPlural(n, { one: 'gost', few: 'gosta', many: 'gostiju' })}`
}

/** "1 krevet", "2 kreveta", "5 kreveta" */
export function pluralizeBeds(n: number): string {
  return `${n} ${serbianPlural(n, { one: 'krevet', few: 'kreveta', many: 'kreveta' })}`
}

/** "1 noć", "2 noći", "5 noći" */
export function pluralizeNights(n: number): string {
  return `${n} ${serbianPlural(n, { one: 'noć', few: 'noći', many: 'noći' })}`
}

/** "1 kupatilo", "2 kupatila", "5 kupatila" */
export function pluralizeBathrooms(n: number): string {
  return `${n} ${serbianPlural(n, { one: 'kupatilo', few: 'kupatila', many: 'kupatila' })}`
}
