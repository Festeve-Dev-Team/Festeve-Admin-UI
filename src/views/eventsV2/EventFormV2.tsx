import { useEffect, useMemo, useState } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { eventSchema, defaultEventValues, type EventFormInput } from './schema/eventSchema'
import { formToApiData, validateFormForSubmission } from './utils'
import useEvents from './hooks/useEvents'
import useProducts from '@/utils/hooks/useProducts'
import { useNavigate } from 'react-router-dom'

import Card from '@/components/ui/Card'
import Tabs from '@/components/ui/Tabs'
import Tag from '@/components/ui/Tag'
import Button from '@/components/ui/Button'
import Alert from '@/components/ui/Alert'
import Switcher from '@/components/ui/Switcher'
import { FormContainer, FormItem } from '@/components/ui/Form'
import Input from '@/components/ui/Input'
import DateTimepicker from '@/components/ui/DatePicker/DateTimepicker'

import RecurrenceEditor from './components/RecurrenceEditor'
import LinkedProductsEditor from './components/LinkedProductsEditor'
import OffersEditor from './components/OffersEditor'
import ProductIdsEditor from './components/ProductIdsEditor'
import ChipsInput from './components/ChipsInput'
import EventPreview from './components/EventPreview'

type Props = { initial?: EventFormInput; onSaved?: (e: EventFormInput) => void; headerTitle?: string }

export default function EventFormV2({ initial, onSaved, headerTitle }: Props) {
    const navigate = useNavigate()
    const [isDirtySinceMount, setIsDirtySinceMount] = useState(false)
    const [validationErrors, setValidationErrors] = useState<string[]>([])
    
    // Redux hooks
    const { createEvent, updateEvent, isCreating, isUpdating, error } = useEvents()
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
    } = useForm<EventFormInput>({
        resolver: zodResolver(eventSchema),
        defaultValues: {
            ...defaultEventValues,
            ...initial,
            purohitRequired: initial?.purohitRequired ?? defaultEventValues.purohitRequired ?? false
        },
        mode: 'onChange',
    })

    const [hasInitialized, setHasInitialized] = useState(false)
    const [lastInitialId, setLastInitialId] = useState<string | null>(null)

    useEffect(() => {
        const subscription = watch(() => setIsDirtySinceMount(true))
        return () => subscription.unsubscribe()
    }, [watch])

    useEffect(() => {
        // Reset initialization flag if we're editing a different event
        if (initial?.id && initial.id !== lastInitialId) {
            setHasInitialized(false)
            setLastInitialId(initial.id)
        }
        
        // Only reset the form once when initial data is first provided
        if (initial && !hasInitialized) {
            console.log('🔄 EventForm - Initializing form with data:', initial)
            reset(initial)
            setHasInitialized(true)
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [initial, hasInitialized, lastInitialId])

    // Load products on mount (same as VendorFormV2)
    useEffect(() => {
        console.log('EventFormV2: Loading products on mount')
        loadProducts({ page: 1, limit: 20 })
    }, [loadProducts])

    const form = watch()
    const isLoading = isCreating || isUpdating

    async function onSubmit(values: EventFormInput, shouldPublish = false) {
        try {
            console.log('🚀 EventForm - Form submission started')
            console.log('📝 EventForm - Form values:', values)
            console.log('🔍 EventForm - values.id:', (values as any).id)
            console.log('🔍 EventForm - initial data:', initial)
            
            // Clear previous validation errors
            setValidationErrors([])
            clearErrors()

            // Validate form data
            const formValidation = validateFormForSubmission(values)
            if (!formValidation.isValid) {
                console.log('❌ EventForm - Form validation failed:', formValidation.errors)
                setValidationErrors(formValidation.errors)
                return
            }

            // Transform form data to API format
            const apiData = formToApiData(values)
            console.log('📦 EventForm - API data prepared:', apiData)

            // Save event - check for ID to determine create vs update
            const eventId = (values as any).id || initial?.id
            if (eventId) {
                console.log('🔄 EventForm - Updating existing event with ID:', eventId)
                await updateEvent(eventId, apiData)
            } else {
                console.log('✨ EventForm - Creating new event')
                await createEvent(apiData)
            }

            console.log('✅ EventForm - Event saved successfully')

            // Success callback
            onSaved?.(values)
            setIsDirtySinceMount(false)

            // Navigate back to list or stay for further editing
            if (shouldPublish) {
                navigate('/app/events-v2/event-list')
            }
        } catch (error) {
            console.error('💥 EventForm - Save failed:', error)
            setValidationErrors([error instanceof Error ? error.message : 'Failed to save event'])
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
                        <h3 className="text-lg font-semibold">{headerTitle ?? 'New Event'}</h3>
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
                                {/* <Tabs.TabNav value="links">Links</Tabs.TabNav> */}
                                <Tabs.TabNav value="products">Products</Tabs.TabNav>
                                <Tabs.TabNav value="regions">Regions</Tabs.TabNav>
                                <Tabs.TabNav value="purohit">Purohit & Rituals</Tabs.TabNav>
                                {/* <Tabs.TabNav value="extra">Extra Data</Tabs.TabNav> */}
                            </Tabs.TabList>

                            <Tabs.TabContent value="basics" className="px-4 pt-3 pb-4">
                                <div className="mx-auto w-full max-w-5xl space-y-6">
                                    <FormContainer>
                                        <FormItem label="Name" invalid={!!errors.name} errorMessage={errors.name?.message}><Input {...register('name')} /></FormItem>
                                        <FormItem label="Description" extra={<span className="text-xs text-gray-500">Max 1000 chars</span>} invalid={!!errors.description} errorMessage={errors.description?.message}>
                                            <Input asElement="textarea" rows={5} {...register('description')} />
                                        </FormItem>
                                        <FormItem label="Type"><Input {...register('type')} placeholder="daily / seasonal / festival" /></FormItem>
                                    </FormContainer>
                                </div>
                            </Tabs.TabContent>

                            <Tabs.TabContent value="schedule" className="px-4 pt-3 pb-4">
                                <div className="mx-auto w-full max-w-5xl space-y-6">
                                    <FormContainer>
                                        <FormItem label="Date (IST)">
                                            <Controller name="date" control={control} render={({ field }) => (
                                                <DateTimepicker value={field.value ? new Date(field.value) : null} onChange={(d) => field.onChange(d?.toISOString() ?? '')} />
                                            )} />
                                        </FormItem>
                                    </FormContainer>
                                    <RecurrenceEditor control={control} watch={watch} />
                                </div>
                            </Tabs.TabContent>

                            {/* <Tabs.TabContent value="links" className="px-4 pt-3 pb-4">
                                <div className="mx-auto w-full max-w-5xl space-y-6">
                                    <LinkedProductsEditor value={form.linkedProducts} onChange={(v) => setValue('linkedProducts', v, { shouldDirty: true })} />
                                    <OffersEditor value={form.specialOffers} onChange={(v) => setValue('specialOffers', v, { shouldDirty: true })} />
                                </div>
                            </Tabs.TabContent> */}

                            <Tabs.TabContent value="products" className="px-4 pt-3 pb-4">
                                <div className="mx-auto w-full max-w-5xl space-y-6">
                                    <ProductIdsEditor value={form.productIds} onChange={(v) => setValue('productIds', v, { shouldDirty: true })} />
                                </div>
                            </Tabs.TabContent>

                            <Tabs.TabContent value="regions" className="px-4 pt-3 pb-4">
                                <div className="mx-auto w-full max-w-5xl space-y-6">
                                    <FormContainer>
                                        <FormItem label="Region (primary)"><Input {...register('region')} /></FormItem>
                                        <FormItem label="Regions (multiple)"><ChipsInput value={form.regions} onChange={(v) => setValue('regions', v, { shouldDirty: true })} /></FormItem>
                                        <div className="text-xs text-gray-500">Used for targeted visibility</div>
                                    </FormContainer>
                                </div>
                            </Tabs.TabContent>

                            <Tabs.TabContent value="purohit" className="px-4 pt-3 pb-4">
                                <div className="mx-auto w-full max-w-5xl space-y-6">
                                    <FormContainer>
                                        <FormItem label="Purohit required?">
                                            <Controller
                                                name="purohitRequired"
                                                control={control}
                                                render={({ field: { value, onChange } }) => {
                                                    return (
                                                        <Switcher 
                                                            checked={Boolean(value)}
                                                            onChange={(checked, e) => {
                                                                console.log('🔄 Switch clicked - new value:', checked)
                                                                onChange(checked)
                                                            }}
                                                        />
                                                    )
                                                }}
                                            />
                                        </FormItem>
                                        <FormItem label="Ritual notes"><Input asElement="textarea" rows={4} {...register('ritualNotes')} /></FormItem>
                                    </FormContainer>
                                </div>
                            </Tabs.TabContent>

                            {/* <Tabs.TabContent value="extra" className="px-4 pt-3 pb-4">
                                <div className="mx-auto w-full max-w-5xl space-y-6">
                                    <FormContainer>
                                        <FormItem label="Extra Data (JSON)">
                                            <Input asElement="textarea" rows={8} value={JSON.stringify(form.extraData || {}, null, 2)} onChange={(e) => {
                                                try { setValue('extraData', JSON.parse(e.target.value), { shouldDirty: true }) } catch {  }
                                            }} />
                                        </FormItem>
                                    </FormContainer>
                                </div>
                            </Tabs.TabContent> */}
                        </Tabs>
                    </Card>
                </div>
                <div className="lg:col-span-1">
                    <EventPreview form={form} />
                </div>
            </div>
        </div>
    )
}



