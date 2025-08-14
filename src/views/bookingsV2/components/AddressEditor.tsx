import { Controller } from 'react-hook-form'
import { FormContainer, FormItem } from '@/components/ui/Form'
import Input from '@/components/ui/Input'
import Switcher from '@/components/ui/Switcher'

type Props = { control: any; register: any; errors: any }

export default function AddressEditor({ control, register, errors }: Props) {
    return (
        <FormContainer>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormItem label="Label" invalid={!!errors?.address?.label} errorMessage={errors?.address?.label?.message}><Input {...register('address.label')} /></FormItem>
                <FormItem label="Line 1" invalid={!!errors?.address?.line1} errorMessage={errors?.address?.line1?.message}><Input {...register('address.line1')} /></FormItem>
                <FormItem label="Line 2"><Input {...register('address.line2')} /></FormItem>
                <FormItem label="City" invalid={!!errors?.address?.city} errorMessage={errors?.address?.city?.message}><Input {...register('address.city')} /></FormItem>
                <FormItem label="State" invalid={!!errors?.address?.state} errorMessage={errors?.address?.state?.message}><Input {...register('address.state')} /></FormItem>
                <FormItem label="PIN / Postal" invalid={!!errors?.address?.pincode} errorMessage={errors?.address?.pincode?.message}><Input {...register('address.pincode')} /></FormItem>
                <FormItem label="Country" invalid={!!errors?.address?.country} errorMessage={errors?.address?.country?.message}><Input {...register('address.country')} defaultValue="India" /></FormItem>
                <FormItem label="Default?">
                    <Controller name="address.isDefault" control={control} render={({ field }) => <Switcher field={field} />} />
                </FormItem>
            </div>
        </FormContainer>
    )
}



