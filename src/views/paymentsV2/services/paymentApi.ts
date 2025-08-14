import type { PaymentWithId, PaymentDto } from '../types/payment'
import { verifyStub } from '../utils'

export async function savePayment(dto: PaymentWithId | PaymentDto): Promise<PaymentWithId> {
    const id = (dto as PaymentWithId).id ?? `py_${Math.random().toString(36).slice(2, 10)}`
    return { ...(dto as PaymentDto), id }
}

export async function verifyPayment({ provider, transactionId, paymentIntentId }: { provider: string; transactionId?: string; paymentIntentId?: string }) {
    return verifyStub({ provider, transactionId, paymentIntentId })
}



