import { useEffect, useState } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { eventSchema, defaultEventValues, type EventFormInput } from './schema/eventSchema'
import { saveEvent } from './services/eventApi'

import { FormContainer, FormItem } from '@/components/ui/Form'
import Input from '@/components/ui/Input'
import Button from '@/components/ui/Button'
import Tabs from '@/components/ui/Tabs'
import Card from '@/components/ui/Card'
import Tag from '@/components/ui/Tag'
import DateTimepicker from '@/components/ui/DatePicker/DateTimepicker'

import RecurrenceEditor from './components/RecurrenceEditor'
import LinkedProductsEditor from './components/LinkedProductsEditor'
import OffersEditor from './components/OffersEditor'
import ChipsInput from './components/ChipsInput'
import EventPreview from './components/EventPreview'

type Props = { initial?: EventFormInput; onSaved?: (e: EventFormInput) => void; headerTitle?: string }

export default function EventFormV2({ initial, onSaved, headerTitle }: Props) {
    const [isDirtySinceMount, setDirty] = useState(false)
    const { control, register, handleSubmit, formState: { errors, isDirty, isSubmitting }, reset, watch, setValue } = useForm<EventFormInput>({
        resolver: zodResolver(eventSchema),
        defaultValues: initial ?? defaultEventValues,
        mode: 'onChange',
    })
    useEffect(() => { const s = watch(() => setDirty(true)); return () => s.unsubscribe() }, [watch])
    useEffect(() => { if (initial) reset(initial) }, [initial, reset])
    const form = watch()
    async function onSubmit(v: EventFormInput) { await saveEvent(v); onSaved?.(v); setDirty(false) }

    return (
        <div className="space-y-4">
            <Card className="sticky top-0 z-10 rounded-md shadow-sm" bodyClass="py-3 px-4 md:px-6 lg:px-8 bg-white/80 dark:bg-gray-800/80 backdrop-blur">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <h3 className="text-lg font-semibold">{headerTitle ?? 'New Event'}</h3>
                        {isDirtySinceMount && (
                            <Tag className="bg-amber-100 text-amber-800 border border-amber-200 px-2 py-0.5 rounded" suffix suffixClass="bg-red-500">Unsaved</Tag>
                        )}
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
                                <Tabs.TabNav value="schedule">Schedule</Tabs.TabNav>
                                <Tabs.TabNav value="links">Links</Tabs.TabNav>
                                <Tabs.TabNav value="regions">Regions</Tabs.TabNav>
                                <Tabs.TabNav value="purohit">Purohit & Rituals</Tabs.TabNav>
                                <Tabs.TabNav value="extra">Extra Data</Tabs.TabNav>
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

                            <Tabs.TabContent value="links" className="px-4 pt-3 pb-4">
                                <div className="mx-auto w-full max-w-5xl space-y-6">
                                    <LinkedProductsEditor value={form.linkedProducts} onChange={(v) => setValue('linkedProducts', v, { shouldDirty: true })} />
                                    <OffersEditor value={form.specialOffers} onChange={(v) => setValue('specialOffers', v, { shouldDirty: true })} />
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
                                            <Controller name="purohitRequired" control={control} render={({ field }) => <Input asElement="input" type="checkbox" className="mr-2" checked={!!field.value} onChange={(e) => field.onChange(e.target.checked)} />} />
                                        </FormItem>
                                        <FormItem label="Ritual notes"><Input asElement="textarea" rows={4} {...register('ritualNotes')} /></FormItem>
                                    </FormContainer>
                                </div>
                            </Tabs.TabContent>

                            <Tabs.TabContent value="extra" className="px-4 pt-3 pb-4">
                                <div className="mx-auto w-full max-w-5xl space-y-6">
                                    <FormContainer>
                                        <FormItem label="Extra Data (JSON)">
                                            <Input asElement="textarea" rows={8} value={JSON.stringify(form.extraData || {}, null, 2)} onChange={(e) => {
                                                try { setValue('extraData', JSON.parse(e.target.value), { shouldDirty: true }) } catch { /* ignore */ }
                                            }} />
                                        </FormItem>
                                    </FormContainer>
                                </div>
                            </Tabs.TabContent>
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



