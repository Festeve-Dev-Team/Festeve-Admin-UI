import { z } from 'zod'
import { istNow, toIST, dedupeBy } from '../utils/time'

export const linkedProductSchema = z.object({
    productId: z.string().min(1),
    relation: z.string().min(1),
})

export const specialOfferSchema = z.object({
    offerType: z.string().min(1),
    productId: z.string().min(1),
})

export const recurringSchema = z.object({
    isRecurring: z.boolean().default(false),
    frequency: z.enum(['daily', 'weekly', 'monthly', 'yearly']).optional(),
    daysOfWeek: z.array(z.number().int().min(0).max(6)).optional().default([]),
})

export const eventSchema = z
    .object({
        id: z.string().optional(),
        name: z.string().min(3).max(120),
        description: z.string().max(1000).optional().default(''),
        type: z.string().min(1),
        date: z.string(),
        recurring: recurringSchema,
        linkedProducts: z.array(linkedProductSchema).default([]),
        purohitRequired: z.boolean().default(false),
        ritualNotes: z.string().optional().default(''),
        region: z.string().optional().default(''),
        regions: z.array(z.string()).default([]),
        specialOffers: z.array(specialOfferSchema).default([]),
        productIds: z.array(z.string().min(1)).max(10000).default([]), // General product associations
        extraData: z.record(z.unknown()).default({}),
    })
    .superRefine((data, ctx) => {
        // Date warning if past vs IST - but don't fail validation
        const date = new Date(data.date)
        const now = new Date()
        const isPast = date < now
        if (isPast) {
            // Log warning but don't add validation issue that blocks form submission
            console.warn('⚠️ Date appears to be in the past:', data.date)
        }

        // Recurring constraints
        if (data.recurring.isRecurring) {
            if (!data.recurring.frequency) {
                ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['recurring', 'frequency'], message: 'Frequency is required' })
            }
            if (data.recurring.frequency === 'weekly') {
                if (!data.recurring.daysOfWeek || data.recurring.daysOfWeek.length < 1) {
                    ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['recurring', 'daysOfWeek'], message: 'Select at least 1 day' })
                }
            }
        }

        // linkedProducts dedupe by productId+relation
        data.linkedProducts = dedupeBy(data.linkedProducts, (p) => `${p.productId}|${p.relation}`)

        // productIds dedupe
        data.productIds = Array.from(new Set(data.productIds.filter(Boolean)))

        // regions dedupe case-insensitively
        data.regions = Array.from(new Map(data.regions.map((r) => [r.toLowerCase(), r])).values())
    })

export type EventFormInput = z.infer<typeof eventSchema>

export const defaultEventValues: EventFormInput = {
    name: 'Diwali Festival',
    description: 'Festival of lights celebration',
    type: 'daily',
    date: new Date('2025-08-11T18:06:49.152Z').toISOString(),
    recurring: { isRecurring: false, frequency: 'daily', daysOfWeek: [0] },
    linkedProducts: [{ productId: '64b7f1c2a9d4e5f6b7c8d9e0', relation: 'poojaKit' }],
    purohitRequired: false,
    ritualNotes: 'Light diyas at sunset; family puja at 7 PM',
    region: 'IN',
    regions: ['IN-MH', 'IN-TG'],
    specialOffers: [{ offerType: 'exclusive_offer', productId: '64b7f1c2a9d4e5f6b7c8d9e1' }],
    productIds: [], // General product associations
    extraData: {
        theme: 'Lakshmi Puja',
        dressCode: 'Traditional'
    },
}



