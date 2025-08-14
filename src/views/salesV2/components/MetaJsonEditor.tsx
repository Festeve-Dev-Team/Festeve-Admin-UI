import { useState, useEffect } from 'react'
import Input from '@/components/ui/Input'
import { FormItem } from '@/components/ui/Form'

type Props = {
    value: Record<string, unknown>
    onChange: (v: Record<string, unknown>) => void
}

export default function MetaJsonEditor({ value, onChange }: Props) {
    const [text, setText] = useState('')
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        try {
            setText(JSON.stringify(value, null, 2))
        } catch {
            setText('{}')
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    function handleBlur() {
        try {
            const parsed = JSON.parse(text)
            onChange(parsed)
            setError(null)
        } catch (e) {
            setError('Invalid JSON')
        }
    }

    return (
        <FormItem label="Meta (JSON)" invalid={!!error} errorMessage={error ?? undefined}>
            <Input
                asElement="textarea"
                rows={10}
                value={text}
                onChange={(e) => setText((e.target as HTMLTextAreaElement).value)}
                onBlur={handleBlur}
            />
        </FormItem>
    )
}


