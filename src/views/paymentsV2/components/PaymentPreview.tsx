import Card from '@/components/ui/Card'
import Tag from '@/components/ui/Tag'
import { buildGatewayLink, formatINR } from '../utils'
import type { PaymentFormInput } from '../schema/paymentSchema'

type Props = { form: PaymentFormInput; verifyResult?: { status: 'matched' | 'mismatch' | 'not_found'; details?: string } }

export default function PaymentPreview({ form, verifyResult }: Props) {
    const link = buildGatewayLink({ provider: form.provider, transactionId: form.transactionId, paymentIntentId: form.paymentIntentId })
    const risk: string[] = []
    if (form.amount === 0 && form.method !== 'COD') risk.push('Zero amount')
    if (form.currency !== 'INR') risk.push('Non-INR currency')
    if (form.provider.toLowerCase() === 'stripe' && !form.paymentIntentId) risk.push('Missing intent id')

    return (
        <div className="space-y-4">
            <Card className="p-4">
                <div className="flex items-start justify-between">
                    <div>
                        <h4 className="font-semibold">{formatINR(Number(form.amount || 0))} {form.currency}</h4>
                        <div className="text-sm text-gray-600">{form.relatedTo} · {form.referenceId}</div>
                    </div>
                    <Tag className="bg-indigo-100 text-indigo-800 border px-2 py-0.5 rounded">{form.provider}</Tag>
                </div>
                <div className="mt-2 text-sm">Method: {form.method}</div>
                {link && (
                    <div className="mt-2 text-xs"><a className="text-indigo-600" href={link} target="_blank" rel="noreferrer">Open in {form.provider} dashboard</a></div>
                )}
            </Card>
            <Card className="p-4">
                <h4 className="font-semibold">Verification</h4>
                <div className="text-sm">{verifyResult ? `${verifyResult.status}${verifyResult.details ? ' - ' + verifyResult.details : ''}` : 'Not verified'}</div>
                {risk.length > 0 && (
                    <div className="mt-2 text-xs text-amber-700">Risk: {risk.join(', ')}</div>
                )}
            </Card>
        </div>
    )
}



