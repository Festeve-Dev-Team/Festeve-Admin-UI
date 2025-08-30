import VendorFormV2 from './VendorFormV2'
import { defaultVendorValues } from './schema/vendorSchema'
import { useNavigate } from 'react-router-dom'

export default function VendorCreateV2() {
    const navigate = useNavigate()

    const handleSaved = () => {
        navigate('/app/vendors-v2/vendor-list')
    }

    return (
        <VendorFormV2 
            initial={defaultVendorValues} 
            onSaved={handleSaved}
            headerTitle="New Vendor" 
        />
    )
}



