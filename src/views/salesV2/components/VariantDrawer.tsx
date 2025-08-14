import { useEffect } from 'react'
import Drawer from '@/components/ui/Drawer'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import Switcher from '@/components/ui/Switcher'
import { FormContainer, FormItem } from '@/components/ui/Form'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { variantSchema, type VariantFormInput } from '../schema/productSchema'

type Props = {
    open: boolean
    initial?: VariantFormInput | null
    onClose: () => void
    onSubmit: (v: VariantFormInput) => void
}

export default function VariantDrawer({ open, initial, onClose, onSubmit }: Props) {
    const {
        register,
        handleSubmit,
        formState: { errors },
        reset,
        watch,
    } = useForm<VariantFormInput>({
        resolver: zodResolver(variantSchema),
        defaultValues: initial ?? {
            sku: '',
            specs: {},
            price: 0,
            stock: 0,
            discountType: 'none',
            discountValue: 0,
            images: [],
            isActive: true,
        },
    })

    useEffect(() => {
        reset(
            initial ?? {
                sku: '',
                specs: {},
                price: 0,
                stock: 0,
                discountType: 'none',
                discountValue: 0,
                images: [],
                isActive: true,
            },
        )
    }, [initial, reset])

    const discountType = watch('discountType')

    return (
        <Drawer isOpen={open} onClose={onClose} className="max-w-lg">
            <h4 className="text-base font-semibold">Variant</h4>
            <form
                className="mt-4 space-y-3"
                onSubmit={handleSubmit((v) => onSubmit(v))}
            >
                <FormContainer>
                    <FormItem label="SKU" invalid={!!errors.sku} errorMessage={errors.sku?.message}>
                        <Input autoFocus {...register('sku')} placeholder="e.g. DPK-RED-1KG" />
                    </FormItem>
                    <div className="grid grid-cols-2 gap-3">
                        <FormItem label="Price" invalid={!!errors.price} errorMessage={errors.price?.message}>
                            <Input type="number" step="0.01" {...register('price', { valueAsNumber: true })} />
                        </FormItem>
                        <FormItem label="Stock" invalid={!!errors.stock} errorMessage={errors.stock?.message}>
                            <Input type="number" {...register('stock', { valueAsNumber: true })} />
                        </FormItem>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                        <FormItem label="Discount Type">
                            <select className="input" {...register('discountType')}>
                                <option value="none">None</option>
                                <option value="percentage">Percentage</option>
                                <option value="fixed">Fixed</option>
                            </select>
                        </FormItem>
                        <FormItem label="Discount Value" invalid={!!errors.discountValue} errorMessage={errors.discountValue?.message}>
                            <Input type="number" step="0.01" disabled={discountType === 'none'} {...register('discountValue', { valueAsNumber: true })} />
                        </FormItem>
                    </div>
                    <FormItem label="Active">
                        <Switcher {...register('isActive')} />
                    </FormItem>
                </FormContainer>
                <div className="flex justify-end gap-2 pt-2">
                    <Button type="button" onClick={onClose}>Cancel</Button>
                    <Button type="submit" variant="solid">Save Variant</Button>
                </div>
            </form>
        </Drawer>
    )
}


