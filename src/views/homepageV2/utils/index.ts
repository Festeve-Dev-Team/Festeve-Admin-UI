export function isURL(s?: string) {
    if (!s) return false
    try { new URL(s); return true } catch { return false }
}

export function dedupeCaseInsensitive<T extends string>(arr: T[]): T[] {
    return Array.from(new Map(arr.map((x) => [x.toLowerCase(), x])).values()) as T[]
}

export function normalizePositions<T extends { position: number }>(banners: T[]) {
    return banners.map((b, i) => ({ ...b, position: i }))
}

export function hasAtLeastOneTarget({ linkUrl, productId, eventId }: { linkUrl?: string; productId?: string; eventId?: string }) {
    return Boolean((linkUrl && linkUrl.length > 0) || (productId && productId.length > 0) || (eventId && eventId.length > 0))
}

export function diffJSON(a: unknown, b: unknown) {
    try {
        const A = JSON.parse(JSON.stringify(a))
        const B = JSON.parse(JSON.stringify(b))
        const added: string[] = []
        const removed: string[] = []
        const changed: string[] = []
        walk('', A, B, added, removed, changed)
        return { added, removed, changed }
    } catch { return { added: [], removed: [], changed: [] } }
}

function walk(path: string, a: any, b: any, added: string[], removed: string[], changed: string[]) {
    if (typeof a !== 'object' || a === null) {
        if (a !== b) changed.push(path)
        return
    }
    const aKeys = new Set(Object.keys(a || {}))
    const bKeys = new Set(Object.keys(b || {}))
    for (const k of aKeys) {
        const p = path ? `${path}.${k}` : k
        if (!bKeys.has(k)) removed.push(p)
        else walk(p, a[k], b[k], added, removed, changed)
    }
    for (const k of bKeys) {
        if (!aKeys.has(k)) added.push(path ? `${path}.${k}` : k)
    }
}



