import {
  getInsertOrderUpdates,
  getMoveOrderUpdates,
  normalizeDisplayOrder,
  normalizeInsertTargetOrder,
  normalizeMoveTargetOrder,
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

  it('keeps inserted image order contiguous when existing images already share the target order', () => {
    expect(getInsertOrderUpdates([
      { id: 'one', display_order: 1 },
      { id: 'three-a', display_order: 3 },
      { id: 'three-b', display_order: 3 },
      { id: 'four', display_order: 4 },
    ], 3)).toEqual([
      { id: 'four', display_order: 5 },
      { id: 'three-b', display_order: 4 },
      { id: 'three-a', display_order: 2 },
    ])
  })

  it('fills missing numbers before the inserted image target order', () => {
    const existingItems = [
      { id: 'zero', display_order: 0 },
      { id: 'one', display_order: 1 },
      { id: 'four', display_order: 4 },
      { id: 'five', display_order: 5 },
    ]

    expect(normalizeInsertTargetOrder(existingItems, 3)).toBe(3)
    expect(getInsertOrderUpdates(existingItems, 3)).toEqual([
      { id: 'five', display_order: 4 },
      { id: 'four', display_order: 2 },
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

  it('keeps moved image order contiguous when moving onto an order with duplicates', () => {
    expect(getMoveOrderUpdates([
      { id: 'one', display_order: 1 },
      { id: 'three-a', display_order: 3 },
      { id: 'three-b', display_order: 3 },
      { id: 'four', display_order: 4 },
      { id: 'moving', display_order: 8 },
    ], 'moving', 8, 3)).toEqual([
      { id: 'four', display_order: 5 },
      { id: 'three-b', display_order: 4 },
      { id: 'three-a', display_order: 2 },
    ])
  })

  it('shifts the middle range up when moving an image later', () => {
    expect(getMoveOrderUpdates(items, 'three', 3, 8)).toEqual([
      { id: 'eight', display_order: 7 },
      { id: 'seven', display_order: 6 },
      { id: 'six', display_order: 5 },
      { id: 'five', display_order: 4 },
      { id: 'four', display_order: 3 },
    ])
  })

  it('keeps moved image order contiguous when moving later through duplicate orders', () => {
    expect(getMoveOrderUpdates([
      { id: 'moving', display_order: 1 },
      { id: 'two-a', display_order: 2 },
      { id: 'two-b', display_order: 2 },
      { id: 'three', display_order: 3 },
    ], 'moving', 1, 3)).toEqual([
      { id: 'three', display_order: 4 },
      { id: 'two-a', display_order: 1 },
    ])
  })

  it('clamps a too-large move target to the end of the contiguous sequence', () => {
    expect(normalizeMoveTargetOrder(items, 99)).toBe(8)
  })
})
