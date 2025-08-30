export type VendorRating = {
    userId: string
    rating: number
    review?: string
    createdAt: string
}

export type VendorDto = {
    name: string
    storeName: string
    address?: string
    ratings: VendorRating[]
    productIds: string[]
}

export type VendorId = string
export type VendorWithId = VendorDto & { 
    id: VendorId
    averageRating?: number // Virtual field from backend
}

export type VendorsApiResponse = {
    vendors: VendorWithId[]
    pagination: {
        page: number
        limit: number
        total: number
        pages: number
    }
}



