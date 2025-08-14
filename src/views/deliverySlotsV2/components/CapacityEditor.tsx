import { Controller } from 'react-hook-form'
import { FormContainer, FormItem } from '@/components/ui/Form'
import Input from '@/components/ui/Input'
import Progress from '@/components/ui/Progress'
import { remainingCapacity } from '../utils'

type Props = { control: any; watch: any }

export default function CapacityEditor({ control, watch }: Props) {
    const max = Number(watch('maxOrders') || 1)
    const cur = Number(watch('currentOrders') || 0)
    const rem = remainingCapacity({ maxOrders: max, currentOrders: cur })
    const pct = Math.min(100, Math.round(((max - rem) / max) * 100))
    return (
        <FormContainer>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormItem label="maxOrders">
                    <Controller name="maxOrders" control={control} render={({ field }) => (
                        <Input type="number" value={field.value ?? 1} onChange={(e) => field.onChange(Number(e.target.value))} />
                    )} />
                </FormItem>
                <FormItem label="currentOrders">
                    <Controller name="currentOrders" control={control} render={({ field }) => (
                        <Input type="number" value={field.value ?? 0} onChange={(e) => field.onChange(Number(e.target.value))} />
                    )} />
                </FormItem>
            </div>
            <div className="mt-2 text-sm">Remaining: {rem}</div>
            <div className="mt-2"><Progress percent={pct} /></div>
        </FormContainer>
    )
}



