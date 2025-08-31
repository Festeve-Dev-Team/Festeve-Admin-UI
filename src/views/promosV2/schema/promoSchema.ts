import { z } from 'zod'

export const promoSchema = z
    .object({
        id: z.string().optional(),
        name: z.string().min(3).max(120),
        code: z.string().min(3).max(50),
        status: z.enum(['ACTIVE', 'PAUSED', 'EXPIRED', 'ARCHIVED']).optional().default('ACTIVE'),
        startsAt: z.string().optional().default(''),
        endsAt: z.string().optional().default(''),
        globalLimit: z.number().min(0).optional(),
        perUserLimit: z.number().min(0).optional(),
        productIds: z.array(z.string().min(1)).max(10000).default([]),
        linkTTLSeconds: z.number().min(0).optional(),
        tags: z.array(z.string()).default([]),
        notes: z.string().max(2000).optional().default(''),
    })
    .superRefine((data, ctx) => {
        // Date validation
        if (data.startsAt && data.endsAt) {
            const startDate = new Date(data.startsAt)
            const endDate = new Date(data.endsAt)
            
            if (isNaN(startDate.getTime()) && data.startsAt.trim() !== '') {
                ctx.addIssue({ 
                    code: z.ZodIssueCode.custom, 
                    path: ['startsAt'], 
                    message: 'Invalid start date format' 
                })
            }
            
            if (isNaN(endDate.getTime()) && data.endsAt.trim() !== '') {
                ctx.addIssue({ 
                    code: z.ZodIssueCode.custom, 
                    path: ['endsAt'], 
                    message: 'Invalid end date format' 
                })
            }
            
            if (!isNaN(startDate.getTime()) && !isNaN(endDate.getTime()) && startDate >= endDate) {
                ctx.addIssue({ 
                    code: z.ZodIssueCode.custom, 
                    path: ['endsAt'], 
                    message: 'End date must be after start date' 
                })
            }
        }

        // Code validation - must be unique and alphanumeric
        if (data.code && !/^[A-Z0-9_-]+$/i.test(data.code)) {
            ctx.addIssue({ 
                code: z.ZodIssueCode.custom, 
                path: ['code'], 
                message: 'Code can only contain letters, numbers, hyphens and underscores' 
            })
        }

        // Limits validation
        if (data.globalLimit && data.perUserLimit && data.perUserLimit > data.globalLimit) {
            ctx.addIssue({ 
                code: z.ZodIssueCode.custom, 
                path: ['perUserLimit'], 
                message: 'Per user limit cannot exceed global limit' 
            })
        }

        // productIds dedupe
        data.productIds = Array.from(new Set(data.productIds.filter(Boolean)))

        // tags dedupe case-insensitively
        data.tags = Array.from(new Map(data.tags.map((t) => [t.toLowerCase(), t])).values())
    })

export type PromoFormInput = z.infer<typeof promoSchema>

export const defaultPromoValues: PromoFormInput = {
    name: '',
    code: '',
    status: 'ACTIVE',
    startsAt: '',
    endsAt: '',
    globalLimit: undefined,
    perUserLimit: undefined,
    productIds: [],
    linkTTLSeconds: undefined,
    tags: [],
    notes: '',
}
