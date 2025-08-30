import { useCallback } from 'react'
import { useAppDispatch, useAppSelector } from '@/store/hook'
import {
    fetchVendors,
    fetchVendorById,
    createNewVendor,
    updateExistingVendor,
    removeVendor,
    setVendorFilters,
    clearVendorFilters,
    setSelectedVendor,
    clearSelectedVendor,
    clearVendorError,
    clearAllVendorErrors,
    invalidateVendorCache,
    selectVendors,
    selectSelectedVendor,
    selectVendorPagination,
    selectVendorFilters,
    selectVendorsLoading,
    selectVendorLoading,
    selectVendorCreateLoading,
    selectVendorUpdateLoading,
    selectVendorDeleteLoading,
    selectVendorAnyLoading,
    selectVendorsError,
    selectVendorAnyError,
    selectFilteredVendors,
    selectVendorStats,
    selectVendorCacheStatus,
} from '@/store/slices/vendor'
import type { VendorListParams } from '@/store/slices/vendor/types'
import type { VendorWithId, VendorDto } from '../types/vendor'

interface UseVendorsReturn {
    // Data
    vendors: VendorWithId[]
    selectedVendor: VendorWithId | null
    filteredVendors: VendorWithId[]
    pagination: any
    filters: any
    
    // Loading states
    isLoading: boolean
    isVendorsLoading: boolean
    isVendorLoading: boolean
    isCreating: boolean
    isUpdating: boolean
    isDeleting: boolean
    
    // Error states
    error: string | null
    vendorsError: string | null
    
    // Statistics
    stats: any
    cacheStatus: any
    
    // Actions
    loadVendors: (params?: VendorListParams) => void
    loadVendor: (id: string) => void
    createVendor: (vendorData: Omit<VendorDto, 'ratings'>) => Promise<void>
    updateVendor: (id: string, data: Partial<Omit<VendorDto, 'ratings'>>) => Promise<void>
    deleteVendor: (id: string) => Promise<void>
    
    // UI Actions
    setVendorFilters: (filters: any) => void
    resetFilters: () => void
    selectVendor: (vendor: VendorWithId | null) => void
    clearVendor: () => void
    
    // Utility Actions
    clearVendorError: (errorType: string) => void
    clearAllVendorErrors: () => void
    refreshVendors: () => void
    invalidateVendorCache: () => void
}

export default function useVendors(): UseVendorsReturn {
    const dispatch = useAppDispatch()
    
    // Selectors
    const vendors = useAppSelector(selectVendors)
    const selectedVendor = useAppSelector(selectSelectedVendor)
    const filteredVendors = useAppSelector(selectFilteredVendors)
    const pagination = useAppSelector(selectVendorPagination)
    const filters = useAppSelector(selectVendorFilters)
    
    // Loading states
    const isVendorsLoading = useAppSelector(selectVendorsLoading)
    const isVendorLoading = useAppSelector(selectVendorLoading)
    const isCreating = useAppSelector(selectVendorCreateLoading)
    const isUpdating = useAppSelector(selectVendorUpdateLoading)
    const isDeleting = useAppSelector(selectVendorDeleteLoading)
    const isLoading = useAppSelector(selectVendorAnyLoading)
    
    // Error states
    const vendorsError = useAppSelector(selectVendorsError)
    const error = useAppSelector(selectVendorAnyError)
    
    // Statistics and derived data
    const stats = useAppSelector(selectVendorStats)
    const cacheStatus = useAppSelector(selectVendorCacheStatus)
    
    // Actions
    const loadVendors = useCallback((params?: VendorListParams) => {
        dispatch(fetchVendors(params || {}))
    }, [dispatch])
    
    const loadVendor = useCallback((id: string) => {
        dispatch(fetchVendorById(id))
    }, [dispatch])
    
    const createVendor = useCallback(async (vendorData: Omit<VendorDto, 'ratings'>) => {
        const result = await dispatch(createNewVendor(vendorData))
        if (createNewVendor.rejected.match(result)) {
            throw new Error(result.payload?.message || 'Failed to create vendor')
        }
    }, [dispatch])
    
    const updateVendor = useCallback(async (id: string, data: Partial<Omit<VendorDto, 'ratings'>>) => {
        const result = await dispatch(updateExistingVendor({ id, data }))
        if (updateExistingVendor.rejected.match(result)) {
            throw new Error(result.payload?.message || 'Failed to update vendor')
        }
    }, [dispatch])
    
    const deleteVendor = useCallback(async (id: string) => {
        const result = await dispatch(removeVendor({ id }))
        if (removeVendor.rejected.match(result)) {
            throw new Error(result.payload?.message || 'Failed to delete vendor')
        }
    }, [dispatch])
    
    // UI Actions
    const setVendorFiltersCallback = useCallback((filters: any) => {
        dispatch(setVendorFilters(filters))
    }, [dispatch])
    
    const resetFilters = useCallback(() => {
        dispatch(clearVendorFilters())
    }, [dispatch])
    
    const selectVendor = useCallback((vendor: VendorWithId | null) => {
        dispatch(setSelectedVendor(vendor))
    }, [dispatch])
    
    const clearVendor = useCallback(() => {
        dispatch(clearSelectedVendor())
    }, [dispatch])
    
    // Utility Actions
    const clearVendorErrorCallback = useCallback((errorType: string) => {
        dispatch(clearVendorError(errorType as any))
    }, [dispatch])
    
    const clearAllVendorErrorsCallback = useCallback(() => {
        dispatch(clearAllVendorErrors())
    }, [dispatch])
    
    const refreshVendors = useCallback(() => {
        dispatch(fetchVendors({ page: pagination.page, limit: pagination.limit, ...filters }))
    }, [dispatch, pagination.page, pagination.limit, filters])
    
    const invalidateVendorCacheCallback = useCallback(() => {
        dispatch(invalidateVendorCache())
    }, [dispatch])
    
    return {
        // Data
        vendors,
        selectedVendor,
        filteredVendors,
        pagination,
        filters,
        
        // Loading states
        isLoading,
        isVendorsLoading,
        isVendorLoading,
        isCreating,
        isUpdating,
        isDeleting,
        
        // Error states
        error,
        vendorsError,
        
        // Statistics
        stats,
        cacheStatus,
        
        // Actions
        loadVendors,
        loadVendor,
        createVendor,
        updateVendor,
        deleteVendor,
        
        // UI Actions
        setVendorFilters: setVendorFiltersCallback,
        resetFilters,
        selectVendor,
        clearVendor,
        
        // Utility Actions
        clearVendorError: clearVendorErrorCallback,
        clearAllVendorErrors: clearAllVendorErrorsCallback,
        refreshVendors,
        invalidateVendorCache: invalidateVendorCacheCallback
    }
}
