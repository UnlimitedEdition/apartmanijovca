import { useState, useEffect } from 'react'

type Breakpoint = 'mobile' | 'tablet' | 'desktop' | 'wide' | 'ultrawide'

interface BreakpointState {
  isMobile: boolean
  isTablet: boolean
  isDesktop: boolean
  isWide: boolean
  isUltrawide: boolean
  current: Breakpoint
  width: number
}

export function useBreakpoint(): BreakpointState {
  const [breakpoint, setBreakpoint] = useState<BreakpointState>({
    isMobile: false,
    isTablet: false,
    isDesktop: false,
    isWide: false,
    isUltrawide: false,
    current: 'desktop',
    width: 1024
  })

  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth
      
      const state: BreakpointState = {
        isMobile: width < 768,
        isTablet: width >= 768 && width < 1024,
        isDesktop: width >= 1024 && width < 1280,
        isWide: width >= 1280 && width < 1536,
        isUltrawide: width >= 1536,
        current: width < 768 ? 'mobile' 
          : width < 1024 ? 'tablet'
          : width < 1280 ? 'desktop'
          : width < 1536 ? 'wide'
          : 'ultrawide',
        width
      }
      
      setBreakpoint(state)
    }

    handleResize()
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  return breakpoint
}
