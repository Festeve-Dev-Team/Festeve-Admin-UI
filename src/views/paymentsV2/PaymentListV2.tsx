import AdaptableCard from '@/components/shared/AdaptableCard'
import Button from '@/components/ui/Button'
import DataTable, { type ColumnDef } from '@/components/shared/DataTable'
import { useNavigate } from 'react-router-dom'

type Row = { id: string; referenceId: string; amount: number; currency: string; provider: string; method: string }

const rows: Row[] = []

export default function PaymentListV2() {
    const navigate = useNavigate()
    const columns: ColumnDef<Row>[] = [
        { header: 'Reference', accessorKey: 'referenceId' },
        { header: 'Amount', accessorKey: 'amount' },
        { header: 'Currency', accessorKey: 'currency' },
        { header: 'Provider', accessorKey: 'provider' },
        { header: 'Method', accessorKey: 'method' },
        { header: '', id: 'action', cell: (p) => (<div className="text-right"><Button size="sm" onClick={() => navigate(`/app/payments-v2/payment-edit/${p.row.original.id}`)}>Edit</Button></div>) },
    ]
    return (
        <AdaptableCard className="h-full" bodyClass="h-full">
            <div className="lg:flex items-center justify-between mb-4 gap-2">
                <h3 className="mb-4 lg:mb-0">Payments V2</h3>
                <Button size="sm" variant="solid" onClick={() => navigate('/app/payments-v2/payment-new')}>New Payment</Button>
            </div>
            <DataTable columns={columns} data={rows} pagingData={{ pageIndex: 1, pageSize: 10, total: rows.length }} />
        </AdaptableCard>
    )
}



