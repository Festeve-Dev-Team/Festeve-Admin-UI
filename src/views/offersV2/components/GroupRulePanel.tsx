import { Controller } from 'react-hook-form'
import { FormContainer, FormItem } from '@/components/ui/Form'
import Input from '@/components/ui/Input'

type Props = { control: any }

export default function GroupRulePanel({ control }: Props) {
    return (
        <FormContainer>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormItem label="Min Group Size">
                    <Controller name="minGroupSize" control={control} render={({ field }) => (
                        <Input type="number" value={field.value ?? 1} onChange={(e) => field.onChange(Number(e.target.value))} />
                    )} />
                </FormItem>
                <FormItem label="Max Group Size">
                    <Controller name="maxGroupSize" control={control} render={({ field }) => (
                        <Input type="number" value={field.value ?? 1} onChange={(e) => field.onChange(Number(e.target.value))} />
                    )} />
                </FormItem>
            </div>
            <div className="text-xs text-gray-500 mt-1">If not group-based, keep both = 1</div>
        </FormContainer>
    )
}



