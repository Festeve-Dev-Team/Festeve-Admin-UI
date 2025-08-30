import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit'
import { getVendors, getVendor, createVendor, updateVendor, deleteVendor } from '@/views/vendorsV2/services/vendorApi'
import type { VendorWithId, VendorDto } from '@/views/vendorsV2/types/vendor'
import type { 
    VendorState, 
    VendorListParams, 
    VendorUpdatePayload, 
    VendorDeletePayload,
    VendorApiError 
} from './types'

const SLICE_NAME = 'vendor'
const CACHE_DURATION = 5 * 60 * 1000 // 5 minutes

// Initial state
const initialState: VendorState = {
    vendors: [],
    selectedVendor: null,
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
        sortBy: 'name',
        sortOrder: 'asc'
    },
    lastFetched: null,
    cacheExpiry: CACHE_DURATION
}

// Async Thunks
export const fetchVendors = createAsyncThunk<
    { vendors: VendorWithId[]; pagination: VendorState['pagination'] },
    VendorListParams,
    { rejectValue: VendorApiError }
>(
    `${SLICE_NAME}/fetchVendors`,
    async (params = {}, { rejectWithValue }) => {
        try {
            const { page = 1, limit = 20, ...filters } = params
            const response = await getVendors({ page, limit, ...filters })
            
            return {
                vendors: response.vendors,
                pagination: response.pagination
            }
        } catch (error: any) {
            return rejectWithValue({
                message: error?.response?.data?.message || error.message || 'Failed to fetch vendors',
                status: error?.response?.status
            })
        }
    }
)

export const fetchVendorById = createAsyncThunk<
    VendorWithId,
    string,
    { rejectValue: VendorApiError }
>(
    `${SLICE_NAME}/fetchVendorById`,
    async (vendorId, { rejectWithValue }) => {
        try {
            const vendor = await getVendor(vendorId)
            if (!vendor) {
                return rejectWithValue({
                    message: 'Vendor not found',
                    status: 404
                })
            }
            return vendor
        } catch (error: any) {
            return rejectWithValue({
                message: error?.response?.data?.message || error.message || 'Failed to fetch vendor',
                status: error?.response?.status
            })
        }
    }
)

export const createNewVendor = createAsyncThunk<
    VendorWithId,
    Omit<VendorDto, 'ratings'>,
    { rejectValue: VendorApiError }
>(
    `${SLICE_NAME}/createVendor`,
    async (vendorData, { rejectWithValue }) => {
        try {
            const newVendor = await createVendor(vendorData)
            return newVendor
        } catch (error: any) {
            return rejectWithValue({
                message: error?.response?.data?.message || error.message || 'Failed to create vendor',
                status: error?.response?.status,
                field: error?.response?.data?.field
            })
        }
    }
)

export const updateExistingVendor = createAsyncThunk<
    VendorWithId,
    VendorUpdatePayload,
    { rejectValue: VendorApiError }
>(
    `${SLICE_NAME}/updateVendor`,
    async ({ id, data }, { rejectWithValue }) => {
        try {
            const updatedVendor = await updateVendor(id, data)
            return updatedVendor
        } catch (error: any) {
            return rejectWithValue({
                message: error?.response?.data?.message || error.message || 'Failed to update vendor',
                status: error?.response?.status,
                field: error?.response?.data?.field
            })
        }
    }
)

export const removeVendor = createAsyncThunk<
    string,
    VendorDeletePayload,
    { rejectValue: VendorApiError }
>(
    `${SLICE_NAME}/deleteVendor`,
    async ({ id }, { rejectWithValue }) => {
        try {
            await deleteVendor(id)
            return id
        } catch (error: any) {
            return rejectWithValue({
                message: error?.response?.data?.message || error.message || 'Failed to delete vendor',
                status: error?.response?.status
            })
        }
    }
)

// Slice
const vendorSlice = createSlice({
    name: SLICE_NAME,
    initialState,
    reducers: {
        // UI Actions
        setVendorFilters: (state, action: PayloadAction<Partial<VendorState['filters']>>) => {
            state.filters = { ...state.filters, ...action.payload }
        },
        clearVendorFilters: (state) => {
            state.filters = initialState.filters
        },
        setSelectedVendor: (state, action: PayloadAction<VendorWithId | null>) => {
            state.selectedVendor = action.payload
        },
        clearSelectedVendor: (state) => {
            state.selectedVendor = null
        },
        
        // Error Management
        clearVendorError: (state, action: PayloadAction<keyof VendorState['error']>) => {
            state.error[action.payload] = null
        },
        clearAllVendorErrors: (state) => {
            state.error = initialState.error
        },
        
        // Cache Management
        invalidateVendorCache: (state) => {
            state.lastFetched = null
        },
        
        // Optimistic Updates
        optimisticUpdateVendor: (state, action: PayloadAction<VendorWithId>) => {
            const index = state.vendors.findIndex(v => v.id === action.payload.id)
            if (index !== -1) {
                state.vendors[index] = action.payload
            }
        },
        
        optimisticDeleteVendor: (state, action: PayloadAction<string>) => {
            state.vendors = state.vendors.filter(v => v.id !== action.payload)
        }
    },
    extraReducers: (builder) => {
        builder
            // Fetch Vendors
            .addCase(fetchVendors.pending, (state) => {
                state.loading.list = true
                state.error.list = null
            })
            .addCase(fetchVendors.fulfilled, (state, action) => {
                state.loading.list = false
                state.vendors = action.payload.vendors
                state.pagination = action.payload.pagination
                state.lastFetched = Date.now()
                state.error.list = null
            })
            .addCase(fetchVendors.rejected, (state, action) => {
                state.loading.list = false
                state.error.list = action.payload?.message || 'Failed to fetch vendors'
            })
            
            // Fetch Vendor by ID
            .addCase(fetchVendorById.pending, (state) => {
                state.loading.fetch = true
                state.error.fetch = null
            })
            .addCase(fetchVendorById.fulfilled, (state, action) => {
                state.loading.fetch = false
                state.selectedVendor = action.payload
                state.error.fetch = null
                
                // Update in vendors list if it exists
                const index = state.vendors.findIndex(v => v.id === action.payload.id)
                if (index !== -1) {
                    state.vendors[index] = action.payload
                }
            })
            .addCase(fetchVendorById.rejected, (state, action) => {
                state.loading.fetch = false
                state.error.fetch = action.payload?.message || 'Failed to fetch vendor'
            })
            
            // Create Vendor
            .addCase(createNewVendor.pending, (state) => {
                state.loading.create = true
                state.error.create = null
            })
            .addCase(createNewVendor.fulfilled, (state, action) => {
                state.loading.create = false
                state.vendors.unshift(action.payload) // Add to beginning
                state.pagination.total += 1
                state.selectedVendor = action.payload
                state.error.create = null
            })
            .addCase(createNewVendor.rejected, (state, action) => {
                state.loading.create = false
                state.error.create = action.payload?.message || 'Failed to create vendor'
            })
            
            // Update Vendor
            .addCase(updateExistingVendor.pending, (state) => {
                state.loading.update = true
                state.error.update = null
            })
            .addCase(updateExistingVendor.fulfilled, (state, action) => {
                state.loading.update = false
                const index = state.vendors.findIndex(v => v.id === action.payload.id)
                if (index !== -1) {
                    state.vendors[index] = action.payload
                }
                if (state.selectedVendor?.id === action.payload.id) {
                    state.selectedVendor = action.payload
                }
                state.error.update = null
            })
            .addCase(updateExistingVendor.rejected, (state, action) => {
                state.loading.update = false
                state.error.update = action.payload?.message || 'Failed to update vendor'
            })
            
            // Delete Vendor
            .addCase(removeVendor.pending, (state) => {
                state.loading.delete = true
                state.error.delete = null
            })
            .addCase(removeVendor.fulfilled, (state, action) => {
                state.loading.delete = false
                state.vendors = state.vendors.filter(v => v.id !== action.payload)
                state.pagination.total = Math.max(0, state.pagination.total - 1)
                if (state.selectedVendor?.id === action.payload) {
                    state.selectedVendor = null
                }
                state.error.delete = null
            })
            .addCase(removeVendor.rejected, (state, action) => {
                state.loading.delete = false
                state.error.delete = action.payload?.message || 'Failed to delete vendor'
            })
    }
})

export const {
    setVendorFilters,
    clearVendorFilters,
    setSelectedVendor,
    clearSelectedVendor,
    clearVendorError,
    clearAllVendorErrors,
    invalidateVendorCache,
    optimisticUpdateVendor,
    optimisticDeleteVendor
} = vendorSlice.actions

export default vendorSlice.reducer
