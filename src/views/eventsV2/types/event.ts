export type Frequency = 'daily' | 'weekly' | 'monthly' | 'yearly'

export type LinkedProduct = { productId: string; relation: string }
export type SpecialOffer = { offerType: string; productId: string }

export type Recurring = {
    isRecurring: boolean
    frequency?: Frequency
    daysOfWeek?: number[]
}

export type EventDto = {
    name: string
    description?: string
    type: string
    date: string
    recurring: Recurring
    linkedProducts: LinkedProduct[]
    purohitRequired: boolean
    ritualNotes?: string
    region?: string
    regions: string[]
    specialOffers: SpecialOffer[]
    extraData: Record<string, unknown>
}

export type EventId = string
export type EventWithId = EventDto & { id: EventId }



