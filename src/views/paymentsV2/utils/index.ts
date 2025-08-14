export function formatINR(n: number) {
    try { return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(n) } catch { return `₹${n.toFixed(2)}` }
}

export function isISO4217(code: string) {
    return /^[A-Z]{3}$/.test(code)
}

export function buildGatewayLink({ provider, transactionId, paymentIntentId }: { provider: string; transactionId?: string; paymentIntentId?: string }) {
    const p = provider?.toLowerCase()
    if (p === 'razorpay' && (transactionId || paymentIntentId)) return 'https://dashboard.razorpay.com/'
    if (p === 'stripe' && (transactionId || paymentIntentId)) return 'https://dashboard.stripe.com/'
    return null
}

export async function verifyStub({ provider }: { provider: string; transactionId?: string; paymentIntentId?: string }) {
    return { status: 'matched' as const, details: `Verified with ${provider}` }
}



