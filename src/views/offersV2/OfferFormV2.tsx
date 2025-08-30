import { useEffect, useState } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { offerSchema, defaultOfferValues, type OfferFormInput } from './schema/offerSchema'
import { formToApiData, validateFormForSubmission } from './utils/dataTransform'
import { useNavigate } from 'react-router-dom'
import type { OfferWithId } from './types/offer'

import { FormContainer, FormItem } from '@/components/ui/Form'
import Input from '@/components/ui/Input'
import Button from '@/components/ui/Button'
import Tabs from '@/components/ui/Tabs'
import Card from '@/components/ui/Card'
import Tag from '@/components/ui/Tag'
import Alert from '@/components/ui/Alert'

import DiscountRuleEditor from './components/DiscountRuleEditor'
import TargetSelector from './components/TargetSelector'
import ScheduleEditor from './components/ScheduleEditor'
import GroupRulePanel from './components/GroupRulePanel'
import OfferPreview from './components/OfferPreview'
import useOffers from './hooks/useOffers'

type Props = { initial?: OfferWithId; onSaved?: (o: OfferWithId) => void; headerTitle?: string }

export default function OfferFormV2({ initial, onSaved, headerTitle }: Props) {
    const navigate = useNavigate()
    const [validationErrors, setValidationErrors] = useState<string[]>([])
    const [isDirtySinceMount, setIsDirtySinceMount] = useState(false)

    // Redux hooks
    const { createOffer, updateOffer, isCreating, isUpdating, offersError } = useOffers()

    const {
        control,
        register,
        handleSubmit,
        formState: { errors, isDirty, isSubmitting },
        reset,
        watch,
        setValue,
        clearErrors
    } = useForm<OfferFormInput>({
        resolver: zodResolver(offerSchema),
        defaultValues: initial ?? defaultOfferValues,
        mode: 'onChange',
    })

    useEffect(() => {
        const subscription = watch(() => setIsDirtySinceMount(true))
        return () => subscription.unsubscribe()
    }, [watch])

    useEffect(() => { if (initial) reset(initial) }, [initial, reset])
    
            const form = watch()

    async function onSubmit(values: OfferFormInput, shouldPublish = false) {
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

            // Save offer
            let savedOffer: OfferWithId
            if (initial?.id) {
                console.log('🔄 Updating existing offer with ID:', initial.id)
                savedOffer = await updateOffer(initial.id, apiData)
            } else {
                console.log('🔄 Creating new offer')
                savedOffer = await createOffer(apiData)
            }

            console.log('✅ Offer saved successfully!')

            // Success callback
            onSaved?.(savedOffer)
            setIsDirtySinceMount(false)

            // Navigate back to list or stay for further editing
            if (shouldPublish) {
                console.log('🔄 Navigating to offer list')
                navigate('/app/offers-v2/offer-list')
            }
        } catch (error) {
            console.error('❌ Save failed:', error)
            setValidationErrors([error instanceof Error ? error.message : 'Failed to save offer'])
        }
    }    const slug = (form.title || '').toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')

    return (
        <div className="space-y-4">
            <Card className="sticky top-0 z-10 rounded-md shadow-sm" bodyClass="py-3 px-4 md:px-6 lg:px-8 bg-white/80 dark:bg-gray-800/80 backdrop-blur">
                {/* Error Messages */}
            {(validationErrors.length > 0 || offersError) && (
                <Alert 
                    showIcon 
                    className="mb-4" 
                    type="danger"
                    onClose={() => {
                        setValidationErrors([])
                    }}
                >
                    <div>
                        {offersError && <div className="mb-2">{offersError}</div>}
                        {validationErrors.map((err, idx) => (
                            <div key={idx} className="mb-1">• {err}</div>
                        ))}
                    </div>
                </Alert>
            )}
            
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <h3 className="text-lg font-semibold">{headerTitle ?? 'New Offer'}</h3>
                    {isDirtySinceMount && (
                        <Tag className="bg-amber-100 text-amber-800 border border-amber-200 px-2 py-0.5 rounded" suffix suffixClass="bg-red-500">
                            Unsaved
                        </Tag>
                    )}
                    {(isCreating || isUpdating) && (
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
                        disabled={!isDirty || isCreating || isUpdating}
                    >
                        Cancel
                    </Button>
                    <Button 
                        type="button" 
                        onClick={handleSubmit(
                            (v) => {
                                console.log('🔘 Save Draft button clicked - handleSubmit success')
                                console.log('📊 Form state - isDirty:', isDirty, 'isLoading:', isCreating || isUpdating)
                                return onSubmit(v, false)
                            },
                            (errors) => {
                                console.log('❌ Save Draft - handleSubmit validation failed:', errors)
                            }
                        )} 
                        disabled={!isDirty || isCreating || isUpdating}
                        loading={isCreating || isUpdating}
                    >
                        Save Draft
                    </Button>
                    <Button 
                        type="button" 
                        variant="solid" 
                        onClick={handleSubmit(
                            (v) => {
                                console.log('🔘 Save & Activate button clicked - handleSubmit success')
                                console.log('📊 Form state - isDirty:', isDirty, 'isLoading:', isCreating || isUpdating)
                                return onSubmit(v, true)
                            },
                            (errors) => {
                                console.log('❌ Save & Activate - handleSubmit validation failed:', errors)
                            }
                        )} 
                        disabled={isCreating || isUpdating}
                        loading={isCreating || isUpdating}
                    >
                        Save & Activate
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
                                <Tabs.TabNav value="discount">Discount Rules</Tabs.TabNav>
                                <Tabs.TabNav value="target">Targeting</Tabs.TabNav>
                                <Tabs.TabNav value="schedule">Scheduling</Tabs.TabNav>
                                <Tabs.TabNav value="group">Group Rules</Tabs.TabNav>
                                <Tabs.TabNav value="advanced">Advanced</Tabs.TabNav>
                            </Tabs.TabList>

                            <Tabs.TabContent value="basics" className="px-4 pt-3 pb-4">
                                <div className="mx-auto w-full max-w-5xl space-y-6">
                                    <FormContainer>
                                        <FormItem label="Title" invalid={!!errors.title} errorMessage={errors.title?.message}><Input {...register('title')} /></FormItem>
                                        <div className="text-xs text-gray-500">Slug: {slug || '—'}</div>
                                        <FormItem label="Description" extra={<span className="text-xs text-gray-500">Max 500 chars</span>} invalid={!!errors.description} errorMessage={errors.description?.message}>
                                            <Input asElement="textarea" rows={4} {...register('description')} />
                                        </FormItem>
                                        <FormItem label="Combinable?">
                                            <Controller name="combinable" control={control} render={({ field }) => <Input asElement="input" type="checkbox" className="mr-2" checked={!!field.value} onChange={(e) => field.onChange(e.target.checked)} />} />
                                            <div className="text-xs text-gray-500 mt-1">If OFF, blocks stacking with other non-combinable offers.</div>
                                        </FormItem>
                                    </FormContainer>
                                </div>
                            </Tabs.TabContent>

                            <Tabs.TabContent value="discount" className="px-4 pt-3 pb-4">
                                <div className="mx-auto w-full max-w-5xl space-y-6">
                                    <DiscountRuleEditor control={control} watch={watch} />
                                </div>
                            </Tabs.TabContent>

                            <Tabs.TabContent value="target" className="px-4 pt-3 pb-4">
                                <div className="mx-auto w-full max-w-5xl space-y-6">
                                    <TargetSelector control={control} watch={watch} setValue={setValue} />
                                </div>
                            </Tabs.TabContent>

                            <Tabs.TabContent value="schedule" className="px-4 pt-3 pb-4">
                                <div className="mx-auto w-full max-w-5xl space-y-6">
                                    <ScheduleEditor control={control} watch={watch} />
                                </div>
                            </Tabs.TabContent>

                            <Tabs.TabContent value="group" className="px-4 pt-3 pb-4">
                                <div className="mx-auto w-full max-w-5xl space-y-6">
                                    <GroupRulePanel control={control} />
                                </div>
                            </Tabs.TabContent>

                            <Tabs.TabContent value="advanced" className="px-4 pt-3 pb-4">
                                <div className="mx-auto w-full max-w-5xl space-y-6">
                                    <FormContainer>
                                        <FormItem label="Conditions (JSON)">
                                            <Input asElement="textarea" rows={8} value={JSON.stringify(form.conditions || {}, null, 2)} onChange={(e) => {
                                                try { setValue('conditions', JSON.parse(e.target.value), { shouldDirty: true }) } catch { /* ignore */ }
                                            }} />
                                        </FormItem>
                                    </FormContainer>
                                </div>
                            </Tabs.TabContent>
                        </Tabs>
                    </Card>
                </div>
                <div className="lg:col-span-1">
                    <OfferPreview form={form} />
                </div>
            </div>
        </div>
    )
}



