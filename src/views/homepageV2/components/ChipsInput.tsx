import { useState } from 'react'
import Input from '@/components/ui/Input'
import Tag from '@/components/ui/Tag'

type Props = { value: string[]; onChange: (v: string[]) => void; placeholder?: string }

export default function ChipsInput({ value, onChange, placeholder }: Props) {
    const [text, setText] = useState('')
    const commit = () => {
        const t = text.trim()
        if (!t) return
        const next = Array.from(new Map([...value, t].map((s) => [s.toLowerCase(), s])).values())
        onChange(next)
        setText('')
    }
    const remove = (i: number) => {
        const next = value.slice(); next.splice(i, 1); onChange(next)
    }
    return (
        <div>
            <div className="flex flex-wrap gap-2 mb-2">
                {value.map((v, i) => (
                    <Tag key={v + i} className="bg-gray-100 border px-2 py-0.5 rounded">
                        {v}
                        <button className="ml-2 text-xs text-gray-500" onClick={() => remove(i)}>×</button>
                    </Tag>
                ))}
            </div>
            <Input value={text} placeholder={placeholder || 'Type and press Enter'} onChange={(e) => setText(e.target.value)} onKeyDown={(e) => {
                if (e.key === 'Enter') { e.preventDefault(); commit() }
                if (e.key === 'Backspace' && text === '' && value.length) remove(value.length - 1)
            }} />
        </div>
    )
}



