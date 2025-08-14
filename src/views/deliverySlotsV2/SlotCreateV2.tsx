import SlotFormV2 from './SlotFormV2'
import { defaultSlotValues } from './schema/slotSchema'
import { useNavigate } from 'react-router-dom'

export default function SlotCreateV2() {
    const navigate = useNavigate()
    return <SlotFormV2 initial={defaultSlotValues} headerTitle="New Delivery Slot" />
}



