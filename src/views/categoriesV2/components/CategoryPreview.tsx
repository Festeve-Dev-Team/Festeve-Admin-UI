import Card from '@/components/ui/Card'
import Badge from '@/components/ui/Badge'
import Tag from '@/components/ui/Tag'
import type { CategoryFormInput } from '../schema/categorySchema'

type Props = { 
    form: CategoryFormInput
    selectedLevel: number
}

export default function CategoryPreview({ form, selectedLevel }: Props) {
    const getLevelBadgeColor = (level: number) => {
        switch (level) {
            case 1: return 'bg-green-100 text-green-800'
            case 2: return 'bg-blue-100 text-blue-800'
            case 3: return 'bg-purple-100 text-purple-800'
            default: return 'bg-gray-100 text-gray-800'
        }
    }

    return (
        <div className="space-y-4">
            <Card className="p-4">
                <h4 className="font-semibold mb-3">Category Preview</h4>
                
                <div className="space-y-3">
                    <div>
                        <div className="text-lg font-medium">{form.name || 'Untitled Category'}</div>
                        <div className="text-sm text-gray-500">Display Order: {form.displayOrder}</div>
                    </div>

                    <div className="flex items-center gap-2">
                        <Badge className={getLevelBadgeColor(selectedLevel)}>
                            Level {selectedLevel}
                        </Badge>
                        {form.isActive ? (
                            <Badge className="bg-green-100 text-green-800">Active</Badge>
                        ) : (
                            <Badge className="bg-gray-100 text-gray-800">Inactive</Badge>
                        )}
                    </div>

                    {form.parentId && (
                        <div className="text-sm">
                            <span className="text-gray-500">Parent ID:</span> {form.parentId}
                        </div>
                    )}
                </div>
            </Card>

            <Card className="p-4">
                <h4 className="font-semibold mb-3">Attributes</h4>
                
                {form.attributes.length === 0 ? (
                    <div className="text-sm text-gray-500 text-center py-4">
                        No attributes defined
                    </div>
                ) : (
                    <div className="space-y-2">
                        <div className="text-sm text-gray-600">
                            Products in this category can have:
                        </div>
                        <div className="flex flex-wrap gap-1">
                            {form.attributes.map((attr, index) => (
                                <Tag 
                                    key={index}
                                    className="bg-gray-100 text-gray-700 border border-gray-200 px-2 py-1 rounded text-xs"
                                >
                                    {attr}
                                </Tag>
                            ))}
                        </div>
                    </div>
                )}
            </Card>

            <Card className="p-4">
                <h4 className="font-semibold mb-3">Validation</h4>
                
                <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2">
                        {form.name ? (
                            <span className="text-green-600">✓</span>
                        ) : (
                            <span className="text-red-600">✗</span>
                        )}
                        <span>Category name provided</span>
                    </div>
                    
                    <div className="flex items-center gap-2">
                        {form.displayOrder >= 1 ? (
                            <span className="text-green-600">✓</span>
                        ) : (
                            <span className="text-red-600">✗</span>
                        )}
                        <span>Valid display order</span>
                    </div>

                    {selectedLevel > 1 && (
                        <div className="flex items-center gap-2">
                            {form.parentId ? (
                                <span className="text-green-600">✓</span>
                            ) : (
                                <span className="text-red-600">✗</span>
                            )}
                            <span>Parent category selected</span>
                        </div>
                    )}
                </div>
            </Card>
        </div>
    )
}
