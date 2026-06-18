'use client'
/* eslint-disable @next/next/no-img-element -- Custom lazy image handles observer loading and cached image detection. */

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
  const placeholderRef = useRef<HTMLDivElement>(null)
  const imgRef = useRef<HTMLImageElement>(null)

  useEffect(() => {
    if (priority) return

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setImageSrc(src)
            observer.disconnect()
          }
        })
      },
      { rootMargin: '100px' }
    )

    if (placeholderRef.current) {
      observer.observe(placeholderRef.current)
    }

    return () => observer.disconnect()
  }, [priority, src])

  // Cached images load synchronously and `onLoad` may fire before React
  // attaches the listener. Detect that case via `img.complete`.
  useEffect(() => {
    if (imgRef.current?.complete && imgRef.current.naturalWidth > 0) {
      setIsLoaded(true)
    }
  }, [imageSrc])

  if (!imageSrc) {
    return (
      <div
        ref={placeholderRef}
        className={`${className} animate-pulse`}
        style={{
          backgroundColor: '#e5e7eb',
          minHeight: height ? `${height}px` : '200px',
          width: width ? `${width}px` : '100%',
        }}
        aria-label={alt}
        role="img"
      />
    )
  }

  return (
    <img
      ref={imgRef}
      src={imageSrc}
      alt={alt}
      className={className}
      width={width}
      height={height}
      loading={priority ? 'eager' : 'lazy'}
      decoding={priority ? 'sync' : 'async'}
      onLoad={() => setIsLoaded(true)}
      onError={() => setIsLoaded(true)}
      style={{
        opacity: isLoaded ? 1 : 0,
        transition: 'opacity 0.3s ease-in-out',
      }}
    />
  )
}
