export const ALL_GALLERY_FOLDER = 'Sve'

export const GALLERY_FOLDERS = [
  ALL_GALLERY_FOLDER,
  'Eksterijer',
  'Jezero',
  'Sobe',
  'Terasa',
  'Pogled',
] as const

export const DEFAULT_GALLERY_FOLDER = 'Eksterijer'

export const GALLERY_FOLDER_ORDER_COLUMNS = {
  [ALL_GALLERY_FOLDER]: 'display_order',
  Eksterijer: 'exterior_order',
  Jezero: 'lake_order',
  Sobe: 'rooms_order',
  Terasa: 'terrace_order',
  Pogled: 'view_order',
} as const

export type GalleryFolder = typeof GALLERY_FOLDERS[number]
export type GalleryOrderColumn = typeof GALLERY_FOLDER_ORDER_COLUMNS[GalleryFolder]

export interface GalleryOrderColumnRecord {
  display_order: number | null
  exterior_order?: number | null
  lake_order?: number | null
  rooms_order?: number | null
  terrace_order?: number | null
  view_order?: number | null
}

export function isGalleryFolder(folder: string): folder is GalleryFolder {
  return GALLERY_FOLDERS.includes(folder as GalleryFolder)
}

export function getGalleryOrderColumn(folder: string): GalleryOrderColumn {
  if (isGalleryFolder(folder)) return GALLERY_FOLDER_ORDER_COLUMNS[folder]
  return 'display_order'
}

export function getGalleryFolderOrder(item: GalleryOrderColumnRecord, folder: string): number {
  const column = getGalleryOrderColumn(folder)
  const value = item[column]
  if (typeof value === 'number' && Number.isFinite(value)) return value
  return typeof item.display_order === 'number' && Number.isFinite(item.display_order) ? item.display_order : 1
}
