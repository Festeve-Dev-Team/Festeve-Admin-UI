import { useEffect, useMemo, useRef, useState } from 'react'
import AdaptableCard from '@/components/shared/AdaptableCard'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import { HiOutlineSearch } from 'react-icons/hi'
import DataTable, { type ColumnDef, type DataTableResetHandle } from '@/components/shared/DataTable'
import { listProducts } from './services/productApi'
import type { ProductWithId } from './types/product'
import { useNavigate } from 'react-router-dom'

export default function ProductListV2() {
    const [loading, setLoading] = useState(false)
    const [rows, setRows] = useState<ProductWithId[]>([])
    const [query, setQuery] = useState('')
    const navigate = useNavigate()
    const tableRef = useRef<DataTableResetHandle>(null)

    useEffect(() => {
        setLoading(true)
        listProducts().then((data) => {
            setRows(data)
            setLoading(false)
        })
    }, [])

    const filtered = useMemo(() => {
        const q = query.trim().toLowerCase()
        if (!q) return rows
        return rows.filter((r) => r.name.toLowerCase().includes(q) || r.category.toLowerCase().includes(q))
    }, [rows, query])

    const columns: ColumnDef<ProductWithId>[] = useMemo(
        () => [
            { header: 'Name', accessorKey: 'name' },
            { header: 'Category', accessorKey: 'category' },
            { header: 'Variants', cell: (p) => p.row.original.variants.length },
            {
                header: '',
                id: 'action',
                cell: (p) => (
                    <div className="text-right">
                        <Button size="sm" onClick={() => navigate(`/app/sales-v2/product-edit/${p.row.original.id}`)}>Edit</Button>
                    </div>
                ),
            },
        ],
        [navigate],
    )

    return (
        <AdaptableCard className="h-full" bodyClass="h-full">
            <div className="lg:flex items-center justify-between mb-4 gap-2">
                <div className="flex items-center gap-2">
                    <h3 className="mb-4 lg:mb-0">Products V2</h3>
                    <div className="relative">
                        <Input size="sm" placeholder="Search" prefix={<HiOutlineSearch />} onChange={(e) => setQuery(e.target.value)} />
                    </div>
                </div>
                <Button size="sm" variant="solid" onClick={() => navigate('/app/sales-v2/product-new')}>New Product</Button>
            </div>
            <DataTable
                ref={tableRef}
                columns={columns}
                data={filtered}
                loading={loading}
                pagingData={{ pageIndex: 1, pageSize: 10, total: filtered.length }}
            />
        </AdaptableCard>
    )
}


