export type PromoStatus = 'ACTIVE' | 'PAUSED' | 'EXPIRED' | 'ARCHIVED'

export type PromoDto = {
    name: string
    code: string
    status?: PromoStatus
    startsAt?: string
    endsAt?: string
    globalLimit?: number
    perUserLimit?: number
    productIds?: string[]
    linkTTLSeconds?: number
    tags?: string[]
    notes?: string
}

export type PromoId = string
export type PromoWithId = PromoDto & { id: PromoId }
