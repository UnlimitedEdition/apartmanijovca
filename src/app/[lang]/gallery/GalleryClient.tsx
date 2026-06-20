'use client'

import { useState, useMemo, useEffect, useCallback } from 'react'
import Image from 'next/image'
import { Maximize2, X, ChevronLeft, ChevronRight, Loader2 } from 'lucide-react'

const CATEGORY_LABELS: Record<string, Record<string, string>> = {
  Eksterijer: { sr: 'Eksterijer', en: 'Exterior', de: 'Außenbereich', it: 'Esterno' },
  Jezero: { sr: 'Jezero', en: 'Lake', de: 'See', it: 'Lago' },
  Sobe: { sr: 'Sobe', en: 'Rooms', de: 'Zimmer', it: 'Camere' },
  Terasa: { sr: 'Terasa', en: 'Terrace', de: 'Terrasse', it: 'Terrazza' },
  Pogled: { sr: 'Pogled', en: 'View', de: 'Aussicht', it: 'Vista' },
}

function tagLabel(tag: string, lang: string): string {
  return CATEGORY_LABELS[tag]?.[lang] ?? CATEGORY_LABELS[tag]?.sr ?? tag
}

interface GalleryItem {
  id: string
  url: string
  caption: string | Record<string, string> | null
  tags: string[]
  display_order: number
  created_at: string
}

export default function GalleryClient({
  initialItems,
  lang
}: {
  initialItems: GalleryItem[]
  lang: string
}) {
  const [mounted, setMounted] = useState(false)
  const [selectedTag, setSelectedTag] = useState<string | null>(null)
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null)

  useEffect(() => {
    setMounted(true)
  }, [])

  const getLocalizedCaption = (caption: string | Record<string, string> | null, currentLang: string) => {
    if (!caption) return ''
    if (typeof caption === 'string') {
      try {
        const parsed = JSON.parse(caption)
        if (typeof parsed === 'object' && parsed !== null) {
          return parsed[currentLang] || parsed['sr'] || ''
        }
        return caption
      } catch {
        return caption
      }
    }
    if (typeof caption === 'object' && caption !== null) {
      return caption[currentLang] || caption['sr'] || ''
    }
    return ''
  }

  const allTags = useMemo(() => {
    const tags = new Set<string>()
    initialItems.forEach(item => {
      item.tags?.forEach(tag => tags.add(tag))
    })
    return Array.from(tags).sort()
  }, [initialItems])

  const filteredItems = useMemo(() => {
    if (!selectedTag) return initialItems
    return initialItems.filter(item => item.tags?.includes(selectedTag))
  }, [initialItems, selectedTag])

  const openLightbox = (idx: number) => {
    setLightboxIndex(idx)
    document.body.style.overflow = 'hidden'
  }

  const closeLightbox = () => {
    setLightboxIndex(null)
    document.body.style.overflow = ''
  }

  const nextLightbox = useCallback(() => {
    if (lightboxIndex === null) return
    setLightboxIndex((lightboxIndex + 1) % filteredItems.length)
  }, [lightboxIndex, filteredItems.length])

  const prevLightbox = useCallback(() => {
    if (lightboxIndex === null) return
    setLightboxIndex((lightboxIndex - 1 + filteredItems.length) % filteredItems.length)
  }, [lightboxIndex, filteredItems.length])

  // Keyboard navigation
  useEffect(() => {
    if (lightboxIndex === null) return
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeLightbox()
      if (e.key === 'ArrowRight') nextLightbox()
      if (e.key === 'ArrowLeft') prevLightbox()
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [lightboxIndex, nextLightbox, prevLightbox])

  if (!mounted) {
    return (
      <div className="min-h-[400px] flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-white/60" />
      </div>
    )
  }

  const allLabel = lang === 'sr' ? 'Sve' : lang === 'en' ? 'All' : lang === 'de' ? 'Alle' : 'Tutte'

  return (
    <div className="space-y-10">
      {/* Filter buttons — Astro style: pill shape, white outline → blue active */}
      <div className="flex flex-wrap items-center justify-center gap-2">
        <button
          onClick={() => setSelectedTag(null)}
          className={`px-6 py-2 rounded-full font-semibold text-sm transition-all duration-300 border-2 ${
            selectedTag === null
              ? 'bg-primary border-primary text-white shadow-lg'
              : 'bg-transparent border-white/70 text-white hover:border-white hover:bg-white/10'
          }`}
        >
          {allLabel}
        </button>
        {allTags.map(tag => (
          <button
            key={tag}
            onClick={() => setSelectedTag(tag)}
            className={`px-6 py-2 rounded-full font-semibold text-sm transition-all duration-300 border-2 ${
              selectedTag === tag
                ? 'bg-primary border-primary text-white shadow-lg'
                : 'bg-transparent border-white/70 text-white hover:border-white hover:bg-white/10'
            }`}
          >
            {tagLabel(tag, lang)}
          </button>
        ))}
      </div>

      {/* Gallery grid — Astro pattern: auto-fill minmax(300px, 1fr) */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
          gap: '1.5rem'
        }}
      >
        {filteredItems.map((item, idx) => {
          const caption = getLocalizedCaption(item.caption, lang)
          return (
            <div
              key={item.id}
              onClick={() => openLightbox(idx)}
              className="relative overflow-hidden cursor-pointer group"
              style={{
                borderRadius: '15px',
                boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
                transition: 'all 0.3s ease',
                background: 'white',
              }}
              onMouseEnter={e => {
                const el = e.currentTarget as HTMLDivElement
                el.style.transform = 'translateY(-5px)'
                el.style.boxShadow = '0 8px 30px rgba(0,0,0,0.15)'
              }}
              onMouseLeave={e => {
                const el = e.currentTarget as HTMLDivElement
                el.style.transform = 'translateY(0)'
                el.style.boxShadow = '0 4px 20px rgba(0,0,0,0.1)'
              }}
            >
              {/* 4:3 aspect ratio container */}
              <div className="relative w-full bg-zinc-200" style={{ aspectRatio: '4/3', overflow: 'hidden' }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={item.url}
                  alt={caption || 'Gallery image'}
                  loading={idx < 6 ? 'eager' : 'lazy'}
                  decoding="async"
                  className="absolute inset-0 w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                />
                {/* Hover overlay */}
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-5">
                  <Maximize2 className="absolute top-4 right-4 text-white w-5 h-5" />
                  {caption && (
                    <p className="text-white font-bold text-base mb-1.5 transform translate-y-4 group-hover:translate-y-0 transition-transform">
                      {caption}
                    </p>
                  )}
                  <div className="flex flex-wrap gap-1">
                    {item.tags?.map(tag => (
                      <span key={tag} className="text-[10px] uppercase tracking-wider bg-primary/80 text-white px-2 py-0.5 rounded backdrop-blur-sm">
                        {tagLabel(tag, lang)}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Lightbox with keyboard nav */}
      {lightboxIndex !== null && filteredItems[lightboxIndex] && (
        <div
          className="fixed inset-0 z-[100] bg-black/95 flex items-center justify-center"
          onClick={closeLightbox}
          style={{ animation: 'fadeIn 0.3s ease' }}
        >
          {/* Close */}
          <button
            onClick={closeLightbox}
            className="absolute top-5 right-5 z-10 w-12 h-12 bg-white/90 text-gray-800 rounded-full flex items-center justify-center hover:bg-white transition-all hover:scale-110"
            aria-label="Close lightbox"
          >
            <X className="w-6 h-6" />
          </button>

          {/* Prev */}
          <button
            onClick={(e) => { e.stopPropagation(); prevLightbox() }}
            className="absolute left-4 top-1/2 -translate-y-1/2 z-10 w-12 h-12 bg-white/90 text-gray-800 rounded-full flex items-center justify-center hover:bg-white transition-all hover:scale-110"
            aria-label="Previous image"
          >
            <ChevronLeft className="w-7 h-7" />
          </button>

          {/* Image */}
          <div
            className="relative w-[90vw] h-[90vh] flex items-center justify-center"
            onClick={e => e.stopPropagation()}
          >
            <Image
              src={filteredItems[lightboxIndex].url}
              alt={getLocalizedCaption(filteredItems[lightboxIndex].caption, lang) || 'Gallery image'}
              fill
              unoptimized
              className="object-contain rounded-lg"
              sizes="100vw"
            />
            {/* Caption */}
            {getLocalizedCaption(filteredItems[lightboxIndex].caption, lang) && (
              <div className="absolute -bottom-10 left-0 right-0 text-center text-white text-sm">
                {getLocalizedCaption(filteredItems[lightboxIndex].caption, lang)}
              </div>
            )}
          </div>

          {/* Next */}
          <button
            onClick={(e) => { e.stopPropagation(); nextLightbox() }}
            className="absolute right-4 top-1/2 -translate-y-1/2 z-10 w-12 h-12 bg-white/90 text-gray-800 rounded-full flex items-center justify-center hover:bg-white transition-all hover:scale-110"
            aria-label="Next image"
          >
            <ChevronRight className="w-7 h-7" />
          </button>

          {/* Counter */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-white/70 text-sm">
            {lightboxIndex + 1} / {filteredItems.length}
          </div>
        </div>
      )}
    </div>
  )
}
