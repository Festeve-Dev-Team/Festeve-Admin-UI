import BookingFormV2 from './BookingFormV2'
import { defaultBookingValues } from './schema/bookingSchema'
import { useNavigate } from 'react-router-dom'

export default function BookingCreateV2() {
    const navigate = useNavigate()
    return <BookingFormV2 initial={defaultBookingValues} headerTitle="New Booking" onSaved={() => navigate('/app/bookings-v2/booking-list')} />
}



