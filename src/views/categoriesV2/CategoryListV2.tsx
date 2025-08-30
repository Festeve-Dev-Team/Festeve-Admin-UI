import { useEffect, useMemo, useRef } from 'react'
import AdaptableCard from '@/components/shared/AdaptableCard'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import Alert from '@/components/ui/Alert'

import { HiOutlineSearch, HiOutlineRefresh, HiPlus } from 'react-icons/hi'
import DataTable, { type ColumnDef, type DataTableResetHandle } from '@/components/shared/DataTable'
import useCategories from './hooks/useCategories'
import type { CategoryWithId } from './types/category'
import { useNavigate } from 'react-router-dom'

export default function CategoryListV2() {
    const navigate = useNavigate()
    const tableRef = useRef<DataTableResetHandle>(null)
    
    // Redux hooks
    const {
        filteredCategories,
        pagination,
        filters,
        isCategoriesLoading,
        categoriesError,
        stats,
        loadCategories,
        setCategoryFilters,
        clearAllCategoryErrors
    } = useCategories()

    // Load categories on mount
    useEffect(() => {
        loadCategories({ page: 1, limit: 50 }) // Load more to show hierarchy
    }, [loadCategories])

    // Handle pagination changes
    const handlePageChange = (pageIndex: number) => {
        loadCategories({ page: pageIndex + 1, limit: pagination.limit })
    }

    // Handle search input changes
    const handleSearchChange = (value: string) => {
        setCategoryFilters({ search: value })
    }

    // Handle level filter changes
    const handleLevelChange = (value: string) => {
        const level = value === '' ? null : parseInt(value)
        setCategoryFilters({ level })
    }

    // Handle refresh
    const handleRefresh = () => {
        clearAllCategoryErrors()
        loadCategories({ page: pagination.page, limit: pagination.limit })
    }

    const getLevelBadgeColor = (level: number) => {
        switch (level) {
            case 1: return 'bg-green-100 text-green-800'
            case 2: return 'bg-blue-100 text-blue-800'
            case 3: return 'bg-purple-100 text-purple-800'
            default: return 'bg-gray-100 text-gray-800'
        }
    }

    const columns: ColumnDef<CategoryWithId>[] = useMemo(
        () => [
            { 
                header: 'Category', 
                accessorKey: 'name',
                cell: (p) => {
                    const category = p.row.original
                    const indent = '  '.repeat((category.level - 1) * 2)
                    const prefix = category.level > 1 ? '├─ ' : ''
                    
                    return (
                        <div className="flex items-center gap-2">
                            <span className="font-mono text-gray-400">{indent}{prefix}</span>
                            <div>
                                <div className="font-medium">{category.name}</div>
                                <div className="text-sm text-gray-500">{category.slug}</div>
                            </div>
                        </div>
                    )
                }
            },
            {
                header: 'Level',
                cell: (p) => (
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getLevelBadgeColor(p.row.original.level)}`}>
                        Level {p.row.original.level}
                    </span>
                )
            },
            {
                header: 'Status',
                cell: (p) => (
                    <div className="flex items-center gap-2">
                        {p.row.original.isActive ? (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                Active
                            </span>
                        ) : (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                                Inactive
                            </span>
                        )}
                        {p.row.original.isLeaf && (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                                Leaf
                            </span>
                        )}
                    </div>
                )
            },
            {
                header: 'Order',
                accessorKey: 'displayOrder',
                cell: (p) => (
                    <span className="font-medium">{p.row.original.displayOrder}</span>
                )
            },
            {
                header: 'Attributes',
                cell: (p) => {
                    const count = p.row.original.attributes.length
                    return (
                        <div>
                            <span className="font-medium">{count}</span>
                            {count > 0 && (
                                <div className="text-xs text-gray-500 mt-1">
                                    {p.row.original.attributes.slice(0, 2).join(', ')}
                                    {count > 2 && `, +${count - 2} more`}
                                </div>
                            )}
                        </div>
                    )
                }
            },
            {
                header: 'Path',
                cell: (p) => (
                    <div className="text-sm text-gray-600 max-w-xs truncate">
                        {p.row.original.fullSlug || p.row.original.slug}
                    </div>
                )
            },
            {
                header: '',
                id: 'action',
                cell: (p) => (
                    <div className="text-right">
                        <Button 
                            size="sm" 
                            onClick={() => navigate(`/app/categories-v2/category-edit/${p.row.original.id}`)}
                        >
                            Edit
                        </Button>
                    </div>
                ),
            },
        ],
        [navigate, getLevelBadgeColor],
    )

    return (
        <AdaptableCard className="h-full" bodyClass="h-full">
            {/* Error Alert */}
            {categoriesError && (
                <Alert 
                    showIcon 
                    className="mb-4" 
                    type="danger"
                    onClose={() => clearAllCategoryErrors()}
                >
                    {categoriesError}
                </Alert>
            )}

            {/* Header */}
            <div className="lg:flex items-center justify-between mb-4 gap-2">
                <div className="flex items-center gap-2 flex-wrap">
                    <div>
                        <h3 className="mb-1 lg:mb-0">Categories V2</h3>
                        <p className="text-sm text-gray-500">
                            {isCategoriesLoading ? 'Loading...' : `${stats.totalCategories} total categories`}
                            {stats.totalCategories > 0 && (
                                <span className="ml-2">
                                    • L1: {stats.level1Categories} • L2: {stats.level2Categories} • L3: {stats.level3Categories}
                                </span>
                            )}
                        </p>
                    </div>
                    
                    <div className="flex items-center gap-2">
                        <Input 
                            size="sm" 
                            placeholder="Search categories..." 
                            prefix={<HiOutlineSearch />} 
                            onChange={(e) => handleSearchChange(e.target.value)}
                            value={filters.search}
                            className="w-48"
                        />
                        
                        <select
                            className="input input-sm w-32"
                            value={filters.level?.toString() || ''}
                            onChange={(e) => handleLevelChange(e.target.value)}
                        >
                            <option value="">All Levels</option>
                            <option value="1">Level 1</option>
                            <option value="2">Level 2</option>
                            <option value="3">Level 3</option>
                        </select>
                        
                        <Button 
                            size="sm" 
                            variant="default" 
                            icon={<HiOutlineRefresh />}
                            onClick={handleRefresh}
                            loading={isCategoriesLoading}
                        >
                            Refresh
                        </Button>
                    </div>
                </div>
                
                <Button 
                    size="sm" 
                    variant="solid" 
                    icon={<HiPlus />}
                    onClick={() => navigate('/app/categories-v2/category-new')}
                >
                    New Category
                </Button>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
                <div className="bg-white dark:bg-gray-800 rounded-lg border p-3">
                    <div className="text-2xl font-bold text-green-600">{stats.level1Categories}</div>
                    <div className="text-sm text-gray-500">Level 1</div>
                </div>
                <div className="bg-white dark:bg-gray-800 rounded-lg border p-3">
                    <div className="text-2xl font-bold text-blue-600">{stats.level2Categories}</div>
                    <div className="text-sm text-gray-500">Level 2</div>
                </div>
                <div className="bg-white dark:bg-gray-800 rounded-lg border p-3">
                    <div className="text-2xl font-bold text-purple-600">{stats.level3Categories}</div>
                    <div className="text-sm text-gray-500">Level 3</div>
                </div>
                <div className="bg-white dark:bg-gray-800 rounded-lg border p-3">
                    <div className="text-2xl font-bold text-emerald-600">{stats.activeCategories}</div>
                    <div className="text-sm text-gray-500">Active</div>
                </div>
                <div className="bg-white dark:bg-gray-800 rounded-lg border p-3">
                    <div className="text-2xl font-bold text-orange-600">{stats.categoriesWithAttributes}</div>
                    <div className="text-sm text-gray-500">With Attributes</div>
                </div>
            </div>

            {/* Data Table */}
            <DataTable
                ref={tableRef}
                columns={columns}
                data={filteredCategories}
                loading={isCategoriesLoading}
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
