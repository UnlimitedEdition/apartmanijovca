export interface GalleryOrderItem {
  id: string
  display_order: number
}

export interface GalleryOrderUpdate {
  id: string
  display_order: number
}

export function normalizeDisplayOrder(value: unknown): number {
  const order = Number(value)
  if (!Number.isFinite(order)) return 1
  return Math.max(1, Math.trunc(order))
}

function sortByCurrentOrder(items: GalleryOrderItem[]): GalleryOrderItem[] {
  return [...items].sort((a, b) => {
    if (a.display_order !== b.display_order) return a.display_order - b.display_order
    return a.id.localeCompare(b.id)
  })
}

function clampOrder(targetOrder: number, maxOrder: number): number {
  return Math.min(Math.max(normalizeDisplayOrder(targetOrder), 1), Math.max(maxOrder, 1))
}

function sortUpdatesForSafeWrite(updates: GalleryOrderUpdate[]): GalleryOrderUpdate[] {
  return [...updates].sort((a, b) => b.display_order - a.display_order)
}

export function normalizeInsertTargetOrder(
  items: GalleryOrderItem[],
  targetOrder: number
): number {
  return clampOrder(targetOrder, items.length + 1)
}

export function normalizeMoveTargetOrder(
  items: GalleryOrderItem[],
  targetOrder: number
): number {
  return clampOrder(targetOrder, items.length)
}

export function getInsertOrderUpdates(
  items: GalleryOrderItem[],
  targetOrder: number
): GalleryOrderUpdate[] {
  const insertOrder = normalizeInsertTargetOrder(items, targetOrder)
  let nextOrder = 1

  const updates = sortByCurrentOrder(items).map(item => {
    if (nextOrder === insertOrder) nextOrder += 1
    const displayOrder = nextOrder
    nextOrder += 1
    return { id: item.id, display_order: displayOrder }
  }).filter(update => {
    const item = items.find(current => current.id === update.id)
    return item?.display_order !== update.display_order
  })

  return sortUpdatesForSafeWrite(updates)
}

export function getMoveOrderUpdates(
  items: GalleryOrderItem[],
  movingId: string,
  currentOrder: number,
  targetOrder: number
): GalleryOrderUpdate[] {
  const moveOrder = normalizeMoveTargetOrder(items, targetOrder)
  let nextOrder = 1

  const updates = sortByCurrentOrder(items)
    .filter(item => item.id !== movingId)
    .map(item => {
      if (nextOrder === moveOrder) nextOrder += 1
      const displayOrder = nextOrder
      nextOrder += 1
      return { id: item.id, display_order: displayOrder }
    })
    .filter(update => {
      const item = items.find(current => current.id === update.id)
      return item?.display_order !== update.display_order
    })

  if (moveOrder === currentOrder) return sortUpdatesForSafeWrite(updates)
  return sortUpdatesForSafeWrite(updates)
}
