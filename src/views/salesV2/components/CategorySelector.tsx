import { useEffect, useState } from 'react'
import { FormItem } from '@/components/ui/Form'
import Badge from '@/components/ui/Badge'
import useCategories from '@/views/categoriesV2/hooks/useCategories'
import type { CategoryWithId } from '@/views/categoriesV2/types/category'

type Props = {
    value: string
    onChange: (categoryId: string) => void
    label?: string
    invalid?: boolean
    errorMessage?: string
}

export default function CategorySelector({ value, onChange, label = "Category", invalid, errorMessage }: Props) {
    const [selectedLevel1, setSelectedLevel1] = useState<string>('')
    const [selectedLevel2, setSelectedLevel2] = useState<string>('')
    const [selectedLevel3, setSelectedLevel3] = useState<string>('')
    
    const { 
        categories, 
        loadCategories, 
        isCategoriesLoading,
        categoriesError
    } = useCategories()

    // Load categories on mount
    useEffect(() => {
        if (categories.length === 0) {
            loadCategories({ limit: 1000 })
        }
    }, [categories.length, loadCategories])

    // Update local state when value changes from outside
    useEffect(() => {
        if (value && categories.length > 0) {
            const selectedCategory = categories.find(cat => cat.id === value)
            if (selectedCategory) {
                // Build path from selected category back to root
                const buildPath = (cat: CategoryWithId): string[] => {
                    if (!cat.parentId) return [cat.id]
                    const parent = categories.find(c => c.id === cat.parentId)
                    if (!parent) return [cat.id]
                    return [...buildPath(parent), cat.id]
                }
                
                const path = buildPath(selectedCategory)
                setSelectedLevel1(path[0] || '')
                setSelectedLevel2(path[1] || '')
                setSelectedLevel3(path[2] || '')
            }
        } else {
            setSelectedLevel1('')
            setSelectedLevel2('')
            setSelectedLevel3('')
        }
    }, [value, categories])

    // Get level 1 categories (root categories)
    const level1Categories = categories.filter(cat => !cat.parentId && cat.isActive)

    // Get level 2 categories (children of selected level 1)
    const level2Categories = selectedLevel1 
        ? categories.filter(cat => cat.parentId === selectedLevel1 && cat.isActive)
        : []

    // Get level 3 categories (children of selected level 2)
    const level3Categories = selectedLevel2 
        ? categories.filter(cat => cat.parentId === selectedLevel2 && cat.isActive)
        : []

    // Debug logging for development (only when needed)
    // console.log('Categories loaded:', categories.length)
    // console.log('Selected Level 1:', selectedLevel1, 'Level 2 available:', level2Categories.length)

    // Handle level 1 selection
    const handleLevel1Change = (categoryId: string) => {
        setSelectedLevel1(categoryId)
        setSelectedLevel2('')
        setSelectedLevel3('')
        
        if (!categoryId) {
            onChange('')
            return
        }
        
        // Check if this category has children
        const hasChildren = categories.some(cat => cat.parentId === categoryId)
        // console.log('Level 1 selected:', categoryId, 'hasChildren:', hasChildren)
        
        if (!hasChildren) {
            // No children, this is the final selection
            onChange(categoryId)
        } else {
            // Has children, wait for further selection
            onChange('') 
        }
    }

    // Handle level 2 selection
    const handleLevel2Change = (categoryId: string) => {
        setSelectedLevel2(categoryId)
        setSelectedLevel3('')
        
        if (!categoryId) {
            onChange('')
            return
        }
        
        // Check if this category has children
        const hasChildren = categories.some(cat => cat.parentId === categoryId)
        // console.log('Level 2 selected:', categoryId, 'hasChildren:', hasChildren)
        
        if (!hasChildren) {
            // No children, this is the final selection
            onChange(categoryId)
        } else {
            // Has children, wait for further selection
            onChange('') 
        }
    }

    // Handle level 3 selection
    const handleLevel3Change = (categoryId: string) => {
        setSelectedLevel3(categoryId)
        onChange(categoryId) // Level 3 is always final
    }

    // Get display path
    const getDisplayPath = () => {
        const parts: string[] = []
        if (selectedLevel1) {
            const cat1 = categories.find(cat => cat.id === selectedLevel1)
            if (cat1) parts.push(cat1.name)
        }
        if (selectedLevel2) {
            const cat2 = categories.find(cat => cat.id === selectedLevel2)
            if (cat2) parts.push(cat2.name)
        }
        if (selectedLevel3) {
            const cat3 = categories.find(cat => cat.id === selectedLevel3)
            if (cat3) parts.push(cat3.name)
        }
        return parts.join(' > ')
    }

    const selectedCategory = categories.find(cat => cat.id === value)

    if (categoriesError) {
        return (
            <FormItem label={label} invalid={invalid} errorMessage={errorMessage}>
                <div className="p-3 border border-red-200 rounded bg-red-50 text-red-600 text-sm">
                    Error loading categories: {categoriesError}
                </div>
            </FormItem>
        )
    }

    return (
        <FormItem label={label} invalid={invalid} errorMessage={errorMessage}>
            <div className="space-y-3">
                {/* Level 1 Dropdown */}
                <div>
                    <label className="block text-sm font-medium mb-1">Category (Level 1)</label>
                    <select
                        className="input w-full"
                        value={selectedLevel1}
                        onChange={(e) => handleLevel1Change(e.target.value)}
                        disabled={isCategoriesLoading}
                    >
                        <option value="">{isCategoriesLoading ? 'Loading...' : 'Select category'}</option>
                        {level1Categories.map((cat) => (
                            <option key={cat.id} value={cat.id}>
                                {cat.name}
                            </option>
                        ))}
                    </select>
                </div>

                {/* Level 2 Dropdown */}
                {selectedLevel1 && level2Categories.length > 0 && (
                    <div>
                        <label className="block text-sm font-medium mb-1">Subcategory (Level 2)</label>
                        <select
                            className="input w-full"
                            value={selectedLevel2}
                            onChange={(e) => handleLevel2Change(e.target.value)}
                        >
                            <option value="">Select subcategory</option>
                            {level2Categories.map((cat) => (
                                <option key={cat.id} value={cat.id}>
                                    {cat.name}
                                </option>
                            ))}
                        </select>
                    </div>
                )}

                {/* Level 3 Dropdown */}
                {selectedLevel2 && level3Categories.length > 0 && (
                    <div>
                        <label className="block text-sm font-medium mb-1">Sub-subcategory (Level 3)</label>
                        <select
                            className="input w-full"
                            value={selectedLevel3}
                            onChange={(e) => handleLevel3Change(e.target.value)}
                        >
                            <option value="">Select sub-subcategory</option>
                            {level3Categories.map((cat) => (
                                <option key={cat.id} value={cat.id}>
                                    {cat.name}
                                </option>
                            ))}
                        </select>
                    </div>
                )}

                {/* Selected Path Display */}
                {selectedCategory && (
                    <div className="p-2 bg-gray-50 dark:bg-gray-800 rounded border">
                        <div className="flex items-center justify-between">
                            <div>
                                <div className="text-sm font-medium">Selected: {getDisplayPath()}</div>
                                <div className="text-xs text-gray-500">
                                    ID: {selectedCategory.id} | Level: {selectedCategory.level}
                                </div>
                            </div>
                            <Badge className={`text-xs ${
                                selectedCategory.level === 1 ? 'bg-green-100 text-green-800' :
                                selectedCategory.level === 2 ? 'bg-blue-100 text-blue-800' :
                                'bg-purple-100 text-purple-800'
                            }`}>
                                L{selectedCategory.level}
                            </Badge>
                        </div>
                    </div>
                )}
            </div>
        </FormItem>
    )
}