import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import PromoFormV2 from './PromoFormV2'
import { getPromo } from './services/promoApi'
import { apiToFormData } from './utils/dataTransform'
import usePromos from './hooks/usePromos'
import type { PromoFormInput } from './schema/promoSchema'
import Card from '@/components/ui/Card'
import Spinner from '@/components/ui/Spinner'

export default function PromoEditV2() {
    const { promoId } = useParams<{ promoId: string }>()
    const navigate = useNavigate()
    const { promos } = usePromos()
    const [initial, setInitial] = useState<PromoFormInput | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        if (!promoId) {
            navigate('/app/promos-v2/promo-list')
            return
        }

        // First, check if the promo is already in the Redux store
        const existingPromo = promos.find(p => p.id === promoId || (p as any)._id === promoId)
        if (existingPromo) {
            console.log('✅ PromoEditV2 - Found promo in Redux store:', existingPromo)
            try {
                const formData = apiToFormData(existingPromo)
                console.log('✅ PromoEditV2 - Form data transformed from Redux:', formData)
                setInitial(formData)
                setLoading(false)
                return
            } catch (error) {
                console.error('Error transforming promo data from Redux:', error)
            }
        }

        // If not in store, fetch from API
        console.log('🔍 PromoEditV2 - Promo not in store, fetching from API')
        fetchPromoData(promoId)
    }, [promoId, navigate, promos])

    const fetchPromoData = async (id: string) => {
        try {
            setLoading(true)
            setError(null)
            const promoData = await getPromo(id)
            
            if (promoData) {
                console.log('🔄 PromoEditV2 - Transforming promo data from API:', promoData)
                const formData = apiToFormData(promoData)
                console.log('✅ PromoEditV2 - Form data transformed from API:', formData)
                setInitial(formData)
            } else {
                setError('Promo not found')
            }
        } catch (error) {
            console.error('Error fetching promo:', error)
            setError(error instanceof Error ? error.message : 'Failed to load promo')
        } finally {
            setLoading(false)
        }
    }

    const handleSaved = () => {
        navigate('/app/promos-v2/promo-list')
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
    // (the error might be from a different promo or stale state)
    if (initial) {
        return (
            <PromoFormV2
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
                        <h3 className="text-lg font-medium text-red-600">Error loading promo</h3>
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
                    <h3 className="text-lg font-medium text-gray-900">Promo not found</h3>
                    <p className="text-gray-500 mt-2">The promo you're looking for doesn't exist.</p>
                </div>
            </div>
        </Card>
    )
}
