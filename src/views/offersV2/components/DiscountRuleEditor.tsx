import { Controller } from 'react-hook-form'
import { FormContainer, FormItem } from '@/components/ui/Form'
import Input from '@/components/ui/Input'
import Tag from '@/components/ui/Tag'

type Props = { control: any; watch: any }

export default function DiscountRuleEditor({ control, watch }: Props) {
    const type = watch('type') as string
    const dType = watch('discountType') as 'percentage' | 'fixed'

    return (
        <FormContainer>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <FormItem label="Type">
                    <Controller name="type" control={control} render={({ field }) => (
                        <select className="input" {...field}>
                            <option value="percentage_discount">percentage_discount</option>
                            <option value="fixed_discount">fixed_discount</option>
                            <option value="bogo">bogo</option>
                            <option value="combo_bundle">combo_bundle</option>
                        </select>
                    )} />
                </FormItem>
                <FormItem label="Discount Type">
                    <Controller name="discountType" control={control} render={({ field }) => (
                        <select className="input" {...field}>
                            <option value="percentage">percentage</option>
                            <option value="fixed">fixed</option>
                        </select>
                    )} />
                </FormItem>
                <FormItem label="Discount Value">
                    <Controller name="discountValue" control={control} render={({ field }) => (
                        <Input type="number" step="0.01" value={field.value ?? 0} onChange={(e) => field.onChange(Number(e.target.value))} />
                    )} />
                </FormItem>
            </div>
            {(type === 'bogo' || type === 'combo_bundle') && (
                <div className="mt-3 text-xs text-gray-600 flex items-center gap-2">
                    <Tag className="bg-amber-100 text-amber-800 border px-2 py-0.5 rounded">Note</Tag>
                    Primary benefit comes from comboItems; discountValue is optional.
                </div>
            )}
        </FormContainer>
    )
}



