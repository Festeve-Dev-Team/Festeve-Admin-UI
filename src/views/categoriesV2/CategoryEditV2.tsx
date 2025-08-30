import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import useCategories from './hooks/useCategories'
import { apiToFormData } from './utils/dataTransform'
import CategoryFormV2 from './CategoryFormV2'
import type { CategoryFormInput } from './schema/categorySchema'
import Card from '@/components/ui/Card'
import Spinner from '@/components/ui/Spinner'

export default function CategoryEditV2() {
    const { id } = useParams<{ id: string }>()
    const navigate = useNavigate()
    const { selectedCategory, isCategoryLoading, loadCategory } = useCategories()
    const [initialData, setInitialData] = useState<CategoryFormInput | null>(null)

    useEffect(() => {
        if (id) {
            loadCategory(id)
        }
    }, [id, loadCategory])

    useEffect(() => {
        if (selectedCategory && selectedCategory.id === id) {
            setInitialData(apiToFormData(selectedCategory))
        }
    }, [selectedCategory, id])

    const handleSaved = () => {
        navigate('/app/categories-v2/category-list')
    }

    if (isCategoryLoading) {
        return (
            <Card className="h-full">
                <div className="flex items-center justify-center h-96">
                    <Spinner size="xl" />
                </div>
            </Card>
        )
    }

    if (!initialData) {
        return (
            <Card className="h-full">
                <div className="flex items-center justify-center h-96">
                    <div className="text-center">
                        <h3 className="text-lg font-medium text-gray-900">Category not found</h3>
                        <p className="text-gray-500 mt-2">The category you're looking for doesn't exist.</p>
                    </div>
                </div>
            </Card>
        )
    }

    return (
        <CategoryFormV2
            initial={initialData}
            onSaved={handleSaved}
            headerTitle={`Edit ${initialData.name}`}
        />
    )
}
