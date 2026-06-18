'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/card'
import { Button } from '../../components/ui/button'
import { Badge } from '../../components/ui/badge'
import { Input } from '../../components/ui/input'
import { Label } from '../../components/ui/label'
import {
  Pencil,
  Trash2,
  Loader2,
  AlertCircle,
  CheckCircle2,
  RefreshCw,
  Camera,
  Image as ImageIcon,
  Plus,
  X,
  FolderOpen
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
  { code: 'sr', label: 'SR' },
  { code: 'en', label: 'EN' },
  { code: 'de', label: 'DE' },
  { code: 'it', label: 'IT' }
]

const GALLERY_CATEGORIES = [
  'Enterijer',
  'Sobe',
  'Kuhinja',
  'Kupatilo',
  'Terasa',
  'Dvori?te',
  'Eksterijer',
  'Pogled',
  'Jezero',
  'Parking',
  'Detalji',
  'Okolina'
]

const EMPTY_CAPTIONS = { sr: '', en: '', de: '', it: '' }

export default function GalleryManager() {
  const [items, setItems] = useState<GalleryItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [selectedLang, setSelectedLang] = useState('sr')
  const [selectedFolder, setSelectedFolder] = useState(GALLERY_CATEGORIES[0])
  const [formData, setFormData] = useState({
    url: '',
    publicId: '',
    captions: { ...EMPTY_CAPTIONS } as Record<string, string>,
    display_order: 1
  })
  const [saving, setSaving] = useState(false)
  const [translating, setTranslating] = useState(false)
  const [uploading, setUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const parseCaption = (caption: string | Record<string, string> | null): Record<string, string> => {
    if (!caption) return { ...EMPTY_CAPTIONS }
    if (typeof caption === 'string') {
      try {
        const parsed = JSON.parse(caption)
        if (typeof parsed === 'object' && parsed !== null) return { ...EMPTY_CAPTIONS, ...parsed }
        return { ...EMPTY_CAPTIONS, sr: caption }
      } catch {
        return { ...EMPTY_CAPTIONS, sr: caption }
      }
    }
    return { ...EMPTY_CAPTIONS, ...caption }
  }

  const getItemsInFolder = useCallback((folder: string) => {
    return items
      .filter(item => item.tags?.includes(folder))
      .sort((a, b) => {
        if (a.display_order !== b.display_order) return a.display_order - b.display_order
        return a.id.localeCompare(b.id)
      })
  }, [items])

  const getNextFolderOrder = useCallback((folder: string) => {
    const folderItems = getItemsInFolder(folder)
    if (folderItems.length === 0) return 1
    return Math.max(...folderItems.map(item => item.display_order)) + 1
  }, [getItemsInFolder])

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
      publicId: '',
      captions: { ...EMPTY_CAPTIONS },
      display_order: getNextFolderOrder(selectedFolder)
    })
    setIsEditing(false)
    setIsFormOpen(false)
    setEditingId(null)
    setSelectedLang('sr')
  }

  const openAddForm = () => {
    setError(null)
    setFormData({
      url: '',
      publicId: '',
      captions: { ...EMPTY_CAPTIONS },
      display_order: getNextFolderOrder(selectedFolder)
    })
    setIsEditing(false)
    setEditingId(null)
    setSelectedLang('sr')
    setIsFormOpen(true)
  }

  const handleEdit = (item: GalleryItem) => {
    setError(null)
    setFormData({
      url: item.url,
      publicId: '',
      captions: parseCaption(item.caption),
      display_order: item.display_order
    })
    setEditingId(item.id)
    setIsEditing(true)
    setSelectedLang('sr')
    setIsFormOpen(true)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Da li ste sigurni da ?elite da obri?ete ovu sliku iz galerije?')) return

    try {
      setSaving(true)
      const response = await fetch(`/api/admin/gallery/${id}`, {
        method: 'DELETE'
      })

      if (!response.ok) throw new Error('Failed to delete item')

      setItems(prev => prev.filter(a => a.id !== id))
      setSuccess('Slika je uspe?no obrisana')
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

      const uploadData = new FormData()
      uploadData.append('image', file)

      const response = await fetch('/api/admin/gallery/upload', {
        method: 'POST',
        body: uploadData
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Neuspe?no otpremanje slike')
      }

      const { url, publicId } = await response.json()
      setFormData(prev => ({ ...prev, url, publicId: publicId || '' }))
      setSuccess('Slika je uspe?no otpremljena!')
      setTimeout(() => setSuccess(null), 3000)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Gre?ka pri otpremanju')
    } finally {
      setUploading(false)
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      handleFileUpload(file)
    }
    e.target.value = ''
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
          en: translations.en,
          de: translations.de,
          it: translations.it
        }
      }))
      setSuccess('Prevodi su uspe?no generisani!')
      setTimeout(() => setSuccess(null), 2000)
    } catch (err) {
      console.error('Translation error:', err)
      setError('Do?lo je do gre?ke prilikom prevo?enja.')
    } finally {
      setTranslating(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      setSaving(true)
      setError(null)

      if (!formData.url) {
        setError('Prvo izaberite sliku za upload.')
        return
      }

      const url = editingId
        ? `/api/admin/gallery/${editingId}`
        : '/api/admin/gallery'

      const method = editingId ? 'PATCH' : 'POST'

      const payload = {
        url: formData.url,
        tags: [selectedFolder],
        display_order: formData.display_order,
        caption: JSON.stringify(formData.captions)
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

      await response.json()
      await fetchItems()

      setSuccess(editingId ? 'Stavka je uspe?no a?urirana' : 'Slika je uspe?no dodata u galeriju')
      resetForm()
      setTimeout(() => setSuccess(null), 3000)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save item')
    } finally {
      setSaving(false)
    }
  }

  const folderItems = getItemsInFolder(selectedFolder)
  const folderCounts = GALLERY_CATEGORIES.reduce<Record<string, number>>((counts, category) => {
    counts[category] = items.filter(item => item.tags?.includes(category)).length
    return counts
  }, {})

  return (
    <div className="space-y-4 sm:space-y-6">
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

      <Card>
        <CardHeader className="p-4 sm:p-6">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <CardTitle className="text-base sm:text-lg">Galerija</CardTitle>
              <CardDescription className="text-xs sm:text-sm">Izaberite folder i ure?ujte slike samo u tom folderu</CardDescription>
            </div>
            <Button onClick={openAddForm} className="h-9 gap-2 text-xs sm:text-sm sm:self-start">
              <Plus className="h-4 w-4" />
              Dodaj sliku
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-4 sm:p-6 pt-0 space-y-3 sm:space-y-4">
          <div className="space-y-2">
            <Label className="text-xs sm:text-sm">Izaberi folder</Label>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4">
              {GALLERY_CATEGORIES.map(category => {
                const selected = selectedFolder === category
                return (
                  <button
                    key={category}
                    type="button"
                    onClick={() => setSelectedFolder(category)}
                    className={`flex h-10 items-center justify-between rounded-md border px-3 text-left text-xs sm:text-sm transition-colors ${
                      selected ? 'border-primary bg-primary text-primary-foreground' : 'bg-background hover:bg-muted'
                    }`}
                  >
                    <span className="truncate">{category}</span>
                    <Badge variant={selected ? 'secondary' : 'outline'} className="ml-2 shrink-0 text-[10px]">
                      {folderCounts[category] || 0}
                    </Badge>
                  </button>
                )
              })}
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between p-4 sm:p-6">
          <div>
            <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
              <FolderOpen className="h-4 w-4 sm:h-5 sm:w-5" />
              {selectedFolder}
            </CardTitle>
            <CardDescription className="text-xs sm:text-sm">Ukupno {folderItems.length} slika u folderu</CardDescription>
          </div>
          <ImageIcon className="h-4 w-4 sm:h-5 sm:w-5 text-muted-foreground" />
        </CardHeader>
        <CardContent className="p-4 sm:p-6 pt-0">
          {loading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : folderItems.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground border-2 border-dashed rounded-lg text-xs sm:text-sm">
              <p>Folder je prazan. Dodajte prvu sliku.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
              {folderItems.map((item) => (
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
                        <span className="hidden sm:inline">Obri?i</span>
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
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {isFormOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-3 sm:p-6">
          <Card className="max-h-[92vh] w-full max-w-2xl overflow-hidden">
            <CardHeader className="flex flex-row items-start justify-between gap-4 border-b p-4 sm:p-6">
              <div>
                <CardTitle className="text-base sm:text-lg">{isEditing ? 'Izmeni sliku' : 'Dodaj sliku'}</CardTitle>
                <CardDescription className="text-xs sm:text-sm">Folder: {selectedFolder}</CardDescription>
              </div>
              <Button type="button" variant="ghost" size="sm" onClick={resetForm} className="h-8 w-8 p-0">
                <X className="h-4 w-4" />
              </Button>
            </CardHeader>
            <CardContent className="max-h-[78vh] overflow-y-auto p-4 sm:p-6">
              <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4">
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  accept="image/*"
                  className="hidden"
                />

                <div className="space-y-2">
                  <Label className="text-xs sm:text-sm">Upload slike *</Label>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={triggerFileInput}
                    disabled={uploading}
                    className="h-10 w-full gap-2 text-xs sm:text-sm"
                  >
                    {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Camera className="h-4 w-4" />}
                    {uploading ? 'Otpremanje...' : formData.url ? 'Promeni sliku' : 'Izaberi sliku'}
                  </Button>
                  {formData.url && (
                    <div className="relative aspect-video rounded-md overflow-hidden border bg-muted">
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
                          {lang.label}
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
                        {translating ? <Loader2 className="h-3 w-3 animate-spin" /> : <RefreshCw className="h-3 w-3" />}
                        <span className="truncate">Prevedi automatski</span>
                      </Button>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="order" className="text-xs sm:text-sm">Redosled prikaza u folderu</Label>
                  <Input
                    id="order"
                    type="number"
                    min={0}
                    value={formData.display_order}
                    onChange={(e) => setFormData(prev => ({ ...prev, display_order: parseInt(e.target.value, 10) || 0 }))}
                    className="text-xs sm:text-sm"
                  />
                </div>

                <div className="flex flex-col sm:flex-row gap-2 pt-2">
                  <Button type="submit" disabled={saving || uploading} className="flex-1 text-xs sm:text-sm h-9">
                    {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : isEditing ? 'Sa?uvaj' : 'Dodaj'}
                  </Button>
                  <Button type="button" variant="outline" onClick={resetForm} className="text-xs sm:text-sm h-9">
                    Otka?i
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
