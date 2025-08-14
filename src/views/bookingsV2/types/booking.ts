export type Address = {
    label?: string
    line1: string
    line2?: string
    city: string
    state: string
    pincode: string
    country: string
    isDefault: boolean
}

export type BookingDto = {
    purohitId: string
    eventId: string
    date: string
    timeSlot: string
    amount: number
    isGroupBooking: boolean
    groupSize?: number
    groupOfferId?: string
    address: Address
    extraNotes: Record<string, unknown>
}

export type BookingId = string
export type BookingWithId = BookingDto & { id: BookingId }



