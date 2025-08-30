import { useEffect, useMemo, useRef, useState } from 'react'
import AdaptableCard from '@/components/shared/AdaptableCard'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import { HiOutlineSearch } from 'react-icons/hi'
import DataTable, { type ColumnDef, type DataTableResetHandle } from '@/components/shared/DataTable'
import { getPurohits } from './services/purohitApi'
import type { PurohitWithId } from './types/purohit'
import { useNavigate } from 'react-router-dom'

export default function PurohitListV2() {
    const [loading, setLoading] = useState(false)
    const [rows, setRows] = useState<PurohitWithId[]>([])
    const [query, setQuery] = useState('')
    const navigate = useNavigate()
    const tableRef = useRef<DataTableResetHandle>(null)

    useEffect(() => {
        setLoading(true)
        getPurohits().then((response) => {
            setRows(response.purohits)
            setLoading(false)
        }).catch((error) => {
            console.error('Failed to load purohits:', error)
            setLoading(false)
        })
    }, [])

    const filtered = useMemo(() => {
        const q = query.trim().toLowerCase()
        if (!q) return rows
        return rows.filter((r) => r.name.toLowerCase().includes(q) || r.location.city.toLowerCase().includes(q) || r.location.state.toLowerCase().includes(q))
    }, [rows, query])

    const columns: ColumnDef<PurohitWithId>[] = useMemo(
        () => [
            { header: 'Name', accessorKey: 'name' },
            { header: 'Phone', accessorKey: 'phone' },
            { header: 'City', cell: (p) => p.row.original.location.city },
            { header: 'State', cell: (p) => p.row.original.location.state },
            { header: 'Active', cell: (p) => (p.row.original.isActive ? 'Yes' : 'No') },
            {
                header: '',
                id: 'action',
                cell: (p) => (
                    <div className="text-right">
                        <Button size="sm" onClick={() => navigate(`/app/purohits-v2/purohit-edit/${p.row.original.id}`)}>Edit</Button>
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
                    <h3 className="mb-4 lg:mb-0">Purohits V2</h3>
                    <div className="relative">
                        <Input size="sm" placeholder="Search" prefix={<HiOutlineSearch />} onChange={(e) => setQuery(e.target.value)} />
                    </div>
                </div>
                <Button size="sm" variant="solid" onClick={() => navigate('/app/purohits-v2/purohit-new')}>New Purohit</Button>
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


