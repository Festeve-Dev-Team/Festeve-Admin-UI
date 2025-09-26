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
        // Remove any fields that shouldn't be sent to API
        const cleanData = { ...eventData }
        if ('id' in cleanData) {
            delete (cleanData as any).id
        }
        if ('_id' in cleanData) {
            delete (cleanData as any)._id
        }

        // Transform data to match the expected API format
        const apiPayload: any = {}
        
        if (cleanData.name) apiPayload.name = cleanData.name
        if (cleanData.description !== undefined) apiPayload.description = cleanData.description
        if (cleanData.type) apiPayload.type = cleanData.type
        if (cleanData.date) apiPayload.date = cleanData.date
        if (cleanData.recurring) {
            apiPayload.recurring = {
                isRecurring: cleanData.recurring.isRecurring,
                frequency: cleanData.recurring.frequency || 'daily',
                daysOfWeek: cleanData.recurring.daysOfWeek || [0]
            }
        }
        if (cleanData.linkedProducts) {
            apiPayload.linkedProducts = cleanData.linkedProducts.map(lp => ({
                productId: lp.productId,
                relation: lp.relation
            }))
        }
        if (cleanData.purohitRequired !== undefined) apiPayload.purohitRequired = cleanData.purohitRequired
        if (cleanData.ritualNotes !== undefined) apiPayload.ritualNotes = cleanData.ritualNotes
        if (cleanData.region !== undefined) apiPayload.region = cleanData.region
        if (cleanData.regions) apiPayload.regions = cleanData.regions
        if (cleanData.specialOffers) {
            apiPayload.specialOffers = cleanData.specialOffers.map(so => ({
                offerType: so.offerType,
                productId: so.productId
            }))
        }
        if (cleanData.extraData !== undefined) apiPayload.extraData = cleanData.extraData

        console.log('🌐 API: Updating event with payload:', JSON.stringify(apiPayload, null, 2))

        const response = await ApiService.fetchData({
            url: `/events/${id}`,
            method: 'PATCH', // Changed from PUT to PATCH
            data: apiPayload,
        })
        
        console.log('🌐 API: Update event response:', response)
        return response.data as EventWithId
    } catch (error) {
        console.error('Failed to update event:', error)
        throw error
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
        console.log('🚀 API - Fetching event with ID:', id)
        const response = await ApiService.fetchData({
            url: `/events/${id}`,
            method: 'GET',
        })
        
        console.log('📥 API - Event response:', response)
        
        if (response.data) {
            const eventWithId = {
                ...response.data,
                id: response.data._id || response.data.id || id
            }
            console.log('✅ API - Event with ID added:', eventWithId)
            return eventWithId as EventWithId
        }
        
        console.log('⚠️ API - No data in event response')
        throw new Error('No event data received')
    } catch (error) {
        console.error('❌ API - Error fetching event:', error)
        throw error
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



