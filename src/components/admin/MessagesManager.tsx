'use client'

import { useState, useEffect, useCallback } from 'react'
import { Card, CardContent } from '../ui/card'
import { Badge } from '../ui/badge'
import { Button } from '../ui/button'
import { Loader2, Mail, Phone, Calendar, Eye, Archive, Trash2 } from 'lucide-react'

interface Message {
  id: string
  full_name: string
  email: string
  phone: string | null
  subject: string
  message: string
  status: 'new' | 'read' | 'replied' | 'archived'
  created_at: string
}

export default function MessagesManager() {
  const [messages, setMessages] = useState<Message[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'new' | 'read' | 'replied' | 'archived'>('all')
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null)

  const fetchMessages = useCallback(async () => {
    setLoading(true)
    try {
      // Use API route instead of direct Supabase call to bypass RLS
      const response = await fetch('/api/admin/messages')
      
      if (!response.ok) {
        throw new Error('Failed to fetch messages')
      }

      const data = await response.json()
      
      let filteredMessages = data.messages || []
      
      if (filter !== 'all') {
        filteredMessages = filteredMessages.filter((m: Message) => m.status === filter)
      }

      setMessages(filteredMessages)
    } catch (error) {
      console.error('Error fetching messages:', error)
      setMessages([])
    } finally {
      setLoading(false)
    }
  }, [filter])

  useEffect(() => {
    fetchMessages()
  }, [fetchMessages])

  const updateMessageStatus = async (id: string, status: Message['status']) => {
    try {
      const response = await fetch(`/api/admin/messages/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      })

      if (!response.ok) throw new Error('Failed to update message')
      
      fetchMessages()
      if (selectedMessage?.id === id) {
        setSelectedMessage({ ...selectedMessage, status })
      }
    } catch (error) {
      console.error('Error updating message:', error)
    }
  }

  const deleteMessage = async (id: string) => {
    if (!confirm('Da li ste sigurni da želite da obrišete ovu poruku?')) return

    try {
      const response = await fetch(`/api/admin/messages/${id}`, {
        method: 'DELETE'
      })

      if (!response.ok) throw new Error('Failed to delete message')
      
      fetchMessages()
      if (selectedMessage?.id === id) {
        setSelectedMessage(null)
      }
    } catch (error) {
      console.error('Error deleting message:', error)
    }
  }

  const getStatusBadge = (status: Message['status']) => {
    const variants = {
      new: { label: 'Nova', className: 'bg-blue-100 text-blue-800 border-blue-200' },
      read: { label: 'Pročitana', className: 'bg-gray-100 text-gray-800 border-gray-200' },
      replied: { label: 'Odgovoreno', className: 'bg-green-100 text-green-800 border-green-200' },
      archived: { label: 'Arhivirana', className: 'bg-zinc-100 text-zinc-800 border-zinc-200' }
    }
    const variant = variants[status]
    return <Badge className={`${variant.className} font-bold`}>{variant.label}</Badge>
  }

  const newCount = messages.filter(m => m.status === 'new').length

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight mb-2">Kontakt poruke</h2>
        <p className="text-muted-foreground">Pregled i upravljanje porukama sa kontakt forme</p>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2">
        {(['all', 'new', 'read', 'replied', 'archived'] as const).map((f) => (
          <Button
            key={f}
            variant={filter === f ? 'default' : 'outline'}
            onClick={() => setFilter(f)}
            className="rounded-full"
            size="sm"
          >
            {f === 'all' && 'Sve'}
            {f === 'new' && `Nove (${newCount})`}
            {f === 'read' && 'Pročitane'}
            {f === 'replied' && 'Odgovoreno'}
            {f === 'archived' && 'Arhivirane'}
          </Button>
        ))}
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      ) : (
        <div className="space-y-3">
          {messages.length === 0 ? (
            <Card className="p-8 text-center">
              <p className="text-muted-foreground">Nema poruka</p>
            </Card>
          ) : (
            messages.map((msg) => {
              const isSelected = selectedMessage?.id === msg.id
              return (
                <Card
                  key={msg.id}
                  className={`cursor-pointer transition-all hover:shadow-lg ${
                    isSelected ? 'ring-2 ring-primary' : ''
                  } ${msg.status === 'new' ? 'bg-blue-50/50' : ''}`}
                  onClick={() => {
                    setSelectedMessage(isSelected ? null : msg)
                    if (!isSelected && msg.status === 'new') {
                      updateMessageStatus(msg.id, 'read')
                    }
                  }}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between gap-3 mb-2">
                      <div className="min-w-0">
                        <h3 className="font-bold text-sm">{msg.full_name}</h3>
                        <p className="text-xs text-muted-foreground break-words">{msg.email}</p>
                      </div>
                      {getStatusBadge(msg.status)}
                    </div>
                    <p className={`text-sm mb-2 ${isSelected ? 'whitespace-pre-wrap' : 'line-clamp-2'}`}>{msg.message}</p>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Calendar className="w-3 h-3" />
                      {new Date(msg.created_at).toLocaleDateString('sr-RS', {
                        day: '2-digit',
                        month: '2-digit',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </div>

                    {isSelected && (
                      <div className="mt-4 border-t pt-4" onClick={(e) => e.stopPropagation()}>
                        <div className="grid gap-2 text-sm text-muted-foreground mb-4">
                          <div className="flex items-center gap-2">
                            <Mail className="w-4 h-4" />
                            <a href={`mailto:${msg.email}`} className="hover:text-primary break-all">
                              {msg.email}
                            </a>
                          </div>
                          {msg.phone && (
                            <div className="flex items-center gap-2">
                              <Phone className="w-4 h-4" />
                              <a href={`tel:${msg.phone}`} className="hover:text-primary">
                                {msg.phone}
                              </a>
                            </div>
                          )}
                        </div>

                        <div className="flex flex-wrap gap-2">
                          {msg.status !== 'replied' && (
                            <Button
                              onClick={() => updateMessageStatus(msg.id, 'replied')}
                              className="gap-2"
                              size="sm"
                            >
                              <Eye className="w-4 h-4" />
                              Oznaci kao odgovoreno
                            </Button>
                          )}
                          {msg.status !== 'archived' && (
                            <Button
                              variant="outline"
                              onClick={() => updateMessageStatus(msg.id, 'archived')}
                              className="gap-2"
                              size="sm"
                            >
                              <Archive className="w-4 h-4" />
                              Arhiviraj
                            </Button>
                          )}
                          <Button
                            variant="destructive"
                            onClick={() => deleteMessage(msg.id)}
                            className="gap-2 sm:ml-auto"
                            size="sm"
                          >
                            <Trash2 className="w-4 h-4" />
                            Obrisi
                          </Button>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )
            })
          )}
        </div>
      )}
    </div>
  )
}
