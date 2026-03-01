'use client'

import { useEffect, useRef, useState } from 'react'

interface LazyImageProps {
  src: string
  alt: string
  className?: string
  priority?: boolean
  width?: number
  height?: number
}

export default function LazyImage({ 
  src, 
  alt, 
  className = '', 
  priority = false,
  width,
  height 
}: LazyImageProps) {
  const [imageSrc, setImageSrc] = useState<string | null>(priority ? src : null)
  const [isLoaded, setIsLoaded] = useState(false)
  const imgRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (priority) {
      setIsLoaded(true)
      return
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setImageSrc(src)
            observer.disconnect()
          }
        })
      },
      {
        rootMargin: '100px', // Start loading 100px before image enters viewport
      }
    )

    if (imgRef.current) {
      observer.observe(imgRef.current)
    }

    return () => {
      observer.disconnect()
    }
  }, [priority, src])

  if (!imageSrc) {
    // Render placeholder div until image should load
    return (
      <div
        ref={imgRef}
        className={className}
        style={{
          backgroundColor: '#f0f0f0',
          minHeight: height ? `${height}px` : '200px',
          width: width ? `${width}px` : '100%',
        }}
        aria-label={alt}
      />
    )
  }

  return (
    <img
      src={imageSrc}
      alt={alt}
      className={className}
      width={width}
      height={height}
      loading={priority ? 'eager' : 'lazy'}
      decoding={priority ? 'sync' : 'async'}
      onLoad={() => setIsLoaded(true)}
      style={{
        opacity: isLoaded ? 1 : 0,
        transition: 'opacity 0.3s ease-in-out',
      }}
    />
  )
}
