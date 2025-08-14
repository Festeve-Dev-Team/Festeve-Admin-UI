import { Controller } from 'react-hook-form'
import { FormContainer, FormItem } from '@/components/ui/Form'
import DateTimepicker from '@/components/ui/DatePicker/DateTimepicker'
import { buildScheduleSummary } from '../utils'

type Props = { control: any; watch: any }

export default function ScheduleEditor({ control, watch }: Props) {
    const start = watch('startDate') as string
    const end = watch('endDate') as string
    const summary = buildScheduleSummary({ startDate: start, endDate: end })
    return (
        <FormContainer>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormItem label="Start">
                    <Controller name="startDate" control={control} render={({ field }) => (
                        <DateTimepicker value={field.value ? new Date(field.value) : null} onChange={(d) => field.onChange(d?.toISOString() ?? '')} />
                    )} />
                </FormItem>
                <FormItem label="End">
                    <Controller name="endDate" control={control} render={({ field }) => (
                        <DateTimepicker value={field.value ? new Date(field.value) : null} onChange={(d) => field.onChange(d?.toISOString() ?? '')} />
                    )} />
                </FormItem>
            </div>
            <div className="text-sm text-gray-600 mt-2">{summary}</div>
        </FormContainer>
    )
}



