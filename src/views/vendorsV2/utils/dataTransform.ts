import type { VendorFormInput } from '../schema/vendorSchema'
import type { VendorWithId, VendorDto } from '../types/vendor'

/**
 * Transform form data to API format
 */
export function formToApiData(formData: VendorFormInput): Omit<VendorDto, 'ratings'> {
    const {
        name,
        storeName,
        address,
        productIds
    } = formData

    // Note: ratings are excluded as they're managed by the backend
    return {
        name,
        storeName,
        address,
        productIds
    }
}

/**
 * Transform API data to form format
 */
export function apiToFormData(apiData: VendorWithId): VendorFormInput {
    const {
        id,
        name,
        storeName,
        address,
        ratings,
        productIds
    } = apiData

    return {
        id,
        name,
        storeName,
        address: address || '',
        ratings: ratings || [],
        productIds: productIds || []
    }
}

/**
 * Validate if form data is ready for submission
 */
export function validateFormForSubmission(formData: VendorFormInput): {
    isValid: boolean
    errors: string[]
} {
    const errors: string[] = []

    if (!formData.name.trim()) {
        errors.push('Vendor name is required')
    }

    if (!formData.storeName.trim()) {
        errors.push('Store name is required')
    }

    // Validate productIds length (warn if too many)
    if (formData.productIds.length > 10000) {
        errors.push('Too many products selected (maximum 10,000)')
    }

    return {
        isValid: errors.length === 0,
        errors
    }
}
