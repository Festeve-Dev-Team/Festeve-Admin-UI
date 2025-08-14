import { Controller } from 'react-hook-form'
import { FormContainer, FormItem } from '@/components/ui/Form'
import Input from '@/components/ui/Input'
import Switcher from '@/components/ui/Switcher'
import { dowMap, buildRecurrenceSummary, nextOccurrences } from '../utils/time'

type Props = {
    control: any
    watch: any
}

export default function RecurrenceEditor({ control, watch }: Props) {
    const form = watch()
    const isRecurring = !!form.recurring?.isRecurring
    const freq = form.recurring?.frequency
    const dows: number[] = form.recurring?.daysOfWeek || []
    const summary = buildRecurrenceSummary({
        isRecurring,
        frequency: freq,
        daysOfWeek: dows,
        date: form.date,
    })
    const next = nextOccurrences({ start: new Date(form.date), isRecurring, frequency: freq, daysOfWeek: dows }, 5)

    return (
        <FormContainer>
            <FormItem label="Recurring?">
                <Controller
                    name="recurring.isRecurring"
                    control={control}
                    render={({ field }) => <Switcher field={field} />}
                />
            </FormItem>
            {isRecurring && (
                <>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <FormItem label="Frequency">
                            <Controller
                                name="recurring.frequency"
                                control={control}
                                render={({ field }) => (
                                    <select className="input" {...field}>
                                        <option value="daily">Daily</option>
                                        <option value="weekly">Weekly</option>
                                        <option value="monthly">Monthly</option>
                                        <option value="yearly">Yearly</option>
                                    </select>
                                )}
                            />
                        </FormItem>
                        {freq === 'weekly' && (
                            <FormItem label="Days of Week (0=Sun)">
                                <div className="flex flex-wrap gap-2">
                                    {dowMap.map((d) => (
                                        <label key={d.value} className={`tag px-2 py-0.5 border rounded cursor-pointer ${dows.includes(d.value) ? 'bg-indigo-100 border-indigo-300' : ''}`}>
                                            <input
                                                type="checkbox"
                                                className="hidden"
                                                checked={dows.includes(d.value)}
                                                onChange={(e) => {
                                                    const next = e.target.checked
                                                        ? Array.from(new Set([...(form.recurring?.daysOfWeek || []), d.value]))
                                                        : (form.recurring?.daysOfWeek || []).filter((x: number) => x !== d.value)
                                                    fieldlessUpdate(control, 'recurring.daysOfWeek', next)
                                                }}
                                            />
                                            {d.label}
                                        </label>
                                    ))}
                                </div>
                            </FormItem>
                        )}
                        <FormItem label="Summary">
                            <Input readOnly value={summary} />
                        </FormItem>
                    </div>
                    <div className="text-sm text-gray-600 mt-2">
                        Next: {next.map((d) => d.toDateString()).join(' • ')}
                    </div>
                </>
            )}
        </FormContainer>
    )
}

function fieldlessUpdate(control: any, name: string, value: unknown) {
    const anyControl = control as any
    if (anyControl?._formValues) {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        anyControl._formValues[name] = value
    }
}



