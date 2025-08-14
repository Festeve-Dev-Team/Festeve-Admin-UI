import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import ProductFormV2 from './ProductFormV2'
import { getProduct } from './services/productApi'
import type { ProductFormInput } from './schema/productSchema'

export default function ProductEditV2() {
    const { productId } = useParams()
    const navigate = useNavigate()
    const [initial, setInitial] = useState<ProductFormInput | null>(null)

    useEffect(() => {
        if (!productId) return
        getProduct(productId).then((p) => {
            if (p) setInitial(p)
        })
    }, [productId])

    if (!initial) return null

    return (
        <ProductFormV2
            initial={initial}
            headerTitle={initial.name}
            onSaved={() => navigate('/app/sales-v2/product-list')}
        />
    )
}


