'use client'

import { useState, useEffect, useCallback } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { Textarea } from '../ui/textarea'
import { Eye, EyeOff, Plus, Trash2, Loader2, MapPin } from 'lucide-react'
import { STATIC_ATTRACTIONS, AttractionEntry } from '@/data/attractions'

interface CustomAttraction {
  name: string
  description: string
  distance: string
  image: string
  lat: number | null
  lng: number | null
}

const EMPTY_FORM: CustomAttraction = {
  name: '',
  description: '',
  distance: '',
  image: '',
  lat: null,
  lng: null,
}

export default function AttractionsManager() {
  const [hidden, setHidden] = useState<number[]>([])
  const [custom, setCustom] = useState<CustomAttraction[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState<CustomAttraction>(EMPTY_FORM)
  const [formSaving, setFormSaving] = useState(false)

  const staticList: AttractionEntry[] = STATIC_ATTRACTIONS['sr'] ?? []

  const fetchData = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/admin/attractions')
      if (res.ok) {
        const data = await res.json()
        setHidden(data.hidden ?? [])
        setCustom(data.custom ?? [])
      }
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchData() }, [fetchData])

  const toggleVisibility = async (id: number) => {
    const newHidden = hidden.includes(id)
      ? hidden.filter(h => h !== id)
      : [...hidden, id]

    setSaving(true)
    try {
      const res = await fetch('/api/admin/attractions', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ hidden: newHidden }),
      })
      if (res.ok) setHidden(newHidden)
    } finally {
      setSaving(false)
    }
  }

  const deleteCustom = async (index: number) => {
    if (!confirm('Obrisati ovu atrakciju?')) return
    const res = await fetch('/api/admin/attractions', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ index }),
    })
    if (res.ok) {
      const data = await res.json()
      setCustom(data.custom ?? [])
    }
  }

  const submitForm = async () => {
    if (!form.name.trim() || !form.description.trim()) return
    setFormSaving(true)
    try {
      const res = await fetch('/api/admin/attractions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      if (res.ok) {
        const data = await res.json()
        setCustom(data.custom ?? [])
        setForm(EMPTY_FORM)
        setShowForm(false)
      }
    } finally {
      setFormSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold">Atrakcije</h2>
          <p className="text-sm text-muted-foreground">
            Upravljaj vidljivošću stalnih atrakcija i dodaj nove
          </p>
        </div>
        <Button onClick={() => setShowForm(v => !v)} size="sm">
          <Plus className="h-4 w-4 mr-2" />
          Dodaj novu
        </Button>
      </div>

      {/* Add form */}
      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Nova atrakcija</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-xs font-medium text-muted-foreground">Naziv *</label>
                <Input
                  placeholder="Naziv atrakcije"
                  value={form.name}
                  onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-medium text-muted-foreground">Udaljenost</label>
                <Input
                  placeholder="npr. 25 km"
                  value={form.distance}
                  onChange={e => setForm(f => ({ ...f, distance: e.target.value }))}
                />
              </div>
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium text-muted-foreground">Opis *</label>
              <Textarea
                placeholder="Opis atrakcije..."
                rows={3}
                value={form.description}
                onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium text-muted-foreground">URL slike</label>
              <Input
                placeholder="/images/attractions/nova.jpg ili https://..."
                value={form.image}
                onChange={e => setForm(f => ({ ...f, image: e.target.value }))}
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-xs font-medium text-muted-foreground">Lat</label>
                <Input
                  type="number"
                  step="any"
                  placeholder="43.xxx"
                  value={form.lat ?? ''}
                  onChange={e => setForm(f => ({ ...f, lat: e.target.value ? parseFloat(e.target.value) : null }))}
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-medium text-muted-foreground">Lng</label>
                <Input
                  type="number"
                  step="any"
                  placeholder="21.xxx"
                  value={form.lng ?? ''}
                  onChange={e => setForm(f => ({ ...f, lng: e.target.value ? parseFloat(e.target.value) : null }))}
                />
              </div>
            </div>
            <div className="flex gap-2 pt-1">
              <Button onClick={submitForm} disabled={formSaving || !form.name.trim() || !form.description.trim()} size="sm">
                {formSaving && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
                Sačuvaj
              </Button>
              <Button variant="outline" size="sm" onClick={() => { setShowForm(false); setForm(EMPTY_FORM) }}>
                Otkaži
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Static attractions */}
      <div>
        <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">
          Stalne atrakcije ({staticList.length})
        </h3>
        <div className="space-y-2">
          {staticList.map(a => {
            const isHidden = hidden.includes(a.id)
            return (
              <div
                key={a.id}
                className={`flex items-center gap-3 p-3 rounded-lg border bg-card transition-opacity ${isHidden ? 'opacity-50' : ''}`}
              >
                {a.image && (
                  <div className="w-14 h-10 rounded overflow-hidden flex-shrink-0 bg-muted">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={a.image} alt={a.name} className="w-full h-full object-cover" />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm truncate">{a.name}</p>
                  <p className="text-xs text-muted-foreground">{a.distance}</p>
                </div>
                <Button
                  variant={isHidden ? 'outline' : 'ghost'}
                  size="sm"
                  className="flex-shrink-0 h-8 px-2"
                  onClick={() => toggleVisibility(a.id)}
                  disabled={saving}
                  title={isHidden ? 'Prikaži' : 'Sakrij'}
                >
                  {saving ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : isHidden ? (
                    <><EyeOff className="h-4 w-4 mr-1 text-muted-foreground" /><span className="text-xs">Skrivena</span></>
                  ) : (
                    <><Eye className="h-4 w-4 mr-1" /><span className="text-xs">Vidljiva</span></>
                  )}
                </Button>
              </div>
            )
          })}
        </div>
      </div>

      {/* Custom attractions */}
      {custom.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">
            Dodate atrakcije ({custom.length})
          </h3>
          <div className="space-y-2">
            {custom.map((a, i) => (
              <div key={i} className="flex items-center gap-3 p-3 rounded-lg border bg-card">
                {a.image && (
                  <div className="w-14 h-10 rounded overflow-hidden flex-shrink-0 bg-muted">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={a.image} alt={a.name} className="w-full h-full object-cover" />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm truncate">{a.name}</p>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    {a.distance && <span>{a.distance}</span>}
                    {a.lat && a.lng && (
                      <a
                        href={`https://www.google.com/maps?q=${a.lat},${a.lng}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center text-blue-600 hover:underline"
                        onClick={e => e.stopPropagation()}
                      >
                        <MapPin className="h-3 w-3 mr-0.5" />
                        Mapa
                      </a>
                    )}
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  className="flex-shrink-0 h-8 px-2 text-destructive hover:text-destructive"
                  onClick={() => deleteCustom(i)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}

      {custom.length === 0 && !showForm && (
        <p className="text-sm text-muted-foreground text-center py-4">
          Nema dodatih atrakcija. Klikni &quot;Dodaj novu&quot; da dodaš.
        </p>
      )}
    </div>
  )
}
