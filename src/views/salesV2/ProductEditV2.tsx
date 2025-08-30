import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import ProductFormV2 from './ProductFormV2'
import { apiToFormData } from './utils/dataTransform'
import useProducts from '@/utils/hooks/useProducts'
import type { ProductFormInput } from './schema/productSchema'

export default function ProductEditV2() {
    const { productId } = useParams()
    const navigate = useNavigate()
    const [initial, setInitial] = useState<ProductFormInput | null>(null)
    const [loading, setLoading] = useState(true)
    
    const { loadProduct, selectedProduct, isProductLoading, error } = useProducts()

    useEffect(() => {
        if (!productId) {
            navigate('/app/sales-v2/product-list')
            return
        }
        
        loadProduct(productId)
    }, [productId, loadProduct, navigate])

    useEffect(() => {
        if (selectedProduct && selectedProduct.id === productId) {
            try {
                const formData = apiToFormData(selectedProduct)
                setInitial(formData)
                setLoading(false)
            } catch (error) {
                console.error('Error transforming product data:', error)
                setLoading(false)
            }
        }
    }, [selectedProduct, productId])

    if (loading || isProductLoading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="text-lg">Loading product...</div>
            </div>
        )
    }

    if (error) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="text-red-600">Error loading product: {error}</div>
            </div>
        )
    }

    if (!initial) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="text-gray-600">Product not found</div>
            </div>
        )
    }

    return (
        <ProductFormV2
            initial={initial}
            headerTitle={initial.name || 'Edit Product'}
            onSaved={() => navigate('/app/sales-v2/product-list')}
        />
    )
}


