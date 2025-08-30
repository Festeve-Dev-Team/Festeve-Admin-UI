import { useProductsForVendor } from '../hooks/useProductsForVendor'
import useProducts from '@/utils/hooks/useProducts'

export default function ProductDebugger() {
    const { products: vendorProducts, isProductsLoading: vendorLoading } = useProductsForVendor()
    const { products: directProducts, isProductsLoading: directLoading } = useProducts()

    return (
        <div className="p-4 border border-red-300 rounded bg-red-50">
            <h3 className="font-bold mb-2 text-red-800">🐛 Product Debug Info</h3>
            <div className="space-y-3 text-sm">
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <div className="font-medium text-blue-800">Vendor Hook:</div>
                        <div>Loading: {vendorLoading ? 'Yes' : 'No'}</div>
                        <div>Total Products: {vendorProducts.length}</div>
                        {vendorProducts.length > 0 && (
                            <div className="mt-2">
                                <div className="font-medium">First 3 products:</div>
                                <ul className="text-xs space-y-1">
                                    {vendorProducts.slice(0, 3).map((product, index) => (
                                        <li key={product.id || product._id} className="bg-white p-1 rounded">
                                            <strong>{product.name}</strong><br/>
                                            ID: {product.id || product._id}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}
                    </div>
                    
                    <div>
                        <div className="font-medium text-green-800">Direct Hook:</div>
                        <div>Loading: {directLoading ? 'Yes' : 'No'}</div>
                        <div>Total Products: {directProducts.length}</div>
                        {directProducts.length > 0 && (
                            <div className="mt-2">
                                <div className="font-medium">First 3 products:</div>
                                <ul className="text-xs space-y-1">
                                    {directProducts.slice(0, 3).map((product, index) => (
                                        <li key={product.id || product._id} className="bg-white p-1 rounded">
                                            <strong>{product.name}</strong><br/>
                                            ID: {product.id || product._id}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}
                    </div>
                </div>
                
                <div className="text-xs text-gray-600 border-t pt-2">
                    Both should show the same data. If different, there's a Redux store issue.
                </div>
            </div>
        </div>
    )
}
