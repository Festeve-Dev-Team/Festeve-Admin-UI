import { Controller } from 'react-hook-form'
import { FormContainer, FormItem } from '@/components/ui/Form'
import Input from '@/components/ui/Input'
import Switcher from '@/components/ui/Switcher'

type Props = { control: any; watch: any }

export default function GroupBookingPanel({ control, watch }: Props) {
    const on = !!watch('isGroupBooking')
    const amount = Number(watch('amount') || 0)
    const size = Number(watch('groupSize') || 0)
    const per = on && size > 0 ? (amount / size) : 0
    return (
        <FormContainer>
            <FormItem label="Group booking?">
                <Controller name="isGroupBooking" control={control} render={({ field }) => <Switcher field={field} />} />
            </FormItem>
            {on && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <FormItem label="groupSize">
                        <Controller name="groupSize" control={control} render={({ field }) => (
                            <Input type="number" value={field.value ?? 2} onChange={(e) => field.onChange(Number(e.target.value))} />
                        )} />
                    </FormItem>
                    <FormItem label="groupOfferId"><Input {...(control as any)._register('groupOfferId')} /></FormItem>
                    <FormItem label="Per-person estimate"><Input readOnly value={per > 0 ? per.toFixed(2) : ''} /></FormItem>
                </div>
            )}
        </FormContainer>
    )
}



