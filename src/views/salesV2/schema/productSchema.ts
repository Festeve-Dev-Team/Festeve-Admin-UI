import { z } from 'zod'

export const discountTypeEnum = z.enum(['none', 'percentage', 'fixed'])

export const variantSchema = z.object({
    sku: z.string().min(1, 'SKU is required'),
    specs: z.record(z.union([z.string(), z.number(), z.boolean()])).default({}),
    price: z.number({ invalid_type_error: 'Price must be a number' }).gt(0, 'Price must be greater than 0'),
    stock: z.number({ invalid_type_error: 'Stock must be a number' }).int().min(0, 'Stock cannot be negative'),
    discountType: discountTypeEnum.default('none'),
    discountValue: z
        .number({ invalid_type_error: 'Discount must be a number' })
        .min(0)
        .default(0),
    images: z.array(z.string().url('Image must be a URL')).default([]),
    isActive: z.boolean().default(true),
}).superRefine((variant, ctx) => {
    if (variant.discountType === 'percentage') {
        if (variant.discountValue < 0 || variant.discountValue > 100) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                path: ['discountValue'],
                message: 'Percentage discount must be between 0 and 100',
            })
        }
    }
    if (variant.discountType === 'fixed') {
        if (variant.discountValue >= variant.price) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                path: ['discountValue'],
                message: 'Fixed discount must be less than price',
            })
        }
    }
})

export const offerTypeEnum = z.enum([
    'exclusive_offer',
    'flash_sale',
    'bogo',
    'seasonal',
    'clearance',
])

export const productSchema = z
    .object({
        name: z.string().min(3).max(120),
        description: z.string().max(5000).optional().default(''),
        category: z.string().min(1, 'Category is required'),
        tags: z.array(z.string()).default([]),
        isHotItem: z.boolean().default(false),
        ingredients: z.array(z.string()).default([]),
        vendors: z.array(z.string()).default([]),
        variants: z.array(variantSchema).min(1, 'At least one variant required'),
        defaultDiscountType: discountTypeEnum.default('none'),
        defaultDiscountValue: z.number().min(0).default(0),
        linkedEvents: z.array(z.string()).default([]),
        offerType: offerTypeEnum.default('exclusive_offer'),
        offerStart: z.string().optional().default(''),
        offerEnd: z.string().optional().default(''),
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

        const skuSet = new Set<string>()
        data.variants.forEach((v, idx) => {
            if (skuSet.has(v.sku)) {
                ctx.addIssue({
                    code: z.ZodIssueCode.custom,
                    path: ['variants', idx, 'sku'],
                    message: 'SKU must be unique',
                })
            }
            skuSet.add(v.sku)
        })
    })

export type ProductFormInput = z.infer<typeof productSchema>
export type VariantFormInput = z.infer<typeof variantSchema>

export const defaultProductValues: ProductFormInput = {
    name: 'Divine Puja Kit',
    description: 'Complete puja kit for home worship',
    category: '',
    tags: ['diwali-sweet', 'sankranthi-snack'],
    isHotItem: false,
    ingredients: ['milk', 'sugar', 'cardamom'],
    vendors: [],
    variants: [
        {
            sku: 'DPK-BASE',
            specs: {},
            price: 0,
            stock: 0,
            discountType: 'percentage',
            discountValue: 0,
            images: [],
            isActive: true,
        },
    ],
    defaultDiscountType: 'percentage',
    defaultDiscountValue: 0,
    linkedEvents: [],
    offerType: 'exclusive_offer',
    offerStart: new Date('2025-08-10T12:42:16.398Z').toISOString(),
    offerEnd: new Date('2025-08-10T12:42:16.398Z').toISOString(),
    isTrending: true,
    meta: {
        title: 'Divine Puja Kit',
        description: 'Complete puja kit for home worship',
        keywords: ['puja', 'divine', 'kit'],
    },
}


