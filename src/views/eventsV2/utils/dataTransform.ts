import type { EventFormInput } from '../schema/eventSchema'
import type { EventWithId, EventDto } from '../types/event'

/**
 * Transform form data to API format
 */
export function formToApiData(formData: EventFormInput): EventDto {
    const {
        name,
        description,
        type,
        date,
        recurring,
        linkedProducts,
        purohitRequired,
        ritualNotes,
        region,
        regions,
        specialOffers,
        productIds,
        extraData
    } = formData

    return {
        name,
        description: description || '',
        type,
        date,
        recurring,
        linkedProducts,
        purohitRequired,
        ritualNotes: ritualNotes || '',
        region: region || '',
        regions,
        specialOffers,
        productIds,
        extraData
    }
}

/**
 * Transform API data to form format
 */
export function apiToFormData(apiData: EventWithId): EventFormInput & { id: string } {
    const {
        id,
        _id,
        name,
        description,
        type,
        date,
        recurring,
        linkedProducts,
        purohitRequired,
        ritualNotes,
        region,
        regions,
        specialOffers,
        productIds,
        extraData
    } = apiData as any

    return {
        id: id || _id, // Use id if available, fallback to _id
        name: name || '',
        description: description || '',
        type: type || '',
        date: date || '',
        recurring: {
            isRecurring: recurring?.isRecurring || false,
            frequency: recurring?.frequency || 'daily',
            daysOfWeek: recurring?.daysOfWeek || []
        },
        linkedProducts: linkedProducts || [],
        purohitRequired: purohitRequired || false,
        ritualNotes: ritualNotes || '',
        region: region || '',
        regions: regions || [],
        specialOffers: specialOffers || [],
        productIds: productIds || [],
        extraData: extraData || {}
    }
}

/**
 * Validate if form data is ready for submission
 */
export function validateFormForSubmission(formData: EventFormInput): {
    isValid: boolean
    errors: string[]
} {
    const errors: string[] = []

    if (!formData.name.trim()) {
        errors.push('Event name is required')
    }

    if (formData.name.length < 3) {
        errors.push('Event name must be at least 3 characters')
    }

    if (formData.name.length > 120) {
        errors.push('Event name must be less than 120 characters')
    }

    if (!formData.type.trim()) {
        errors.push('Event type is required')
    }

    if (!formData.date) {
        errors.push('Event date is required')
    }

    // Validate date format
    try {
        const date = new Date(formData.date)
        if (isNaN(date.getTime())) {
            errors.push('Invalid date format')
        }
    } catch {
        errors.push('Invalid date format')
    }

    // Validate recurring settings
    if (formData.recurring.isRecurring) {
        if (!formData.recurring.frequency) {
            errors.push('Frequency is required for recurring events')
        }
        
        if (formData.recurring.frequency === 'weekly') {
            if (!formData.recurring.daysOfWeek || formData.recurring.daysOfWeek.length === 0) {
                errors.push('Days of week are required for weekly recurring events')
            }
        }
    }

    // Validate description length
    if (formData.description && formData.description.length > 1000) {
        errors.push('Description must be less than 1000 characters')
    }

    // Validate linkedProducts
    if (formData.linkedProducts) {
        for (const product of formData.linkedProducts) {
            if (!product.productId.trim()) {
                errors.push('All linked products must have a valid product ID')
                break
            }
            if (!product.relation.trim()) {
                errors.push('All linked products must have a relation type')
                break
            }
        }
    }

    // Validate specialOffers
    if (formData.specialOffers) {
        for (const offer of formData.specialOffers) {
            if (!offer.offerType.trim()) {
                errors.push('All special offers must have an offer type')
                break
            }
            if (!offer.productId.trim()) {
                errors.push('All special offers must have a valid product ID')
                break
            }
        }
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
