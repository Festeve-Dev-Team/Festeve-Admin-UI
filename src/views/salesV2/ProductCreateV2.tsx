import ProductFormV2 from './ProductFormV2'
import { defaultProductValues } from './schema/productSchema'
import { useNavigate } from 'react-router-dom'

export default function ProductCreateV2() {
    const navigate = useNavigate()
    return (
        <ProductFormV2
            initial={defaultProductValues}
            headerTitle="New Product"
            onSaved={() => navigate('/app/sales-v2/product-list')}
        />
    )
}


