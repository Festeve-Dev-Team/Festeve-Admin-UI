export type VendorDto = {
    name: string
    productIds: string[]
}

export type VendorId = string
export type VendorWithId = VendorDto & { id: VendorId }



