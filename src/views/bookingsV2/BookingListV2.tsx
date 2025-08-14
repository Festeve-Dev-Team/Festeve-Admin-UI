import AdaptableCard from '@/components/shared/AdaptableCard'
import Button from '@/components/ui/Button'
import DataTable, { type ColumnDef } from '@/components/shared/DataTable'
import { useNavigate } from 'react-router-dom'

type Row = { id: string; purohitId: string; eventId: string; date: string; timeSlot: string; amount: number }

const rows: Row[] = []

export default function BookingListV2() {
    const navigate = useNavigate()
    const columns: ColumnDef<Row>[] = [
        { header: 'Purohit', accessorKey: 'purohitId' },
        { header: 'Event', accessorKey: 'eventId' },
        { header: 'Date', cell: (p) => new Date(p.row.original.date).toLocaleDateString() },
        { header: 'Time', accessorKey: 'timeSlot' },
        { header: 'Amount', accessorKey: 'amount' },
        { header: '', id: 'action', cell: (p) => (<div className="text-right"><Button size="sm" onClick={() => navigate(`/app/bookings-v2/booking-edit/${p.row.original.id}`)}>Edit</Button></div>) },
    ]
    return (
        <AdaptableCard className="h-full" bodyClass="h-full">
            <div className="lg:flex items-center justify-between mb-4 gap-2">
                <h3 className="mb-4 lg:mb-0">Bookings V2</h3>
                <Button size="sm" variant="solid" onClick={() => navigate('/app/bookings-v2/booking-new')}>New Booking</Button>
            </div>
            <DataTable columns={columns} data={rows} pagingData={{ pageIndex: 1, pageSize: 10, total: rows.length }} />
        </AdaptableCard>
    )
}



