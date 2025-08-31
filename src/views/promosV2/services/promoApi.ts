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
        // Transform data to match the expected API format
        const apiPayload: any = {}
        
        if (promoData.name) apiPayload.name = promoData.name
        if (promoData.code) apiPayload.code = promoData.code
        if (promoData.status !== undefined) apiPayload.status = promoData.status
        if (promoData.startsAt !== undefined) apiPayload.startsAt = promoData.startsAt
        if (promoData.endsAt !== undefined) apiPayload.endsAt = promoData.endsAt
        if (promoData.globalLimit !== undefined) apiPayload.globalLimit = promoData.globalLimit
        if (promoData.perUserLimit !== undefined) apiPayload.perUserLimit = promoData.perUserLimit
        if (promoData.productIds) apiPayload.productIds = promoData.productIds
        if (promoData.linkTTLSeconds !== undefined) apiPayload.linkTTLSeconds = promoData.linkTTLSeconds
        if (promoData.tags) apiPayload.tags = promoData.tags
        if (promoData.notes !== undefined) apiPayload.notes = promoData.notes

        console.log('Updating promo with payload:', JSON.stringify(apiPayload, null, 2))

        const response = await ApiService.fetchData({
            url: `/referrals/promos/${id}`,
            method: 'PUT',
            data: apiPayload,
        })
        return response.data as PromoWithId
    } catch (error) {
        console.error('Failed to update promo:', error)
        throw new Error('Failed to update promo')
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
        const response = await ApiService.fetchData({
            url: `/referrals/promos/${id}`,
            method: 'GET',
        })
        return response.data as PromoWithId
    } catch (error) {
        console.error('Failed to fetch promo:', error)
        throw new Error('Failed to fetch promo')
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
