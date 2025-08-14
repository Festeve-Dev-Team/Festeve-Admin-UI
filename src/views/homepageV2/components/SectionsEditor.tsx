import { FormContainer, FormItem } from '@/components/ui/Form'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import Switcher from '@/components/ui/Switcher'

type Section = {
    key: string
    enabled: boolean
    title?: string
    description?: string
    imageUrl?: string
    productId?: string
    eventId?: string
}

type Props = { value: Section[]; onChange: (v: Section[]) => void }

const keySuggestions = ['whatsToday', 'trendingProducts', 'testimonials', 'exclusiveOffer', 'flashSale']

export default function SectionsEditor({ value, onChange }: Props) {
    function addRow() { onChange([{ key: '', enabled: true, title: '', description: '', imageUrl: '', productId: '', eventId: '' }, ...value]) }
    function removeRow(i: number) { const next = value.slice(); next.splice(i, 1); onChange(next) }
    function update(i: number, k: keyof Section, v: string | boolean) { const next = value.slice(); next[i] = { ...next[i], [k]: v as any }; onChange(next) }
    function duplicate(i: number) { const next = value.slice(); next.splice(i, 0, { ...value[i] }); onChange(next) }

    return (
        <div className="space-y-3">
            <div className="flex items-center justify-between">
                <h4 className="font-semibold">Sections</h4>
                <Button size="sm" onClick={addRow}>Add</Button>
            </div>
            {value.length === 0 && <div className="text-sm text-gray-500">No sections.</div>}
            <div className="space-y-3">
                {value.map((s, i) => (
                    <CardLike key={i}>
                        <div className="grid grid-cols-1 md:grid-cols-6 gap-2 items-end">
                            <FormItem label="Key">
                                <select className="input" value={s.key} onChange={(e) => update(i, 'key', e.target.value)}>
                                    <option value="">Custom…</option>
                                    {keySuggestions.map((k) => (<option key={k} value={k}>{k}</option>))}
                                </select>
                            </FormItem>
                            <FormItem label="Enabled">
                                <Switcher checked={!!s.enabled} onChange={(c) => update(i, 'enabled', c)} />
                            </FormItem>
                            <FormItem label="Title"><Input value={s.title || ''} onChange={(e) => update(i, 'title', e.target.value)} /></FormItem>
                            <FormItem label="Description"><Input asElement="textarea" rows={2} value={s.description || ''} onChange={(e) => update(i, 'description', e.target.value)} /></FormItem>
                            <FormItem label="Image URL"><Input value={s.imageUrl || ''} onChange={(e) => update(i, 'imageUrl', e.target.value)} /></FormItem>
                            <FormItem label="Product ID"><Input value={s.productId || ''} onChange={(e) => update(i, 'productId', e.target.value)} /></FormItem>
                            <FormItem label="Event ID"><Input value={s.eventId || ''} onChange={(e) => update(i, 'eventId', e.target.value)} /></FormItem>
                        </div>
                        <div className="flex gap-2 mt-2">
                            <Button size="sm" onClick={() => duplicate(i)}>Duplicate</Button>
                            <Button size="sm" variant="twoTone" className="text-red-600" onClick={() => removeRow(i)}>Delete</Button>
                        </div>
                    </CardLike>
                ))}
            </div>
        </div>
    )
}

function CardLike({ children }: { children: React.ReactNode }) {
    return <div className="p-3 border rounded-md">{children}</div>
}



