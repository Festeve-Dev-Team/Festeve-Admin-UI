import type { OfferFormInput } from '../schema/offerSchema'
import type { OfferWithId, OfferDto } from '../types/offer'

/**
 * Transform form data to API format
 */
export function formToApiData(formData: OfferFormInput): OfferDto {
    const {
        title,
        description,
        type,
        discountType,
        discountValue,
        comboItems,
        appliesTo,
        targetIds,
        minGroupSize,
        maxGroupSize,
        startDate,
        endDate,
        combinable,
        conditions
    } = formData

    return {
        title,
        description: description || '',
        type,
        discountType,
        discountValue,
        comboItems,
        appliesTo,
        targetIds,
        minGroupSize,
        maxGroupSize,
        startDate,
        endDate,
        combinable,
        conditions
    }
}

/**
 * Transform API data to form format
 */
export function apiToFormData(apiData: OfferWithId): OfferFormInput & { id: string } {
    const {
        id,
        _id,
        title,
        description,
        type,
        discountType,
        discountValue,
        comboItems,
        appliesTo,
        targetIds,
        minGroupSize,
        maxGroupSize,
        startDate,
        endDate,
        combinable,
        conditions
    } = apiData as any

    return {
        id: id || _id, // Use id if available, fallback to _id
        title: title || '',
        description: description || '',
        type: type || 'percentage_discount',
        discountType: discountType || 'percentage',
        discountValue: discountValue || 0,
        comboItems: comboItems || [],
        appliesTo: appliesTo || 'product',
        targetIds: targetIds || [],
        minGroupSize: minGroupSize || 1,
        maxGroupSize: maxGroupSize || 1,
        startDate: startDate || '',
        endDate: endDate || '',
        combinable: combinable || false,
        conditions: conditions || {}
    }
}

/**
 * Validate if form data is ready for submission
 */
export function validateFormForSubmission(formData: OfferFormInput): {
    isValid: boolean
    errors: string[]
} {
    const errors: string[] = []

    if (!formData.title.trim()) {
        errors.push('Offer title is required')
    }

    if (formData.title.length < 3) {
        errors.push('Offer title must be at least 3 characters')
    }

    if (formData.title.length > 120) {
        errors.push('Offer title must be less than 120 characters')
    }

    if (formData.description && formData.description.length > 500) {
        errors.push('Description must be less than 500 characters')
    }

    // Validate discount value
    if (formData.discountType === 'percentage') {
        if (formData.discountValue < 1 || formData.discountValue > 100) {
            errors.push('Percentage discount must be between 1 and 100')
        }
    } else if (formData.discountType === 'fixed') {
        if (formData.discountValue <= 0) {
            errors.push('Fixed discount must be greater than 0')
        }
    }

    // Validate date range
    try {
        const startDate = new Date(formData.startDate)
        const endDate = new Date(formData.endDate)
        
        if (isNaN(startDate.getTime())) {
            errors.push('Invalid start date format')
        }
        
        if (isNaN(endDate.getTime())) {
            errors.push('Invalid end date format')
        }
        
        if (startDate >= endDate) {
            errors.push('End date must be after start date')
        }
    } catch {
        errors.push('Invalid date format')
    }

    // Validate targeting
    if (formData.appliesTo !== 'all' && formData.targetIds.length === 0) {
        errors.push('At least one target is required when not applying to all')
    }

    if (formData.appliesTo === 'all' && formData.targetIds.length > 0) {
        errors.push('Targets must be empty when applying to all')
    }

    // Validate combo items for relevant offer types
    if ((formData.type === 'bogo' || formData.type === 'combo_bundle') && formData.comboItems.length === 0) {
        errors.push('At least one combo item is required for BOGO or combo bundle offers')
    }

    // Validate group sizes
    if (formData.maxGroupSize < formData.minGroupSize) {
        errors.push('Maximum group size must be greater than or equal to minimum group size')
    }

    return {
        isValid: errors.length === 0,
        errors
    }
}
