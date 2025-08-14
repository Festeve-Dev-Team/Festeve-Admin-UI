import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import BookingFormV2 from './BookingFormV2'
import type { BookingFormInput } from './schema/bookingSchema'

export default function BookingEditV2() {
    const { bookingId } = useParams()
    const navigate = useNavigate()
    const [initial, setInitial] = useState<BookingFormInput | null>(null)
    useEffect(() => { if (bookingId) setInitial({
        purohitId: 'pu_1', eventId: 'ev_1', date: new Date().toISOString(), timeSlot: '10:00 AM', amount: 0, isGroupBooking: false, groupSize: 50, groupOfferId: '',
        address: { label: 'Home', line1: '123 Street', line2: '', city: 'Mumbai', state: 'MH', pincode: '400001', country: 'India', isDefault: true }, extraNotes: {},
    }) }, [bookingId])
    if (!initial) return null
    return <BookingFormV2 initial={initial} headerTitle={`Booking ${bookingId}`} onSaved={() => navigate('/app/bookings-v2/booking-list')} />
}



