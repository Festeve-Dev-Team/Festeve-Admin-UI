import { useMemo } from 'react'
import { useProductsForVendor } from './useProductsForVendor'

export default function useProductsLookup(ids: string[]) {
    const { getProductsByIds } = useProductsForVendor()
    
    const { resolved, unknownIds } = useMemo(() => {
        const unique = Array.from(new Set(ids))
        const products = getProductsByIds(unique)
        const known = new Map(products.map((p) => [p.id, p.title]))
        const final = unique.map((id) => ({ id, title: known.get(id) || null }))
        const unknown = final.filter((x) => !x.title).map((x) => x.id)
        
        return {
            resolved: final,
            unknownIds: unknown
        }
    }, [ids, getProductsByIds])
    
    return { resolved, unknownIds }
}



