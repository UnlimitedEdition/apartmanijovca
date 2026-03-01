'use client'

import Image from 'next/image'

interface CloudinaryImageProps {
  src: string // Cloudinary public ID or full URL
  alt: string
  width?: number
  height?: number
  className?: string
  quality?: number
  priority?: boolean
}

export function CloudinaryImage({
  src,
  alt,
  width = 800,
  height = 600,
  className = '',
  quality = 80,
  priority = false,
}: CloudinaryImageProps) {
  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME

  // If src is already a full URL, use it directly
  if (src.startsWith('http')) {
    return (
      <Image
        src={src}
        alt={alt}
        width={width}
        height={height}
        className={className}
        priority={priority}
      />
    )
  }

  // Build Cloudinary URL with optimizations
  const cloudinaryUrl = `https://res.cloudinary.com/${cloudName}/image/upload/f_auto,q_${quality},w_${width},h_${height},c_fill/${src}`

  return (
    <Image
      src={cloudinaryUrl}
      alt={alt}
      width={width}
      height={height}
      className={className}
      priority={priority}
    />
  )
}
