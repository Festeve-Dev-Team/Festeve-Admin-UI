import ApiService from '@/services/ApiService'
import type { VendorWithId, VendorDto, VendorsApiResponse } from '../types/vendor'

// Note: Product-related functions have been moved to useProductsForVendor hook
// to leverage the existing Redux-based product management system

// Vendor APIs  
export async function createVendor(vendorData: Omit<VendorDto, 'ratings'>): Promise<VendorWithId> {
    try {
        const response = await ApiService.fetchData({
            url: '/vendors',
            method: 'POST',
            data: vendorData,
        })
        return response.data as VendorWithId
    } catch (error) {
        console.error('Failed to create vendor:', error)
        throw new Error('Failed to create vendor')
    }
}

export async function updateVendor(id: string, vendorData: Omit<VendorDto, 'ratings'>): Promise<VendorWithId> {
    try {
        // Remove any fields that shouldn't be sent to API
        const cleanData = { ...vendorData }
        if ('id' in cleanData) {
            delete (cleanData as any).id
        }
        if ('_id' in cleanData) {
            delete (cleanData as any)._id
        }
        if ('ratings' in cleanData) {
            delete (cleanData as any).ratings
        }

        const response = await ApiService.fetchData({
            url: `/vendors/${id}`,
            method: 'PATCH', // Changed from PUT to PATCH
            data: cleanData,
        })
        return response.data as VendorWithId
    } catch (error) {
        console.error('Failed to update vendor:', error)
        throw error
    }
}

export async function getVendors(params: {
    page?: number
    limit?: number
    search?: string
    sortBy?: string
    sortOrder?: 'asc' | 'desc'
} = {}): Promise<VendorsApiResponse> {
    try {
        const response = await ApiService.fetchData({
            url: '/vendors',
            method: 'GET',
            params,
        })
        
        // Handle direct array response from API
        const data = response.data
        if (Array.isArray(data)) {
            // If API returns direct array, wrap it in expected structure
            return {
                vendors: data as VendorWithId[],
                pagination: {
                    page: params.page || 1,
                    limit: params.limit || 20,
                    total: data.length,
                    pages: Math.ceil(data.length / (params.limit || 20))
                }
            }
        }
        
        // If API returns structured response, use as is
        return data as VendorsApiResponse
    } catch (error) {
        console.error('Failed to fetch vendors:', error)
        throw new Error('Failed to fetch vendors')
    }
}

export async function getVendor(id: string): Promise<VendorWithId> {
    try {
        console.log('🚀 API - Fetching vendor with ID:', id)
        const response = await ApiService.fetchData({
            url: `/vendors/${id}`,
            method: 'GET',
        })
        
        console.log('📥 API - Vendor response:', response)
        
        if (response.data) {
            const vendorWithId = {
                ...response.data,
                id: response.data._id || response.data.id || id
            }
            console.log('✅ API - Vendor with ID added:', vendorWithId)
            return vendorWithId as VendorWithId
        }
        
        console.log('⚠️ API - No data in vendor response')
        throw new Error('No vendor data received')
    } catch (error) {
        console.error('❌ API - Error fetching vendor:', error)
        throw error
    }
}

export async function deleteVendor(id: string): Promise<void> {
    try {
        await ApiService.fetchData({
            url: `/vendors/${id}`,
            method: 'DELETE',
        })
    } catch (error) {
        console.error('Failed to delete vendor:', error)
        throw new Error('Failed to delete vendor')
    }
}

// Legacy function for backward compatibility
export async function saveVendor(dto: VendorWithId | VendorDto): Promise<VendorWithId> {
    const vendorData = dto as VendorDto
    if ('id' in dto && dto.id) {
        return updateVendor(dto.id, vendorData)
    } else {
        return createVendor(vendorData)
    }
}



