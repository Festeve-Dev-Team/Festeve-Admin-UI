import { useCallback } from 'react'
import { useAppDispatch, useAppSelector } from '@/store/hook'
import {
    fetchCategories,
    fetchCategoryById,
    fetchParentCategories,
    createNewCategory,
    updateExistingCategory,
    removeCategory,
    setCategoryFilters,
    clearCategoryFilters,
    setSelectedCategory,
    clearSelectedCategory,
    clearCategoryError,
    clearAllCategoryErrors,
    invalidateCategoryCache,
    selectCategories,
    selectSelectedCategory,
    selectParentCategories,
    selectCategoryPagination,
    selectCategoryFilters,
    selectCategoriesLoading,
    selectCategoryLoading,
    selectParentCategoriesLoading,
    selectCategoryCreateLoading,
    selectCategoryUpdateLoading,
    selectCategoryDeleteLoading,
    selectCategoryAnyLoading,
    selectCategoriesError,
    selectCategoryAnyError,
    selectFilteredCategories,
    selectCategoryTree,
    selectCategoryStats,
    selectCategoryCacheStatus,
} from '@/store/slices/category'
import type { CategoryListParams } from '@/store/slices/category/types'
import type { CategoryWithId, CategoryDto } from '../types/category'

interface UseCategoriesReturn {
    // Data
    categories: CategoryWithId[]
    selectedCategory: CategoryWithId | null
    parentCategories: CategoryWithId[]
    filteredCategories: CategoryWithId[]
    categoryTree: any
    pagination: any
    filters: any
    
    // Loading states
    isLoading: boolean
    isCategoriesLoading: boolean
    isCategoryLoading: boolean
    isParentCategoriesLoading: boolean
    isCreating: boolean
    isUpdating: boolean
    isDeleting: boolean
    
    // Error states
    error: string | null
    categoriesError: string | null
    
    // Statistics
    stats: any
    cacheStatus: any
    
    // Actions
    loadCategories: (params?: CategoryListParams) => void
    loadCategory: (id: string) => void
    loadParentCategories: (currentLevel?: number) => void
    createCategory: (categoryData: CategoryDto) => Promise<void>
    updateCategory: (id: string, data: Partial<CategoryDto>) => Promise<void>
    deleteCategory: (id: string) => Promise<void>
    
    // UI Actions
    setCategoryFilters: (filters: any) => void
    resetFilters: () => void
    selectCategory: (category: CategoryWithId | null) => void
    clearCategory: () => void
    
    // Utility Actions
    clearCategoryError: (errorType: string) => void
    clearAllCategoryErrors: () => void
    refreshCategories: () => void
    invalidateCategoryCache: () => void
}

export default function useCategories(): UseCategoriesReturn {
    const dispatch = useAppDispatch()
    
    // Selectors
    const categories = useAppSelector(selectCategories)
    const selectedCategory = useAppSelector(selectSelectedCategory)
    const parentCategories = useAppSelector(selectParentCategories)
    const filteredCategories = useAppSelector(selectFilteredCategories)
    const categoryTree = useAppSelector(selectCategoryTree)
    const pagination = useAppSelector(selectCategoryPagination)
    const filters = useAppSelector(selectCategoryFilters)
    
    // Loading states
    const isCategoriesLoading = useAppSelector(selectCategoriesLoading)
    const isCategoryLoading = useAppSelector(selectCategoryLoading)
    const isParentCategoriesLoading = useAppSelector(selectParentCategoriesLoading)
    const isCreating = useAppSelector(selectCategoryCreateLoading)
    const isUpdating = useAppSelector(selectCategoryUpdateLoading)
    const isDeleting = useAppSelector(selectCategoryDeleteLoading)
    const isLoading = useAppSelector(selectCategoryAnyLoading)
    
    // Error states
    const categoriesError = useAppSelector(selectCategoriesError)
    const error = useAppSelector(selectCategoryAnyError)
    
    // Statistics and derived data
    const stats = useAppSelector(selectCategoryStats)
    const cacheStatus = useAppSelector(selectCategoryCacheStatus)
    
    // Actions
    const loadCategories = useCallback((params?: CategoryListParams) => {
        dispatch(fetchCategories(params || {}))
    }, [dispatch])
    
    const loadCategory = useCallback((id: string) => {
        dispatch(fetchCategoryById(id))
    }, [dispatch])
    
    const loadParentCategories = useCallback((currentLevel: number = 1) => {
        dispatch(fetchParentCategories(currentLevel))
    }, [dispatch])
    
    const createCategory = useCallback(async (categoryData: CategoryDto) => {
        const result = await dispatch(createNewCategory(categoryData))
        if (createNewCategory.rejected.match(result)) {
            throw new Error(result.payload?.message || 'Failed to create category')
        }
    }, [dispatch])
    
    const updateCategory = useCallback(async (id: string, data: Partial<CategoryDto>) => {
        const result = await dispatch(updateExistingCategory({ id, data }))
        if (updateExistingCategory.rejected.match(result)) {
            throw new Error(result.payload?.message || 'Failed to update category')
        }
    }, [dispatch])
    
    const deleteCategory = useCallback(async (id: string) => {
        const result = await dispatch(removeCategory({ id }))
        if (removeCategory.rejected.match(result)) {
            throw new Error(result.payload?.message || 'Failed to delete category')
        }
    }, [dispatch])
    
    // UI Actions
    const setCategoryFiltersCallback = useCallback((filters: any) => {
        dispatch(setCategoryFilters(filters))
    }, [dispatch])
    
    const resetFilters = useCallback(() => {
        dispatch(clearCategoryFilters())
    }, [dispatch])
    
    const selectCategory = useCallback((category: CategoryWithId | null) => {
        dispatch(setSelectedCategory(category))
    }, [dispatch])
    
    const clearCategory = useCallback(() => {
        dispatch(clearSelectedCategory())
    }, [dispatch])
    
    // Utility Actions
    const clearCategoryErrorCallback = useCallback((errorType: string) => {
        dispatch(clearCategoryError(errorType as any))
    }, [dispatch])
    
    const clearAllCategoryErrorsCallback = useCallback(() => {
        dispatch(clearAllCategoryErrors())
    }, [dispatch])
    
    const refreshCategories = useCallback(() => {
        dispatch(fetchCategories({ page: pagination.page, limit: pagination.limit, ...filters }))
    }, [dispatch, pagination.page, pagination.limit, filters])
    
    const invalidateCategoryCacheCallback = useCallback(() => {
        dispatch(invalidateCategoryCache())
    }, [dispatch])
    
    return {
        // Data
        categories,
        selectedCategory,
        parentCategories,
        filteredCategories,
        categoryTree,
        pagination,
        filters,
        
        // Loading states
        isLoading,
        isCategoriesLoading,
        isCategoryLoading,
        isParentCategoriesLoading,
        isCreating,
        isUpdating,
        isDeleting,
        
        // Error states
        error,
        categoriesError,
        
        // Statistics
        stats,
        cacheStatus,
        
        // Actions
        loadCategories,
        loadCategory,
        loadParentCategories,
        createCategory,
        updateCategory,
        deleteCategory,
        
        // UI Actions
        setCategoryFilters: setCategoryFiltersCallback,
        resetFilters,
        selectCategory,
        clearCategory,
        
        // Utility Actions
        clearCategoryError: clearCategoryErrorCallback,
        clearAllCategoryErrors: clearAllCategoryErrorsCallback,
        refreshCategories,
        invalidateCategoryCache: invalidateCategoryCacheCallback
    }
}
