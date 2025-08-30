import { useEffect, useMemo, useState } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { productSchema, defaultProductValues, type ProductFormInput } from './schema/productSchema'
import { calcEffectivePrice, formatCurrency } from './utils/pricing'
import { formToApiData, validateFormForSubmission, validateUniqueSKUs } from './utils/dataTransform'
import useProducts from '@/utils/hooks/useProducts'
import { useNavigate } from 'react-router-dom'

import { FormContainer, FormItem } from '@/components/ui/Form'
import Input from '@/components/ui/Input'
import Button from '@/components/ui/Button'
import Switcher from '@/components/ui/Switcher'
import Tabs from '@/components/ui/Tabs'
import Card from '@/components/ui/Card'
import DateTimepicker from '@/components/ui/DatePicker/DateTimepicker'
import Tooltip from '@/components/ui/Tooltip'
import Badge from '@/components/ui/Badge'
import Tag from '@/components/ui/Tag'
import Alert from '@/components/ui/Alert'

import VariantsGrid from './components/VariantsGrid'
import RightRailPreview from './components/RightRailPreview'
import MetaJsonEditor from './components/MetaJsonEditor'
import ImagesUploader from './components/ImagesUploader'
import CategorySelector from './components/CategorySelector'

type Props = {
    initial?: ProductFormInput
    onSaved?: (p: ProductFormInput) => void
    headerTitle?: string
}

export default function ProductFormV2({ initial, onSaved, headerTitle }: Props) {
    const navigate = useNavigate()
    const [isDirtySinceMount, setIsDirtySinceMount] = useState(false)
    const [validationErrors, setValidationErrors] = useState<string[]>([])
    
    // Redux hooks
    const { createNewProduct, updateExistingProduct, isCreating, isUpdating, error } = useProducts()
    
    const {
        control,
        register,
        handleSubmit,
        formState: { errors, isDirty, isSubmitting, isValid },
        reset,
        watch,
        setValue,
        setError,
        clearErrors,
        getValues
    } = useForm<ProductFormInput>({
        resolver: zodResolver(productSchema),
        defaultValues: initial ?? defaultProductValues,
        mode: 'onChange',
        shouldFocusError: false,
    })

    useEffect(() => {
        const subscription = watch(() => setIsDirtySinceMount(true))
        return () => subscription.unsubscribe()
    }, [watch])

    useEffect(() => {
        if (initial) reset(initial)
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [initial])

    const form = watch()
    const isLoading = isCreating || isUpdating

    // Debug form state changes (only when there are errors)
    useEffect(() => {
        const errorCount = Object.keys(errors).length
        if (errorCount > 0) {
            console.log('❌ Current form errors:', errors)
            console.log('📊 Form state:', { isValid, isDirty, errorCount })
        }
    }, [errors, isValid, isDirty])

    async function onSubmit(values: ProductFormInput, shouldPublish = false) {
        try {
            console.log('🚀 Form submission started')
            console.log('📋 Form values:', values)
            console.log('🔍 React Hook Form errors:', errors)
            console.log('📊 Form state - isValid:', isValid, 'isDirty:', isDirty)
            
            // Clear previous validation errors
            setValidationErrors([])
            clearErrors()

            // Validate form data
            const formValidation = validateFormForSubmission(values)
            if (!formValidation.isValid) {
                console.log('❌ Form validation failed:', formValidation.errors)
                setValidationErrors(formValidation.errors)
                return
            }

            // Validate unique SKUs only if variants exist
            if (values.variants && values.variants.length > 0) {
                const skuValidation = validateUniqueSKUs(values.variants)
                if (!skuValidation.isValid) {
                    console.log('❌ SKU validation failed:', skuValidation.duplicates)
                    skuValidation.duplicates.forEach(sku => {
                        setValidationErrors(prev => [...prev, `Duplicate SKU found: ${sku}`])
                    })
                    return
                }
            }

            // Transform form data to API format
            const apiData = formToApiData(values)
            console.log('📦 API data prepared:', apiData)

            // Save product
            if (values.id) {
                console.log('🔄 Updating existing product')
                await updateExistingProduct(values.id, apiData)
            } else {
                console.log('✨ Creating new product')
                await createNewProduct(apiData)
            }

            console.log('✅ Product saved successfully')
            
            // Success callback
            onSaved?.(values)
            setIsDirtySinceMount(false)

            // Navigate back to list or stay for further editing
            if (shouldPublish) {
                navigate('/app/sales-v2/product-list')
            }
        } catch (error) {
            console.error('💥 Save failed:', error)
            console.log('💥 Full error object:', error)
            setValidationErrors([error instanceof Error ? error.message : 'Failed to save product'])
        }
    }

    const effectivePrimaryPrice = useMemo(() => {
        const v = form.variants[0]
        return v ? calcEffectivePrice(v.price || 0, v.discountType || 'none', v.discountValue || 0) : 0
    }, [form.variants])

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
                        {error && <div className="mb-2">{typeof error === 'string' ? error : JSON.stringify(error)}</div>}
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
                        <h3 className="text-lg font-semibold">{headerTitle ?? 'New Product'}</h3>
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
                                    console.log('💾 Save Draft button clicked - handleSubmit passed validation')
                                    onSubmit(v, false)
                                },
                                (errors) => {
                                    console.log('❌ Save Draft - handleSubmit validation failed:', errors)
                                    // Filter out meta validation errors as they're not critical
                                    const criticalErrors = Object.keys(errors).filter(key => key !== 'meta')
                                    if (criticalErrors.length === 0) {
                                        console.log('⚠️ Only meta errors detected, attempting submission anyway')
                                        const values = getValues()
                                        onSubmit(values, false)
                                    }
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
                                    console.log('🚀 Save & Publish button clicked - handleSubmit passed validation')
                                    onSubmit(v, true)
                                },
                                (errors) => {
                                    console.log('❌ Save & Publish - handleSubmit validation failed:', errors)
                                    // Filter out meta validation errors as they're not critical
                                    const criticalErrors = Object.keys(errors).filter(key => key !== 'meta')
                                    if (criticalErrors.length === 0) {
                                        console.log('⚠️ Only meta errors detected, attempting submission anyway')
                                        const values = getValues()
                                        onSubmit(values, true)
                                    }
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
                    <Card className="p-2 md:p-3">
                    <Tabs defaultValue="basics" variant="pill">
                        <Tabs.TabList>
                            <Tabs.TabNav value="basics">Basics</Tabs.TabNav>
                            <Tabs.TabNav value="variants">Variants</Tabs.TabNav>
                            <Tabs.TabNav value="offers">Offers & Visibility</Tabs.TabNav>
                            <Tabs.TabNav value="seo">SEO & Meta</Tabs.TabNav>
                            <Tabs.TabNav value="preview">Preview</Tabs.TabNav>
                        </Tabs.TabList>

                        <Tabs.TabContent value="basics" className="p-4 space-y-4">
                                <FormContainer>
                                    <FormItem label="Name" invalid={!!errors.name} errorMessage={errors.name?.message}>
                                        <Input autoFocus {...register('name')} placeholder="Product name" />
                                    </FormItem>
                                    <FormItem label="Description" invalid={!!errors.description} errorMessage={errors.description?.message}>
                                        <Input asElement="textarea" rows={6} {...register('description')} placeholder="Rich description (supports HTML/Markdown in real impl)" />
                                    </FormItem>
                                    <CategorySelector
                                        value={form.category || ''}
                                        onChange={(categoryId) => setValue('category', categoryId, { shouldDirty: true })}
                                        label="Category"
                                        invalid={!!errors.category}
                                        errorMessage={errors.category?.message}
                                    />
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <FormItem label="Tags">
                                            <Input {...register('tags.0')} placeholder="Creatable chips – type and press enter" />
                                        </FormItem>
                                        <FormItem label="Ingredients">
                                            <Input {...register('ingredients.0')} placeholder="Quick add ingredients" />
                                        </FormItem>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <FormItem
                                            label="Hot Item"
                                            extra={
                                                <Tooltip title="Surfaces on home and special carousels">
                                                    <span className="text-gray-400">?</span>
                                                </Tooltip>
                                            }
                                        >
                                            <Controller
                                                name="isHotItem"
                                                control={control}
                                                render={({ field }) => <Switcher field={field} />}
                                            />
                                        </FormItem>
                                        <FormItem label="Trending">
                                            <Controller
                                                name="isTrending"
                                                control={control}
                                                render={({ field }) => <Switcher field={field} />}
                                            />
                                        </FormItem>
                                    </div>
                                </FormContainer>
                        </Tabs.TabContent>

                        <Tabs.TabContent value="variants" className="p-4 space-y-4">
                            <VariantsGrid
                                value={form.variants}
                                onChange={(v) => setValue('variants', v, { shouldDirty: true, shouldTouch: true, shouldValidate: true })}
                            />
                            <ImagesUploader
                                value={form.variants[0]?.images ?? []}
                                onChange={(imgs) => {
                                    const next = [...form.variants]
                                    if (next[0]) next[0] = { ...next[0], images: imgs }
                                    setValue('variants', next as ProductFormInput['variants'], { shouldDirty: true })
                                }}
                            />
                        </Tabs.TabContent>

                        <Tabs.TabContent value="offers" className="p-4 space-y-4">
                                <FormContainer>
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        <FormItem label="Default Discount Type">
                                            <select className="input" {...register('defaultDiscountType')}>
                                                <option value="none">None</option>
                                                <option value="percentage">Percentage</option>
                                                <option value="fixed">Fixed</option>
                                            </select>
                                        </FormItem>
                                        <FormItem label="Default Discount Value" invalid={!!errors.defaultDiscountValue} errorMessage={errors.defaultDiscountValue?.message}>
                                            <Input type="number" step="0.01" {...register('defaultDiscountValue', { 
                                                setValueAs: (v) => {
                                                    if (v === '' || v === null || v === undefined) return 0
                                                    const num = Number(v)
                                                    return isNaN(num) ? 0 : num
                                                }
                                            })} />
                                        </FormItem>
                                        <FormItem label="Offer Type">
                                            <select className="input" {...register('offerType')}>
                                                <option value="">Select offer type</option>
                                                <option value="exclusive_offer">Exclusive Offer</option>
                                                <option value="flash_sale">Flash Sale</option>
                                                <option value="best_deal">Best Deal</option>
                                            </select>
                                        </FormItem>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <FormItem label="Offer Start">
                                            <Controller
                                                control={control}
                                                name="offerStart"
                                                render={({ field }) => (
                                                    <DateTimepicker
                                                        value={field.value ? new Date(field.value) : null}
                                                        onChange={(date) => field.onChange(date?.toISOString() ?? '')}
                                                    />
                                                )}
                                            />
                                        </FormItem>
                                        <FormItem label="Offer End" invalid={!!errors.offerEnd} errorMessage={errors.offerEnd?.message}>
                                            <Controller
                                                control={control}
                                                name="offerEnd"
                                                render={({ field }) => (
                                                    <DateTimepicker
                                                        value={field.value ? new Date(field.value) : null}
                                                        onChange={(date) => field.onChange(date?.toISOString() ?? '')}
                                                    />
                                                )}
                                            />
                                        </FormItem>
                                    </div>
                                    <div className="text-sm text-gray-500">Effective price of primary variant: <span className="font-medium">{formatCurrency(effectivePrimaryPrice)}</span></div>
                                </FormContainer>
                        </Tabs.TabContent>

                        <Tabs.TabContent value="seo" className="p-4 space-y-4">
                                <FormContainer>
                                    <FormItem label="Meta Title">
                                        <Input {...register('meta.title')} />
                                    </FormItem>
                                    <FormItem label="Meta Description">
                                        <Input asElement="textarea" rows={4} {...register('meta.description' as const)} />
                                    </FormItem>
                                    <FormItem label="Keywords">
                                        <Input 
                                            placeholder="Comma separated – chips in real impl"
                                            onChange={(e) => {
                                                const value = e.target.value
                                                if (!value || value.trim() === '') {
                                                    setValue('meta.keywords', [], { shouldDirty: true })
                                                } else {
                                                    const keywords = value.split(',').map(k => k.trim()).filter(k => k)
                                                    setValue('meta.keywords', keywords, { shouldDirty: true })
                                                }
                                            }}
                                            defaultValue={Array.isArray(form.meta?.keywords) ? form.meta.keywords.join(', ') : ''}
                                        />
                                    </FormItem>
                                    <MetaJsonEditor
                                        value={form.meta as Record<string, unknown>}
                                        onChange={(v) => setValue('meta', v as ProductFormInput['meta'], { shouldDirty: true })}
                                    />
                                </FormContainer>
                        </Tabs.TabContent>

                        <Tabs.TabContent value="preview" className="p-4">
                            <div className="prose dark:prose-invert max-w-none">
                                <h4>Product JSON</h4>
                                <pre className="whitespace-pre-wrap break-all text-xs">{JSON.stringify(form, null, 2)}</pre>
                            </div>
                        </Tabs.TabContent>
                    </Tabs>
                    </Card>
                </div>
                <div className="lg:col-span-1">
                    <RightRailPreview form={form} />
                </div>
            </div>

            {/* Bottom controls removed; top sticky controls are the single source of truth */}
        </div>
    )
}


