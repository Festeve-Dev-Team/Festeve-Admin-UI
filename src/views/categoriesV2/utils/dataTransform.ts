import type { CategoryFormInput } from '../schema/categorySchema'
import type { CategoryWithId, CategoryDto } from '../types/category'

/**
 * Transform form data to API format
 */
export function formToApiData(formData: CategoryFormInput): Partial<CategoryDto> {
    const {
        name,
        slug,
        isActive,
        parentId,
        displayOrder,
        image,
        attributes
    } = formData

    // Only include fields that have values
    const baseData: Partial<CategoryDto> = {}
    
    if (name && name.trim()) baseData.name = name.trim()
    if (slug && slug.trim()) baseData.slug = slug.trim()
    if (typeof isActive === 'boolean') baseData.isActive = isActive
    if (parentId) baseData.parentId = parentId
    if (typeof displayOrder === 'number' && displayOrder >= 0) baseData.displayOrder = displayOrder
    if (image && image.trim()) baseData.image = image.trim()
    if (attributes && attributes.length > 0) {
        const filteredAttributes = attributes.filter(attr => attr && attr.trim() !== '')
        if (filteredAttributes.length > 0) baseData.attributes = filteredAttributes
    }

    return baseData
}

/**
 * Transform API data to form format
 */
export function apiToFormData(apiData: CategoryWithId): CategoryFormInput {
    const {
        id,
        _id,
        name,
        slug,
        isActive,
        parentId,
        displayOrder,
        image,
        attributes
    } = apiData as any
    
    return {
        id: id || _id, // Use id if available, fallback to _id
        name: name || '',
        slug: slug || '',
        isActive: isActive !== false, // Default to true
        parentId: parentId || null,
        displayOrder: displayOrder || 0,
        image: image || '',
        attributes: attributes || []
    }
}

/**
 * Validate if form data is ready for submission
 */
export function validateFormForSubmission(formData: CategoryFormInput): {
    isValid: boolean
    errors: string[]
} {
    const errors: string[] = []

    if (!formData.name.trim()) {
        errors.push('Category name is required')
    }

    if (formData.displayOrder < 1) {
        errors.push('Display order must be at least 1')
    }

    return {
        isValid: errors.length === 0,
        errors
    }
}

/**
 * Get category level from parentId
 */
export function getCategoryLevel(parentId: string | null, parentCategories: CategoryWithId[]): number {
    if (!parentId) return 1 // Root level
    
    const parent = parentCategories.find(cat => cat.id === parentId)
    return parent ? parent.level + 1 : 2 // Default to level 2 if parent not found
}

/**
 * Build category breadcrumb path
 */
export function buildCategoryPath(category: CategoryWithId, allCategories: CategoryWithId[]): string {
    if (!category.parentId) return category.name
    
    const parent = allCategories.find(cat => cat.id === category.parentId)
    if (!parent) return category.name
    
    return `${buildCategoryPath(parent, allCategories)} > ${category.name}`
}
