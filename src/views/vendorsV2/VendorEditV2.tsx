import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import useVendors from './hooks/useVendors'
import { apiToFormData } from './utils/dataTransform'
import VendorFormV2 from './VendorFormV2'
import type { VendorFormInput } from './schema/vendorSchema'
import Card from '@/components/ui/Card'
import Spinner from '@/components/ui/Spinner'

export default function VendorEditV2() {
    const { id } = useParams<{ id: string }>()
    const navigate = useNavigate()
    const { selectedVendor, isVendorLoading, loadVendor } = useVendors()
    const [initialData, setInitialData] = useState<VendorFormInput | null>(null)

    useEffect(() => {
        if (id) {
            loadVendor(id)
        }
    }, [id, loadVendor])

    useEffect(() => {
        if (selectedVendor && selectedVendor.id === id) {
            setInitialData(apiToFormData(selectedVendor))
        }
    }, [selectedVendor, id])

    const handleSaved = () => {
        navigate('/app/vendors-v2/vendor-list')
    }

    if (isVendorLoading) {
        return (
            <Card className="h-full">
                <div className="flex items-center justify-center h-96">
                    <Spinner size="xl" />
                </div>
            </Card>
        )
    }

    if (!initialData) {
        return (
            <Card className="h-full">
                <div className="flex items-center justify-center h-96">
                    <div className="text-center">
                        <h3 className="text-lg font-medium text-gray-900">Vendor not found</h3>
                        <p className="text-gray-500 mt-2">The vendor you're looking for doesn't exist.</p>
                    </div>
                </div>
            </Card>
        )
    }

    return (
        <VendorFormV2
            initial={initialData}
            onSaved={handleSaved}
            headerTitle={`Edit ${initialData.name}`}
        />
    )
}
