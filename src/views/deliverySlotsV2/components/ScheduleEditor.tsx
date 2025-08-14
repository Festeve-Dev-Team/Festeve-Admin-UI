import { Controller } from 'react-hook-form'
import { FormContainer, FormItem } from '@/components/ui/Form'
import DateTimepicker from '@/components/ui/DatePicker/DateTimepicker'
import Button from '@/components/ui/Button'
import { formatISTRange, slotDurationMinutes } from '../utils'

type Props = { control: any; watch: any; onCheck: () => void }

export default function ScheduleEditor({ control, watch, onCheck }: Props) {
    const start = watch('startTime') as string
    const end = watch('endTime') as string
    const range = start && end ? formatISTRange(start, end) : ''
    const dur = start && end ? slotDurationMinutes(start, end) : 0
    return (
        <FormContainer>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormItem label="startTime">
                    <Controller name="startTime" control={control} render={({ field }) => (
                        <DateTimepicker value={field.value ? new Date(field.value) : null} onChange={(d) => field.onChange(d?.toISOString() ?? '')} />
                    )} />
                </FormItem>
                <FormItem label="endTime">
                    <Controller name="endTime" control={control} render={({ field }) => (
                        <DateTimepicker value={field.value ? new Date(field.value) : null} onChange={(d) => field.onChange(d?.toISOString() ?? '')} />
                    )} />
                </FormItem>
            </div>
            {range && (
                <div className="text-sm text-gray-600 mt-2">{range} • {dur} minutes</div>
            )}
            <div className="mt-2">
                <Button size="sm" onClick={onCheck}>Check overlap with existing slots</Button>
            </div>
        </FormContainer>
    )
}



