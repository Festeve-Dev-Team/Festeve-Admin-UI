import Card from '@/components/ui/Card'
import Tag from '@/components/ui/Tag'
import { formatCurrency, calcEffectivePrice } from '../utils/pricing'
import type { ProductFormInput } from '../schema/productSchema'

type Props = {
    form: ProductFormInput
}

export default function RightRailPreview({ form }: Props) {
    const primaryVariant = form.variants[0]
    const effective = primaryVariant
        ? calcEffectivePrice(
              primaryVariant.price,
              primaryVariant.discountType,
              primaryVariant.discountValue,
          )
        : 0

    const now = Date.now()
    const start = form.offerStart ? new Date(form.offerStart).getTime() : 0
    const end = form.offerEnd ? new Date(form.offerEnd).getTime() : 0
    const activeOffer = start && end && now >= start && now <= end

    const countdown = activeOffer
        ? Math.max(0, end - now)
        : 0

    const countdownText = () => {
        const secs = Math.floor(countdown / 1000)
        const d = Math.floor(secs / 86400)
        const h = Math.floor((secs % 86400) / 3600)
        const m = Math.floor((secs % 3600) / 60)
        return `${d}d ${h}h ${m}m`
    }

    return (
        <div className="space-y-4">
            <Card className="p-4">
                <div className="flex items-start justify-between">
                    <div>
                        <h4 className="font-semibold">Product Preview</h4>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                            Live preview of primary variant
                        </p>
                    </div>
                    {form.isTrending && (
                        <Tag className="bg-emerald-100 text-emerald-800 border border-emerald-200 px-2 py-0.5 rounded" prefix aria-label="Trending">
                            Trending
                        </Tag>
                    )}
                </div>
                <div className="mt-4">
                    <div className="text-lg font-medium">{form.name || 'Untitled product'}</div>
                    <div className="text-sm text-gray-500">{form.category || 'Uncategorized'}</div>
                    {primaryVariant && (
                        <div className="mt-3 flex items-center gap-2">
                            <span className="text-xl font-semibold">
                                {formatCurrency(effective)}
                            </span>
                            {effective !== primaryVariant.price && (
                                <>
                                    <span className="line-through text-gray-400">
                                        {formatCurrency(primaryVariant.price)}
                                    </span>
                                    <Badge className="bg-rose-600">
                                        -
                                        {primaryVariant.discountType === 'percentage'
                                            ? `${primaryVariant.discountValue}%`
                                            : formatCurrency(primaryVariant.discountValue)}
                                    </Badge>
                                </>
                            )}
                        </div>
                    )}
                </div>
            </Card>

            <Card className="p-4">
                <h4 className="font-semibold">Offer</h4>
                <div className="mt-3 text-sm">
                    <div className="flex items-center justify-between">
                        <span>Type</span>
                        <span className="font-medium">{form.offerType}</span>
                    </div>
                    <div className="flex items-center justify-between mt-2">
                        <span>Status</span>
                        <span className="font-medium">
                            {activeOffer ? 'Active' : 'Inactive'}
                        </span>
                    </div>
                    {activeOffer && (
                        <div className="flex items-center justify-between mt-2">
                            <span>Ends in</span>
                            <span className="font-medium">{countdownText()}</span>
                        </div>
                    )}
                </div>
            </Card>

            <Card className="p-4">
                <h4 className="font-semibold">Inventory</h4>
                <div className="mt-3 text-sm space-y-1">
                    <div className="flex items-center justify-between">
                        <span>Variants</span>
                        <span className="font-medium">{form.variants.length}</span>
                    </div>
                    <div className="flex items-center justify-between">
                        <span>Total stock</span>
                        <span className="font-medium">
                            {form.variants.reduce((sum, v) => sum + (v.stock || 0), 0)}
                        </span>
                    </div>
                    <div className="flex items-center justify-between">
                        <span>Active variants</span>
                        <span className="font-medium">
                            {form.variants.filter((v) => v.isActive).length}
                        </span>
                    </div>
                </div>
            </Card>
        </div>
    )
}


