import { useEffect, useMemo, useState } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { vendorSchema, defaultVendorValues, type VendorFormInput } from './schema/vendorSchema'
import { formToApiData, validateFormForSubmission } from './utils'
import useVendors from './hooks/useVendors'
import useProducts from '@/utils/hooks/useProducts'
import { useNavigate } from 'react-router-dom'

import Card from '@/components/ui/Card'
import Tabs from '@/components/ui/Tabs'
import Tag from '@/components/ui/Tag'
import Button from '@/components/ui/Button'
import Alert from '@/components/ui/Alert'
import { FormContainer, FormItem } from '@/components/ui/Form'
import Input from '@/components/ui/Input'
import ProductIdsEditor from './components/ProductIdsEditor'
import VendorPreview from './components/VendorPreview'

type Props = { 
    initial?: VendorFormInput
    onSaved?: (v: VendorFormInput) => void
    headerTitle?: string 
}

export default function VendorFormV2({ initial, onSaved, headerTitle }: Props) {
    const navigate = useNavigate()
    const [isDirtySinceMount, setIsDirtySinceMount] = useState(false)
    const [validationErrors, setValidationErrors] = useState<string[]>([])
    
    // Redux hooks
    const { createVendor, updateVendor, isCreating, isUpdating, error } = useVendors()
    const { 
        products, 
        loadProducts, 
        isProductsLoading,
        clearAllProductErrors 
    } = useProducts()
    
    const {
        control,
        register,
        handleSubmit,
        formState: { errors, isDirty, isSubmitting },
        reset,
        watch,
        setValue,
        setError,
        clearErrors
    } = useForm<VendorFormInput>({
        resolver: zodResolver(vendorSchema),
        defaultValues: initial ?? defaultVendorValues,
        mode: 'onChange',
    })

    useEffect(() => {
        const subscription = watch(() => setIsDirtySinceMount(true))
        return () => subscription.unsubscribe()
    }, [watch])

    useEffect(() => {
        if (initial) reset(initial)
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [initial])

    // Load products on mount (same as ProductListV2)
    useEffect(() => {
        console.log('VendorFormV2: Loading products on mount')
        loadProducts({ page: 1, limit: 20 })
    }, [loadProducts])

    const form = watch()
    const isLoading = isCreating || isUpdating

    async function onSubmit(values: VendorFormInput, shouldPublish = false) {
        try {
            // Clear previous validation errors
            setValidationErrors([])
            clearErrors()

            // Validate form data
            const formValidation = validateFormForSubmission(values)
            if (!formValidation.isValid) {
                setValidationErrors(formValidation.errors)
                return
            }

            // Transform form data to API format
            const apiData = formToApiData(values)

            // Save vendor
            if (values.id) {
                // Update existing vendor
                await updateVendor(values.id, apiData)
            } else {
                // Create new vendor
                await createVendor(apiData)
            }

            // Success callback
            onSaved?.(values)
            setIsDirtySinceMount(false)

            // Navigate back to list or stay for further editing
            if (shouldPublish) {
                navigate('/app/vendors-v2/vendor-list')
            }
        } catch (error) {
            console.error('Save failed:', error)
            setValidationErrors([error instanceof Error ? error.message : 'Failed to save vendor'])
        }
    }

    const slug = useMemo(() => 
        (form.name || '').toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''), 
        [form.name]
    )

    return (
        <div className="space-y-4">
            {/* Error Messages */}
            {(validationErrors.length > 0 || error) && (
                <Alert 
                    showIcon 
                    className="mb-4" 
                    type="danger"
                    onClose={() => {
                        setValidationErrors([])
                    }}
                >
                    <div>
                        {error && <div className="mb-2">{error}</div>}
                        {validationErrors.map((err, idx) => (
                            <div key={idx} className="mb-1">• {err}</div>
                        ))}
                    </div>
                </Alert>
            )}

            {/* Sticky Header */}
            <Card className="sticky top-0 z-10" bodyClass="py-3 px-4 md:px-6 lg:px-8 bg-white/80 dark:bg-gray-800/80 backdrop-blur">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <h3 className="text-lg font-semibold">{headerTitle ?? 'New Vendor'}</h3>
                        {isDirtySinceMount && (
                            <Tag className="bg-amber-100 text-amber-800 border border-amber-200 px-2 py-0.5 rounded" suffix suffixClass="bg-red-500" aria-label="Unsaved changes">
                                Unsaved
                            </Tag>
                        )}
                        {isLoading && (
                            <Tag className="bg-blue-100 text-blue-800 border border-blue-200 px-2 py-0.5 rounded">
                                Saving...
                            </Tag>
                        )}
                    </div>
                    <div className="flex items-center gap-2">
                        <Button 
                            type="button" 
                            onClick={() => {
                                reset()
                                setValidationErrors([])
                            }} 
                            disabled={!isDirty || isLoading}
                        >
                            Cancel
                        </Button>
                        <Button 
                            type="button" 
                            onClick={handleSubmit((v) => onSubmit(v, false))} 
                            disabled={!isDirty || isLoading}
                            loading={isLoading}
                        >
                            Save Draft
                        </Button>
                        <Button 
                            type="button" 
                            variant="solid" 
                            onClick={handleSubmit((v) => onSubmit(v, true))} 
                            disabled={isLoading}
                            loading={isLoading}
                        >
                            Save & Publish
                        </Button>
                    </div>
                </div>
            </Card>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                <div className="lg:col-span-2 space-y-4">
                    <Card className="p-2">
                        <Tabs defaultValue="basics" variant="pill">
                            <Tabs.TabList>
                                <Tabs.TabNav value="basics">Basics</Tabs.TabNav>
                                <Tabs.TabNav value="products">Products</Tabs.TabNav>
                                <Tabs.TabNav value="preview">Preview</Tabs.TabNav>
                            </Tabs.TabList>

                            <Tabs.TabContent value="basics" className="px-4 pt-3 pb-4">
                                <div className="mx-auto w-full max-w-5xl space-y-6">
                                    <FormContainer>
                                        <FormItem 
                                            label="Vendor Name" 
                                            extra={<span className="text-xs text-gray-500">Public vendor display name</span>} 
                                            invalid={!!errors.name} 
                                            errorMessage={errors.name?.message}
                                        >
                                            <Input autoFocus {...register('name')} placeholder="Sweet Delights Vendor" />
                                        </FormItem>

                                        <FormItem 
                                            label="Store Name" 
                                            invalid={!!errors.storeName} 
                                            errorMessage={errors.storeName?.message}
                                        >
                                            <Input {...register('storeName')} placeholder="Sweet Delights Store" />
                                        </FormItem>

                                        <FormItem 
                                            label="Address" 
                                            invalid={!!errors.address} 
                                            errorMessage={errors.address?.message}
                                        >
                                            <Input 
                                                asElement="textarea" 
                                                rows={3} 
                                                {...register('address')} 
                                                placeholder="123 Main Street, Bengaluru, Karnataka 560001" 
                                            />
                                        </FormItem>

                                        <div className="text-xs text-gray-500">
                                            Slug preview: {slug || '—'}
                                        </div>
                                    </FormContainer>
                                </div>
                            </Tabs.TabContent>

                            <Tabs.TabContent value="products" className="px-4 pt-3 pb-4">
                                <div className="mx-auto w-full max-w-5xl space-y-6">
                                    <ProductIdsEditor value={form.productIds} onChange={(v) => setValue('productIds', v, { shouldDirty: true })} />
                                </div>
                            </Tabs.TabContent>

                            <Tabs.TabContent value="preview" className="px-4 pt-3 pb-4">
                                <div className="mx-auto w-full max-w-5xl">
                                    <VendorPreview form={form} />
                                </div>
                            </Tabs.TabContent>
                        </Tabs>
                    </Card>
                </div>
                <div className="lg:col-span-1">
                    <VendorPreview form={form} />
                </div>
            </div>
        </div>
    )
}



