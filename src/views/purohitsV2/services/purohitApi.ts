import ApiService from '@/services/ApiService'
import type { PurohitWithId, Purohit, PurohitId } from '../types/purohit'

// Purohit APIs following the same pattern as events/categories
export async function createPurohit(purohitData: Purohit): Promise<PurohitWithId> {
    try {
        console.log('🌐 API: Creating purohit with payload:', JSON.stringify(purohitData, null, 2))

        const response = await ApiService.fetchData({
            url: '/purohits',
            method: 'POST',
            data: purohitData,
        })
        
        console.log('🌐 API: Create purohit response:', response)
        return response.data as PurohitWithId
    } catch (error) {
        console.error('Failed to create purohit:', error)
        throw new Error('Failed to create purohit')
    }
}

export async function updatePurohit(id: string, purohitData: Partial<Purohit>): Promise<PurohitWithId> {
    try {
        console.log('🌐 API: Updating purohit with payload:', JSON.stringify(purohitData, null, 2))

        const response = await ApiService.fetchData({
            url: `/purohits/${id}`,
            method: 'PUT',
            data: purohitData,
        })
        
        console.log('🌐 API: Update purohit response:', response)
        return response.data as PurohitWithId
    } catch (error) {
        console.error('Failed to update purohit:', error)
        throw new Error('Failed to update purohit')
    }
}

export async function getPurohits(params: {
    page?: number
    limit?: number
    search?: string
    city?: string
    state?: string
    isActive?: boolean
    sortBy?: string
    sortOrder?: 'asc' | 'desc'
} = {}): Promise<{ purohits: PurohitWithId[], pagination: any }> {
    try {
        const response = await ApiService.fetchData({
            url: '/purohits',
            method: 'GET',
            params,
        })
        
        // Handle direct array response from API
        const data = response.data
        if (Array.isArray(data)) {
            // Transform purohits to ensure id field exists
            const transformedPurohits = data.map((purohit: any) => ({
                ...purohit,
                id: purohit.id || purohit._id // Ensure id field exists
            })) as PurohitWithId[]
            
            return {
                purohits: transformedPurohits,
                pagination: {
                    page: params.page || 1,
                    limit: params.limit || 20,
                    total: data.length,
                    pages: Math.ceil(data.length / (params.limit || 20))
                }
            }
        }
        
        // If API returns structured response, transform it too
        const structuredData = data as { purohits: PurohitWithId[], pagination: any }
        if (structuredData.purohits) {
            structuredData.purohits = structuredData.purohits.map((purohit: any) => ({
                ...purohit,
                id: purohit.id || purohit._id // Ensure id field exists
            }))
        }
        return structuredData
    } catch (error) {
        console.error('Failed to fetch purohits:', error)
        throw new Error('Failed to fetch purohits')
    }
}

export async function getPurohit(id: PurohitId): Promise<PurohitWithId> {
    try {
        const response = await ApiService.fetchData({
            url: `/purohits/${id}`,
            method: 'GET',
        })
        return response.data as PurohitWithId
    } catch (error) {
        console.error('Failed to fetch purohit:', error)
        throw new Error('Failed to fetch purohit')
    }
}

export async function deletePurohit(id: string): Promise<void> {
    try {
        await ApiService.fetchData({
            url: `/purohits/${id}`,
            method: 'DELETE',
        })
    } catch (error) {
        console.error('Failed to delete purohit:', error)
        throw new Error('Failed to delete purohit')
    }
}

// Legacy functions for backward compatibility
export async function listPurohits(): Promise<PurohitWithId[]> {
    const result = await getPurohits()
    return result.purohits
}

export async function savePurohit(dto: PurohitWithId | Purohit): Promise<PurohitWithId> {
    const isUpdate = !!(dto as PurohitWithId).id
    
    if (isUpdate) {
        return await updatePurohit((dto as PurohitWithId).id, dto)
    } else {
        return await createPurohit(dto as Purohit)
    }
}

function randomId() {
    return `pu_${Math.random().toString(36).slice(2, 10)}`
}

function delay(ms: number) {
    return new Promise((res) => setTimeout(res, ms))
}


