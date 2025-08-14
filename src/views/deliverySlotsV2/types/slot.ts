export type DeliverySlotDto = {
    startTime: string
    endTime: string
    maxOrders: number
    currentOrders: number
    isActive: boolean
    description?: string
}

export type DeliverySlotId = string
export type DeliverySlotWithId = DeliverySlotDto & { id: DeliverySlotId }



