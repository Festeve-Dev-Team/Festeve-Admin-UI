export type DiscountType = 'none' | 'percentage' | 'fixed'

export type OfferType =
    | 'exclusive_offer'
    | 'flash_sale'
    | 'bogo'
    | 'seasonal'
    | 'clearance'

export type Variant = {
    sku: string
    specs: Record<string, string | number | boolean>
    price: number
    stock: number
    discountType: DiscountType
    discountValue: number
    images: string[]
    isActive: boolean
}

export type Product = {
    name: string
    description: string
    category: string
    tags: string[]
    isHotItem: boolean
    ingredients: string[]
    vendors: string[]
    variants: Variant[]
    defaultDiscountType: DiscountType
    defaultDiscountValue: number
    linkedEvents: string[]
    offerType: OfferType
    offerStart: string
    offerEnd: string
    isTrending: boolean
    meta: Record<string, unknown> & {
        title?: string
        description?: string
        keywords?: string[]
    }
}

export type ProductId = string

export type ProductWithId = Product & { id: ProductId }


