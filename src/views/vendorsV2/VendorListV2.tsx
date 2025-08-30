import { useEffect, useMemo, useRef } from 'react'
import AdaptableCard from '@/components/shared/AdaptableCard'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import Alert from '@/components/ui/Alert'
import { HiOutlineSearch, HiOutlineRefresh } from 'react-icons/hi'
import DataTable, { type ColumnDef, type DataTableResetHandle } from '@/components/shared/DataTable'
import useVendors from './hooks/useVendors'
import type { VendorWithId } from './types/vendor'
import { useNavigate } from 'react-router-dom'

export default function VendorListV2() {
    const navigate = useNavigate()
    const tableRef = useRef<DataTableResetHandle>(null)
    
    // Redux hooks
    const {
        filteredVendors,
        pagination,
        filters,
        isVendorsLoading,
        vendorsError,
        stats,
        loadVendors,
        setVendorFilters,
        clearAllVendorErrors
    } = useVendors()

    // Load vendors on mount
    useEffect(() => {
        loadVendors({ page: 1, limit: 20 })
    }, [loadVendors])

    // Handle pagination changes
    const handlePageChange = (pageIndex: number) => {
        loadVendors({ page: pageIndex + 1, limit: pagination.limit })
    }

    // Handle search input changes
    const handleSearchChange = (value: string) => {
        setVendorFilters({ search: value })
    }

    // Handle refresh
    const handleRefresh = () => {
        clearAllVendorErrors()
        loadVendors({ page: pagination.page, limit: pagination.limit })
    }

    const columns: ColumnDef<VendorWithId>[] = useMemo(
        () => [
            { 
                header: 'Vendor Name', 
                accessorKey: 'name',
                cell: (p) => (
                    <div>
                        <div className="font-medium">{p.row.original.name}</div>
                        <div className="text-sm text-gray-500">{p.row.original.storeName}</div>
                    </div>
                )
            },
            { 
                header: 'Address', 
                accessorKey: 'address',
                cell: (p) => (
                    <div className="text-sm max-w-xs truncate">
                        {p.row.original.address || 'No address provided'}
                    </div>
                )
            },
            { 
                header: 'Products', 
                cell: (p) => (
                    <span className="font-medium">{p.row.original.productIds.length}</span>
                )
            },
            {
                header: 'Rating',
                cell: (p) => {
                    const rating = p.row.original.averageRating
                    const totalRatings = p.row.original.ratings.length
                    
                    if (!rating || totalRatings === 0) {
                        return <span className="text-gray-400">No ratings</span>
                    }
                    
                    return (
                        <div className="flex items-center gap-1">
                            <span className="font-medium">{rating.toFixed(1)}</span>
                            <span className="text-yellow-500">⭐</span>
                            <span className="text-sm text-gray-500">({totalRatings})</span>
                        </div>
                    )
                }
            },
            {
                header: 'Status',
                cell: (p) => {
                    const hasProducts = p.row.original.productIds.length > 0
                    const hasRatings = p.row.original.ratings.length > 0
                    
                    return (
                        <div className="flex flex-col gap-1">
                            {hasProducts ? (
                                <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                                    Active
                                </span>
                            ) : (
                                <span className="px-2 py-1 bg-gray-100 text-gray-800 text-xs rounded-full">
                                    No Products
                                </span>
                            )}
                            {hasRatings && (
                                <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                                    Rated
                                </span>
                            )}
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
                            onClick={() => navigate(`/app/vendors-v2/vendor-edit/${p.row.original.id}`)}
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
            {vendorsError && (
                <Alert 
                    showIcon 
                    className="mb-4" 
                    type="danger"
                    onClose={() => clearAllVendorErrors()}
                >
                    {vendorsError}
                </Alert>
            )}

            {/* Header */}
            <div className="lg:flex items-center justify-between mb-4 gap-2">
                <div className="flex items-center gap-2">
                    <div>
                        <h3 className="mb-1 lg:mb-0">Vendors V2</h3>
                        <p className="text-sm text-gray-500">
                            {isVendorsLoading ? 'Loading...' : `${stats.totalVendors} total vendors`}
                            {stats.totalVendors > 0 && (
                                <span className="ml-2">
                                    • {stats.vendorsWithProducts} with products • {stats.totalProducts} total products
                                </span>
                            )}
                        </p>
                    </div>
                    <div className="relative">
                        <Input 
                            size="sm" 
                            placeholder="Search vendors..." 
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
                        loading={isVendorsLoading}
                    >
                        Refresh
                    </Button>
                </div>
                <Button 
                    size="sm" 
                    variant="solid" 
                    onClick={() => navigate('/app/vendors-v2/vendor-new')}
                >
                    New Vendor
                </Button>
            </div>

            {/* Data Table */}
            <DataTable
                ref={tableRef}
                columns={columns}
                data={filteredVendors}
                loading={isVendorsLoading}
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
