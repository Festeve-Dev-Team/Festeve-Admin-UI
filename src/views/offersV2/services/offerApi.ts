import ApiService from '@/services/ApiService'
import type { OfferWithId, OfferDto, OfferId } from '../types/offer'

// Offer APIs following the same pattern as vendors
export async function createOffer(offerData: OfferDto): Promise<OfferWithId> {
    try {
        console.log('🌐 API: Creating offer with payload:', JSON.stringify(offerData, null, 2))

        const response = await ApiService.fetchData({
            url: '/offers',
            method: 'POST',
            data: offerData,
        })
        
        console.log('🌐 API: Create offer response:', response)
        return response.data as OfferWithId
    } catch (error) {
        console.error('Failed to create offer:', error)
        throw new Error('Failed to create offer')
    }
}

export async function updateOffer(id: string, offerData: Partial<OfferDto>): Promise<OfferWithId> {
    try {
        // Remove any fields that shouldn't be sent to API
        const cleanData = { ...offerData }
        if ('id' in cleanData) {
            delete (cleanData as any).id
        }
        if ('_id' in cleanData) {
            delete (cleanData as any)._id
        }

        console.log('🌐 API: Updating offer with payload:', JSON.stringify(cleanData, null, 2))

        const response = await ApiService.fetchData({
            url: `/offers/${id}`,
            method: 'PATCH', // Changed from PUT to PATCH
            data: cleanData,
        })
        
        console.log('🌐 API: Update offer response:', response)
        return response.data as OfferWithId
    } catch (error) {
        console.error('Failed to update offer:', error)
        throw error
    }
}

export async function getOffers(params: {
    page?: number
    limit?: number
    search?: string
    type?: string
    isActive?: boolean
    sortBy?: string
    sortOrder?: 'asc' | 'desc'
} = {}): Promise<{ offers: OfferWithId[], pagination: any }> {
    try {
        const response = await ApiService.fetchData({
            url: '/offers',
            method: 'GET',
            params,
        })
        
        // Handle direct array response from API
        const data = response.data
        if (Array.isArray(data)) {
            // Transform offers to ensure id field exists
            const transformedOffers = data.map((offer: any) => ({
                ...offer,
                id: offer.id || offer._id // Ensure id field exists
            })) as OfferWithId[]
            
            return {
                offers: transformedOffers,
                pagination: {
                    page: params.page || 1,
                    limit: params.limit || 20,
                    total: data.length,
                    pages: Math.ceil(data.length / (params.limit || 20))
                }
            }
        }
        
        // If API returns structured response, transform it too
        const structuredData = data as { offers: OfferWithId[], pagination: any }
        if (structuredData.offers) {
            structuredData.offers = structuredData.offers.map((offer: any) => ({
                ...offer,
                id: offer.id || offer._id // Ensure id field exists
            }))
        }
        return structuredData
    } catch (error) {
        console.error('Failed to fetch offers:', error)
        throw new Error('Failed to fetch offers')
    }
}

export async function getOffer(id: OfferId): Promise<OfferWithId> {
    try {
        console.log('🚀 API - Fetching offer with ID:', id)
        const response = await ApiService.fetchData({
            url: `/offers/${id}`,
            method: 'GET',
        })
        
        console.log('📥 API - Offer response:', response)
        
        if (response.data) {
            const offerWithId = {
                ...response.data,
                id: response.data._id || response.data.id || id
            }
            console.log('✅ API - Offer with ID added:', offerWithId)
            return offerWithId as OfferWithId
        }
        
        console.log('⚠️ API - No data in offer response')
        throw new Error('No offer data received')
    } catch (error) {
        console.error('❌ API - Error fetching offer:', error)
        throw error
    }
}

export async function deleteOffer(id: string): Promise<void> {
    try {
        await ApiService.fetchData({
            url: `/offers/${id}`,
            method: 'DELETE',
        })
    } catch (error) {
        console.error('Failed to delete offer:', error)
        throw new Error('Failed to delete offer')
    }
}

// Legacy functions for backward compatibility
export async function listOffers(): Promise<OfferWithId[]> {
    const result = await getOffers()
    return result.offers
}

export async function saveOffer(dto: OfferWithId | OfferDto): Promise<OfferWithId> {
    const isUpdate = !!(dto as OfferWithId).id
    
    if (isUpdate) {
        return await updateOffer((dto as OfferWithId).id, dto)
    } else {
        return await createOffer(dto as OfferDto)
    }
}



