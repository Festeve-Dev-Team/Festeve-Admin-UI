import type { DiscountType } from '../types/product'

export function formatCurrency(value: number, currency = 'INR', locale = 'en-IN') {
    try {
        return new Intl.NumberFormat(locale, {
            style: 'currency',
            currency,
            maximumFractionDigits: 2,
        }).format(value)
    } catch {
        return `${currency} ${value.toFixed(2)}`
    }
}

export function calcEffectivePrice(
    price: number,
    discountType: DiscountType,
    discountValue: number,
) {
    if (discountType === 'percentage') {
        const pct = Math.min(Math.max(discountValue, 0), 100)
        return Math.max(price - price * (pct / 100), 0)
    }
    if (discountType === 'fixed') {
        const fixed = Math.max(discountValue, 0)
        return Math.max(price - fixed, 0)
    }
    return price
}


