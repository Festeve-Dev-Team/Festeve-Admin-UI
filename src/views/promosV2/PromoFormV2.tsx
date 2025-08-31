import { useEffect, useMemo, useState } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { promoSchema, defaultPromoValues, type PromoFormInput } from './schema/promoSchema'
import { formToApiData, validateFormForSubmission } from './utils'
import usePromos from './hooks/usePromos'
import useProducts from '@/utils/hooks/useProducts'
import { useNavigate } from 'react-router-dom'

import Card from '@/components/ui/Card'
import Tabs from '@/components/ui/Tabs'
import Tag from '@/components/ui/Tag'
import Button from '@/components/ui/Button'
import Alert from '@/components/ui/Alert'
import { FormContainer, FormItem } from '@/components/ui/Form'
import Input from '@/components/ui/Input'
import Select from '@/components/ui/Select'
import DateTimepicker from '@/components/ui/DatePicker/DateTimepicker'

import ProductIdsEditor from './components/ProductIdsEditor'
import ChipsInput from './components/ChipsInput'
import PromoPreview from './components/PromoPreview'

type Props = { initial?: PromoFormInput; onSaved?: (e: PromoFormInput) => void; headerTitle?: string }

const statusOptions = [
    { value: 'ACTIVE', label: 'Active' },
    { value: 'PAUSED', label: 'Paused' },
    { value: 'EXPIRED', label: 'Expired' },
    { value: 'ARCHIVED', label: 'Archived' }
]

export default function PromoFormV2({ initial, onSaved, headerTitle }: Props) {
    const navigate = useNavigate()
    const [isDirtySinceMount, setIsDirtySinceMount] = useState(false)
    const [validationErrors, setValidationErrors] = useState<string[]>([])
    
    // Redux hooks
    const { createPromo, updatePromo, isCreating, isUpdating, error } = usePromos()
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
    } = useForm<PromoFormInput>({
        resolver: zodResolver(promoSchema),
        defaultValues: {
            ...defaultPromoValues,
            ...initial,
        },
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

    // Load products on mount (same as EventFormV2)
    useEffect(() => {
        console.log('PromoFormV2: Loading products on mount')
        loadProducts({ page: 1, limit: 20 })
    }, [loadProducts])

    const form = watch()
    const isLoading = isCreating || isUpdating

    async function onSubmit(values: PromoFormInput, shouldPublish = false) {
        try {
            console.log('🚀 Form submission started')
            console.log('📝 Form values:', values)
            console.log('📤 Should publish:', shouldPublish)
            
            // Clear previous validation errors
            setValidationErrors([])
            clearErrors()

            // Validate form data
            console.log('✅ Running form validation...')
            const formValidation = validateFormForSubmission(values)
            if (!formValidation.isValid) {
                console.log('❌ Form validation failed:', formValidation.errors)
                setValidationErrors(formValidation.errors)
                return
            }
            console.log('✅ Form validation passed')

            // Transform form data to API format
            const apiData = formToApiData(values)
            console.log('🔄 Transformed API data:', apiData)

            // Save promo
            if (values.id) {
                console.log('🔄 Updating existing promo with ID:', values.id)
                await updatePromo(values.id, apiData)
            } else {
                console.log('🔄 Creating new promo')
                await createPromo(apiData)
            }

            console.log('✅ Promo saved successfully!')

            // Success callback
            onSaved?.(values)
            setIsDirtySinceMount(false)

            // Navigate back to list or stay for further editing
            if (shouldPublish) {
                console.log('🔄 Navigating to promo list')
                navigate('/app/promos-v2/promo-list')
            }
        } catch (error) {
            console.error('❌ Save failed:', error)
            setValidationErrors([error instanceof Error ? error.message : 'Failed to save promo'])
        }
    }

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
                        <h3 className="text-lg font-semibold">{headerTitle ?? 'New Promo'}</h3>
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
                            onClick={handleSubmit(
                                (v) => {
                                    console.log('🔘 Save Draft button clicked - handleSubmit success')
                                    console.log('📊 Form state - isDirty:', isDirty, 'isLoading:', isLoading)
                                    return onSubmit(v, false)
                                },
                                (errors) => {
                                    console.log('❌ Save Draft - handleSubmit validation failed:', errors)
                                }
                            )} 
                            disabled={!isDirty || isLoading}
                            loading={isLoading}
                        >
                            Save Draft
                        </Button>
                        <Button 
                            type="button" 
                            variant="solid" 
                            onClick={handleSubmit(
                                (v) => {
                                    console.log('🔘 Save & Publish button clicked - handleSubmit success')
                                    console.log('📊 Form state - isDirty:', isDirty, 'isLoading:', isLoading)
                                    return onSubmit(v, true)
                                },
                                (errors) => {
                                    console.log('❌ Save & Publish - handleSubmit validation failed:', errors)
                                }
                            )} 
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
                                <Tabs.TabNav value="schedule">Schedule</Tabs.TabNav>
                                <Tabs.TabNav value="limits">Limits</Tabs.TabNav>
                                <Tabs.TabNav value="products">Products</Tabs.TabNav>
                                <Tabs.TabNav value="advanced">Advanced</Tabs.TabNav>
                            </Tabs.TabList>

                            <Tabs.TabContent value="basics" className="px-4 pt-3 pb-4">
                                <div className="mx-auto w-full max-w-5xl space-y-6">
                                    <FormContainer>
                                        <FormItem label="Name" invalid={!!errors.name} errorMessage={errors.name?.message}>
                                            <Input {...register('name')} placeholder="e.g., Black Friday 2024" />
                                        </FormItem>
                                        <FormItem label="Code" invalid={!!errors.code} errorMessage={errors.code?.message}>
                                            <Input {...register('code')} placeholder="e.g., BLACKFRIDAY2024" />
                                        </FormItem>
                                        <FormItem label="Status" invalid={!!errors.status} errorMessage={errors.status?.message}>
                                            <Controller name="status" control={control} render={({ field }) => (
                                                <Select 
                                                    value={statusOptions.find(opt => opt.value === field.value)}
                                                    onChange={(option) => field.onChange(option?.value)}
                                                    options={statusOptions}
                                                    placeholder="Select status..."
                                                />
                                            )} />
                                        </FormItem>
                                        <FormItem label="Notes" extra={<span className="text-xs text-gray-500">Max 2000 chars</span>} invalid={!!errors.notes} errorMessage={errors.notes?.message}>
                                            <Input asElement="textarea" rows={4} {...register('notes')} placeholder="Internal notes about this promo..." />
                                        </FormItem>
                                    </FormContainer>
                                </div>
                            </Tabs.TabContent>

                            <Tabs.TabContent value="schedule" className="px-4 pt-3 pb-4">
                                <div className="mx-auto w-full max-w-5xl space-y-6">
                                    <FormContainer>
                                        <FormItem label="Start Date" invalid={!!errors.startsAt} errorMessage={errors.startsAt?.message}>
                                            <Controller name="startsAt" control={control} render={({ field }) => (
                                                <DateTimepicker 
                                                    value={field.value ? new Date(field.value) : null} 
                                                    onChange={(d) => field.onChange(d?.toISOString() ?? '')} 
                                                    placeholder="Select start date & time..."
                                                />
                                            )} />
                                        </FormItem>
                                        <FormItem label="End Date" invalid={!!errors.endsAt} errorMessage={errors.endsAt?.message}>
                                            <Controller name="endsAt" control={control} render={({ field }) => (
                                                <DateTimepicker 
                                                    value={field.value ? new Date(field.value) : null} 
                                                    onChange={(d) => field.onChange(d?.toISOString() ?? '')} 
                                                    placeholder="Select end date & time..."
                                                />
                                            )} />
                                        </FormItem>
                                    </FormContainer>
                                </div>
                            </Tabs.TabContent>

                            <Tabs.TabContent value="limits" className="px-4 pt-3 pb-4">
                                <div className="mx-auto w-full max-w-5xl space-y-6">
                                    <FormContainer>
                                        <FormItem label="Global Usage Limit" extra={<span className="text-xs text-gray-500">Total uses across all users</span>} invalid={!!errors.globalLimit} errorMessage={errors.globalLimit?.message}>
                                            <Input type="number" min="0" {...register('globalLimit', { valueAsNumber: true })} placeholder="e.g., 1000" />
                                        </FormItem>
                                        <FormItem label="Per User Limit" extra={<span className="text-xs text-gray-500">Maximum uses per user</span>} invalid={!!errors.perUserLimit} errorMessage={errors.perUserLimit?.message}>
                                            <Input type="number" min="0" {...register('perUserLimit', { valueAsNumber: true })} placeholder="e.g., 5" />
                                        </FormItem>
                                        <FormItem label="Link TTL (seconds)" extra={<span className="text-xs text-gray-500">How long promo links stay valid</span>} invalid={!!errors.linkTTLSeconds} errorMessage={errors.linkTTLSeconds?.message}>
                                            <Input type="number" min="0" {...register('linkTTLSeconds', { valueAsNumber: true })} placeholder="e.g., 3600 (1 hour)" />
                                        </FormItem>
                                    </FormContainer>
                                </div>
                            </Tabs.TabContent>

                            <Tabs.TabContent value="products" className="px-4 pt-3 pb-4">
                                <div className="mx-auto w-full max-w-5xl space-y-6">
                                    <ProductIdsEditor value={form.productIds} onChange={(v) => setValue('productIds', v, { shouldDirty: true })} />
                                </div>
                            </Tabs.TabContent>

                            <Tabs.TabContent value="advanced" className="px-4 pt-3 pb-4">
                                <div className="mx-auto w-full max-w-5xl space-y-6">
                                    <FormContainer>
                                        <FormItem label="Tags" extra={<span className="text-xs text-gray-500">For organization and filtering</span>}>
                                            <ChipsInput value={form.tags} onChange={(v) => setValue('tags', v, { shouldDirty: true })} placeholder="Type a tag and press Enter" />
                                        </FormItem>
                                    </FormContainer>
                                </div>
                            </Tabs.TabContent>
                        </Tabs>
                    </Card>
                </div>
                <div className="lg:col-span-1">
                    <PromoPreview form={form} />
                </div>
            </div>
        </div>
    )
}
