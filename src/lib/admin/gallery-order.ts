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
  if (!Number.isFinite(order)) return 0
  return Math.max(0, Math.trunc(order))
}

export function getInsertOrderUpdates(
  items: GalleryOrderItem[],
  targetOrder: number
): GalleryOrderUpdate[] {
  return items
    .filter(item => item.display_order >= targetOrder)
    .sort((a, b) => b.display_order - a.display_order)
    .map(item => ({ id: item.id, display_order: item.display_order + 1 }))
}

export function getMoveOrderUpdates(
  items: GalleryOrderItem[],
  movingId: string,
  currentOrder: number,
  targetOrder: number
): GalleryOrderUpdate[] {
  if (targetOrder === currentOrder) return []

  if (targetOrder < currentOrder) {
    return items
      .filter(item =>
        item.id !== movingId &&
        item.display_order >= targetOrder &&
        item.display_order < currentOrder
      )
      .sort((a, b) => b.display_order - a.display_order)
      .map(item => ({ id: item.id, display_order: item.display_order + 1 }))
  }

  return items
    .filter(item =>
      item.id !== movingId &&
      item.display_order > currentOrder &&
      item.display_order <= targetOrder
    )
    .sort((a, b) => a.display_order - b.display_order)
    .map(item => ({ id: item.id, display_order: item.display_order - 1 }))
}
