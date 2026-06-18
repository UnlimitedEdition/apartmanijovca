'use client'

import { useState, useEffect, useCallback } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { Textarea } from '../ui/textarea'
import {
  Eye,
  EyeOff,
  Plus,
  Trash2,
  Loader2,
  MapPin,
  Pencil,
  X,
  AlertCircle,
} from 'lucide-react'

// ─── Types ────────────────────────────────────────────────────────────────────

interface LocalizedText {
  sr: string
  en: string
  de: string
  it: string
}

interface Attraction {
  id: string
  name: LocalizedText
  description: LocalizedText | null
  distance: string | null
  image: string | null
  latitude: number | null
  longitude: number | null
  display_order: number
  is_visible: boolean
}

// ─── Constants ────────────────────────────────────────────────────────────────

const LANGS: { code: keyof LocalizedText; label: string }[] = [
  { code: 'sr', label: 'SR' },
  { code: 'en', label: 'EN' },
  { code: 'de', label: 'DE' },
  { code: 'it', label: 'IT' },
]

const EMPTY_LOCALIZED: LocalizedText = { sr: '', en: '', de: '', it: '' }

interface FormState {
  name: LocalizedText
  description: LocalizedText
  distance: string
  image: string
  latitude: string
  longitude: string
  display_order: string
  is_visible: boolean
}

const EMPTY_FORM: FormState = {
  name: { ...EMPTY_LOCALIZED },
  description: { ...EMPTY_LOCALIZED },
  distance: '',
  image: '',
  latitude: '',
  longitude: '',
  display_order: '0',
  is_visible: true,
}

function attractionToForm(a: Attraction): FormState {
  return {
    name: { sr: a.name.sr, en: a.name.en ?? '', de: a.name.de ?? '', it: a.name.it ?? '' },
    description: {
      sr: a.description?.sr ?? '',
      en: a.description?.en ?? '',
      de: a.description?.de ?? '',
      it: a.description?.it ?? '',
    },
    distance: a.distance ?? '',
    image: a.image ?? '',
    latitude: a.latitude != null ? String(a.latitude) : '',
    longitude: a.longitude != null ? String(a.longitude) : '',
    display_order: String(a.display_order),
    is_visible: a.is_visible,
  }
}

function formToPayload(f: FormState): Omit<Attraction, 'id'> {
  return {
    name: f.name,
    description:
      f.description.sr.trim() || f.description.en.trim()
        ? f.description
        : null,
    distance: f.distance.trim() || null,
    image: f.image.trim() || null,
    latitude: f.latitude !== '' ? parseFloat(f.latitude) : null,
    longitude: f.longitude !== '' ? parseFloat(f.longitude) : null,
    display_order: parseInt(f.display_order, 10) || 0,
    is_visible: f.is_visible,
  }
}

// ─── Subcomponent: Localized Field Group ────────────────────────────────────

interface LocalizedInputProps {
  label: string
  value: LocalizedText
  onChange: (updated: LocalizedText) => void
  multiline?: boolean
  required?: boolean
  activeLang: keyof LocalizedText
}

function LocalizedField({
  label,
  value,
  onChange,
  multiline,
  required,
  activeLang,
}: LocalizedInputProps) {
  const handleChange = (val: string) => {
    onChange({ ...value, [activeLang]: val })
  }

  const currentValue = value[activeLang]
  const placeholder = `${label} (${activeLang.toUpperCase()})${required && activeLang === 'sr' ? ' *' : ''}`

  return multiline ? (
    <Textarea
      placeholder={placeholder}
      rows={3}
      value={currentValue}
      onChange={e => handleChange(e.target.value)}
    />
  ) : (
    <Input
      placeholder={placeholder}
      value={currentValue}
      onChange={e => handleChange(e.target.value)}
    />
  )
}

// ─── Main Component ──────────────────────────────────────────────────────────

export default function AttractionsManager() {
  const [attractions, setAttractions] = useState<Attraction[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [formOpen, setFormOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState<FormState>(EMPTY_FORM)
  const [formSaving, setFormSaving] = useState(false)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [togglingId, setTogglingId] = useState<string | null>(null)
  const [activeLang, setActiveLang] = useState<keyof LocalizedText>('sr')

  // ── Fetch ──────────────────────────────────────────────────────────────────

  const fetchAttractions = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/admin/attractions')
      if (!res.ok) {
        const j = await res.json().catch(() => ({}))
        throw new Error((j as { error?: string }).error ?? `HTTP ${res.status}`)
      }
      const data = (await res.json()) as { attractions: Attraction[] }
      setAttractions(data.attractions ?? [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Greška pri učitavanju')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void fetchAttractions()
  }, [fetchAttractions])

  // ── Form helpers ────────────────────────────────────────────────────────────

  const openCreate = () => {
    setEditingId(null)
    setForm(EMPTY_FORM)
    setActiveLang('sr')
    setFormOpen(true)
  }

  const openEdit = (a: Attraction) => {
    setEditingId(a.id)
    setForm(attractionToForm(a))
    setActiveLang('sr')
    setFormOpen(true)
  }

  const closeForm = () => {
    setFormOpen(false)
    setEditingId(null)
    setForm(EMPTY_FORM)
  }

  // ── Save (create / update) ─────────────────────────────────────────────────

  const handleSave = async () => {
    if (!form.name.sr.trim()) return
    setFormSaving(true)
    setError(null)
    try {
      const payload = formToPayload(form)
      const isEdit = editingId !== null

      const res = await fetch('/api/admin/attractions', {
        method: isEdit ? 'PATCH' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(isEdit ? { id: editingId, ...payload } : payload),
      })

      if (!res.ok) {
        const j = await res.json().catch(() => ({}))
        throw new Error((j as { error?: string }).error ?? `HTTP ${res.status}`)
      }

      closeForm()
      await fetchAttractions()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Greška pri čuvanju')
    } finally {
      setFormSaving(false)
    }
  }

  // ── Delete ─────────────────────────────────────────────────────────────────

  const handleDelete = async (id: string, nameSr: string) => {
    if (!confirm(`Obrisati atrakciju "${nameSr}"?`)) return
    setDeletingId(id)
    setError(null)
    try {
      const res = await fetch('/api/admin/attractions', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      })
      if (!res.ok) {
        const j = await res.json().catch(() => ({}))
        throw new Error((j as { error?: string }).error ?? `HTTP ${res.status}`)
      }
      setAttractions(prev => prev.filter(a => a.id !== id))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Greška pri brisanju')
    } finally {
      setDeletingId(null)
    }
  }

  // ── Toggle visibility ──────────────────────────────────────────────────────

  const handleToggleVisible = async (a: Attraction) => {
    setTogglingId(a.id)
    setError(null)
    try {
      const res = await fetch('/api/admin/attractions', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: a.id, is_visible: !a.is_visible }),
      })
      if (!res.ok) {
        const j = await res.json().catch(() => ({}))
        throw new Error((j as { error?: string }).error ?? `HTTP ${res.status}`)
      }
      setAttractions(prev =>
        prev.map(item => (item.id === a.id ? { ...item, is_visible: !item.is_visible } : item))
      )
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Greška pri promeni vidljivosti')
    } finally {
      setTogglingId(null)
    }
  }

  // ── Render: loading ────────────────────────────────────────────────────────

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    )
  }

  // ── Render: form ───────────────────────────────────────────────────────────

  const isFormValid = form.name.sr.trim().length > 0

  const formCard = formOpen && (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base">
            {editingId ? 'Izmena atrakcije' : 'Nova atrakcija'}
          </CardTitle>
          <Button variant="ghost" size="sm" onClick={closeForm} className="h-8 w-8 p-0">
            <X className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Language tab switcher */}
        <div className="flex gap-1">
          {LANGS.map(l => (
            <button
              key={l.code}
              type="button"
              onClick={() => setActiveLang(l.code)}
              className={`px-3 py-1 rounded text-xs font-medium transition-colors ${
                activeLang === l.code
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted text-muted-foreground hover:bg-muted/80'
              }`}
            >
              {l.label}
            </button>
          ))}
        </div>

        {/* Name */}
        <div className="space-y-1">
          <label className="text-xs font-medium text-muted-foreground">
            Naziv{activeLang === 'sr' ? ' *' : ''}
          </label>
          <LocalizedField
            label="Naziv"
            value={form.name}
            onChange={updated => setForm(f => ({ ...f, name: updated }))}
            activeLang={activeLang}
          />
        </div>

        {/* Description */}
        <div className="space-y-1">
          <label className="text-xs font-medium text-muted-foreground">Opis</label>
          <LocalizedField
            label="Opis"
            value={form.description}
            onChange={updated => setForm(f => ({ ...f, description: updated }))}
            multiline
            activeLang={activeLang}
          />
        </div>

        {/* Distance + Image */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div className="space-y-1">
            <label className="text-xs font-medium text-muted-foreground">Udaljenost</label>
            <Input
              placeholder="npr. 15 km"
              value={form.distance}
              onChange={e => setForm(f => ({ ...f, distance: e.target.value }))}
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-medium text-muted-foreground">URL slike</label>
            <Input
              placeholder="/images/... ili https://..."
              value={form.image}
              onChange={e => setForm(f => ({ ...f, image: e.target.value }))}
            />
          </div>
        </div>

        {/* Lat + Lng + Order */}
        <div className="grid grid-cols-3 gap-3">
          <div className="space-y-1">
            <label className="text-xs font-medium text-muted-foreground">Lat</label>
            <Input
              type="number"
              step="any"
              placeholder="43.xxx"
              value={form.latitude}
              onChange={e => setForm(f => ({ ...f, latitude: e.target.value }))}
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-medium text-muted-foreground">Lng</label>
            <Input
              type="number"
              step="any"
              placeholder="21.xxx"
              value={form.longitude}
              onChange={e => setForm(f => ({ ...f, longitude: e.target.value }))}
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-medium text-muted-foreground">Redosled</label>
            <Input
              type="number"
              placeholder="0"
              value={form.display_order}
              onChange={e => setForm(f => ({ ...f, display_order: e.target.value }))}
            />
          </div>
        </div>

        {/* Visibility toggle */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setForm(f => ({ ...f, is_visible: !f.is_visible }))}
            className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors focus:outline-none ${
              form.is_visible ? 'bg-primary' : 'bg-muted-foreground/30'
            }`}
          >
            <span
              className={`inline-block h-3.5 w-3.5 rounded-full bg-white transition-transform ${
                form.is_visible ? 'translate-x-4' : 'translate-x-1'
              }`}
            />
          </button>
          <span className="text-xs text-muted-foreground">
            {form.is_visible ? 'Vidljiva na sajtu' : 'Skrivena sa sajta'}
          </span>
        </div>

        {/* Actions */}
        <div className="flex gap-2 pt-1">
          <Button onClick={() => void handleSave()} disabled={formSaving || !isFormValid} size="sm">
            {formSaving && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
            {editingId ? 'Sačuvaj izmene' : 'Dodaj atrakciju'}
          </Button>
          <Button variant="outline" size="sm" onClick={closeForm}>
            Otkaži
          </Button>
        </div>
      </CardContent>
    </Card>
  )

  // ── Render: list ───────────────────────────────────────────────────────────

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold">Atrakcije</h2>
          <p className="text-sm text-muted-foreground">
            Upravljaj atrakcijama koje se prikazuju na sajtu
          </p>
        </div>
        <Button onClick={openCreate} size="sm" disabled={formOpen}>
          <Plus className="h-4 w-4 mr-2" />
          Dodaj novu
        </Button>
      </div>

      {/* Error banner */}
      {error && (
        <div className="flex items-center gap-2 p-3 rounded-lg bg-destructive/10 text-destructive text-sm">
          <AlertCircle className="h-4 w-4 flex-shrink-0" />
          <span>{error}</span>
          <button
            type="button"
            className="ml-auto text-destructive hover:opacity-70"
            onClick={() => setError(null)}
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {formCard}

      {/* List */}
      {attractions.length === 0 ? (
        <p className="text-sm text-muted-foreground text-center py-8">
          Nema atrakcija u bazi. Klikni &quot;Dodaj novu&quot; da počneš.
        </p>
      ) : (
        <div className="space-y-2">
          {attractions.map(a => {
            const isDeleting = deletingId === a.id
            const isToggling = togglingId === a.id

            return (
              <div
                key={a.id}
                className={`flex items-center gap-3 p-3 rounded-lg border bg-card transition-opacity ${
                  !a.is_visible ? 'opacity-60' : ''
                }`}
              >
                {/* Thumbnail */}
                {a.image ? (
                  <div className="w-14 h-10 rounded overflow-hidden flex-shrink-0 bg-muted">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={a.image} alt={a.name.sr} className="w-full h-full object-cover" />
                  </div>
                ) : (
                  <div className="w-14 h-10 rounded flex-shrink-0 bg-muted" />
                )}

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm truncate">{a.name.sr}</p>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground flex-wrap">
                    {a.distance && <span>{a.distance}</span>}
                    {a.latitude != null && a.longitude != null && (
                      <a
                        href={`https://www.google.com/maps?q=${a.latitude},${a.longitude}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center text-blue-600 hover:underline"
                        onClick={e => e.stopPropagation()}
                      >
                        <MapPin className="h-3 w-3 mr-0.5" />
                        Mapa
                      </a>
                    )}
                    <span className="text-muted-foreground/60">#{a.display_order}</span>
                  </div>
                </div>

                {/* Visibility */}
                <Button
                  variant={a.is_visible ? 'ghost' : 'outline'}
                  size="sm"
                  className="flex-shrink-0 h-8 px-2"
                  onClick={() => void handleToggleVisible(a)}
                  disabled={isToggling || isDeleting}
                  title={a.is_visible ? 'Sakrij' : 'Prikaži'}
                >
                  {isToggling ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : a.is_visible ? (
                    <>
                      <Eye className="h-4 w-4 mr-1" />
                      <span className="text-xs">Vidljiva</span>
                    </>
                  ) : (
                    <>
                      <EyeOff className="h-4 w-4 mr-1 text-muted-foreground" />
                      <span className="text-xs">Skrivena</span>
                    </>
                  )}
                </Button>

                {/* Edit */}
                <Button
                  variant="ghost"
                  size="sm"
                  className="flex-shrink-0 h-8 w-8 p-0"
                  onClick={() => openEdit(a)}
                  disabled={isDeleting || isToggling}
                  title="Izmeni"
                >
                  <Pencil className="h-4 w-4" />
                </Button>

                {/* Delete */}
                <Button
                  variant="ghost"
                  size="sm"
                  className="flex-shrink-0 h-8 w-8 p-0 text-destructive hover:text-destructive"
                  onClick={() => void handleDelete(a.id, a.name.sr)}
                  disabled={isDeleting || isToggling}
                  title="Obriši"
                >
                  {isDeleting ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Trash2 className="h-4 w-4" />
                  )}
                </Button>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
