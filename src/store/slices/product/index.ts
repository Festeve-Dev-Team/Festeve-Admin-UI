import { combineReducers } from '@reduxjs/toolkit'
import productReducer from './productSlice'
import type { ProductState } from './types'

// Export types
export type { ProductState, ProductListParams, ProductUpdatePayload, ProductDeletePayload, ProductApiError } from './types'

// Export actions
export {
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
    optimisticUpdateProduct,
    optimisticDeleteProduct
} from './productSlice'

// Export selectors
export * from './selectors'

// Product slice state type
export type ProductSliceState = {
    product: ProductState
}

// Main product reducer
const reducer = combineReducers({
    product: productReducer
})

export default reducer
