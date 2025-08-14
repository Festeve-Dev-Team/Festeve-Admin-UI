import { useEffect, useState } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { homepageSchema, defaultHomepageValues, type HomepageFormInput } from './schema/homepageSchema'
import { FormContainer, FormItem } from '@/components/ui/Form'
import Input from '@/components/ui/Input'
import Button from '@/components/ui/Button'
import Tabs from '@/components/ui/Tabs'
import Card from '@/components/ui/Card'
import Tag from '@/components/ui/Tag'

import SectionsEditor from './components/SectionsEditor'
import BannerBoard from './components/BannerBoard'
import FeaturedEditor from './components/FeaturedEditor'
import TrendingEditor from './components/TrendingEditor'
import ChipsInput from './components/ChipsInput'
import PhonePreview from './components/PhonePreview'
import { diffJSON } from './utils'

type Props = { initial?: HomepageFormInput; onSaved?: (v: HomepageFormInput) => void; headerTitle?: string }

export default function HomepageFormV2({ initial, onSaved, headerTitle }: Props) {
    const [dirty, setDirty] = useState(false)
    const { control, register, handleSubmit, formState: { errors, isDirty, isSubmitting }, reset, watch, setValue } = useForm<HomepageFormInput>({
        resolver: zodResolver(homepageSchema),
        defaultValues: initial ?? defaultHomepageValues,
        mode: 'onChange',
    })
    useEffect(() => { const s = watch(() => setDirty(true)); return () => s.unsubscribe() }, [watch])
    useEffect(() => { if (initial) reset(initial) }, [initial, reset])
    const form = watch()
    async function onSubmit(v: HomepageFormInput) { onSaved?.(v); setDirty(false) }

    const diff = diffJSON(initial ?? defaultHomepageValues, form)

    return (
        <div className="space-y-4">
            <Card className="sticky top-0 z-10 rounded-md shadow-sm" bodyClass="py-3 px-4 md:px-6 lg:px-8 bg-white/80 dark:bg-gray-800/80 backdrop-blur">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <h3 className="text-lg font-semibold">{headerTitle ?? 'Homepage Configure'}</h3>
                        {dirty && (<Tag className="bg-amber-100 text-amber-800 border border-amber-200 px-2 py-0.5 rounded" suffix suffixClass="bg-red-500">Unsaved</Tag>)}
                    </div>
                    <div className="flex items-center gap-2">
                        <Button type="button" onClick={() => reset()} disabled={!isDirty}>Cancel</Button>
                        <Button type="button" onClick={handleSubmit(onSubmit)} disabled={!isDirty || isSubmitting}>Save Draft</Button>
                        <Button type="button" onClick={handleSubmit(onSubmit)} disabled={isSubmitting}>Validate</Button>
                        <Button type="button" variant="solid" onClick={handleSubmit(onSubmit)} disabled={isSubmitting}>Publish</Button>
                    </div>
                </div>
            </Card>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                <div className="lg:col-span-2 space-y-4">
                    <Card className="p-2">
                        <Tabs defaultValue="overview" variant="pill">
                            <Tabs.TabList>
                                <Tabs.TabNav value="overview">Overview</Tabs.TabNav>
                                <Tabs.TabNav value="daily">Daily Event</Tabs.TabNav>
                                <Tabs.TabNav value="sections">Sections</Tabs.TabNav>
                                <Tabs.TabNav value="banners">Banners</Tabs.TabNav>
                                <Tabs.TabNav value="featured">Featured</Tabs.TabNav>
                                <Tabs.TabNav value="trending">Trending</Tabs.TabNav>
                                <Tabs.TabNav value="custom">Custom Sections</Tabs.TabNav>
                            </Tabs.TabList>

                            <Tabs.TabContent value="overview" className="px-4 pt-3 pb-4">
                                <div className="mx-auto w-full max-w-5xl space-y-6 text-sm text-gray-600">
                                    <div>Change summary: added {diff.added.length}, removed {diff.removed.length}, changed {diff.changed.length}</div>
                                </div>
                            </Tabs.TabContent>

                            <Tabs.TabContent value="daily" className="px-4 pt-3 pb-4">
                                <div className="mx-auto w-full max-w-5xl space-y-6">
                                    <FormContainer>
                                        <FormItem label="dailyEventId">
                                            <Input {...register('dailyEventId')} placeholder="Event ID" />
                                        </FormItem>
                                    </FormContainer>
                                </div>
                            </Tabs.TabContent>

                            <Tabs.TabContent value="sections" className="px-4 pt-3 pb-4">
                                <div className="mx-auto w-full max-w-5xl space-y-6">
                                    <SectionsEditor value={form.homepageSections} onChange={(v) => setValue('homepageSections', v, { shouldDirty: true })} />
                                </div>
                            </Tabs.TabContent>

                            <Tabs.TabContent value="banners" className="px-4 pt-3 pb-4">
                                <div className="mx-auto w-full max-w-5xl space-y-6">
                                    <BannerBoard value={form.banners} onChange={(v) => setValue('banners', v, { shouldDirty: true })} />
                                </div>
                            </Tabs.TabContent>

                            <Tabs.TabContent value="featured" className="px-4 pt-3 pb-4">
                                <div className="mx-auto w-full max-w-5xl space-y-6">
                                    <FeaturedEditor
                                        products={form.featuredProductIds}
                                        events={form.featuredEventIds}
                                        onChangeProducts={(v) => setValue('featuredProductIds', v, { shouldDirty: true })}
                                        onChangeEvents={(v) => setValue('featuredEventIds', v, { shouldDirty: true })}
                                    />
                                </div>
                            </Tabs.TabContent>

                            <Tabs.TabContent value="trending" className="px-4 pt-3 pb-4">
                                <div className="mx-auto w-full max-w-5xl space-y-6">
                                    <TrendingEditor value={form.manuallyCuratedTrending} onChange={(v) => setValue('manuallyCuratedTrending', v, { shouldDirty: true })} />
                                </div>
                            </Tabs.TabContent>

                            <Tabs.TabContent value="custom" className="px-4 pt-3 pb-4">
                                <div className="mx-auto w-full max-w-5xl space-y-6">
                                    <FormContainer>
                                        <FormItem label="customSections (JSON)">
                                            <Input asElement="textarea" rows={8} value={JSON.stringify(form.customSections || {}, null, 2)} onChange={(e) => {
                                                try { setValue('customSections', JSON.parse(e.target.value), { shouldDirty: true }) } catch { /* ignore */ }
                                            }} />
                                        </FormItem>
                                    </FormContainer>
                                </div>
                            </Tabs.TabContent>
                        </Tabs>
                    </Card>
                </div>
                <div className="lg:col-span-1">
                    <PhonePreview form={form} />
                </div>
            </div>
        </div>
    )
}



