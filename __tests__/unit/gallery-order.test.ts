import {
  getInsertOrderUpdates,
  getMoveOrderUpdates,
  normalizeDisplayOrder,
} from '@/lib/admin/gallery-order'

const items = [
  { id: 'one', display_order: 1 },
  { id: 'two', display_order: 2 },
  { id: 'three', display_order: 3 },
  { id: 'four', display_order: 4 },
  { id: 'five', display_order: 5 },
  { id: 'six', display_order: 6 },
  { id: 'seven', display_order: 7 },
  { id: 'eight', display_order: 8 },
]

describe('gallery order helpers', () => {
  it('normalizes invalid display order values', () => {
    expect(normalizeDisplayOrder('3.9')).toBe(3)
    expect(normalizeDisplayOrder('-2')).toBe(0)
    expect(normalizeDisplayOrder('abc')).toBe(0)
  })

  it('shifts existing images down when inserting into an occupied position', () => {
    expect(getInsertOrderUpdates(items, 3)).toEqual([
      { id: 'eight', display_order: 9 },
      { id: 'seven', display_order: 8 },
      { id: 'six', display_order: 7 },
      { id: 'five', display_order: 6 },
      { id: 'four', display_order: 5 },
      { id: 'three', display_order: 4 },
    ])
  })

  it('shifts the middle range down when moving an image earlier', () => {
    expect(getMoveOrderUpdates(items, 'eight', 8, 3)).toEqual([
      { id: 'seven', display_order: 8 },
      { id: 'six', display_order: 7 },
      { id: 'five', display_order: 6 },
      { id: 'four', display_order: 5 },
      { id: 'three', display_order: 4 },
    ])
  })

  it('shifts the middle range up when moving an image later', () => {
    expect(getMoveOrderUpdates(items, 'three', 3, 8)).toEqual([
      { id: 'four', display_order: 3 },
      { id: 'five', display_order: 4 },
      { id: 'six', display_order: 5 },
      { id: 'seven', display_order: 6 },
      { id: 'eight', display_order: 7 },
    ])
  })
})
