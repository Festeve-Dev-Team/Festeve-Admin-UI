import type { VendorWithId, VendorDto } from '@/views/vendorsV2/types/vendor'

export interface VendorState {
    vendors: VendorWithId[]
    selectedVendor: VendorWithId | null
    pagination: {
        page: number
        limit: number
        total: number
        pages: number
    }
    loading: {
        list: boolean
        create: boolean
        update: boolean
        delete: boolean
        fetch: boolean
    }
    error: {
        list: string | null
        create: string | null
        update: string | null
        delete: string | null
        fetch: string | null
    }
    filters: {
        search: string
        sortBy: string
        sortOrder: 'asc' | 'desc'
    }
    lastFetched: number | null
    cacheExpiry: number
}

export interface VendorListParams {
    page?: number
    limit?: number
    search?: string
    sortBy?: string
    sortOrder?: 'asc' | 'desc'
}

export interface VendorUpdatePayload {
    id: string
    data: Partial<Omit<VendorDto, 'ratings'>>
}

export interface VendorDeletePayload {
    id: string
}

export interface VendorApiError {
    message: string
    status?: number
    field?: string
}
