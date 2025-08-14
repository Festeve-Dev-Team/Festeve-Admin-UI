import { useEffect, useState } from 'react'
import { fetchProductsByIds } from '../services/vendorApi'

export default function useProductsLookup(ids: string[]) {
    const [resolved, setResolved] = useState<Array<{ id: string; title: string | null }>>([])
    const [unknownIds, setUnknown] = useState<string[]>([])
    useEffect(() => {
        let mounted = true
        ;(async () => {
            const unique = Array.from(new Set(ids))
            const res = await fetchProductsByIds(unique)
            const known = new Map(res.map((r) => [r.id, r.title]))
            const final = unique.map((id) => ({ id, title: known.get(id) || null }))
            const unknown = final.filter((x) => !x.title).map((x) => x.id)
            if (mounted) {
                setResolved(final)
                setUnknown(unknown)
            }
        })()
        return () => { mounted = false }
    }, [ids])
    return { resolved, unknownIds }
}



