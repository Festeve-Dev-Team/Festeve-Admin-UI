import type { CategoryFormInput } from '../schema/categorySchema'
import type { CategoryWithId, CategoryDto } from '../types/category'

/**
 * Transform form data to API format
 */
export function formToApiData(formData: CategoryFormInput): CategoryDto {
    const {
        name,
        isActive,
        parentId,
        displayOrder,
        attributes
    } = formData

    return {
        name,
        isActive,
        parentId: parentId || null, // Ensure null instead of undefined
        displayOrder,
        attributes
    }
}

/**
 * Transform API data to form format
 */
export function apiToFormData(apiData: CategoryWithId): CategoryFormInput {
    const {
        id,
        name,
        isActive,
        parentId,
        displayOrder,
        attributes
    } = apiData

    return {
        id,
        name,
        isActive,
        parentId,
        displayOrder,
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
