import { useEffect, useMemo, useRef } from 'react'
import AdaptableCard from '@/components/shared/AdaptableCard'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import Alert from '@/components/ui/Alert'
import { HiOutlineSearch, HiOutlineRefresh } from 'react-icons/hi'
import DataTable, { type ColumnDef, type DataTableResetHandle } from '@/components/shared/DataTable'
import type { OfferWithId } from './types/offer'
import { useNavigate } from 'react-router-dom'
import useOffers from './hooks/useOffers'

export default function OfferListV2() {
    const navigate = useNavigate()
    const tableRef = useRef<DataTableResetHandle>(null)

    // Redux hooks
    const {
        filteredOffers,
        pagination,
        filters,
        isOffersLoading,
        offersError,
        stats,
        loadOffers,
        setOfferFilters,
        clearAllOfferErrors
    } = useOffers()

    // Load offers on mount
    useEffect(() => {
        loadOffers({ page: 1, limit: 20 })
    }, [loadOffers])

    // Handle pagination changes
    const handlePageChange = (pageIndex: number) => {
        loadOffers({ page: pageIndex + 1, limit: pagination.limit })
    }

    // Handle search input changes
    const handleSearchChange = (value: string) => {
        setOfferFilters({ search: value })
    }

    // Handle refresh
    const handleRefresh = () => {
        clearAllOfferErrors()
        loadOffers({ page: pagination.page, limit: pagination.limit })
    }

    const columns: ColumnDef<OfferWithId>[] = useMemo(() => [
        { 
            header: 'Title', 
            accessorKey: 'title',
            cell: (p) => (
                <div>
                    <div className="font-medium">{p.row.original.title}</div>
                    <div className="text-sm text-gray-500">{p.row.original.description}</div>
                </div>
            )
        },
        { 
            header: 'Type', 
            accessorKey: 'type',
            cell: (p) => (
                <div className="capitalize">
                    {p.row.original.type.replace(/_/g, ' ')}
                </div>
            )
        },
        { 
            header: 'Discount', 
            cell: (p) => (
                <div>
                    {p.row.original.discountValue}
                    {p.row.original.discountType === 'percentage' ? '%' : ' off'}
                </div>
            )
        },
        {
            header: 'Status',
            cell: (p) => {
                const now = new Date()
                const startDate = new Date(p.row.original.startDate)
                const endDate = new Date(p.row.original.endDate)
                const isActive = now >= startDate && now <= endDate
                
                return (
                    <div className="flex flex-col gap-1">
                        {isActive ? (
                            <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                                Active
                            </span>
                        ) : now < startDate ? (
                            <span className="px-2 py-1 bg-amber-100 text-amber-800 text-xs rounded-full">
                                Scheduled
                            </span>
                        ) : (
                            <span className="px-2 py-1 bg-gray-100 text-gray-800 text-xs rounded-full">
                                Expired
                            </span>
                        )}
                        {p.row.original.combinable && (
                            <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                                Combinable
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
                        onClick={() => navigate(`/app/offers-v2/offer-edit/${p.row.original.id}`)}
                    >
                        Edit
                    </Button>
                </div>
            ),
        },
    ], [navigate])

    return (
        <AdaptableCard className="h-full" bodyClass="h-full">
            {/* Error Alert */}
            {offersError && (
                <Alert 
                    showIcon 
                    className="mb-4" 
                    type="danger"
                    onClose={() => clearAllOfferErrors()}
                >
                    {offersError}
                </Alert>
            )}

            {/* Header */}
            <div className="lg:flex items-center justify-between mb-4 gap-2">
                <div className="flex items-center gap-2">
                    <div>
                        <h3 className="mb-1 lg:mb-0">Offers V2</h3>
                        <p className="text-sm text-gray-500">
                            {isOffersLoading ? 'Loading...' : `${stats.totalOffers} total offers`}
                        </p>
                    </div>
                    <div className="relative">
                        <Input 
                            size="sm" 
                            placeholder="Search offers..." 
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
                        loading={isOffersLoading}
                    >
                        Refresh
                    </Button>
                </div>
                <Button 
                    size="sm" 
                    variant="solid" 
                    onClick={() => navigate('/app/offers-v2/offer-new')}
                >
                    New Offer
                </Button>
            </div>

            {/* Data Table */}
            <DataTable
                ref={tableRef}
                columns={columns}
                data={filteredOffers}
                loading={isOffersLoading}
                pagingData={{ 
                    pageIndex: pagination.page - 1,
                    pageSize: pagination.limit, 
                    total: pagination.total 
                }}
                onPaginationChange={handlePageChange}
            />
        </AdaptableCard>
    )
}



