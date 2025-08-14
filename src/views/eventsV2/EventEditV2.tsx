import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import EventFormV2 from './EventFormV2'
import { getEvent } from './services/eventApi'
import type { EventFormInput } from './schema/eventSchema'

export default function EventEditV2() {
    const { eventId } = useParams()
    const navigate = useNavigate()
    const [initial, setInitial] = useState<EventFormInput | null>(null)
    useEffect(() => { if (eventId) getEvent(eventId).then((e) => e && setInitial(e)) }, [eventId])
    if (!initial) return null
    return <EventFormV2 initial={initial} headerTitle={initial.name} onSaved={() => navigate('/app/events-v2/event-list')} />
}



