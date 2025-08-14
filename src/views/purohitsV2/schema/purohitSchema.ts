import { z } from 'zod'
import { istNow, parseTimeSlot, toIST } from '../utils/time'

const phoneRegex = /^\+91\d{10}$/
const pinRegex = /^\d{6}$/

export const commissionTypeEnum = z.enum(['percentage', 'fixed'])

export const availabilitySchema = z.object({
    date: z.string(),
    timeSlots: z.array(z.string()).min(1, 'At least one time slot required'),
})

export const purohitSchema = z
    .object({
        name: z.string().min(3).max(120),
        phone: z.string().regex(phoneRegex, 'Must start with +91 and have 10 digits'),
        location: z.object({
            city: z.string().optional().default(''),
            state: z.string().optional().default(''),
            pincode: z.string().regex(pinRegex, 'PIN must be 6 digits').optional().or(z.literal('')).default(''),
        }),
        experienceYears: z.number().int().min(0).max(60),
        skills: z.array(z.string()).max(50).default([]),
        availability: z.array(availabilitySchema).default([]),
        bio: z.string().max(500).default(''),
        customSkills: z.record(z.union([z.string(), z.number()])).default({}),
        rituals: z.array(z.string()).max(50).default([]),
        languages: z.array(z.string().min(2).max(5)).min(1, 'Select at least one language'),
        chargesCommission: z.boolean().default(false),
        commissionType: commissionTypeEnum.default('percentage'),
        commissionValue: z.number().min(0).default(0),
        isActive: z.boolean().default(true),
    })
    .superRefine((data, ctx) => {
        // pincode city/state dependency
        if (data.location.pincode && (!data.location.city || !data.location.state)) {
            ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['location'], message: 'City and State required when PIN is present' })
        }

        // Dedupe skills & rituals case-insensitively
        const dedupe = (arr: string[]) => Array.from(new Map(arr.map((s) => [s.toLowerCase(), s])).values())
        data.skills = dedupe(data.skills)
        data.rituals = dedupe(data.rituals)

        // Availability validations
        const todayIST = new Date(istNow().toDateString())
        data.availability.forEach((a, idx) => {
            const d = new Date(a.date)
            const dIST = toIST(d)
            const midnightIST = new Date(dIST.getFullYear(), dIST.getMonth(), dIST.getDate())
            if (midnightIST < todayIST) {
                ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['availability', idx, 'date'], message: 'Date cannot be in the past' })
            }
            // timeSlots format and range 5:00–22:00
            const mins = a.timeSlots.map((t) => parseTimeSlot(t))
            if (mins.some((m) => Number.isNaN(m))) {
                ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['availability', idx, 'timeSlots'], message: 'Invalid time slot format' })
            }
            const inRange = mins.every((m) => m >= 5 * 60 && m <= 22 * 60)
            if (!inRange) {
                ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['availability', idx, 'timeSlots'], message: 'Slots must be within 5:00 AM – 10:00 PM' })
            }
            // No overlaps
            const sorted = mins.slice().sort((a, b) => a - b)
            for (let i = 1; i < sorted.length; i++) {
                if (sorted[i] === sorted[i - 1]) {
                    ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['availability', idx, 'timeSlots'], message: 'Overlapping time slots' })
                    break
                }
            }
        })

        // Commission
        if (data.chargesCommission) {
            if (data.commissionType === 'percentage') {
                if (data.commissionValue < 0 || data.commissionValue > 100) {
                    ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['commissionValue'], message: 'Percentage must be 0–100' })
                }
            }
            if (data.commissionType === 'fixed') {
                if (!(data.commissionValue > 0)) {
                    ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['commissionValue'], message: 'Fixed commission must be > 0' })
                }
            }
        }
    })

export type PurohitFormInput = z.infer<typeof purohitSchema>

export const defaultPurohitValues: PurohitFormInput = {
    name: 'Pandit Ravi Sharma',
    phone: '+911234567890',
    location: { city: 'Mumbai', state: 'Maharashtra', pincode: '400001' },
    experienceYears: 15,
    skills: ['Ganesha Puja', 'Wedding Ceremonies', 'Housewarming'],
    availability: [
        { date: new Date('2025-08-10T13:15:12.940Z').toISOString(), timeSlots: ['9:00 AM', '11:00 AM', '2:00 PM'] },
    ],
    bio: 'Experienced in traditional Vedic rituals',
    customSkills: {},
    rituals: ['Ganesh Puja', 'Navagraha Homam', 'Satyanarayan Puja'],
    languages: ['en', 'hi', 'te', 'mr'],
    chargesCommission: false,
    commissionType: 'percentage',
    commissionValue: 0,
    isActive: true,
}


