'use client'
/* eslint-disable @next/next/no-img-element -- Admin previews support arbitrary uploaded image URLs with inline fallback. */

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

import { useAdminApartments } from './apartments/useAdminApartments'

export default function EnhancedApartmentManager() {
  const {
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
  } = useAdminApartments()

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
                <TabsList className="grid grid-cols-6 w-full h-auto gap-0.5 sm:gap-1 p-0.5 sm:p-1">
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
                  {/* Serbian name */}
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
                    </div>
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
                  {/* Serbian description only */}
                  <div>
                    <label className="block text-xs sm:text-sm font-semibold mb-2">Detaljan opis apartmana (srpski) *</label>
                    <Textarea
                      value={selectedApartment.description.sr}
                      onChange={(e) => setSelectedApartment({
                        ...selectedApartment,
                        description: { ...selectedApartment.description, sr: e.target.value }
                      })}
                      placeholder="Opišite apartman..."
                      rows={4}
                      required
                      className="text-xs sm:text-sm"
                    />
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

                  {/* Kitchen Type - Serbian only */}
                  <div>
                    <label className="block text-xs sm:text-sm font-semibold mb-2">Tip kuhinje</label>
                    <Input
                      value={selectedApartment.kitchen_type?.sr || ''}
                      onChange={(e) => setSelectedApartment({
                        ...selectedApartment,
                        kitchen_type: {
                          ...(selectedApartment.kitchen_type || { sr: '', en: '', de: '', it: '' }),
                          sr: e.target.value
                        }
                      })}
                      placeholder="Potpuno opremljena kuhinja"
                      className="text-xs sm:text-sm h-8 sm:h-9"
                    />
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

                  {/* House Rules - Serbian only */}
                  <div>
                    <label className="block text-xs sm:text-sm font-semibold mb-2">Pravila kuće (detaljan tekst)</label>
                    <Textarea
                      value={selectedApartment.house_rules?.sr || ''}
                      onChange={(e) => setSelectedApartment({
                        ...selectedApartment,
                        house_rules: {
                          ...(selectedApartment.house_rules || { sr: '', en: '', de: '', it: '' }),
                          sr: e.target.value
                        }
                      })}
                      placeholder="Molimo vas da poštujete pravila kuće..."
                      rows={3}
                      className="text-xs sm:text-sm"
                    />
                  </div>
                </div>
              </TabsContent>

              {/* Tab 3: Gallery */}
              <TabsContent value="gallery" className="space-y-4 sm:space-y-6">
                <div className="space-y-3 sm:space-y-4">
                  {/* Simplified Gallery Section */}
                  <div className="border rounded-lg p-4 bg-gradient-to-br from-blue-50 to-indigo-50">
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <label className="block text-sm font-bold text-blue-900">📸 Galerija slika</label>
                        <p className="text-xs text-gray-600 mt-1">Upload slike ili dodaj URL. Prva slika je glavna.</p>
                      </div>
                      <Button
                        variant="default"
                        size="sm"
                        onClick={() => {
                          const input = document.createElement('input')
                          input.type = 'file'
                          input.accept = 'image/*'
                          input.onchange = async (e) => {
                            const file = (e.target as HTMLInputElement).files?.[0]
                            if (!file) return
                            
                            const formData = new FormData()
                            formData.append('file', file)
                            formData.append('folder', 'apartmani-jovca/apartments')
                            
                            try {
                              const response = await fetch('/api/upload', {
                                method: 'POST',
                                body: formData
                              })
                              
                              if (!response.ok) {
                                const errorData = await response.json()
                                throw new Error(errorData.error || 'Upload failed')
                              }
                              
                              const data = await response.json()
                              setSelectedApartment({
                                ...selectedApartment,
                                images: [...(selectedApartment.images || []), data.url]
                              })
                            } catch (err) {
                              alert('Greška pri upload-u slike: ' + (err instanceof Error ? err.message : 'Unknown error'))
                            }
                          }
                          input.click()
                        }}
                        className="gap-2"
                      >
                        <Plus className="h-4 w-4" />
                        Upload sliku
                      </Button>
                    </div>

                    {/* Image Grid with Preview */}
                    <div className="space-y-3">
                      {(selectedApartment.images || []).length === 0 ? (
                        <div className="text-center py-8 text-gray-500 text-sm border-2 border-dashed rounded-lg bg-white">
                          Nema slika. Kliknite &quot;Upload sliku&quot; ili dodajte URL ispod.
                        </div>
                      ) : (
                        <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
                          {(selectedApartment.images || []).map((url, index) => (
                            <div key={index} className="relative group">
                              <div className="aspect-video rounded-lg overflow-hidden border-2 border-white shadow-md bg-gray-100">
                                <img 
                                  src={url} 
                                  alt={`Slika ${index + 1}`}
                                  className="w-full h-full object-cover"
                                  onError={(e) => {
                                    (e.target as HTMLImageElement).src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="100" height="100"%3E%3Crect fill="%23ddd" width="100" height="100"/%3E%3Ctext x="50%25" y="50%25" text-anchor="middle" dy=".3em" fill="%23999" font-size="12"%3ENo Image%3C/text%3E%3C/svg%3E'
                                  }}
                                />
                              </div>
                              {index === 0 && (
                                <div className="absolute top-2 left-2 bg-blue-600 text-white text-xs px-2 py-1 rounded font-bold shadow">
                                  Glavna slika
                                </div>
                              )}
                              <Button
                                variant="destructive"
                                size="sm"
                                onClick={() => {
                                  const newImages = selectedApartment.images?.filter((_, i) => i !== index) || []
                                  setSelectedApartment({ ...selectedApartment, images: newImages })
                                }}
                                className="absolute top-2 right-2 h-7 w-7 p-0 opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                              <div className="absolute bottom-2 left-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                                Slika #{index + 1}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Manual URL Input */}
                      <div className="pt-2">
                        <details className="bg-white rounded-lg border">
                          <summary className="cursor-pointer px-3 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-50">
                            ➕ Dodaj sliku preko URL-a (napredna opcija)
                          </summary>
                          <div className="p-3 space-y-2 border-t">
                            <Input
                              placeholder="https://res.cloudinary.com/..."
                              className="text-xs h-8"
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                  const input = e.target as HTMLInputElement
                                  if (input.value.trim()) {
                                    setSelectedApartment({
                                      ...selectedApartment,
                                      images: [...(selectedApartment.images || []), input.value.trim()]
                                    })
                                    input.value = ''
                                  }
                                }
                              }}
                            />
                            <p className="text-xs text-gray-500">Pritisnite Enter da dodate</p>
                          </div>
                        </details>
                      </div>
                    </div>
                  </div>

                  {/* Video & Virtual Tour */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
                    <div className="border rounded-lg p-3 bg-purple-50">
                      <label className="block text-xs font-bold mb-2 text-purple-900">🎥 Video URL</label>
                      <Input
                        value={selectedApartment.video_url || ''}
                        onChange={(e) => setSelectedApartment({ ...selectedApartment, video_url: e.target.value })}
                        placeholder="https://youtube.com/watch?v=..."
                        className="text-xs h-8"
                      />
                      <p className="text-xs text-gray-600 mt-1">YouTube ili Vimeo link</p>
                    </div>
                    <div className="border rounded-lg p-3 bg-green-50">
                      <label className="block text-xs font-bold mb-2 text-green-900">🌐 Virtuelna tura</label>
                      <Input
                        value={selectedApartment.virtual_tour_url || ''}
                        onChange={(e) => setSelectedApartment({ ...selectedApartment, virtual_tour_url: e.target.value })}
                        placeholder="https://..."
                        className="text-xs h-8"
                      />
                      <p className="text-xs text-gray-600 mt-1">360° tura ili Matterport</p>
                    </div>
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
                    <label className="block text-xs sm:text-sm font-semibold mb-2">Max. boravak (noći) <span className="font-normal text-muted-foreground">— prazno = bez ograničenja</span></label>
                    <Input
                      type="number"
                      min="0"
                      max="365"
                      value={selectedApartment.max_stay_nights || ''}
                      onChange={(e) => setSelectedApartment({ ...selectedApartment, max_stay_nights: e.target.value === '' ? 0 : parseInt(e.target.value) })}
                      placeholder="Bez ograničenja"
                      className="text-xs sm:text-sm h-8 sm:h-9"
                    />
                  </div>
                </div>

                {/* Cancellation Policy - Serbian only */}
                <div>
                  <label className="block text-xs sm:text-sm font-semibold mb-2">Politika otkazivanja</label>
                  <Textarea
                    value={selectedApartment.cancellation_policy?.sr || ''}
                    onChange={(e) => setSelectedApartment({
                      ...selectedApartment,
                      cancellation_policy: {
                        ...(selectedApartment.cancellation_policy || { sr: '', en: '', de: '', it: '' }),
                        sr: e.target.value
                      }
                    })}
                    placeholder="Besplatno otkazivanje do 7 dana pre dolaska..."
                    rows={3}
                    className="text-xs sm:text-sm"
                  />
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
                        apartmani-jovca.vercel.app › sr › apartments › {selectedApartment.slug || 'slug'}
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
                      value={selectedApartment.country || 'Srbija'}
                      onChange={(e) => setSelectedApartment({ ...selectedApartment, country: e.target.value })}
                      placeholder="Srbija"
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
                <>
                  {/* Mobile View - Cards with Image */}
                  <div className="md:hidden space-y-3">
                    {apartments.map((apt) => (
                      <div key={apt.id} className="border rounded-lg overflow-hidden hover:bg-gray-50">
                        <div className="flex gap-3 p-3">
                          {/* Image Thumbnail */}
                          <div className="w-20 h-20 flex-shrink-0 bg-gray-100 rounded overflow-hidden">
                            {apt.images && apt.images.length > 0 ? (
                              <img 
                                src={apt.images[0]} 
                                alt={apt.name.sr}
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                  (e.target as HTMLImageElement).src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="100" height="100"%3E%3Crect fill="%23e5e7eb" width="100" height="100"/%3E%3Ctext x="50%25" y="50%25" text-anchor="middle" dy=".3em" fill="%239ca3af" font-size="10"%3ENo Image%3C/text%3E%3C/svg%3E'
                                }}
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">
                                Nema
                              </div>
                            )}
                          </div>

                          {/* Content */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-2 mb-1">
                              <h3 className="font-semibold text-sm truncate">{apt.name.sr}</h3>
                              <div className={`px-1.5 py-0.5 rounded text-xs font-semibold flex-shrink-0 ${
                                apt.status === 'active' ? 'bg-green-100 text-green-800' :
                                apt.status === 'maintenance' ? 'bg-yellow-100 text-yellow-800' :
                                'bg-gray-100 text-gray-800'
                              }`}>
                                {apt.status === 'active' ? '✓' : apt.status === 'maintenance' ? '⚠' : '✕'}
                              </div>
                            </div>
                            <p className="text-xs text-gray-600 mb-1">
                              {apt.capacity} gostiju • {apt.size_sqm}m²
                            </p>
                            <div className="text-sm font-bold text-primary">€{apt.base_price_eur}/noć</div>
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex gap-2 px-3 pb-3">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEdit(apt)}
                            className="flex-1 text-xs h-8"
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
                            <Eye className="h-3 w-3" />
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => apt.id && handleDelete(apt.id)}
                            className="h-8 w-8 p-0"
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Desktop View - Enhanced Cards with More Details */}
                  <div className="hidden md:grid md:grid-cols-1 lg:grid-cols-2 gap-4">
                    {apartments.map((apt) => (
                      <Card key={apt.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                        <div className="flex">
                          {/* Image Preview */}
                          <div className="w-32 lg:w-40 flex-shrink-0 bg-gray-100">
                            {apt.images && apt.images.length > 0 ? (
                              <img 
                                src={apt.images[0]} 
                                alt={apt.name.sr}
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                  (e.target as HTMLImageElement).src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="100" height="100"%3E%3Crect fill="%23e5e7eb" width="100" height="100"/%3E%3Ctext x="50%25" y="50%25" text-anchor="middle" dy=".3em" fill="%239ca3af" font-size="12"%3ENo Image%3C/text%3E%3C/svg%3E'
                                }}
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">
                                Nema slike
                              </div>
                            )}
                          </div>

                          {/* Content */}
                          <div className="flex-1 p-4 flex flex-col">
                            {/* Header */}
                            <div className="flex items-start justify-between gap-3 mb-3">
                              <div className="flex-1 min-w-0">
                                <h3 className="font-bold text-base truncate">{apt.name.sr}</h3>
                                <p className="text-xs text-gray-500 truncate">/{apt.slug}</p>
                              </div>
                              <div className={`px-2 py-1 rounded text-xs font-semibold flex-shrink-0 ${
                                apt.status === 'active' ? 'bg-green-100 text-green-800' :
                                apt.status === 'maintenance' ? 'bg-yellow-100 text-yellow-800' :
                                'bg-gray-100 text-gray-800'
                              }`}>
                                {apt.status === 'active' ? 'Aktivan' : apt.status === 'maintenance' ? 'Održavanje' : 'Neaktivan'}
                              </div>
                            </div>

                            {/* Details Grid */}
                            <div className="grid grid-cols-2 gap-x-4 gap-y-2 mb-3 text-xs">
                              <div className="flex items-center gap-1.5">
                                <span className="text-gray-500">👥</span>
                                <span className="font-medium">{apt.capacity} gostiju</span>
                              </div>
                              <div className="flex items-center gap-1.5">
                                <span className="text-gray-500">📐</span>
                                <span className="font-medium">{apt.size_sqm}m²</span>
                              </div>
                              <div className="flex items-center gap-1.5">
                                <span className="text-gray-500">🛏️</span>
                                <span className="font-medium">
                                  {apt.bed_counts && Object.keys(apt.bed_counts).length > 0 
                                    ? `${Object.values(apt.bed_counts).reduce((a, b) => a + b, 0)} kreveta`
                                    : 'N/A'}
                                </span>
                              </div>
                              <div className="flex items-center gap-1.5">
                                <span className="text-gray-500">🚿</span>
                                <span className="font-medium">{apt.bathroom_count || 1} kupatilo</span>
                              </div>
                              {apt.floor !== undefined && (
                                <div className="flex items-center gap-1.5">
                                  <span className="text-gray-500">🏢</span>
                                  <span className="font-medium">Sprat {apt.floor}</span>
                                </div>
                              )}
                              {apt.balcony && (
                                <div className="flex items-center gap-1.5">
                                  <span className="text-gray-500">🌿</span>
                                  <span className="font-medium">Balkon</span>
                                </div>
                              )}
                            </div>

                            {/* Amenities Preview */}
                            {apt.selected_amenities && apt.selected_amenities.length > 0 && (
                              <div className="mb-3">
                                <div className="flex flex-wrap gap-1">
                                  {apt.selected_amenities.slice(0, 4).map((amenityId) => {
                                    const amenity = AMENITY_OPTIONS.find(a => a.id === amenityId)
                                    return amenity ? (
                                      <span key={amenityId} className="text-xs bg-blue-50 text-blue-700 px-2 py-0.5 rounded">
                                        {amenity.label.sr}
                                      </span>
                                    ) : null
                                  })}
                                  {apt.selected_amenities.length > 4 && (
                                    <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded">
                                      +{apt.selected_amenities.length - 4}
                                    </span>
                                  )}
                                </div>
                              </div>
                            )}

                            {/* Footer */}
                            <div className="flex items-center justify-between mt-auto pt-3 border-t">
                              <div>
                                <div className="text-lg font-bold text-primary">€{apt.base_price_eur}</div>
                                <div className="text-xs text-gray-500">po noći</div>
                              </div>
                              <div className="flex gap-2">
                                <Button
                                  variant="default"
                                  size="sm"
                                  onClick={() => handleEdit(apt)}
                                  className="text-xs h-9 px-4"
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
                                  className="h-9 w-9 p-0"
                                  title="Pregled"
                                >
                                  <Eye className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="destructive"
                                  size="sm"
                                  onClick={() => apt.id && handleDelete(apt.id)}
                                  className="h-9 w-9 p-0"
                                  title="Obriši"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                </>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
