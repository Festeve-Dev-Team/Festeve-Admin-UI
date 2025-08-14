import Card from '@/components/ui/Card'
import Tag from '@/components/ui/Tag'
import { formatISTRange, remainingCapacity, slotStatus } from '../utils'
import type { SlotFormInput } from '../schema/slotSchema'

type Props = { form: SlotFormInput; conflicts?: number }

export default function SlotPreview({ form, conflicts }: Props) {
    const range = formatISTRange(form.startTime, form.endTime)
    const rem = remainingCapacity({ maxOrders: Number(form.maxOrders || 0), currentOrders: Number(form.currentOrders || 0) })
    const status = slotStatus({ startISO: form.startTime, endISO: form.endTime, remaining: rem })
    return (
        <div className="space-y-4">
            <Card className="p-4">
                <div className="flex items-start justify-between">
                    <div>
                        <h4 className="font-semibold">{range}</h4>
                        <div className="text-sm">Remaining: {rem}</div>
                    </div>
                    <Tag className="px-2 py-0.5 border rounded">{status.replace('_', ' ')}</Tag>
                </div>
                {typeof conflicts === 'number' && (
                    <div className="mt-2 text-xs text-rose-600">Overlaps: {conflicts}</div>
                )}
            </Card>
        </div>
    )
}



