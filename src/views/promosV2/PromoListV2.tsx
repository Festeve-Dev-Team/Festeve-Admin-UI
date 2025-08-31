import { useEffect, useMemo, useRef, useState } from 'react'
import AdaptableCard from '@/components/shared/AdaptableCard'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import Tag from '@/components/ui/Tag'
import { HiOutlineSearch } from 'react-icons/hi'
import DataTable, { type ColumnDef, type DataTableResetHandle } from '@/components/shared/DataTable'
import { getPromos } from './services/promoApi'
import type { PromoWithId } from './types/promo'
import { useNavigate } from 'react-router-dom'

export default function PromoListV2() {
    const [loading, setLoading] = useState(false)
    const [rows, setRows] = useState<PromoWithId[]>([])
    const [query, setQuery] = useState('')
    const navigate = useNavigate()
    const tableRef = useRef<DataTableResetHandle>(null)

    useEffect(() => { 
        setLoading(true)
        getPromos().then((response) => { 
            setRows(response.promos)
            setLoading(false) 
        }).catch((error) => {
            console.error('Failed to load promos:', error)
            setLoading(false)
        })
    }, [])

    const filtered = useMemo(() => {
        const q = query.trim().toLowerCase()
        if (!q) return rows
        return rows.filter((r) => 
            r.name.toLowerCase().includes(q) || 
            r.code.toLowerCase().includes(q) ||
            (r.status || '').toLowerCase().includes(q) ||
            (r.tags || []).some(tag => tag.toLowerCase().includes(q))
        )
    }, [rows, query])

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'ACTIVE': return 'bg-green-100 text-green-800 border-green-200'
            case 'PAUSED': return 'bg-yellow-100 text-yellow-800 border-yellow-200'
            case 'EXPIRED': return 'bg-red-100 text-red-800 border-red-200'
            case 'ARCHIVED': return 'bg-gray-100 text-gray-800 border-gray-200'
            default: return 'bg-gray-100 text-gray-800 border-gray-200'
        }
    }

    const formatDate = (dateStr?: string) => {
        if (!dateStr) return '—'
        try {
            return new Date(dateStr).toLocaleDateString()
        } catch {
            return '—'
        }
    }

    const columns: ColumnDef<PromoWithId>[] = useMemo(() => [
        { 
            header: 'Name', 
            accessorKey: 'name',
            cell: (p) => (
                <div>
                    <div className="font-medium">{p.row.original.name}</div>
                    <div className="text-xs text-gray-500 font-mono">{p.row.original.code}</div>
                </div>
            )
        },
        { 
            header: 'Status', 
            cell: (p) => (
                <Tag className={`px-2 py-1 text-xs font-medium rounded border ${getStatusColor(p.row.original.status || 'ACTIVE')}`}>
                    {p.row.original.status || 'ACTIVE'}
                </Tag>
            )
        },
        { 
            header: 'Duration', 
            cell: (p) => (
                <div className="text-sm">
                    <div>{formatDate(p.row.original.startsAt)} — {formatDate(p.row.original.endsAt)}</div>
                </div>
            )
        },
        { 
            header: 'Limits', 
            cell: (p) => {
                const global = p.row.original.globalLimit
                const perUser = p.row.original.perUserLimit
                if (!global && !perUser) return '—'
                return (
                    <div className="text-sm">
                        {global && <div>Global: {global}</div>}
                        {perUser && <div>Per User: {perUser}</div>}
                    </div>
                )
            }
        },
        { 
            header: 'Products', 
            cell: (p) => p.row.original.productIds?.length || 0
        },
        { 
            header: 'Tags', 
            cell: (p) => {
                const tags = p.row.original.tags || []
                if (tags.length === 0) return '—'
                return (
                    <div className="flex flex-wrap gap-1">
                        {tags.slice(0, 2).map((tag, i) => (
                            <Tag key={i} className="text-xs bg-blue-100 text-blue-800 border border-blue-200 px-1.5 py-0.5 rounded">
                                {tag}
                            </Tag>
                        ))}
                        {tags.length > 2 && (
                            <span className="text-xs text-gray-500">+{tags.length - 2}</span>
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
                        onClick={() => navigate(`/app/promos-v2/promo-edit/${p.row.original.id}`)}
                    >
                        Edit
                    </Button>
                </div>
            ) 
        },
    ], [navigate])

    return (
        <AdaptableCard className="h-full" bodyClass="h-full">
            <div className="lg:flex items-center justify-between mb-4 gap-2">
                <div className="flex items-center gap-2">
                    <h3 className="mb-4 lg:mb-0">Promos V2</h3>
                    <div className="relative">
                        <Input 
                            size="sm" 
                            placeholder="Search promos..." 
                            prefix={<HiOutlineSearch />} 
                            onChange={(e) => setQuery(e.target.value)} 
                        />
                    </div>
                </div>
                <Button 
                    size="sm" 
                    variant="solid" 
                    onClick={() => navigate('/app/promos-v2/promo-new')}
                >
                    New Promo
                </Button>
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
