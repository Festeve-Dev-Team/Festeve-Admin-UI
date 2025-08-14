import type { PurohitWithId, Purohit, PurohitId } from '../types/purohit'

let memory: PurohitWithId[] = []

export async function getPurohit(id: PurohitId): Promise<PurohitWithId | null> {
    await delay(200)
    return memory.find((p) => p.id === id) ?? null
}

export async function listPurohits(): Promise<PurohitWithId[]> {
    await delay(200)
    return [...memory]
}

export async function savePurohit(dto: PurohitWithId | Purohit): Promise<PurohitWithId> {
    await delay(300)
    const id = (dto as PurohitWithId).id ?? randomId()
    const existingIndex = memory.findIndex((p) => p.id === id)
    const saved: PurohitWithId = { ...(dto as Purohit), id }
    if (existingIndex >= 0) memory[existingIndex] = saved
    else memory.unshift(saved)
    return saved
}

function randomId() {
    return `pu_${Math.random().toString(36).slice(2, 10)}`
}

function delay(ms: number) {
    return new Promise((res) => setTimeout(res, ms))
}


