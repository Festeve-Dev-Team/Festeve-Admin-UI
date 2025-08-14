import { useEffect, useState } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { slotSchema, defaultSlotValues, type SlotFormInput } from './schema/slotSchema'
import Card from '@/components/ui/Card'
import Tabs from '@/components/ui/Tabs'
import Tag from '@/components/ui/Tag'
import Button from '@/components/ui/Button'
import { FormContainer, FormItem } from '@/components/ui/Form'
import Input from '@/components/ui/Input'
import Switcher from '@/components/ui/Switcher'
import ScheduleEditor from './components/ScheduleEditor'
import CapacityEditor from './components/CapacityEditor'
import SlotPreview from './components/SlotPreview'
import { checkSlotConflicts, saveSlot } from './services/slotApi'

type Props = { initial?: SlotFormInput; onSaved?: (v: SlotFormInput) => void; headerTitle?: string }

export default function SlotFormV2({ initial, onSaved, headerTitle }: Props) {
    const [dirty, setDirty] = useState(false)
    const [conflicts, setConflicts] = useState<number | undefined>()
    const { control, register, handleSubmit, formState: { errors, isDirty, isSubmitting }, reset, watch, setValue } = useForm<SlotFormInput>({
        resolver: zodResolver(slotSchema),
        defaultValues: initial ?? defaultSlotValues,
        mode: 'onChange',
    })
    useEffect(() => { const s = watch(() => setDirty(true)); return () => s.unsubscribe() }, [watch])
    useEffect(() => { if (initial) reset(initial) }, [initial, reset])
    const form = watch()
    async function onSubmit(v: SlotFormInput) { await saveSlot(v); onSaved?.(v); setDirty(false) }

    return (
        <div className="space-y-4">
            <Card className="sticky top-0 z-10 rounded-md shadow-sm" bodyClass="py-3 px-4 md:px-6 lg:px-8 bg-white/80 dark:bg-gray-800/80 backdrop-blur">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <h3 className="text-lg font-semibold">{headerTitle ?? 'New Delivery Slot'}</h3>
                        {dirty && (<Tag className="bg-amber-100 text-amber-800 border border-amber-200 px-2 py-0.5 rounded" suffix suffixClass="bg-red-500">Unsaved</Tag>)}
                    </div>
                    <div className="flex items-center gap-2">
                        <Button type="button" onClick={() => reset()} disabled={!isDirty}>Cancel</Button>
                        <Button type="button" onClick={handleSubmit(onSubmit)} disabled={!isDirty || isSubmitting}>Save</Button>
                        <Button type="button" variant="solid" onClick={handleSubmit(onSubmit)} disabled={isSubmitting}>Save & Activate</Button>
                    </div>
                </div>
            </Card>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                <div className="lg:col-span-2 space-y-4">
                    <Card className="p-2">
                        <Tabs defaultValue="schedule" variant="pill">
                            <Tabs.TabList>
                                <Tabs.TabNav value="schedule">Schedule</Tabs.TabNav>
                                <Tabs.TabNav value="capacity">Capacity</Tabs.TabNav>
                                <Tabs.TabNav value="status">Status & Notes</Tabs.TabNav>
                            </Tabs.TabList>

                            <Tabs.TabContent value="schedule" className="px-4 pt-3 pb-4">
                                <div className="mx-auto w-full max-w-5xl space-y-6">
                                    <ScheduleEditor control={control} watch={watch} onCheck={async () => { const r = await checkSlotConflicts({ startTime: form.startTime, endTime: form.endTime }); setConflicts(r.conflicts) }} />
                                </div>
                            </Tabs.TabContent>

                            <Tabs.TabContent value="capacity" className="px-4 pt-3 pb-4">
                                <div className="mx-auto w-full max-w-5xl space-y-6">
                                    <CapacityEditor control={control} watch={watch} />
                                </div>
                            </Tabs.TabContent>

                            <Tabs.TabContent value="status" className="px-4 pt-3 pb-4">
                                <div className="mx-auto w-full max-w-5xl space-y-6">
                                    <FormContainer>
                                        <FormItem label="isActive" extra={<span className="text-xs text-gray-500">Inactive slots are hidden from checkout.</span>}>
                                            <Controller name="isActive" control={control} render={({ field }) => <Switcher field={field} />} />
                                        </FormItem>
                                        <FormItem label="description"><Input asElement="textarea" rows={4} {...register('description')} /></FormItem>
                                    </FormContainer>
                                </div>
                            </Tabs.TabContent>
                        </Tabs>
                    </Card>
                </div>
                <div className="lg:col-span-1">
                    <SlotPreview form={form} conflicts={conflicts} />
                </div>
            </div>
        </div>
    )
}



