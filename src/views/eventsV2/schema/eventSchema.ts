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
        extraData: z.record(z.unknown()).default({}),
    })
    .superRefine((data, ctx) => {
        // Date warning if past vs IST
        const date = new Date(data.date)
        const isPast = toIST(date) < new Date(istNow().toDateString())
        if (isPast) {
            ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['date'], message: 'Date appears to be in the past (IST)', fatal: false })
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

        // regions dedupe case-insensitively
        data.regions = Array.from(new Map(data.regions.map((r) => [r.toLowerCase(), r])).values())
    })

export type EventFormInput = z.infer<typeof eventSchema>

export const defaultEventValues: EventFormInput = {
    name: 'Diwali Festival',
    description: 'Festival of lights celebration',
    type: 'daily',
    date: new Date('2025-08-10T13:15:12.929Z').toISOString(),
    recurring: { isRecurring: false, frequency: 'daily', daysOfWeek: [0] },
    linkedProducts: [{ productId: 'prod_1', relation: 'poojaKit' }],
    purohitRequired: false,
    ritualNotes: '',
    region: 'All-India',
    regions: ['Maharashtra', 'Delhi'],
    specialOffers: [{ offerType: 'exclusive_offer', productId: 'prod_1' }],
    extraData: {},
}



