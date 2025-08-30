import type { PurohitFormInput } from '../schema/purohitSchema'
import type { PurohitWithId, Purohit } from '../types/purohit'

/**
 * Transform form data to API format
 */
export function formToApiData(formData: PurohitFormInput): Purohit {
    const {
        name,
        phone,
        location,
        experienceYears,
        skills,
        availability,
        bio,
        customSkills,
        rituals,
        languages,
        chargesCommission,
        commissionType,
        commissionValue,
        isActive
    } = formData

    return {
        name,
        phone,
        location,
        experienceYears,
        skills,
        availability,
        bio: bio || '',
        customSkills: customSkills || {},
        rituals,
        languages,
        chargesCommission,
        commissionType,
        commissionValue,
        isActive
    }
}

/**
 * Transform API data to form format
 */
export function apiToFormData(apiData: PurohitWithId): PurohitFormInput & { id: string } {
    const {
        id,
        name,
        phone,
        location,
        experienceYears,
        skills,
        availability,
        bio,
        customSkills,
        rituals,
        languages,
        chargesCommission,
        commissionType,
        commissionValue,
        isActive
    } = apiData

    return {
        id,
        name,
        phone,
        location,
        experienceYears,
        skills: skills || [],
        availability: availability || [],
        bio: bio || '',
        customSkills: customSkills || {},
        rituals: rituals || [],
        languages: languages || [],
        chargesCommission,
        commissionType,
        commissionValue,
        isActive
    }
}

/**
 * Validate if form data is ready for submission
 */
export function validateFormForSubmission(formData: PurohitFormInput): {
    isValid: boolean
    errors: string[]
} {
    const errors: string[] = []

    if (!formData.name.trim()) {
        errors.push('Purohit name is required')
    }

    if (formData.name.length < 3) {
        errors.push('Purohit name must be at least 3 characters')
    }

    if (formData.name.length > 120) {
        errors.push('Purohit name must be less than 120 characters')
    }

    if (!formData.phone.trim()) {
        errors.push('Phone number is required')
    }

    // Validate phone format
    const phoneRegex = /^\+91\d{10}$/
    if (!phoneRegex.test(formData.phone)) {
        errors.push('Phone must start with +91 and have 10 digits')
    }

    if (formData.experienceYears < 0) {
        errors.push('Experience years cannot be negative')
    }

    if (formData.experienceYears > 60) {
        errors.push('Experience years cannot exceed 60')
    }

    // Validate location
    if (formData.location.pincode && (!formData.location.city || !formData.location.state)) {
        errors.push('City and State are required when PIN code is provided')
    }

    // Validate PIN code format
    if (formData.location.pincode) {
        const pinRegex = /^\d{6}$/
        if (!pinRegex.test(formData.location.pincode)) {
            errors.push('PIN code must be 6 digits')
        }
    }

    // Validate bio length
    if (formData.bio && formData.bio.length > 500) {
        errors.push('Bio must be less than 500 characters')
    }

    // Validate languages
    if (!formData.languages || formData.languages.length === 0) {
        errors.push('At least one language is required')
    }

    // Validate skills and rituals count
    if (formData.skills.length > 50) {
        errors.push('Too many skills selected (maximum 50)')
    }

    if (formData.rituals.length > 50) {
        errors.push('Too many rituals selected (maximum 50)')
    }

    // Validate commission settings
    if (formData.chargesCommission) {
        if (formData.commissionType === 'percentage') {
            if (formData.commissionValue < 0 || formData.commissionValue > 100) {
                errors.push('Commission percentage must be between 0 and 100')
            }
        } else if (formData.commissionType === 'fixed') {
            if (formData.commissionValue <= 0) {
                errors.push('Fixed commission must be greater than 0')
            }
        }
    }

    // Validate availability
    if (formData.availability) {
        for (const avail of formData.availability) {
            if (!avail.timeSlots || avail.timeSlots.length === 0) {
                errors.push('Each availability date must have at least one time slot')
                break
            }
        }
    }

    return {
        isValid: errors.length === 0,
        errors
    }
}
