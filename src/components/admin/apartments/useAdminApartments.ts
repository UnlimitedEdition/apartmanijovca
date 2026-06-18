'use client'

import { useCallback, useEffect, useState } from 'react'
import { Apartment, emptyApartment } from './types'

export function useAdminApartments() {
  const [apartments, setApartments] = useState<Apartment[]>([])
  const [selectedApartment, setSelectedApartment] = useState<Apartment | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState('basic')

  const loadApartments = useCallback(async () => {
    setLoading(true)
    try {
      // Request raw data (not localized) for admin editing
      const response = await fetch('/api/admin/apartments?raw=true')
      if (!response.ok) throw new Error('Failed to load apartments')
      const data = await response.json()
      // API always returns { apartments: [...] }
      setApartments(data.apartments || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load apartments')
    } finally {
      setLoading(false)
    }
  }, [])

  // Load apartments
  useEffect(() => {
    loadApartments()
  }, [loadApartments])

  const handleEdit = (apartment: Apartment) => {
    // Ensure all optional fields are initialized to prevent uncontrolled input warnings
    setSelectedApartment({
      ...apartment,
      slug: apartment.slug || '',
      display_order: apartment.display_order ?? 0,
      video_url: apartment.video_url || '',
      virtual_tour_url: apartment.virtual_tour_url || '',
      weekend_price_eur: apartment.weekend_price_eur ?? 0,
      max_stay_nights: apartment.max_stay_nights ?? 0,
      weekly_discount_percent: apartment.weekly_discount_percent ?? 0,
      monthly_discount_percent: apartment.monthly_discount_percent ?? 0,
      meta_title: apartment.meta_title || { sr: '', en: '', de: '', it: '' },
      meta_description: apartment.meta_description || { sr: '', en: '', de: '', it: '' },
      meta_keywords: apartment.meta_keywords || { sr: '', en: '', de: '', it: '' },
      kitchen_type: apartment.kitchen_type || { sr: '', en: '', de: '', it: '' },
      house_rules: apartment.house_rules || { sr: '', en: '', de: '', it: '' },
      cancellation_policy: apartment.cancellation_policy || { sr: '', en: '', de: '', it: '' },
      features: apartment.features || [],
      gallery: apartment.gallery || [],
      seasonal_pricing: apartment.seasonal_pricing || [],
      bed_counts: apartment.bed_counts || {},
      selected_amenities: apartment.selected_amenities || [],
      selected_rules: apartment.selected_rules || [],
      selected_view: apartment.selected_view || '',
      images: apartment.images || []
    })
    setIsEditing(true)
    setActiveTab('basic')
  }

  const handleSave = async () => {
    if (!selectedApartment) return

    setSaving(true)
    setError(null)
    setSuccess(null)

    try {
      const url = selectedApartment.id 
        ? `/api/admin/apartments/${selectedApartment.id}`
        : '/api/admin/apartments'
      
      const method = selectedApartment.id ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(selectedApartment)
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to save apartment')
      }

      setSuccess('Apartman je uspešno sačuvan!')
      setIsEditing(false)
      setSelectedApartment(null)
      await loadApartments()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save apartment')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Da li ste sigurni da želite da obrišete ovaj apartman?')) return

    try {
      const response = await fetch(`/api/admin/apartments/${id}`, {
        method: 'DELETE'
      })

      if (!response.ok) throw new Error('Failed to delete apartment')

      setSuccess('Apartman je uspešno obrisan!')
      await loadApartments()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete apartment')
    }
  }

  const handleNew = () => {
    setSelectedApartment(emptyApartment)
    setIsEditing(true)
    setActiveTab('basic')
    setError(null)
    setSuccess(null)
  }

  

  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim()
  }

  const handleNameChange = (lang: 'sr' | 'en' | 'de' | 'it', value: string) => {
    if (!selectedApartment) return

    const newName = { ...selectedApartment.name, [lang]: value }
    const newSlug = lang === 'sr' ? generateSlug(value) : selectedApartment.slug

    setSelectedApartment({
      ...selectedApartment,
      name: newName,
      slug: newSlug
    })
  }

  // Checkbox/Counter handlers
  const updateBedCount = (bedId: string, count: number) => {
    if (!selectedApartment) return
    const newCounts = { ...(selectedApartment.bed_counts || {}) }
    if (count === 0) {
      delete newCounts[bedId]
    } else {
      newCounts[bedId] = count
    }
    setSelectedApartment({ ...selectedApartment, bed_counts: newCounts })
  }

  const toggleAmenity = (amenityId: string) => {
    if (!selectedApartment) return
    const current = selectedApartment.selected_amenities || []
    const updated = current.includes(amenityId)
      ? current.filter(id => id !== amenityId)
      : [...current, amenityId]
    setSelectedApartment({ ...selectedApartment, selected_amenities: updated })
  }

  const toggleRule = (ruleId: string) => {
    if (!selectedApartment) return
    const current = selectedApartment.selected_rules || []
    const updated = current.includes(ruleId)
      ? current.filter(id => id !== ruleId)
      : [...current, ruleId]
    setSelectedApartment({ ...selectedApartment, selected_rules: updated })
  }
  return {
    apartments,
    selectedApartment,
    setSelectedApartment,
    isEditing,
    setIsEditing,
    loading,
    saving,
    error,
    setError,
    success,
    setSuccess,
    activeTab,
    setActiveTab,
    handleEdit,
    handleSave,
    handleDelete,
    handleNew,
    handleNameChange,
    updateBedCount,
    toggleAmenity,
    toggleRule,
  }
}
