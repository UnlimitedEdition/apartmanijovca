import { cldThumb, cldFull, cldBlur, cldSrcSet } from '@/lib/images/cloudinary'

const RAW =
  'https://res.cloudinary.com/dp2aulqeb/image/upload/v1781654418/apartmani-jovca/gallery/xxx.jpg'
const NON_CLD = 'https://example.com/photo.jpg'

describe('cloudinary url helpers', () => {
  it('ubacuje transformaciju ispred verzije za Cloudinary URL', () => {
    expect(cldThumb(RAW, 600)).toBe(
      'https://res.cloudinary.com/dp2aulqeb/image/upload/c_fill,ar_4:3,w_600,f_auto,q_auto:eco/v1781654418/apartmani-jovca/gallery/xxx.jpg'
    )
  })

  it('cldFull koristi c_limit i zadatu širinu', () => {
    expect(cldFull(RAW, 1920)).toContain(
      '/upload/c_limit,w_1920,f_auto,q_auto/v1781654418/'
    )
  })

  it('cldBlur pravi sićušan zamućen LQIP', () => {
    expect(cldBlur(RAW)).toContain('e_blur:1500')
    expect(cldBlur(RAW)).toContain('w_64')
  })

  it('ne dira ne-Cloudinary URL-ove', () => {
    expect(cldThumb(NON_CLD)).toBe(NON_CLD)
    expect(cldFull(NON_CLD)).toBe(NON_CLD)
    expect(cldBlur(NON_CLD)).toBe(NON_CLD)
    expect(cldSrcSet(NON_CLD)).toBe('')
  })

  it('idempotentno — ne duplira postojeću transformaciju', () => {
    const once = cldThumb(RAW, 600)
    expect(cldThumb(once, 600)).toBe(once)
  })

  it('cldSrcSet generiše više širina sa w deskriptorima', () => {
    const ss = cldSrcSet(RAW, [400, 800])
    expect(ss).toContain(',w_400,')
    expect(ss).toContain(' 400w')
    expect(ss).toContain(',w_800,')
    expect(ss).toContain(' 800w')
  })

  it('prazan ulaz ne puca', () => {
    expect(cldThumb('')).toBe('')
    expect(cldSrcSet('')).toBe('')
  })
})
