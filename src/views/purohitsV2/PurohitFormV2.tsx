import { useEffect, useMemo, useState } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { purohitSchema, defaultPurohitValues, type PurohitFormInput } from './schema/purohitSchema'
import { savePurohit } from './services/purohitApi'

import { FormContainer, FormItem } from '@/components/ui/Form'
import Input from '@/components/ui/Input'
import Button from '@/components/ui/Button'
import Switcher from '@/components/ui/Switcher'
import Tabs from '@/components/ui/Tabs'
import Card from '@/components/ui/Card'
import Tooltip from '@/components/ui/Tooltip'
import Tag from '@/components/ui/Tag'
import DateTimepicker from '@/components/ui/DatePicker/DateTimepicker'

import ChipsInput from './components/ChipsInput'
import AvailabilityEditor from './components/AvailabilityEditor'
import CommissionPanel from './components/CommissionPanel'
import ProfilePreview from './components/ProfilePreview'

type Props = {
    initial?: PurohitFormInput
    onSaved?: (p: PurohitFormInput) => void
    headerTitle?: string
}

export default function PurohitFormV2({ initial, onSaved, headerTitle }: Props) {
    const [isDirtySinceMount, setIsDirtySinceMount] = useState(false)
    const { control, register, handleSubmit, formState: { errors, isDirty, isSubmitting }, reset, watch, setValue } = useForm<PurohitFormInput>({
        resolver: zodResolver(purohitSchema),
        defaultValues: initial ?? defaultPurohitValues,
        mode: 'onChange',
    })

    useEffect(() => {
        const s = watch(() => setIsDirtySinceMount(true))
        return () => s.unsubscribe()
    }, [watch])

    useEffect(() => {
        if (initial) reset(initial)
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [initial])

    const form = watch()

    async function onSubmit(values: PurohitFormInput) {
        await savePurohit(values)
        onSaved?.(values)
        setIsDirtySinceMount(false)
    }

    return (
        <div className="space-y-4">
            <Card className="sticky top-0 z-10 rounded-md shadow-sm" bodyClass="py-3 px-4 md:px-6 lg:px-8 bg-white/80 dark:bg-gray-800/80 backdrop-blur">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <h3 className="text-lg font-semibold">{headerTitle ?? 'New Purohit'}</h3>
                        {isDirtySinceMount && (
                            <Tag className="bg-amber-100 text-amber-800 border border-amber-200 px-2 py-0.5 rounded" suffix suffixClass="bg-red-500" aria-label="Unsaved changes">Unsaved</Tag>
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
                    <Card className="p-2 md:p-2">
                        <Tabs defaultValue="basics" variant="pill">
                            <Tabs.TabList>
                                <Tabs.TabNav value="basics">Basics</Tabs.TabNav>
                                <Tabs.TabNav value="skills">Skills & Rituals</Tabs.TabNav>
                                <Tabs.TabNav value="availability">Availability</Tabs.TabNav>
                                <Tabs.TabNav value="langLoc">Language & Location</Tabs.TabNav>
                                <Tabs.TabNav value="commission">Commission & Status</Tabs.TabNav>
                            </Tabs.TabList>

                            <Tabs.TabContent value="basics" className="px-4 pt-3 pb-4">
                                <div className="mx-auto w-full max-w-5xl space-y-6">
                                <FormContainer>
                                    <FormItem label="Name" invalid={!!errors.name} errorMessage={errors.name?.message}>
                                        <Input autoFocus {...register('name')} placeholder="Full name" />
                                    </FormItem>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <FormItem label="Phone" invalid={!!errors.phone} errorMessage={errors.phone?.message}>
                                            <Input {...register('phone')} placeholder="+91XXXXXXXXXX" />
                                        </FormItem>
                                        <FormItem label="Experience (years)" invalid={!!errors.experienceYears} errorMessage={errors.experienceYears?.message}>
                                            <div className="flex items-center gap-2">
                                                <Input type="number" {...register('experienceYears', { valueAsNumber: true })} />
                                                <span className="text-sm text-gray-500">years</span>
                                            </div>
                                        </FormItem>
                                    </div>
                                    <FormItem label="Bio" extra={<span className="text-xs text-gray-500">Max 500 chars</span>} invalid={!!errors.bio} errorMessage={errors.bio?.message}>
                                        <Input asElement="textarea" rows={5} {...register('bio')} />
                                    </FormItem>
                                </FormContainer>
                                </div>
                            </Tabs.TabContent>

                            <Tabs.TabContent value="skills" className="px-4 pt-3 pb-4">
                                <div className="mx-auto w-full max-w-5xl space-y-6">
                                <FormContainer>
                                    <FormItem label="Skills">
                                        <ChipsInput value={form.skills} onChange={(v) => setValue('skills', v, { shouldDirty: true })} />
                                    </FormItem>
                                    <FormItem label="Rituals">
                                        <ChipsInput value={form.rituals} onChange={(v) => setValue('rituals', v, { shouldDirty: true })} />
                                    </FormItem>
                                    <FormItem label="Custom Skills (key=value)">
                                        <Input placeholder="e.g. specialization=Vastu" onKeyDown={(e) => {
                                            if (e.key === 'Enter') {
                                                e.preventDefault()
                                                const input = (e.target as HTMLInputElement).value
                                                if (!input.includes('=')) return
                                                const [k, v] = input.split('=')
                                                setValue('customSkills', { ...(form.customSkills || {}), [k.trim()]: v.trim() }, { shouldDirty: true })
                                                ;(e.target as HTMLInputElement).value = ''
                                            }
                                        }} />
                                        <div className="mt-2 text-xs text-gray-500">Press Enter to add. Supports string or numeric values.</div>
                                    </FormItem>
                                </FormContainer>
                                </div>
                            </Tabs.TabContent>

                            <Tabs.TabContent value="availability" className="px-4 pt-3 pb-4">
                                <div className="mx-auto w-full max-w-5xl space-y-6">
                                    <AvailabilityEditor value={form.availability} onChange={(v) => setValue('availability', v, { shouldDirty: true })} />
                                </div>
                            </Tabs.TabContent>

                            <Tabs.TabContent value="langLoc" className="px-4 pt-3 pb-4">
                                <div className="mx-auto w-full max-w-5xl space-y-6">
                                    <FormContainer>
                                        <FormItem label="Languages" invalid={!!errors.languages} errorMessage={errors.languages?.message}>
                                            <ChipsInput value={form.languages} onChange={(v) => setValue('languages', v, { shouldDirty: true })} />
                                        </FormItem>
                                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                                            <FormItem label="City">
                                                <Input {...register('location.city')} placeholder="City" />
                                            </FormItem>
                                            <FormItem label="State">
                                                <Input {...register('location.state')} placeholder="State" />
                                            </FormItem>
                                            <FormItem label="PIN Code" invalid={!!(errors.location as any)?.pincode} errorMessage={(errors.location as any)?.pincode?.message}>
                                                <Input {...register('location.pincode')} placeholder="6-digit" />
                                            </FormItem>
                                        </div>
                                    </FormContainer>
                                </div>
                            </Tabs.TabContent>

                            <Tabs.TabContent value="commission" className="px-4 pt-3 pb-4">
                                <div className="mx-auto w-full max-w-5xl space-y-6">
                                    <CommissionPanel control={control} watch={watch} />
                                </div>
                            </Tabs.TabContent>

                            {/* Preview tab removed; right-rail preview already available */}
                        </Tabs>
                    </Card>
                </div>
                <div className="lg:col-span-1">
                    <ProfilePreview form={form} />
                </div>
            </div>
        </div>
    )
}


