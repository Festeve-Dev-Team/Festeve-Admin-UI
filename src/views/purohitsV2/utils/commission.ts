import type { CommissionType } from '../types/purohit'

export function commissionCalc({ type, value, base }: { type: CommissionType; value: number; base: number }) {
    if (type === 'percentage') return Math.max(0, base * (Math.min(Math.max(value, 0), 100) / 100))
    if (type === 'fixed') return Math.max(0, value)
    return 0
}


