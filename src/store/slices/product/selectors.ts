import { createSelector } from '@reduxjs/toolkit'
import type { RootState } from '../../rootReducer'
import type { ProductWithId } from '@/views/salesV2/types/product'

// Base selectors
export const selectProductState = (state: RootState) => state.product

export const selectProducts = createSelector(
    [selectProductState],
    (productState) => productState.products
)

export const selectSelectedProduct = createSelector(
    [selectProductState],
    (productState) => productState.selectedProduct
)

export const selectPagination = createSelector(
    [selectProductState],
    (productState) => productState.pagination
)

export const selectFilters = createSelector(
    [selectProductState],
    (productState) => productState.filters
)

// Loading selectors
export const selectProductsLoading = createSelector(
    [selectProductState],
    (productState) => productState.loading.list
)

export const selectProductLoading = createSelector(
    [selectProductState],
    (productState) => productState.loading.fetch
)

export const selectCreateLoading = createSelector(
    [selectProductState],
    (productState) => productState.loading.create
)

export const selectUpdateLoading = createSelector(
    [selectProductState],
    (productState) => productState.loading.update
)

export const selectDeleteLoading = createSelector(
    [selectProductState],
    (productState) => productState.loading.delete
)

export const selectAnyLoading = createSelector(
    [selectProductState],
    (productState) => Object.values(productState.loading).some(loading => loading)
)

// Error selectors
export const selectProductsError = createSelector(
    [selectProductState],
    (productState) => productState.error.list
)

export const selectProductError = createSelector(
    [selectProductState],
    (productState) => productState.error.fetch
)

export const selectCreateError = createSelector(
    [selectProductState],
    (productState) => productState.error.create
)

export const selectUpdateError = createSelector(
    [selectProductState],
    (productState) => productState.error.update
)

export const selectDeleteError = createSelector(
    [selectProductState],
    (productState) => productState.error.delete
)

export const selectAnyError = createSelector(
    [selectProductState],
    (productState) => Object.values(productState.error).find(error => error !== null)
)

// Filtered products selector
export const selectFilteredProducts = createSelector(
    [selectProducts, selectFilters],
    (products, filters) => {
        let filtered = [...products]

        // Search filter
        if (filters.search) {
            const searchLower = filters.search.toLowerCase()
            filtered = filtered.filter(product => 
                product.name?.toLowerCase().includes(searchLower) ||
                product.description?.toLowerCase().includes(searchLower) ||
                (product.category || product.categoryId)?.toLowerCase().includes(searchLower) ||
                product.tags?.some(tag => tag?.toLowerCase().includes(searchLower))
            )
        }

        // Category filter
        if (filters.category) {
            filtered = filtered.filter(product => 
                (product.category || product.categoryId) === filters.category
            )
        }

        // Trending filter
        if (filters.isTrending !== null) {
            filtered = filtered.filter(product => product.isTrending === filters.isTrending)
        }

        // Hot item filter
        if (filters.isHotItem !== null) {
            filtered = filtered.filter(product => product.isHotItem === filters.isHotItem)
        }

        // Price range filter
        if (filters.priceRange.min !== null || filters.priceRange.max !== null) {
            filtered = filtered.filter(product => {
                const variants = product.variants || []
                if (variants.length === 0) return false
                
                const prices = variants.map(v => v?.price).filter(price => price !== undefined && price !== null)
                if (prices.length === 0) return false
                
                const minPrice = Math.min(...prices)
                const maxPrice = Math.max(...prices)

                const meetsMin = filters.priceRange.min === null || minPrice >= filters.priceRange.min
                const meetsMax = filters.priceRange.max === null || maxPrice <= filters.priceRange.max

                return meetsMin && meetsMax
            })
        }

        return filtered
    }
)

// Product statistics selectors
export const selectProductStats = createSelector(
    [selectProducts],
    (products) => {
        const totalProducts = products.length
        const trendingProducts = products.filter(p => p.isTrending).length
        const hotProducts = products.filter(p => p.isHotItem).length
        const activeProducts = products.filter(p => 
            p.variants.some(v => v.isActive)
        ).length

        const categories = [...new Set(products.map(p => p.category))]
        const totalVariants = products.reduce((sum, p) => sum + p.variants.length, 0)
        const averagePrice = products.length > 0 
            ? products.reduce((sum, p) => {
                const prices = p.variants.map(v => v.price)
                const avgProductPrice = prices.reduce((a, b) => a + b, 0) / prices.length
                return sum + avgProductPrice
            }, 0) / products.length
            : 0

        return {
            totalProducts,
            trendingProducts,
            hotProducts,
            activeProducts,
            categories: categories.length,
            totalVariants,
            averagePrice: Math.round(averagePrice * 100) / 100
        }
    }
)

// Category distribution selector
export const selectCategoryDistribution = createSelector(
    [selectProducts],
    (products) => {
        const distribution = products.reduce((acc, product) => {
            const category = product.category
            acc[category] = (acc[category] || 0) + 1
            return acc
        }, {} as Record<string, number>)

        return Object.entries(distribution)
            .map(([category, count]) => ({ category, count }))
            .sort((a, b) => b.count - a.count)
    }
)

// Search suggestions selector
export const selectSearchSuggestions = createSelector(
    [selectProducts],
    (products) => {
        const suggestions = new Set<string>()

        products.forEach(product => {
            // Add product names
            suggestions.add(product.name)
            
            // Add categories
            suggestions.add(product.category)
            
            // Add tags
            product.tags.forEach(tag => suggestions.add(tag))
        })

        return Array.from(suggestions).sort()
    }
)

// Cache status selector
export const selectCacheStatus = createSelector(
    [selectProductState],
    (productState) => {
        const now = Date.now()
        const isExpired = productState.lastFetched 
            ? (now - productState.lastFetched) > productState.cacheExpiry
            : true

        return {
            lastFetched: productState.lastFetched,
            isExpired,
            cacheAge: productState.lastFetched ? now - productState.lastFetched : null
        }
    }
)

// Product by ID selector factory
export const makeSelectProductById = () => createSelector(
    [selectProducts, (_: RootState, productId: string) => productId],
    (products, productId) => products.find(product => product.id === productId) || null
)

// Products by category selector factory
export const makeSelectProductsByCategory = () => createSelector(
    [selectProducts, (_: RootState, category: string) => category],
    (products, category) => products.filter(product => product.category === category)
)

// Available filters selector (for filter UI)
export const selectAvailableFilters = createSelector(
    [selectProducts],
    (products) => {
        const categories = [...new Set(products.map(p => p.category))].sort()
        const priceRange = products.length > 0 ? {
            min: Math.min(...products.flatMap(p => p.variants.map(v => v.price))),
            max: Math.max(...products.flatMap(p => p.variants.map(v => v.price)))
        } : { min: 0, max: 0 }

        return {
            categories,
            priceRange,
            hasTrending: products.some(p => p.isTrending),
            hasHotItems: products.some(p => p.isHotItem)
        }
    }
)
