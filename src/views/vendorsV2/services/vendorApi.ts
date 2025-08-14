import type { VendorWithId, VendorDto } from '../types/vendor'

export async function fetchProductsByIds(ids: string[]) {
    return ids.map((id) => ({ id, title: `Product ${id.slice(-4)}` }))
}

export async function searchProducts(q: string, limit = 20) {
    return Array.from({ length: limit }, (_, i) => ({ id: `prod_${i}`, title: `${q || 'Product'} ${i}` }))
}

export async function saveVendor(dto: VendorWithId | VendorDto): Promise<VendorWithId> {
    const id = (dto as VendorWithId).id ?? `vd_${Math.random().toString(36).slice(2, 10)}`
    return { ...(dto as VendorDto), id }
}



