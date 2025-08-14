import { Controller, useWatch } from 'react-hook-form'
import { FormContainer, FormItem } from '@/components/ui/Form'
import Input from '@/components/ui/Input'
import Switcher from '@/components/ui/Switcher'
import Tooltip from '@/components/ui/Tooltip'
import { commissionCalc } from '../utils/commission'

type Props = {
    control: any
    watch: any
}

export default function CommissionPanel({ control, watch }: Props) {
    // Subscribe to form state so UI updates immediately on toggle/value changes
    const [charges, type, rawValue] = useWatch({
        control,
        name: ['chargesCommission', 'commissionType', 'commissionValue'],
    }) as [boolean, 'percentage' | 'fixed', number]
    const value = Number(rawValue || 0)
    const exampleBase = 1000
    const commission = commissionCalc({ type, value, base: exampleBase })

    return (
        <FormContainer>
            <FormItem label="Charges Commission?">
                <Controller
                    name="chargesCommission"
                    control={control}
                    render={({ field }) => <Switcher field={field} />}
                />
            </FormItem>
            {charges && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <FormItem label="Type">
                        <Controller
                            name="commissionType"
                            control={control}
                            render={({ field }) => (
                                <select className="input" {...field}>
                                    <option value="percentage">Percentage</option>
                                    <option value="fixed">Fixed</option>
                                </select>
                            )}
                        />
                    </FormItem>
                    <FormItem label="Value">
                        <Controller
                            name="commissionValue"
                            control={control}
                            render={({ field }) => (
                                <Input type="number" step="0.01" value={field.value ?? 0} onChange={(e) => field.onChange(Number(e.target.value))} />
                            )}
                        />
                    </FormItem>
                    <FormItem label="Helper" extra={<Tooltip title="If base charge is ₹1000, this is the commission."><span className="text-gray-400">?</span></Tooltip>}>
                        <div className="text-sm text-gray-700">If charge ₹{exampleBase}, commission = ₹{commission.toFixed(2)}</div>
                    </FormItem>
                </div>
            )}
            <FormItem label="Active?">
                <Controller
                    name="isActive"
                    control={control}
                    render={({ field }) => <Switcher field={field} />}
                />
            </FormItem>
        </FormContainer>
    )
}


