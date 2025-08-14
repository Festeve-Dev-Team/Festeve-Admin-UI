export type OfferType = 'percentage_discount' | 'fixed_discount' | 'bogo' | 'combo_bundle'
export type DiscountType = 'percentage' | 'fixed'

export type ComboItem = { productId: string; quantity: number }

export type OfferDto = {
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
}

export type OfferId = string
export type OfferWithId = OfferDto & { id: OfferId }



