export interface Apartment {
  id?: string
  slug: string
  name: { sr: string; en: string; de: string; it: string }
  description: { sr: string; en: string; de: string; it: string }
  bed_type: { sr: string; en: string; de: string; it: string }
  capacity: number
  base_price_eur: number
  status: 'active' | 'inactive' | 'maintenance'
  display_order?: number
  
  // New fields
  size_sqm?: number
  floor?: number
  bathroom_count?: number
  balcony?: boolean
  view_type?: { sr: string; en: string; de: string; it: string }
  kitchen_type?: { sr: string; en: string; de: string; it: string }
  features?: Array<{ sr: string; en: string; de: string; it: string }>
  house_rules?: { sr: string; en: string; de: string; it: string }
  check_in_time?: string
  check_out_time?: string
  min_stay_nights?: number
  max_stay_nights?: number
  cancellation_policy?: { sr: string; en: string; de: string; it: string }
  
  // Gallery
  images?: string[]
  gallery?: Array<{ url: string; caption: { sr: string; en: string; de: string; it: string }; order: number }>
  video_url?: string
  virtual_tour_url?: string
  
  // SEO
  meta_title?: { sr: string; en: string; de: string; it: string }
  meta_description?: { sr: string; en: string; de: string; it: string }
  meta_keywords?: { sr: string; en: string; de: string; it: string }
  
  // Pricing
  weekend_price_eur?: number
  weekly_discount_percent?: number
  monthly_discount_percent?: number
  seasonal_pricing?: Array<{ season: string; start_date: string; end_date: string; price_eur: number }>
  
  // Checkbox/Counter selections
  bed_counts?: Record<string, number>  // { 'double_bed': 1, 'single_bed': 2 }
  selected_amenities?: string[]
  selected_rules?: string[]
  selected_view?: string
  
  // Location
  address?: string
  city?: string
  country?: string
  postal_code?: string
  latitude?: number
  longitude?: number
}

export const emptyApartment: Apartment = {
  slug: '',
  name: { sr: '', en: '', de: '', it: '' },
  description: { sr: '', en: '', de: '', it: '' },
  bed_type: { sr: '', en: '', de: '', it: '' },
  capacity: 2,
  base_price_eur: 35,
  status: 'active',
  display_order: 0,
  size_sqm: 45,
  floor: 1,
  bathroom_count: 1,
  balcony: true,
  check_in_time: '14:00',
  check_out_time: '10:00',
  min_stay_nights: 1,
  max_stay_nights: 0,
  weekly_discount_percent: 10,
  monthly_discount_percent: 20,
  weekend_price_eur: 0,
  video_url: '',
  virtual_tour_url: '',
  images: [],
  gallery: [],
  seasonal_pricing: [],
  bed_counts: {},
  selected_amenities: [],
  selected_rules: [],
  selected_view: '',
  meta_title: { sr: '', en: '', de: '', it: '' },
  meta_description: { sr: '', en: '', de: '', it: '' },
  meta_keywords: { sr: '', en: '', de: '', it: '' },
  kitchen_type: { sr: '', en: '', de: '', it: '' },
  house_rules: { sr: '', en: '', de: '', it: '' },
  cancellation_policy: { sr: '', en: '', de: '', it: '' },
  features: [],
  address: '',
  city: '',
  country: 'Srbija',
  postal_code: '',
  latitude: undefined,
  longitude: undefined
}
