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
        setEditingIndex(null)
        setDrawerOpen(true)
    }

    function onEdit(index: number) {
        setEditingIndex(index)
        setDrawerOpen(true)
    }

    function onDelete(index: number) {
        const next = value.slice()
        next.splice(index, 1)
        onChange(next)
    }

    function handleSubmit(variant: VariantFormInput) {
        const next = value.slice()
        if (editingIndex === null) next.unshift(variant)
        else next[editingIndex] = variant
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


