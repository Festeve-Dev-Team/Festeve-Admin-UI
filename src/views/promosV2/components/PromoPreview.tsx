import Card from '@/components/ui/Card'
import Tag from '@/components/ui/Tag'
import type { PromoFormInput } from '../schema/promoSchema'

type Props = { form: PromoFormInput }

export default function PromoPreview({ form }: Props) {
    const formatDate = (dateStr: string) => {
        if (!dateStr) return 'Not set'
        try {
            return new Date(dateStr).toLocaleString()
        } catch {
            return 'Invalid date'
        }
    }

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'ACTIVE': return 'bg-green-100 text-green-800 border-green-200'
            case 'PAUSED': return 'bg-yellow-100 text-yellow-800 border-yellow-200'
            case 'EXPIRED': return 'bg-red-100 text-red-800 border-red-200'
            case 'ARCHIVED': return 'bg-gray-100 text-gray-800 border-gray-200'
            default: return 'bg-gray-100 text-gray-800 border-gray-200'
        }
    }

    const formatTTL = (seconds?: number) => {
        if (!seconds) return 'No limit'
        if (seconds < 60) return `${seconds} seconds`
        if (seconds < 3600) return `${Math.floor(seconds / 60)} minutes`
        if (seconds < 86400) return `${Math.floor(seconds / 3600)} hours`
        return `${Math.floor(seconds / 86400)} days`
    }

    return (
        <Card className="h-fit sticky top-20">
            <div className="p-4 space-y-4">
                <div className="flex items-center justify-between border-b border-gray-200 dark:border-gray-700 pb-3">
                    <h4 className="font-semibold text-gray-900 dark:text-gray-100">Promo Preview</h4>
                    <Tag className={`px-2 py-1 text-xs font-medium rounded border ${getStatusColor(form.status || 'ACTIVE')}`}>
                        {form.status || 'ACTIVE'}
                    </Tag>
                </div>

                <div className="space-y-3">
                    <div>
                        <div className="text-sm font-medium text-gray-600 dark:text-gray-400">Name</div>
                        <div className="text-base font-semibold text-gray-900 dark:text-gray-100">
                            {form.name || 'Untitled Promo'}
                        </div>
                    </div>

                    <div>
                        <div className="text-sm font-medium text-gray-600 dark:text-gray-400">Code</div>
                        <div className="text-base font-mono bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded border text-gray-900 dark:text-gray-100">
                            {form.code || 'NO_CODE'}
                        </div>
                    </div>

                    {(form.startsAt || form.endsAt) && (
                        <div>
                            <div className="text-sm font-medium text-gray-600 dark:text-gray-400">Duration</div>
                            <div className="text-sm space-y-1">
                                <div>
                                    <span className="text-gray-500">Starts:</span> {formatDate(form.startsAt || '')}
                                </div>
                                <div>
                                    <span className="text-gray-500">Ends:</span> {formatDate(form.endsAt || '')}
                                </div>
                            </div>
                        </div>
                    )}

                    {(form.globalLimit !== undefined || form.perUserLimit !== undefined) && (
                        <div>
                            <div className="text-sm font-medium text-gray-600 dark:text-gray-400">Usage Limits</div>
                            <div className="text-sm space-y-1">
                                {form.globalLimit !== undefined && (
                                    <div>
                                        <span className="text-gray-500">Global:</span> {form.globalLimit} uses
                                    </div>
                                )}
                                {form.perUserLimit !== undefined && (
                                    <div>
                                        <span className="text-gray-500">Per User:</span> {form.perUserLimit} uses
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {form.linkTTLSeconds !== undefined && (
                        <div>
                            <div className="text-sm font-medium text-gray-600 dark:text-gray-400">Link TTL</div>
                            <div className="text-sm text-gray-700 dark:text-gray-300">
                                {formatTTL(form.linkTTLSeconds)}
                            </div>
                        </div>
                    )}

                    {form.productIds && form.productIds.length > 0 && (
                        <div>
                            <div className="text-sm font-medium text-gray-600 dark:text-gray-400">
                                Products ({form.productIds.length})
                            </div>
                            <div className="text-xs text-gray-500 dark:text-gray-400">
                                {form.productIds.length > 5 
                                    ? `${form.productIds.slice(0, 5).join(', ')}... +${form.productIds.length - 5} more`
                                    : form.productIds.join(', ')
                                }
                            </div>
                        </div>
                    )}

                    {form.tags && form.tags.length > 0 && (
                        <div>
                            <div className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">Tags</div>
                            <div className="flex flex-wrap gap-1">
                                {form.tags.map((tag, i) => (
                                    <Tag key={i} className="text-xs bg-blue-100 text-blue-800 border border-blue-200 px-2 py-0.5 rounded">
                                        {tag}
                                    </Tag>
                                ))}
                            </div>
                        </div>
                    )}

                    {form.notes && (
                        <div>
                            <div className="text-sm font-medium text-gray-600 dark:text-gray-400">Notes</div>
                            <div className="text-sm text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-800 p-2 rounded border">
                                {form.notes}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </Card>
    )
}
