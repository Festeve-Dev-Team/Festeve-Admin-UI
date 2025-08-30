import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit'
import { listProducts, getProduct, saveProduct } from '@/views/salesV2/services/productApi'
import ApiService from '@/services/ApiService'
import type { ProductWithId, Product } from '@/views/salesV2/types/product'
import type { 
    ProductState, 
    ProductListParams, 
    ProductUpdatePayload, 
    ProductDeletePayload,
    ProductApiError 
} from './types'

const SLICE_NAME = 'product'
const CACHE_DURATION = 5 * 60 * 1000 // 5 minutes

// Initial state
const initialState: ProductState = {
    products: [],
    selectedProduct: null,
    pagination: {
        page: 1,
        limit: 20,
        total: 0,
        pages: 0
    },
    loading: {
        list: false,
        create: false,
        update: false,
        delete: false,
        fetch: false
    },
    error: {
        list: null,
        create: null,
        update: null,
        delete: null,
        fetch: null
    },
    filters: {
        search: '',
        category: '',
        isTrending: null,
        isHotItem: null,
        priceRange: {
            min: null,
            max: null
        }
    },
    lastFetched: null,
    cacheExpiry: CACHE_DURATION
}

// Async Thunks
export const fetchProducts = createAsyncThunk<
    { products: ProductWithId[]; pagination: ProductState['pagination'] },
    ProductListParams,
    { rejectValue: ProductApiError }
>(
    `${SLICE_NAME}/fetchProducts`,
    async (params = {}, { rejectWithValue }) => {
        try {
            const { page = 1, limit = 20, ...filters } = params
            const response = await listProducts(page, limit)
            
            return {
                products: response.products,
                pagination: response.pagination
            }
        } catch (error: any) {
            return rejectWithValue({
                message: error?.response?.data?.message || error.message || 'Failed to fetch products',
                status: error?.response?.status
            })
        }
    }
)

export const fetchProductById = createAsyncThunk<
    ProductWithId,
    string,
    { rejectValue: ProductApiError }
>(
    `${SLICE_NAME}/fetchProductById`,
    async (productId, { rejectWithValue }) => {
        try {
            const product = await getProduct(productId)
            if (!product) {
                return rejectWithValue({
                    message: 'Product not found',
                    status: 404
                })
            }
            return product
        } catch (error: any) {
            return rejectWithValue({
                message: error?.response?.data?.message || error.message || 'Failed to fetch product',
                status: error?.response?.status
            })
        }
    }
)

export const createProduct = createAsyncThunk<
    ProductWithId,
    Omit<Product, '_id'>,
    { rejectValue: ProductApiError }
>(
    `${SLICE_NAME}/createProduct`,
    async (productData, { rejectWithValue }) => {
        try {
            const newProduct = await saveProduct(productData)
            return newProduct
        } catch (error: any) {
            return rejectWithValue({
                message: error?.response?.data?.message || error.message || 'Failed to create product',
                status: error?.response?.status,
                field: error?.response?.data?.field
            })
        }
    }
)

export const updateProduct = createAsyncThunk<
    ProductWithId,
    ProductUpdatePayload,
    { rejectValue: ProductApiError }
>(
    `${SLICE_NAME}/updateProduct`,
    async ({ id, data }, { rejectWithValue }) => {
        try {
            const updatedProduct = await saveProduct({ ...data, id } as ProductWithId)
            return updatedProduct
        } catch (error: any) {
            return rejectWithValue({
                message: error?.response?.data?.message || error.message || 'Failed to update product',
                status: error?.response?.status,
                field: error?.response?.data?.field
            })
        }
    }
)

export const deleteProduct = createAsyncThunk<
    string,
    ProductDeletePayload,
    { rejectValue: ProductApiError }
>(
    `${SLICE_NAME}/deleteProduct`,
    async ({ id }, { rejectWithValue }) => {
        try {
            await ApiService.fetchData({
                url: `/products/${id}`,
                method: 'delete'
            })
            return id
        } catch (error: any) {
            return rejectWithValue({
                message: error?.response?.data?.message || error.message || 'Failed to delete product',
                status: error?.response?.status
            })
        }
    }
)

// Slice
const productSlice = createSlice({
    name: SLICE_NAME,
    initialState,
    reducers: {
        // UI Actions
        setFilters: (state, action: PayloadAction<Partial<ProductState['filters']>>) => {
            state.filters = { ...state.filters, ...action.payload }
        },
        clearFilters: (state) => {
            state.filters = initialState.filters
        },
        setSelectedProduct: (state, action: PayloadAction<ProductWithId | null>) => {
            state.selectedProduct = action.payload
        },
        clearSelectedProduct: (state) => {
            state.selectedProduct = null
        },
        
        // Error Management
        clearError: (state, action: PayloadAction<keyof ProductState['error']>) => {
            state.error[action.payload] = null
        },
        clearAllErrors: (state) => {
            state.error = initialState.error
        },
        
        // Cache Management
        invalidateCache: (state) => {
            state.lastFetched = null
        },
        
        // Optimistic Updates
        optimisticUpdateProduct: (state, action: PayloadAction<ProductWithId>) => {
            const index = state.products.findIndex(p => p.id === action.payload.id)
            if (index !== -1) {
                state.products[index] = action.payload
            }
        },
        
        optimisticDeleteProduct: (state, action: PayloadAction<string>) => {
            state.products = state.products.filter(p => p.id !== action.payload)
        }
    },
    extraReducers: (builder) => {
        builder
            // Fetch Products
            .addCase(fetchProducts.pending, (state) => {
                state.loading.list = true
                state.error.list = null
            })
            .addCase(fetchProducts.fulfilled, (state, action) => {
                state.loading.list = false
                state.products = action.payload.products
                state.pagination = action.payload.pagination
                state.lastFetched = Date.now()
                state.error.list = null
            })
            .addCase(fetchProducts.rejected, (state, action) => {
                state.loading.list = false
                state.error.list = action.payload?.message || 'Failed to fetch products'
            })
            
            // Fetch Product by ID
            .addCase(fetchProductById.pending, (state) => {
                state.loading.fetch = true
                state.error.fetch = null
            })
            .addCase(fetchProductById.fulfilled, (state, action) => {
                state.loading.fetch = false
                state.selectedProduct = action.payload
                state.error.fetch = null
                
                // Update in products list if it exists
                const index = state.products.findIndex(p => p.id === action.payload.id)
                if (index !== -1) {
                    state.products[index] = action.payload
                }
            })
            .addCase(fetchProductById.rejected, (state, action) => {
                state.loading.fetch = false
                state.error.fetch = action.payload?.message || 'Failed to fetch product'
            })
            
            // Create Product
            .addCase(createProduct.pending, (state) => {
                state.loading.create = true
                state.error.create = null
            })
            .addCase(createProduct.fulfilled, (state, action) => {
                state.loading.create = false
                state.products.unshift(action.payload) // Add to beginning
                state.pagination.total += 1
                state.selectedProduct = action.payload
                state.error.create = null
            })
            .addCase(createProduct.rejected, (state, action) => {
                state.loading.create = false
                state.error.create = action.payload?.message || 'Failed to create product'
            })
            
            // Update Product
            .addCase(updateProduct.pending, (state) => {
                state.loading.update = true
                state.error.update = null
            })
            .addCase(updateProduct.fulfilled, (state, action) => {
                state.loading.update = false
                const index = state.products.findIndex(p => p.id === action.payload.id)
                if (index !== -1) {
                    state.products[index] = action.payload
                }
                if (state.selectedProduct?.id === action.payload.id) {
                    state.selectedProduct = action.payload
                }
                state.error.update = null
            })
            .addCase(updateProduct.rejected, (state, action) => {
                state.loading.update = false
                state.error.update = action.payload?.message || 'Failed to update product'
            })
            
            // Delete Product
            .addCase(deleteProduct.pending, (state) => {
                state.loading.delete = true
                state.error.delete = null
            })
            .addCase(deleteProduct.fulfilled, (state, action) => {
                state.loading.delete = false
                state.products = state.products.filter(p => p.id !== action.payload)
                state.pagination.total = Math.max(0, state.pagination.total - 1)
                if (state.selectedProduct?.id === action.payload) {
                    state.selectedProduct = null
                }
                state.error.delete = null
            })
            .addCase(deleteProduct.rejected, (state, action) => {
                state.loading.delete = false
                state.error.delete = action.payload?.message || 'Failed to delete product'
            })
    }
})

export const {
    setFilters,
    clearFilters,
    setSelectedProduct,
    clearSelectedProduct,
    clearError,
    clearAllErrors,
    invalidateCache,
    optimisticUpdateProduct,
    optimisticDeleteProduct
} = productSlice.actions

export default productSlice.reducer
