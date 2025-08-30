import { useEffect, useMemo, useRef } from 'react'
import AdaptableCard from '@/components/shared/AdaptableCard'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import Alert from '@/components/ui/Alert'
import { HiOutlineSearch, HiOutlineRefresh } from 'react-icons/hi'
import DataTable, { type ColumnDef, type DataTableResetHandle } from '@/components/shared/DataTable'
import useProducts from '@/utils/hooks/useProducts'
import type { ProductWithId } from './types/product'
import { useNavigate } from 'react-router-dom'

export default function ProductListV2() {
    const navigate = useNavigate()
    const tableRef = useRef<DataTableResetHandle>(null)
    
    // Redux hooks
    const {
        filteredProducts,
        pagination,
        filters,
        isProductsLoading,
        productsError,
        stats,
        loadProducts,
        setProductFilters,
        clearAllProductErrors
    } = useProducts()

    // Load products on mount
    useEffect(() => {
        loadProducts({ page: 1, limit: 20 })
    }, [loadProducts])

    // Handle pagination changes
    const handlePageChange = (pageIndex: number) => {
        loadProducts({ page: pageIndex + 1, limit: pagination.limit })
    }

    // Handle search input changes
    const handleSearchChange = (value: string) => {
        setProductFilters({ search: value })
    }

    // Handle refresh
    const handleRefresh = () => {
        clearAllProductErrors()
        loadProducts({ page: pagination.page, limit: pagination.limit })
    }

    const columns: ColumnDef<ProductWithId>[] = useMemo(
        () => [
            { 
                header: 'Name', 
                accessorKey: 'name',
                cell: (p) => (
                    <div>
                        <div className="font-medium">{p.row.original.name || 'Untitled Product'}</div>
                        <div className="text-sm text-gray-500 truncate" style={{ maxWidth: '200px' }}>
                            {p.row.original.description || 'No description'}
                        </div>
                    </div>
                )
            },
            { 
                header: 'Category', 
                accessorKey: 'categoryId',
                cell: (p) => {
                    const product = p.row.original as any
                    const categoryFullSlug = product.categoryFullSlug
                    const categoryValue = product.categoryId || product.category
                    
                    if (categoryFullSlug) {
                        // Format "electronics/electronics2/electronics-5" to "Electronics → Electronics2 → Electronics 5"
                        const parts = categoryFullSlug.split('/')
                        const formattedParts = parts.map((part: string) => {
                            // Replace dashes with spaces and capitalize first letter
                            return part.replace(/-/g, ' ').replace(/\b\w/g, (l: string) => l.toUpperCase())
                        })
                        return (
                            <div className="text-sm">
                                {formattedParts.map((part: string, index: number) => (
                                    <span key={index}>
                                        {index > 0 && <span className="text-gray-400 mx-1">→</span>}
                                        <span className="text-gray-700">{part}</span>
                                    </span>
                                ))}
                            </div>
                        )
                    }
                    
                    // Fallback to simple category display
                    return (
                        <span className="capitalize">{categoryValue?.replace('-', ' ') || 'Uncategorized'}</span>
                    )
                }
            },
            { 
                header: 'Variants', 
                cell: (p) => (
                    <span className="font-medium">{p.row.original.variants?.length || 0}</span>
                )
            },
            {
                header: 'Price Range',
                cell: (p) => {
                    const variants = p.row.original.variants || []
                    if (variants.length === 0) {
                        return <span className="text-gray-400">No variants</span>
                    }
                    
                    const prices = variants.map(v => v.price).filter(price => price !== undefined && price !== null)
                    if (prices.length === 0) {
                        return <span className="text-gray-400">No price</span>
                    }
                    
                    const minPrice = Math.min(...prices)
                    const maxPrice = Math.max(...prices)
                    return (
                        <span className="font-medium">
                            ₹{minPrice === maxPrice ? minPrice : `${minPrice} - ${maxPrice}`}
                        </span>
                    )
                }
            },
            {
                header: 'Status',
                cell: (p) => {
                    const variants = p.row.original.variants || []
                    const activeVariants = variants.filter(v => v?.isActive).length
                    const totalVariants = variants.length
                    return (
                        <div className="flex items-center gap-2">
                            {p.row.original.isTrending && (
                                <span className="px-2 py-1 bg-red-100 text-red-800 text-xs rounded-full">
                                    Trending
                                </span>
                            )}
                            {p.row.original.isHotItem && (
                                <span className="px-2 py-1 bg-orange-100 text-orange-800 text-xs rounded-full">
                                    Hot
                                </span>
                            )}
                            <span className="text-sm text-gray-500">
                                {activeVariants}/{totalVariants} active
                            </span>
                        </div>
                    )
                }
            },
            {
                header: '',
                id: 'action',
                cell: (p) => (
                    <div className="text-right">
                        <Button 
                            size="sm" 
                            onClick={() => navigate(`/app/sales-v2/product-edit/${p.row.original.id || p.row.original._id}`)}
                            disabled={!p.row.original.id && !p.row.original._id}
                        >
                            Edit
                        </Button>
                    </div>
                ),
            },
        ],
        [navigate],
    )

    return (
        <AdaptableCard className="h-full" bodyClass="h-full">
            {/* Error Alert */}
            {productsError && (
                <Alert 
                    showIcon 
                    className="mb-4" 
                    type="danger"
                    onClose={() => clearAllProductErrors()}
                >
                    {productsError}
                </Alert>
            )}

            {/* Header */}
            <div className="lg:flex items-center justify-between mb-4 gap-2">
                <div className="flex items-center gap-2">
                    <div>
                        <h3 className="mb-1 lg:mb-0">Products V2</h3>
                        <p className="text-sm text-gray-500">
                            {isProductsLoading ? 'Loading...' : `${stats.totalProducts} total products`}
                            {stats.totalProducts > 0 && (
                                <span className="ml-2">
                                    • {stats.trendingProducts} trending • {stats.hotProducts} hot items
                                </span>
                            )}
                        </p>
                    </div>
                    <div className="relative">
                        <Input 
                            size="sm" 
                            placeholder="Search products..." 
                            prefix={<HiOutlineSearch />} 
                            onChange={(e) => handleSearchChange(e.target.value)}
                            value={filters.search}
                        />
                    </div>
                    <Button 
                        size="sm" 
                        variant="default" 
                        icon={<HiOutlineRefresh />}
                        onClick={handleRefresh}
                        loading={isProductsLoading}
                    >
                        Refresh
                    </Button>
                </div>
                <Button 
                    size="sm" 
                    variant="solid" 
                    onClick={() => navigate('/app/sales-v2/product-new')}
                >
                    New Product
                </Button>
            </div>

            {/* Data Table */}
            <DataTable
                ref={tableRef}
                columns={columns}
                data={filteredProducts}
                loading={isProductsLoading}
                pagingData={{ 
                    pageIndex: pagination.page - 1, // DataTable uses 0-based indexing
                    pageSize: pagination.limit, 
                    total: pagination.total 
                }}
                onPaginationChange={handlePageChange}
            />
        </AdaptableCard>
    )
}


