import { Controller } from 'react-hook-form'
import { FormItem } from '@/components/ui/Form'
import Input from '@/components/ui/Input'
import { formatINR } from '../utils'

type Props = { control: any; errors: any }

export default function AmountField({ control, errors }: Props) {
    return (
        <FormItem label="amount" invalid={!!errors.amount} errorMessage={errors.amount?.message}>
            <Controller
                name="amount"
                control={control}
                render={({ field }) => (
                    <Input type="number" step="1" value={field.value ?? 0} onChange={(e) => field.onChange(Number(e.target.value))} />
                )}
            />
            <div className="text-xs text-gray-500 mt-1">{formatINR(Number(errors?.amount ? 0 : (control?._formValues?.amount || 0)))}</div>
        </FormItem>
    )
}



