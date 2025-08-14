import { useEffect, useMemo, useRef, useState } from 'react'
import AdaptableCard from '@/components/shared/AdaptableCard'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import { HiOutlineSearch } from 'react-icons/hi'
import DataTable, { type ColumnDef, type DataTableResetHandle } from '@/components/shared/DataTable'
import type { OfferWithId } from './types/offer'
import { useNavigate } from 'react-router-dom'
import { saveOffer } from './services/offerApi'

export default function OfferListV2() {
    const [loading] = useState(false)
    const [rows] = useState<OfferWithId[]>([])
    const [query, setQuery] = useState('')
    const navigate = useNavigate()
    const tableRef = useRef<DataTableResetHandle>(null)

    const filtered = useMemo(() => {
        const q = query.trim().toLowerCase()
        if (!q) return rows
        return rows.filter((r) => r.title.toLowerCase().includes(q))
    }, [rows, query])

    const columns: ColumnDef<OfferWithId>[] = useMemo(() => [
        { header: 'Title', accessorKey: 'title' },
        { header: 'Type', accessorKey: 'type' },
        { header: 'Applies To', accessorKey: 'appliesTo' },
        { header: '', id: 'action', cell: (p) => (<div className="text-right"><Button size="sm" onClick={() => navigate(`/app/offers-v2/offer-edit/${p.row.original.id}`)}>Edit</Button></div>) },
    ], [navigate])

    return (
        <AdaptableCard className="h-full" bodyClass="h-full">
            <div className="lg:flex items-center justify-between mb-4 gap-2">
                <div className="flex items-center gap-2">
                    <h3 className="mb-4 lg:mb-0">Offers V2</h3>
                    <div className="relative"><Input size="sm" placeholder="Search" prefix={<HiOutlineSearch />} onChange={(e) => setQuery(e.target.value)} /></div>
                </div>
                <Button size="sm" variant="solid" onClick={() => navigate('/app/offers-v2/offer-new')}>New Offer</Button>
            </div>
            <DataTable ref={tableRef} columns={columns} data={filtered} loading={loading} pagingData={{ pageIndex: 1, pageSize: 10, total: filtered.length }} />
        </AdaptableCard>
    )
}



