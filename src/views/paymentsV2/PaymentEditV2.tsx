import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import PaymentFormV2 from './PaymentFormV2'
import type { PaymentFormInput } from './schema/paymentSchema'

export default function PaymentEditV2() {
    const { paymentId } = useParams()
    const navigate = useNavigate()
    const [initial, setInitial] = useState<PaymentFormInput | null>(null)
    useEffect(() => { if (paymentId) setInitial({ relatedTo: 'order', referenceId: 'ORD_001', amount: 0, currency: 'INR', provider: 'razorpay', method: 'UPI', transactionId: '', paymentIntentId: '', note: '' }) }, [paymentId])
    if (!initial) return null
    return <PaymentFormV2 initial={initial} headerTitle={`Txn ${paymentId}`} onSaved={() => navigate('/app/payments-v2/payment-list')} />
}



