import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import PurohitFormV2 from './PurohitFormV2'
import { getPurohit } from './services/purohitApi'
import { apiToFormData } from './utils/dataTransform'
import usePurohits from './hooks/usePurohits'
import type { PurohitFormInput } from './schema/purohitSchema'
import Card from '@/components/ui/Card'
import Spinner from '@/components/ui/Spinner'

export default function PurohitEditV2() {
    const { purohitId } = useParams<{ purohitId: string }>()
    const navigate = useNavigate()
    const { purohits } = usePurohits()
    const [initial, setInitial] = useState<PurohitFormInput | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        if (!purohitId) {
            navigate('/app/purohits-v2/purohit-list')
            return
        }

        // First, check if the purohit is already in the Redux store
        const existingPurohit = purohits.find(p => p.id === purohitId || (p as any)._id === purohitId)
        if (existingPurohit) {
            console.log('✅ PurohitEditV2 - Found purohit in Redux store:', existingPurohit)
            try {
                const formData = apiToFormData(existingPurohit)
                console.log('✅ PurohitEditV2 - Form data transformed from Redux:', formData)
                setInitial(formData)
                setLoading(false)
                return
            } catch (error) {
                console.error('Error transforming purohit data from Redux:', error)
            }
        }

        // If not in store, fetch from API
        console.log('🔍 PurohitEditV2 - Purohit not in store, fetching from API')
        fetchPurohitData(purohitId)
    }, [purohitId, navigate, purohits])

    const fetchPurohitData = async (id: string) => {
        try {
            setLoading(true)
            setError(null)
            const purohitData = await getPurohit(id)
            
            if (purohitData) {
                console.log('🔄 PurohitEditV2 - Transforming purohit data from API:', purohitData)
                const formData = apiToFormData(purohitData)
                console.log('✅ PurohitEditV2 - Form data transformed from API:', formData)
                setInitial(formData)
            } else {
                setError('Purohit not found')
            }
        } catch (error) {
            console.error('Error fetching purohit:', error)
            setError(error instanceof Error ? error.message : 'Failed to load purohit')
        } finally {
            setLoading(false)
        }
    }

    const handleSaved = () => {
        navigate('/app/purohits-v2/purohit-list')
    }

    if (loading) {
        return (
            <Card className="h-full">
                <div className="flex items-center justify-center h-96">
                    <Spinner size="xl" />
                </div>
            </Card>
        )
    }

    // If we have initial data, show the form even if there's an error
    // (the error might be from a different purohit or stale state)
    if (initial) {
        return (
            <PurohitFormV2
                initial={initial}
                headerTitle={`Edit ${initial.name}`}
                onSaved={handleSaved}
            />
        )
    }

    if (error) {
        return (
            <Card className="h-full">
                <div className="flex items-center justify-center h-96">
                    <div className="text-center">
                        <h3 className="text-lg font-medium text-red-600">Error loading purohit</h3>
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
                    <h3 className="text-lg font-medium text-gray-900">Purohit not found</h3>
                    <p className="text-gray-500 mt-2">The purohit you're looking for doesn't exist.</p>
                </div>
            </div>
        </Card>
    )
}


