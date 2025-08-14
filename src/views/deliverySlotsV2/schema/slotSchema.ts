import { z } from 'zod'
import { slotDurationMinutes } from '../utils'

export const slotSchema = z
    .object({
        startTime: z.string(),
        endTime: z.string(),
        maxOrders: z.number().int().min(1),
        currentOrders: z.number().int().min(0),
        isActive: z.boolean().default(true),
        description: z.string().max(300).optional().or(z.literal('')),
    })
    .superRefine((data, ctx) => {
        const s = new Date(data.startTime).getTime()
        const e = new Date(data.endTime).getTime()
        if (!(e > s)) ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['endTime'], message: 'End must be after start' })
        if (data.currentOrders > data.maxOrders) ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['currentOrders'], message: 'Cannot exceed maxOrders' })
        const dur = slotDurationMinutes(data.startTime, data.endTime)
        if (dur > 12 * 60) ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['endTime'], message: 'Duration exceeds 12 hours' })
    })

export type SlotFormInput = z.infer<typeof slotSchema>

export const defaultSlotValues: SlotFormInput = {
    startTime: new Date('2025-08-10T13:38:47.233Z').toISOString(),
    endTime: new Date('2025-08-10T14:38:47.233Z').toISOString(),
    maxOrders: 10,
    currentOrders: 0,
    isActive: true,
    description: '',
}



