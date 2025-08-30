import type { z } from 'zod'
import type { offerSchema } from '../schema/offerSchema'

export type OfferType = 'percentage_discount' | 'fixed_discount' | 'bogo' | 'combo_bundle'
export type DiscountType = 'percentage' | 'fixed'

export type ComboItem = { productId: string; quantity: number }

export type OfferId = string
export type OfferFormInput = z.infer<typeof offerSchema>

export interface OfferWithId extends OfferFormInput {
    id: OfferId
    createdAt?: string
    updatedAt?: string
}

export type OfferDto = {
    id?: OfferId
    title: string
    description?: string
    type: OfferType
    discountType: DiscountType
    discountValue: number
    comboItems: ComboItem[]
    appliesTo: 'product' | 'category' | 'event' | 'all'
    targetIds: string[]
    minGroupSize: number
    maxGroupSize: number
    startDate: string
    endDate: string
    combinable: boolean
    conditions: Record<string, unknown>
    createdAt?: string
    updatedAt?: string
}



