/**
 * Cloudinary URL transformacije — čiste string funkcije (NE importuju Cloudinary
 * SDK, pa su bezbedne za upotrebu u client komponentama / browser bundle-u).
 *
 * Slike u bazi su sirovi Cloudinary URL-ovi bez transformacija
 * (`.../image/upload/v123/...`), zbog čega Cloudinary vraća netaknut original
 * (više MB). Ovde ubacujemo transformacioni segment ispred verzije tako da
 * Cloudinary on-the-fly generiše i TRAJNO kešira optimizovanu varijantu na svom
 * CDN-u (immutable). Prvi posetilac plati generisanje, svi ostali idu sa edge-a.
 *
 * Ne-Cloudinary URL-ovi (stare slike) vraćaju se netaknuti.
 *
 * Obrazac je isti kao `optimizeImageForSocial` u `src/lib/seo/social-media.ts`,
 * ovde generalizovan za grid/lightbox/LQIP.
 */

const UPLOAD_RE =
  /^(https?:\/\/res\.cloudinary\.com\/[^/]+\/image\/upload)\/(.+)$/

/**
 * Ubacuje Cloudinary transformacioni segment ispred ostatka putanje.
 * No-op za prazan ulaz, ne-Cloudinary URL i URL koji već ima transformaciju.
 */
function applyTransform(url: string | null | undefined, transform: string): string {
  if (!url) return url ?? ''
  const m = url.match(UPLOAD_RE)
  if (!m) return url // nije Cloudinary — ne diraj

  const rest = m[2]
  // Idempotentnost: ako prvi segment već liči na transformaciju
  // (sadrži zarez ili `xx_…` parametar), ne dupliraj.
  const firstSeg = rest.split('/', 1)[0]
  if (firstSeg.includes(',') || /^[a-z]{1,3}_[a-z0-9]/i.test(firstSeg)) {
    return url
  }
  return `${m[1]}/${transform}/${rest}`
}

/**
 * Thumbnail za grid — kropovan na zadati aspect ratio, minimalan transfer.
 * `f_auto` → AVIF/WebP, `q_auto` → pametna kompresija.
 */
export function cldThumb(url: string, width = 600, aspectRatio = '4:3'): string {
  return applyTransform(url, `c_fill,ar_${aspectRatio},w_${width},f_auto,q_auto`)
}

/**
 * Puna slika za lightbox/zoom — ograničena po širini (`c_limit` ne uvećava
 * preko originala), AVIF/WebP + pametna kompresija.
 */
export function cldFull(url: string, width = 1920): string {
  return applyTransform(url, `c_limit,w_${width},f_auto,q_auto`)
}

/**
 * Sićušan zamućen placeholder (LQIP, ~1–2 KB) koji se prikazuje dok se prava
 * slika učitava — daje percepciju trenutnog učitavanja.
 */
export function cldBlur(url: string): string {
  return applyTransform(url, `c_fill,ar_4:3,w_64,e_blur:1500,q_30,f_auto`)
}

/**
 * `srcset` string sa više širina za responsive grid. Browser bira najmanju
 * dovoljnu širinu prema `sizes`. Prazan string za ne-Cloudinary URL (tada se
 * koristi običan `src`).
 */
export function cldSrcSet(
  url: string,
  widths: number[] = [400, 600, 800, 1200],
  aspectRatio = '4:3'
): string {
  if (!url || !UPLOAD_RE.test(url)) return ''
  return widths.map((w) => `${cldThumb(url, w, aspectRatio)} ${w}w`).join(', ')
}
