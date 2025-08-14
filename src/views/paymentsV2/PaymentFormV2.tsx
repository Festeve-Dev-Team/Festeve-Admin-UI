import { useEffect, useState } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { paymentSchema, defaultPaymentValues, type PaymentFormInput } from './schema/paymentSchema'
import { FormContainer, FormItem } from '@/components/ui/Form'
import Input from '@/components/ui/Input'
import Button from '@/components/ui/Button'
import Tabs from '@/components/ui/Tabs'
import Card from '@/components/ui/Card'
import Tag from '@/components/ui/Tag'
import AmountField from './components/AmountField'
import GatewayPanel from './components/GatewayPanel'
import PaymentPreview from './components/PaymentPreview'
import { savePayment } from './services/paymentApi'
import { verifyPayment } from './services/paymentApi'

type Props = { initial?: PaymentFormInput; onSaved?: (p: PaymentFormInput) => void; headerTitle?: string }

export default function PaymentFormV2({ initial, onSaved, headerTitle }: Props) {
    const [dirty, setDirty] = useState(false)
    const [verifyResult, setVerifyResult] = useState<{ status: 'matched' | 'mismatch' | 'not_found'; details?: string } | undefined>()
    const { control, register, handleSubmit, formState: { errors, isDirty, isSubmitting }, reset, watch, setValue } = useForm<PaymentFormInput>({
        resolver: zodResolver(paymentSchema),
        defaultValues: initial ?? defaultPaymentValues,
        mode: 'onChange',
    })
    useEffect(() => { const s = watch(() => setDirty(true)); return () => s.unsubscribe() }, [watch])
    useEffect(() => { if (initial) reset(initial) }, [initial, reset])
    const form = watch()
    async function onSubmit(v: PaymentFormInput) { await savePayment(v); onSaved?.(v); setDirty(false) }

    return (
        <div className="space-y-4">
            <Card className="sticky top-0 z-10 rounded-md shadow-sm" bodyClass="py-3 px-4 md:px-6 lg:px-8 bg-white/80 dark:bg-gray-800/80 backdrop-blur">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <h3 className="text-lg font-semibold">{headerTitle ?? (form.transactionId ? `Txn ${form.transactionId}` : 'New Payment')}</h3>
                        {dirty && (<Tag className="bg-amber-100 text-amber-800 border border-amber-200 px-2 py-0.5 rounded" suffix suffixClass="bg-red-500">Unsaved</Tag>)}
                    </div>
                    <div className="flex items-center gap-2">
                        <Button type="button" onClick={() => reset()} disabled={!isDirty}>Cancel</Button>
                        <Button type="button" onClick={handleSubmit(onSubmit)} disabled={!isDirty || isSubmitting}>Save</Button>
                        <Button type="button" variant="solid" onClick={async () => { const r = await verifyPayment({ provider: form.provider, transactionId: form.transactionId, paymentIntentId: form.paymentIntentId }); setVerifyResult(r) }} disabled={isSubmitting}>Save & Verify</Button>
                    </div>
                </div>
            </Card>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                <div className="lg:col-span-2 space-y-4">
                    <Card className="p-2">
                        <Tabs defaultValue="basics" variant="pill">
                            <Tabs.TabList>
                                <Tabs.TabNav value="basics">Basics</Tabs.TabNav>
                                <Tabs.TabNav value="gateway">Gateway Details</Tabs.TabNav>
                                <Tabs.TabNav value="notes">Notes & Meta</Tabs.TabNav>
                            </Tabs.TabList>

                            <Tabs.TabContent value="basics" className="px-4 pt-3 pb-4">
                                <div className="mx-auto w-full max-w-5xl space-y-6">
                                    <FormContainer>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <FormItem label="relatedTo">
                                                <Controller name="relatedTo" control={control} render={({ field }) => (
                                                    <select className="input" {...field}>
                                                        <option value="order">order</option>
                                                        <option value="booking">booking</option>
                                                        <option value="subscription">subscription</option>
                                                        <option value="refund">refund</option>
                                                        <option value="other">other</option>
                                                    </select>
                                                )} />
                                            </FormItem>
                                            <FormItem label="referenceId" extra={<span className="text-xs text-gray-500">ID of the related entity</span>}><Input {...register('referenceId')} /></FormItem>
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <AmountField control={control} errors={errors} />
                                            <FormItem label="currency"><Input {...register('currency')} defaultValue="INR" /></FormItem>
                                        </div>
                                    </FormContainer>
                                </div>
                            </Tabs.TabContent>

                            <Tabs.TabContent value="gateway" className="px-4 pt-3 pb-4">
                                <div className="mx-auto w-full max-w-5xl space-y-6">
                                    <GatewayPanel control={control} watch={watch} onVerify={async () => { const r = await verifyPayment({ provider: form.provider, transactionId: form.transactionId, paymentIntentId: form.paymentIntentId }); setVerifyResult(r) }} />
                                </div>
                            </Tabs.TabContent>

                            <Tabs.TabContent value="notes" className="px-4 pt-3 pb-4">
                                <div className="mx-auto w-full max-w-5xl space-y-6">
                                    <FormContainer>
                                        <FormItem label="note"><Input asElement="textarea" rows={6} {...register('note')} /></FormItem>
                                    </FormContainer>
                                </div>
                            </Tabs.TabContent>
                        </Tabs>
                    </Card>
                </div>
                <div className="lg:col-span-1">
                    <PaymentPreview form={form} verifyResult={verifyResult} />
                </div>
            </div>
        </div>
    )
}



