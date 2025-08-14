import type { BookingWithId, BookingDto } from '../types/booking'

export async function fetchPurohits(q: string) {
    return [{ id: 'pu_1', name: 'Pandit Ravi', city: 'Mumbai' }].filter((x) => x.name.toLowerCase().includes(q.toLowerCase()))
}
export async function fetchEvents(q: string) {
    return [{ id: 'ev_1', name: 'Ganesh Puja', date: new Date().toISOString() }].filter((x) => x.name.toLowerCase().includes(q.toLowerCase()))
}
export async function checkAvailability({ purohitId, date, timeSlot }: { purohitId: string; date: string; timeSlot: string }) {
    return { status: 'available' as const, count: 0 }
}

let memory: BookingWithId[] = []
export async function saveBooking(dto: BookingWithId | BookingDto): Promise<BookingWithId> {
    const id = (dto as BookingWithId).id ?? `bk_${Math.random().toString(36).slice(2, 10)}`
    const saved: BookingWithId = { ...(dto as BookingDto), id }
    const idx = memory.findIndex((b) => b.id === id)
    if (idx >= 0) memory[idx] = saved
    else memory.unshift(saved)
    return saved
}



