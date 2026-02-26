'use client'

import { useState, useEffect, useCallback } from 'react'
import { useSearchParams, useParams } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { Button } from '../components/ui/button'
import { Input } from '../components/ui/input'
import { Textarea } from '../components/ui/textarea'
import { supabase } from '../lib/supabase/client'
import { trackEvent } from '../../../hooks/useAnalytics'
import AvailabilityCalendar from '../../../components/booking/AvailabilityCalendar'
import GDPRConsentBanner from '../../../components/booking/GDPRConsentBanner'
import { getSecurityMetadata } from '../../../lib/security/fingerprint'
import { Apartment } from '../../../hooks/useAvailability'
import { Locale } from '@/lib/types/database'
import { transformApartmentRecord } from '@/lib/transformers/database'
import type { ApartmentRecord } from '@/lib/types/database'
import { AMENITY_OPTIONS, getSelectedOptions } from '@/lib/apartment-options'

interface BookingData {
  checkIn: Date | null
  checkOut: Date | null
  apartment: Apartment | null
  options: {
    crib: boolean
    parking: boolean
    earlyCheckIn: boolean
    specialRequests: string
  }
  contact: {
    name: string
    email: string
    phone: string
  }
  acceptedTerms: boolean
  gdprConsent: boolean
}

export default function BookingFlow() {
  const t = useTranslations('booking')
  const commonT = useTranslations('common')
  const aptT = useTranslations('apartments')
  const searchParams = useSearchParams()
  const params = useParams()
  const locale = params.lang as Locale
  
  const [step, setStep] = useState(1)
  const [showGDPRBanner, setShowGDPRBanner] = useState(false)
  const [bookingData, setBookingData] = useState<BookingData>({
    checkIn: null,
    checkOut: null,
    apartment: null,
    options: {
      crib: false,
      parking: false,
      earlyCheckIn: false,
      specialRequests: ''
    },
    contact: {
      name: '',
      email: '',
      phone: ''
    },
    acceptedTerms: false,
    gdprConsent: false
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [submitSuccess, setSubmitSuccess] = useState(false)
  const [initialApartmentId, setInitialApartmentId] = useState<string | null>(null)

  useEffect(() => {
    const apartmentParam = searchParams.get('apartment')
    if (apartmentParam) {
      setInitialApartmentId(apartmentParam)
      
      // Check if parameter is UUID (ID) or slug
      const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(apartmentParam)
      
      // Query by ID or slug depending on parameter format
      const query = isUUID
        ? supabase.from('apartments').select('*').eq('id', apartmentParam).single()
        : supabase.from('apartments').select('*').eq('slug', apartmentParam).single()
      
      query.then(({ data }) => {
        if (data) {
          const localizedApartment = transformApartmentRecord(data as ApartmentRecord, locale)
          setBookingData(prev => ({ ...prev, apartment: localizedApartment }))
        }
      })
    }
  }, [searchParams, locale])

  const handleDateSelect = useCallback((checkIn: Date, checkOut: Date) => {
    setBookingData(prev => ({ ...prev, checkIn, checkOut }))
  }, [])

  const handleApartmentSelect = useCallback((apartment: Apartment) => {
    setBookingData(prev => ({ ...prev, apartment }))
  }, [])

  const handleNextStep = () => {
    // If moving from step 2 to step 3, show GDPR banner first
    if (step === 2 && !bookingData.gdprConsent) {
      setShowGDPRBanner(true)
      return
    }
    
    trackEvent('booking_step_completed', { step })
    setStep(step + 1)
  }

  const handleGDPRAccept = () => {
    setBookingData(prev => ({ ...prev, gdprConsent: true }))
    setShowGDPRBanner(false)
    // Continue to step 3 after accepting
    trackEvent('gdpr_accepted', { step: 2 })
    trackEvent('booking_step_completed', { step: 2 })
    setStep(3)
  }

  const handleGDPRDecline = () => {
    setShowGDPRBanner(false)
    trackEvent('gdpr_declined', { step: 2 })
    // Redirect to home page if user declines GDPR
    window.location.href = `/${locale}`
  }

  const handlePrevStep = () => {
    setStep(step - 1)
  }

  const handleSubmit = async () => {
    if (!bookingData.apartment || !bookingData.checkIn || !bookingData.checkOut) {
      setSubmitError(t('messages.selectDates'))
      return
    }

    if (!bookingData.acceptedTerms) {
      setSubmitError(t('messages.acceptTermsRequired'))
      return
    }

    // Show GDPR banner if not yet consented
    if (!bookingData.gdprConsent) {
      setShowGDPRBanner(true)
      return
    }

    setIsSubmitting(true)
    setSubmitError(null)

    try {
      trackEvent('booking_submitted', {
        apartmentId: bookingData.apartment.id,
        checkIn: bookingData.checkIn.toISOString(),
        checkOut: bookingData.checkOut.toISOString()
      })

      // Collect security metadata
      const securityMetadata = await getSecurityMetadata()

      const response = await fetch('/api/booking', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          apartmentId: bookingData.apartment.id,
          checkIn: bookingData.checkIn.toISOString().split('T')[0],
          checkOut: bookingData.checkOut.toISOString().split('T')[0],
          guest: {
            name: bookingData.contact.name,
            email: bookingData.contact.email,
            phone: bookingData.contact.phone
          },
          options: {
            crib: bookingData.options.crib,
            parking: bookingData.options.parking,
            earlyCheckIn: bookingData.options.earlyCheckIn,
            notes: bookingData.options.specialRequests
          },
          preferredLanguage: locale, // Language from URL (de, it, en, sr)
          security: {
            fingerprint: securityMetadata.fingerprint,
            userAgent: securityMetadata.userAgent,
            deviceInfo: securityMetadata.deviceInfo,
            consentGiven: true,
            consentTimestamp: new Date().toISOString()
          }
        })
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Booking failed')
      }

      setSubmitSuccess(true)
    } catch (error) {
      console.error('Error submitting booking:', error)
      setSubmitError(t('messages.error'))
    } finally {
      setIsSubmitting(false)
    }
  }

  const nights = bookingData.checkIn && bookingData.checkOut
    ? Math.ceil((bookingData.checkOut.getTime() - bookingData.checkIn.getTime()) / (1000 * 60 * 60 * 24))
    : 0
  
  const totalPrice = bookingData.apartment && nights > 0
    ? nights * bookingData.apartment.base_price_eur
    : 0

  // SUCCESS STATE - Ultra-modern design
  if (submitSuccess) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-white to-gray-50">
        <div className="max-w-3xl mx-auto px-4 py-16">
          {/* Success Icon */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 rounded-full mb-6">
              <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h1 className="text-4xl font-bold text-gray-900 mb-3">{t('messages.success')}</h1>
            <p className="text-lg text-gray-600">{t('messages.successSubtitle')}</p>
          </div>

          {/* Booking Summary */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden mb-6">
            <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">{t('summary.title')}</h2>
            </div>
            <div className="p-6 space-y-4">
              <div className="flex justify-between py-3 border-b border-gray-100">
                <span className="text-sm font-medium text-gray-600">{t('step.apartment')}</span>
                <span className="text-sm font-semibold text-gray-900">{bookingData.apartment?.name}</span>
              </div>
              <div className="flex justify-between py-3 border-b border-gray-100">
                <span className="text-sm font-medium text-gray-600">{t('step.dates')}</span>
                <span className="text-sm font-semibold text-gray-900">
                  {bookingData.checkIn?.toLocaleDateString()} - {bookingData.checkOut?.toLocaleDateString()}
                </span>
              </div>
              <div className="flex justify-between py-3">
                <span className="text-base font-semibold text-gray-900">{t('summary.total')}</span>
                <span className="text-2xl font-bold text-blue-600">€{totalPrice}</span>
              </div>
            </div>
          </div>

          {/* Instructions */}
          <div className="bg-blue-50 rounded-2xl p-6 mb-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">{t('messages.instructionsTitle')}</h3>
            <div className="space-y-3">
              {[1, 2, 3].map((num) => (
                <div key={num} className="flex gap-3">
                  <div className="flex-shrink-0 w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold">
                    {num}
                  </div>
                  <p className="text-sm text-gray-700 pt-0.5">{t(`messages.instructionsStep${num}`)}</p>
                </div>
              ))}
            </div>
          </div>

          <Button 
            onClick={() => window.location.href = '/'}
            className="w-full h-12 bg-gray-900 hover:bg-gray-800 text-white rounded-xl font-medium"
          >
            {commonT('back')}
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-5xl mx-auto px-4 py-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">{t('title')}</h1>
          <p className="text-gray-600">{t('description')}</p>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-8">
        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-between max-w-2xl mx-auto">
            {[
              { num: 1, label: t('step.dates') },
              { num: 2, label: t('step.requests') },
              { num: 3, label: t('step.details') }
            ].map((s, idx) => (
              <div key={s.num} className="flex items-center flex-1">
                <div className="flex flex-col items-center flex-1">
                  <div className={`
                    w-10 h-10 rounded-full flex items-center justify-center font-semibold text-sm mb-2
                    ${step > s.num ? 'bg-green-600 text-white' : step === s.num ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-500'}
                  `}>
                    {step > s.num ? '✓' : s.num}
                  </div>
                  <span className={`text-xs font-medium ${step === s.num ? 'text-blue-600' : 'text-gray-500'}`}>
                    {s.label}
                  </span>
                </div>
                {idx < 2 && (
                  <div className={`h-0.5 flex-1 mx-2 ${step > s.num ? 'bg-green-600' : 'bg-gray-200'}`} />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Error Message */}
        {submitError && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-xl p-4">
            <div className="flex gap-3">
              <svg className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-sm font-medium text-red-800">{submitError}</p>
            </div>
          </div>
        )}

        {/* Step Content */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">

          {/* STEP 1: Dates & Apartment Selection */}
          {step === 1 && (
            <div>
              <div className="bg-gray-50 px-6 py-5 border-b border-gray-200">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                    <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900">{t('step.dates')}</h2>
                    <p className="text-sm text-gray-600">{t('instruction')}</p>
                  </div>
                </div>
              </div>

              <div className="p-6">
                <AvailabilityCalendar
                  onDateSelect={handleDateSelect}
                  onApartmentSelect={handleApartmentSelect}
                  initialCheckIn={bookingData.checkIn || undefined}
                  initialCheckOut={bookingData.checkOut || undefined}
                  initialApartmentId={initialApartmentId || undefined}
                  minNights={1}
                  maxNights={30}
                />

                {bookingData.apartment && bookingData.checkIn && bookingData.checkOut && (
                  <div className="mt-6 bg-blue-50 rounded-xl p-5">
                    <h3 className="text-sm font-semibold text-gray-900 mb-4">{t('summary.preview')}</h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div>
                        <p className="text-xs text-gray-600 mb-1">{t('step.apartment')}</p>
                        <p className="text-sm font-semibold text-gray-900">{bookingData.apartment.name}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-600 mb-1">{t('summary.stay')}</p>
                        <p className="text-sm font-semibold text-gray-900">
                          {nights} {nights === 1 ? t('night') : t('nights')}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-600 mb-1">{aptT('guests')}</p>
                        <p className="text-sm font-semibold text-gray-900">{bookingData.apartment.capacity}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-600 mb-1">{t('summary.total')}</p>
                        <p className="text-lg font-bold text-blue-600">€{totalPrice}</p>
                      </div>
                    </div>
                  </div>
                )}

                <Button
                  onClick={handleNextStep}
                  disabled={!bookingData.checkIn || !bookingData.checkOut || !bookingData.apartment}
                  className="w-full h-12 mt-6 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {commonT('next')}
                </Button>
              </div>
            </div>
          )}

          {/* STEP 2: Special Requests */}
          {step === 2 && (
            <div>
              <div className="bg-gray-50 px-6 py-5 border-b border-gray-200">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                    <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
                    </svg>
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900">{t('requestsTitle')}</h2>
                    <p className="text-sm text-gray-600">{t('requestsDescription')}</p>
                  </div>
                </div>
              </div>

              <div className="p-6 space-y-6">
                {/* Apartment Amenities - Dynamic from Database */}
                {bookingData.apartment?.selected_amenities && bookingData.apartment.selected_amenities.length > 0 && (
                  <div className="bg-blue-50 rounded-xl p-5">
                    <div className="flex gap-3">
                      <svg className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <div className="text-sm text-gray-700 flex-1">
                        <p className="font-semibold mb-2">{t('included.title')}</p>
                        <ul className="grid grid-cols-1 md:grid-cols-2 gap-2">
                          {(() => {
                            // Get matching options with translations
                            const selectedAmenities = getSelectedOptions(AMENITY_OPTIONS, bookingData.apartment.selected_amenities || [])
                            // Display in current language
                            return selectedAmenities.map((amenity, idx) => (
                              <li key={idx} className="flex items-start gap-2">
                                <span className="text-green-600 font-bold mt-0.5">✓</span>
                                <span>{amenity.label[locale]}</span>
                              </li>
                            ))
                          })()}
                        </ul>
                      </div>
                    </div>
                  </div>
                )}

                {/* Fallback if no amenities defined */}
                {(!bookingData.apartment?.selected_amenities || bookingData.apartment.selected_amenities.length === 0) && (
                  <div className="bg-blue-50 rounded-xl p-5">
                    <div className="flex gap-3">
                      <svg className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <div className="text-sm text-gray-700">
                        <p className="font-semibold mb-1">{t('included.title')}</p>
                        <ul className="space-y-1">
                          <li>✓ {t('included.parking')}</li>
                          <li>✓ {t('included.wifi')}</li>
                          <li>✓ {t('included.linens')}</li>
                          <li>✓ {t('included.kitchen')}</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                )}

                {/* Special Requests */}
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">
                    {t('requestsPlaceholder')}
                  </label>
                  <Textarea
                    value={bookingData.options.specialRequests}
                    onChange={(e) => setBookingData({
                      ...bookingData,
                      options: { ...bookingData.options, specialRequests: e.target.value }
                    })}
                    placeholder={t('requestsPlaceholder')}
                    className="w-full rounded-xl border-gray-300 focus:border-blue-500 focus:ring-blue-500 min-h-[150px]"
                  />
                  <p className="text-xs text-gray-500 mt-2">
                    {t('requestsNote')}
                  </p>
                </div>

                {/* Navigation */}
                <div className="flex gap-3 pt-4">
                  <Button
                    onClick={handlePrevStep}
                    variant="outline"
                    className="flex-1 h-12 border-gray-300 hover:bg-gray-50 rounded-xl font-medium"
                  >
                    {commonT('back')}
                  </Button>
                  <Button
                    onClick={handleNextStep}
                    className="flex-1 h-12 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium"
                  >
                    {commonT('next')}
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: Contact Details */}
          {step === 3 && (
            <div>
              <div className="bg-gray-50 px-6 py-5 border-b border-gray-200">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                    <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900">{t('step.details')}</h2>
                    <p className="text-sm text-gray-600">{t('detailsInstruction')}</p>
                  </div>
                </div>
              </div>

              <div className="p-6 space-y-6">
                {/* Contact Form */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="guest-name" className="block text-sm font-semibold text-gray-900 mb-2">
                      {t('form.firstName')}
                    </label>
                    <Input
                      id="guest-name"
                      name="name"
                      type="text"
                      autoComplete="name"
                      value={bookingData.contact.name}
                      onChange={(e) => setBookingData({
                        ...bookingData,
                        contact: { ...bookingData.contact, name: e.target.value }
                      })}
                      className="h-11 rounded-xl border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                      required
                    />
                  </div>
                  <div>
                    <label htmlFor="guest-phone" className="block text-sm font-semibold text-gray-900 mb-2">
                      {t('form.phone')}
                    </label>
                    <Input
                      id="guest-phone"
                      name="tel"
                      type="tel"
                      autoComplete="tel"
                      value={bookingData.contact.phone}
                      onChange={(e) => setBookingData({
                        ...bookingData,
                        contact: { ...bookingData.contact, phone: e.target.value }
                      })}
                      className="h-11 rounded-xl border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                      required
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label htmlFor="guest-email" className="block text-sm font-semibold text-gray-900 mb-2">
                      {t('form.email')}
                    </label>
                    <Input
                      id="guest-email"
                      name="email"
                      type="email"
                      autoComplete="email"
                      value={bookingData.contact.email}
                      onChange={(e) => setBookingData({
                        ...bookingData,
                        contact: { ...bookingData.contact, email: e.target.value }
                      })}
                      className="h-11 rounded-xl border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                      required
                    />
                  </div>
                </div>

                {/* Booking Summary */}
                <div className="bg-gray-50 rounded-xl p-5">
                  <h3 className="text-sm font-semibold text-gray-900 mb-4">{t('summary.title')}</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">{t('step.apartment')}</span>
                      <span className="font-semibold text-gray-900">{bookingData.apartment?.name}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">{t('step.dates')}</span>
                      <span className="font-semibold text-gray-900">
                        {bookingData.checkIn?.toLocaleDateString()} - {bookingData.checkOut?.toLocaleDateString()}
                      </span>
                    </div>
                    <div className="flex justify-between pt-3 border-t border-gray-200">
                      <span className="font-semibold text-gray-900">{t('summary.total')}</span>
                      <span className="text-xl font-bold text-blue-600">€{totalPrice}</span>
                    </div>
                  </div>
                </div>

                {/* Terms Checkbox */}
                <div className="bg-blue-50 rounded-xl p-4">
                  <label className="flex items-start gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={bookingData.acceptedTerms}
                      onChange={(e) => setBookingData({
                        ...bookingData,
                        acceptedTerms: e.target.checked
                      })}
                      className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500 mt-0.5"
                      required
                    />
                    <span className="text-sm text-gray-700">
                      {t('form.acceptTerms')}{' '}
                      <a href={`/${locale}/terms`} target="_blank" className="text-blue-600 hover:underline font-medium">
                        {t('form.termsLink')}
                      </a>
                      {' '}{t('form.and')}{' '}
                      <a href={`/${locale}/privacy`} target="_blank" className="text-blue-600 hover:underline font-medium">
                        {t('form.privacyLink')}
                      </a>
                    </span>
                  </label>
                </div>

                {/* Navigation */}
                <div className="flex gap-3 pt-4">
                  <Button
                    onClick={handlePrevStep}
                    variant="outline"
                    className="flex-1 h-12 border-gray-300 hover:bg-gray-50 rounded-xl font-medium"
                  >
                    {commonT('back')}
                  </Button>
                  <Button
                    onClick={handleSubmit}
                    disabled={!bookingData.contact.name || !bookingData.contact.email || !bookingData.acceptedTerms || isSubmitting}
                    className="flex-1 h-12 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? commonT('loading') : t('form.submit')}
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* GDPR Consent Banner */}
        {showGDPRBanner && (
          <GDPRConsentBanner
            onAccept={handleGDPRAccept}
            onDecline={handleGDPRDecline}
            locale={locale}
          />
        )}
      </div>
    </div>
  )
}
