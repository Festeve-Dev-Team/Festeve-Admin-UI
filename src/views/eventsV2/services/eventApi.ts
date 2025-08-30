import ApiService from '@/services/ApiService'
import type { EventWithId, EventDto, EventId } from '../types/event'

// Event APIs following the same pattern as categories
export async function createEvent(eventData: EventDto): Promise<EventWithId> {
    try {
        // Transform data to match the expected API format
        const apiPayload = {
            name: eventData.name,
            description: eventData.description || '',
            type: eventData.type,
            date: eventData.date,
            recurring: {
                isRecurring: eventData.recurring.isRecurring,
                frequency: eventData.recurring.frequency || 'daily',
                daysOfWeek: eventData.recurring.daysOfWeek || [0]
            },
            linkedProducts: eventData.linkedProducts.map(lp => ({
                productId: lp.productId,
                relation: lp.relation
            })),
            purohitRequired: eventData.purohitRequired,
            ritualNotes: eventData.ritualNotes || '',
            region: eventData.region || '',
            regions: eventData.regions || [],
            specialOffers: eventData.specialOffers.map(so => ({
                offerType: so.offerType,
                productId: so.productId
            })),
            extraData: eventData.extraData || {}
        }

        console.log('🌐 API: Creating event with payload:', JSON.stringify(apiPayload, null, 2))

        const response = await ApiService.fetchData({
            url: '/events',
            method: 'POST',
            data: apiPayload,
        })
        
        console.log('🌐 API: Create event response:', response)
        return response.data as EventWithId
    } catch (error) {
        console.error('Failed to create event:', error)
        throw new Error('Failed to create event')
    }
}

export async function updateEvent(id: string, eventData: Partial<EventDto>): Promise<EventWithId> {
    try {
        // Transform data to match the expected API format
        const apiPayload: any = {}
        
        if (eventData.name) apiPayload.name = eventData.name
        if (eventData.description !== undefined) apiPayload.description = eventData.description
        if (eventData.type) apiPayload.type = eventData.type
        if (eventData.date) apiPayload.date = eventData.date
        if (eventData.recurring) {
            apiPayload.recurring = {
                isRecurring: eventData.recurring.isRecurring,
                frequency: eventData.recurring.frequency || 'daily',
                daysOfWeek: eventData.recurring.daysOfWeek || [0]
            }
        }
        if (eventData.linkedProducts) {
            apiPayload.linkedProducts = eventData.linkedProducts.map(lp => ({
                productId: lp.productId,
                relation: lp.relation
            }))
        }
        if (eventData.purohitRequired !== undefined) apiPayload.purohitRequired = eventData.purohitRequired
        if (eventData.ritualNotes !== undefined) apiPayload.ritualNotes = eventData.ritualNotes
        if (eventData.region !== undefined) apiPayload.region = eventData.region
        if (eventData.regions) apiPayload.regions = eventData.regions
        if (eventData.specialOffers) {
            apiPayload.specialOffers = eventData.specialOffers.map(so => ({
                offerType: so.offerType,
                productId: so.productId
            }))
        }
        if (eventData.extraData !== undefined) apiPayload.extraData = eventData.extraData

        console.log('Updating event with payload:', JSON.stringify(apiPayload, null, 2))

        const response = await ApiService.fetchData({
            url: `/events/${id}`,
            method: 'PUT',
            data: apiPayload,
        })
        return response.data as EventWithId
    } catch (error) {
        console.error('Failed to update event:', error)
        throw new Error('Failed to update event')
    }
}

export async function getEvents(params: {
    page?: number
    limit?: number
    search?: string
    type?: string
    sortBy?: string
    sortOrder?: 'asc' | 'desc'
} = {}): Promise<{ events: EventWithId[], pagination: any }> {
    try {
        const response = await ApiService.fetchData({
            url: '/events',
            method: 'GET',
            params,
        })
        
        // Handle direct array response from API
        const data = response.data
        if (Array.isArray(data)) {
            // Transform events to ensure id field exists
            const transformedEvents = data.map((event: any) => ({
                ...event,
                id: event.id || event._id // Ensure id field exists
            })) as EventWithId[]
            
            return {
                events: transformedEvents,
                pagination: {
                    page: params.page || 1,
                    limit: params.limit || 20,
                    total: data.length,
                    pages: Math.ceil(data.length / (params.limit || 20))
                }
            }
        }
        
        // If API returns structured response, transform it too
        const structuredData = data as { events: EventWithId[], pagination: any }
        if (structuredData.events) {
            structuredData.events = structuredData.events.map((event: any) => ({
                ...event,
                id: event.id || event._id // Ensure id field exists
            }))
        }
        return structuredData
    } catch (error) {
        console.error('Failed to fetch events:', error)
        throw new Error('Failed to fetch events')
    }
}

export async function getEvent(id: EventId): Promise<EventWithId> {
    try {
        const response = await ApiService.fetchData({
            url: `/events/${id}`,
            method: 'GET',
        })
        return response.data as EventWithId
    } catch (error) {
        console.error('Failed to fetch event:', error)
        throw new Error('Failed to fetch event')
    }
}

export async function deleteEvent(id: string): Promise<void> {
    try {
        await ApiService.fetchData({
            url: `/events/${id}`,
            method: 'DELETE',
        })
    } catch (error) {
        console.error('Failed to delete event:', error)
        throw new Error('Failed to delete event')
    }
}

// Legacy functions for backward compatibility
export async function listEvents(): Promise<EventWithId[]> {
    const result = await getEvents()
    return result.events
}

export async function saveEvent(dto: EventWithId | EventDto): Promise<EventWithId> {
    const isUpdate = !!(dto as EventWithId).id
    
    if (isUpdate) {
        return await updateEvent((dto as EventWithId).id, dto)
    } else {
        return await createEvent(dto as EventDto)
    }
}

function randomId() {
    return `ev_${Math.random().toString(36).slice(2, 10)}`
}

function delay(ms: number) {
    return new Promise((res) => setTimeout(res, ms))
}



