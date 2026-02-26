import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(date: Date | string): string {
  const d = new Date(date)
  return d.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

export function formatCurrency(amount: number, currency = 'EUR'): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency
  }).format(amount)
}

export function getLanguageFromUrl(url: string): string {
  const match = url.match(/^\/([a-z]{2})\//)
  return match ? match[1] : 'en'
}

export function buildLocalizedUrl(path: string, lang: string): string {
  return `/${lang}${path}`
}
