import OfferFormV2 from './OfferFormV2'
import { defaultOfferValues } from './schema/offerSchema'
import { useNavigate } from 'react-router-dom'

export default function OfferCreateV2() {
    const navigate = useNavigate()
    return <OfferFormV2 initial={defaultOfferValues} headerTitle="New Offer" onSaved={() => navigate('/app/offers-v2/offer-list')} />
}



