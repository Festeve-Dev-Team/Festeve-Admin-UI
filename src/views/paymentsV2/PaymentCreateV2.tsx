import PaymentFormV2 from './PaymentFormV2'
import { defaultPaymentValues } from './schema/paymentSchema'
import { useNavigate } from 'react-router-dom'

export default function PaymentCreateV2() {
    const navigate = useNavigate()
    return <PaymentFormV2 initial={defaultPaymentValues} headerTitle="New Payment" onSaved={() => navigate('/app/payments-v2/payment-list')} />
}



