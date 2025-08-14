import { useState } from 'react'
import Button from '@/components/ui/Button'
import Tag from '@/components/ui/Tag'
import Input from '@/components/ui/Input'
import PasteIdsDialog from './PasteIdsDialog'
import { searchProducts } from '../services/vendorApi'

type Props = { value: string[]; onChange: (v: string[]) => void }

export default function ProductIdsEditor({ value, onChange }: Props) {
    const [open, setOpen] = useState(false)
    const [q, setQ] = useState('')
    const [results, setResults] = useState<Array<{ id: string; title: string }>>([])

    async function onSearch(text: string) {
        setQ(text)
        setResults(await searchProducts(text, 10))
    }

    function add(id: string) {
        if (!value.includes(id)) onChange([id, ...value])
    }
    function remove(id: string) {
        onChange(value.filter((x) => x !== id))
    }

    return (
        <div className="space-y-3">
            <div className="flex items-center gap-2">
                <Input placeholder="Search products" value={q} onChange={(e) => onSearch(e.target.value)} />
                <Button size="sm" onClick={() => setOpen(true)}>Paste IDs</Button>
            </div>
            {q && (
                <div className="border rounded p-2 space-y-1 max-h-52 overflow-auto">
                    {results.map((r) => (
                        <div key={r.id} className="flex items-center justify-between text-sm">
                            <div>
                                <div className="font-medium">{r.title}</div>
                                <div className="text-gray-500">{r.id}</div>
                            </div>
                            <Button size="sm" onClick={() => add(r.id)}>Add</Button>
                        </div>
                    ))}
                    {results.length === 0 && <div className="text-xs text-gray-500">No results</div>}
                </div>
            )}
            <div className="flex flex-wrap gap-2">
                {value.length === 0 && <div className="text-xs text-gray-500">No products selected.</div>}
                {value.map((id) => (
                    <Tag key={id} className="bg-gray-100 border px-2 py-0.5 rounded">
                        {id}
                        <button className="ml-2 text-xs text-gray-500" onClick={() => remove(id)} aria-label={`Remove ${id}`}>×</button>
                    </Tag>
                ))}
            </div>
            <PasteIdsDialog open={open} onClose={() => setOpen(false)} onApply={(ids) => {
                const merged = Array.from(new Set([...ids, ...value]))
                onChange(merged)
            }} />
        </div>
    )
}



