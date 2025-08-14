import { z } from 'zod'
import { dedupeCaseInsensitive, isURL, normalizePositions } from '../utils'

const sectionSchema = z.object({
    key: z.string().min(1),
    enabled: z.boolean(),
    title: z.string().max(120).optional().or(z.literal('')),
    description: z.string().max(500).optional().or(z.literal('')),
    imageUrl: z.string().optional().refine((v) => !v || isURL(v), 'Invalid URL'),
    productId: z.string().optional().or(z.literal('')),
    eventId: z.string().optional().or(z.literal('')),
})

const bannerSchema = z.object({
    title: z.string().max(120).optional().or(z.literal('')),
    description: z.string().max(300).optional().or(z.literal('')),
    imageUrl: z.string().min(1).refine((v) => isURL(v), 'Invalid URL'),
    linkUrl: z.string().optional().or(z.literal('')).refine((v) => !v || isURL(v), 'Invalid URL'),
    productId: z.string().optional().or(z.literal('')),
    eventId: z.string().optional().or(z.literal('')),
    position: z.number().int().min(0),
    isActive: z.boolean(),
})

export const homepageSchema = z
    .object({
        dailyEventId: z.string().optional().or(z.literal('')),
        homepageSections: z.array(sectionSchema).default([]),
        banners: z.array(bannerSchema).default([]),
        featuredProductIds: z.array(z.string().min(1)).max(200).default([]),
        featuredEventIds: z.array(z.string().min(1)).max(200).default([]),
        manuallyCuratedTrending: z.array(z.string().min(1)).max(200).default([]),
        customSections: z.record(z.unknown()).default({}),
    })
    .superRefine((data, ctx) => {
        // Section unique key + content rule when enabled
        const keySet = new Set<string>()
        data.homepageSections.forEach((s, i) => {
            const key = s.key.toLowerCase()
            if (keySet.has(key)) ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['homepageSections', i, 'key'], message: 'Duplicate key' })
            keySet.add(key)
            if (s.enabled && !((s.productId && s.productId.length) || (s.eventId && s.eventId.length))) {
                ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['homepageSections', i], message: 'Provide productId or eventId when enabled' })
            }
        })

        // Banners target rule
        data.banners.forEach((b, i) => {
            const hasTarget = Boolean((b.linkUrl && b.linkUrl.length) || (b.productId && b.productId.length) || (b.eventId && b.eventId.length))
            if (b.isActive && !hasTarget) ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['banners', i], message: 'Active banner requires at least one target' })
        })

        // Normalize positions uniqueness
        data.banners = normalizePositions(data.banners)

        // Dedupe arrays
        data.featuredProductIds = dedupeCaseInsensitive(data.featuredProductIds)
        data.featuredEventIds = dedupeCaseInsensitive(data.featuredEventIds)
        data.manuallyCuratedTrending = dedupeCaseInsensitive(data.manuallyCuratedTrending)
    })

export type HomepageFormInput = z.infer<typeof homepageSchema>

export const defaultHomepageValues: HomepageFormInput = {
    dailyEventId: 'evt_1',
    homepageSections: [
        { key: 'whatsToday', enabled: true, title: 'What\'s Today', description: 'Today\'s highlight', imageUrl: '', productId: '', eventId: 'evt_1' },
    ],
    banners: [
        { title: 'Festive', description: 'Don\'t miss', imageUrl: 'https://via.placeholder.com/600x300', linkUrl: '', productId: 'prod_1', eventId: '', position: 0, isActive: true },
    ],
    featuredProductIds: ['prod_1', 'prod_2'],
    featuredEventIds: ['evt_2'],
    manuallyCuratedTrending: ['prod_3'],
    customSections: {},
}



