import Card from '@/components/ui/Card'
import Tag from '@/components/ui/Tag'
import { buildRecurrenceSummary } from '../utils/time'
import type { EventFormInput } from '../schema/eventSchema'

type Props = { form: EventFormInput }

export default function EventPreview({ form }: Props) {
    const summary = buildRecurrenceSummary({
        isRecurring: form.recurring?.isRecurring ?? false,
        frequency: form.recurring?.frequency,
        daysOfWeek: form.recurring?.daysOfWeek,
        date: form.date,
    })
    return (
        <div className="space-y-4">
            <Card className="p-4">
                <div className="flex items-start justify-between">
                    <div>
                        <h4 className="font-semibold">{form.name || 'New Event'}</h4>
                        <div className="text-sm text-gray-500">{new Date(form.date).toLocaleString()}</div>
                        <div className="text-sm text-gray-600">{summary}</div>
                    </div>
                    {form.purohitRequired && (
                        <Tag className="bg-rose-100 text-rose-800 border px-2 py-0.5 rounded">Purohit Required</Tag>
                    )}
                </div>
                <div className="mt-2 flex flex-wrap gap-2">
                    {form.region && <Tag className="bg-gray-100 border px-2 py-0.5 rounded">{form.region}</Tag>}
                    {(form.regions || []).slice(0, 4).map((r) => (
                        <Tag key={r} className="bg-gray-100 border px-2 py-0.5 rounded">{r}</Tag>
                    ))}
                </div>
            </Card>
            <Card className="p-4">
                <h4 className="font-semibold">Links</h4>
                <div className="mt-2 text-sm">
                    {(form.linkedProducts || []).map((l, i) => (
                        <div key={i}>{l.productId} — {l.relation}</div>
                    ))}
                </div>
            </Card>
        </div>
    )
}



