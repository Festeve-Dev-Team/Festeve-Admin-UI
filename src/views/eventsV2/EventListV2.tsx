import { useEffect, useMemo, useRef, useState } from 'react'
import AdaptableCard from '@/components/shared/AdaptableCard'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import { HiOutlineSearch } from 'react-icons/hi'
import DataTable, { type ColumnDef, type DataTableResetHandle } from '@/components/shared/DataTable'
import { listEvents } from './services/eventApi'
import type { EventWithId } from './types/event'
import { useNavigate } from 'react-router-dom'

export default function EventListV2() {
    const [loading, setLoading] = useState(false)
    const [rows, setRows] = useState<EventWithId[]>([])
    const [query, setQuery] = useState('')
    const navigate = useNavigate()
    const tableRef = useRef<DataTableResetHandle>(null)

    useEffect(() => { setLoading(true); listEvents().then((data) => { setRows(data); setLoading(false) }) }, [])

    const filtered = useMemo(() => {
        const q = query.trim().toLowerCase()
        if (!q) return rows
        return rows.filter((r) => r.name.toLowerCase().includes(q) || (r.region || '').toLowerCase().includes(q))
    }, [rows, query])

    const columns: ColumnDef<EventWithId>[] = useMemo(() => [
        { header: 'Name', accessorKey: 'name' },
        { header: 'Type', accessorKey: 'type' },
        { header: 'Region', cell: (p) => p.row.original.region || '—' },
        { header: 'Date', cell: (p) => new Date(p.row.original.date).toLocaleString() },
        { header: '', id: 'action', cell: (p) => (<div className="text-right"><Button size="sm" onClick={() => navigate(`/app/events-v2/event-edit/${p.row.original.id}`)}>Edit</Button></div>) },
    ], [navigate])

    return (
        <AdaptableCard className="h-full" bodyClass="h-full">
            <div className="lg:flex items-center justify-between mb-4 gap-2">
                <div className="flex items-center gap-2">
                    <h3 className="mb-4 lg:mb-0">Events V2</h3>
                    <div className="relative"><Input size="sm" placeholder="Search" prefix={<HiOutlineSearch />} onChange={(e) => setQuery(e.target.value)} /></div>
                </div>
                <Button size="sm" variant="solid" onClick={() => navigate('/app/events-v2/event-new')}>New Event</Button>
            </div>
            <DataTable ref={tableRef} columns={columns} data={filtered} loading={loading} pagingData={{ pageIndex: 1, pageSize: 10, total: filtered.length }} />
        </AdaptableCard>
    )
}



