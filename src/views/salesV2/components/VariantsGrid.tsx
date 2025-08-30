import { useMemo, useRef, useState } from 'react'
import DataTable, {
    type ColumnDef,
    type DataTableResetHandle,
    type OnSortParam,
} from '@/components/shared/DataTable'
import Button from '@/components/ui/Button'
import { calcEffectivePrice, formatCurrency } from '../utils/pricing'
import VariantDrawer from './VariantDrawer'
import type { VariantFormInput } from '../schema/productSchema'

type Props = {
    value: VariantFormInput[]
    onChange: (variants: VariantFormInput[]) => void
}

export default function VariantsGrid({ value, onChange }: Props) {
    const tableRef = useRef<DataTableResetHandle>(null)
    const [drawerOpen, setDrawerOpen] = useState(false)
    const [editingIndex, setEditingIndex] = useState<number | null>(null)

    const columns: ColumnDef<VariantFormInput>[] = useMemo(
        () => [
            { header: 'SKU', accessorKey: 'sku' },
            {
                header: 'Size',
                cell: (p) => p.row.original.size || '—',
            },
            {
                header: 'Color',
                cell: (p) => {
                    const v = p.row.original
                    if (v.color && v.colorCode) {
                        return (
                            <div className="flex items-center gap-2">
                                <div 
                                    className="w-4 h-4 rounded border border-gray-300" 
                                    style={{ backgroundColor: v.colorCode }}
                                ></div>
                                <span>{v.color}</span>
                            </div>
                        )
                    }
                    return v.color || '—'
                },
            },
            {
                header: 'Material',
                cell: (p) => p.row.original.material || '—',
            },
            {
                header: 'Price',
                accessorKey: 'price',
                cell: (p) => formatCurrency(p.row.original.price),
            },
            { header: 'Stock', accessorKey: 'stock' },
            {
                header: 'Discount',
                cell: (p) => {
                    const v = p.row.original
                    if (v.discountType === 'percentage') return `${v.discountValue}%`
                    if (v.discountType === 'fixed') return formatCurrency(v.discountValue)
                    return '—'
                },
            },
            {
                header: 'Effective',
                cell: (p) => {
                    const v = p.row.original
                    return formatCurrency(
                        calcEffectivePrice(v.price, v.discountType, v.discountValue),
                    )
                },
            },
            {
                header: 'Active',
                cell: (p) => (p.row.original.isActive ? 'Yes' : 'No'),
            },
            {
                header: '',
                id: 'action',
                cell: (p) => (
                    <div className="flex justify-end gap-2">
                        <Button size="sm" onClick={() => onEdit(p.row.index)}>
                            Edit
                        </Button>
                        <Button size="sm" variant="twoTone" className="text-red-600" onClick={() => onDelete(p.row.index)}>
                            Delete
                        </Button>
                    </div>
                ),
            },
        ],
        [],
    )

    const tableData = useMemo(
        () => ({ pageIndex: 1, pageSize: 10, sort: { key: '', order: '' }, query: '', total: value.length }),
        [value.length],
    )

    const onSort = (_: OnSortParam) => {}

    function onAdd() {
        console.log('➕ Add Variant clicked')
        setEditingIndex(null)
        setDrawerOpen(true)
    }

    function onEdit(index: number) {
        console.log('✏️ Edit Variant clicked for index:', index)
        setEditingIndex(index)
        setDrawerOpen(true)
    }

    function onDelete(index: number) {
        console.log('🗑️ Delete Variant clicked for index:', index)
        const next = value.slice()
        next.splice(index, 1)
        onChange(next)
    }

    function handleSubmit(variant: VariantFormInput) {
        console.log('✅ Variant submitted:', variant)
        console.log('📝 Current variants before update:', value)
        const next = value.slice()
        if (editingIndex === null) {
            console.log('➕ Adding new variant')
            next.unshift(variant)
        } else {
            console.log('✏️ Updating variant at index:', editingIndex)
            next[editingIndex] = variant
        }
        console.log('📝 Updated variants:', next)
        onChange(next)
        setDrawerOpen(false)
    }

    return (
        <div>
            <div className="flex items-center justify-between mb-3">
                <h4 className="font-semibold">Variants</h4>
                <div className="flex gap-2">
                    <Button size="sm" onClick={onAdd}>
                        Add Variant
                    </Button>
                </div>
            </div>
            <DataTable
                ref={tableRef}
                columns={columns}
                data={value}
                pagingData={{ pageIndex: 1, pageSize: 10, total: value.length }}
                onSort={onSort}
            />
            <VariantDrawer
                open={drawerOpen}
                initial={editingIndex !== null ? value[editingIndex] : null}
                onClose={() => setDrawerOpen(false)}
                onSubmit={handleSubmit}
            />
        </div>
    )
}


