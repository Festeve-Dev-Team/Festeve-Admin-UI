import { useCallback, useState } from 'react'
import { useAppDispatch } from '@/store/hook'
import type { OfferWithId, OfferDto } from '../types/offer'

// Define types locally since offer slice doesn't exist yet
type OfferListParams = {
    page?: number
    limit?: number
    search?: string
    type?: string
    isActive?: boolean
    sortBy?: string
    sortOrder?: 'asc' | 'desc'
}

interface UseOffersReturn {
    // Data
    offers: OfferWithId[]
    selectedOffer: OfferWithId | null
    filteredOffers: OfferWithId[]
    pagination: any
    filters: any
    
    // Loading states
    isLoading: boolean
    isOffersLoading: boolean
    isOfferLoading: boolean
    isCreating: boolean
    isUpdating: boolean
    isDeleting: boolean
    
    // Error states
    error: string | null
    offersError: string | null
    
    // Statistics
    stats: any
    cacheStatus: any
    
    // Actions
    loadOffers: (params?: OfferListParams) => void
    loadOffer: (id: string) => void
    createOffer: (offerData: OfferDto) => Promise<OfferWithId>
    updateOffer: (id: string, data: Partial<OfferDto>) => Promise<OfferWithId>
    deleteOffer: (id: string) => Promise<void>
    
    // UI Actions
    setOfferFilters: (filters: any) => void
    resetFilters: () => void
    selectOffer: (offer: OfferWithId | null) => void
    clearOffer: () => void
    
    // Utility Actions
    clearOfferError: (errorType: string) => void
    clearAllOfferErrors: () => void
    refreshOffers: () => void
    invalidateOfferCache: () => void
}

export default function useOffers(): UseOffersReturn {
    const dispatch = useAppDispatch()
    
    // Local state management until we create the offer slice
    const [offers, setOffers] = useState<OfferWithId[]>([])
    const [selectedOffer, setSelectedOffer] = useState<OfferWithId | null>(null)
    const [isOffersLoading, setIsOffersLoading] = useState(false)
    const [isOfferLoading, setIsOfferLoading] = useState(false)
    const [isCreating, setIsCreating] = useState(false)
    const [isUpdating, setIsUpdating] = useState(false)
    const [isDeleting, setIsDeleting] = useState(false)
    const [offersError, setOffersError] = useState<string | null>(null)
    
    const filteredOffers = offers
    const pagination = { page: 1, limit: 20, total: offers.length }
    const filters = {}
    const isLoading = isOffersLoading || isOfferLoading || isCreating || isUpdating || isDeleting
    const error = offersError
    
    // Statistics and derived data
    const stats = { totalOffers: offers.length }
    const cacheStatus = {}
    
    // Actions
    const loadOffers = useCallback(async (params?: OfferListParams) => {
        try {
            console.log('🚀 loadOffers called with params:', params)
            setIsOffersLoading(true)
            setOffersError(null)
            
            const { getOffers } = await import('../services/offerApi')
            const result = await getOffers(params || {})
            
            console.log('✅ Offers loaded successfully:', result)
            
            // Update local state
            setOffers(result.offers)
            
        } catch (error) {
            console.error('❌ Failed to load offers:', error)
            const errorMessage = error instanceof Error ? error.message : 'Failed to load offers'
            setOffersError(errorMessage)
        } finally {
            setIsOffersLoading(false)
        }
    }, [])
    
    const loadOffer = useCallback((id: string) => {
        console.log('loadOffer called with id:', id)
    }, [])
    
    const createOffer = useCallback(async (offerData: OfferDto): Promise<OfferWithId> => {
        try {
            console.log('🚀 createOffer called with data:', offerData)
            setIsCreating(true)
            setOffersError(null)
            
            const { createOffer: apiCreateOffer } = await import('../services/offerApi')
            const result = await apiCreateOffer(offerData)
            
            console.log('✅ Offer created successfully:', result)
            
            // Add to local state
            setOffers(prev => [result, ...prev])
            
            return result
        } catch (error) {
            console.error('❌ Failed to create offer:', error)
            const errorMessage = error instanceof Error ? error.message : 'Failed to create offer'
            setOffersError(errorMessage)
            throw error
        } finally {
            setIsCreating(false)
        }
    }, [])
    
    const updateOffer = useCallback(async (id: string, data: Partial<OfferDto>): Promise<OfferWithId> => {
        try {
            console.log('🚀 updateOffer called with id:', id, 'data:', data)
            setIsUpdating(true)
            setOffersError(null)
            
            const { updateOffer: apiUpdateOffer } = await import('../services/offerApi')
            const result = await apiUpdateOffer(id, data)
            
            console.log('✅ Offer updated successfully:', result)
            
            // Update in local state
            setOffers(prev => prev.map(offer => offer.id === id ? result : offer))
            
            return result
        } catch (error) {
            console.error('❌ Failed to update offer:', error)
            const errorMessage = error instanceof Error ? error.message : 'Failed to update offer'
            setOffersError(errorMessage)
            throw error
        } finally {
            setIsUpdating(false)
        }
    }, [])
    
    const deleteOffer = useCallback(async (id: string) => {
        try {
            console.log('🚀 deleteOffer called with id:', id)
            setIsDeleting(true)
            setOffersError(null)
            
            const { deleteOffer: apiDeleteOffer } = await import('../services/offerApi')
            await apiDeleteOffer(id)
            
            console.log('✅ Offer deleted successfully')
            
            // Remove from local state
            setOffers(prev => prev.filter(offer => offer.id !== id))
            
        } catch (error) {
            console.error('❌ Failed to delete offer:', error)
            const errorMessage = error instanceof Error ? error.message : 'Failed to delete offer'
            setOffersError(errorMessage)
            throw error
        } finally {
            setIsDeleting(false)
        }
    }, [])
    
    // UI Actions
    const setOfferFiltersCallback = useCallback((filters: any) => {
        console.log('setOfferFilters called with filters:', filters)
    }, [])
    
    const resetFilters = useCallback(() => {
        console.log('resetFilters called')
    }, [])
    
    const selectOffer = useCallback((offer: OfferWithId | null) => {
        console.log('selectOffer called with offer:', offer)
        setSelectedOffer(offer)
    }, [])
    
    const clearOffer = useCallback(() => {
        console.log('clearOffer called')
        setSelectedOffer(null)
    }, [])
    
    // Utility Actions
    const clearOfferErrorCallback = useCallback((errorType: string) => {
        console.log('clearOfferError called with errorType:', errorType)
        setOffersError(null)
    }, [])
    
    const clearAllOfferErrorsCallback = useCallback(() => {
        console.log('clearAllOfferErrors called')
        setOffersError(null)
    }, [])
    
    const refreshOffers = useCallback(() => {
        console.log('refreshOffers called')
        loadOffers({ page: 1, limit: 20 })
    }, [loadOffers])
    
    const invalidateOfferCacheCallback = useCallback(() => {
        console.log('invalidateOfferCache called')
    }, [])
    
    return {
        // Data
        offers,
        selectedOffer,
        filteredOffers,
        pagination,
        filters,
        
        // Loading states
        isLoading,
        isOffersLoading,
        isOfferLoading,
        isCreating,
        isUpdating,
        isDeleting,
        
        // Error states
        error,
        offersError,
        
        // Statistics
        stats,
        cacheStatus,
        
        // Actions
        loadOffers,
        loadOffer,
        createOffer,
        updateOffer,
        deleteOffer,
        
        // UI Actions
        setOfferFilters: setOfferFiltersCallback,
        resetFilters,
        selectOffer,
        clearOffer,
        
        // Utility Actions
        clearOfferError: clearOfferErrorCallback,
        clearAllOfferErrors: clearAllOfferErrorsCallback,
        refreshOffers,
        invalidateOfferCache: invalidateOfferCacheCallback
    }
}
