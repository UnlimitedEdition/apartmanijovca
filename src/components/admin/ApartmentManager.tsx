'use client'

import { useState, useEffect, useCallback } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/card'
import Image from 'next/image'
import { Button } from '../../components/ui/button'
import { Badge } from '../../components/ui/badge'
import { Input } from '../../components/ui/input'
import { Textarea } from '../../components/ui/textarea'
import { Label } from '../../components/ui/label'
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '../../components/ui/table'
import { 
  Plus, 
  Pencil, 
  Trash2, 
  Loader2, 
  AlertCircle, 
  CheckCircle2,
  XCircle,
  Image as ImageIcon,
  DollarSign,
  Users,
  Home
} from 'lucide-react'
import { MultiLanguageText, LocalizedApartment } from '../../lib/types/database'

// Use LocalizedApartment type from database types
type Apartment = LocalizedApartment

// Form data with multi-language fields
interface ApartmentFormData {
  name: MultiLanguageText
  description: MultiLanguageText
  bed_type: MultiLanguageText
  capacity: number
  base_price_eur: number
  images: string[]
  amenities: string[]
  status: 'active' | 'inactive' | 'maintenance'
}

const BED_TYPES = [
  { value: 'single', label: { sr: 'Jedan krevet', en: 'Single Bed', de: 'Einzelbett', it: 'Letto Singolo' } },
  { value: 'double', label: { sr: 'Bračni krevet', en: 'Double Bed', de: 'Doppelbett', it: 'Letto Matrimoniale' } },
  { value: 'twin', label: { sr: 'Dva odvojena kreveta', en: 'Twin Beds', de: 'Zwei Einzelbetten', it: 'Due Letti Singoli' } },
  { value: 'queen', label: { sr: 'Queen krevet', en: 'Queen Bed', de: 'Queen-Bett', it: 'Letto Queen' } },
  { value: 'king', label: { sr: 'King krevet', en: 'King Bed', de: 'King-Bett', it: 'Letto King' } }
]

const initialFormData: ApartmentFormData = {
  name: { sr: '', en: '', de: '', it: '' },
  description: { sr: '', en: '', de: '', it: '' },
  bed_type: { sr: 'Bračni krevet', en: 'Double Bed', de: 'Doppelbett', it: 'Letto Matrimoniale' },
  capacity: 2,
  base_price_eur: 0,
  images: [],
  amenities: [],
  status: 'active'
}

export default function ApartmentManager() {
  const [apartments, setApartments] = useState<Apartment[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [formData, setFormData] = useState<ApartmentFormData>(initialFormData)
  const [saving, setSaving] = useState(false)
  const [imageInput, setImageInput] = useState('')

  const fetchApartments = useCallback(async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/admin/apartments')
      if (!response.ok) throw new Error('Failed to fetch apartments')
      const data = await response.json()
      setApartments(data.apartments || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchApartments()
  }, [fetchApartments])

  const resetForm = () => {
    setFormData(initialFormData)
    setImageInput('')
    setIsEditing(false)
    setEditingId(null)
  }

  const handleEdit = (apartment: Apartment) => {
    // When editing, we need to fetch the full apartment data with JSONB fields
    // The list view shows localized strings, but we need the full multi-language objects for editing
    // For now, we'll fetch from the detail endpoint
    fetch(`/api/admin/apartments/${apartment.id}`)
      .then(res => res.json())
      .then(data => {
        setFormData({
          name: data.name,
          description: data.description,
          bed_type: data.bed_type,
          capacity: data.capacity,
          base_price_eur: data.base_price_eur,
          images: data.images || [],
          amenities: data.amenities || [],
          status: data.status
        })
        setEditingId(apartment.id)
        setIsEditing(true)
      })
      .catch(err => {
        setError('Failed to load apartment details for editing')
        console.error(err)
      })
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Da li ste sigurni da želite da obrišete ovaj apartman?')) return

    try {
      setSaving(true)
      const response = await fetch(`/api/admin/apartments/${id}`, {
        method: 'DELETE'
      })
      
      if (!response.ok) throw new Error('Failed to delete apartment')
      
      setApartments(prev => prev.filter(a => a.id !== id))
      setSuccess('Apartman je uspešno obrisan')
      setTimeout(() => setSuccess(null), 3000)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete apartment')
    } finally {
      setSaving(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      setSaving(true)
      setError(null)

      const url = editingId 
        ? `/api/admin/apartments/${editingId}`
        : '/api/admin/apartments'
      
      const method = editingId ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to save apartment')
      }

      const savedApartment = await response.json()
      
      if (editingId) {
        setApartments(prev => prev.map(a => 
          a.id === editingId ? { ...a, ...savedApartment } : a
        ))
        setSuccess('Apartman je uspešno ažuriran')
      } else {
        setApartments(prev => [...prev, savedApartment])
        setSuccess('Apartman je uspešno kreiran')
      }
      
      resetForm()
      setTimeout(() => setSuccess(null), 3000)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save apartment')
    } finally {
      setSaving(false)
    }
  }

  const addImage = () => {
    if (imageInput.trim() && imageInput.startsWith('http')) {
      setFormData(prev => ({
        ...prev,
        images: [...prev.images, imageInput.trim()]
      }))
      setImageInput('')
    }
  }

  const removeImage = (index: number) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }))
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('sr-RS', {
      style: 'currency',
      currency: 'EUR'
    }).format(amount)
  }

  const getTypeBadge = (status: string) => {
    const statusLabels: Record<string, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }> = {
      active: { label: 'Aktivan', variant: 'default' },
      inactive: { label: 'Neaktivan', variant: 'secondary' },
      maintenance: { label: 'Održavanje', variant: 'outline' }
    }
    const statusInfo = statusLabels[status] || { label: status, variant: 'outline' }
    return (
      <Badge variant={statusInfo.variant}>
        {statusInfo.label}
      </Badge>
    )
  }

  return (
    <div className="space-y-6">
      {/* Error/Success Messages */}
      {error && (
        <Card className="border-destructive">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 text-destructive">
              <AlertCircle className="h-5 w-5" />
              <p>{error}</p>
            </div>
          </CardContent>
        </Card>
      )}

      {success && (
        <Card className="border-green-500 bg-green-50 dark:bg-green-950">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 text-green-700 dark:text-green-300">
              <CheckCircle2 className="h-5 w-5" />
              <p>{success}</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Apartment Form */}
      <Card>
        <CardHeader>
          <CardTitle>{isEditing ? 'Izmeni apartman' : 'Dodaj novi apartman'}</CardTitle>
          <CardDescription>
            {isEditing ? 'Ažurirajte detalje apartmana ispod' : 'Popunite podatke da kreirate novu listu za apartman'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Multi-language Name Fields */}
            <div className="space-y-4">
              <Label className="text-base font-semibold">Naziv apartmana (svi jezici) *</Label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pl-4 border-l-2">
                <div className="space-y-2">
                  <Label htmlFor="name-sr" className="text-sm text-muted-foreground">Srpski (SR)</Label>
                  <Input
                    id="name-sr"
                    value={formData.name.sr}
                    onChange={(e) => setFormData(prev => ({ 
                      ...prev, 
                      name: { ...prev.name, sr: e.target.value }
                    }))}
                    placeholder="npr., Deluxe Apartman"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="name-en" className="text-sm text-muted-foreground">English (EN)</Label>
                  <Input
                    id="name-en"
                    value={formData.name.en}
                    onChange={(e) => setFormData(prev => ({ 
                      ...prev, 
                      name: { ...prev.name, en: e.target.value }
                    }))}
                    placeholder="e.g., Deluxe Apartment"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="name-de" className="text-sm text-muted-foreground">Deutsch (DE)</Label>
                  <Input
                    id="name-de"
                    value={formData.name.de}
                    onChange={(e) => setFormData(prev => ({ 
                      ...prev, 
                      name: { ...prev.name, de: e.target.value }
                    }))}
                    placeholder="z.B., Deluxe Apartment"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="name-it" className="text-sm text-muted-foreground">Italiano (IT)</Label>
                  <Input
                    id="name-it"
                    value={formData.name.it}
                    onChange={(e) => setFormData(prev => ({ 
                      ...prev, 
                      name: { ...prev.name, it: e.target.value }
                    }))}
                    placeholder="es., Appartamento Deluxe"
                    required
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Bed Type */}
              <div className="space-y-2">
                <Label htmlFor="bed_type">Tip kreveta *</Label>
                <select
                  id="bed_type"
                  value={BED_TYPES.findIndex(bt => 
                    bt.label.sr === formData.bed_type.sr
                  )}
                  onChange={(e) => {
                    const selectedBedType = BED_TYPES[parseInt(e.target.value)]
                    setFormData(prev => ({ ...prev, bed_type: selectedBedType.label }))
                  }}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  required
                >
                  {BED_TYPES.map((bedType, index) => (
                    <option key={bedType.value} value={index}>
                      {bedType.label.sr}
                    </option>
                  ))}
                </select>
              </div>

              {/* Capacity */}
              <div className="space-y-2">
                <Label htmlFor="capacity">Kapacitet (broj gostiju) *</Label>
                <Input
                  id="capacity"
                  type="number"
                  min={1}
                  max={20}
                  value={formData.capacity}
                  onChange={(e) => setFormData(prev => ({ ...prev, capacity: parseInt(e.target.value) || 1 }))}
                  required
                />
              </div>

              {/* Price */}
              <div className="space-y-2">
                <Label htmlFor="price">Cena po noćenju (EUR) *</Label>
                <Input
                  id="price"
                  type="number"
                  min={0}
                  step={0.01}
                  value={formData.base_price_eur}
                  onChange={(e) => setFormData(prev => ({ ...prev, base_price_eur: parseFloat(e.target.value) || 0 }))}
                  required
                />
              </div>

              {/* Status */}
              <div className="space-y-2">
                <Label htmlFor="status">Status *</Label>
                <select
                  id="status"
                  value={formData.status}
                  onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value as 'active' | 'inactive' | 'maintenance' }))}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  required
                >
                  <option value="active">Aktivan</option>
                  <option value="inactive">Neaktivan</option>
                  <option value="maintenance">Održavanje</option>
                </select>
              </div>
            </div>

            {/* Multi-language Description Fields */}
            <div className="space-y-4">
              <Label className="text-base font-semibold">Opis (svi jezici) *</Label>
              <div className="grid grid-cols-1 gap-4 pl-4 border-l-2">
                <div className="space-y-2">
                  <Label htmlFor="description-sr" className="text-sm text-muted-foreground">Srpski (SR)</Label>
                  <Textarea
                    id="description-sr"
                    value={formData.description.sr}
                    onChange={(e) => setFormData(prev => ({ 
                      ...prev, 
                      description: { ...prev.description, sr: e.target.value }
                    }))}
                    placeholder="Opišite apartman..."
                    rows={3}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description-en" className="text-sm text-muted-foreground">English (EN)</Label>
                  <Textarea
                    id="description-en"
                    value={formData.description.en}
                    onChange={(e) => setFormData(prev => ({ 
                      ...prev, 
                      description: { ...prev.description, en: e.target.value }
                    }))}
                    placeholder="Describe the apartment..."
                    rows={3}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description-de" className="text-sm text-muted-foreground">Deutsch (DE)</Label>
                  <Textarea
                    id="description-de"
                    value={formData.description.de}
                    onChange={(e) => setFormData(prev => ({ 
                      ...prev, 
                      description: { ...prev.description, de: e.target.value }
                    }))}
                    placeholder="Beschreiben Sie die Wohnung..."
                    rows={3}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description-it" className="text-sm text-muted-foreground">Italiano (IT)</Label>
                  <Textarea
                    id="description-it"
                    value={formData.description.it}
                    onChange={(e) => setFormData(prev => ({ 
                      ...prev, 
                      description: { ...prev.description, it: e.target.value }
                    }))}
                    placeholder="Descrivi l'appartamento..."
                    rows={3}
                    required
                  />
                </div>
              </div>
            </div>

            {/* Images */}
            <div className="space-y-2">
              <Label>Slike (URL-ovi)</Label>
              <div className="flex gap-2">
                <Input
                  value={imageInput}
                  onChange={(e) => setImageInput(e.target.value)}
                  placeholder="https://example.com/image.jpg"
                  className="flex-1"
                />
                <Button type="button" variant="secondary" onClick={addImage}>
                  <Plus className="h-4 w-4 mr-2" />
                  Dodaj
                </Button>
              </div>
              
              {formData.images.length > 0 && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                  {formData.images.map((url, index) => (
                    <div key={index} className="relative group">
                      <Image
                        src={url}
                        alt={`Apartment image ${index + 1}`}
                        width={200}
                        height={100}
                        className="w-full h-24 object-cover rounded-md"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = 'https://placehold.co/400x300?text=No+Image'
                        }}
                      />
                      <button
                        type="button"
                        onClick={() => removeImage(index)}
                        className="absolute top-1 right-1 bg-destructive text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <XCircle className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Submit Buttons */}
            <div className="flex gap-2">
              <Button type="submit" disabled={saving} className="bg-primary hover:scale-[1.02] active:scale-95 transition-all">
                {saving ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Čuvanje...
                  </>
                ) : isEditing ? (
                  <>
                    <CheckCircle2 className="h-4 w-4 mr-2" />
                    Ažuriraj apartman
                  </>
                ) : (
                  <>
                    <Plus className="h-4 w-4 mr-2" />
                    Kreiraj apartman
                  </>
                )}
              </Button>
              
              {isEditing && (
                <Button type="button" variant="outline" onClick={resetForm}>
                  Otkaži
                </Button>
              )}
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Apartments List */}
      <Card>
        <CardHeader>
          <CardTitle>Postojeći apartmani</CardTitle>
          <CardDescription>Upravljajte svojim listama apartmana</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : apartments.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Home className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Nema pronađenih apartmana. Kreirajte svoj prvi apartman iznad.</p>
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Naziv</TableHead>
                    <TableHead>Tip kreveta</TableHead>
                    <TableHead>Kapacitet</TableHead>
                    <TableHead>Cena/Noć</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Slike</TableHead>
                    <TableHead className="text-right">Akcije</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {apartments.map((apartment) => (
                    <TableRow key={apartment.id}>
                      <TableCell className="font-medium">{apartment.name}</TableCell>
                      <TableCell>{apartment.bed_type}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Users className="h-4 w-4 text-muted-foreground" />
                          {apartment.capacity}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1 font-medium">
                          <DollarSign className="h-4 w-4 text-muted-foreground" />
                          {formatCurrency(apartment.base_price_eur)}
                        </div>
                      </TableCell>
                      <TableCell>{getTypeBadge(apartment.status)}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <ImageIcon className="h-4 w-4 text-muted-foreground" />
                          {apartment.images?.length || 0}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleEdit(apartment)}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDelete(apartment.id)}
                            disabled={saving}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
