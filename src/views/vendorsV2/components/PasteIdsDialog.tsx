import { useState } from 'react'
import Dialog from '@/components/ui/Dialog'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import { parseIdsFromText } from '../utils'

type Props = { open: boolean; onClose: () => void; onApply: (ids: string[]) => void }

export default function PasteIdsDialog({ open, onClose, onApply }: Props) {
    const [text, setText] = useState('')
    return (
        <Dialog isOpen={open} onClose={onClose} onRequestClose={onClose} title="Paste IDs">
            <div className="space-y-3 p-2">
                <Input asElement="textarea" rows={8} value={text} onChange={(e) => setText((e.target as HTMLTextAreaElement).value)} />
                <div className="flex justify-end gap-2">
                    <Button onClick={onClose}>Cancel</Button>
                    <Button variant="solid" onClick={() => { onApply(parseIdsFromText(text)); setText(''); onClose() }}>Apply</Button>
                </div>
            </div>
        </Dialog>
    )
}



