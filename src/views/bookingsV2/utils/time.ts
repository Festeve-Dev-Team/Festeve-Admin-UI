const IST_OFFSET_MINUTES = 330

export function toIST(date: Date) {
    const utc = date.getTime() + date.getTimezoneOffset() * 60000
    return new Date(utc + IST_OFFSET_MINUTES * 60000)
}

export function istNow() { return toIST(new Date()) }

export function parseTimeSlot(label: string): number {
    const m = label.trim().match(/^(0?[1-9]|1[0-2]):([0-5][0-9])\s?(AM|PM)$/i)
    if (!m) return NaN
    let h = Number(m[1]) % 12
    const min = Number(m[2])
    const pm = /PM/i.test(m[3])
    if (pm) h += 12
    return h * 60 + min
}

export function combineDateAndTime(dateISO: string, timeSlot: string): Date {
    const date = new Date(dateISO)
    const mins = parseTimeSlot(timeSlot)
    const d = new Date(date)
    d.setHours(0, 0, 0, 0)
    const h = Math.floor(mins / 60)
    const m = mins % 60
    d.setHours(h, m, 0, 0)
    return d
}

export function inFutureIST(date: Date) {
    return toIST(date).getTime() >= new Date(istNow().toDateString()).getTime()
}

export function formatINR(n: number) {
    try { return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(n) } catch { return `₹${n.toFixed(2)}` }
}



