import { FormContainer, FormItem } from '@/components/ui/Form'
import Input from '@/components/ui/Input'
import ChipsInput from '@/views/eventsV2/components/ChipsInput'
import { Controller } from 'react-hook-form'

type Props = { control: any; watch: any; setValue: any }

export default function TargetSelector({ control, watch, setValue }: Props) {
    const appliesTo = watch('appliesTo') as 'product' | 'category' | 'event' | 'all'
    const targets = watch('targetIds') as string[]
    const helper = appliesTo === 'all' ? 'Applies to everything' : `Provide ${appliesTo} IDs`
    return (
        <FormContainer>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <FormItem label="Applies To">
                    <Controller name="appliesTo" control={control} render={({ field }) => (
                        <select className="input" {...field}>
                            <option value="product">product</option>
                            <option value="category">category</option>
                            <option value="event">event</option>
                            <option value="all">all</option>
                        </select>
                    )} />
                </FormItem>
                {appliesTo !== 'all' && (
                    <FormItem label="Target IDs" extra={<span className="text-xs text-gray-500">{helper}</span>}>
                        <ChipsInput value={targets} onChange={(v) => setValue('targetIds', v, { shouldDirty: true })} />
                    </FormItem>
                )}
            </div>
        </FormContainer>
    )
}



