import ApiService from '@/services/ApiService'
import type { CategoryWithId, CategoryDto, CategoriesApiResponse } from '../types/category'

// Category APIs
export async function createCategory(categoryData: CategoryDto): Promise<CategoryWithId> {
    try {
        const response = await ApiService.fetchData({
            url: '/categories',
            method: 'POST',
            data: categoryData,
        })
        return response.data as CategoryWithId
    } catch (error) {
        console.error('Failed to create category:', error)
        throw new Error('Failed to create category')
    }
}

export async function updateCategory(id: string, categoryData: Partial<CategoryDto>): Promise<CategoryWithId> {
    try {
        // Remove any fields that shouldn't be sent to API
        const cleanData = { ...categoryData }
        if ('id' in cleanData) {
            delete (cleanData as any).id
        }
        if ('_id' in cleanData) {
            delete (cleanData as any)._id
        }

        const response = await ApiService.fetchData({
            url: `/categories/${id}`,
            method: 'PATCH', // Changed from PUT to PATCH
            data: cleanData,
        })
        return response.data as CategoryWithId
    } catch (error) {
        console.error('Failed to update category:', error)
        throw error
    }
}

export async function getCategories(params: {
    page?: number
    limit?: number
    search?: string
    level?: number
    parentId?: string
    sortBy?: string
    sortOrder?: 'asc' | 'desc'
} = {}): Promise<CategoriesApiResponse> {
    try {
        const response = await ApiService.fetchData({
            url: '/categories/all',
            method: 'GET',
            params,
        })
        
        // Handle direct array response from API
        const data = response.data
        if (Array.isArray(data)) {
            // Transform categories to ensure id field exists
            const transformedCategories = data.map((cat: any) => ({
                ...cat,
                id: cat.id || cat._id // Ensure id field exists
            })) as CategoryWithId[]
            
            return {
                categories: transformedCategories,
                pagination: {
                    page: params.page || 1,
                    limit: params.limit || 20,
                    total: data.length,
                    pages: Math.ceil(data.length / (params.limit || 20))
                }
            }
        }
        
        // If API returns structured response, transform it too
        const structuredData = data as CategoriesApiResponse
        if (structuredData.categories) {
            structuredData.categories = structuredData.categories.map((cat: any) => ({
                ...cat,
                id: cat.id || cat._id // Ensure id field exists
            }))
        }
        return structuredData
    } catch (error) {
        console.error('Failed to fetch categories:', error)
        throw new Error('Failed to fetch categories')
    }
}

export async function getCategory(id: string): Promise<CategoryWithId> {
    try {
        console.log('🚀 API - Fetching category with ID:', id)
        const response = await ApiService.fetchData({
            url: `/categories/${id}`,
            method: 'GET',
        })
        
        console.log('📥 API - Category response:', response)
        
        if (response.data) {
            const categoryWithId = {
                ...response.data,
                id: response.data._id || response.data.id || id
            }
            console.log('✅ API - Category with ID added:', categoryWithId)
            return categoryWithId as CategoryWithId
        }
        
        console.log('⚠️ API - No data in category response')
        throw new Error('No category data received')
    } catch (error) {
        console.error('❌ API - Error fetching category:', error)
        throw error
    }
}

export async function deleteCategory(id: string): Promise<void> {
    try {
        await ApiService.fetchData({
            url: `/categories/${id}`,
            method: 'DELETE',
        })
    } catch (error) {
        console.error('Failed to delete category:', error)
        throw new Error('Failed to delete category')
    }
}

// Helper function to get categories for parent selection
export async function getCategoriesForParentSelection(currentLevel: number = 1): Promise<CategoryWithId[]> {
    try {
        // Get all categories for parent selection
        const response = await getCategories({ limit: 1000 }) // Get all categories
        
        // Return all active categories - filtering will be done in the component
        return response.categories.filter(cat => cat.isActive).sort((a, b) => {
            // Sort by level first, then by name
            if (a.level !== b.level) {
                return a.level - b.level
            }
            return a.name.localeCompare(b.name)
        })
    } catch (error) {
        console.error('Failed to fetch parent categories:', error)
        return []
    }
}
