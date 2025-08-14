import Card from '@/components/ui/Card'
import Tag from '@/components/ui/Tag'
import type { PurohitFormInput } from '../schema/purohitSchema'

type Props = {
    form: PurohitFormInput
}

export default function ProfilePreview({ form }: Props) {
    const next7 = (form.availability || []).slice(0, 7)
    return (
        <div className="space-y-4">
            <Card className="p-4">
                <div className="flex items-start justify-between">
                    <div>
                        <h4 className="font-semibold">{form.name || 'New Purohit'}</h4>
                        <div className="text-sm text-gray-500">
                            {form.experienceYears ?? 0} years • {form.location?.city || '—'}, {form.location?.state || '—'}
                        </div>
                    </div>
                    {form.chargesCommission && (
                        <Tag className="bg-indigo-100 text-indigo-800 border px-2 py-0.5 rounded">Commission</Tag>
                    )}
                </div>
                <div className="mt-3 text-sm">{form.bio || '—'}</div>
                <div className="mt-2 flex flex-wrap gap-2">
                    {(form.rituals || []).slice(0, 4).map((r) => (
                        <Tag key={r} className="bg-gray-100 border px-2 py-0.5 rounded">{r}</Tag>
                    ))}
                </div>
            </Card>
            <Card className="p-4">
                <h4 className="font-semibold">Availability (next 7)</h4>
                <div className="mt-2 space-y-2 text-sm">
                    {next7.length === 0 && <div className="text-gray-500">No availability added.</div>}
                    {next7.map((a, i) => (
                        <div key={i} className="flex items-center justify-between">
                            <span>{new Date(a.date).toDateString()}</span>
                            <span>{a.timeSlots.join(', ')}</span>
                        </div>
                    ))}
                </div>
            </Card>
            <Card className="p-4">
                <h4 className="font-semibold">Contact</h4>
                <div className="mt-2">
                    <Tag className="bg-emerald-100 text-emerald-800 border px-2 py-0.5 rounded">{form.phone || '+91XXXXXXXXXX'}</Tag>
                </div>
            </Card>
        </div>
    )
}


