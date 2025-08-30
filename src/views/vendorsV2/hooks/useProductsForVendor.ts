import { useMemo, useEffect } from 'react'
import useProducts from '@/utils/hooks/useProducts'
import type { ProductWithId } from '@/views/salesV2/types/product'

type ProductForVendor = {
    id: string
    title: string
    description?: string
    categoryId?: string
    tags?: string[]
}

export function useProductsForVendor() {
    const {
        products,
        filteredProducts,
        isProductsLoading,
        loadProducts,
        setProductFilters,
        filters
    } = useProducts()

    // Don't auto-load products - rely on ProductListV2 to load them
    // This ensures we use the exact same data that ProductListV2 displays

    // Function to get products by IDs
    const getProductsByIds = useMemo(() => {
        return (ids: string[]): Array<{ id: string; title: string }> => {
            if (ids.length === 0) return []
            
            return ids
                .map(id => {
                    const product = products.find(p => p.id === id || p._id === id)
                    return product ? {
                        id: product.id || product._id,
                        title: product.name
                    } : null
                })
                .filter(Boolean) as Array<{ id: string; title: string }>
        }
    }, [products])

    // Function to search products - use same approach as ProductListV2
    const searchProducts = useMemo(() => {
        return (query: string, limit = 20): ProductForVendor[] => {
            if (!query.trim()) return []
            
            console.log('Searching in products:', products.length, 'products available')
            console.log('Filtered products:', filteredProducts.length, 'filtered products available')
            console.log('Sample product:', products[0])
            
            // Use the same products array that ProductListV2 uses
            const searchResults = products.filter(product => 
                product.name.toLowerCase().includes(query.toLowerCase()) ||
                product.description.toLowerCase().includes(query.toLowerCase()) ||
                (product.tags && product.tags.some(tag => tag.toLowerCase().includes(query.toLowerCase())))
            )

            console.log('Search results for query:', query, 'found:', searchResults.length)

            return searchResults.slice(0, limit).map(product => ({
                id: product.id || product._id,
                title: product.name,
                description: product.description,
                categoryId: product.categoryId,
                tags: product.tags
            }))
        }
    }, [products, filteredProducts])

    return {
        products,
        filteredProducts,
        isProductsLoading,
        getProductsByIds,
        searchProducts,
        setProductFilters,
        filters
    }
}
