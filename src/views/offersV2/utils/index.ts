const IST_OFFSET_MINUTES = 330

export function toIST(date: Date) {
    const utc = date.getTime() + date.getTimezoneOffset() * 60000
    return new Date(utc + IST_OFFSET_MINUTES * 60000)
}
export function istNow() { return toIST(new Date()) }

export function formatINR(n: number) {
    try { return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(n) } catch { return `₹${n.toFixed(2)}` }
}

export function effectivePrice({ price, discountType, discountValue }: { price: number; discountType: 'percentage' | 'fixed'; discountValue: number }) {
    let savedAbs = 0
    if (discountType === 'percentage') savedAbs = price * (Math.min(Math.max(discountValue, 0), 100) / 100)
    if (discountType === 'fixed') savedAbs = Math.min(price, Math.max(0, discountValue))
    const final = Math.max(0, price - savedAbs)
    const savedPct = price > 0 ? (savedAbs / price) * 100 : 0
    return { final, savedAbs, savedPct }
}

export function buildScheduleSummary({ startDate, endDate }: { startDate?: string; endDate?: string }) {
    const s = startDate ? new Date(startDate) : null
    const e = endDate ? new Date(endDate) : null
    const sTxt = s ? s.toLocaleString('en-IN') : '—'
    const eTxt = e ? e.toLocaleString('en-IN') : '—'
    return `From ${sTxt} to ${eTxt}`
}

export function dedupeBy<T>(arr: T[], keyFn: (t: T) => string) {
    const m = new Map<string, T>()
    arr.forEach((it) => m.set(keyFn(it), it))
    return Array.from(m.values())
}



