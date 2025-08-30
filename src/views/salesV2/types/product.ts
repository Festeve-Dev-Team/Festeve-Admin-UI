export type DiscountType = 'none' | 'percentage' | 'fixed'

export type OfferType =
    | 'exclusive_offer'
    | 'flash_sale'
    | 'best_deal'

export type ProductSize = 
    | 'XS' | 'S' | 'M' | 'L' | 'XL' | 'XXL' | 'XXXL' | '2XL' | '3XL' | '4XL' | '5XL'
    | '28' | '30' | '32' | '34' | '36' | '38' | '40' | '42' | '44' | '46' | '48' | '50'
    | 'Free Size' | 'One Size' | 'Custom'

export type Dimensions = {
    length?: number
    width?: number
    height?: number
    unit?: 'cm' | 'inch' | 'mm'
}

export type Variant = {
    _id: string
    sku: string
    specs: Record<string, string | number | boolean>
    price: number
    stock: number
    discountType: DiscountType
    discountValue: number
    images: string[]
    isActive: boolean
    size?: ProductSize
    color?: string
    colorCode?: string
    colorFamily?: string
    material?: string
    weight?: number
    dimensions?: Dimensions
}

export type Product = {
    _id: string
    name: string
    description: string
    categoryId: string
    tags: string[]
    isHotItem: boolean
    ingredients: string[]
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
        festival?: string
        shippingTime?: string
    }
    createdAt: string
    updatedAt: string
    __v: number
}

export type ProductId = string

export type ProductWithId = Product & { id: ProductId }

export type ProductsApiResponse = {
    products: Product[]
    pagination: {
        page: number
        limit: number
        total: number
        pages: number
    }
}


