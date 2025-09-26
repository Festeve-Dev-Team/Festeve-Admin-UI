import type { PromoFormInput } from '../schema/promoSchema'
import type { PromoWithId, PromoDto } from '../types/promo'

/**
 * Transform form data to API format
 */
export function formToApiData(formData: PromoFormInput): PromoDto {
    const {
        name,
        code,
        status,
        startsAt,
        endsAt,
        globalLimit,
        perUserLimit,
        productIds,
        linkTTLSeconds,
        tags,
        notes
    } = formData

    return {
        name,
        code,
        status: status || 'ACTIVE',
        startsAt: startsAt || undefined,
        endsAt: endsAt || undefined,
        globalLimit,
        perUserLimit,
        productIds,
        linkTTLSeconds,
        tags,
        notes: notes || ''
    }
}

/**
 * Transform API data to form format
 */
export function apiToFormData(apiData: PromoWithId): PromoFormInput & { id: string } {
    const {
        id,
        _id,
        name,
        code,
        status,
        startsAt,
        endsAt,
        globalLimit,
        perUserLimit,
        productIds,
        linkTTLSeconds,
        tags,
        notes
    } = apiData as any

    return {
        id: id || _id, // Use id if available, fallback to _id
        name: name || '',
        code: code || '',
        status: status || 'ACTIVE',
        startsAt: startsAt || '',
        endsAt: endsAt || '',
        globalLimit: globalLimit || undefined,
        perUserLimit: perUserLimit || undefined,
        productIds: productIds || [],
        linkTTLSeconds: linkTTLSeconds || undefined,
        tags: tags || [],
        notes: notes || ''
    }
}

/**
 * Validate if form data is ready for submission
 */
export function validateFormForSubmission(formData: PromoFormInput): {
    isValid: boolean
    errors: string[]
} {
    const errors: string[] = []

    if (!formData.name.trim()) {
        errors.push('Promo name is required')
    }

    if (formData.name.length < 3) {
        errors.push('Promo name must be at least 3 characters')
    }

    if (formData.name.length > 120) {
        errors.push('Promo name must be less than 120 characters')
    }

    if (!formData.code.trim()) {
        errors.push('Promo code is required')
    }

    if (formData.code.length < 3) {
        errors.push('Promo code must be at least 3 characters')
    }

    if (formData.code.length > 50) {
        errors.push('Promo code must be less than 50 characters')
    }

    // Validate date formats and logic
    if (formData.startsAt && formData.startsAt.trim()) {
        try {
            const startDate = new Date(formData.startsAt)
            if (isNaN(startDate.getTime())) {
                errors.push('Invalid start date format')
            }
        } catch {
            errors.push('Invalid start date format')
        }
    }

    if (formData.endsAt && formData.endsAt.trim()) {
        try {
            const endDate = new Date(formData.endsAt)
            if (isNaN(endDate.getTime())) {
                errors.push('Invalid end date format')
            }
        } catch {
            errors.push('Invalid end date format')
        }
    }

    // Validate date range
    if (formData.startsAt && formData.endsAt && formData.startsAt.trim() && formData.endsAt.trim()) {
        try {
            const startDate = new Date(formData.startsAt)
            const endDate = new Date(formData.endsAt)
            if (!isNaN(startDate.getTime()) && !isNaN(endDate.getTime()) && startDate >= endDate) {
                errors.push('End date must be after start date')
            }
        } catch {
            // Already handled above
        }
    }

    // Validate limits
    if (formData.globalLimit !== undefined && formData.globalLimit < 0) {
        errors.push('Global limit must be 0 or greater')
    }

    if (formData.perUserLimit !== undefined && formData.perUserLimit < 0) {
        errors.push('Per user limit must be 0 or greater')
    }

    if (formData.globalLimit !== undefined && formData.perUserLimit !== undefined && 
        formData.perUserLimit > formData.globalLimit) {
        errors.push('Per user limit cannot exceed global limit')
    }

    if (formData.linkTTLSeconds !== undefined && formData.linkTTLSeconds < 0) {
        errors.push('Link TTL must be 0 or greater')
    }

    // Validate notes length
    if (formData.notes && formData.notes.length > 2000) {
        errors.push('Notes must be less than 2000 characters')
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
