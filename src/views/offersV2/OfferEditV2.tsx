import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import OfferFormV2 from './OfferFormV2'
import type { OfferFormInput } from './schema/offerSchema'
import { saveOffer } from './services/offerApi'

export default function OfferEditV2() {
    const { offerId } = useParams()
    const navigate = useNavigate()
    const [initial, setInitial] = useState<OfferFormInput | null>(null)
    useEffect(() => {
        if (!offerId) return
        // For mock, just seed a new offer with id
        setInitial({
            title: 'Festival Special', description: 'Get 20% off on all products', type: 'percentage_discount', discountType: 'percentage', discountValue: 20,
            comboItems: [], appliesTo: 'product', targetIds: ['prod_1'], minGroupSize: 1, maxGroupSize: 1,
            startDate: new Date().toISOString(), endDate: new Date(Date.now() + 86400000).toISOString(), combinable: false, conditions: {},
        })
    }, [offerId])
    if (!initial) return null
    return <OfferFormV2 initial={initial} headerTitle={initial.title} onSaved={() => navigate('/app/offers-v2/offer-list')} />
}



