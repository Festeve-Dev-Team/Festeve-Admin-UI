import { z } from 'zod'
import { isISO4217 } from '../utils'

export const paymentSchema = z
    .object({
        relatedTo: z.string().min(1),
        referenceId: z.string().min(1).max(120),
        amount: z.number().min(0),
        currency: z.string().default('INR').refine((c) => isISO4217(c.toUpperCase()), 'Invalid currency'),
        provider: z.string().min(1),
        method: z.string().min(1),
        transactionId: z.string().max(120).optional().or(z.literal('')),
        paymentIntentId: z.string().max(120).optional().or(z.literal('')),
        note: z.string().max(300).optional().or(z.literal('')),
    })
    .superRefine((data, ctx) => {
        if (data.provider.toLowerCase() === 'stripe' && !data.paymentIntentId) {
            ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['paymentIntentId'], message: 'Required for stripe' })
        }
        if (data.provider.toLowerCase() === 'razorpay' && data.method.toUpperCase() === 'UPI' && !data.transactionId) {
            ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['transactionId'], message: 'Required for Razorpay UPI' })
        }
        if (data.amount === 0 && data.method.toUpperCase() !== 'COD') {
            ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['amount'], message: 'Zero amount not allowed for this method' })
        }
    })

export type PaymentFormInput = z.infer<typeof paymentSchema>

export const defaultPaymentValues: PaymentFormInput = {
    relatedTo: 'order',
    referenceId: 'ORD_001',
    amount: 0,
    currency: 'INR',
    provider: 'razorpay',
    method: 'UPI',
    transactionId: '',
    paymentIntentId: '',
    note: '',
}



