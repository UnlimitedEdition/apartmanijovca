'use client'

import { useState, useMemo, useEffect } from 'react'
import Image from 'next/image'
import { Card, CardContent } from '@/app/[lang]/components/ui/card'
import { Button } from '@/app/[lang]/components/ui/button'
import { Maximize2, X, Loader2 } from 'lucide-react'

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
  const [selectedImage, setSelectedImage] = useState<string | null>(null)

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

  if (!mounted) {
    return (
      <div className="min-h-[400px] flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <div className="space-y-12">
      {/* Filters */}
      <div className="flex flex-wrap items-center justify-center gap-2">
        <Button
          variant={selectedTag === null ? "default" : "outline"}
          size="sm"
          onClick={() => setSelectedTag(null)}
          className="rounded-full px-6 font-bold"
        >
          {lang === 'sr' ? 'Sve' : 'All'}
        </Button>
        {allTags.map(tag => (
          <Button
            key={tag}
            variant={selectedTag === tag ? "default" : "outline"}
            size="sm"
            onClick={() => setSelectedTag(tag)}
            className="rounded-full px-6 font-bold"
          >
            {tag}
          </Button>
        ))}
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredItems.map((item) => {
          const caption = getLocalizedCaption(item.caption, lang)
          return (
            <div key={item.id} className="transition-all duration-300">
              <Card 
                className="group overflow-hidden cursor-pointer border-none shadow-md hover:shadow-xl transition-all"
                onClick={() => setSelectedImage(item.url)}
              >
                <CardContent className="p-0 relative aspect-[4/3] bg-muted">
                  {/* Shimmer Placeholder */}
                  <div className="absolute inset-0 animate-shimmer" />
                  
                  <Image
                    src={item.url}
                    alt={caption || 'Gallery image'}
                    fill
                    unoptimized
                    className="object-cover transition-all duration-700 group-hover:scale-110 opacity-0 data-[loaded=true]:opacity-100"
                    onLoad={(img) => {
                      const target = img.target as HTMLImageElement
                      target.setAttribute('data-loaded', 'true')
                    }}
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-6">
                    <Maximize2 className="absolute top-4 right-4 text-white w-6 h-6" />
                    {caption && (
                      <p className="text-white font-bold text-lg mb-2 transform translate-y-4 group-hover:translate-y-0 transition-transform">
                        {caption}
                      </p>
                    )}
                    <div className="flex flex-wrap gap-1">
                      {item.tags?.map(tag => (
                        <span key={tag} className="text-[10px] uppercase tracking-wider bg-primary/80 text-white px-2 py-0.5 rounded backdrop-blur-sm">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )
        })}
      </div>

      {/* Lightbox / Modal */}
      {selectedImage && (
        <div 
          className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-sm flex items-center justify-center p-4 lg:p-12"
          onClick={() => setSelectedImage(null)}
        >
          <button className="absolute top-6 right-6 text-white/70 hover:text-white transition-colors">
            <X className="w-10 h-10" />
          </button>
          <div className="relative w-full h-full max-w-6xl max-h-[85vh]">
            <Image
              src={selectedImage}
              alt="Gallery display"
              fill
              unoptimized
              className="object-contain transition-opacity duration-300 opacity-0 data-[loaded=true]:opacity-100"
              onLoad={(img) => {
                const target = img.target as HTMLImageElement
                target.setAttribute('data-loaded', 'true')
              }}
              sizes="100vw"
            />
          </div>
        </div>
      )}
    </div>
  )
}
