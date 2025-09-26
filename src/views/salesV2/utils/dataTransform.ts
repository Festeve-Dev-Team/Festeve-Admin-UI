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
            stock: Math.max(0, variant.stock || 0), // Ensure stock is not negative
            images: variant.images,
            isActive: variant.isActive,
            size: variant.size,
            color: variant.color,
            colorCode: variant.colorCode,
            colorFamily: variant.colorFamily,
            material: variant.material,
            dimensions: variant.dimensions,
            isDownloadable: variant.isDownloadable,
            downloadUrl: variant.downloadUrl
        }
        
        // Only include price if it's positive (greater than 0)
        if (variant.price && variant.price > 0) {
            cleanVariant.price = variant.price
        }
        
        // Only include weight if it's positive
        if (variant.weight && variant.weight > 0) {
            cleanVariant.weight = variant.weight
        }
        
        // Only include discountType and discountValue if discountType is not 'none'
        if (variant.discountType && variant.discountType !== 'none') {
            cleanVariant.discountType = variant.discountType
            if (variant.discountValue && variant.discountValue > 0) {
                cleanVariant.discountValue = variant.discountValue
            }
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

    // Only include fields that are allowed by the UpdateProductDto
    const baseData: any = {}
    
    // Helper function to filter out empty strings from arrays
    const filterEmptyStrings = (arr: string[]) => arr.filter(item => item && item.trim() !== '')
    
    // Required/optional fields from UpdateProductDto
    if (name) baseData.name = name
    if (description) baseData.description = description
    if (category) baseData.categoryId = category  // Use categoryId as per DTO
    
    // Only include arrays if they have non-empty values
    if (tags && tags.length > 0) {
        const filteredTags = filterEmptyStrings(tags)
        if (filteredTags.length > 0) baseData.tags = filteredTags
    }
    
    if (typeof isHotItem === 'boolean') baseData.isHotItem = isHotItem
    
    if (ingredients && ingredients.length > 0) {
        const filteredIngredients = filterEmptyStrings(ingredients)
        if (filteredIngredients.length > 0) baseData.ingredients = filteredIngredients
    }
    
    if (vendors && vendors.length > 0) {
        const filteredVendors = filterEmptyStrings(vendors)
        if (filteredVendors.length > 0) baseData.vendors = filteredVendors
    }
    
    if (transformedVariants && transformedVariants.length > 0) baseData.variants = transformedVariants
    if (defaultDiscountType && defaultDiscountType !== 'none') baseData.defaultDiscountType = defaultDiscountType
    if (typeof defaultDiscountValue === 'number' && defaultDiscountValue > 0) baseData.defaultDiscountValue = defaultDiscountValue // Only include if positive
    
    if (linkedEvents && linkedEvents.length > 0) {
        const filteredEvents = filterEmptyStrings(linkedEvents)
        if (filteredEvents.length > 0) baseData.linkedEvents = filteredEvents
    }
    
    if (offerType) baseData.offerType = offerType
    if (offerStart) baseData.offerStart = new Date(offerStart).toISOString()
    if (offerEnd) baseData.offerEnd = new Date(offerEnd).toISOString()
    if (typeof isTrending === 'boolean') baseData.isTrending = isTrending
    if (transformedMeta && Object.keys(transformedMeta).length > 0) baseData.meta = transformedMeta

    // For editing existing products, return the clean data WITHOUT _id or id fields
    // The API service will handle the URL routing using the ID
    return baseData
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
        assignedCategoryId, // New field from API
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
        dimensions: variant.dimensions,
        isDownloadable: variant.isDownloadable || false,
        downloadUrl: variant.downloadUrl || ''
    }))

    return {
        id: ('id' in apiData) ? apiData.id : _id,
        name: name || '',
        description: description || '',
        category: assignedCategoryId || categoryId || category || '', // Priority: assignedCategoryId > categoryId > category
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
