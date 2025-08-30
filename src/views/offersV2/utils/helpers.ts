/**
 * Remove duplicate items from array based on a key function
 */
export function dedupeBy<T>(arr: T[], keyFn: (item: T) => any): T[] {
    const seen = new Set()
    return arr.filter(item => {
        const key = keyFn(item)
        if (seen.has(key)) {
            return false
        }
        seen.add(key)
        return true
    })
}

/**
 * Get current time in IST timezone
 */
export function istNow(): Date {
    // Create a new date object with current UTC time
    const now = new Date()
    
    // Convert to IST (UTC + 5:30)
    const istOffset = 5.5 * 60 * 60 * 1000 // 5.5 hours in milliseconds
    const istTime = new Date(now.getTime() + istOffset)
    
    return istTime
}

/**
 * Format date to IST string
 */
export function formatDateIST(date: Date): string {
    return date.toLocaleString('en-IN', {
        timeZone: 'Asia/Kolkata',
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
    })
}

/**
 * Check if a date is in the past (IST)
 */
export function isDateInPastIST(date: string | Date): boolean {
    const targetDate = typeof date === 'string' ? new Date(date) : date
    const now = istNow()
    return targetDate.getTime() < now.getTime()
}
