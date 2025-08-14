import Card from '@/components/ui/Card'
import Tag from '@/components/ui/Tag'
import { formatINR, combineDateAndTime } from '../utils/time'
import type { BookingFormInput } from '../schema/bookingSchema'

type Props = { form: BookingFormInput; availability?: { status: 'available' | 'conflict'; count: number } }

export default function BookingPreview({ form, availability }: Props) {
    const dt = combineDateAndTime(form.date, form.timeSlot)
    return (
        <div className="space-y-4">
            <Card className="p-4">
                <div className="flex items-start justify-between">
                    <div>
                        <h4 className="font-semibold">Booking Summary</h4>
                        <div className="text-sm text-gray-600">{form.purohitId} · {form.eventId}</div>
                        <div className="text-sm">{dt.toDateString()} · {form.timeSlot}</div>
                        <div className="text-sm">Amount: {formatINR(Number(form.amount || 0))}</div>
                    </div>
                    {availability && (
                        <Tag className={`px-2 py-0.5 border rounded ${availability.status === 'available' ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'}`}>
                            {availability.status === 'available' ? 'Available' : `Conflict (${availability.count})`}
                        </Tag>
                    )}
                </div>
                {form.isGroupBooking && (
                    <div className="mt-2 text-xs text-gray-600">Group of {form.groupSize}</div>
                )}
            </Card>
        </div>
    )
}



