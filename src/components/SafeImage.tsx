'use client'

import { useState } from 'react'

interface SafeImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  fallbackSrc?: string
}

export default function SafeImage({ src, fallbackSrc, alt, className, ...props }: SafeImageProps) {
  const [imgSrc, setImgSrc] = useState(src)
  const [hasError, setHasError] = useState(false)

  const handleError = () => {
    if (!hasError) {
      setHasError(true)
      if (fallbackSrc) {
        setImgSrc(fallbackSrc)
      } else {
        // Default avatar fallback if none provided
        setImgSrc('https://api.dicebear.com/7.x/initials/svg?seed=J')
      }
    }
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={imgSrc}
      alt={alt}
      className={className}
      onError={handleError}
      {...props}
    />
  )
}
