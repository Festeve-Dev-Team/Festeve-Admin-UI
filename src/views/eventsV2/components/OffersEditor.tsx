import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import { FormContainer, FormItem } from '@/components/ui/Form'

type Row = { offerType: string; productId: string }

type Props = {
    value: Row[]
    onChange: (v: Row[]) => void
}

const offerTypes = ['exclusive_offer', 'flash_sale', 'bogo', 'percentage']

export default function OffersEditor({ value, onChange }: Props) {
    function addRow() {
        onChange([{ offerType: 'exclusive_offer', productId: '' }, ...value])
    }
    function updateRow(i: number, key: keyof Row, val: string) {
        const next = value.slice()
        next[i] = { ...next[i], [key]: val }
        onChange(next)
    }
    function removeRow(i: number) {
        const next = value.slice()
        next.splice(i, 1)
        onChange(next)
    }

    return (
        <div className="space-y-3">
            <div className="flex justify-between items-center">
                <h4 className="font-semibold">Offers</h4>
                <Button size="sm" onClick={addRow}>Add</Button>
            </div>
            {value.length === 0 && (
                <div className="text-sm text-gray-500">No offers linked.</div>
            )}
            <div className="space-y-2">
                {value.map((row, i) => (
                    <div key={i} className="grid grid-cols-1 md:grid-cols-3 gap-2 items-end">
                        <FormItem label="Offer Type">
                            <select className="input" value={row.offerType} onChange={(e) => updateRow(i, 'offerType', e.target.value)}>
                                {offerTypes.map((t) => (
                                    <option key={t} value={t}>{t}</option>
                                ))}
                            </select>
                        </FormItem>
                        <FormItem label="Product ID">
                            <Input value={row.productId} onChange={(e) => updateRow(i, 'productId', e.target.value)} />
                        </FormItem>
                        <div className="flex gap-2">
                            <Button size="sm" variant="twoTone" onClick={() => removeRow(i)}>Remove</Button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}



