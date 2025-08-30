import { createSelector } from '@reduxjs/toolkit'
import type { RootState } from '@/store'
import type { VendorWithId } from '@/views/vendorsV2/types/vendor'

// Base selectors
export const selectVendorState = (state: RootState) => state.vendor

export const selectVendors = createSelector(
    [selectVendorState],
    (vendorState) => vendorState.vendors
)

export const selectSelectedVendor = createSelector(
    [selectVendorState],
    (vendorState) => vendorState.selectedVendor
)

export const selectVendorPagination = createSelector(
    [selectVendorState],
    (vendorState) => vendorState.pagination
)

export const selectVendorFilters = createSelector(
    [selectVendorState],
    (vendorState) => vendorState.filters
)

// Loading selectors
export const selectVendorsLoading = createSelector(
    [selectVendorState],
    (vendorState) => vendorState.loading.list
)

export const selectVendorLoading = createSelector(
    [selectVendorState],
    (vendorState) => vendorState.loading.fetch
)

export const selectVendorCreateLoading = createSelector(
    [selectVendorState],
    (vendorState) => vendorState.loading.create
)

export const selectVendorUpdateLoading = createSelector(
    [selectVendorState],
    (vendorState) => vendorState.loading.update
)

export const selectVendorDeleteLoading = createSelector(
    [selectVendorState],
    (vendorState) => vendorState.loading.delete
)

export const selectVendorAnyLoading = createSelector(
    [selectVendorState],
    (vendorState) => Object.values(vendorState.loading).some(Boolean)
)

// Error selectors
export const selectVendorsError = createSelector(
    [selectVendorState],
    (vendorState) => vendorState.error.list
)

export const selectVendorError = createSelector(
    [selectVendorState],
    (vendorState) => vendorState.error.fetch
)

export const selectVendorCreateError = createSelector(
    [selectVendorState],
    (vendorState) => vendorState.error.create
)

export const selectVendorUpdateError = createSelector(
    [selectVendorState],
    (vendorState) => vendorState.error.update
)

export const selectVendorDeleteError = createSelector(
    [selectVendorState],
    (vendorState) => vendorState.error.delete
)

export const selectVendorAnyError = createSelector(
    [selectVendorState],
    (vendorState) => Object.values(vendorState.error).find(error => error !== null) || null
)

// Filtered vendors
export const selectFilteredVendors = createSelector(
    [selectVendors, selectVendorFilters],
    (vendors, filters) => {
        // Safety check for vendors array
        if (!vendors || !Array.isArray(vendors)) {
            return []
        }

        let filtered = [...vendors]

        // Search filter
        if (filters.search) {
            const searchLower = filters.search.toLowerCase()
            filtered = filtered.filter(vendor => 
                vendor.name?.toLowerCase().includes(searchLower) ||
                vendor.storeName?.toLowerCase().includes(searchLower) ||
                (vendor.address && vendor.address.toLowerCase().includes(searchLower))
            )
        }

        // Sort
        filtered.sort((a, b) => {
            const aValue = a[filters.sortBy as keyof VendorWithId] as string
            const bValue = b[filters.sortBy as keyof VendorWithId] as string
            
            if (filters.sortOrder === 'desc') {
                return bValue.localeCompare(aValue)
            }
            return aValue.localeCompare(bValue)
        })

        return filtered
    }
)

// Statistics
export const selectVendorStats = createSelector(
    [selectVendors],
    (vendors) => {
        // Safety check for vendors array
        if (!vendors || !Array.isArray(vendors)) {
            return {
                totalVendors: 0,
                vendorsWithProducts: 0,
                totalProducts: 0,
                avgProductsPerVendor: 0,
                vendorsWithRatings: 0,
                totalRatings: 0,
                avgRating: 0
            }
        }

        const totalVendors = vendors.length
        const vendorsWithProducts = vendors.filter(v => v.productIds && v.productIds.length > 0).length
        const totalProducts = vendors.reduce((sum, v) => sum + (v.productIds ? v.productIds.length : 0), 0)
        const avgProductsPerVendor = totalVendors > 0 ? Math.round(totalProducts / totalVendors) : 0
        
        // Rating statistics
        const vendorsWithRatings = vendors.filter(v => v.ratings && v.ratings.length > 0)
        const totalRatings = vendors.reduce((sum, v) => sum + (v.ratings ? v.ratings.length : 0), 0)
        const avgRating = vendors.length > 0 
            ? vendors.reduce((sum, v) => sum + (v.averageRating || 0), 0) / vendors.length 
            : 0

        return {
            totalVendors,
            vendorsWithProducts,
            totalProducts,
            avgProductsPerVendor,
            vendorsWithRatings: vendorsWithRatings.length,
            totalRatings,
            avgRating: Math.round(avgRating * 10) / 10
        }
    }
)

// Cache selectors
export const selectVendorCacheStatus = createSelector(
    [selectVendorState],
    (vendorState) => ({
        lastFetched: vendorState.lastFetched,
        isStale: vendorState.lastFetched 
            ? Date.now() - vendorState.lastFetched > vendorState.cacheExpiry 
            : true
    })
)
