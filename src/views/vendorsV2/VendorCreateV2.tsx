import VendorFormV2 from './VendorFormV2'
import { defaultVendorValues } from './schema/vendorSchema'
import { useNavigate } from 'react-router-dom'

export default function VendorCreateV2() {
    const navigate = useNavigate()
    return <VendorFormV2 initial={defaultVendorValues} headerTitle="New Vendor" />
}



