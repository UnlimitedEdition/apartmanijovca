'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/card'
import { Button } from '../../components/ui/button'
import { Badge } from '../../components/ui/badge'
import { Input } from '../../components/ui/input'
import { Label } from '../../components/ui/label'
import { 
  Plus, 
  Pencil, 
  Trash2, 
  Loader2, 
  AlertCircle, 
  CheckCircle2,
  XCircle,
  RefreshCw,
  Camera,
  Image as ImageIcon
} from 'lucide-react'

interface GalleryItem {
  id: string
  url: string
  caption: string | Record<string, string> | null
  tags: string[]
  display_order: number
  created_at: string
}

const LANGUAGES = [
  { code: 'sr', label: 'SR', flag: '🇷🇸' },
  { code: 'en', label: 'EN', flag: '🇬🇧' },
  { code: 'de', label: 'DE', flag: '🇩🇪' },
  { code: 'it', label: 'IT', flag: '🇮🇹' }
]

export default function GalleryManager() {
  const [items, setItems] = useState<GalleryItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [selectedLang, setSelectedLang] = useState('sr')
  const [formData, setFormData] = useState({
    url: '',
    captions: { sr: '', en: '', de: '', it: '' } as Record<string, string>,
    tags: [] as string[],
    display_order: 0
  })
  const [tagInput, setTagInput] = useState('')
  const [saving, setSaving] = useState(false)
  const [translating, setTranslating] = useState(false)
  const [uploading, setUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const fetchItems = useCallback(async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/admin/gallery')
      if (!response.ok) throw new Error('Failed to fetch gallery items')
      const data = await response.json()
      setItems(data || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchItems()
  }, [fetchItems])

  const resetForm = () => {
    setFormData({
      url: '',
      captions: { sr: '', en: '', de: '', it: '' },
      tags: [],
      display_order: 0
    })
    setTagInput('')
    setIsEditing(false)
    setEditingId(null)
    setSelectedLang('sr')
  }

  const parseCaption = (caption: string | Record<string, string> | null): Record<string, string> => {
    if (!caption) return { sr: '', en: '', de: '', it: '' }
    if (typeof caption === 'string') {
      try {
        const parsed = JSON.parse(caption)
        if (typeof parsed === 'object') return { ...{ sr: '', en: '', de: '', it: '' }, ...parsed }
        return { sr: caption, en: '', de: '', it: '' }
      } catch {
        return { sr: caption, en: '', de: '', it: '' }
      }
    }
    return { ...{ sr: '', en: '', de: '', it: '' }, ...caption }
  }

  const handleEdit = (item: GalleryItem) => {
    setFormData({
      url: item.url,
      captions: parseCaption(item.caption),
      tags: item.tags || [],
      display_order: item.display_order
    })
    setEditingId(item.id)
    setIsEditing(true)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Da li ste sigurni da želite da obrišete ovu sliku iz galerije?')) return

    try {
      setSaving(true)
      const response = await fetch(`/api/admin/gallery/${id}`, {
        method: 'DELETE'
      })
      
      if (!response.ok) throw new Error('Failed to delete item')
      
      setItems(prev => prev.filter(a => a.id !== id))
      setSuccess('Slika je uspešno obrisana')
      setTimeout(() => setSuccess(null), 3000)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete item')
    } finally {
      setSaving(false)
    }
  }

  const handleFileUpload = async (file: File) => {
    try {
      setUploading(true)
      setError(null)

      const formData = new FormData()
      formData.append('image', file)

      const response = await fetch('/api/admin/gallery/upload', {
        method: 'POST',
        body: formData
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Neuspešno otpremanje slike')
      }

      const { url } = await response.json()
      setFormData(prev => ({ ...prev, url }))
      setSuccess('Slika je uspešno otpremljena!')
      setTimeout(() => setSuccess(null), 3000)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Greška pri otpremanju')
    } finally {
      setUploading(false)
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      handleFileUpload(file)
    }
  }

  const triggerFileInput = () => {
    fileInputRef.current?.click()
  }

  const handleAutoTranslate = async () => {
    const textToTranslate = formData.captions.sr
    if (!textToTranslate) {
      setError('Prvo unesite naslov na srpskom jeziku.')
      return
    }

    try {
      setTranslating(true)
      setError(null)
      const response = await fetch('/api/admin/translate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: textToTranslate,
          targetLangs: ['en', 'de', 'it']
        })
      })

      if (!response.ok) throw new Error('Translation failed')
      const { translations } = await response.json()
      
      setFormData(prev => ({
        ...prev,
        captions: {
          ...prev.captions,
          ...translations
        }
      }))
      setSuccess('Prevodi su uspešno generisani!')
      setTimeout(() => setSuccess(null), 2000)
    } catch (err) {
      console.error('Translation error:', err)
      setError('Došlo je do greške prilikom prevođenja.')
    } finally {
      setTranslating(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      setSaving(true)
      setError(null)

      const url = editingId 
        ? `/api/admin/gallery/${editingId}`
        : '/api/admin/gallery'
      
      const method = editingId ? 'PATCH' : 'POST'

      const { captions, ...rest } = formData
      const payload = {
        ...rest,
        caption: JSON.stringify(captions)
      }

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to save item')
      }

      const savedItem = await response.json()
      
      if (editingId) {
        setItems(prev => prev.map(a => 
          a.id === editingId ? { ...a, ...savedItem } : a
        ).sort((a, b) => a.display_order - b.display_order))
        setSuccess('Stavka je uspešno ažurirana')
      } else {
        setItems(prev => [...prev, savedItem].sort((a, b) => a.display_order - b.display_order))
        setSuccess('Slika je uspešno dodata u galeriju')
      }
      
      resetForm()
      setTimeout(() => setSuccess(null), 3000)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save item')
    } finally {
      setSaving(false)
    }
  }

  const addTag = () => {
    if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, tagInput.trim()]
      }))
      setTagInput('')
    }
  }

  const removeTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(t => t !== tagToRemove)
    }))
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Messages */}
      {error && (
        <Card className="border-destructive">
          <CardContent className="pt-4 sm:pt-6 p-3 sm:p-6">
            <div className="flex items-center gap-2 text-destructive text-xs sm:text-sm">
              <AlertCircle className="h-4 w-4 sm:h-5 sm:w-5 flex-shrink-0" />
              <p className="break-words">{error}</p>
            </div>
          </CardContent>
        </Card>
      )}

      {success && (
        <Card className="border-green-500 bg-green-50 dark:bg-green-950">
          <CardContent className="pt-4 sm:pt-6 p-3 sm:p-6">
            <div className="flex items-center gap-2 text-green-700 dark:text-green-300 text-xs sm:text-sm">
              <CheckCircle2 className="h-4 w-4 sm:h-5 sm:w-5 flex-shrink-0" />
              <p className="break-words">{success}</p>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        {/* Form Column */}
        <div className="lg:col-span-1">
          <Card className="lg:sticky lg:top-6">
            <CardHeader className="p-4 sm:p-6">
              <CardTitle className="text-base sm:text-lg">{isEditing ? 'Izmeni sliku' : 'Dodaj sliku'}</CardTitle>
              <CardDescription className="text-xs sm:text-sm">Upravljajte vizuelnim sadržajem galerije</CardDescription>
            </CardHeader>
            <CardContent className="p-4 sm:p-6 pt-0">
              <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4">
                <div className="space-y-2">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                    <Label htmlFor="url" className="text-xs sm:text-sm">URL Slike *</Label>
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleFileChange}
                      accept="image/*"
                      className="hidden"
                    />
                    <Button 
                      type="button" 
                      variant="outline" 
                      size="sm" 
                      onClick={triggerFileInput}
                      disabled={uploading}
                      className="h-7 text-[10px] gap-1 border-primary/30 text-primary hover:bg-primary/5 w-full sm:w-auto"
                    >
                      {uploading ? (
                        <Loader2 className="h-3 w-3 animate-spin" />
                      ) : (
                        <Camera className="h-3 w-3" />
                      )}
                      <span className="truncate">Izaberi sliku</span>
                    </Button>
                  </div>
                  <Input
                    id="url"
                    value={formData.url}
                    onChange={(e) => setFormData(prev => ({ ...prev, url: e.target.value }))}
                    placeholder="https://..."
                    required
                    className="text-xs sm:text-sm"
                  />
                  {formData.url && (
                    <div className="relative aspect-video rounded-md overflow-hidden border mt-2 bg-muted">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img 
                        src={formData.url} 
                        alt="Preview" 
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = 'https://placehold.co/600x400?text=Invalid+URL'
                        }}
                      />
                    </div>
                  )}
                </div>

                <div className="space-y-2 sm:space-y-3 pb-2 border-b">
                  <div className="flex items-center justify-between gap-2">
                    <Label className="text-xs sm:text-sm">Naslov / Opis</Label>
                    <div className="flex bg-muted rounded-md p-0.5">
                      {LANGUAGES.map(lang => (
                        <button
                          key={lang.code}
                          type="button"
                          onClick={() => setSelectedLang(lang.code)}
                          className={`px-1.5 sm:px-2 py-0.5 sm:py-1 text-[9px] sm:text-[10px] font-bold rounded transition-colors ${
                            selectedLang === lang.code ? 'bg-background shadow-sm' : 'hover:bg-background/50'
                          }`}
                        >
                          {lang.code.toUpperCase()}
                        </button>
                      ))}
                    </div>
                  </div>
                  
                  <div className="space-y-2 sm:space-y-3">
                    <div className="relative">
                      <Input
                        id="caption"
                        value={formData.captions[selectedLang] || ''}
                        onChange={(e) => setFormData(prev => ({ 
                          ...prev, 
                          captions: { ...prev.captions, [selectedLang]: e.target.value } 
                        }))}
                        placeholder={selectedLang === 'sr' ? 'npr. Pogled na jezero' : `Prevod ${selectedLang.toUpperCase()}...`}
                        className="pr-10 text-xs sm:text-sm"
                      />
                      <Badge variant="outline" className="absolute right-2 top-2 py-0 px-1 text-[8px] opacity-70">
                        {selectedLang.toUpperCase()}
                      </Badge>
                    </div>

                    {selectedLang === 'sr' && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={handleAutoTranslate}
                        disabled={translating || !formData.captions.sr}
                        className="w-full text-blue-600 hover:text-blue-700 hover:bg-blue-50 text-[10px] sm:text-xs gap-1.5 h-7 sm:h-8"
                      >
                        {translating ? (
                          <Loader2 className="h-3 w-3 animate-spin" />
                        ) : (
                          <RefreshCw className="h-3 w-3" />
                        )}
                        <span className="truncate">✨ Prevedi automatski</span>
                      </Button>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="order" className="text-xs sm:text-sm">Redosled prikaza</Label>
                  <Input
                    id="order"
                    type="number"
                    value={formData.display_order}
                    onChange={(e) => setFormData(prev => ({ ...prev, display_order: parseInt(e.target.value) || 0 }))}
                    className="text-xs sm:text-sm"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-xs sm:text-sm">Tagovi</Label>
                  <div className="flex gap-2">
                    <Input
                      value={tagInput}
                      onChange={(e) => setTagInput(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                      placeholder="npr. Enterijer"
                      className="text-xs sm:text-sm"
                    />
                    <Button type="button" variant="outline" size="icon" onClick={addTag} className="h-9 w-9 flex-shrink-0">
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-1 mt-2">
                    {formData.tags.map(tag => (
                      <Badge key={tag} variant="secondary" className="gap-1 text-[10px] sm:text-xs">
                        <span className="truncate max-w-[100px]">{tag}</span>
                        <button type="button" onClick={() => removeTag(tag)}>
                          <XCircle className="h-3 w-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-2 pt-2">
                  <Button type="submit" disabled={saving} className="flex-1 text-xs sm:text-sm h-9">
                    {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : isEditing ? 'Sačuvaj' : 'Dodaj'}
                  </Button>
                  {isEditing && (
                    <Button type="button" variant="outline" onClick={resetForm} className="text-xs sm:text-sm h-9">
                      Otkaži
                    </Button>
                  )}
                </div>
              </form>
            </CardContent>
          </Card>
        </div>

        {/* List Column */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between p-4 sm:p-6">
              <div>
                <CardTitle className="text-base sm:text-lg">Slike u galeriji</CardTitle>
                <CardDescription className="text-xs sm:text-sm">Ukupno {items.length} slika</CardDescription>
              </div>
              <ImageIcon className="h-4 w-4 sm:h-5 sm:w-5 text-muted-foreground" />
            </CardHeader>
            <CardContent className="p-4 sm:p-6 pt-0">
              {loading ? (
                <div className="flex justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : items.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground border-2 border-dashed rounded-lg text-xs sm:text-sm">
                  <p>Galerija je prazna. Dodajte prvu sliku.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  {items.map((item) => (
                    <div key={item.id} className="group relative border rounded-lg overflow-hidden bg-card transition-all hover:shadow-md">
                      <div className="aspect-video relative bg-muted">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img 
                          src={item.url} 
                          alt={parseCaption(item.caption).sr || ''} 
                          className="w-full h-full object-cover transition-transform group-hover:scale-105"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = 'https://placehold.co/600x400?text=Error'
                          }}
                        />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 p-2">
                          <Button size="sm" variant="secondary" onClick={() => handleEdit(item)} className="text-[10px] sm:text-xs h-7 sm:h-8 px-2 sm:px-3">
                            <Pencil className="h-3 w-3 sm:h-4 sm:w-4 sm:mr-1" />
                            <span className="hidden sm:inline">Izmeni</span>
                          </Button>
                          <Button size="sm" variant="destructive" onClick={() => handleDelete(item.id)} className="text-[10px] sm:text-xs h-7 sm:h-8 px-2 sm:px-3">
                            <Trash2 className="h-3 w-3 sm:h-4 sm:w-4 sm:mr-1" />
                            <span className="hidden sm:inline">Obriši</span>
                          </Button>
                        </div>
                        <div className="absolute bottom-2 left-2 flex gap-1">
                          <Badge variant="secondary" className="bg-black/60 text-white border-none backdrop-blur-sm text-[9px] sm:text-[10px] py-0 px-1.5">
                            #{item.display_order}
                          </Badge>
                        </div>
                      </div>
                      <div className="p-2 sm:p-3">
                        <p className="font-medium text-xs sm:text-sm truncate">{parseCaption(item.caption).sr || 'Bez naslova'}</p>
                        <div className="flex flex-wrap gap-1 mt-1.5 sm:mt-2">
                          {item.tags?.map(tag => (
                            <Badge key={tag} variant="outline" className="text-[9px] sm:text-[10px] py-0 px-1">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
