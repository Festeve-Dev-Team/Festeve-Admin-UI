import type { ProductWithId, Product, ProductId } from '../types/product'

// Mocked local in-memory list to avoid changing global Mirage setup
let memory: ProductWithId[] = []

export async function getProduct(id: ProductId): Promise<ProductWithId | null> {
    await delay(200)
    return memory.find((p) => p.id === id) ?? null
}

export async function listProducts(): Promise<ProductWithId[]> {
    await delay(200)
    return [...memory]
}

export async function saveProduct(
    dto: ProductWithId | Product,
): Promise<ProductWithId> {
    await delay(300)
    // upsert semantics
    const id = (dto as ProductWithId).id ?? randomId()
    const existingIndex = memory.findIndex((p) => p.id === id)
    const saved: ProductWithId = { ...(dto as Product), id }
    if (existingIndex >= 0) memory[existingIndex] = saved
    else memory.unshift(saved)
    return saved
}

function randomId() {
    return `p_${Math.random().toString(36).slice(2, 10)}`
}

function delay(ms: number) {
    return new Promise((res) => setTimeout(res, ms))
}


