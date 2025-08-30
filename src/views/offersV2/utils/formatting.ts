/**
 * Format currency in Indian Rupees
 */
export function formatINR(amount: number): string {
    return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        minimumFractionDigits: 0,
        maximumFractionDigits: 2
    }).format(amount)
}

/**
 * Calculate effective price after applying offer discount
 */
export function effectivePrice(originalPrice: number, discountType: 'percentage' | 'fixed', discountValue: number): {
    final: number
    savedAbs: number
    savedPct: number
} {
    let finalPrice: number
    
    if (discountType === 'percentage') {
        finalPrice = originalPrice * (1 - discountValue / 100)
    } else {
        finalPrice = Math.max(0, originalPrice - discountValue)
    }
    
    const savedAbs = originalPrice - finalPrice
    const savedPct = originalPrice > 0 ? (savedAbs / originalPrice) * 100 : 0
    
    return {
        final: finalPrice,
        savedAbs: savedAbs,
        savedPct: savedPct
    }
}

/**
 * Build a human-readable schedule summary
 */
export function buildScheduleSummary({ startDate, endDate }: { startDate: string; endDate: string }): string {
    try {
        const start = new Date(startDate)
        const end = new Date(endDate)
        
        if (isNaN(start.getTime()) || isNaN(end.getTime())) {
            return 'Invalid date range'
        }
        
        const now = new Date()
        const startFormatted = start.toLocaleDateString('en-IN', { 
            day: 'numeric', 
            month: 'short', 
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        })
        const endFormatted = end.toLocaleDateString('en-IN', { 
            day: 'numeric', 
            month: 'short', 
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        })
        
        // Calculate duration
        const diffMs = end.getTime() - start.getTime()
        const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24))
        
        let status = ''
        if (now < start) {
            status = ' (Scheduled)'
        } else if (now >= start && now <= end) {
            status = ' (Active)'
        } else {
            status = ' (Expired)'
        }
        
        if (diffDays === 1) {
            return `${startFormatted} to ${endFormatted} (1 day)${status}`
        } else {
            return `${startFormatted} to ${endFormatted} (${diffDays} days)${status}`
        }
    } catch (error) {
        return 'Invalid date format'
    }
}
