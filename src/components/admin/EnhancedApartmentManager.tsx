'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { Textarea } from '../ui/textarea'
import LocationPicker from './LocationPicker'
import { 
  Plus, 
  Save, 
  Eye, 
  Trash2,
  X,
  AlertCircle,
  CheckCircle2,
  Loader2
} from 'lucide-react'
import { 
  BED_OPTIONS, 
  AMENITY_OPTIONS, 
  RULE_OPTIONS, 
  VIEW_OPTIONS 
} from '../../lib/apartment-options'

interface Apartment {
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

const emptyApartment: Apartment = {
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
  country: 'Crna Gora',
  postal_code: '',
  latitude: undefined,
  longitude: undefined
}

export default function EnhancedApartmentManager() {
  const [apartments, setApartments] = useState<Apartment[]>([])
  const [selectedApartment, setSelectedApartment] = useState<Apartment | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState('basic')

  // Load apartments
  useEffect(() => {
    loadApartments()
  }, [])

  const loadApartments = async () => {
    setLoading(true)
    try {
      // Request raw data (not localized) for admin editing
      const response = await fetch('/api/admin/apartments?raw=true')
      if (!response.ok) throw new Error('Failed to load apartments')
      const data = await response.json()
      // API returns { apartments: [...] }
      setApartments(Array.isArray(data) ? data : (data.apartments || []))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load apartments')
    } finally {
      setLoading(false)
    }
  }
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

  const handleCancel = () => {
    setSelectedApartment(null)
    setIsEditing(false)
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

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h2 className="text-lg sm:text-xl font-bold">Upravljanje apartmanima</h2>
          <p className="text-xs sm:text-sm text-gray-600">Profesionalno upravljanje svim detaljima</p>
        </div>
        {!isEditing && (
          <Button onClick={handleNew} className="gap-2 text-xs sm:text-sm h-9 w-full sm:w-auto">
            <Plus className="h-4 w-4" />
            Dodaj apartman
          </Button>
        )}
      </div>

      {/* Alerts */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3 sm:p-4 flex items-start gap-2 sm:gap-3">
          <AlertCircle className="h-4 w-4 sm:h-5 sm:w-5 text-red-600 flex-shrink-0 mt-0.5" />
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-red-900 text-xs sm:text-sm">Greška</p>
            <p className="text-xs sm:text-sm text-red-800 break-words">{error}</p>
          </div>
          <button onClick={() => setError(null)} className="flex-shrink-0">
            <X className="h-4 w-4 text-red-600" />
          </button>
        </div>
      )}

      {success && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-3 sm:p-4 flex items-start gap-2 sm:gap-3">
          <CheckCircle2 className="h-4 w-4 sm:h-5 sm:w-5 text-green-600 flex-shrink-0 mt-0.5" />
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-green-900 text-xs sm:text-sm">Uspeh</p>
            <p className="text-xs sm:text-sm text-green-800 break-words">{success}</p>
          </div>
          <button onClick={() => setSuccess(null)} className="flex-shrink-0">
            <X className="h-4 w-4 text-green-600" />
          </button>
        </div>
      )}

      {/* Editor or List */}
      {isEditing && selectedApartment ? (
        <Card>
          <CardHeader className="p-4 sm:p-6">
            <CardTitle className="text-base sm:text-lg">
              {selectedApartment.id ? 'Izmeni apartman' : 'Novi apartman'}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 sm:p-6 pt-0">
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              {/* Tabs - grid on all screens for even distribution */}
              <div className="mb-4 sm:mb-6">
                <TabsList className="grid grid-cols-5 w-full h-auto gap-0.5 sm:gap-1 p-0.5 sm:p-1">
                  <TabsTrigger value="basic" className="text-[10px] sm:text-xs lg:text-sm px-1 sm:px-3 lg:px-6 h-8 sm:h-9">
                    Osnovne
                  </TabsTrigger>
                  <TabsTrigger value="description" className="text-[10px] sm:text-xs lg:text-sm px-1 sm:px-3 lg:px-6 h-8 sm:h-9">
                    Opis
                  </TabsTrigger>
                  <TabsTrigger value="gallery" className="text-[10px] sm:text-xs lg:text-sm px-1 sm:px-3 lg:px-6 h-8 sm:h-9">
                    Galerija
                  </TabsTrigger>
                  <TabsTrigger value="pricing" className="text-[10px] sm:text-xs lg:text-sm px-1 sm:px-3 lg:px-6 h-8 sm:h-9">
                    Cene
                  </TabsTrigger>
                  <TabsTrigger value="seo" className="text-[10px] sm:text-xs lg:text-sm px-1 sm:px-3 lg:px-6 h-8 sm:h-9">
                    SEO
                  </TabsTrigger>
                  <TabsTrigger value="location" className="text-[10px] sm:text-xs lg:text-sm px-1 sm:px-3 lg:px-6 h-8 sm:h-9">
                    Lokacija
                  </TabsTrigger>
                </TabsList>
              </div>

              {/* Tab 1: Basic Info */}
              <TabsContent value="basic" className="space-y-4 sm:space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4">
                  {/* Name fields for all languages */}
                  <div className="lg:col-span-2">
                    <label className="block text-xs sm:text-sm font-semibold mb-2">Naziv apartmana *</label>
                    <div className="grid grid-cols-1 gap-2 sm:gap-3">
                      <div>
                        <label className="text-[10px] sm:text-xs text-gray-600">Srpski (SR)</label>
                        <Input
                          value={selectedApartment.name.sr}
                          onChange={(e) => handleNameChange('sr', e.target.value)}
                          placeholder="Apartman Standard"
                          required
                          className="text-xs sm:text-sm h-8 sm:h-9"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] sm:text-xs text-gray-600">English (EN)</label>
                        <Input
                          value={selectedApartment.name.en}
                          onChange={(e) => handleNameChange('en', e.target.value)}
                          placeholder="Standard Apartment"
                          className="text-xs sm:text-sm h-8 sm:h-9"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] sm:text-xs text-gray-600">Deutsch (DE)</label>
                        <Input
                          value={selectedApartment.name.de}
                          onChange={(e) => handleNameChange('de', e.target.value)}
                          placeholder="Standard Wohnung"
                          className="text-xs sm:text-sm h-8 sm:h-9"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] sm:text-xs text-gray-600">Italiano (IT)</label>
                        <Input
                          value={selectedApartment.name.it}
                          onChange={(e) => handleNameChange('it', e.target.value)}
                          placeholder="Appartamento Standard"
                          className="text-xs sm:text-sm h-8 sm:h-9"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Slug */}
                  <div className="lg:col-span-2">
                    <label className="block text-xs sm:text-sm font-semibold mb-2">URL Slug (SEO) *</label>
                    <Input
                      value={selectedApartment.slug}
                      onChange={(e) => setSelectedApartment({ ...selectedApartment, slug: e.target.value })}
                      placeholder="apartman-standard"
                      className="font-mono text-xs sm:text-sm h-8 sm:h-9"
                      required
                    />
                    <p className="text-[10px] sm:text-xs text-gray-500 mt-1 break-all">
                      URL: /{'{lang}'}/apartments/{selectedApartment.slug}
                    </p>
                  </div>

                  {/* Capacity */}
                  <div>
                    <label className="block text-xs sm:text-sm font-semibold mb-2">Kapacitet *</label>
                    <Input
                      type="number"
                      min="1"
                      max="10"
                      value={selectedApartment.capacity}
                      onChange={(e) => setSelectedApartment({ ...selectedApartment, capacity: parseInt(e.target.value) })}
                      required
                      className="text-xs sm:text-sm h-8 sm:h-9"
                    />
                  </div>

                  {/* Size */}
                  <div>
                    <label className="block text-xs sm:text-sm font-semibold mb-2">Veličina (m²)</label>
                    <Input
                      type="number"
                      min="20"
                      max="200"
                      value={selectedApartment.size_sqm || ''}
                      onChange={(e) => setSelectedApartment({ ...selectedApartment, size_sqm: parseInt(e.target.value) })}
                      className="text-xs sm:text-sm h-8 sm:h-9"
                    />
                  </div>

                  {/* Floor */}
                  <div>
                    <label className="block text-xs sm:text-sm font-semibold mb-2">Sprat</label>
                    <Input
                      type="number"
                      min="0"
                      max="10"
                      value={selectedApartment.floor || ''}
                      onChange={(e) => setSelectedApartment({ ...selectedApartment, floor: parseInt(e.target.value) })}
                      className="text-xs sm:text-sm h-8 sm:h-9"
                    />
                  </div>

                  {/* Bathrooms */}
                  <div>
                    <label className="block text-xs sm:text-sm font-semibold mb-2">Kupatila</label>
                    <Input
                      type="number"
                      min="1"
                      max="5"
                      value={selectedApartment.bathroom_count || 1}
                      onChange={(e) => setSelectedApartment({ ...selectedApartment, bathroom_count: parseInt(e.target.value) })}
                      className="text-xs sm:text-sm h-8 sm:h-9"
                    />
                  </div>

                  {/* Balcony */}
                  <div className="flex items-center gap-2 pt-6 sm:pt-8">
                    <input
                      type="checkbox"
                      id="balcony"
                      checked={selectedApartment.balcony || false}
                      onChange={(e) => setSelectedApartment({ ...selectedApartment, balcony: e.target.checked })}
                      className="w-4 h-4 rounded border-gray-300"
                    />
                    <label htmlFor="balcony" className="text-xs sm:text-sm font-semibold">Ima balkon/terasu</label>
                  </div>

                  {/* Status */}
                  <div>
                    <label className="block text-xs sm:text-sm font-semibold mb-2">Status *</label>
                    <select
                      value={selectedApartment.status}
                      onChange={(e) => setSelectedApartment({ ...selectedApartment, status: e.target.value as 'active' | 'inactive' | 'maintenance' })}
                      className="w-full h-8 sm:h-9 px-3 rounded-md border border-gray-300 text-xs sm:text-sm"
                      required
                    >
                      <option value="active">Aktivan</option>
                      <option value="inactive">Neaktivan</option>
                      <option value="maintenance">Održavanje</option>
                    </select>
                  </div>

                  {/* Display Order */}
                  <div>
                    <label className="block text-xs sm:text-sm font-semibold mb-2">Redosled prikaza</label>
                    <Input
                      type="number"
                      min="0"
                      max="100"
                      value={selectedApartment.display_order || 0}
                      onChange={(e) => setSelectedApartment({ ...selectedApartment, display_order: parseInt(e.target.value) })}
                      placeholder="0"
                      className="text-xs sm:text-sm h-8 sm:h-9"
                    />
                    <p className="text-[10px] sm:text-xs text-gray-500 mt-1">Manji broj = viši prioritet</p>
                  </div>
                </div>
              </TabsContent>

              {/* Tab 2: Description with Checklists */}
              <TabsContent value="description" className="space-y-4 sm:space-y-6">
                <div className="space-y-4 sm:space-y-6">
                  {/* Description for all languages */}
                  <div>
                    <label className="block text-xs sm:text-sm font-semibold mb-2">Detaljan opis apartmana *</label>
                    <div className="space-y-2 sm:space-y-3">
                      <div>
                        <label className="text-[10px] sm:text-xs text-gray-600">Srpski (SR)</label>
                        <Textarea
                          value={selectedApartment.description.sr}
                          onChange={(e) => setSelectedApartment({ 
                            ...selectedApartment, 
                            description: { ...selectedApartment.description, sr: e.target.value }
                          })}
                          placeholder="Opišite apartman..."
                          rows={3}
                          required
                          className="text-xs sm:text-sm"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] sm:text-xs text-gray-600">English (EN)</label>
                        <Textarea
                          value={selectedApartment.description.en}
                          onChange={(e) => setSelectedApartment({ 
                            ...selectedApartment, 
                            description: { ...selectedApartment.description, en: e.target.value }
                          })}
                          placeholder="Describe the apartment..."
                          rows={3}
                          className="text-xs sm:text-sm"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] sm:text-xs text-gray-600">Deutsch (DE)</label>
                        <Textarea
                          value={selectedApartment.description.de}
                          onChange={(e) => setSelectedApartment({ 
                            ...selectedApartment, 
                            description: { ...selectedApartment.description, de: e.target.value }
                          })}
                          placeholder="Beschreiben Sie..."
                          rows={3}
                          className="text-xs sm:text-sm"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] sm:text-xs text-gray-600">Italiano (IT)</label>
                        <Textarea
                          value={selectedApartment.description.it}
                          onChange={(e) => setSelectedApartment({ 
                            ...selectedApartment, 
                            description: { ...selectedApartment.description, it: e.target.value }
                          })}
                          placeholder="Descrivi..."
                          rows={3}
                          className="text-xs sm:text-sm"
                        />
                      </div>
                    </div>
                  </div>

                  {/* BEDS WITH COUNTER */}
                  <div className="border rounded-lg p-3 sm:p-4 bg-blue-50">
                    <label className="block text-xs sm:text-sm font-bold mb-2 sm:mb-3 text-blue-900">🛏️ Kreveti</label>
                    <div className="grid grid-cols-1 gap-2">
                      {BED_OPTIONS.map((bed) => {
                        const count = (selectedApartment.bed_counts || {})[bed.id] || 0
                        return (
                          <div key={bed.id} className="flex items-center gap-2 p-2 bg-white rounded border">
                            <div className="flex-1 min-w-0">
                              <div className="font-semibold text-[10px] sm:text-xs truncate">{bed.label.sr}</div>
                              <div className="text-[9px] sm:text-[10px] text-gray-600 truncate">{bed.label.en}</div>
                            </div>
                            <div className="flex items-center gap-1 flex-shrink-0">
                              <button
                                type="button"
                                onClick={() => updateBedCount(bed.id, Math.max(0, count - 1))}
                                className="w-7 h-7 rounded border border-gray-300 hover:bg-gray-100 flex items-center justify-center font-bold text-sm"
                              >
                                −
                              </button>
                              <span className="w-7 text-center font-bold text-xs">{count}</span>
                              <button
                                type="button"
                                onClick={() => updateBedCount(bed.id, count + 1)}
                                className="w-7 h-7 rounded border border-gray-300 hover:bg-gray-100 flex items-center justify-center font-bold text-sm"
                              >
                                +
                              </button>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </div>

                  {/* AMENITIES CHECKBOX */}
                  <div className="border rounded-lg p-3 sm:p-4 bg-green-50">
                    <label className="block text-xs sm:text-sm font-bold mb-2 sm:mb-3 text-green-900">✨ Sadržaj</label>
                    <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-2">
                      {AMENITY_OPTIONS.map((amenity) => (
                        <label key={amenity.id} className="flex items-start gap-2 p-2 bg-white rounded border cursor-pointer hover:bg-green-50 transition">
                          <input
                            type="checkbox"
                            checked={(selectedApartment.selected_amenities || []).includes(amenity.id)}
                            onChange={() => toggleAmenity(amenity.id)}
                            className="mt-0.5 w-4 h-4 rounded border-gray-300 flex-shrink-0"
                          />
                          <div className="flex-1 min-w-0">
                            <div className="font-semibold text-[10px] sm:text-xs truncate">{amenity.label.sr}</div>
                            <div className="text-[9px] sm:text-[10px] text-gray-600 truncate">{amenity.label.en}</div>
                          </div>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* RULES CHECKBOX */}
                  <div className="border rounded-lg p-3 sm:p-4 bg-orange-50">
                    <label className="block text-xs sm:text-sm font-bold mb-2 sm:mb-3 text-orange-900">📋 Pravila</label>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-2">
                      {RULE_OPTIONS.map((rule) => (
                        <label key={rule.id} className="flex items-start gap-2 p-2 bg-white rounded border cursor-pointer hover:bg-orange-50 transition">
                          <input
                            type="checkbox"
                            checked={(selectedApartment.selected_rules || []).includes(rule.id)}
                            onChange={() => toggleRule(rule.id)}
                            className="mt-0.5 w-4 h-4 rounded border-gray-300 flex-shrink-0"
                          />
                          <div className="flex-1 min-w-0">
                            <div className="font-semibold text-[10px] sm:text-xs truncate">{rule.label.sr}</div>
                            <div className="text-[9px] sm:text-[10px] text-gray-600 truncate">{rule.label.en}</div>
                          </div>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* VIEW TYPE RADIO */}
                  <div className="border rounded-lg p-3 sm:p-4 bg-purple-50">
                    <label className="block text-xs sm:text-sm font-bold mb-2 sm:mb-3 text-purple-900">👁️ Pogled</label>
                    <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-2">
                      {VIEW_OPTIONS.map((view) => (
                        <label key={view.id} className="flex items-start gap-2 p-2 bg-white rounded border cursor-pointer hover:bg-purple-50 transition">
                          <input
                            type="radio"
                            name="view"
                            checked={selectedApartment.selected_view === view.id}
                            onChange={() => setSelectedApartment({ ...selectedApartment, selected_view: view.id })}
                            className="mt-0.5 w-4 h-4 flex-shrink-0"
                          />
                          <div className="flex-1 min-w-0">
                            <div className="font-semibold text-[10px] sm:text-xs truncate">{view.label.sr}</div>
                            <div className="text-[9px] sm:text-[10px] text-gray-600 truncate">{view.label.en}</div>
                          </div>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Kitchen Type - ALL 4 LANGUAGES */}
                  <div>
                    <label className="block text-xs sm:text-sm font-semibold mb-2">Tip kuhinje</label>
                    <div className="space-y-2">
                      <div>
                        <label className="text-[10px] sm:text-xs text-gray-600">Srpski (SR)</label>
                        <Input
                          value={selectedApartment.kitchen_type?.sr || ''}
                          onChange={(e) => setSelectedApartment({ 
                            ...selectedApartment, 
                            kitchen_type: { 
                              ...selectedApartment.kitchen_type || { sr: '', en: '', de: '', it: '' },
                              sr: e.target.value
                            }
                          })}
                          placeholder="Potpuno opremljena kuhinja"
                          className="text-xs sm:text-sm h-8 sm:h-9"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] sm:text-xs text-gray-600">English (EN)</label>
                        <Input
                          value={selectedApartment.kitchen_type?.en || ''}
                          onChange={(e) => setSelectedApartment({ 
                            ...selectedApartment, 
                            kitchen_type: { 
                              ...selectedApartment.kitchen_type || { sr: '', en: '', de: '', it: '' },
                              en: e.target.value
                            }
                          })}
                          placeholder="Fully equipped kitchen"
                          className="text-xs sm:text-sm h-8 sm:h-9"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] sm:text-xs text-gray-600">Deutsch (DE)</label>
                        <Input
                          value={selectedApartment.kitchen_type?.de || ''}
                          onChange={(e) => setSelectedApartment({ 
                            ...selectedApartment, 
                            kitchen_type: { 
                              ...selectedApartment.kitchen_type || { sr: '', en: '', de: '', it: '' },
                              de: e.target.value
                            }
                          })}
                          placeholder="Voll ausgestattete Küche"
                          className="text-xs sm:text-sm h-8 sm:h-9"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] sm:text-xs text-gray-600">Italiano (IT)</label>
                        <Input
                          value={selectedApartment.kitchen_type?.it || ''}
                          onChange={(e) => setSelectedApartment({ 
                            ...selectedApartment, 
                            kitchen_type: { 
                              ...selectedApartment.kitchen_type || { sr: '', en: '', de: '', it: '' },
                              it: e.target.value
                            }
                          })}
                          placeholder="Cucina completamente attrezzata"
                          className="text-xs sm:text-sm h-8 sm:h-9"
                        />
                      </div>
                    </div>
                  </div>

                  {/* FEATURES - JSONB Array */}
                  <div className="border rounded-lg p-3 sm:p-4 bg-yellow-50">
                    <label className="block text-xs sm:text-sm font-bold mb-2 sm:mb-3 text-yellow-900">⭐ Dodatne karakteristike</label>
                    <p className="text-[10px] sm:text-xs text-gray-600 mb-2">JSON format: [{'{'}&#34;sr&#34;: &#34;Tekst&#34;, &#34;en&#34;: &#34;Text&#34;, &#34;de&#34;: &#34;Text&#34;, &#34;it&#34;: &#34;Testo&#34;{'}'}]</p>
                    <Textarea
                      value={JSON.stringify(selectedApartment.features || [], null, 2)}
                      onChange={(e) => {
                        try {
                          const parsed = JSON.parse(e.target.value)
                          setSelectedApartment({ ...selectedApartment, features: parsed })
                        } catch {
                          // Invalid JSON, don't update
                        }
                      }}
                      placeholder='[{"sr": "Besplatan WiFi", "en": "Free WiFi", "de": "Kostenloses WLAN", "it": "WiFi gratuito"}]'
                      rows={4}
                      className="text-xs sm:text-sm font-mono"
                    />
                  </div>

                  {/* HOUSE RULES - JSONB Multi-language */}
                  <div>
                    <label className="block text-xs sm:text-sm font-semibold mb-2">Pravila kuće (detaljan tekst)</label>
                    <div className="space-y-2">
                      <div>
                        <label className="text-[10px] sm:text-xs text-gray-600">Srpski (SR)</label>
                        <Textarea
                          value={selectedApartment.house_rules?.sr || ''}
                          onChange={(e) => setSelectedApartment({ 
                            ...selectedApartment, 
                            house_rules: { 
                              ...selectedApartment.house_rules || { sr: '', en: '', de: '', it: '' },
                              sr: e.target.value
                            }
                          })}
                          placeholder="Molimo vas da poštujete pravila kuće..."
                          rows={3}
                          className="text-xs sm:text-sm"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] sm:text-xs text-gray-600">English (EN)</label>
                        <Textarea
                          value={selectedApartment.house_rules?.en || ''}
                          onChange={(e) => setSelectedApartment({ 
                            ...selectedApartment, 
                            house_rules: { 
                              ...selectedApartment.house_rules || { sr: '', en: '', de: '', it: '' },
                              en: e.target.value
                            }
                          })}
                          placeholder="Please respect the house rules..."
                          rows={3}
                          className="text-xs sm:text-sm"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] sm:text-xs text-gray-600">Deutsch (DE)</label>
                        <Textarea
                          value={selectedApartment.house_rules?.de || ''}
                          onChange={(e) => setSelectedApartment({ 
                            ...selectedApartment, 
                            house_rules: { 
                              ...selectedApartment.house_rules || { sr: '', en: '', de: '', it: '' },
                              de: e.target.value
                            }
                          })}
                          placeholder="Bitte beachten Sie die Hausregeln..."
                          rows={3}
                          className="text-xs sm:text-sm"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] sm:text-xs text-gray-600">Italiano (IT)</label>
                        <Textarea
                          value={selectedApartment.house_rules?.it || ''}
                          onChange={(e) => setSelectedApartment({ 
                            ...selectedApartment, 
                            house_rules: { 
                              ...selectedApartment.house_rules || { sr: '', en: '', de: '', it: '' },
                              it: e.target.value
                            }
                          })}
                          placeholder="Si prega di rispettare le regole della casa..."
                          rows={3}
                          className="text-xs sm:text-sm"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </TabsContent>

              {/* Tab 3: Gallery */}
              <TabsContent value="gallery" className="space-y-4 sm:space-y-6">
                <div className="space-y-3 sm:space-y-4">
                  {/* Image URLs */}
                  <div>
                    <label className="block text-xs sm:text-sm font-semibold mb-2">Slike (URL-ovi)</label>
                    <p className="text-[10px] sm:text-xs text-gray-600 mb-2 sm:mb-3">Dodajte URL-ove slika. Prva slika će biti glavna.</p>
                    
                    <div className="space-y-2">
                      {(selectedApartment.images || []).map((url, index) => (
                        <div key={index} className="flex gap-2">
                          <Input
                            value={url}
                            onChange={(e) => {
                              const newImages = [...(selectedApartment.images || [])]
                              newImages[index] = e.target.value
                              setSelectedApartment({ ...selectedApartment, images: newImages })
                            }}
                            placeholder="https://example.com/image.jpg"
                            className="text-xs sm:text-sm h-8 sm:h-9"
                          />
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              const newImages = (selectedApartment.images || []).filter((_, i) => i !== index)
                              setSelectedApartment({ ...selectedApartment, images: newImages })
                            }}
                            className="h-8 sm:h-9 w-8 sm:w-9 p-0 flex-shrink-0"
                          >
                            <X className="h-3 w-3 sm:h-4 sm:w-4" />
                          </Button>
                        </div>
                      ))}
                      
                      <Button
                        variant="outline"
                        onClick={() => {
                          setSelectedApartment({ 
                            ...selectedApartment, 
                            images: [...(selectedApartment.images || []), '']
                          })
                        }}
                        className="gap-2 text-xs sm:text-sm h-8 sm:h-9"
                      >
                        <Plus className="h-3 w-3 sm:h-4 sm:w-4" />
                        Dodaj sliku
                      </Button>
                    </div>
                  </div>

                  {/* Video & Virtual Tour */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4">
                    <div>
                      <label className="block text-xs sm:text-sm font-semibold mb-2">Video URL</label>
                      <Input
                        value={selectedApartment.video_url || ''}
                        onChange={(e) => setSelectedApartment({ ...selectedApartment, video_url: e.target.value })}
                        placeholder="https://youtube.com/..."
                        className="text-xs sm:text-sm h-8 sm:h-9"
                      />
                    </div>
                    <div>
                      <label className="block text-xs sm:text-sm font-semibold mb-2">Virtuelna tura</label>
                      <Input
                        value={selectedApartment.virtual_tour_url || ''}
                        onChange={(e) => setSelectedApartment({ ...selectedApartment, virtual_tour_url: e.target.value })}
                        placeholder="https://..."
                        className="text-xs sm:text-sm h-8 sm:h-9"
                      />
                    </div>
                  </div>

                  {/* Image Preview */}
                  {selectedApartment.images && selectedApartment.images.length > 0 && (
                    <div>
                      <label className="block text-xs sm:text-sm font-semibold mb-2">Pregled slika</label>
                      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2 sm:gap-3">
                        {selectedApartment.images.filter(url => url).map((url, index) => (
                          <div key={index} className="relative aspect-video rounded-lg overflow-hidden border">
                            <img 
                              src={url} 
                              alt={`Slika ${index + 1}`}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                (e.target as HTMLImageElement).src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="100" height="100"%3E%3Crect fill="%23ddd" width="100" height="100"/%3E%3Ctext x="50%25" y="50%25" text-anchor="middle" dy=".3em" fill="%23999" font-size="12"%3ENo Image%3C/text%3E%3C/svg%3E'
                              }}
                            />
                            {index === 0 && (
                              <div className="absolute top-1 left-1 sm:top-2 sm:left-2 bg-blue-600 text-white text-[9px] sm:text-xs px-1.5 sm:px-2 py-0.5 sm:py-1 rounded">
                                Glavna
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* GALLERY - JSONB with captions */}
                  <div className="border rounded-lg p-3 sm:p-4 bg-indigo-50">
                    <label className="block text-xs sm:text-sm font-bold mb-2 sm:mb-3 text-indigo-900">🖼️ Galerija sa opisima</label>
                    <p className="text-[10px] sm:text-xs text-gray-600 mb-2">JSON format: [{'{'}&#34;url&#34;: &#34;...&#34;, &#34;caption&#34;: {'{'}&#34;sr&#34;: &#34;...&#34;, &#34;en&#34;: &#34;...&#34;, &#34;de&#34;: &#34;...&#34;, &#34;it&#34;: &#34;...&#34;{'}'}, &#34;order&#34;: 1{'}'}]</p>
                    <Textarea
                      value={JSON.stringify(selectedApartment.gallery || [], null, 2)}
                      onChange={(e) => {
                        try {
                          const parsed = JSON.parse(e.target.value)
                          setSelectedApartment({ ...selectedApartment, gallery: parsed })
                        } catch {
                          // Invalid JSON, don't update
                        }
                      }}
                      placeholder='[{"url": "https://...", "caption": {"sr": "Dnevna soba", "en": "Living room", "de": "Wohnzimmer", "it": "Soggiorno"}, "order": 1}]'
                      rows={6}
                      className="text-xs sm:text-sm font-mono"
                    />
                  </div>
                </div>
              </TabsContent>

              {/* Tab 4: Pricing */}
              <TabsContent value="pricing" className="space-y-4 sm:space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4">
                  {/* Base Price */}
                  <div>
                    <label className="block text-xs sm:text-sm font-semibold mb-2">Osnovna cena (EUR/noć) *</label>
                    <Input
                      type="number"
                      min="10"
                      step="5"
                      value={selectedApartment.base_price_eur}
                      onChange={(e) => setSelectedApartment({ ...selectedApartment, base_price_eur: parseFloat(e.target.value) })}
                      required
                      className="text-xs sm:text-sm h-8 sm:h-9"
                    />
                  </div>

                  {/* Weekend Price */}
                  <div>
                    <label className="block text-xs sm:text-sm font-semibold mb-2">Vikend cena (EUR/noć)</label>
                    <Input
                      type="number"
                      min="0"
                      step="5"
                      value={selectedApartment.weekend_price_eur ?? ''}
                      onChange={(e) => setSelectedApartment({ ...selectedApartment, weekend_price_eur: e.target.value === '' ? 0 : parseFloat(e.target.value) })}
                      placeholder="0 = ista kao osnovna"
                      className="text-xs sm:text-sm h-8 sm:h-9"
                    />
                  </div>

                  {/* Weekly Discount */}
                  <div>
                    <label className="block text-xs sm:text-sm font-semibold mb-2">Nedeljni popust (%)</label>
                    <Input
                      type="number"
                      min="0"
                      max="50"
                      value={selectedApartment.weekly_discount_percent ?? ''}
                      onChange={(e) => setSelectedApartment({ ...selectedApartment, weekly_discount_percent: e.target.value === '' ? 0 : parseFloat(e.target.value) })}
                      placeholder="10"
                      className="text-xs sm:text-sm h-8 sm:h-9"
                    />
                    <p className="text-[10px] sm:text-xs text-gray-500 mt-1">Za 7+ noći</p>
                  </div>

                  {/* Monthly Discount */}
                  <div>
                    <label className="block text-xs sm:text-sm font-semibold mb-2">Mesečni popust (%)</label>
                    <Input
                      type="number"
                      min="0"
                      max="50"
                      value={selectedApartment.monthly_discount_percent ?? ''}
                      onChange={(e) => setSelectedApartment({ ...selectedApartment, monthly_discount_percent: e.target.value === '' ? 0 : parseFloat(e.target.value) })}
                      placeholder="20"
                      className="text-xs sm:text-sm h-8 sm:h-9"
                    />
                    <p className="text-[10px] sm:text-xs text-gray-500 mt-1">Za 30+ noći</p>
                  </div>

                  {/* Check-in Time */}
                  <div>
                    <label className="block text-xs sm:text-sm font-semibold mb-2">Vreme prijave</label>
                    <Input
                      type="time"
                      value={selectedApartment.check_in_time || '14:00'}
                      onChange={(e) => setSelectedApartment({ ...selectedApartment, check_in_time: e.target.value })}
                      className="text-xs sm:text-sm h-8 sm:h-9"
                    />
                  </div>

                  {/* Check-out Time */}
                  <div>
                    <label className="block text-xs sm:text-sm font-semibold mb-2">Vreme odjave</label>
                    <Input
                      type="time"
                      value={selectedApartment.check_out_time || '10:00'}
                      onChange={(e) => setSelectedApartment({ ...selectedApartment, check_out_time: e.target.value })}
                      className="text-xs sm:text-sm h-8 sm:h-9"
                    />
                  </div>

                  {/* Min Stay */}
                  <div>
                    <label className="block text-xs sm:text-sm font-semibold mb-2">Min. boravak (noći)</label>
                    <Input
                      type="number"
                      min="1"
                      max="30"
                      value={selectedApartment.min_stay_nights || 1}
                      onChange={(e) => setSelectedApartment({ ...selectedApartment, min_stay_nights: parseInt(e.target.value) })}
                      className="text-xs sm:text-sm h-8 sm:h-9"
                    />
                  </div>

                  {/* Max Stay */}
                  <div>
                    <label className="block text-xs sm:text-sm font-semibold mb-2">Max. boravak (noći)</label>
                    <Input
                      type="number"
                      min="0"
                      max="365"
                      value={selectedApartment.max_stay_nights ?? ''}
                      onChange={(e) => setSelectedApartment({ ...selectedApartment, max_stay_nights: e.target.value === '' ? 0 : parseInt(e.target.value) })}
                      placeholder="0 = neograničeno"
                      className="text-xs sm:text-sm h-8 sm:h-9"
                    />
                  </div>
                </div>

                {/* CANCELLATION POLICY - JSONB Multi-language */}
                <div>
                  <label className="block text-xs sm:text-sm font-semibold mb-2">Politika otkazivanja</label>
                  <div className="space-y-2">
                    <div>
                      <label className="text-[10px] sm:text-xs text-gray-600">Srpski (SR)</label>
                      <Textarea
                        value={selectedApartment.cancellation_policy?.sr || ''}
                        onChange={(e) => setSelectedApartment({ 
                          ...selectedApartment, 
                          cancellation_policy: { 
                            ...selectedApartment.cancellation_policy || { sr: '', en: '', de: '', it: '' },
                            sr: e.target.value
                          }
                        })}
                        placeholder="Besplatno otkazivanje do 7 dana pre dolaska..."
                        rows={3}
                        className="text-xs sm:text-sm"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] sm:text-xs text-gray-600">English (EN)</label>
                      <Textarea
                        value={selectedApartment.cancellation_policy?.en || ''}
                        onChange={(e) => setSelectedApartment({ 
                          ...selectedApartment, 
                          cancellation_policy: { 
                            ...selectedApartment.cancellation_policy || { sr: '', en: '', de: '', it: '' },
                            en: e.target.value
                          }
                        })}
                        placeholder="Free cancellation up to 7 days before arrival..."
                        rows={3}
                        className="text-xs sm:text-sm"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] sm:text-xs text-gray-600">Deutsch (DE)</label>
                      <Textarea
                        value={selectedApartment.cancellation_policy?.de || ''}
                        onChange={(e) => setSelectedApartment({ 
                          ...selectedApartment, 
                          cancellation_policy: { 
                            ...selectedApartment.cancellation_policy || { sr: '', en: '', de: '', it: '' },
                            de: e.target.value
                          }
                        })}
                        placeholder="Kostenlose Stornierung bis 7 Tage vor Anreise..."
                        rows={3}
                        className="text-xs sm:text-sm"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] sm:text-xs text-gray-600">Italiano (IT)</label>
                      <Textarea
                        value={selectedApartment.cancellation_policy?.it || ''}
                        onChange={(e) => setSelectedApartment({ 
                          ...selectedApartment, 
                          cancellation_policy: { 
                            ...selectedApartment.cancellation_policy || { sr: '', en: '', de: '', it: '' },
                            it: e.target.value
                          }
                        })}
                        placeholder="Cancellazione gratuita fino a 7 giorni prima dell'arrivo..."
                        rows={3}
                        className="text-xs sm:text-sm"
                      />
                    </div>
                  </div>
                </div>

                {/* SEASONAL PRICING - JSONB */}
                <div className="border rounded-lg p-3 sm:p-4 bg-teal-50">
                  <label className="block text-xs sm:text-sm font-bold mb-2 sm:mb-3 text-teal-900">📅 Sezonske cene</label>
                  <p className="text-[10px] sm:text-xs text-gray-600 mb-2">JSON format: [{'{'}&#34;season&#34;: &#34;summer&#34;, &#34;start_date&#34;: &#34;2024-06-01&#34;, &#34;end_date&#34;: &#34;2024-08-31&#34;, &#34;price_eur&#34;: 60{'}'}]</p>
                  <Textarea
                    value={JSON.stringify(selectedApartment.seasonal_pricing || [], null, 2)}
                    onChange={(e) => {
                      try {
                        const parsed = JSON.parse(e.target.value)
                        setSelectedApartment({ ...selectedApartment, seasonal_pricing: parsed })
                      } catch {
                        // Invalid JSON, don't update
                      }
                    }}
                    placeholder='[{"season": "summer", "start_date": "2024-06-01", "end_date": "2024-08-31", "price_eur": 60}]'
                    rows={5}
                    className="text-xs sm:text-sm font-mono"
                  />
                </div>
              </TabsContent>

              {/* Tab 5: SEO */}
              <TabsContent value="seo" className="space-y-4 sm:space-y-6">
                <div className="space-y-3 sm:space-y-4">
                  {/* Slug */}
                  <div>
                    <label className="block text-xs sm:text-sm font-semibold mb-2">URL Slug *</label>
                    <Input
                      value={selectedApartment.slug || ''}
                      onChange={(e) => setSelectedApartment({ ...selectedApartment, slug: e.target.value })}
                      placeholder="apartman-deluxe"
                      className="text-xs sm:text-sm h-8 sm:h-9 font-mono"
                    />
                    <p className="text-[10px] sm:text-xs text-gray-500 mt-1">
                      Samo mala slova, brojevi i crtice. Auto-generiše se iz srpskog imena.
                    </p>
                  </div>

                  {/* Meta Title */}
                  <div>
                    <label className="block text-xs sm:text-sm font-semibold mb-2">Meta naslov (SEO)</label>
                    <div className="space-y-2 sm:space-y-3">
                      <div>
                        <label className="text-[10px] sm:text-xs text-gray-600">Srpski (SR)</label>
                        <Input
                          value={selectedApartment.meta_title?.sr || ''}
                          onChange={(e) => setSelectedApartment({ 
                            ...selectedApartment, 
                            meta_title: { 
                              ...selectedApartment.meta_title || { sr: '', en: '', de: '', it: '' },
                              sr: e.target.value
                            }
                          })}
                          placeholder="Apartman Standard - Komforan smeštaj"
                          maxLength={60}
                          className="text-xs sm:text-sm h-8 sm:h-9"
                        />
                        <p className="text-[10px] sm:text-xs text-gray-500 mt-1">{(selectedApartment.meta_title?.sr || '').length}/60</p>
                      </div>
                      <div>
                        <label className="text-[10px] sm:text-xs text-gray-600">English (EN)</label>
                        <Input
                          value={selectedApartment.meta_title?.en || ''}
                          onChange={(e) => setSelectedApartment({ 
                            ...selectedApartment, 
                            meta_title: { 
                              ...selectedApartment.meta_title || { sr: '', en: '', de: '', it: '' },
                              en: e.target.value
                            }
                          })}
                          placeholder="Standard Apartment - Comfortable"
                          maxLength={60}
                          className="text-xs sm:text-sm h-8 sm:h-9"
                        />
                        <p className="text-[10px] sm:text-xs text-gray-500 mt-1">{(selectedApartment.meta_title?.en || '').length}/60</p>
                      </div>
                      <div>
                        <label className="text-[10px] sm:text-xs text-gray-600">Deutsch (DE)</label>
                        <Input
                          value={selectedApartment.meta_title?.de || ''}
                          onChange={(e) => setSelectedApartment({ 
                            ...selectedApartment, 
                            meta_title: { 
                              ...selectedApartment.meta_title || { sr: '', en: '', de: '', it: '' },
                              de: e.target.value
                            }
                          })}
                          placeholder="Standard Wohnung - Komfortabel"
                          maxLength={60}
                          className="text-xs sm:text-sm h-8 sm:h-9"
                        />
                        <p className="text-[10px] sm:text-xs text-gray-500 mt-1">{(selectedApartment.meta_title?.de || '').length}/60</p>
                      </div>
                      <div>
                        <label className="text-[10px] sm:text-xs text-gray-600">Italiano (IT)</label>
                        <Input
                          value={selectedApartment.meta_title?.it || ''}
                          onChange={(e) => setSelectedApartment({ 
                            ...selectedApartment, 
                            meta_title: { 
                              ...selectedApartment.meta_title || { sr: '', en: '', de: '', it: '' },
                              it: e.target.value
                            }
                          })}
                          placeholder="Appartamento Standard - Confortevole"
                          maxLength={60}
                          className="text-xs sm:text-sm h-8 sm:h-9"
                        />
                        <p className="text-[10px] sm:text-xs text-gray-500 mt-1">{(selectedApartment.meta_title?.it || '').length}/60</p>
                      </div>
                    </div>
                  </div>

                  {/* Meta Description */}
                  <div>
                    <label className="block text-xs sm:text-sm font-semibold mb-2">Meta opis (SEO)</label>
                    <div className="space-y-2 sm:space-y-3">
                      <div>
                        <label className="text-[10px] sm:text-xs text-gray-600">Srpski (SR)</label>
                        <Textarea
                          value={selectedApartment.meta_description?.sr || ''}
                          onChange={(e) => setSelectedApartment({ 
                            ...selectedApartment, 
                            meta_description: { 
                              ...selectedApartment.meta_description || { sr: '', en: '', de: '', it: '' },
                              sr: e.target.value
                            }
                          })}
                          placeholder="Udoban apartman sa 2 spavaće sobe..."
                          rows={2}
                          maxLength={160}
                          className="text-xs sm:text-sm"
                        />
                        <p className="text-[10px] sm:text-xs text-gray-500 mt-1">{(selectedApartment.meta_description?.sr || '').length}/160</p>
                      </div>
                      <div>
                        <label className="text-[10px] sm:text-xs text-gray-600">English (EN)</label>
                        <Textarea
                          value={selectedApartment.meta_description?.en || ''}
                          onChange={(e) => setSelectedApartment({ 
                            ...selectedApartment, 
                            meta_description: { 
                              ...selectedApartment.meta_description || { sr: '', en: '', de: '', it: '' },
                              en: e.target.value
                            }
                          })}
                          placeholder="Comfortable apartment with 2 bedrooms..."
                          rows={2}
                          maxLength={160}
                          className="text-xs sm:text-sm"
                        />
                        <p className="text-[10px] sm:text-xs text-gray-500 mt-1">{(selectedApartment.meta_description?.en || '').length}/160</p>
                      </div>
                      <div>
                        <label className="text-[10px] sm:text-xs text-gray-600">Deutsch (DE)</label>
                        <Textarea
                          value={selectedApartment.meta_description?.de || ''}
                          onChange={(e) => setSelectedApartment({ 
                            ...selectedApartment, 
                            meta_description: { 
                              ...selectedApartment.meta_description || { sr: '', en: '', de: '', it: '' },
                              de: e.target.value
                            }
                          })}
                          placeholder="Komfortable Wohnung mit 2 Schlafzimmern..."
                          rows={2}
                          maxLength={160}
                          className="text-xs sm:text-sm"
                        />
                        <p className="text-[10px] sm:text-xs text-gray-500 mt-1">{(selectedApartment.meta_description?.de || '').length}/160</p>
                      </div>
                      <div>
                        <label className="text-[10px] sm:text-xs text-gray-600">Italiano (IT)</label>
                        <Textarea
                          value={selectedApartment.meta_description?.it || ''}
                          onChange={(e) => setSelectedApartment({ 
                            ...selectedApartment, 
                            meta_description: { 
                              ...selectedApartment.meta_description || { sr: '', en: '', de: '', it: '' },
                              it: e.target.value
                            }
                          })}
                          placeholder="Appartamento confortevole con 2 camere da letto..."
                          rows={2}
                          maxLength={160}
                          className="text-xs sm:text-sm"
                        />
                        <p className="text-[10px] sm:text-xs text-gray-500 mt-1">{(selectedApartment.meta_description?.it || '').length}/160</p>
                      </div>
                    </div>
                  </div>

                  {/* Meta Keywords */}
                  <div>
                    <label className="block text-xs sm:text-sm font-semibold mb-2">Ključne reči (SEO)</label>
                    <Input
                      value={selectedApartment.meta_keywords?.sr || ''}
                      onChange={(e) => setSelectedApartment({ 
                        ...selectedApartment, 
                        meta_keywords: { 
                          sr: e.target.value,
                          en: selectedApartment.meta_keywords?.en || '',
                          de: selectedApartment.meta_keywords?.de || '',
                          it: selectedApartment.meta_keywords?.it || ''
                        }
                      })}
                      placeholder="apartman, smeštaj, izdavanje"
                      className="text-xs sm:text-sm h-8 sm:h-9"
                    />
                    <p className="text-[10px] sm:text-xs text-gray-500 mt-1">Odvojite zarezom</p>
                  </div>

                  {/* Google Preview */}
                  <div className="border rounded-lg p-3 sm:p-4 bg-gray-50">
                    <label className="block text-xs sm:text-sm font-semibold mb-2 sm:mb-3">Google pregled</label>
                    <div className="bg-white p-3 sm:p-4 rounded border">
                      <div className="text-blue-600 text-sm sm:text-base hover:underline cursor-pointer break-words">
                        {selectedApartment.meta_title?.sr || selectedApartment.name.sr || 'Naslov apartmana'}
                      </div>
                      <div className="text-green-700 text-[10px] sm:text-xs mt-1 break-all">
                        apartmani-jovca.com › sr › apartments › {selectedApartment.slug || 'slug'}
                      </div>
                      <div className="text-gray-600 text-[10px] sm:text-xs mt-1.5 sm:mt-2 break-words">
                        {selectedApartment.meta_description?.sr || (selectedApartment.description?.sr ? selectedApartment.description.sr.substring(0, 160) : 'Opis apartmana...')}
                      </div>
                    </div>
                  </div>
                </div>
              </TabsContent>

              {/* Tab 6: Location */}
              <TabsContent value="location" className="space-y-4 sm:space-y-6">
                <div className="space-y-3 sm:space-y-4">
                  {/* Address */}
                  <div>
                    <label className="block text-xs sm:text-sm font-semibold mb-2">Adresa</label>
                    <Input
                      value={selectedApartment.address || ''}
                      onChange={(e) => setSelectedApartment({ ...selectedApartment, address: e.target.value })}
                      placeholder="Ulica i broj"
                      className="text-xs sm:text-sm h-8 sm:h-9"
                    />
                  </div>

                  {/* City and Postal Code */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4">
                    <div>
                      <label className="block text-xs sm:text-sm font-semibold mb-2">Grad *</label>
                      <Input
                        value={selectedApartment.city || ''}
                        onChange={(e) => setSelectedApartment({ ...selectedApartment, city: e.target.value })}
                        placeholder="Herceg Novi"
                        className="text-xs sm:text-sm h-8 sm:h-9"
                      />
                    </div>
                    <div>
                      <label className="block text-xs sm:text-sm font-semibold mb-2">Poštanski broj</label>
                      <Input
                        value={selectedApartment.postal_code || ''}
                        onChange={(e) => setSelectedApartment({ ...selectedApartment, postal_code: e.target.value })}
                        placeholder="85340"
                        className="text-xs sm:text-sm h-8 sm:h-9"
                      />
                    </div>
                  </div>

                  {/* Country */}
                  <div>
                    <label className="block text-xs sm:text-sm font-semibold mb-2">Država</label>
                    <Input
                      value={selectedApartment.country || 'Crna Gora'}
                      onChange={(e) => setSelectedApartment({ ...selectedApartment, country: e.target.value })}
                      placeholder="Crna Gora"
                      className="text-xs sm:text-sm h-8 sm:h-9"
                    />
                  </div>

                  {/* GPS Coordinates with Map Picker */}
                  <div>
                    <label className="block text-xs sm:text-sm font-semibold mb-2">GPS Koordinate</label>
                    <LocationPicker
                      latitude={selectedApartment.latitude ?? undefined}
                      longitude={selectedApartment.longitude ?? undefined}
                      onLocationChange={(lat, lng) => {
                        setSelectedApartment({
                          ...selectedApartment,
                          latitude: lat,
                          longitude: lng
                        })
                      }}
                    />
                  </div>

                  {/* Manual GPS Input (optional) */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4">
                    <div>
                      <label className="block text-xs sm:text-sm font-semibold mb-2">Latitude (ručno)</label>
                      <Input
                        type="number"
                        step="0.000001"
                        value={selectedApartment.latitude ?? ''}
                        onChange={(e) => setSelectedApartment({ ...selectedApartment, latitude: e.target.value ? parseFloat(e.target.value) : undefined })}
                        placeholder="42.4511"
                        className="text-xs sm:text-sm h-8 sm:h-9"
                      />
                    </div>
                    <div>
                      <label className="block text-xs sm:text-sm font-semibold mb-2">Longitude (ručno)</label>
                      <Input
                        type="number"
                        step="0.000001"
                        value={selectedApartment.longitude ?? ''}
                        onChange={(e) => setSelectedApartment({ ...selectedApartment, longitude: e.target.value ? parseFloat(e.target.value) : undefined })}
                        placeholder="18.5311"
                        className="text-xs sm:text-sm h-8 sm:h-9"
                      />
                    </div>
                  </div>

                  <p className="text-[10px] sm:text-xs text-gray-500">
                    Klikni na mapu da odabereš lokaciju ili unesi koordinate ručno.
                  </p>
                </div>
              </TabsContent>
            </Tabs>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 mt-4 sm:mt-6 pt-4 sm:pt-6 border-t">
              <Button
                variant="outline"
                onClick={() => {
                  setIsEditing(false)
                  setSelectedApartment(null)
                }}
                className="text-xs sm:text-sm h-9 order-2 sm:order-1"
              >
                Otkaži
              </Button>
              <Button
                onClick={handleSave}
                disabled={saving}
                className="gap-2 text-xs sm:text-sm h-9 order-1 sm:order-2"
              >
                {saving ? (
                  <>
                    <Loader2 className="h-3 w-3 sm:h-4 sm:w-4 animate-spin" />
                    Čuvanje...
                  </>
                ) : (
                  <>
                    <Save className="h-3 w-3 sm:h-4 sm:w-4" />
                    Sačuvaj
                  </>
                )}
              </Button>
              {selectedApartment.slug && (
                <Button
                  variant="outline"
                  className="gap-2 text-xs sm:text-sm h-9 order-3 sm:ml-auto"
                  onClick={() => {
                    const userLang = navigator.language.split('-')[0] || 'sr'
                    const lang = ['sr', 'en', 'de', 'it'].includes(userLang) ? userLang : 'sr'
                    window.open(`/${lang}/apartments/${selectedApartment.slug}`, '_blank')
                  }}
                >
                  <Eye className="h-3 w-3 sm:h-4 sm:w-4" />
                  Pregled
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader className="p-4 sm:p-6">
            <CardTitle className="text-base sm:text-lg">Postojeći apartmani</CardTitle>
          </CardHeader>
          <CardContent className="p-4 sm:p-6 pt-0">
            <div className="space-y-3 sm:space-y-4">
              {apartments.length === 0 ? (
                <p className="text-center text-gray-600 py-8 text-xs sm:text-sm">Nema apartmana. Dodajte prvi apartman.</p>
              ) : (
                apartments.map((apt) => (
                  <div key={apt.id} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-3 sm:p-4 border rounded-lg hover:bg-gray-50">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-sm sm:text-base truncate">{apt.name.sr}</h3>
                      <p className="text-xs sm:text-sm text-gray-600 truncate">
                        {apt.capacity} gostiju • {apt.size_sqm}m² • €{apt.base_price_eur}/noć
                      </p>
                      <p className="text-[10px] sm:text-xs text-gray-500 mt-1 truncate">/{apt.slug}</p>
                    </div>
                    <div className="flex gap-2 flex-shrink-0">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEdit(apt)}
                        className="flex-1 sm:flex-none text-xs h-8"
                      >
                        Izmeni
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          const userLang = navigator.language.split('-')[0] || 'sr'
                          const lang = ['sr', 'en', 'de', 'it'].includes(userLang) ? userLang : 'sr'
                          window.open(`/${lang}/apartments/${apt.slug}`, '_blank')
                        }}
                        className="h-8 w-8 p-0"
                      >
                        <Eye className="h-3 w-3 sm:h-4 sm:w-4" />
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => apt.id && handleDelete(apt.id)}
                        className="h-8 w-8 p-0"
                      >
                        <Trash2 className="h-3 w-3 sm:h-4 sm:w-4" />
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
