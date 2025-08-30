import type { ProductFormInput } from '../schema/productSchema'
import type { ProductWithId, Product } from '../types/product'

/**
 * Transform form data to API format
 */
export function formToApiData(formData: ProductFormInput): Omit<Product, '_id'> | ProductWithId {
    const {
        id,
        name,
        description,
        category,
        tags,
        isHotItem,
        ingredients,
        vendors,
        variants,
        defaultDiscountType,
        defaultDiscountValue,
        linkedEvents,
        offerType,
        offerStart,
        offerEnd,
        isTrending,
        meta
    } = formData

    // Transform variants to match API format (exclude auto-generated fields)
    const transformedVariants = variants.map(variant => {
        const cleanVariant: any = {
            sku: variant.sku,
            specs: variant.specs,
            price: variant.price,
            stock: variant.stock,
            images: variant.images,
            isActive: variant.isActive,
            size: variant.size,
            color: variant.color,
            colorCode: variant.colorCode,
            colorFamily: variant.colorFamily,
            material: variant.material,
            weight: variant.weight,
            dimensions: variant.dimensions
        }
        
        // Only include discountType and discountValue if discountType is not 'none'
        if (variant.discountType && variant.discountType !== 'none') {
            cleanVariant.discountType = variant.discountType
            cleanVariant.discountValue = variant.discountValue
        }
        
        // Remove undefined values
        Object.keys(cleanVariant).forEach(key => {
            if (cleanVariant[key] === undefined) {
                delete cleanVariant[key]
            }
        })
        
        return cleanVariant
    })

    // Transform meta object to handle keywords array properly
    const transformedMeta = { ...meta }
    if (transformedMeta && typeof transformedMeta === 'object') {
        // If keywords is an array with valid entries, keep it; otherwise, remove it
        if (Array.isArray(transformedMeta.keywords)) {
            const validKeywords = transformedMeta.keywords.filter(k => k && typeof k === 'string' && k.trim() !== '')
            if (validKeywords.length > 0) {
                transformedMeta.keywords = validKeywords
            } else {
                delete transformedMeta.keywords
            }
        }
        // Remove any undefined or empty values
        Object.keys(transformedMeta).forEach(key => {
            if (transformedMeta[key] === undefined || transformedMeta[key] === '') {
                delete transformedMeta[key]
            }
        })
    }

    const baseData = {
        name,
        description,
        categoryId: category, // Map frontend 'category' to backend 'categoryId'
        tags,
        isHotItem,
        ingredients,
        variants: transformedVariants,
        // Don't send defaultDiscountType if it's 'none'
        ...(defaultDiscountType && defaultDiscountType !== 'none' && { defaultDiscountType }),
        defaultDiscountValue,
        linkedEvents,
        offerType: offerType || 'exclusive_offer',
        offerStart: offerStart ? new Date(offerStart).toISOString() : undefined,
        offerEnd: offerEnd ? new Date(offerEnd).toISOString() : undefined,
        isTrending,
        meta: transformedMeta
        // Removed: createdAt, updatedAt, __v - backend will handle these
    } as any

    // If editing existing product, include ID
    if (id) {
        return {
            ...baseData,
            _id: id,
            id
        } as ProductWithId
    }

    return baseData as Omit<Product, '_id'>
}

/**
 * Transform API data to form format
 */
export function apiToFormData(apiData: ProductWithId | Product): ProductFormInput {
    const {
        _id,
        name,
        description,
        category,
        categoryId,
        tags,
        isHotItem,
        ingredients,
        vendors,
        variants,
        defaultDiscountType,
        defaultDiscountValue,
        linkedEvents,
        offerType,
        offerStart,
        offerEnd,
        isTrending,
        meta
    } = apiData as any // Use any to handle both category and categoryId

    // Transform variants to match form format
    const transformedVariants = variants.map((variant: any) => ({
        sku: variant.sku || '',
        specs: variant.specs || {},
        price: variant.price,
        stock: variant.stock,
        discountType: variant.discountType || 'none',
        discountValue: variant.discountValue || 0,
        images: variant.images || [],
        isActive: variant.isActive !== false, // Default to true
        size: variant.size,
        color: variant.color,
        colorCode: variant.colorCode,
        colorFamily: variant.colorFamily,
        material: variant.material,
        weight: variant.weight,
        dimensions: variant.dimensions
    }))

    return {
        id: ('id' in apiData) ? apiData.id : _id,
        name,
        description,
        category: categoryId || category || '', // Use categoryId if available, fallback to category
        tags: tags || [],
        isHotItem: isHotItem || false,
        ingredients: ingredients || [],
        vendors: (vendors || []).map((v: any) => typeof v === 'string' ? v : v.toString()), // Handle ObjectId references
        variants: transformedVariants,
        defaultDiscountType: defaultDiscountType || 'none',
        defaultDiscountValue: defaultDiscountValue || 0,
        linkedEvents: (linkedEvents || []).map((e: any) => typeof e === 'string' ? e : e.toString()), // Handle ObjectId references
        offerType: offerType || 'exclusive_offer',
        offerStart: offerStart ? new Date(offerStart).toISOString() : '',
        offerEnd: offerEnd ? new Date(offerEnd).toISOString() : '',
        isTrending: isTrending || false,
        meta: meta || {}
    }
}

/**
 * Validate if form data is ready for submission
 */
export function validateFormForSubmission(formData: ProductFormInput): {
    isValid: boolean
    errors: string[]
} {
    const errors: string[] = []

    if (!formData.name.trim()) {
        errors.push('Product name is required')
    }

    // Category is optional now
    // if (!formData.category || !formData.category.trim()) {
    //     errors.push('Product category is required')
    // }

    // Variants are optional now
    // if (formData.variants.length === 0) {
    //     errors.push('At least one variant is required')
    // }

    // Validate variants only if they exist and are not null/empty
    if (formData.variants && formData.variants.length > 0) {
        formData.variants.forEach((variant, index) => {
            // Skip null or undefined variants
            if (!variant) return
            
            // Price validation only if provided
            if (variant.price !== undefined && variant.price < 0) {
                errors.push(`Variant ${index + 1}: Price cannot be negative`)
            }

            // Stock validation only if provided
            if (variant.stock !== undefined && variant.stock < 0) {
                errors.push(`Variant ${index + 1}: Stock cannot be negative`)
            }

            if (variant.discountType === 'percentage' && variant.discountValue !== undefined && (variant.discountValue < 0 || variant.discountValue > 100)) {
                errors.push(`Variant ${index + 1}: Percentage discount must be between 0 and 100`)
            }

            if (variant.discountType === 'fixed' && variant.discountValue !== undefined && variant.price !== undefined && variant.discountValue >= variant.price) {
                errors.push(`Variant ${index + 1}: Fixed discount must be less than price`)
            }
        })
    }

    // Validate offer dates
    if (formData.offerStart && formData.offerEnd) {
        const start = new Date(formData.offerStart)
        const end = new Date(formData.offerEnd)
        if (start >= end) {
            errors.push('Offer end date must be after start date')
        }
    }

    return {
        isValid: errors.length === 0,
        errors
    }
}

/**
 * Check for duplicate SKUs in variants
 */
export function validateUniqueSKUs(variants: ProductFormInput['variants']): {
    isValid: boolean
    duplicates: string[]
} {
    // If no variants or empty array, validation passes
    if (!variants || variants.length === 0) {
        return { isValid: true, duplicates: [] }
    }

    const skuCounts = new Map<string, number>()
    const duplicates: string[] = []

    variants.forEach(variant => {
        // Skip null/undefined variants
        if (!variant) return
        
        const sku = variant.sku?.trim()
        if (sku) {
            const count = skuCounts.get(sku) || 0
            skuCounts.set(sku, count + 1)
            
            if (count === 1) { // First duplicate occurrence
                duplicates.push(sku)
            }
        }
    })
    
    return {
        isValid: duplicates.length === 0,
        duplicates
    }
}
