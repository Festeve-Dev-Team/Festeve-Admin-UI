import type { ProductWithId, ProductsApiResponse } from '@/views/salesV2/types/product'

export interface ProductState {
    // Product data
    products: ProductWithId[]
    selectedProduct: ProductWithId | null
    
    // Pagination
    pagination: ProductsApiResponse['pagination']
    
    // Loading states
    loading: {
        list: boolean
        create: boolean
        update: boolean
        delete: boolean
        fetch: boolean
    }
    
    // Error states
    error: {
        list: string | null
        create: string | null
        update: string | null
        delete: string | null
        fetch: string | null
    }
    
    // UI state
    filters: {
        search: string
        category: string
        isTrending: boolean | null
        isHotItem: boolean | null
        priceRange: {
            min: number | null
            max: number | null
        }
    }
    
    // Cache management
    lastFetched: number | null
    cacheExpiry: number // in milliseconds
}

export interface ProductListParams {
    page?: number
    limit?: number
    search?: string
    category?: string
    isTrending?: boolean
    isHotItem?: boolean
    priceMin?: number
    priceMax?: number
}

export interface ProductUpdatePayload {
    id: string
    data: Partial<ProductWithId>
}

export interface ProductDeletePayload {
    id: string
}

// API Error interface
export interface ProductApiError {
    message: string
    status?: number
    field?: string
}
