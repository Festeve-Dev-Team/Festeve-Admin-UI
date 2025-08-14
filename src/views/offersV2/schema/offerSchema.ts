import { z } from 'zod'
import { dedupeBy, istNow } from '../utils'

export const comboItemSchema = z.object({ productId: z.string().min(1), quantity: z.number().int().min(1) })

export const offerSchema = z
    .object({
        title: z.string().min(3).max(120),
        description: z.string().max(500).optional().default(''),
        type: z.enum(['percentage_discount', 'fixed_discount', 'bogo', 'combo_bundle']),
        discountType: z.enum(['percentage', 'fixed']),
        discountValue: z.number().min(0).default(0),
        comboItems: z.array(comboItemSchema).default([]),
        appliesTo: z.enum(['product', 'category', 'event', 'all']),
        targetIds: z.array(z.string()).default([]),
        minGroupSize: z.number().int().min(1).default(1),
        maxGroupSize: z.number().int().min(1).default(1),
        startDate: z.string(),
        endDate: z.string(),
        combinable: z.boolean().default(false),
        conditions: z.record(z.unknown()).default({}),
    })
    .superRefine((data, ctx) => {
        // Pairings
        if (data.type === 'percentage_discount' && data.discountType !== 'percentage') {
            ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['discountType'], message: 'Must be percentage for percentage_discount' })
        }
        if (data.type === 'fixed_discount' && data.discountType !== 'fixed') {
            ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['discountType'], message: 'Must be fixed for fixed_discount' })
        }
        if (data.discountType === 'percentage' && (data.discountValue < 1 || data.discountValue > 100)) {
            ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['discountValue'], message: 'Percentage must be 1–100' })
        }
        if (data.discountType === 'fixed' && !(data.discountValue > 0)) {
            ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['discountValue'], message: 'Fixed discount must be > 0' })
        }
        if ((data.type === 'bogo' || data.type === 'combo_bundle') && data.comboItems.length < 1) {
            ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['comboItems'], message: 'At least one combo item required' })
        }

        // Target rules
        if (data.appliesTo !== 'all' && data.targetIds.length === 0) {
            ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['targetIds'], message: 'Provide at least one target' })
        }
        if (data.appliesTo === 'all' && data.targetIds.length > 0) {
            ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['targetIds'], message: 'Targets must be empty when appliesTo=all' })
        }
        data.targetIds = Array.from(new Map(data.targetIds.map((t) => [t.toLowerCase(), t])).values())

        // Schedule
        const s = new Date(data.startDate).getTime()
        const e = new Date(data.endDate).getTime()
        if (s > e) {
            ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['endDate'], message: 'End must be after start' })
        }
        const now = istNow().getTime()
        if (e < now) {
            ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['endDate'], message: 'Offer already ended (IST)', fatal: false })
        }

        if (data.maxGroupSize < data.minGroupSize) {
            ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['maxGroupSize'], message: 'Max must be ≥ Min' })
        }
    })

export type OfferFormInput = z.infer<typeof offerSchema>

export const defaultOfferValues: OfferFormInput = {
    title: 'Festival Special',
    description: 'Get 20% off on all products',
    type: 'percentage_discount',
    discountType: 'percentage',
    discountValue: 20,
    comboItems: [],
    appliesTo: 'product',
    targetIds: ['prod_1'],
    minGroupSize: 1,
    maxGroupSize: 1,
    startDate: new Date('2025-08-10T13:32:43.600Z').toISOString(),
    endDate: new Date('2025-08-10T13:32:43.600Z').toISOString(),
    combinable: false,
    conditions: {},
}



