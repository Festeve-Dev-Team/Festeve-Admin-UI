import { useState, useEffect } from 'react'
import Button from '@/components/ui/Button'
import Tag from '@/components/ui/Tag'
import Input from '@/components/ui/Input'
import useProducts from '@/utils/hooks/useProducts'

type Product = { 
    id: string; 
    title: string; 
    description?: string; 
    categoryId?: string; 
    tags?: string[] 
}

type Props = { value: string[]; onChange: (v: string[]) => void }

export default function ProductIdsEditor({ value, onChange }: Props) {
    const [q, setQ] = useState('')
    const [searchResults, setSearchResults] = useState<Product[]>([])
    const [isSearching, setIsSearching] = useState(false)

    // Use the same products hook as ProductListV2
    const {
        products,
        isProductsLoading
    } = useProducts()

    // Debug logging (keep for development)
    useEffect(() => {
        console.log('ProductIdsEditor (Promos) - Products in store:', products.length)
        if (products.length > 0) {
            console.log('First 3 products:', products.slice(0, 3))
        }
    }, [products])

    // Get selected products data
    const selectedProducts = value.map(id => {
        const product = products.find(p => p.id === id || p._id === id)
        return product ? {
            id: product.id || product._id,
            title: product.name
        } : null
    }).filter(Boolean) as Array<{ id: string; title: string }>

    function onSearch(text: string) {
        setQ(text)
        if (!text.trim()) {
            setSearchResults([])
            return
        }
        
        setIsSearching(true)
        try {
            // Use products array directly like ProductListV2 does
            console.log('Searching in:', products.length, 'products')
            console.log('Sample product for search:', products[0])
            
            const searchResults = products.filter(product => 
                product.name.toLowerCase().includes(text.toLowerCase()) ||
                (product.description && product.description.toLowerCase().includes(text.toLowerCase())) ||
                (product.tags && product.tags.some(tag => tag.toLowerCase().includes(text.toLowerCase())))
            )

            const results = searchResults.slice(0, 20).map(product => ({
                id: product.id || product._id,
                title: product.name,
                description: product.description,
                categoryId: product.categoryId,
                tags: product.tags
            }))

            console.log('Search results for:', text, 'found:', results.length)
            setSearchResults(results)
        } finally {
            setIsSearching(false)
        }
    }

    function add(id: string) {
        if (!value.includes(id)) {
            onChange([...value, id])
            setQ('') // Clear search after adding
            setSearchResults([]) // Clear search results
        }
    }

    function remove(id: string) {
        onChange(value.filter((x) => x !== id))
    }

    const getProductDisplayName = (id: string) => {
        const product = selectedProducts.find(p => p.id === id)
        return product ? product.title : id
    }

    return (
        <div className="space-y-4">
            <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-200">
                    Search & Add Products
                    {isProductsLoading ? (
                        <span className="ml-2 text-xs text-blue-600">(Loading {products.length} products...)</span>
                    ) : (
                        <span className="ml-2 text-xs text-gray-500">({products.length} products available)</span>
                    )}
                </label>
                <div className="flex items-center gap-2">
                    <Input 
                        placeholder="Search products by name, description, or tags..." 
                        value={q} 
                        onChange={(e) => onSearch(e.target.value)} 
                        className="flex-1"
                    />
                </div>
            </div>

            {/* Search Results */}
            {q && (
                <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-3 space-y-2 max-h-64 overflow-auto bg-white dark:bg-gray-800">
                    <div className="text-sm font-medium text-gray-600 dark:text-gray-300 border-b border-gray-200 dark:border-gray-700 pb-2">
                        Search Results {(isSearching || isProductsLoading) && '(searching...)'}
                    </div>
                    {(isSearching || isProductsLoading) ? (
                        <div className="text-sm text-gray-500 py-2">
                            {isProductsLoading ? 'Loading products...' : 'Searching products...'}
                        </div>
                    ) : (
                        <>
                            {searchResults.map((product) => (
                                <div key={product.id} className="flex items-start justify-between p-2 hover:bg-gray-50 dark:hover:bg-gray-700 rounded border border-gray-100 dark:border-gray-600">
                                    <div className="flex-1 min-w-0">
                                        <div className="font-medium text-sm text-gray-900 dark:text-gray-100 truncate">
                                            {product.title}
                                        </div>
                                        <div className="text-xs text-gray-500 dark:text-gray-400 truncate">
                                            ID: {product.id}
                                        </div>
                                        {product.description && (
                                            <div className="text-xs text-gray-600 dark:text-gray-300 mt-1 line-clamp-2">
                                                {product.description}
                                            </div>
                                        )}
                                        {product.tags && product.tags.length > 0 && (
                                            <div className="flex flex-wrap gap-1 mt-1">
                                                {product.tags.slice(0, 3).map((tag) => (
                                                    <span key={tag} className="inline-block px-1.5 py-0.5 text-xs bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 rounded">
                                                        {tag}
                                                    </span>
                                                ))}
                                                {product.tags.length > 3 && (
                                                    <span className="text-xs text-gray-500">+{product.tags.length - 3} more</span>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                    <Button 
                                        size="sm" 
                                        onClick={() => add(product.id)}
                                        disabled={value.includes(product.id)}
                                        className="ml-2 flex-shrink-0"
                                    >
                                        {value.includes(product.id) ? 'Added' : 'Add'}
                                    </Button>
                                </div>
                            ))}
                            {searchResults.length === 0 && !isSearching && !isProductsLoading && (
                                <div className="text-sm text-gray-500 py-2">No products found for "{q}"</div>
                            )}
                        </>
                    )}
                </div>
            )}

            {/* Selected Products */}
            <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-200">
                    Selected Products ({value.length})
                </label>
                <div className="min-h-[60px] border border-gray-200 dark:border-gray-700 rounded-lg p-3 bg-gray-50 dark:bg-gray-800">
                    {value.length === 0 ? (
                        <div className="text-sm text-gray-500 dark:text-gray-400 italic text-center py-4">
                            No products selected. Search and add products above.
                        </div>
                    ) : (
                        <div className="space-y-2">
                            {value.map((id) => {
                                const displayName = getProductDisplayName(id)
                                const isLoaded = selectedProducts.some(p => p.id === id)
                                
                                return (
                                    <div key={id} className="flex items-center justify-between p-2 bg-white dark:bg-gray-700 rounded border border-gray-200 dark:border-gray-600">
                                        <div className="flex-1 min-w-0">
                                            <div className="font-medium text-sm text-gray-900 dark:text-gray-100 truncate">
                                                {isLoaded ? displayName : `Loading... (${id})`}
                                            </div>
                                            <div className="text-xs text-gray-500 dark:text-gray-400">
                                                ID: {id}
                                            </div>
                                        </div>
                                        <Button 
                                            size="sm" 
                                            variant="plain"
                                            onClick={() => remove(id)} 
                                            className="ml-2 text-red-600 hover:text-red-700 hover:bg-red-50 dark:text-red-400 dark:hover:text-red-300 dark:hover:bg-red-900/20"
                                            aria-label={`Remove ${displayName}`}
                                        >
                                            Remove
                                        </Button>
                                    </div>
                                )
                            })}
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
