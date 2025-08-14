const IST_OFFSET_MINUTES = 330

export function toIST(iso: string) {
    const d = new Date(iso)
    const utc = d.getTime() + d.getTimezoneOffset() * 60000
    return new Date(utc + IST_OFFSET_MINUTES * 60000)
}

export function formatISTRange(startISO: string, endISO: string) {
    const s = toIST(startISO)
    const e = toIST(endISO)
    const opts: Intl.DateTimeFormatOptions = { hour: 'numeric', minute: '2-digit' }
    const sTxt = new Intl.DateTimeFormat('en-IN', opts).format(s)
    const eTxt = new Intl.DateTimeFormat('en-IN', opts).format(e)
    return `${sTxt}–${eTxt} IST`
}

export function slotDurationMinutes(startISO: string, endISO: string) {
    return Math.max(0, (new Date(endISO).getTime() - new Date(startISO).getTime()) / 60000)
}

export function remainingCapacity({ maxOrders, currentOrders }: { maxOrders: number; currentOrders: number }) {
    return Math.max(0, maxOrders - currentOrders)
}

export function slotStatus({ startISO, endISO, remaining }: { startISO: string; endISO: string; remaining: number }) {
    const now = new Date()
    const s = new Date(startISO).getTime()
    const e = new Date(endISO).getTime()
    const n = now.getTime()
    if (remaining === 0) return 'full'
    if (n < s) return 'upcoming'
    if (n >= s && n < e) return 'in_progress'
    return 'expired'
}

export function checkOverlap(slot: { startTime: string; endTime: string }, existing: { startTime: string; endTime: string }[]) {
    const s1 = new Date(slot.startTime).getTime()
    const e1 = new Date(slot.endTime).getTime()
    const items = existing.filter((x) => {
        const s2 = new Date(x.startTime).getTime()
        const e2 = new Date(x.endTime).getTime()
        return s1 < e2 && s2 < e1
    })
    return { conflicts: items.length > 0, items }
}



