import Card from '@/components/ui/Card'
import type { VendorFormInput } from '../schema/vendorSchema'
import useProductsLookup from '../hooks/useProductsLookup'

type Props = { form: VendorFormInput }

export default function VendorPreview({ form }: Props) {
    const { resolved, unknownIds } = useProductsLookup(form.productIds)
    return (
        <div className="space-y-4">
            <Card className="p-4">
                <h4 className="font-semibold">Vendor</h4>
                <div className="text-sm text-gray-600">{form.name || 'New Vendor'} • {form.productIds.length} products</div>
            </Card>
            <Card className="p-4">
                <h4 className="font-semibold">Sample products</h4>
                <div className="mt-2 text-sm space-y-1">
                    {resolved.slice(0, 5).map((p) => (
                        <div key={p.id}>{p.title || '(Unknown)'} — {p.id}</div>
                    ))}
                    {resolved.length === 0 && <div className="text-xs text-gray-500">No products yet</div>}
                </div>
                {unknownIds.length > 0 && (
                    <div className="mt-2 text-xs text-amber-700">Unknown IDs: {unknownIds.join(', ')}</div>
                )}
            </Card>
        </div>
    )
}



