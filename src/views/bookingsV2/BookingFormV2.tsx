import { useEffect, useState } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { bookingSchema, defaultBookingValues, type BookingFormInput } from './schema/bookingSchema'
import { FormContainer, FormItem } from '@/components/ui/Form'
import Input from '@/components/ui/Input'
import Button from '@/components/ui/Button'
import Tabs from '@/components/ui/Tabs'
import Card from '@/components/ui/Card'
import Tag from '@/components/ui/Tag'
import BookingPreview from './components/BookingPreview'
import ScheduleEditor from './components/ScheduleEditor'
import AddressEditor from './components/AddressEditor'
import GroupBookingPanel from './components/GroupBookingPanel'
import { checkAvailability, saveBooking } from './services/bookingApi'

type Props = { initial?: BookingFormInput; onSaved?: (b: BookingFormInput) => void; headerTitle?: string }

export default function BookingFormV2({ initial, onSaved, headerTitle }: Props) {
    const [dirty, setDirty] = useState(false)
    const [availability, setAvailability] = useState<{ status: 'available' | 'conflict'; count: number } | undefined>()
    const { control, register, handleSubmit, formState: { errors, isDirty, isSubmitting }, reset, watch, setValue } = useForm<BookingFormInput>({
        resolver: zodResolver(bookingSchema),
        defaultValues: initial ?? defaultBookingValues,
        mode: 'onChange',
    })
    useEffect(() => { const s = watch(() => setDirty(true)); return () => s.unsubscribe() }, [watch])
    useEffect(() => { if (initial) reset(initial) }, [initial, reset])
    const form = watch()
    async function onSubmit(v: BookingFormInput) { await saveBooking(v); onSaved?.(v); setDirty(false) }

    return (
        <div className="space-y-4">
            <Card className="sticky top-0 z-10 rounded-md shadow-sm" bodyClass="py-3 px-4 md:px-6 lg:px-8 bg-white/80 dark:bg-gray-800/80 backdrop-blur">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <h3 className="text-lg font-semibold">{headerTitle ?? 'New Booking'}</h3>
                        {dirty && (<Tag className="bg-amber-100 text-amber-800 border border-amber-200 px-2 py-0.5 rounded" suffix suffixClass="bg-red-500">Unsaved</Tag>)}
                    </div>
                    <div className="flex items-center gap-2">
                        <Button type="button" onClick={() => reset()} disabled={!isDirty}>Cancel</Button>
                        <Button type="button" onClick={handleSubmit(onSubmit)} disabled={!isDirty || isSubmitting}>Save</Button>
                        <Button type="button" variant="solid" onClick={handleSubmit(onSubmit)} disabled={isSubmitting}>Save & Confirm</Button>
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
                                <Tabs.TabNav value="payment">Payment</Tabs.TabNav>
                                <Tabs.TabNav value="address">Address</Tabs.TabNav>
                                <Tabs.TabNav value="group">Group Booking</Tabs.TabNav>
                                <Tabs.TabNav value="notes">Notes & Meta</Tabs.TabNav>
                            </Tabs.TabList>

                            <Tabs.TabContent value="basics" className="px-4 pt-3 pb-4">
                                <div className="mx-auto w-full max-w-5xl space-y-6">
                                    <FormContainer>
                                        <FormItem label="purohitId" invalid={!!errors.purohitId} errorMessage={errors.purohitId?.message}><Input {...register('purohitId')} placeholder="Purohit ID" /></FormItem>
                                        <FormItem label="eventId" invalid={!!errors.eventId} errorMessage={errors.eventId?.message}><Input {...register('eventId')} placeholder="Event ID" /></FormItem>
                                    </FormContainer>
                                </div>
                            </Tabs.TabContent>

                            <Tabs.TabContent value="schedule" className="px-4 pt-3 pb-4">
                                <div className="mx-auto w-full max-w-5xl space-y-6">
                                    <ScheduleEditor control={control} watch={watch} onCheck={async () => {
                                        const result = await checkAvailability({ purohitId: form.purohitId, date: form.date, timeSlot: form.timeSlot })
                                        setAvailability(result)
                                    }} />
                                </div>
                            </Tabs.TabContent>

                            <Tabs.TabContent value="payment" className="px-4 pt-3 pb-4">
                                <div className="mx-auto w-full max-w-5xl space-y-6">
                                    <FormContainer>
                                        <FormItem label="amount" invalid={!!errors.amount} errorMessage={errors.amount?.message}><Input type="number" step="1" {...register('amount', { valueAsNumber: true })} /></FormItem>
                                    </FormContainer>
                                </div>
                            </Tabs.TabContent>

                            <Tabs.TabContent value="address" className="px-4 pt-3 pb-4">
                                <div className="mx-auto w-full max-w-5xl space-y-6">
                                    <AddressEditor control={control} register={register} errors={errors} />
                                </div>
                            </Tabs.TabContent>

                            <Tabs.TabContent value="group" className="px-4 pt-3 pb-4">
                                <div className="mx-auto w-full max-w-5xl space-y-6">
                                    <GroupBookingPanel control={control} watch={watch} />
                                </div>
                            </Tabs.TabContent>

                            <Tabs.TabContent value="notes" className="px-4 pt-3 pb-4">
                                <div className="mx-auto w-full max-w-5xl space-y-6">
                                    <FormContainer>
                                        <FormItem label="extraNotes (JSON)"><Input asElement="textarea" rows={6} value={JSON.stringify(form.extraNotes || {}, null, 2)} onChange={(e) => { try { setValue('extraNotes', JSON.parse(e.target.value), { shouldDirty: true }) } catch {} }} /></FormItem>
                                    </FormContainer>
                                </div>
                            </Tabs.TabContent>
                        </Tabs>
                    </Card>
                </div>
                <div className="lg:col-span-1">
                    <BookingPreview form={form} availability={availability} />
                </div>
            </div>
        </div>
    )
}



