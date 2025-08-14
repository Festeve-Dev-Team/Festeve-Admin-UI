export type PaymentDto = {
    relatedTo: string
    referenceId: string
    amount: number
    currency: string
    provider: string
    method: string
    transactionId?: string
    paymentIntentId?: string
    note?: string
}

export type PaymentId = string
export type PaymentWithId = PaymentDto & { id: PaymentId }



