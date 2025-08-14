import { z } from 'zod'
import { dedupeCaseInsensitive } from '../utils'

export const vendorSchema = z
    .object({
        name: z.string().min(3).max(120),
        productIds: z.array(z.string().min(1)).max(10000).default([]),
    })
    .superRefine((data, _ctx) => {
        data.productIds = dedupeCaseInsensitive(data.productIds)
    })

export type VendorFormInput = z.infer<typeof vendorSchema>

export const defaultVendorValues: VendorFormInput = {
    name: 'Sweet Delights Vendor',
    productIds: [],
}



