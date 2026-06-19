import {
  ALL_GALLERY_FOLDER,
  DEFAULT_GALLERY_FOLDER,
  GALLERY_FOLDERS,
  getGalleryFolderOrder,
  getGalleryOrderColumn,
  getGalleryVisibleFolderOrder,
  isGalleryFolder,
} from '@/lib/admin/gallery-order-columns'

describe('gallery folder order columns', () => {
  it('maps each admin folder to its own order column', () => {
    expect(ALL_GALLERY_FOLDER).toBe('Sve')
    expect(DEFAULT_GALLERY_FOLDER).toBe('Eksterijer')
    expect(GALLERY_FOLDERS).toEqual(['Sve', 'Eksterijer', 'Jezero', 'Sobe', 'Terasa', 'Pogled'])
    expect(getGalleryOrderColumn('Sve')).toBe('display_order')
    expect(getGalleryOrderColumn('Eksterijer')).toBe('exterior_order')
    expect(getGalleryOrderColumn('Jezero')).toBe('lake_order')
    expect(getGalleryOrderColumn('Sobe')).toBe('rooms_order')
    expect(getGalleryOrderColumn('Terasa')).toBe('terrace_order')
    expect(getGalleryOrderColumn('Pogled')).toBe('view_order')
  })

  it('guards valid gallery folders', () => {
    expect(isGalleryFolder('Sobe')).toBe(true)
    expect(isGalleryFolder('Okolina')).toBe(false)
  })

  it('shows normalized one-based numbers for folder lists', () => {
    const item = {
      display_order: 20,
      rooms_order: null,
    }

    expect(getGalleryVisibleFolderOrder(item, 'Sobe', 2)).toBe(3)
    expect(getGalleryVisibleFolderOrder(item, 'Sobe', -1)).toBe(20)
  })

  it('reads folder-specific order before falling back to global order', () => {
    const item = {
      display_order: 20,
      rooms_order: 3,
      lake_order: null,
    }

    expect(getGalleryFolderOrder(item, 'Sobe')).toBe(3)
    expect(getGalleryFolderOrder(item, 'Jezero')).toBe(20)
    expect(getGalleryFolderOrder(item, 'Sve')).toBe(20)
  })
})
