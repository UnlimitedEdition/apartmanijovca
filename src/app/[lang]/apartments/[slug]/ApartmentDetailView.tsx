'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useTranslations } from 'next-intl'
import { pluralizeGuests } from '@/lib/utils'
import ApartmentMap from '@/components/apartments/ApartmentMap'
import {
  Users,
  Bed,
  Bath,
  Maximize,
  Wifi,
  Car,
  Wind,
  Tv,
  Coffee,
  MapPin,
  Clock,
  CheckCircle2,
  XCircle,
  ChevronLeft,
  ChevronRight,
  X,
  Building2,
  Palmtree,
  Mountain,
  Eye,
  Calendar,
  Euro,
  Percent,
  Video,
  Globe
} from 'lucide-react'
import type { Locale, Json } from '@/lib/types/database'
import { AMENITY_OPTIONS, VIEW_OPTIONS, RULE_OPTIONS, getSelectedOptions } from '@/lib/apartment-options'

interface Apartment {
  id: string
  slug: string
  name: string
  description: string
  bed_type: string
  capacity: number
  amenities: string[]
  base_price_eur: number
  images: string[]
  status: string
  created_at: string
  updated_at: string

  size_sqm?: number | null
  floor?: number | null
  bathroom_count?: number | null
  balcony?: boolean | null
  check_in_time?: string | null
  check_out_time?: string | null
  min_stay_nights?: number | null
  max_stay_nights?: number | null
  video_url?: string | null
  virtual_tour_url?: string | null
  weekend_price_eur?: number | null
  weekly_discount_percent?: number | null
  monthly_discount_percent?: number | null

  kitchen_type?: string | null
  house_rules?: string | null
  cancellation_policy?: string | null
  view_type?: string | null

  features?: string[]
  gallery?: Array<{url: string; caption: Json; order: number}>
  seasonal_pricing?: Array<{season: string; start_date: string; end_date: string; price_eur: number}>

  bed_counts?: Record<string, number> | null
  selected_amenities?: string[] | null
  selected_rules?: string[] | null
  selected_view?: string | null

  address?: string | null
  city?: string | null
  country?: string | null
  postal_code?: string | null
  latitude?: number | null
  longitude?: number | null
}

interface Props {
  apartment: Apartment
  locale: Locale
}

export default function ApartmentDetailView({ apartment, locale }: Props) {
  const t = useTranslations('apartments.detail')
  const [selectedImage, setSelectedImage] = useState(0)
  const [showGallery, setShowGallery] = useState(false)

  // Lightbox: zatvaranje na Escape + navigacija strelicama (tastatura)
  useEffect(() => {
    if (!showGallery) return
    const prevOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden' // zaključaj scroll pozadine dok je lightbox otvoren
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setShowGallery(false)
      else if (e.key === 'ArrowLeft') setSelectedImage((p) => (p - 1 + apartment.images.length) % apartment.images.length)
      else if (e.key === 'ArrowRight') setSelectedImage((p) => (p + 1) % apartment.images.length)
    }
    window.addEventListener('keydown', onKey)
    return () => {
      window.removeEventListener('keydown', onKey)
      document.body.style.overflow = prevOverflow
    }
  }, [showGallery, apartment.images.length])

  const features = [
    { icon: Users, label: locale === 'sr' ? pluralizeGuests(apartment.capacity) : `${apartment.capacity} ${t('guests')}`, value: apartment.capacity },
    { icon: Bed, label: apartment.bed_type, value: apartment.bed_type },
    ...(apartment.bathroom_count ? [{
      icon: Bath,
      label: `${apartment.bathroom_count} ${apartment.bathroom_count === 1 ? t('bathroom') : t('bathrooms')}`,
      value: apartment.bathroom_count
    }] : []),
    ...(apartment.size_sqm ? [{ icon: Maximize, label: `${apartment.size_sqm} m²`, value: apartment.size_sqm }] : []),
    ...(apartment.floor !== null && apartment.floor !== undefined ? [{
      icon: Building2,
      label: apartment.floor === 0
        ? (({ sr: 'Prizemlje', en: 'Ground floor', de: 'Erdgeschoss', it: 'Piano terra' }) as Record<string, string>)[locale]
        : `${t('floor')} ${apartment.floor}`,
      value: apartment.floor
    }] : []),
    ...(apartment.balcony === true ? [{ icon: Palmtree, label: t('balcony'), value: true }] : []),
  ]

  const visibleAmenityIds = (apartment.selected_amenities || []).filter((amenityId) => {
    return amenityId !== 'balcony' || apartment.balcony === true
  })

  const selectedAmenityOptions = getSelectedOptions(AMENITY_OPTIONS, visibleAmenityIds)

  const amenityIconMap: Record<string, typeof Wifi> = {
    wifi: Wifi,
    tv: Tv,
    smart_tv: Tv,
    ac: Wind,
    heating: Wind,
    kitchen: Coffee,
    kitchenette: Coffee,
    fridge: Coffee,
    microwave: Coffee,
    coffee_maker: Coffee,
    dishwasher: CheckCircle2,
    washing_machine: CheckCircle2,
    hair_dryer: Wind,
    towels: Bath,
    balcony: Palmtree,
    terrace: Palmtree,
    garden: Palmtree,
    parking: Car,
    garage: Car,
    elevator: Building2,
    safe: CheckCircle2,
    smoke_detector: CheckCircle2,
    first_aid: CheckCircle2,
    iron: CheckCircle2,
    bed_linen: Bed,
    hangers: CheckCircle2,
  }

  const amenitiesList = selectedAmenityOptions.map(option => ({
    icon: amenityIconMap[option.id] || Coffee,
    label: option.label[locale]
  }))

  const selectedViewOption = apartment.selected_view
    ? VIEW_OPTIONS.find(v => v.id === apartment.selected_view)
    : null

  const viewIconMap: Record<string, typeof Mountain> = {
    'lake_view': Eye,
    'sea_view': Eye,
    'mountain_view': Mountain,
    'city_view': Building2,
    'garden_view': Palmtree,
    'forest_view': Palmtree,
    'courtyard_view': Building2,
    'street_view': Building2,
  }

  const nextImage = () => {
    setSelectedImage((prev) => (prev + 1) % apartment.images.length)
  }

  const prevImage = () => {
    setSelectedImage((prev) => (prev - 1 + apartment.images.length) % apartment.images.length)
  }

  return (
    <div className="min-h-screen">
      {/* Hero / Image Grid */}
      <div className="bg-black/30 backdrop-blur-sm">
        <div className="container mx-auto px-4 pt-24 sm:pt-28 lg:pt-32 pb-8">
          {/* Title */}
          <h1
            className="font-extrabold text-white text-shadow-strong mb-2"
            style={{ fontSize: 'clamp(1.5rem, 3vw, 2.5rem)' }}
          >
            {apartment.name}
          </h1>
          {(apartment.city || apartment.country) && (
            <div className="flex items-center gap-1.5 text-white/85 text-shadow-light text-sm mb-6">
              <MapPin className="h-4 w-4" />
              <span>
                {[apartment.address, apartment.city, apartment.postal_code, apartment.country].filter(Boolean).join(', ')}
              </span>
            </div>
          )}

          {/* Image Grid */}
          <div className="grid grid-cols-4 gap-1 sm:gap-2 rounded-xl overflow-hidden h-[250px] sm:h-[350px] md:h-[400px] lg:h-[500px]">
            <div
              className="col-span-4 md:col-span-2 row-span-2 relative cursor-pointer group"
              onClick={() => setShowGallery(true)}
            >
              <Image
                src={apartment.images[0] || 'https://images.unsplash.com/photo-1493809842364-78817add7ffb?auto=format&fit=crop&w=800&q=80'}
                alt={apartment.name}
                fill
                sizes="(max-width: 768px) 100vw, 50vw"
                className="object-cover group-hover:brightness-90 transition"
              />
            </div>

            {apartment.images.slice(1, 5).map((image, idx) => (
              <div
                key={idx}
                className="col-span-2 md:col-span-1 relative cursor-pointer group"
                onClick={() => {
                  setSelectedImage(idx + 1)
                  setShowGallery(true)
                }}
              >
                <Image
                  src={image}
                  alt={`${apartment.name} - ${t('imageAlt')} ${idx + 2}`}
                  fill
                  sizes="(max-width: 768px) 50vw, 25vw"
                  className="object-cover group-hover:brightness-90 transition"
                />
                {idx === 3 && apartment.images.length > 5 && (
                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                    <span className="text-white font-semibold">+{apartment.images.length - 5} {t('imageAlt')}</span>
                  </div>
                )}
              </div>
            ))}
          </div>

          <button
            onClick={() => setShowGallery(true)}
            className="cta-pill secondary mt-4 text-sm px-6 py-2"
          >
            {t('showAllImages')} ({apartment.images.length})
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-6">
            {/* Quick Info */}
            <div className="bg-white/85 backdrop-blur-md rounded-2xl p-6 shadow-lg border border-white/40">
              <h2 className="text-2xl font-bold mb-4 text-foreground">{t('basicInfo')}</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {features.map((feature, idx) => (
                  <div key={idx} className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                      <feature.icon className="h-5 w-5 text-primary" />
                    </div>
                    <p className="text-sm text-foreground font-medium">{feature.label}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Description */}
            <div className="bg-white/85 backdrop-blur-md rounded-2xl p-6 shadow-lg border border-white/40">
              <h2 className="text-2xl font-bold mb-4 text-foreground">{t('about')}</h2>
              <p className="text-muted-foreground leading-relaxed whitespace-pre-line">
                {apartment.description}
              </p>
            </div>

            {/* Amenities */}
            <div className="bg-white/85 backdrop-blur-md rounded-2xl p-6 shadow-lg border border-white/40">
              <h2 className="text-2xl font-bold mb-4 text-foreground">{t('amenitiesTitle')}</h2>

              {amenitiesList.length > 0 && (
                <div className="mb-6">
                  <h3 className="font-semibold mb-3 text-foreground">{t('basicAmenities')}</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {amenitiesList.map((amenity, idx: number) => {
                      const IconComponent = amenity.icon
                      return (
                        <div key={idx} className="flex items-center gap-3">
                          <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0" />
                          <IconComponent className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                          <span className="text-foreground">{amenity.label}</span>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}

              {apartment.kitchen_type && (
                <div className={apartment.selected_view ? "mb-6" : ""}>
                  <h3 className="font-semibold mb-2 text-foreground">{t('kitchenTitle')}</h3>
                  <p className="text-muted-foreground">{apartment.kitchen_type}</p>
                </div>
              )}

              {selectedViewOption && (
                <div>
                  <h3 className="font-semibold mb-2 text-foreground">{t('viewTitle')}</h3>
                  <div className="flex items-center gap-2">
                    {(() => {
                      const ViewIcon = viewIconMap[selectedViewOption.id] || Eye
                      return <ViewIcon className="h-5 w-5 text-primary" />
                    })()}
                    <span className="text-muted-foreground">{selectedViewOption.label[locale]}</span>
                  </div>
                </div>
              )}
            </div>

            {/* House Rules */}
            <div className="bg-white/85 backdrop-blur-md rounded-2xl p-6 shadow-lg border border-white/40">
              <h2 className="text-2xl font-bold mb-4 text-foreground">{t('houseRules')}</h2>
              <div className="space-y-3">
                {apartment.check_in_time && (
                  <div className="flex items-center gap-3">
                    <Clock className="h-5 w-5 text-primary" />
                    <span className="text-muted-foreground">{t('checkIn')}: {apartment.check_in_time}</span>
                  </div>
                )}
                {apartment.check_out_time && (
                  <div className="flex items-center gap-3">
                    <Clock className="h-5 w-5 text-primary" />
                    <span className="text-muted-foreground">{t('checkOut')} {apartment.check_out_time}</span>
                  </div>
                )}
                {(apartment.min_stay_nights ?? 0) > 0 && (
                  <div className="flex items-center gap-3">
                    <Calendar className="h-5 w-5 text-primary" />
                    <span className="text-muted-foreground">{t('minStay')}: {apartment.min_stay_nights} {apartment.min_stay_nights === 1 ? t('night') : t('nights')}</span>
                  </div>
                )}
                {(apartment.max_stay_nights ?? 0) > 0 && (
                  <div className="flex items-center gap-3">
                    <Calendar className="h-5 w-5 text-primary" />
                    <span className="text-muted-foreground">{t('maxStay')}: {apartment.max_stay_nights} {t('nights')}</span>
                  </div>
                )}
                {apartment.selected_rules && apartment.selected_rules.length > 0 &&
                  getSelectedOptions(RULE_OPTIONS, apartment.selected_rules).map((rule) => {
                    const isProhibition = rule.id.startsWith('no_')
                    const RuleIcon = isProhibition ? XCircle : CheckCircle2
                    return (
                      <div key={rule.id} className="flex items-center gap-3">
                        <RuleIcon className={isProhibition ? 'h-5 w-5 text-red-500 shrink-0' : 'h-5 w-5 text-green-600 shrink-0'} />
                        <span className="text-muted-foreground">{rule.label[locale]}</span>
                      </div>
                    )
                  })}
              </div>

              {apartment.house_rules && (
                <div className="mt-6 pt-6 border-t border-border">
                  <p className="text-muted-foreground leading-relaxed whitespace-pre-line">{apartment.house_rules}</p>
                </div>
              )}

              <div className="mt-6 pt-6 border-t border-border">
                <Link href={`/${locale}/terms`} className="text-primary font-semibold hover:underline">
                  {(({ sr: 'Pun kućni red i uslovi korišćenja', en: 'Full house rules & terms of use', de: 'Vollständige Hausordnung & Nutzungsbedingungen', it: 'Regolamento completo e termini' }) as Record<string, string>)[locale] || 'Uslovi'} →
                </Link>
              </div>
            </div>

            {/* Cancellation Policy */}
            {apartment.cancellation_policy && (
              <div className="bg-white/85 backdrop-blur-md rounded-2xl p-6 shadow-lg border border-white/40">
                <h2 className="text-2xl font-bold mb-4 text-foreground">{t('cancellationPolicy')}</h2>
                <p className="text-muted-foreground leading-relaxed whitespace-pre-line">{apartment.cancellation_policy}</p>
              </div>
            )}

            {/* Video & Virtual Tour */}
            {(apartment.video_url || apartment.virtual_tour_url) && (
              <div className="bg-white/85 backdrop-blur-md rounded-2xl p-6 shadow-lg border border-white/40">
                <h2 className="text-2xl font-bold mb-4 text-foreground">{t('videoTour')}</h2>
                <div className="space-y-4">
                  {apartment.video_url && (
                    <div>
                      <h3 className="font-semibold mb-2 flex items-center gap-2 text-foreground">
                        <Video className="h-5 w-5 text-primary" />
                        {t('videoPresentation')}
                      </h3>
                      <div className="aspect-video rounded-xl overflow-hidden">
                        <iframe
                          src={apartment.video_url.replace('watch?v=', 'embed/')}
                          className="w-full h-full"
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                          allowFullScreen
                        />
                      </div>
                    </div>
                  )}
                  {apartment.virtual_tour_url && (
                    <div>
                      <h3 className="font-semibold mb-2 flex items-center gap-2 text-foreground">
                        <Globe className="h-5 w-5 text-primary" />
                        {t('virtualTour')}
                      </h3>
                      <div className="aspect-video rounded-xl overflow-hidden">
                        <iframe
                          src={apartment.virtual_tour_url}
                          className="w-full h-full"
                          allowFullScreen
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Location Map */}
            {apartment.latitude && apartment.longitude && (
              <div className="bg-white/85 backdrop-blur-md rounded-2xl p-6 shadow-lg border border-white/40">
                <h2 className="text-2xl font-bold mb-4 text-foreground">{t('location')}</h2>
                {apartment.address && (
                  <p className="text-muted-foreground mb-4">
                    {[apartment.address, apartment.city, apartment.postal_code, apartment.country].filter(Boolean).join(', ')}
                  </p>
                )}
                <ApartmentMap
                  latitude={apartment.latitude}
                  longitude={apartment.longitude}
                  name={apartment.name}
                  address={apartment.address || undefined}
                />
              </div>
            )}
          </div>

          {/* Right Column - Booking CTA */}
          <div className="lg:col-span-1">
            <div className="bg-white/85 backdrop-blur-md rounded-2xl p-6 shadow-lg border border-white/40 sticky top-4">
              <div className="mb-6">
                <div className="flex items-baseline gap-2 mb-2">
                  <span className="text-4xl font-black text-primary">€{apartment.base_price_eur}</span>
                  <span className="text-muted-foreground text-sm">{t('pricePerNight')}</span>
                </div>
                {(apartment.weekend_price_eur ?? 0) > 0 && apartment.weekend_price_eur !== apartment.base_price_eur && (
                  <p className="text-sm text-muted-foreground">
                    {t('weekend')}: €{apartment.weekend_price_eur} {t('pricePerNight')}
                  </p>
                )}
              </div>

              {/* Discounts */}
              {(apartment.weekly_discount_percent || apartment.monthly_discount_percent) && (
                <div className="mb-6 p-4 bg-green-50 rounded-xl border border-green-100">
                  <h3 className="font-semibold mb-2 flex items-center gap-2 text-foreground">
                    <Percent className="h-4 w-4 text-green-600" />
                    {t('discounts')}
                  </h3>
                  <div className="space-y-1 text-sm">
                    {(apartment.weekly_discount_percent ?? 0) > 0 && (
                      <p className="text-muted-foreground">{t('weeklyDiscount')}: -{apartment.weekly_discount_percent}%</p>
                    )}
                    {(apartment.monthly_discount_percent ?? 0) > 0 && (
                      <p className="text-muted-foreground">{t('monthlyDiscount')}: -{apartment.monthly_discount_percent}%</p>
                    )}
                  </div>
                </div>
              )}

              {/* Seasonal Pricing */}
              {apartment.seasonal_pricing && apartment.seasonal_pricing.length > 0 && (
                <div className="mb-6">
                  <h3 className="font-semibold mb-3 flex items-center gap-2 text-foreground">
                    <Euro className="h-4 w-4 text-primary" />
                    {t('seasonalPrices')}
                  </h3>
                  <div className="space-y-2">
                    {apartment.seasonal_pricing.map((season, idx) => (
                      <div key={idx} className="text-sm p-3 bg-zinc-50 rounded-xl border border-zinc-100">
                        <div className="font-semibold text-foreground">{season.season}</div>
                        <div className="text-muted-foreground text-xs mt-0.5">
                          {new Date(season.start_date).toLocaleDateString(locale)} - {new Date(season.end_date).toLocaleDateString(locale)}
                        </div>
                        <div className="font-black text-primary mt-0.5">€{season.price_eur} {t('pricePerNight')}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <Link href={`/${locale}/booking?apartment=${apartment.slug || apartment.id}`}>
                <button className="cta-pill primary w-full text-base py-4">
                  {t('checkAvailability')}
                </button>
              </Link>

              <p className="text-center text-xs text-muted-foreground mt-4">
                {t('selectDates')}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Gallery Modal (lightbox) */}
      {showGallery && (
        <div
          className="fixed inset-0 z-[1100] bg-black/95"
          onClick={() => setShowGallery(false)}
          role="dialog"
          aria-modal="true"
        >
          <div className="relative h-full flex items-center justify-center">
            <button
              onClick={(e) => { e.stopPropagation(); setShowGallery(false) }}
              className="absolute top-4 right-4 text-white hover:text-gray-300 z-20 w-12 h-12 bg-white/20 rounded-full flex items-center justify-center hover:bg-white/30 transition-colors"
              aria-label="Close gallery"
            >
              <X className="h-6 w-6" />
            </button>

            <button
              onClick={(e) => { e.stopPropagation(); prevImage() }}
              className="absolute left-4 text-white hover:text-gray-300 z-20 w-12 h-12 bg-white/20 rounded-full flex items-center justify-center hover:bg-white/30 transition-colors"
              aria-label="Previous image"
            >
              <ChevronLeft className="h-8 w-8" />
            </button>

            <div
              className="relative w-[90vw] h-[82vh] max-w-6xl"
              onClick={(e) => e.stopPropagation()}
            >
              <Image
                src={apartment.images[selectedImage]}
                alt={`${apartment.name} - ${t('imageAlt')} ${selectedImage + 1}`}
                fill
                sizes="100vw"
                className="object-contain"
              />
            </div>

            <button
              onClick={(e) => { e.stopPropagation(); nextImage() }}
              className="absolute right-4 text-white hover:text-gray-300 z-20 w-12 h-12 bg-white/20 rounded-full flex items-center justify-center hover:bg-white/30 transition-colors"
              aria-label="Next image"
            >
              <ChevronRight className="h-8 w-8" />
            </button>

            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 text-white/70 text-sm">
              {selectedImage + 1} / {apartment.images.length}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
