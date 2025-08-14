import { z } from 'zod'
import { combineDateAndTime, inFutureIST, istNow } from '../utils/time'

const addressSchema = z.object({
    label: z.string().max(60).optional().or(z.literal('')),
    line1: z.string().min(1).max(120),
    line2: z.string().max(120).optional().or(z.literal('')),
    city: z.string().min(1),
    state: z.string().min(1),
    pincode: z.string().min(3),
    country: z.string().min(1),
    isDefault: z.boolean().default(false),
})

export const bookingSchema = z
    .object({
        purohitId: z.string().min(1),
        eventId: z.string().min(1),
        date: z.string(),
        timeSlot: z.string().regex(/^(0?[1-9]|1[0-2]):[0-5][0-9]\s?(AM|PM)$/i, 'Invalid time'),
        amount: z.number().min(0),
        isGroupBooking: z.boolean().default(false),
        groupSize: z.number().int().min(2).max(10000).optional(),
        groupOfferId: z.string().optional().or(z.literal('')),
        address: addressSchema,
        extraNotes: z.record(z.unknown()).default({}),
    })
    .superRefine((data, ctx) => {
        const combined = combineDateAndTime(data.date, data.timeSlot)
        if (!inFutureIST(combined)) ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['timeSlot'], message: 'Must be in the future' })

        // country-based PIN
        if (data.address.country.toLowerCase() === 'india') {
            if (!/^\d{6}$/.test(data.address.pincode)) {
                ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['address', 'pincode'], message: 'PIN must be 6 digits' })
            }
        }

        if (!data.isGroupBooking) {
            data.groupSize = undefined
            data.groupOfferId = undefined
        }
    })

export type BookingFormInput = z.infer<typeof bookingSchema>

export const defaultBookingValues: BookingFormInput = {
    purohitId: 'pu_1',
    eventId: 'ev_1',
    date: new Date('2025-08-10T13:31:20.443Z').toISOString(),
    timeSlot: '10:00 AM',
    amount: 0,
    isGroupBooking: false,
    groupSize: 50,
    groupOfferId: '',
    address: { label: 'Home', line1: '123 Street', line2: '', city: 'Mumbai', state: 'MH', pincode: '400001', country: 'India', isDefault: true },
    extraNotes: {},
}



