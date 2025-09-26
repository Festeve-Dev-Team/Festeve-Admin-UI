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
    const { selectedVendor, isVendorLoading, loadVendor, vendors, error } = useVendors()
    const [initialData, setInitialData] = useState<VendorFormInput | null>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        if (!id) {
            console.log('❌ VendorEditV2 - No vendor ID, navigating back to list')
            navigate('/app/vendors-v2/vendor-list')
            return
        }

        console.log('🚀 VendorEditV2 - Looking for vendor with ID:', id)
        console.log('🔍 VendorEditV2 - Available vendors:', vendors.map(v => ({ id: v.id, _id: (v as any)._id, name: v.name })))

        // First, check if the vendor is already in the Redux store
        const existingVendor = vendors.find(v => v.id === id || (v as any)._id === id)
        if (existingVendor) {
            console.log('✅ VendorEditV2 - Found vendor in Redux store:', existingVendor)
            try {
                const formData = apiToFormData(existingVendor)
                setInitialData(formData)
                setLoading(false)
                return
            } catch (error) {
                console.error('Error transforming vendor data from Redux:', error)
            }
        }

        console.log('🔍 VendorEditV2 - Vendor not in store, fetching from API')
        // If not in store, fetch from API
        loadVendor(id)
    }, [id, loadVendor, navigate, vendors])

    useEffect(() => {
        console.log('🔍 VendorEditV2 - selectedVendor changed:', selectedVendor)
        console.log('🔍 VendorEditV2 - vendor ID:', id)
        console.log('🔍 VendorEditV2 - isVendorLoading:', isVendorLoading)
        console.log('🔍 VendorEditV2 - error:', error)
        
        if (selectedVendor && (selectedVendor.id === id || (selectedVendor as any)._id === id)) {
            console.log('🔄 VendorEditV2 - Transforming vendor data from API:', selectedVendor)
            try {
                const formData = apiToFormData(selectedVendor)
                console.log('✅ VendorEditV2 - Form data transformed from API:', formData)
                setInitialData(formData)
                setLoading(false)
            } catch (error) {
                console.error('Error transforming vendor data:', error)
                setLoading(false)
            }
        } else if (!isVendorLoading && !selectedVendor && id && !initialData) {
            console.log('⚠️ VendorEditV2 - No vendor found and not loading')
            setLoading(false)
        }
    }, [selectedVendor, id, isVendorLoading, error, initialData])

    const handleSaved = () => {
        navigate('/app/vendors-v2/vendor-list')
    }

    if (loading || isVendorLoading) {
        return (
            <Card className="h-full">
                <div className="flex items-center justify-center h-96">
                    <Spinner size="xl" />
                </div>
            </Card>
        )
    }

    // If we have initial data, show the form even if there's an error
    // (the error might be from a different vendor or stale state)
    if (initialData) {
        return (
            <VendorFormV2
                initial={initialData}
                onSaved={handleSaved}
                headerTitle={`Edit ${initialData.name}`}
            />
        )
    }

    if (error) {
        return (
            <Card className="h-full">
                <div className="flex items-center justify-center h-96">
                    <div className="text-center">
                        <h3 className="text-lg font-medium text-red-600">Error loading vendor</h3>
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
                    <h3 className="text-lg font-medium text-gray-900">Vendor not found</h3>
                    <p className="text-gray-500 mt-2">The vendor you're looking for doesn't exist.</p>
                </div>
            </div>
        </Card>
    )
}
