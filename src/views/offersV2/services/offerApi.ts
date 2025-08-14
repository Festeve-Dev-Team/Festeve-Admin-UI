import type { OfferWithId, OfferDto, OfferId } from '../types/offer'

let memory: OfferWithId[] = []

export async function saveOffer(dto: OfferWithId | OfferDto): Promise<OfferWithId> {
    await delay(300)
    const id = (dto as OfferWithId).id ?? randomId()
    const idx = memory.findIndex((o) => o.id === id)
    const saved: OfferWithId = { ...(dto as OfferDto), id }
    if (idx >= 0) memory[idx] = saved
    else memory.unshift(saved)
    return saved
}

function randomId() { return `of_${Math.random().toString(36).slice(2, 10)}` }
function delay(ms: number) { return new Promise((res) => setTimeout(res, ms)) }



