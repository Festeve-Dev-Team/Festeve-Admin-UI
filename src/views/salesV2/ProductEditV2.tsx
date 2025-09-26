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
    
    const { loadProduct, selectedProduct, isProductLoading, error, products } = useProducts()

    useEffect(() => {
        if (!productId) {
            navigate('/app/sales-v2/product-list')
            return
        }
        
        // First, check if the product is already in the Redux store
        const existingProduct = products.find(p => p.id === productId || (p as any)._id === productId)
        if (existingProduct) {
            try {
                const formData = apiToFormData(existingProduct)
                setInitial(formData)
                setLoading(false)
                return
            } catch (error) {
                console.error('Error transforming product data from Redux:', error)
            }
        }
        // If not in store, fetch from API
        loadProduct(productId)
    }, [productId, loadProduct, navigate, products])

    useEffect(() => {
        if (selectedProduct && (selectedProduct.id === productId || (selectedProduct as any)._id === productId)) {
            try {
                const formData = apiToFormData(selectedProduct)
                setInitial(formData)
                setLoading(false)
            } catch (error) {
                console.error('Error transforming product data:', error)
                setLoading(false)
            }
        } else if (!isProductLoading && !selectedProduct && productId && !initial) {
            setLoading(false)
        }
    }, [selectedProduct, productId, isProductLoading, error, initial])

    if (loading || isProductLoading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="text-lg">Loading product...</div>
            </div>
        )
    }

    // If we have initial data, show the form even if there's an error
    // (the error might be from a different product or stale state)
    if (initial) {
        return (
            <ProductFormV2
                initial={initial}
                headerTitle={initial.name || 'Edit Product'}
                onSaved={() => navigate('/app/sales-v2/product-list')}
            />
        )
    }

    if (error) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="text-red-600">Error loading product: {error}</div>
            </div>
        )
    }

    return (
        <div className="flex items-center justify-center h-64">
            <div className="text-gray-600">Product not found</div>
        </div>
    )
}


