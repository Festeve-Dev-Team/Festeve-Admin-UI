import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import { FormContainer, FormItem } from '@/components/ui/Form'
import ProductSelector from './ProductSelector'

type Row = { productId: string; relation: string }

type Props = {
    value: Row[]
    onChange: (v: Row[]) => void
}

const relationOptions = ['poojaKit', 'decor', 'sweets', 'gifts']

export default function LinkedProductsEditor({ value, onChange }: Props) {
    function addRow() {
        onChange([{ productId: '', relation: '' }, ...value])
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
                <h4 className="font-semibold">Linked Products</h4>
                <Button size="sm" onClick={addRow}>Add</Button>
            </div>
            {value.length === 0 && (
                <div className="text-sm text-gray-500">No linked products. Use Add to create a row.</div>
            )}
            <div className="space-y-2">
                {value.map((row, i) => (
                    <div key={i} className="grid grid-cols-1 md:grid-cols-3 gap-2 items-end">
                        <FormItem label="Product">
                            <ProductSelector 
                                value={row.productId} 
                                onChange={(id) => updateRow(i, 'productId', id)}
                                placeholder="Search and select product..."
                            />
                        </FormItem>
                        <FormItem label="Relation">
                            <select className="input" value={row.relation} onChange={(e) => updateRow(i, 'relation', e.target.value)}>
                                <option value="">Select or type…</option>
                                {relationOptions.map((r) => (
                                    <option key={r} value={r}>{r}</option>
                                ))}
                            </select>
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



