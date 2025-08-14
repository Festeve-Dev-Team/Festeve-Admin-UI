import { useState } from 'react'
import Button from '@/components/ui/Button'
import { FormContainer, FormItem } from '@/components/ui/Form'
import DatePicker from '@/components/ui/DatePicker'
import Tag from '@/components/ui/Tag'
import { istNow, parseTimeSlot } from '../utils/time'

type Props = {
    value: { date: string; timeSlots: string[] }[]
    onChange: (v: { date: string; timeSlots: string[] }[]) => void
}

const presets: Record<string, string[]> = {
    Morning: ['9:00 AM', '9:30 AM', '10:00 AM', '10:30 AM'],
    Afternoon: ['2:00 PM', '2:30 PM', '3:00 PM', '3:30 PM'],
    Evening: ['6:00 PM', '6:30 PM', '7:00 PM', '7:30 PM'],
}

export default function AvailabilityEditor({ value, onChange }: Props) {
    const [selectedDate, setSelectedDate] = useState<Date | null>(null)

    const selected = selectedDate
        ? value.find((d) => new Date(d.date).toDateString() === selectedDate.toDateString())
        : undefined

    function ensureDay(d: Date) {
        const existing = value.find((x) => new Date(x.date).toDateString() === d.toDateString())
        if (existing) return existing
        const next = [...value, { date: d.toISOString(), timeSlots: [] }]
        onChange(next)
        return next[next.length - 1]
    }

    function addSlot(label: string) {
        let workingDate = selectedDate
        if (!workingDate) {
            // default to today (IST) when user clicks preset without choosing a date
            workingDate = istNow()
            setSelectedDate(workingDate)
        }
        const day = ensureDay(workingDate)
        if (day.timeSlots.includes(label)) return
        const next = value.map((d) =>
            new Date(d.date).toDateString() === workingDate!.toDateString()
                ? { ...d, timeSlots: [...d.timeSlots, label].sort((a, b) => parseTimeSlot(a) - parseTimeSlot(b)) }
                : d,
        )
        onChange(next)
    }

    function removeSlot(label: string) {
        if (!selectedDate) return
        const next = value.map((d) =>
            new Date(d.date).toDateString() === selectedDate.toDateString()
                ? { ...d, timeSlots: d.timeSlots.filter((s) => s !== label) }
                : d,
        )
        onChange(next)
    }

    function clearDay() {
        if (!selectedDate) return
        const next = value.map((d) =>
            new Date(d.date).toDateString() === selectedDate.toDateString()
                ? { ...d, timeSlots: [] }
                : d,
        )
        onChange(next)
    }

    return (
        <div className="space-y-3">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <FormContainer>
                    <FormItem label="Pick a day (IST)">
                        <DatePicker
                            value={selectedDate}
                            minDate={istNow()}
                            onChange={(date) => setSelectedDate(date)}
                        />
                    </FormItem>
                </FormContainer>
                <div className="flex items-center gap-2">
                    {Object.keys(presets).map((k) => (
                        <Button key={k} size="sm" onClick={() => presets[k].forEach(addSlot)}>
                            {k}
                        </Button>
                    ))}
                    <Button size="sm" variant="twoTone" onClick={clearDay}>
                        Clear Day
                    </Button>
                </div>
            </div>
            <div className="mt-3">
                {!selectedDate && (
                    <div className="text-sm text-gray-500">Select a day to add slots.</div>
                )}
                {selectedDate && (
                    <div>
                        <div className="text-sm font-medium mb-2">Slots</div>
                        <div className="flex flex-wrap gap-2">
                            {selected?.timeSlots?.length ? (
                                selected.timeSlots.map((s) => (
                                    <Tag key={s} className="bg-gray-100 border px-2 py-0.5 rounded">
                                        <span>{s}</span>
                                        <button className="ml-2 text-xs text-gray-500" onClick={() => removeSlot(s)} aria-label={`Remove ${s}`}>
                                            ×
                                        </button>
                                    </Tag>
                                ))
                            ) : (
                                <span className="text-sm text-gray-500">No slots.</span>
                            )}
                        </div>
                        <div className="mt-2 text-xs text-gray-500">Allowed window: 5:00 AM – 10:00 PM IST</div>
                    </div>
                )}
            </div>
        </div>
    )
}


