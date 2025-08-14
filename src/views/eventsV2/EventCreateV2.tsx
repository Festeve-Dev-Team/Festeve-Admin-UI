import EventFormV2 from './EventFormV2'
import { defaultEventValues } from './schema/eventSchema'
import { useNavigate } from 'react-router-dom'

export default function EventCreateV2() {
    const navigate = useNavigate()
    return (
        <EventFormV2 initial={defaultEventValues} headerTitle="New Event" onSaved={() => navigate('/app/events-v2/event-list')} />
    )
}



