const IST_OFFSET_MINUTES = 330

export function istNow() {
    const now = new Date()
    return toIST(now)
}

export function toIST(date: Date) {
    const utc = date.getTime() + date.getTimezoneOffset() * 60000
    return new Date(utc + IST_OFFSET_MINUTES * 60000)
}

export function parseTimeSlot(label: string): number {
    // "9:00 AM" -> minutes since midnight
    const match = label.trim().match(/^(\d{1,2}):(\d{2})\s?(AM|PM)$/i)
    if (!match) return NaN
    let hour = Number(match[1]) % 12
    const minute = Number(match[2])
    const isPM = /PM/i.test(match[3])
    if (isPM) hour += 12
    return hour * 60 + minute
}

export function hasOverlap(slots: string[]): boolean {
    const minutes = slots.map((s) => parseTimeSlot(s)).filter((n) => !Number.isNaN(n)).sort((a, b) => a - b)
    for (let i = 1; i < minutes.length; i++) {
        if (minutes[i] === minutes[i - 1]) return true
    }
    return false
}


