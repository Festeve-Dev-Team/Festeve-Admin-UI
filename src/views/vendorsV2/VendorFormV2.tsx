import { useEffect, useMemo, useState } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { vendorSchema, defaultVendorValues, type VendorFormInput } from './schema/vendorSchema'
import Card from '@/components/ui/Card'
import Tabs from '@/components/ui/Tabs'
import Tag from '@/components/ui/Tag'
import Button from '@/components/ui/Button'
import { FormContainer, FormItem } from '@/components/ui/Form'
import Input from '@/components/ui/Input'
import ProductIdsEditor from './components/ProductIdsEditor'
import VendorPreview from './components/VendorPreview'

type Props = { initial?: VendorFormInput; onSaved?: (v: VendorFormInput) => void; headerTitle?: string }

export default function VendorFormV2({ initial, onSaved, headerTitle }: Props) {
    const [dirty, setDirty] = useState(false)
    const { control, register, handleSubmit, formState: { errors, isDirty, isSubmitting }, reset, watch, setValue } = useForm<VendorFormInput>({
        resolver: zodResolver(vendorSchema),
        defaultValues: initial ?? defaultVendorValues,
        mode: 'onChange',
    })
    useEffect(() => { const s = watch(() => setDirty(true)); return () => s.unsubscribe() }, [watch])
    useEffect(() => { if (initial) reset(initial) }, [initial, reset])
    const form = watch()
    async function onSubmit(v: VendorFormInput) { onSaved?.(v); setDirty(false) }

    const slug = useMemo(() => (form.name || '').toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''), [form.name])

    return (
        <div className="space-y-4">
            <Card className="sticky top-0 z-10 rounded-md shadow-sm" bodyClass="py-3 px-4 md:px-6 lg:px-8 bg-white/80 dark:bg-gray-800/80 backdrop-blur">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <h3 className="text-lg font-semibold">{headerTitle ?? 'New Vendor'}</h3>
                        {dirty && (<Tag className="bg-amber-100 text-amber-800 border border-amber-200 px-2 py-0.5 rounded" suffix suffixClass="bg-red-500">Unsaved</Tag>)}
                    </div>
                    <div className="flex items-center gap-2">
                        <Button type="button" onClick={() => reset()} disabled={!isDirty}>Cancel</Button>
                        <Button type="button" onClick={handleSubmit(onSubmit)} disabled={!isDirty || isSubmitting}>Save</Button>
                        <Button type="button" variant="solid" onClick={handleSubmit(onSubmit)} disabled={isSubmitting}>Save & Publish</Button>
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
                                        <FormItem label="name" extra={<span className="text-xs text-gray-500">Public vendor display name</span>} invalid={!!errors.name} errorMessage={errors.name?.message}>
                                            <Input {...register('name')} />
                                        </FormItem>
                                        <div className="text-xs text-gray-500">Slug: {slug || '—'}</div>
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



