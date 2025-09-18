import { z } from 'zod'

export const discountTypeEnum = z.enum(['none', 'percentage', 'fixed'])

export const productSizeEnum = z.enum([
    'XS', 'S', 'M', 'L', 'XL', 'XXL', 'XXXL', '2XL', '3XL', '4XL', '5XL',
    '28', '30', '32', '34', '36', '38', '40', '42', '44', '46', '48', '50',
    'Free Size', 'One Size', 'Custom'
])

export const dimensionsSchema = z.object({
    length: z.number().min(0).optional(),
    width: z.number().min(0).optional(),
    height: z.number().min(0).optional(),
    unit: z.enum(['cm', 'inch', 'mm']).optional(),
}).optional()

export const variantSchema = z.object({
    sku: z.string().optional(),
    specs: z.record(z.union([z.string(), z.number(), z.boolean()])).default({}),
    price: z.number({ invalid_type_error: 'Price must be a number' }).min(0).optional(),
    stock: z.number({ invalid_type_error: 'Stock must be a number' }).int().min(0).optional(),
    discountType: discountTypeEnum.optional(),
    discountValue: z
        .number({ invalid_type_error: 'Discount must be a number' })
        .min(0)
        .optional(),
    images: z.array(z.string()).default([]),
    isActive: z.boolean().default(true),
    // New fields matching the schema
    size: productSizeEnum.optional(),
    color: z.string().optional(),
    colorCode: z.string().regex(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, 'Color code must be a valid hex color').optional(),
    colorFamily: z.string().optional(),
    material: z.string().optional(),
    weight: z.number().min(0, 'Weight must be positive').optional(),
    dimensions: dimensionsSchema,
    // Downloadable product fields
    isDownloadable: z.boolean().default(false),
    downloadUrl: z.string().url('Download URL must be a valid URL').optional(),
}).superRefine((variant, ctx) => {
    if (variant.discountType === 'percentage' && variant.discountValue !== undefined) {
        if (variant.discountValue < 0 || variant.discountValue > 100) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                path: ['discountValue'],
                message: 'Percentage discount must be between 0 and 100',
            })
        }
    }
    if (variant.discountType === 'fixed' && variant.discountValue !== undefined && variant.price !== undefined) {
        if (variant.discountValue >= variant.price) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                path: ['discountValue'],
                message: 'Fixed discount must be less than price',
            })
        }
    }
    // Validate downloadable product requirements
    if (variant.isDownloadable && !variant.downloadUrl) {
        ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ['downloadUrl'],
            message: 'Download URL is required for downloadable products',
        })
    }
})

export const offerTypeEnum = z.enum([
    'exclusive_offer',
    'flash_sale',
    'best_deal',
])

export const productSchema = z
    .object({
        id: z.string().optional(), // For editing existing products
        name: z.string().min(1, 'Name is required').max(120, 'Name must be less than 120 characters'),
        description: z.string().optional(),
        category: z.string().optional(), // Made optional to match DTO
        tags: z.array(z.string()).default([]),
        isHotItem: z.boolean().default(false),
        ingredients: z.array(z.string()).default([]),
        vendors: z.array(z.string()).default([]),
        variants: z.array(variantSchema).default([]), // Made optional with default empty array
        defaultDiscountType: discountTypeEnum.default('none'),
        defaultDiscountValue: z.number().min(0).default(0),
        linkedEvents: z.array(z.string()).default([]),
        offerType: offerTypeEnum.optional(),
        offerStart: z.string().optional(),
        offerEnd: z.string().optional(),
        isTrending: z.boolean().default(false),
        meta: z
            .object({
                title: z.string().optional(),
                description: z.string().optional(),
                keywords: z.array(z.string()).optional(),
            })
            .catchall(z.unknown())
            .default({}),
    })
    .superRefine((data, ctx) => {
        if (data.offerStart && data.offerEnd) {
            const start = new Date(data.offerStart).getTime()
            const end = new Date(data.offerEnd).getTime()
            if (!Number.isNaN(start) && !Number.isNaN(end) && start > end) {
                ctx.addIssue({
                    code: z.ZodIssueCode.custom,
                    path: ['offerEnd'],
                    message: 'Offer end must be after start',
                })
            }
        }

        // Validate SKU uniqueness only if variants exist and have valid SKUs
        if (data.variants && data.variants.length > 0) {
            const skuSet = new Set<string>()
            data.variants.forEach((v, idx) => {
                if (v && v.sku && v.sku.trim()) {
                    if (skuSet.has(v.sku)) {
                        ctx.addIssue({
                            code: z.ZodIssueCode.custom,
                            path: ['variants', idx, 'sku'],
                            message: 'SKU must be unique',
                        })
                    }
                    skuSet.add(v.sku)
                }
            })
        }
    })

export type ProductFormInput = z.infer<typeof productSchema>
export type VariantFormInput = z.infer<typeof variantSchema>

export const defaultProductValues: ProductFormInput = {
    name: '',
    description: '',
    category: '',
    tags: [],
    isHotItem: false,
    ingredients: [],
    vendors: [],
    variants: [
        {
            sku: '',
            specs: {},
            price: 0,
            stock: 0,
            discountType: 'none',
            discountValue: 0,
            images: [],
            isActive: true,
            size: 'Custom',
            color: '',
            colorCode: '#FFFFFF',
            colorFamily: '',
            material: '',
            weight: 0,
            dimensions: {
                length: 0,
                width: 0,
                height: 0,
                unit: 'cm'
            },
            isDownloadable: false,
            downloadUrl: '',
        }
    ],
    defaultDiscountType: 'none',
    defaultDiscountValue: 0,
    linkedEvents: [],
    offerType: 'exclusive_offer',
    offerStart: '',
    offerEnd: '',
    isTrending: false,
    meta: {},
}

// Sample data for testing/demo
export const sampleProductValues: ProductFormInput = {
    name: 'Divine Puja Kit',
    description: 'Complete puja kit for home worship',
    category: 'puja-items',
    tags: ['diwali-sweet', 'sankranthi-snack'],
    isHotItem: false,
    ingredients: ['milk', 'sugar', 'cardamom'],
    vendors: [],
    variants: [
        {
            sku: 'DPK-001',
            specs: { packaging: 'box' },
            price: 299,
            stock: 50,
            discountType: 'percentage',
            discountValue: 10,
            images: ['https://example.com/images/divine-puja-kit.jpg'],
            isActive: true,
            size: 'M',
            color: 'Gold',
            colorCode: '#FFD700',
            colorFamily: 'Gold',
            material: 'Brass',
            weight: 500,
            dimensions: {
                length: 15,
                width: 10,
                height: 5,
                unit: 'cm'
            },
        },
    ],
    defaultDiscountType: 'percentage',
    defaultDiscountValue: 5,
    linkedEvents: [],
    offerType: 'exclusive_offer',
    offerStart: new Date('2025-08-11T14:57:03.930Z').toISOString(),
    offerEnd: new Date('2025-08-15T14:57:03.930Z').toISOString(),
    isTrending: true,
    meta: {
        title: 'Divine Puja Kit',
        description: 'Complete puja kit for home worship',
        keywords: ['puja', 'divine', 'kit'],
        festival: 'Diwali',
        shippingTime: '2-3 days'
    },
}


