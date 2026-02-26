'use client'

import { useState } from 'react'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Textarea } from './ui/textarea'

interface ContactFormProps {
  labels: {
    name: string
    email: string
    phone?: string
    message: string
    submit: string
    success: string
    error: string
  }
}

export default function ContactForm({ labels }: ContactFormProps) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    message: ''
  })
  const [loading, setLoading] = useState(false)
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle')
  const [errorMessage, setErrorMessage] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setStatus('idle')
    setErrorMessage('')

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Greška pri slanju poruke')
      }

      setStatus('success')
      setFormData({ name: '', email: '', phone: '', message: '' })
      
      // Reset success message after 5 seconds
      setTimeout(() => setStatus('idle'), 5000)
    } catch (error) {
      console.error('Form submission error:', error)
      setStatus('error')
      setErrorMessage(error instanceof Error ? error.message : labels.error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div className="space-y-2">
        <label className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1">
          {labels.name}
        </label>
        <Input
          name="name"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          className="h-14 rounded-2xl border-zinc-200 focus:ring-primary focus:border-primary font-bold px-6"
          required
          disabled={loading}
        />
      </div>
      
      <div className="space-y-2">
        <label className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1">
          {labels.email}
        </label>
        <Input
          name="email"
          type="email"
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          className="h-14 rounded-2xl border-zinc-200 focus:ring-primary focus:border-primary font-bold px-6"
          required
          disabled={loading}
        />
      </div>

      {labels.phone && (
        <div className="md:col-span-2 space-y-2">
          <label className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1">
            {labels.phone} (opciono)
          </label>
          <Input
            name="phone"
            type="tel"
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            className="h-14 rounded-2xl border-zinc-200 focus:ring-primary focus:border-primary font-bold px-6"
            disabled={loading}
          />
        </div>
      )}
      
      <div className="md:col-span-2 space-y-2">
        <label className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1">
          {labels.message}
        </label>
        <Textarea
          name="message"
          value={formData.message}
          onChange={(e) => setFormData({ ...formData, message: e.target.value })}
          className="rounded-2xl border-zinc-200 focus:ring-primary focus:border-primary font-bold p-6 min-h-[200px]"
          required
          disabled={loading}
        />
      </div>
      
      {status === 'success' && (
        <div className="md:col-span-2 p-4 bg-green-50 border border-green-200 rounded-2xl">
          <p className="text-green-800 font-bold text-center">{labels.success}</p>
        </div>
      )}
      
      {status === 'error' && (
        <div className="md:col-span-2 p-4 bg-red-50 border border-red-200 rounded-2xl">
          <p className="text-red-800 font-bold text-center">{errorMessage}</p>
        </div>
      )}
      
      <div className="md:col-span-2">
        <Button
          type="submit"
          disabled={loading}
          className="w-full h-16 bg-primary text-primary-foreground font-black text-xl rounded-2xl shadow-2xl shadow-primary/30 hover:scale-[1.01] active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Šalje se...' : labels.submit}
        </Button>
      </div>
    </form>
  )
}
