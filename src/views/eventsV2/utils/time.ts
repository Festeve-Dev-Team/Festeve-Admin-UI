const IST_OFFSET_MINUTES = 330

export function toIST(date: Date) {
    const utc = date.getTime() + date.getTimezoneOffset() * 60000
    return new Date(utc + IST_OFFSET_MINUTES * 60000)
}

export function istNow() {
    return toIST(new Date())
}

export const dowMap = [
    { label: 'Sun', value: 0 },
    { label: 'Mon', value: 1 },
    { label: 'Tue', value: 2 },
    { label: 'Wed', value: 3 },
    { label: 'Thu', value: 4 },
    { label: 'Fri', value: 5 },
    { label: 'Sat', value: 6 },
]

export function buildRecurrenceSummary(args: {
    isRecurring: boolean
    frequency?: 'daily' | 'weekly' | 'monthly' | 'yearly'
    daysOfWeek?: number[]
    date?: string
}) {
    if (!args.isRecurring) return 'One-time'
    const { frequency, daysOfWeek } = args
    if (frequency === 'weekly') {
        const labels = (daysOfWeek || []).map((d) => dowMap[d]?.label).join(', ')
        return `Weekly on ${labels || '—'}`
    }
    return `${frequency?.charAt(0).toUpperCase()}${frequency?.slice(1)}`
}

export function nextOccurrences(
    { start, isRecurring, frequency, daysOfWeek }: { start: Date; isRecurring: boolean; frequency?: string; daysOfWeek?: number[] },
    n = 5,
) {
    const out: Date[] = []
    let cursor = new Date(start)
    for (let i = 0; i < n; i++) {
        if (!isRecurring) {
            if (i === 0) out.push(new Date(cursor))
            break
        }
        if (frequency === 'daily') cursor = addDays(cursor, 1)
        if (frequency === 'weekly') cursor = addDays(cursor, 1)
        if (frequency === 'monthly') cursor = addMonths(cursor, 1)
        if (frequency === 'yearly') cursor = addYears(cursor, 1)
        if (frequency === 'weekly' && Array.isArray(daysOfWeek) && daysOfWeek.length > 0) {
            while (!daysOfWeek.includes(cursor.getDay())) {
                cursor = addDays(cursor, 1)
            }
        }
        out.push(new Date(cursor))
    }
    return out
}

function addDays(d: Date, n: number) {
    const x = new Date(d)
    x.setDate(x.getDate() + n)
    return x
}
function addMonths(d: Date, n: number) {
    const x = new Date(d)
    x.setMonth(x.getMonth() + n)
    return x
}
function addYears(d: Date, n: number) {
    const x = new Date(d)
    x.setFullYear(x.getFullYear() + n)
    return x
}

export function dedupeBy<T>(arr: T[], keyFn: (t: T) => string) {
    const map = new Map<string, T>()
    arr.forEach((item) => map.set(keyFn(item), item))
    return Array.from(map.values())
}



