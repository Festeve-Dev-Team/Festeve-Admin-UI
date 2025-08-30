import type { CategoryWithId, CategoryDto } from '@/views/categoriesV2/types/category'

export interface CategoryState {
    categories: CategoryWithId[]
    selectedCategory: CategoryWithId | null
    parentCategories: CategoryWithId[] // For parent selection dropdown
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
        parents: boolean
    }
    error: {
        list: string | null
        create: string | null
        update: string | null
        delete: string | null
        fetch: string | null
        parents: string | null
    }
    filters: {
        search: string
        level: number | null
        parentId: string | null
        sortBy: string
        sortOrder: 'asc' | 'desc'
    }
    lastFetched: number | null
    cacheExpiry: number
}

export interface CategoryListParams {
    page?: number
    limit?: number
    search?: string
    level?: number
    parentId?: string
    sortBy?: string
    sortOrder?: 'asc' | 'desc'
}

export interface CategoryUpdatePayload {
    id: string
    data: Partial<CategoryDto>
}

export interface CategoryDeletePayload {
    id: string
}

export interface CategoryApiError {
    message: string
    status?: number
    field?: string
}
