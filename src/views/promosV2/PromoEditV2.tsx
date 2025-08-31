import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import PromoFormV2 from './PromoFormV2'
import { getPromo } from './services/promoApi'
import type { PromoFormInput } from './schema/promoSchema'

export default function PromoEditV2() {
    const { promoId } = useParams()
    const navigate = useNavigate()
    const [initial, setInitial] = useState<PromoFormInput | null>(null)
    useEffect(() => { if (promoId) getPromo(promoId).then((e) => e && setInitial(e)) }, [promoId])
    if (!initial) return null
    return <PromoFormV2 initial={initial} headerTitle={initial.name} onSaved={() => navigate('/app/promos-v2/promo-list')} />
}
