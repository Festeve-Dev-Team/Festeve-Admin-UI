import { useEffect, useMemo, useState } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { productSchema, defaultProductValues, type ProductFormInput } from './schema/productSchema'
import { saveProduct } from './services/productApi'
import { calcEffectivePrice, formatCurrency } from './utils/pricing'

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

import VariantsGrid from './components/VariantsGrid'
import RightRailPreview from './components/RightRailPreview'
import MetaJsonEditor from './components/MetaJsonEditor'
import ImagesUploader from './components/ImagesUploader'

type Props = {
    initial?: ProductFormInput
    onSaved?: (p: ProductFormInput) => void
    headerTitle?: string
}

export default function ProductFormV2({ initial, onSaved, headerTitle }: Props) {
    const [isDirtySinceMount, setIsDirtySinceMount] = useState(false)
    const {
        control,
        register,
        handleSubmit,
        formState: { errors, isDirty, isSubmitting },
        reset,
        watch,
        setValue,
    } = useForm<ProductFormInput>({
        resolver: zodResolver(productSchema),
        defaultValues: initial ?? defaultProductValues,
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

    const form = watch()

    async function onSubmit(values: ProductFormInput) {
        await saveProduct(values)
        onSaved?.(values)
        setIsDirtySinceMount(false)
    }

    const effectivePrimaryPrice = useMemo(() => {
        const v = form.variants[0]
        return v ? calcEffectivePrice(v.price, v.discountType, v.discountValue) : 0
    }, [form.variants])

    return (
        <div className="space-y-4">
            <Card className="sticky top-0 z-10" bodyClass="py-3 px-4 md:px-6 lg:px-8 bg-white/80 dark:bg-gray-800/80 backdrop-blur">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <h3 className="text-lg font-semibold">{headerTitle ?? 'New Product'}</h3>
                        {isDirtySinceMount && (
                            <Tag className="bg-amber-100 text-amber-800 border border-amber-200 px-2 py-0.5 rounded" suffix suffixClass="bg-red-500" aria-label="Unsaved changes">
                                Unsaved
                            </Tag>
                        )}
                    </div>
                    <div className="flex items-center gap-2">
                        <Button type="button" onClick={() => reset()} disabled={!isDirty}>Cancel</Button>
                        <Button type="button" onClick={handleSubmit((v) => onSubmit(v))} disabled={!isDirty || isSubmitting}>Save</Button>
                        <Button type="button" variant="solid" onClick={handleSubmit((v) => onSubmit(v))} disabled={isSubmitting}>Save & Publish</Button>
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
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <FormItem label="Category" invalid={!!errors.category} errorMessage={errors.category?.message}>
                                            <Input {...register('category')} placeholder="Search or create category" />
                                        </FormItem>
                                        <FormItem label="Vendors">
                                            <Input {...register('vendors.0')} placeholder="Comma separated vendors or multi-select in real impl" />
                                        </FormItem>
                                    </div>
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
                                            <Input type="number" step="0.01" {...register('defaultDiscountValue', { valueAsNumber: true })} />
                                        </FormItem>
                                        <FormItem label="Offer Type">
                                            <select className="input" {...register('offerType')}>
                                                <option value="exclusive_offer">Exclusive Offer</option>
                                                <option value="flash_sale">Flash Sale</option>
                                                <option value="bogo">Buy One Get One</option>
                                                <option value="seasonal">Seasonal</option>
                                                <option value="clearance">Clearance</option>
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
                                        <Input {...register('meta.keywords.0' as const)} placeholder="Comma separated – chips in real impl" />
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


