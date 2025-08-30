import Card from '@/components/ui/Card'
import Tag from '@/components/ui/Tag'
import { HiOutlineShoppingBag, HiOutlineLocationMarker, HiOutlineOfficeBuilding } from 'react-icons/hi'
import type { VendorFormInput } from '../schema/vendorSchema'
import useProductsLookup from '../hooks/useProductsLookup'

type Props = { form: VendorFormInput }

export default function VendorPreview({ form }: Props) {
    const { resolved, unknownIds } = useProductsLookup(form.productIds)
    
    const hasValidData = form.name && form.storeName
    const validProducts = resolved.filter(p => p.title)
    
    return (
        <div className="space-y-4">
            {/* Vendor Info Card */}
            <Card className="p-4">
                <div className="flex items-center gap-2 mb-3">
                    <HiOutlineOfficeBuilding className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                    <h4 className="font-semibold text-gray-900 dark:text-gray-100">Vendor Details</h4>
                </div>
                
                <div className="space-y-3">
                    <div>
                        <div className="text-lg font-medium text-gray-900 dark:text-gray-100">
                            {form.name || 'Vendor Name'}
                        </div>
                        {!form.name && (
                            <div className="text-xs text-gray-400 italic">Enter vendor name in the basics tab</div>
                        )}
                    </div>

                    <div>
                        <div className="text-sm text-gray-600 dark:text-gray-300">
                            <span className="font-medium">Store:</span> {form.storeName || 'Store Name'}
                        </div>
                        {!form.storeName && (
                            <div className="text-xs text-gray-400 italic">Enter store name in the basics tab</div>
                        )}
                    </div>

                    {form.address && (
                        <div className="flex items-start gap-2">
                            <HiOutlineLocationMarker className="h-4 w-4 text-gray-500 mt-0.5 flex-shrink-0" />
                            <div className="text-sm text-gray-600 dark:text-gray-300">
                                {form.address}
                            </div>
                        </div>
                    )}

                    <div className="flex items-center gap-2 pt-2 border-t border-gray-200 dark:border-gray-700">
                        <HiOutlineShoppingBag className="h-4 w-4 text-gray-500" />
                        <span className="text-sm text-gray-600 dark:text-gray-300">
                            {form.productIds.length} product{form.productIds.length !== 1 ? 's' : ''} assigned
                        </span>
                        {form.productIds.length > 0 && (
                            <Tag className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 text-xs px-2 py-0.5">
                                Active
                            </Tag>
                        )}
                    </div>
                </div>
            </Card>

            {/* Products Card */}
            <Card className="p-4">
                <div className="flex items-center justify-between mb-3">
                    <h4 className="font-semibold text-gray-900 dark:text-gray-100">
                        Assigned Products
                    </h4>
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                        {validProducts.length} of {form.productIds.length} loaded
                    </div>
                </div>
                
                {form.productIds.length === 0 ? (
                    <div className="text-center py-6 text-gray-500 dark:text-gray-400">
                        <HiOutlineShoppingBag className="h-8 w-8 mx-auto mb-2 opacity-50" />
                        <div className="text-sm">No products assigned yet</div>
                        <div className="text-xs mt-1">Use the Products tab to add products</div>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {/* Show first 5 products */}
                        <div className="space-y-2">
                            {validProducts.slice(0, 5).map((product) => (
                                <div key={product.id} className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-800 rounded border border-gray-200 dark:border-gray-700">
                                    <div className="flex-1 min-w-0">
                                        <div className="font-medium text-sm text-gray-900 dark:text-gray-100 truncate">
                                            {product.title}
                                        </div>
                                        <div className="text-xs text-gray-500 dark:text-gray-400">
                                            ID: {product.id}
                                        </div>
                                    </div>
                                    <Tag className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 text-xs px-2 py-0.5">
                                        Active
                                    </Tag>
                                </div>
                            ))}
                        </div>

                        {/* Show count if more products */}
                        {validProducts.length > 5 && (
                            <div className="text-sm text-gray-500 dark:text-gray-400 text-center py-2 border-t border-gray-200 dark:border-gray-700">
                                + {validProducts.length - 5} more product{validProducts.length - 5 !== 1 ? 's' : ''}
                            </div>
                        )}

                        {/* Show unknown/loading products */}
                        {unknownIds.length > 0 && (
                            <div className="mt-3 p-2 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded">
                                <div className="text-sm font-medium text-amber-800 dark:text-amber-200 mb-1">
                                    Loading Products ({unknownIds.length})
                                </div>
                                <div className="text-xs text-amber-700 dark:text-amber-300">
                                    Some products are still loading or may not exist: {unknownIds.slice(0, 3).join(', ')}
                                    {unknownIds.length > 3 && ` and ${unknownIds.length - 3} more`}
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </Card>

            {/* Validation Status */}
            {!hasValidData && (
                <Card className="p-4 border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-900/20">
                    <div className="text-sm text-amber-800 dark:text-amber-200">
                        <div className="font-medium mb-1">Required Information Missing</div>
                        <ul className="text-xs space-y-0.5">
                            {!form.name && <li>• Vendor name is required</li>}
                            {!form.storeName && <li>• Store name is required</li>}
                        </ul>
                    </div>
                </Card>
            )}
        </div>
    )
}



