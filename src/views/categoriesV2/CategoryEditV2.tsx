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
    const { selectedCategory, isCategoryLoading, loadCategory, categories, error } = useCategories()
    const [initialData, setInitialData] = useState<CategoryFormInput | null>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        if (!id) {
            navigate('/app/categories-v2/category-list')
            return
        }

        // First, check if the category is already in the Redux store
        const existingCategory = categories.find(c => c.id === id || (c as any)._id === id)
        if (existingCategory) {
            console.log('✅ CategoryEditV2 - Found category in Redux store:', existingCategory)
            try {
                const formData = apiToFormData(existingCategory)
                console.log('✅ CategoryEditV2 - Form data transformed from Redux:', formData)
                setInitialData(formData)
                setLoading(false)
                return
            } catch (error) {
                console.error('Error transforming category data from Redux:', error)
            }
        }

        // If not in store, fetch from API
        loadCategory(id)
    }, [id, loadCategory, navigate, categories])

    useEffect(() => {
        if (selectedCategory && (selectedCategory.id === id || (selectedCategory as any)._id === id)) {
            console.log('🔄 CategoryEditV2 - Transforming category data from API:', selectedCategory)
            try {
                const formData = apiToFormData(selectedCategory)
                console.log('✅ CategoryEditV2 - Form data transformed from API:', formData)
                setInitialData(formData)
                setLoading(false)
            } catch (error) {
                console.error('Error transforming category data:', error)
                setLoading(false)
            }
        } else if (!isCategoryLoading && !selectedCategory && id && !initialData) {
            setLoading(false)
        }
    }, [selectedCategory, id, isCategoryLoading, error, initialData])

    const handleSaved = () => {
        navigate('/app/categories-v2/category-list')
    }

    if (loading || isCategoryLoading) {
        return (
            <Card className="h-full">
                <div className="flex items-center justify-center h-96">
                    <Spinner size="xl" />
                </div>
            </Card>
        )
    }

    // If we have initial data, show the form even if there's an error
    // (the error might be from a different category or stale state)
    if (initialData) {
        return (
            <CategoryFormV2
                initial={initialData}
                onSaved={handleSaved}
                headerTitle={`Edit ${initialData.name}`}
            />
        )
    }

    if (error) {
        return (
            <Card className="h-full">
                <div className="flex items-center justify-center h-96">
                    <div className="text-center">
                        <h3 className="text-lg font-medium text-red-600">Error loading category</h3>
                        <p className="text-gray-500 mt-2">{error}</p>
                    </div>
                </div>
            </Card>
        )
    }

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
