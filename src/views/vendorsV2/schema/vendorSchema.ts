import { z } from 'zod'
import { dedupeCaseInsensitive } from '../utils'

export const vendorRatingSchema = z.object({
    userId: z.string().min(1, 'User ID is required'),
    rating: z.number().min(1, 'Rating must be at least 1').max(5, 'Rating must be at most 5'),
    review: z.string().optional(),
    createdAt: z.string().optional(), // ISO date string
})

export const vendorSchema = z
    .object({
        id: z.string().optional(), // For editing existing vendors
        name: z.string().min(3, 'Name must be at least 3 characters').max(120, 'Name must be less than 120 characters'),
        storeName: z.string().min(3, 'Store name must be at least 3 characters').max(120, 'Store name must be less than 120 characters'),
        address: z.string().optional(),
        ratings: z.array(vendorRatingSchema).default([]),
        productIds: z.array(z.string().min(1)).max(10000).default([]),
    })
    .superRefine((data, _ctx) => {
        data.productIds = dedupeCaseInsensitive(data.productIds)
    })

export type VendorFormInput = z.infer<typeof vendorSchema>
export type VendorRatingInput = z.infer<typeof vendorRatingSchema>

export const defaultVendorValues: VendorFormInput = {
    name: '',
    storeName: '',
    address: '',
    ratings: [],
    productIds: [],
}



