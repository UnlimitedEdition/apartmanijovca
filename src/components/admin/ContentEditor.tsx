'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
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
  Edit3,
  RefreshCw,
  Download,
  Upload
} from 'lucide-react'
import { 
  validateContentStructure, 
  validateRequiredFields 
} from '../../lib/validations/content'

type Language = 'en' | 'de' | 'it' | 'sr'

interface ContentField {
  key: string
  label: string
  type: 'text' | 'textarea'
  required?: boolean
}

interface ContentSection {
  id: string
  name: string
  description: string
  fields: ContentField[]
}

interface ContentData {
  [key: string]: string
}

const LANGUAGES: { code: Language; label: string; flag: string }[] = [
  { code: 'sr', label: 'Srpski', flag: '��' },
  { code: 'en', label: 'English', flag: '��' },
  { code: 'de', label: 'Deutsch', flag: '��' },
  { code: 'it', label: 'Italiano', flag: '��' }
]

// ONLY MEANINGFUL TEXTUAL CONTENT - NO button labels, form labels, or UI messages
const SECTIONS: ContentSection[] = [
  {
    id: 'home',
    name: 'Početna strana',
    description: 'Glavni tekstualni sadržaj početne stranice',
    fields: [
      { key: 'home.title', label: 'Glavni naslov stranice', type: 'text', required: true },
      { key: 'home.subtitle', label: 'Podnaslov stranice', type: 'text', required: true },
      { key: 'home.description', label: 'Opis stranice', type: 'textarea', required: true },
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
    fields: [
      { key: 'privacy.title', label: 'Naslov stranice', type: 'text', required: true },
      { key: 'privacy.lastUpdated', label: 'Datum poslednjeg ažuriranja', type: 'text' },
      { key: 'privacy.intro', label: 'Uvodni tekst', type: 'textarea', required: true },
      { key: 'privacy.dataCollection.title', label: 'Prikupljanje podataka - naslov', type: 'text' },
      { key: 'privacy.dataCollection.content', label: 'Prikupljanje podataka - kompletan tekst', type: 'textarea' },
      { key: 'privacy.dataUsage.title', label: 'Korišćenje podataka - naslov', type: 'text' },
      { key: 'privacy.dataUsage.content', label: 'Korišćenje podataka - kompletan tekst', type: 'textarea' },
      { key: 'privacy.dataProtection.title', label: 'Zaštita podataka - naslov', type: 'text' },
      { key: 'privacy.dataProtection.content', label: 'Zaštita podataka - kompletan tekst', type: 'textarea' },
      { key: 'privacy.userRights.title', label: 'Prava korisnika - naslov', type: 'text' },
      { key: 'privacy.userRights.content', label: 'Prava korisnika - kompletan tekst', type: 'textarea' },
      { key: 'privacy.cookies.title', label: 'Kolačići - naslov', type: 'text' },
      { key: 'privacy.cookies.content', label: 'Kolačići - kompletan tekst', type: 'textarea' },
      { key: 'privacy.gdpr.title', label: 'GDPR usklađenost - naslov', type: 'text' },
      { key: 'privacy.gdpr.content', label: 'GDPR usklađenost - kompletan tekst', type: 'textarea' },
      { key: 'privacy.contact.title', label: 'Kontakt za pitanja - naslov', type: 'text' },
      { key: 'privacy.contact.content', label: 'Kontakt za pitanja - tekst', type: 'textarea' },
    ]
  },
  {
    id: 'terms',
    name: 'Uslovi korišćenja',
    description: 'Kompletan pravni tekst uslova korišćenja',
    fields: [
      { key: 'terms.title', label: 'Naslov stranice', type: 'text', required: true },
      { key: 'terms.lastUpdated', label: 'Datum poslednjeg ažuriranja', type: 'text' },
      { key: 'terms.intro', label: 'Uvodni tekst', type: 'textarea', required: true },
      { key: 'terms.booking.title', label: 'Rezervacija - naslov', type: 'text' },
      { key: 'terms.booking.content', label: 'Rezervacija - kompletan tekst', type: 'textarea' },
      { key: 'terms.payment.title', label: 'Plaćanje - naslov', type: 'text' },
      { key: 'terms.payment.content', label: 'Plaćanje - kompletan tekst', type: 'textarea' },
      { key: 'terms.cancellation.title', label: 'Otkazivanje - naslov', type: 'text' },
      { key: 'terms.cancellation.content', label: 'Otkazivanje - kompletan tekst', type: 'textarea' },
      { key: 'terms.houseRules.title', label: 'Kućni red - naslov', type: 'text' },
      { key: 'terms.houseRules.content', label: 'Kućni red - kompletan tekst', type: 'textarea' },
      { key: 'terms.liability.title', label: 'Odgovornost - naslov', type: 'text' },
      { key: 'terms.liability.content', label: 'Odgovornost - kompletan tekst', type: 'textarea' },
      { key: 'terms.changes.title', label: 'Izmene uslova - naslov', type: 'text' },
      { key: 'terms.changes.content', label: 'Izmene uslova - tekst', type: 'textarea' },
    ]
  },
]

export default function ContentEditor() {
  const [selectedSection, setSelectedSection] = useState<string>('home')
  const [selectedLanguage, setSelectedLanguage] = useState<Language>('sr')
  const [content, setContent] = useState<Record<Language, ContentData>>({
    en: {},
    de: {},
    it: {},
    sr: {}
  })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | JSX.Element | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [hasChanges, setHasChanges] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  
  // Concurrent edit detection
  const [lastFetchedAt, setLastFetchedAt] = useState<Record<string, string>>({})
  
  // Retry state for exponential backoff
  const [retryCount, setRetryCount] = useState(0)
  const [isRetrying, setIsRetrying] = useState(false)
  const [lastError, setLastError] = useState<Error | null>(null)

  const sleep = (ms: number): Promise<void> => {
    return new Promise(resolve => setTimeout(resolve, ms))
  }

  // Fetch content from database
  const fetchContent = useCallback(async (forceRefresh = false) => {
    try {
      setLoading(true)
      setError(null)

      const response = await fetch('/api/admin/content')
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }

      const data = await response.json()
      
      // Transform flat key-value pairs into nested structure
      const transformedContent: Record<Language, ContentData> = {
        en: {},
        de: {},
        it: {},
        sr: {}
      }

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
        SECTIONS.forEach(section => {
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

      const currentSection = SECTIONS.find(s => s.id === selectedSection)
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

      // Prepare data for API
      const updates = currentSection.fields.map(field => ({
        key: field.key,
        language: selectedLanguage,
        value: sectionContent[field.key] || '',
        published: true
      }))

      const response = await fetch('/api/admin/content', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ updates })
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || `HTTP ${response.status}`)
      }

      setSuccess('Sadržaj uspešno sačuvan!')
      setHasChanges(false)
      setRetryCount(0)
      
      // Refresh content to get latest data
      await fetchContent(true)
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
    await fetchContent(true)
  }

  const currentSection = SECTIONS.find(s => s.id === selectedSection)

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

      {/* Section Selector */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Edit3 className="w-5 h-5" />
            Izaberite sekciju
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {SECTIONS.map(section => (
              <Button
                key={section.id}
                variant={selectedSection === section.id ? 'default' : 'outline'}
                onClick={() => setSelectedSection(section.id)}
                className="h-auto py-3 px-4 justify-start text-left"
              >
                <div>
                  <div className="font-bold">{section.name}</div>
                  <div className="text-xs opacity-70 mt-1">{section.description}</div>
                </div>
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
                onClick={() => fetchContent(true)}
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
