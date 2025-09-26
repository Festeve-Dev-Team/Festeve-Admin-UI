import ApiService from '@/services/ApiService'
import type { PromoWithId, PromoDto, PromoId } from '../types/promo'

// Promo APIs following the same pattern as events
export async function createPromo(promoData: PromoDto): Promise<PromoWithId> {
    try {
        // Transform data to match the expected API format
        const apiPayload = {
            name: promoData.name,
            code: promoData.code,
            status: promoData.status || 'ACTIVE',
            startsAt: promoData.startsAt || undefined,
            endsAt: promoData.endsAt || undefined,
            globalLimit: promoData.globalLimit || undefined,
            perUserLimit: promoData.perUserLimit || undefined,
            productIds: promoData.productIds || [],
            linkTTLSeconds: promoData.linkTTLSeconds || undefined,
            tags: promoData.tags || [],
            notes: promoData.notes || ''
        }

        console.log('🌐 API: Creating promo with payload:', JSON.stringify(apiPayload, null, 2))

        const response = await ApiService.fetchData({
            url: '/referrals/promos',
            method: 'POST',
            data: apiPayload,
        })
        
        console.log('🌐 API: Create promo response:', response)
        return response.data as PromoWithId
    } catch (error) {
        console.error('Failed to create promo:', error)
        throw new Error('Failed to create promo')
    }
}

export async function updatePromo(id: string, promoData: Partial<PromoDto>): Promise<PromoWithId> {
    try {
        // Remove any fields that shouldn't be sent to API
        const cleanData = { ...promoData }
        if ('id' in cleanData) {
            delete (cleanData as any).id
        }
        if ('_id' in cleanData) {
            delete (cleanData as any)._id
        }

        // Transform data to match the expected API format
        const apiPayload: any = {}
        
        if (cleanData.name) apiPayload.name = cleanData.name
        if (cleanData.code) apiPayload.code = cleanData.code
        if (cleanData.status !== undefined) apiPayload.status = cleanData.status
        if (cleanData.startsAt !== undefined) apiPayload.startsAt = cleanData.startsAt
        if (cleanData.endsAt !== undefined) apiPayload.endsAt = cleanData.endsAt
        if (cleanData.globalLimit !== undefined) apiPayload.globalLimit = cleanData.globalLimit
        if (cleanData.perUserLimit !== undefined) apiPayload.perUserLimit = cleanData.perUserLimit
        if (cleanData.productIds) apiPayload.productIds = cleanData.productIds
        if (cleanData.linkTTLSeconds !== undefined) apiPayload.linkTTLSeconds = cleanData.linkTTLSeconds
        if (cleanData.tags) apiPayload.tags = cleanData.tags
        if (cleanData.notes !== undefined) apiPayload.notes = cleanData.notes

        console.log('🌐 API: Updating promo with payload:', JSON.stringify(apiPayload, null, 2))

        const response = await ApiService.fetchData({
            url: `/referrals/promos/${id}`, // Keep the /referrals prefix consistent
            method: 'PATCH', // Changed from PUT to PATCH
            data: apiPayload,
        })
        
        console.log('🌐 API: Update promo response:', response)
        return response.data as PromoWithId
    } catch (error) {
        console.error('Failed to update promo:', error)
        throw error
    }
}

export async function getPromos(params: {
    page?: number
    limit?: number
    search?: string
    status?: string
    sortBy?: string
    sortOrder?: 'asc' | 'desc'
} = {}): Promise<{ promos: PromoWithId[], pagination: any }> {
    try {
        const response = await ApiService.fetchData({
            url: '/referrals/promos',
            method: 'GET',
            params,
        })
        
        // Handle direct array response from API
        const data = response.data
        if (Array.isArray(data)) {
            // Transform promos to ensure id field exists
            const transformedPromos = data.map((promo: any) => ({
                ...promo,
                id: promo.id || promo._id // Ensure id field exists
            })) as PromoWithId[]
            
            return {
                promos: transformedPromos,
                pagination: {
                    page: params.page || 1,
                    limit: params.limit || 20,
                    total: data.length,
                    pages: Math.ceil(data.length / (params.limit || 20))
                }
            }
        }
        
        // If API returns structured response, transform it too
        const structuredData = data as { promos: PromoWithId[], pagination: any }
        if (structuredData.promos) {
            structuredData.promos = structuredData.promos.map((promo: any) => ({
                ...promo,
                id: promo.id || promo._id // Ensure id field exists
            }))
        }
        return structuredData
    } catch (error) {
        console.error('Failed to fetch promos:', error)
        throw new Error('Failed to fetch promos')
    }
}

export async function getPromo(id: PromoId): Promise<PromoWithId> {
    try {
        console.log('🚀 API - Fetching promo with ID:', id)
        const response = await ApiService.fetchData({
            url: `/referrals/promos/${id}`, // Keep the /referrals prefix consistent
            method: 'GET',
        })
        
        console.log('📥 API - Promo response:', response)
        
        if (response.data) {
            const promoWithId = {
                ...response.data,
                id: response.data._id || response.data.id || id
            }
            console.log('✅ API - Promo with ID added:', promoWithId)
            return promoWithId as PromoWithId
        }
        
        console.log('⚠️ API - No data in promo response')
        throw new Error('No promo data received')
    } catch (error) {
        console.error('❌ API - Error fetching promo:', error)
        throw error
    }
}

export async function deletePromo(id: string): Promise<void> {
    try {
        await ApiService.fetchData({
            url: `/referrals/promos/${id}`,
            method: 'DELETE',
        })
    } catch (error) {
        console.error('Failed to delete promo:', error)
        throw new Error('Failed to delete promo')
    }
}

// Legacy functions for backward compatibility
export async function listPromos(): Promise<PromoWithId[]> {
    const result = await getPromos()
    return result.promos
}

export async function savePromo(dto: PromoWithId | PromoDto): Promise<PromoWithId> {
    const isUpdate = !!(dto as PromoWithId).id
    
    if (isUpdate) {
        return await updatePromo((dto as PromoWithId).id, dto)
    } else {
        return await createPromo(dto as PromoDto)
    }
}

function randomId() {
    return `promo_${Math.random().toString(36).slice(2, 10)}`
}

function delay(ms: number) {
    return new Promise((res) => setTimeout(res, ms))
}
