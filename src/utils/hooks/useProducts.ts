import { useCallback } from 'react'
import { useAppDispatch, useAppSelector } from '@/store/hook'
import {
    fetchProducts,
    fetchProductById,
    createProduct,
    updateProduct,
    deleteProduct,
    setFilters,
    clearFilters,
    setSelectedProduct,
    clearSelectedProduct,
    clearError,
    clearAllErrors,
    invalidateCache,
    selectProducts,
    selectSelectedProduct,
    selectPagination,
    selectFilters,
    selectProductsLoading,
    selectProductLoading,
    selectCreateLoading,
    selectUpdateLoading,
    selectDeleteLoading,
    selectAnyLoading,
    selectProductsError,
    selectAnyError,
    selectFilteredProducts,
    selectProductStats,
    selectCategoryDistribution,
    selectCacheStatus,
    selectAvailableFilters
} from '@/store'
import type { ProductListParams, ProductUpdatePayload } from '@/store/slices/product/types'
import type { ProductWithId, Product } from '@/views/salesV2/types/product'

interface UseProductsReturn {
    // Data
    products: ProductWithId[]
    selectedProduct: ProductWithId | null
    filteredProducts: ProductWithId[]
    pagination: any
    filters: any
    
    // Loading states
    isLoading: boolean
    isProductsLoading: boolean
    isProductLoading: boolean
    isCreating: boolean
    isUpdating: boolean
    isDeleting: boolean
    
    // Error states
    error: string | null
    productsError: string | null
    
    // Statistics
    stats: any
    categoryDistribution: any
    cacheStatus: any
    availableFilters: any
    
    // Actions
    loadProducts: (params?: ProductListParams) => void
    loadProduct: (id: string) => void
    createNewProduct: (productData: Omit<Product, '_id'>) => Promise<void>
    updateExistingProduct: (id: string, data: Partial<ProductWithId>) => Promise<void>
    removeProduct: (id: string) => Promise<void>
    
    // UI Actions
    setProductFilters: (filters: any) => void
    resetFilters: () => void
    selectProduct: (product: ProductWithId | null) => void
    clearProduct: () => void
    
    // Utility Actions
    clearProductError: (errorType: string) => void
    clearAllProductErrors: () => void
    refreshProducts: () => void
    invalidateProductCache: () => void
}

export default function useProducts(): UseProductsReturn {
    const dispatch = useAppDispatch()
    
    // Selectors
    const products = useAppSelector(selectProducts)
    const selectedProduct = useAppSelector(selectSelectedProduct)
    const filteredProducts = useAppSelector(selectFilteredProducts)
    const pagination = useAppSelector(selectPagination)
    const filters = useAppSelector(selectFilters)
    
    // Loading states
    const isProductsLoading = useAppSelector(selectProductsLoading)
    const isProductLoading = useAppSelector(selectProductLoading)
    const isCreating = useAppSelector(selectCreateLoading)
    const isUpdating = useAppSelector(selectUpdateLoading)
    const isDeleting = useAppSelector(selectDeleteLoading)
    const isLoading = useAppSelector(selectAnyLoading)
    
    // Error states
    const productsError = useAppSelector(selectProductsError)
    const error = useAppSelector(selectAnyError)
    
    // Statistics and derived data
    const stats = useAppSelector(selectProductStats)
    const categoryDistribution = useAppSelector(selectCategoryDistribution)
    const cacheStatus = useAppSelector(selectCacheStatus)
    const availableFilters = useAppSelector(selectAvailableFilters)
    
    // Actions
    const loadProducts = useCallback((params?: ProductListParams) => {
        dispatch(fetchProducts(params || {}))
    }, [dispatch])
    
    const loadProduct = useCallback((id: string) => {
        dispatch(fetchProductById(id))
    }, [dispatch])
    
    const createNewProduct = useCallback(async (productData: Omit<Product, '_id'>) => {
        const result = await dispatch(createProduct(productData))
        if (createProduct.rejected.match(result)) {
            throw new Error(result.payload?.message || 'Failed to create product')
        }
    }, [dispatch])
    
    const updateExistingProduct = useCallback(async (id: string, data: Partial<ProductWithId>) => {
        const result = await dispatch(updateProduct({ id, data }))
        if (updateProduct.rejected.match(result)) {
            throw new Error(result.payload?.message || 'Failed to update product')
        }
    }, [dispatch])
    
    const removeProduct = useCallback(async (id: string) => {
        const result = await dispatch(deleteProduct({ id }))
        if (deleteProduct.rejected.match(result)) {
            throw new Error(result.payload?.message || 'Failed to delete product')
        }
    }, [dispatch])
    
    // UI Actions
    const setProductFilters = useCallback((newFilters: any) => {
        dispatch(setFilters(newFilters))
    }, [dispatch])
    
    const resetFilters = useCallback(() => {
        dispatch(clearFilters())
    }, [dispatch])
    
    const selectProduct = useCallback((product: ProductWithId | null) => {
        dispatch(setSelectedProduct(product))
    }, [dispatch])
    
    const clearProduct = useCallback(() => {
        dispatch(clearSelectedProduct())
    }, [dispatch])
    
    // Utility Actions
    const clearProductError = useCallback((errorType: string) => {
        dispatch(clearError(errorType as any))
    }, [dispatch])
    
    const clearAllProductErrors = useCallback(() => {
        dispatch(clearAllErrors())
    }, [dispatch])
    
    const refreshProducts = useCallback(() => {
        dispatch(fetchProducts({ page: pagination.page, limit: pagination.limit }))
    }, [dispatch, pagination.page, pagination.limit])
    
    const invalidateProductCache = useCallback(() => {
        dispatch(invalidateCache())
    }, [dispatch])
    
    return {
        // Data
        products,
        selectedProduct,
        filteredProducts,
        pagination,
        filters,
        
        // Loading states
        isLoading,
        isProductsLoading,
        isProductLoading,
        isCreating,
        isUpdating,
        isDeleting,
        
        // Error states
        error: typeof error === 'string' ? error : null,
        productsError,
        
        // Statistics
        stats,
        categoryDistribution,
        cacheStatus,
        availableFilters,
        
        // Actions
        loadProducts,
        loadProduct,
        createNewProduct,
        updateExistingProduct,
        removeProduct,
        
        // UI Actions
        setProductFilters,
        resetFilters,
        selectProduct,
        clearProduct,
        
        // Utility Actions
        clearProductError,
        clearAllProductErrors,
        refreshProducts,
        invalidateProductCache
    }
}
