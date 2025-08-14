import type { DeliverySlotWithId, DeliverySlotDto } from '../types/slot'

export async function fetchSlots({ from, to }: { from?: string; to?: string }) {
    return [] as DeliverySlotWithId[]
}

export async function saveSlot(dto: DeliverySlotWithId | DeliverySlotDto): Promise<DeliverySlotWithId> {
    const id = (dto as DeliverySlotWithId).id ?? `ds_${Math.random().toString(36).slice(2, 10)}`
    return { ...(dto as DeliverySlotDto), id }
}

export async function checkSlotConflicts({ startTime, endTime }: { startTime: string; endTime: string }) {
    return { conflicts: 0 }
}



