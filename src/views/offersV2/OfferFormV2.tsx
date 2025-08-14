import { useEffect, useState } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { offerSchema, defaultOfferValues, type OfferFormInput } from './schema/offerSchema'
import { saveOffer } from './services/offerApi'

import { FormContainer, FormItem } from '@/components/ui/Form'
import Input from '@/components/ui/Input'
import Button from '@/components/ui/Button'
import Tabs from '@/components/ui/Tabs'
import Card from '@/components/ui/Card'
import Tag from '@/components/ui/Tag'

import DiscountRuleEditor from './components/DiscountRuleEditor'
import TargetSelector from './components/TargetSelector'
import ScheduleEditor from './components/ScheduleEditor'
import GroupRulePanel from './components/GroupRulePanel'
import OfferPreview from './components/OfferPreview'

type Props = { initial?: OfferFormInput; onSaved?: (o: OfferFormInput) => void; headerTitle?: string }

export default function OfferFormV2({ initial, onSaved, headerTitle }: Props) {
    const [dirty, setDirty] = useState(false)
    const { control, register, handleSubmit, formState: { errors, isDirty, isSubmitting }, reset, watch, setValue } = useForm<OfferFormInput>({
        resolver: zodResolver(offerSchema),
        defaultValues: initial ?? defaultOfferValues,
        mode: 'onChange',
    })
    useEffect(() => { const s = watch(() => setDirty(true)); return () => s.unsubscribe() }, [watch])
    useEffect(() => { if (initial) reset(initial) }, [initial, reset])
    const form = watch()
    async function onSubmit(v: OfferFormInput) { await saveOffer(v); onSaved?.(v); setDirty(false) }

    const slug = (form.title || '').toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')

    return (
        <div className="space-y-4">
            <Card className="sticky top-0 z-10 rounded-md shadow-sm" bodyClass="py-3 px-4 md:px-6 lg:px-8 bg-white/80 dark:bg-gray-800/80 backdrop-blur">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <h3 className="text-lg font-semibold">{headerTitle ?? 'New Offer'}</h3>
                        {dirty && (<Tag className="bg-amber-100 text-amber-800 border border-amber-200 px-2 py-0.5 rounded" suffix suffixClass="bg-red-500">Unsaved</Tag>)}
                    </div>
                    <div className="flex items-center gap-2">
                        <Button type="button" onClick={() => reset()} disabled={!isDirty}>Cancel</Button>
                        <Button type="button" onClick={handleSubmit(onSubmit)} disabled={!isDirty || isSubmitting}>Save Draft</Button>
                        <Button type="button" variant="solid" onClick={handleSubmit(onSubmit)} disabled={isSubmitting}>Save & Activate</Button>
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



