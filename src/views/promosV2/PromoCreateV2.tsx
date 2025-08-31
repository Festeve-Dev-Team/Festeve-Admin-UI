import PromoFormV2 from './PromoFormV2'
import { defaultPromoValues } from './schema/promoSchema'
import { useNavigate } from 'react-router-dom'

export default function PromoCreateV2() {
    const navigate = useNavigate()
    return (
        <PromoFormV2 initial={defaultPromoValues} headerTitle="New Promo" onSaved={() => navigate('/app/promos-v2/promo-list')} />
    )
}
