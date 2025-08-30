import { useNavigate } from 'react-router-dom'
import CategoryFormV2 from './CategoryFormV2'
import { defaultCategoryValues } from './schema/categorySchema'

export default function CategoryCreateV2() {
    const navigate = useNavigate()

    const handleSaved = () => {
        navigate('/app/categories-v2/category-list')
    }

    return (
        <CategoryFormV2 
            initial={defaultCategoryValues} 
            onSaved={handleSaved}
            headerTitle="New Category" 
        />
    )
}
