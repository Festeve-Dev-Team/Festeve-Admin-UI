import type { EventWithId, EventDto, EventId } from '../types/event'

let memory: EventWithId[] = []

export async function getEvent(id: EventId): Promise<EventWithId | null> {
    await delay(200)
    return memory.find((e) => e.id === id) ?? null
}

export async function listEvents(): Promise<EventWithId[]> {
    await delay(200)
    return [...memory]
}

export async function saveEvent(dto: EventWithId | EventDto): Promise<EventWithId> {
    await delay(300)
    const id = (dto as EventWithId).id ?? randomId()
    const idx = memory.findIndex((e) => e.id === id)
    const saved: EventWithId = { ...(dto as EventDto), id }
    if (idx >= 0) memory[idx] = saved
    else memory.unshift(saved)
    return saved
}

function randomId() {
    return `ev_${Math.random().toString(36).slice(2, 10)}`
}

function delay(ms: number) {
    return new Promise((res) => setTimeout(res, ms))
}



