import { useState } from 'react'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import Tag from '@/components/ui/Tag'
import { HiPlus, HiX } from 'react-icons/hi'

type Props = {
    value: string[]
    onChange: (attributes: string[]) => void
}

export default function AttributesEditor({ value, onChange }: Props) {
    const [newAttribute, setNewAttribute] = useState('')

    const addAttribute = () => {
        const trimmed = newAttribute.trim()
        if (trimmed && !value.includes(trimmed)) {
            onChange([...value, trimmed])
            setNewAttribute('')
        }
    }

    const removeAttribute = (index: number) => {
        const updated = value.filter((_, i) => i !== index)
        onChange(updated)
    }

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            e.preventDefault()
            addAttribute()
        }
    }

    return (
        <div className="space-y-4">
            <div>
                <label className="block text-sm font-medium mb-2">Category Attributes</label>
                <p className="text-xs text-gray-500 mb-3">
                    Define attributes that products in this category can have (e.g., brand, color, size, warranty)
                </p>
                
                <div className="flex gap-2 mb-3">
                    <Input
                        value={newAttribute}
                        onChange={(e) => setNewAttribute(e.target.value)}
                        onKeyPress={handleKeyPress}
                        placeholder="Enter attribute name (e.g., brand, color)"
                        className="flex-1"
                    />
                    <Button 
                        type="button"
                        size="sm"
                        onClick={addAttribute}
                        disabled={!newAttribute.trim()}
                        icon={<HiPlus />}
                    >
                        Add
                    </Button>
                </div>
            </div>

            <div className="min-h-[100px] border border-gray-200 rounded-lg p-3">
                {value.length === 0 ? (
                    <div className="text-center text-gray-500 text-sm py-8">
                        No attributes defined yet. Add attributes above.
                    </div>
                ) : (
                    <div className="flex flex-wrap gap-2">
                        {value.map((attribute, index) => (
                            <Tag 
                                key={index}
                                className="bg-blue-100 text-blue-800 border border-blue-200 px-3 py-1 rounded-full flex items-center gap-2"
                            >
                                <span>{attribute}</span>
                                <button
                                    type="button"
                                    onClick={() => removeAttribute(index)}
                                    className="text-blue-600 hover:text-blue-800 ml-1"
                                    aria-label={`Remove ${attribute}`}
                                >
                                    <HiX className="w-3 h-3" />
                                </button>
                            </Tag>
                        ))}
                    </div>
                )}
            </div>

            {value.length > 0 && (
                <div className="text-xs text-gray-500">
                    {value.length} attribute{value.length !== 1 ? 's' : ''} defined
                </div>
            )}
        </div>
    )
}
