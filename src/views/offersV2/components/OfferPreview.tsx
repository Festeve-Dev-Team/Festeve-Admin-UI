import Card from '@/components/ui/Card'
import Tag from '@/components/ui/Tag'
import { formatINR, effectivePrice, buildScheduleSummary } from '../utils'
import type { OfferFormInput } from '../schema/offerSchema'
import Input from '@/components/ui/Input'
import { useState } from 'react'

type Props = { form: OfferFormInput }

export default function OfferPreview({ form }: Props) {
    const [base, setBase] = useState(1000)
    const calc = effectivePrice(base, form.discountType, Number(form.discountValue || 0))
    return (
        <div className="space-y-4">
            <Card className="p-4">
                <div className="flex items-start justify-between">
                    <div>
                        <h4 className="font-semibold">{form.title || 'New Offer'}</h4>
                        <div className="text-sm text-gray-600">{form.description || '—'}</div>
                    </div>
                    <Tag className="bg-indigo-100 text-indigo-800 border px-2 py-0.5 rounded">{form.type}</Tag>
                </div>
                <div className="mt-2 text-sm text-gray-600">
                    {form.startDate && form.endDate 
                        ? buildScheduleSummary({ startDate: form.startDate, endDate: form.endDate })
                        : 'No schedule set'
                    }
                </div>
                <div className="mt-2 text-xs text-gray-500">
                    Targets: {form.appliesTo}{form.appliesTo !== 'all' ? ` (${form.targetIds?.length || 0})` : ''}
                </div>
            </Card>
            <Card className="p-4">
                <h4 className="font-semibold">Calculator</h4>
                <div className="mt-2 flex items-center gap-2">
                    <span className="text-sm">Base price ₹</span>
                    <Input type="number" value={base} onChange={(e) => setBase(Number(e.target.value))} />
                </div>
                <div className="mt-2 text-sm">Final: {formatINR(calc.final)} • Save {formatINR(calc.savedAbs)} ({calc.savedPct.toFixed(1)}%)</div>
            </Card>
        </div>
    )
}



