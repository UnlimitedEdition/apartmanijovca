'use client'

import { useState, useEffect, useCallback, useRef, type ReactNode } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/card'
import { Button } from '../../components/ui/button'
import { Input } from '../../components/ui/input'
import { Textarea } from '../../components/ui/textarea'
import { Label } from '../../components/ui/label'
import { Badge } from '../../components/ui/badge'
import { 
  Save, 
  Loader2, 
  AlertCircle, 
  CheckCircle2,
  Globe,
  RefreshCw,
  Download,
  Upload
} from 'lucide-react'
import srMessages from '../../../messages/sr.json'
import enMessages from '../../../messages/en.json'
import deMessages from '../../../messages/de.json'
import itMessages from '../../../messages/it.json'
import { 
} from '../../lib/validations/content'

type Language = 'en' | 'de' | 'it' | 'sr'

export interface ContentField {
  key: string
  label: string
  type: 'text' | 'textarea'
  required?: boolean
}

export interface ContentSection {
  id: string
  name: string
  description: string
  fields: ContentField[]
}

interface ContentData {
  [key: string]: string
}

type MessagesFile = Record<string, unknown>

const MESSAGES_BY_LANGUAGE: Record<Language, MessagesFile> = {
  sr: srMessages as MessagesFile,
  en: enMessages as MessagesFile,
  de: deMessages as MessagesFile,
  it: itMessages as MessagesFile
}

function getNestedText(source: MessagesFile, key: string): string | undefined {
  const normalizedKey = key.startsWith('privacy.') || key.startsWith('terms.')
    ? 'legal.' + key
    : key

  const value = normalizedKey.split('.').reduce<unknown>((current, part) => {
    if (current && typeof current === 'object' && part in current) {
      return (current as Record<string, unknown>)[part]
    }
    return undefined
  }, source)

  return typeof value === 'string' ? value : undefined
}

const LANGUAGES: { code: Language; label: string; flag: string }[] = [
  { code: 'sr', label: 'Srpski', flag: '��' },
  { code: 'en', label: 'English', flag: '��' },
  { code: 'de', label: 'Deutsch', flag: '��' },
  { code: 'it', label: 'Italiano', flag: '��' }
]

const PRIVACY_TEXT_KEYS = ['privacy.title', 'privacy.intro', 'privacy.lastUpdated', 'privacy.s1.title', 'privacy.s1.content', 'privacy.s1.dataTitle', 'privacy.s1.item1', 'privacy.s1.item2', 'privacy.s1.item3', 'privacy.s1.item4', 'privacy.s1.item5', 'privacy.s2.title', 'privacy.s2.content', 'privacy.s2.item1', 'privacy.s2.item2', 'privacy.s2.item3', 'privacy.s2.item4', 'privacy.s3.title', 'privacy.s3.content', 'privacy.s3.item1', 'privacy.s3.item2', 'privacy.s3.item3', 'privacy.s4.title', 'privacy.s4.content', 'privacy.s4.item1', 'privacy.s4.item2', 'privacy.s4.item3', 'privacy.s5.title', 'privacy.s5.content', 'privacy.s5.item1', 'privacy.s5.item2', 'privacy.s5.item3', 'privacy.s5.item4', 'privacy.s6.title', 'privacy.s6.content', 'privacy.contact.title', 'privacy.contact.content']

const TERMS_TEXT_KEYS = ['terms.title', 'terms.intro', 'terms.lastUpdated', 'terms.s1.title', 'terms.s1.content', 'terms.s1.item1', 'terms.s1.item2', 'terms.s1.item3', 'terms.s1.item4', 'terms.s2.title', 'terms.s2.content', 'terms.s2.item1', 'terms.s2.item2', 'terms.s2.item3', 'terms.s3.title', 'terms.s3.content', 'terms.s3.cancellationTitle', 'terms.s3.item1', 'terms.s3.item2', 'terms.s3.item3', 'terms.s4.title', 'terms.s4.content', 'terms.s4.item1', 'terms.s4.item2', 'terms.s4.item3', 'terms.s4.item4', 'terms.s5.title', 'terms.s5.content', 'terms.s5.item1', 'terms.s5.item2', 'terms.s5.item3', 'terms.s6.title', 'terms.s6.content', 'terms.s7.title', 'terms.s7.content', 'terms.contact.title', 'terms.contact.content']

function createLegalFields(keys: string[]): ContentField[] {
  return keys.map(key => ({
    key,
    label: key,
    type: key.endsWith('.content') || key.endsWith('.intro') ? 'textarea' : 'text',
    required: key.endsWith('.title') || key.endsWith('.intro')
  }))
}

// ONLY MEANINGFUL TEXTUAL CONTENT - NO button labels, form labels, or UI messages
export const CONTENT_SECTIONS: ContentSection[] = [
  {
    id: 'home',
    name: 'Početna strana',
    description: 'Glavni tekstualni sadržaj početne stranice',
    fields: [
      { key: 'home.title', label: 'Hero - naslov', type: 'text', required: true },
      { key: 'home.subtitle', label: 'Hero - podnaslov', type: 'text', required: true },
      { key: 'home.features.title', label: 'Naše prednosti - naslov', type: 'text', required: true },
      { key: 'home.features.description', label: 'Naše prednosti - tekst', type: 'textarea', required: true },
      { key: 'home.featured.title', label: 'Apartmani - naslov', type: 'text', required: true },
      { key: 'home.featured.subtitle', label: 'Apartmani - tekst', type: 'textarea', required: true },
      { key: 'home.about.title', label: 'O nama - naslov', type: 'text', required: true },
      { key: 'home.about.content', label: 'O nama - tekst', type: 'textarea', required: true },
      { key: 'home.cta.ready', label: 'Završni poziv - naslov', type: 'text', required: true },
      { key: 'home.cta.subtitle', label: 'Završni poziv - tekst', type: 'textarea', required: true },
    ]
  },
  {
    id: 'apartments',
    name: 'Apartmani',
    description: 'Tekstualni sadržaj stranice apartmana',
    fields: [
      { key: 'apartments.title', label: 'Naslov stranice', type: 'text', required: true },
      { key: 'apartments.description', label: 'Opis stranice', type: 'textarea', required: true },
    ]
  },
  {
    id: 'attractions',
    name: 'Atrakcije',
    description: 'Tekstualni sadržaj stranice atrakcija',
    fields: [
      { key: 'attractions.title', label: 'Naslov stranice', type: 'text', required: true },
      { key: 'attractions.description', label: 'Opis stranice', type: 'textarea', required: true },
    ]
  },
  {
    id: 'location',
    name: 'Lokacija',
    description: 'Tekstualni sadržaj stranice lokacije',
    fields: [
      { key: 'location.title', label: 'Naslov stranice', type: 'text', required: true },
      { key: 'location.description', label: 'Opis stranice', type: 'textarea', required: true },
      { key: 'location.address', label: 'Naslov sekcije adrese', type: 'text' },
      { key: 'location.addressName', label: 'Naziv lokacije', type: 'text' },
      { key: 'location.addressStreet', label: 'Ulica i broj', type: 'text' },
      { key: 'location.addressLake', label: 'Jezero', type: 'text' },
      { key: 'location.addressCity', label: 'Grad i poštanski broj', type: 'text' },
      { key: 'location.googleMaps', label: 'Tekst dugmeta za Google Maps', type: 'text' },
      { key: 'location.callDirections', label: 'Tekst dugmeta za poziv', type: 'text' },
      { key: 'location.reachTitle', label: 'Naslov sekcije "Kako do nas"', type: 'text' },
      { key: 'location.byCarTitle', label: 'Naslov - Automobilom', type: 'text' },
      { key: 'location.byCarDesc', label: 'Uputstva za dolazak kolima', type: 'textarea' },
      { key: 'location.byBusTitle', label: 'Naslov - Autobusom', type: 'text' },
      { key: 'location.byBusDesc', label: 'Uputstva za dolazak autobusom', type: 'textarea' },
      { key: 'location.nearbyTitle', label: 'Naslov sekcije "U blizini"', type: 'text' },
      { key: 'location.bovanLake', label: 'Naziv - Bovansko jezero', type: 'text' },
      { key: 'location.bovanLakeDesc', label: 'Opis Bovanskog jezera', type: 'textarea' },
      { key: 'location.sokolica', label: 'Naziv - Tvrđava Sokolica', type: 'text' },
      { key: 'location.sokolicaDesc', label: 'Opis Sokolice', type: 'textarea' },
      { key: 'location.nis', label: 'Naziv - Niš', type: 'text' },
      { key: 'location.nisDesc', label: 'Opis Niša', type: 'textarea' },
    ]
  },
  {
    id: 'prices',
    name: 'Cene',
    description: 'Tekstualni sadržaj stranice cena',
    fields: [
      { key: 'prices.title', label: 'Naslov stranice', type: 'text', required: true },
      { key: 'prices.description', label: 'Opis stranice', type: 'textarea', required: true },
    ]
  },
  {
    id: 'contact',
    name: 'Kontakt',
    description: 'Tekstualni sadržaj stranice kontakta',
    fields: [
      { key: 'contact.title', label: 'Naslov stranice', type: 'text', required: true },
      { key: 'contact.description', label: 'Opis stranice', type: 'textarea', required: true },
    ]
  },
  {
    id: 'gallery',
    name: 'Galerija',
    description: 'Tekstualni sadržaj stranice galerije',
    fields: [
      { key: 'gallery.title', label: 'Naslov stranice', type: 'text', required: true },
      { key: 'gallery.description', label: 'Opis stranice', type: 'textarea', required: true },
    ]
  },
  {
    id: 'privacy',
    name: 'Politika privatnosti (GDPR)',
    description: 'Kompletan pravni tekst politike privatnosti',
    fields: createLegalFields(PRIVACY_TEXT_KEYS)
  },
  {
    id: 'terms',
    name: 'Uslovi korišćenja',
    description: 'Kompletan pravni tekst uslova korišćenja',
    fields: createLegalFields(TERMS_TEXT_KEYS)
  },
]

function buildDefaultContent(language: Language): ContentData {
  const messages = MESSAGES_BY_LANGUAGE[language]
  const data: ContentData = {}

  CONTENT_SECTIONS.forEach(section => {
    section.fields.forEach(field => {
      const value = getNestedText(messages, field.key)
      if (value !== undefined) data[field.key] = value
    })
  })

  data['home.hero.whatsAppLabel'] = 'WhatsApp'
  data['home.hero.viberLabel'] = 'Viber'

  const contactUs = getNestedText(messages, 'common.contactUs')
  if (contactUs !== undefined) data['home.faq.contactLink'] = contactUs

  const guest = getNestedText(messages, 'common.guest')
  if (guest !== undefined) data['home.testimonials.guestFallback'] = guest

  const perNight = getNestedText(messages, 'apartments.perNight')
  if (perNight !== undefined) data['home.featured.perNight'] = perNight

  return data
}

function createDefaultContentState(): Record<Language, ContentData> {
  return {
    en: buildDefaultContent('en'),
    de: buildDefaultContent('de'),
    it: buildDefaultContent('it'),
    sr: buildDefaultContent('sr')
  }
}

interface ContentEditorProps {
  selectedSection?: string
}

export default function ContentEditor({ selectedSection = 'home' }: ContentEditorProps) {
  const [selectedLanguage, setSelectedLanguage] = useState<Language>('sr')
  const [content, setContent] = useState<Record<Language, ContentData>>(() => createDefaultContentState())
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | ReactNode | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [hasChanges, setHasChanges] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  
  // Concurrent edit detection
  const [, setLastFetchedAt] = useState<Record<string, string>>({})
  
  // Retry state for exponential backoff
  const [retryCount, setRetryCount] = useState(0)
  const [isRetrying, setIsRetrying] = useState(false)
  const [lastError, setLastError] = useState<Error | null>(null)

  const sleep = (ms: number): Promise<void> => {
    return new Promise(resolve => setTimeout(resolve, ms))
  }

  // Fetch content from database
  const fetchContent = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      const response = await fetch('/api/admin/content')
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }

      const data = await response.json()
      
      // Transform flat key-value pairs into nested structure
      const transformedContent: Record<Language, ContentData> = createDefaultContentState()

      if (data.content && Array.isArray(data.content)) {
        data.content.forEach((item: { key: string; language: Language; value: string }) => {
          if (item.language && item.key && item.value !== undefined) {
            transformedContent[item.language][item.key] = item.value
          }
        })
      }

      setContent(transformedContent)
      
      // Track fetch timestamp for concurrent edit detection
      const timestamp = new Date().toISOString()
      const fetchTimestamps: Record<string, string> = {}
      LANGUAGES.forEach(lang => {
        CONTENT_SECTIONS.forEach(section => {
          fetchTimestamps[`${section.id}.${lang.code}`] = timestamp
        })
      })
      setLastFetchedAt(fetchTimestamps)
      
      setRetryCount(0)
      setLastError(null)
    } catch (err) {
      console.error('Error fetching content:', err)
      setError(
        <div className="space-y-2">
          <p className="font-bold">Greška pri učitavanju sadržaja</p>
          <p className="text-sm">{err instanceof Error ? err.message : 'Nepoznata greška'}</p>
        </div>
      )
      setLastError(err instanceof Error ? err : new Error(String(err)))
    } finally {
      setLoading(false)
      setIsRetrying(false)
    }
  }, [])

  useEffect(() => {
    fetchContent()
  }, [fetchContent])

  // Handle content change
  const handleContentChange = (key: string, value: string) => {
    setContent(prev => ({
      ...prev,
      [selectedLanguage]: {
        ...prev[selectedLanguage],
        [key]: value
      }
    }))
    setHasChanges(true)
    setSuccess(null)
  }

  // Save content to database
  const handleSave = async () => {
    try {
      setSaving(true)
      setError(null)
      setSuccess(null)

      const currentSection = CONTENT_SECTIONS.find(s => s.id === selectedSection)
      if (!currentSection) {
        throw new Error('Sekcija nije pronađena')
      }

      // Validate required fields
      const sectionContent = content[selectedLanguage]
      const missingFields: string[] = []
      
      currentSection.fields.forEach(field => {
        if (field.required && !sectionContent[field.key]) {
          missingFields.push(field.label)
        }
      })

      if (missingFields.length > 0) {
        throw new Error(`Obavezna polja nisu popunjena: ${missingFields.join(', ')}`)
      }

      // Prepare data for API — use section-based format: { section, lang, data }
      // Route expects field keys WITHOUT the section prefix (e.g., 'title' not 'home.title')
      const sectionPrefix = selectedSection + '.'
      const data: Record<string, string> = {}
      currentSection.fields.forEach(field => {
        const fieldKey = field.key.startsWith(sectionPrefix)
          ? field.key.slice(sectionPrefix.length)
          : field.key
        data[fieldKey] = sectionContent[field.key] || ''
      })

      const response = await fetch('/api/admin/content', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ section: selectedSection, lang: selectedLanguage, data, published: true })
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || `HTTP ${response.status}`)
      }

      setSuccess('Sadržaj uspešno sačuvan!')
      setHasChanges(false)
      setRetryCount(0)
      
      // Refresh content to get latest data
      await fetchContent()
    } catch (err) {
      console.error('Error saving content:', err)
      setError(
        <div className="space-y-2">
          <p className="font-bold">Greška pri čuvanju sadržaja</p>
          <p className="text-sm">{err instanceof Error ? err.message : 'Nepoznata greška'}</p>
        </div>
      )
      setLastError(err instanceof Error ? err : new Error(String(err)))
    } finally {
      setSaving(false)
    }
  }

  // Export content as JSON
  const handleExport = () => {
    const dataStr = JSON.stringify(content, null, 2)
    const dataBlob = new Blob([dataStr], { type: 'application/json' })
    const url = URL.createObjectURL(dataBlob)
    const link = document.createElement('a')
    link.href = url
    link.download = `content-export-${new Date().toISOString().split('T')[0]}.json`
    link.click()
    URL.revokeObjectURL(url)
  }

  // Import content from JSON
  const handleImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const imported = JSON.parse(e.target?.result as string)
        
        // Validate structure
        if (!imported || typeof imported !== 'object') {
          throw new Error('Neispravan format fajla')
        }

        // Validate languages
        const validLanguages = ['en', 'de', 'it', 'sr']
        Object.keys(imported).forEach(lang => {
          if (!validLanguages.includes(lang)) {
            throw new Error(`Nepoznat jezik: ${lang}`)
          }
        })

        setContent(imported)
        setHasChanges(true)
        setSuccess('Sadržaj uspešno uvezen! Kliknite "Sačuvaj" da primenite izmene.')
      } catch (err) {
        setError(
          <div className="space-y-2">
            <p className="font-bold">Greška pri uvozu</p>
            <p className="text-sm">{err instanceof Error ? err.message : 'Neispravan JSON fajl'}</p>
          </div>
        )
      }
    }
    reader.readAsText(file)
    
    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  // Retry with exponential backoff
  const handleRetry = async () => {
    if (isRetrying) return
    
    setIsRetrying(true)
    const delay = Math.min(1000 * Math.pow(2, retryCount), 8000) // Max 8 seconds
    
    await sleep(delay)
    setRetryCount(prev => prev + 1)
    await fetchContent()
  }

  const currentSection = CONTENT_SECTIONS.find(s => s.id === selectedSection)

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center space-y-4">
          <Loader2 className="w-8 h-8 animate-spin mx-auto text-primary" />
          <p className="text-muted-foreground">Učitavanje sadržaja...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold">Upravljanje sadržajem</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Uredite tekstualni sadržaj stranica na svim jezicima
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleExport}
            className="gap-2"
          >
            <Download className="w-4 h-4" />
            Izvezi
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => fileInputRef.current?.click()}
            className="gap-2"
          >
            <Upload className="w-4 h-4" />
            Uvezi
          </Button>
          <input
            ref={fileInputRef}
            type="file"
            accept=".json"
            onChange={handleImport}
            className="hidden"
          />
        </div>
      </div>

      {/* Error/Success Messages */}
      {error && (
        <Card className="border-destructive bg-destructive/10">
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-destructive flex-shrink-0 mt-0.5" />
              <div className="flex-1 space-y-2">
                {error}
                {lastError && retryCount < 3 && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleRetry}
                    disabled={isRetrying}
                    className="mt-2"
                  >
                    {isRetrying ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin mr-2" />
                        Pokušavam ponovo...
                      </>
                    ) : (
                      <>
                        <RefreshCw className="w-4 h-4 mr-2" />
                        Pokušaj ponovo {retryCount > 0 && `(${retryCount}/3)`}
                      </>
                    )}
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {success && (
        <Card className="border-green-500 bg-green-50">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <CheckCircle2 className="w-5 h-5 text-green-600" />
              <p className="text-green-800 font-medium">{success}</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Language Selector */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="w-5 h-5" />
            Izaberite jezik
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {LANGUAGES.map(lang => (
              <Button
                key={lang.code}
                variant={selectedLanguage === lang.code ? 'default' : 'outline'}
                onClick={() => setSelectedLanguage(lang.code)}
                className="gap-2"
              >
                <span>{lang.flag}</span>
                <span>{lang.label}</span>
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Content Editor */}
      {currentSection && (
        <Card>
          <CardHeader>
            <CardTitle>{currentSection.name}</CardTitle>
            <CardDescription>
              {currentSection.description} • Jezik: {LANGUAGES.find(l => l.code === selectedLanguage)?.label}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {currentSection.fields.map(field => (
              <div key={field.key} className="space-y-2">
                <Label htmlFor={field.key} className="flex items-center gap-2">
                  {field.label}
                  {field.required && (
                    <Badge variant="destructive" className="text-xs">Obavezno</Badge>
                  )}
                </Label>
                {field.type === 'textarea' ? (
                  <Textarea
                    id={field.key}
                    value={content[selectedLanguage][field.key] || ''}
                    onChange={(e) => handleContentChange(field.key, e.target.value)}
                    rows={6}
                    className="font-mono text-sm"
                    placeholder={`Unesite ${field.label.toLowerCase()}...`}
                  />
                ) : (
                  <Input
                    id={field.key}
                    type="text"
                    value={content[selectedLanguage][field.key] || ''}
                    onChange={(e) => handleContentChange(field.key, e.target.value)}
                    className="font-mono text-sm"
                    placeholder={`Unesite ${field.label.toLowerCase()}...`}
                  />
                )}
              </div>
            ))}

            <div className="flex justify-end gap-3 pt-4 border-t">
              <Button
                variant="outline"
                onClick={() => fetchContent()}
                disabled={saving}
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Osveži
              </Button>
              <Button
                onClick={handleSave}
                disabled={saving || !hasChanges}
                className="gap-2"
              >
                {saving ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Čuvanje...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    Sačuvaj izmene
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
