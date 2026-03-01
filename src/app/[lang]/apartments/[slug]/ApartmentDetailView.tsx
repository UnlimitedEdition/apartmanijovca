'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useTranslations } from 'next-intl'
import { Button } from '../../components/ui/button'
import ApartmentMap from '@/components/apartments/ApartmentMap'
import Breadcrumb from '@/components/Breadcrumb'
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
import { AMENITY_OPTIONS, VIEW_OPTIONS, getSelectedOptions } from '@/lib/apartment-options'

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
  
  // Enhanced fields
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
  
  // Localized JSONB fields
  kitchen_type?: string | null
  house_rules?: string | null
  cancellation_policy?: string | null
  view_type?: string | null
  
  // JSONB arrays
  features?: string[]
  gallery?: Array<{url: string; caption: Json; order: number}>
  seasonal_pricing?: Array<{season: string; start_date: string; end_date: string; price_eur: number}>
  
  // Checkbox selections
  bed_counts?: Record<string, number> | null
  selected_amenities?: string[] | null
  selected_rules?: string[] | null
  selected_view?: string | null
  
  // Location fields
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
  const commonT = useTranslations('common')
  const apartmentsT = useTranslations('apartments')
  const [selectedImage, setSelectedImage] = useState(0)
  const [showGallery, setShowGallery] = useState(false)

  // Breadcrumb items
  const breadcrumbItems = [
    { label: commonT('home'), href: `/${locale}` },
    { label: apartmentsT('title'), href: `/${locale}/apartments` },
    { label: apartment.name, current: true }
  ]

  // Build features from database data
  const features = [
    { icon: Users, label: `${apartment.capacity} ${t('guests')}`, value: apartment.capacity },
    { icon: Bed, label: apartment.bed_type, value: apartment.bed_type },
    ...(apartment.bathroom_count ? [{ 
      icon: Bath, 
      label: `${apartment.bathroom_count} ${apartment.bathroom_count === 1 ? t('bathroom') : t('bathrooms')}`, 
      value: apartment.bathroom_count 
    }] : []),
    ...(apartment.size_sqm ? [{ icon: Maximize, label: `${apartment.size_sqm} m²`, value: apartment.size_sqm }] : []),
    ...(apartment.floor !== null && apartment.floor !== undefined ? [{ 
      icon: Building2, 
      label: `${t('floor')} ${apartment.floor}`, 
      value: apartment.floor 
    }] : []),
    ...(apartment.balcony ? [{ icon: Palmtree, label: t('balcony'), value: true }] : []),
  ]

  // Get amenities from selected_amenities using AMENITY_OPTIONS
  const selectedAmenityOptions = apartment.selected_amenities 
    ? getSelectedOptions(AMENITY_OPTIONS, apartment.selected_amenities)
    : []

  // Map amenity IDs to icons
  const amenityIconMap: Record<string, typeof Wifi> = {
    'wifi': Wifi,
    'parking': Car,
    'ac': Wind,
    'tv': Tv,
    'smart_tv': Tv,
    'kitchen': Coffee,
    'kitchenette': Coffee,
  }

  // Build amenities list with proper localization
  const amenitiesList = selectedAmenityOptions.map(option => ({
    icon: amenityIconMap[option.id] || Coffee,
    label: option.label[locale]
  }))

  // Get view option with proper localization
  const selectedViewOption = apartment.selected_view 
    ? VIEW_OPTIONS.find(v => v.id === apartment.selected_view)
    : null

  // View icon mapping
  const viewIconMap: Record<string, typeof Mountain> = {
    'lake_view': Eye,
    'sea_view': Eye,
    'mountain_view': Mountain,
    'city_view': Building2,
    'garden_view': Palmtree,
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
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-white">
        <div className="container mx-auto px-4 py-6">
          {/* Breadcrumb */}
          <Breadcrumb items={breadcrumbItems} />

          {/* Title */}
          <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900 mb-2">{apartment.name}</h1>
          <div className="flex flex-wrap items-center gap-2 sm:gap-4 text-xs sm:text-sm text-gray-600 mb-4 sm:mb-6">
            {(apartment.city || apartment.country) && (
              <div className="flex items-center gap-1">
                <MapPin className="h-3 w-3 sm:h-4 sm:w-4" />
                <span className="text-[10px] sm:text-sm">
                  {[apartment.address, apartment.city, apartment.postal_code, apartment.country].filter(Boolean).join(', ')}
                </span>
              </div>
            )}
          </div>

          {/* Image Grid */}
          <div className="grid grid-cols-4 gap-1 sm:gap-2 rounded-lg sm:rounded-xl overflow-hidden h-[250px] sm:h-[350px] md:h-[400px] lg:h-[500px]">
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

          <Button
            variant="outline"
            className="mt-4"
            onClick={() => setShowGallery(true)}
          >
            {t('showAllImages')} ({apartment.images.length})
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Details */}
          <div className="lg:col-span-2 space-y-8">
            {/* Quick Info */}
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <h2 className="text-2xl font-bold mb-4">{t('basicInfo')}</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {features.map((feature, idx) => (
                  <div key={idx} className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center flex-shrink-0">
                      <feature.icon className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-700">{feature.label}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Bed Counts Details */}
              {apartment.bed_counts && Object.keys(apartment.bed_counts).length > 0 && (
                <div className="mt-6 pt-6 border-t">
                  <h3 className="font-semibold mb-3">{t('bedDetails')}</h3>
                  <div className="grid grid-cols-2 gap-3">
                    {Object.entries(apartment.bed_counts).map(([bedId, count]) => {
                      const bedLabels: Record<string, string> = {
                        'double_bed': t('doubleBed'),
                        'single_bed': t('singleBed'),
                        'sofa_bed': t('sofaBed'),
                        'bunk_bed': t('bunkBed'),
                      }
                      return (
                        <div key={bedId} className="flex items-center gap-2">
                          <Bed className="h-4 w-4 text-gray-600" />
                          <span className="text-sm">{count}x {bedLabels[bedId] || bedId}</span>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* Description */}
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <h2 className="text-2xl font-bold mb-4">{t('about')}</h2>
              <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                {apartment.description}
              </p>
            </div>

            {/* Amenities & Features */}
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <h2 className="text-2xl font-bold mb-4">{t('amenitiesTitle')}</h2>
              
              {/* Selected Amenities */}
              {amenitiesList.length > 0 && (
                <div className="mb-6">
                  <h3 className="font-semibold mb-3">{t('basicAmenities')}</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {amenitiesList.map((amenity, idx: number) => {
                      const IconComponent = amenity.icon
                      return (
                        <div key={idx} className="flex items-center gap-3">
                          <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0" />
                          <IconComponent className="h-5 w-5 text-gray-600 flex-shrink-0" />
                          <span className="text-gray-900">{amenity.label}</span>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}

              {/* Kitchen Type */}
              {apartment.kitchen_type && (
                <div className={apartment.selected_view ? "mb-6" : ""}>
                  <h3 className="font-semibold mb-2">{t('kitchenTitle')}</h3>
                  <p className="text-gray-700">{apartment.kitchen_type}</p>
                </div>
              )}

              {/* View Type */}
              {selectedViewOption && (
                <div>
                  <h3 className="font-semibold mb-2">{t('viewTitle')}</h3>
                  <div className="flex items-center gap-2">
                    {(() => {
                      const ViewIcon = viewIconMap[selectedViewOption.id] || Eye
                      return <ViewIcon className="h-5 w-5 text-blue-600" />
                    })()}
                    <span className="text-gray-700">{selectedViewOption.label[locale]}</span>
                  </div>
                </div>
              )}
            </div>

            {/* House Rules */}
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <h2 className="text-2xl font-bold mb-4">{t('houseRules')}</h2>
              <div className="space-y-3">
                {apartment.check_in_time && (
                  <div className="flex items-center gap-3">
                    <Clock className="h-5 w-5 text-gray-600" />
                    <span className="text-gray-700">{t('checkIn')}: {apartment.check_in_time}</span>
                  </div>
                )}
                {apartment.check_out_time && (
                  <div className="flex items-center gap-3">
                    <Clock className="h-5 w-5 text-gray-600" />
                    <span className="text-gray-700">{t('checkOut')} {apartment.check_out_time}</span>
                  </div>
                )}
                {apartment.min_stay_nights && (
                  <div className="flex items-center gap-3">
                    <Calendar className="h-5 w-5 text-gray-600" />
                    <span className="text-gray-700">{t('minStay')}: {apartment.min_stay_nights} {apartment.min_stay_nights === 1 ? t('night') : t('nights')}</span>
                  </div>
                )}
                {apartment.max_stay_nights && apartment.max_stay_nights > 0 && (
                  <div className="flex items-center gap-3">
                    <Calendar className="h-5 w-5 text-gray-600" />
                    <span className="text-gray-700">{t('maxStay')}: {apartment.max_stay_nights} {t('nights')}</span>
                  </div>
                )}
                
                {/* Selected Rules */}
                {apartment.selected_rules?.includes('no_smoking') && (
                  <div className="flex items-center gap-3">
                    <XCircle className="h-5 w-5 text-red-600" />
                    <span className="text-gray-700">{t('noSmoking')}</span>
                  </div>
                )}
                {apartment.selected_rules?.includes('pets_allowed') && (
                  <div className="flex items-center gap-3">
                    <CheckCircle2 className="h-5 w-5 text-green-600" />
                    <span className="text-gray-700">{t('petsAllowed')}</span>
                  </div>
                )}
                {apartment.selected_rules?.includes('quiet_hours_22') && (
                  <div className="flex items-center gap-3">
                    <Clock className="h-5 w-5 text-gray-600" />
                    <span className="text-gray-700">{t('quietHours')}</span>
                  </div>
                )}
              </div>

              {/* House Rules Text */}
              {apartment.house_rules && (
                <div className="mt-6 pt-6 border-t">
                  <p className="text-gray-700 leading-relaxed whitespace-pre-line">{apartment.house_rules}</p>
                </div>
              )}
            </div>

            {/* Cancellation Policy */}
            {apartment.cancellation_policy && (
              <div className="bg-white rounded-xl p-6 shadow-sm">
                <h2 className="text-2xl font-bold mb-4">{t('cancellationPolicy')}</h2>
                <p className="text-gray-700 leading-relaxed whitespace-pre-line">{apartment.cancellation_policy}</p>
              </div>
            )}

            {/* Video & Virtual Tour */}
            {(apartment.video_url || apartment.virtual_tour_url) && (
              <div className="bg-white rounded-xl p-6 shadow-sm">
                <h2 className="text-2xl font-bold mb-4">{t('videoTour')}</h2>
                <div className="space-y-4">
                  {apartment.video_url && (
                    <div>
                      <h3 className="font-semibold mb-2 flex items-center gap-2">
                        <Video className="h-5 w-5" />
                        {t('videoPresentation')}
                      </h3>
                      <div className="aspect-video rounded-lg overflow-hidden">
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
                      <h3 className="font-semibold mb-2 flex items-center gap-2">
                        <Globe className="h-5 w-5" />
                        {t('virtualTour')}
                      </h3>
                      <div className="aspect-video rounded-lg overflow-hidden">
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
              <div className="bg-white rounded-xl p-6 shadow-sm">
                <h2 className="text-2xl font-bold mb-4">{t('location')}</h2>
                {apartment.address && (
                  <p className="text-gray-700 mb-4">
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
            <div className="bg-white rounded-xl p-6 shadow-lg sticky top-4">
              <div className="mb-6">
                <div className="flex items-baseline gap-2 mb-2">
                  <span className="text-3xl font-bold text-gray-900">€{apartment.base_price_eur}</span>
                  <span className="text-gray-600">{t('pricePerNight')}</span>
                </div>
                {apartment.weekend_price_eur && apartment.weekend_price_eur > 0 && apartment.weekend_price_eur !== apartment.base_price_eur && (
                  <p className="text-sm text-gray-600">
                    {t('weekend')}: €{apartment.weekend_price_eur} {t('pricePerNight')}
                  </p>
                )}
              </div>

              {/* Discounts */}
              {(apartment.weekly_discount_percent || apartment.monthly_discount_percent) && (
                <div className="mb-6 p-4 bg-green-50 rounded-lg">
                  <h3 className="font-semibold mb-2 flex items-center gap-2">
                    <Percent className="h-4 w-4 text-green-600" />
                    {t('discounts')}
                  </h3>
                  <div className="space-y-1 text-sm">
                    {apartment.weekly_discount_percent && apartment.weekly_discount_percent > 0 && (
                      <p className="text-gray-700">{t('weeklyDiscount')}: -{apartment.weekly_discount_percent}%</p>
                    )}
                    {apartment.monthly_discount_percent && apartment.monthly_discount_percent > 0 && (
                      <p className="text-gray-700">{t('monthlyDiscount')}: -{apartment.monthly_discount_percent}%</p>
                    )}
                  </div>
                </div>
              )}

              {/* Seasonal Pricing */}
              {apartment.seasonal_pricing && apartment.seasonal_pricing.length > 0 && (
                <div className="mb-6">
                  <h3 className="font-semibold mb-3 flex items-center gap-2">
                    <Euro className="h-4 w-4" />
                    {t('seasonalPrices')}
                  </h3>
                  <div className="space-y-2">
                    {apartment.seasonal_pricing.map((season, idx) => (
                      <div key={idx} className="text-sm p-2 bg-gray-50 rounded">
                        <div className="font-medium">{season.season}</div>
                        <div className="text-gray-600 text-xs">
                          {new Date(season.start_date).toLocaleDateString(locale)} - {new Date(season.end_date).toLocaleDateString(locale)}
                        </div>
                        <div className="font-semibold text-blue-600">€{season.price_eur} {t('pricePerNight')}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <Link href={`/${locale}/booking?apartment=${apartment.slug || apartment.id}`}>
                <Button className="w-full h-14 text-lg bg-blue-600 hover:bg-blue-700 font-bold">
                  {t('checkAvailability')}
                </Button>
              </Link>

              <p className="text-center text-xs text-gray-500 mt-4">
                {t('selectDates')}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Gallery Modal */}
      {showGallery && (
        <div className="fixed inset-0 z-50 bg-black">
          <div className="relative h-full flex items-center justify-center">
            <button
              onClick={() => setShowGallery(false)}
              className="absolute top-4 right-4 text-white hover:text-gray-300 z-10"
            >
              <X className="h-8 w-8" />
            </button>

            <button
              onClick={prevImage}
              className="absolute left-4 text-white hover:text-gray-300 z-10"
            >
              <ChevronLeft className="h-12 w-12" />
            </button>

            <div className="relative w-full h-full max-w-6xl max-h-[90vh] mx-4">
              <Image
                src={apartment.images[selectedImage]}
                alt={`${apartment.name} - ${t('imageAlt')} ${selectedImage + 1}`}
                fill
                sizes="100vw"
                className="object-contain"
              />
            </div>

            <button
              onClick={nextImage}
              className="absolute right-4 text-white hover:text-gray-300 z-10"
            >
              <ChevronRight className="h-12 w-12" />
            </button>

            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 text-white">
              {selectedImage + 1} / {apartment.images.length}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
