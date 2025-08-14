import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import Switcher from '@/components/ui/Switcher'
import { normalizePositions, hasAtLeastOneTarget } from '../utils'
import { FormContainer, FormItem } from '@/components/ui/Form'

type Banner = {
    title?: string
    description?: string
    imageUrl: string
    linkUrl?: string
    productId?: string
    eventId?: string
    position: number
    isActive: boolean
}

type Props = { value: Banner[]; onChange: (v: Banner[]) => void }

export default function BannerBoard({ value, onChange }: Props) {
    function add() { onChange(normalizePositions([{ title: '', description: '', imageUrl: '', linkUrl: '', productId: '', eventId: '', position: 0, isActive: true }, ...value])) }
    function remove(i: number) { const next = value.slice(); next.splice(i, 1); onChange(normalizePositions(next)) }
    function update(i: number, k: keyof Banner, v: string | boolean) { const next = value.slice(); next[i] = { ...next[i], [k]: v as any }; onChange(normalizePositions(next)) }
    function up(i: number) { if (i === 0) return; const next = value.slice(); const [b] = next.splice(i, 1); next.splice(i - 1, 0, b); onChange(normalizePositions(next)) }
    function down(i: number) { if (i >= value.length - 1) return; const next = value.slice(); const [b] = next.splice(i, 1); next.splice(i + 1, 0, b); onChange(normalizePositions(next)) }

    return (
        <div className="space-y-3">
            <div className="flex items-center justify-between">
                <h4 className="font-semibold">Banners</h4>
                <Button size="sm" onClick={add}>Add</Button>
            </div>
            {value.length === 0 && <div className="text-sm text-gray-500">No banners.</div>}
            <div className="space-y-3">
                {value.map((b, i) => (
                    <div key={i} className="p-3 border rounded-md">
                        <div className="flex items-center justify-between text-sm mb-2">
                            <div>Position: {b.position}</div>
                            <div className="flex gap-2">
                                <Button size="sm" onClick={() => up(i)}>Up</Button>
                                <Button size="sm" onClick={() => down(i)}>Down</Button>
                                <Button size="sm" variant="twoTone" className="text-red-600" onClick={() => remove(i)}>Delete</Button>
                            </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-2 items-end">
                            <FormItem label="Title"><Input value={b.title || ''} onChange={(e) => update(i, 'title', e.target.value)} /></FormItem>
                            <FormItem label="Description"><Input value={b.description || ''} onChange={(e) => update(i, 'description', e.target.value)} /></FormItem>
                            <FormItem label="Image URL"><Input value={b.imageUrl || ''} onChange={(e) => update(i, 'imageUrl', e.target.value)} /></FormItem>
                            <FormItem label="Link URL"><Input value={b.linkUrl || ''} onChange={(e) => update(i, 'linkUrl', e.target.value)} /></FormItem>
                            <FormItem label="Product ID"><Input value={b.productId || ''} onChange={(e) => update(i, 'productId', e.target.value)} /></FormItem>
                            <FormItem label="Event ID"><Input value={b.eventId || ''} onChange={(e) => update(i, 'eventId', e.target.value)} /></FormItem>
                            <FormItem label="Active"><Switcher checked={!!b.isActive} onChange={(c) => update(i, 'isActive', c)} /></FormItem>
                        </div>
                        {b.isActive && !hasAtLeastOneTarget({ linkUrl: b.linkUrl, productId: b.productId, eventId: b.eventId }) && (
                            <div className="text-xs text-rose-600 mt-1">Provide at least one target (linkUrl/productId/eventId)</div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    )
}



