import { useState, useEffect } from 'react'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import useProducts from '@/utils/hooks/useProducts'

type Product = { 
    id: string; 
    title: string; 
    description?: string; 
    categoryId?: string; 
    tags?: string[] 
}

type Props = { 
    value: string
    onChange: (id: string) => void
    placeholder?: string
}

export default function ProductSelector({ value, onChange, placeholder = "Search products..." }: Props) {
    const [q, setQ] = useState('')
    const [searchResults, setSearchResults] = useState<Product[]>([])
    const [isSearching, setIsSearching] = useState(false)
    const [isOpen, setIsOpen] = useState(false)

    // Use the same products hook as VendorFormV2
    const {
        products,
        isProductsLoading
    } = useProducts()

    // Get selected product info
    const selectedProduct = products.find(p => p.id === value || p._id === value)
    const displayValue = selectedProduct ? selectedProduct.name : value

    function onSearch(text: string) {
        setQ(text)
        if (!text.trim()) {
            setSearchResults([])
            return
        }
        
        setIsSearching(true)
        try {
            // Use products array directly like ProductListV2 does
            const searchResults = products.filter(product => 
                product.name.toLowerCase().includes(text.toLowerCase()) ||
                (product.description && product.description.toLowerCase().includes(text.toLowerCase())) ||
                (product.tags && product.tags.some(tag => tag.toLowerCase().includes(text.toLowerCase())))
            )

            const results = searchResults.slice(0, 10).map(product => ({
                id: product.id || product._id,
                title: product.name,
                description: product.description,
                categoryId: product.categoryId,
                tags: product.tags
            }))

            setSearchResults(results)
        } finally {
            setIsSearching(false)
        }
    }

    function selectProduct(id: string) {
        onChange(id)
        setQ('')
        setSearchResults([])
        setIsOpen(false)
    }

    function clearSelection() {
        onChange('')
        setQ('')
        setSearchResults([])
        setIsOpen(false)
    }

    return (
        <div className="relative">
            {/* Selected Product Display / Search Input */}
            {value && selectedProduct ? (
                <div className="flex items-center gap-2 p-2 border border-gray-300 rounded-md bg-gray-50">
                    <div className="flex-1 min-w-0">
                        <div className="font-medium text-sm text-gray-900 truncate">
                            {selectedProduct.name}
                        </div>
                        <div className="text-xs text-gray-500 truncate">
                            ID: {value}
                        </div>
                    </div>
                    <Button 
                        size="sm" 
                        variant="plain"
                        onClick={clearSelection}
                        className="text-red-600 hover:text-red-700"
                    >
                        Clear
                    </Button>
                    <Button 
                        size="sm" 
                        onClick={() => setIsOpen(!isOpen)}
                    >
                        {isOpen ? 'Close' : 'Change'}
                    </Button>
                </div>
            ) : (
                <div className="flex items-center gap-2">
                    <Input 
                        placeholder={placeholder}
                        value={q} 
                        onChange={(e) => {
                            onSearch(e.target.value)
                            setIsOpen(true)
                        }}
                        onFocus={() => setIsOpen(true)}
                        className="flex-1"
                    />
                    {isProductsLoading && (
                        <span className="text-xs text-blue-600">Loading...</span>
                    )}
                </div>
            )}

            {/* Search Results Dropdown */}
            {isOpen && (q || !value) && (
                <div 
                    className="absolute top-full left-0 right-0 z-50 mt-1 border border-gray-200 rounded-lg bg-white shadow-lg max-h-64 overflow-auto"
                    onMouseLeave={() => setTimeout(() => setIsOpen(false), 200)}
                >
                    <div className="p-2">
                        {!value && (
                            <Input 
                                placeholder={placeholder}
                                value={q} 
                                onChange={(e) => onSearch(e.target.value)}
                                autoFocus
                                className="mb-2"
                            />
                        )}
                        
                        <div className="text-sm font-medium text-gray-600 border-b border-gray-200 pb-2 mb-2">
                            Search Results {(isSearching || isProductsLoading) && '(searching...)'}
                        </div>
                        
                        {(isSearching || isProductsLoading) ? (
                            <div className="text-sm text-gray-500 py-2">
                                {isProductsLoading ? 'Loading products...' : 'Searching products...'}
                            </div>
                        ) : (
                            <>
                                {searchResults.map((product) => (
                                    <div 
                                        key={product.id} 
                                        className="flex items-start justify-between p-2 hover:bg-gray-50 rounded border border-gray-100 mb-1 cursor-pointer"
                                        onClick={() => selectProduct(product.id)}
                                    >
                                        <div className="flex-1 min-w-0">
                                            <div className="font-medium text-sm text-gray-900 truncate">
                                                {product.title}
                                            </div>
                                            <div className="text-xs text-gray-500 truncate">
                                                ID: {product.id}
                                            </div>
                                            {product.description && (
                                                <div className="text-xs text-gray-600 mt-1 line-clamp-2">
                                                    {product.description}
                                                </div>
                                            )}
                                            {product.tags && product.tags.length > 0 && (
                                                <div className="flex flex-wrap gap-1 mt-1">
                                                    {product.tags.slice(0, 3).map((tag) => (
                                                        <span key={tag} className="inline-block px-1.5 py-0.5 text-xs bg-blue-100 text-blue-800 rounded">
                                                            {tag}
                                                        </span>
                                                    ))}
                                                    {product.tags.length > 3 && (
                                                        <span className="text-xs text-gray-500">+{product.tags.length - 3} more</span>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))}
                                {searchResults.length === 0 && !isSearching && !isProductsLoading && q && (
                                    <div className="text-sm text-gray-500 py-2">No products found for "{q}"</div>
                                )}
                                {!q && (
                                    <div className="text-sm text-gray-500 py-2">Start typing to search products...</div>
                                )}
                            </>
                        )}
                    </div>
                </div>
            )}
        </div>
    )
}
