import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import OfferFormV2 from './OfferFormV2'
import { getOffer } from './services/offerApi'
import { apiToFormData } from './utils/dataTransform'
import useOffers from './hooks/useOffers'
import type { OfferFormInput } from './schema/offerSchema'
import Card from '@/components/ui/Card'
import Spinner from '@/components/ui/Spinner'

export default function OfferEditV2() {
    const { offerId } = useParams<{ offerId: string }>()
    const navigate = useNavigate()
    const { offers } = useOffers()
    const [initial, setInitial] = useState<OfferFormInput | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        if (!offerId) {
            navigate('/app/offers-v2/offer-list')
            return
        }

        // First, check if the offer is already in the Redux store
        const existingOffer = offers.find(o => o.id === offerId || (o as any)._id === offerId)
        if (existingOffer) {
            console.log('✅ OfferEditV2 - Found offer in Redux store:', existingOffer)
            try {
                const formData = apiToFormData(existingOffer)
                console.log('✅ OfferEditV2 - Form data transformed from Redux:', formData)
                setInitial(formData)
                setLoading(false)
                return
            } catch (error) {
                console.error('Error transforming offer data from Redux:', error)
            }
        }

        // If not in store, fetch from API
        console.log('🔍 OfferEditV2 - Offer not in store, fetching from API')
        fetchOfferData(offerId)
    }, [offerId, navigate, offers])

    const fetchOfferData = async (id: string) => {
        try {
            setLoading(true)
            setError(null)
            const offerData = await getOffer(id)
            
            if (offerData) {
                console.log('🔄 OfferEditV2 - Transforming offer data from API:', offerData)
                const formData = apiToFormData(offerData)
                console.log('✅ OfferEditV2 - Form data transformed from API:', formData)
                setInitial(formData)
            } else {
                setError('Offer not found')
            }
        } catch (error) {
            console.error('Error fetching offer:', error)
            setError(error instanceof Error ? error.message : 'Failed to load offer')
        } finally {
            setLoading(false)
        }
    }

    const handleSaved = () => {
        navigate('/app/offers-v2/offer-list')
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
    // (the error might be from a different offer or stale state)
    if (initial) {
        return (
            <OfferFormV2
                initial={initial}
                headerTitle={`Edit ${initial.title}`}
                onSaved={handleSaved}
            />
        )
    }

    if (error) {
        return (
            <Card className="h-full">
                <div className="flex items-center justify-center h-96">
                    <div className="text-center">
                        <h3 className="text-lg font-medium text-red-600">Error loading offer</h3>
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
                    <h3 className="text-lg font-medium text-gray-900">Offer not found</h3>
                    <p className="text-gray-500 mt-2">The offer you're looking for doesn't exist.</p>
                </div>
            </div>
        </Card>
    )
}



