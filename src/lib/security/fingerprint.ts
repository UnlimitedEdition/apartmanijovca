/**
 * Browser fingerprinting and metadata collection
 * Used for security and spam prevention
 */

export interface DeviceMetadata {
  fingerprint: string
  userAgent: string
  deviceInfo: {
    platform: string
    language: string
    screenResolution: string
    timezone: string
    colorDepth?: number
    hardwareConcurrency?: number
    deviceMemory?: number
  }
}

interface ExtendedNavigator extends Navigator {
  deviceMemory?: number
}

interface ExtendedWindow extends Window {
  chrome?: unknown
  safari?: unknown
}

/**
 * Generate a browser fingerprint based on available device characteristics
 */
export async function generateFingerprint(): Promise<string> {
  const components: string[] = []

  // User agent
  components.push(navigator.userAgent)

  // Screen resolution
  components.push(`${screen.width}x${screen.height}x${screen.colorDepth}`)

  // Timezone
  components.push(Intl.DateTimeFormat().resolvedOptions().timeZone)

  // Language
  components.push(navigator.language)

  // Platform
  components.push(navigator.platform)

  // Hardware concurrency (CPU cores)
  if ('hardwareConcurrency' in navigator) {
    components.push(String(navigator.hardwareConcurrency))
  }

  // Device memory (if available)
  if ('deviceMemory' in navigator) {
    components.push(String((navigator as ExtendedNavigator).deviceMemory))
  }

  // Canvas fingerprint
  try {
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')
    if (ctx) {
      ctx.textBaseline = 'top'
      ctx.font = '14px Arial'
      ctx.fillStyle = '#f60'
      ctx.fillRect(125, 1, 62, 20)
      ctx.fillStyle = '#069'
      ctx.fillText('Apartmani Jovča', 2, 15)
      components.push(canvas.toDataURL())
    }
  } catch {
    // Canvas fingerprinting blocked or failed
  }

  // WebGL fingerprint
  try {
    const canvas = document.createElement('canvas')
    const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl') as WebGLRenderingContext | null
    if (gl) {
      const debugInfo = gl.getExtension('WEBGL_debug_renderer_info')
      if (debugInfo) {
        const vendor = gl.getParameter(debugInfo.UNMASKED_VENDOR_WEBGL)
        const renderer = gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL)
        components.push(String(vendor))
        components.push(String(renderer))
      }
    }
  } catch {
    // WebGL fingerprinting blocked or failed
  }

  // Generate hash from components
  const fingerprint = await hashString(components.join('|'))
  return fingerprint
}

/**
 * Collect device metadata
 */
export function collectDeviceMetadata(): Omit<DeviceMetadata, 'fingerprint'> {
  return {
    userAgent: navigator.userAgent,
    deviceInfo: {
      platform: navigator.platform,
      language: navigator.language,
      screenResolution: `${screen.width}x${screen.height}`,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      colorDepth: screen.colorDepth,
      hardwareConcurrency: 'hardwareConcurrency' in navigator ? navigator.hardwareConcurrency : undefined,
      deviceMemory: 'deviceMemory' in navigator ? (navigator as ExtendedNavigator).deviceMemory : undefined
    }
  }
}

/**
 * Get complete security metadata including fingerprint
 */
export async function getSecurityMetadata(): Promise<DeviceMetadata> {
  const fingerprint = await generateFingerprint()
  const metadata = collectDeviceMetadata()
  
  return {
    fingerprint,
    ...metadata
  }
}

/**
 * Simple hash function for fingerprinting
 */
async function hashString(str: string): Promise<string> {
  // Use Web Crypto API if available
  if (typeof crypto !== 'undefined' && crypto.subtle) {
    const encoder = new TextEncoder()
    const data = encoder.encode(str)
    const hashBuffer = await crypto.subtle.digest('SHA-256', data)
    const hashArray = Array.from(new Uint8Array(hashBuffer))
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
  }

  // Fallback to simple hash
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i)
    hash = ((hash << 5) - hash) + char
    hash = hash & hash // Convert to 32bit integer
  }
  return Math.abs(hash).toString(16)
}

/**
 * Check if user is likely a bot based on behavior patterns
 */
export function detectBotBehavior(): {
  isLikelyBot: boolean
  reasons: string[]
} {
  const reasons: string[] = []
  const win = window as ExtendedWindow

  // Check for headless browser
  if (navigator.webdriver) {
    reasons.push('webdriver_detected')
  }

  // Check for missing features
  if (!win.chrome && !win.safari && navigator.userAgent.includes('Chrome')) {
    reasons.push('missing_chrome_object')
  }

  // Check for automation tools
  if ((win as Window & { _phantom?: unknown; callPhantom?: unknown })._phantom || 
      (win as Window & { _phantom?: unknown; callPhantom?: unknown }).callPhantom) {
    reasons.push('phantom_detected')
  }

  if ((win as Window & { __nightmare?: unknown }).__nightmare) {
    reasons.push('nightmare_detected')
  }

  // Check for suspicious navigator properties
  if (navigator.plugins.length === 0) {
    reasons.push('no_plugins')
  }

  // Check for suspicious language
  if (!navigator.languages || navigator.languages.length === 0) {
    reasons.push('no_languages')
  }

  return {
    isLikelyBot: reasons.length >= 2,
    reasons
  }
}
