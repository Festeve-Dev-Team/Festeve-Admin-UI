export function dedupeCaseInsensitive<T extends string>(arr: T[]): T[] {
    return Array.from(new Map(arr.map((x) => [x.toLowerCase(), x])).values()) as T[]
}

export function parseIdsFromText(s: string) {
    return s
        .split(/[\s,]+/)
        .map((x) => x.trim())
        .filter((x) => x.length > 0)
}

// Re-export dataTransform functions
export { formToApiData, validateFormForSubmission, apiToFormData } from './dataTransform'



