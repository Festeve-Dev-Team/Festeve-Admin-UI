import { Controller } from 'react-hook-form'
import { FormContainer, FormItem } from '@/components/ui/Form'
import DateTimepicker from '@/components/ui/DatePicker/DateTimepicker'
import Input from '@/components/ui/Input'
import Button from '@/components/ui/Button'
import { parseTimeSlot } from '../utils/time'

type Props = { control: any; watch: any; onCheck: () => void }

const presets = Array.from({ length: ((22 - 5) * 2) + 1 }, (_, i) => {
    const mins = (5 * 60) + (i * 30)
    const h = Math.floor(mins / 60)
    const m = mins % 60
    const hour12 = h % 12 === 0 ? 12 : h % 12
    const ampm = h < 12 ? 'AM' : 'PM'
    return `${hour12}:${m.toString().padStart(2, '0')} ${ampm}`
})

export default function ScheduleEditor({ control, watch, onCheck }: Props) {
    const slot = watch('timeSlot') as string
    return (
        <FormContainer>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormItem label="Date">
                    <Controller name="date" control={control} render={({ field }) => (
                        <DateTimepicker value={field.value ? new Date(field.value) : null} onChange={(d) => field.onChange(d?.toISOString() ?? '')} />
                    )} />
                </FormItem>
                <FormItem label="Time Slot">
                    <Controller name="timeSlot" control={control} render={({ field }) => (
                        <Input list="ts-presets" value={field.value} onChange={(e) => field.onChange(e.target.value)} />
                    )} />
                    <datalist id="ts-presets">
                        {presets.map((p) => (<option key={p} value={p} />))}
                    </datalist>
                </FormItem>
            </div>
            <div className="mt-2">
                <Button size="sm" onClick={onCheck}>Check availability</Button>
            </div>
        </FormContainer>
    )
}



