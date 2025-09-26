import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import EventFormV2 from './EventFormV2'
import { getEvent } from './services/eventApi'
import { apiToFormData } from './utils/dataTransform'
import useEvents from './hooks/useEvents'
import type { EventFormInput } from './schema/eventSchema'
import Card from '@/components/ui/Card'
import Spinner from '@/components/ui/Spinner'

export default function EventEditV2() {
    const { eventId } = useParams<{ eventId: string }>()
    const navigate = useNavigate()
    const { events } = useEvents()
    const [initial, setInitial] = useState<EventFormInput | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        if (!eventId) {
            navigate('/app/events-v2/event-list')
            return
        }

        // First, check if the event is already in the Redux store
        const existingEvent = events.find(e => e.id === eventId || (e as any)._id === eventId)
        if (existingEvent) {
            console.log('✅ EventEditV2 - Found event in Redux store:', existingEvent)
            try {
                const formData = apiToFormData(existingEvent)
                console.log('✅ EventEditV2 - Form data transformed from Redux:', formData)
                setInitial(formData)
                setLoading(false)
                return
            } catch (error) {
                console.error('Error transforming event data from Redux:', error)
            }
        }

        // If not in store, fetch from API
        console.log('🔍 EventEditV2 - Event not in store, fetching from API')
        fetchEventData(eventId)
    }, [eventId, navigate, events])

    const fetchEventData = async (id: string) => {
        try {
            setLoading(true)
            setError(null)
            const eventData = await getEvent(id)
            
            if (eventData) {
                console.log('🔄 EventEditV2 - Transforming event data from API:', eventData)
                const formData = apiToFormData(eventData)
                console.log('✅ EventEditV2 - Form data transformed from API:', formData)
                setInitial(formData)
            } else {
                setError('Event not found')
            }
        } catch (error) {
            console.error('Error fetching event:', error)
            setError(error instanceof Error ? error.message : 'Failed to load event')
        } finally {
            setLoading(false)
        }
    }

    const handleSaved = () => {
        navigate('/app/events-v2/event-list')
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
    // (the error might be from a different event or stale state)
    if (initial) {
        return (
            <EventFormV2
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
                        <h3 className="text-lg font-medium text-red-600">Error loading event</h3>
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
                    <h3 className="text-lg font-medium text-gray-900">Event not found</h3>
                    <p className="text-gray-500 mt-2">The event you're looking for doesn't exist.</p>
                </div>
            </div>
        </Card>
    )
}



