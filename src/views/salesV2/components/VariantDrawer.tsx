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
        setValue,
    } = useForm<VariantFormInput>({
        resolver: zodResolver(variantSchema),
        shouldFocusError: false,
        mode: 'onSubmit',
        reValidateMode: 'onSubmit', // Only revalidate on submit
        defaultValues: initial ?? {
            sku: '',
            specs: {},
            price: 0,
            stock: 0,
            discountType: 'none',
            discountValue: 0,
            images: [],
            isActive: true,
            size: '',
            color: '',
            colorCode: '',
            colorFamily: '',
            material: '',
            weight: undefined,
            dimensions: {
                length: undefined,
                width: undefined,
                height: undefined,
                unit: ''
            },
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
                size: undefined,
                color: undefined,
                colorCode: undefined,
                colorFamily: undefined,
                material: undefined,
                weight: undefined,
                dimensions: undefined,
            },
        )
    }, [initial, reset])

    const discountType = watch('discountType')

    return (
        <Drawer isOpen={open} onClose={onClose} width={800}>
            <h4 className="text-base font-semibold">Variant</h4>
            <form
                className="mt-4 space-y-3"
                onSubmit={handleSubmit(
                    (v) => {
                        console.log('🎯 Variant submission started:', v)
                        console.log('🔍 Variant validation errors:', errors)
                        
                        // Manual validation for critical fields only
                        if (v.price !== undefined && v.price < 0) {
                            console.log('❌ Price validation failed')
                            return
                        }
                        if (v.stock !== undefined && v.stock < 0) {
                            console.log('❌ Stock validation failed')
                            return
                        }
                        
                        onSubmit(v)
                    },
                    (errors) => {
                        console.log('❌ Variant form validation failed:', errors)
                        console.log('❌ Detailed errors:', JSON.stringify(errors, null, 2))
                    }
                )}
            >
                <FormContainer>
                    <FormItem label="SKU" invalid={!!errors.sku} errorMessage={errors.sku?.message}>
                        <Input {...register('sku')} placeholder="e.g. DPK-RED-1KG" />
                    </FormItem>
                    <div className="grid grid-cols-2 gap-3">
                        <FormItem label="Price" invalid={!!errors.price} errorMessage={errors.price?.message}>
                            <Input type="number" step="0.01" {...register('price', { 
                                setValueAs: (v) => {
                                    if (v === '' || v === null || v === undefined) return undefined
                                    const num = Number(v)
                                    return isNaN(num) ? undefined : num
                                }
                            })} />
                        </FormItem>
                        <FormItem label="Stock" invalid={!!errors.stock} errorMessage={errors.stock?.message}>
                            <Input type="number" {...register('stock', { 
                                setValueAs: (v) => {
                                    if (v === '' || v === null || v === undefined) return undefined
                                    const num = Number(v)
                                    return isNaN(num) ? undefined : num
                                }
                            })} />
                        </FormItem>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                        <FormItem label="Discount Type">
                            <select 
                                className="input" 
                                value={watch('discountType')}
                                onChange={(e) => setValue('discountType', e.target.value as any, { shouldDirty: true })}
                            >
                                <option value="none">None</option>
                                <option value="percentage">Percentage</option>
                                <option value="fixed">Fixed</option>
                            </select>
                        </FormItem>
                        <FormItem label="Discount Value" invalid={!!errors.discountValue} errorMessage={errors.discountValue?.message}>
                            <Input type="number" step="0.01" disabled={discountType === 'none'} {...register('discountValue', { 
                                setValueAs: (v) => {
                                    if (v === '' || v === null || v === undefined) return undefined
                                    const num = Number(v)
                                    return isNaN(num) ? undefined : num
                                }
                            })} />
                        </FormItem>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                        <FormItem label="Size">
                            <select 
                                className="input" 
                                value={watch('size') || ''}
                                onChange={(e) => setValue('size', e.target.value, { shouldDirty: true })}
                            >
                                <option value="">Select size</option>
                                <option value="XS">XS</option>
                                <option value="S">S</option>
                                <option value="M">M</option>
                                <option value="L">L</option>
                                <option value="XL">XL</option>
                                <option value="XXL">XXL</option>
                                <option value="XXXL">XXXL</option>
                                <option value="2XL">2XL</option>
                                <option value="3XL">3XL</option>
                                <option value="4XL">4XL</option>
                                <option value="5XL">5XL</option>
                                <option value="28">28</option>
                                <option value="30">30</option>
                                <option value="32">32</option>
                                <option value="34">34</option>
                                <option value="36">36</option>
                                <option value="38">38</option>
                                <option value="40">40</option>
                                <option value="42">42</option>
                                <option value="44">44</option>
                                <option value="46">46</option>
                                <option value="48">48</option>
                                <option value="50">50</option>
                                <option value="Free Size">Free Size</option>
                                <option value="One Size">One Size</option>
                                <option value="Custom">Custom</option>
                            </select>
                        </FormItem>
                        <FormItem label="Material">
                            <Input {...register('material')} placeholder="e.g. Cotton, Silk" />
                        </FormItem>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                        <FormItem label="Color">
                            <Input {...register('color')} placeholder="e.g. Royal Blue" />
                        </FormItem>
                        <FormItem label="Color Code" invalid={!!errors.colorCode} errorMessage={errors.colorCode?.message}>
                            <Input type="color" {...register('colorCode')} placeholder="#4169E1" />
                        </FormItem>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                        <FormItem label="Color Family">
                            <Input {...register('colorFamily')} placeholder="e.g. Blue, Red" />
                        </FormItem>
                        <FormItem label="Weight (grams)" invalid={!!errors.weight} errorMessage={errors.weight?.message}>
                            <Input type="number" step="0.1" {...register('weight', { 
                                setValueAs: (v) => {
                                    if (v === '' || v === null || v === undefined) return undefined
                                    const num = Number(v)
                                    return isNaN(num) ? undefined : num
                                }
                            })} placeholder="250" />
                        </FormItem>
                    </div>
                    <div className="border rounded p-3 space-y-2">
                        <label className="text-sm font-medium">Dimensions</label>
                        <div className="grid grid-cols-4 gap-2">
                            <FormItem label="Length" invalid={!!errors.dimensions?.length} errorMessage={errors.dimensions?.length?.message}>
                                <Input type="number" step="0.1" {...register('dimensions.length', { 
                                    setValueAs: (v) => {
                                        if (v === '' || v === null || v === undefined) return undefined
                                        const num = Number(v)
                                        return isNaN(num) ? undefined : num
                                    }
                                })} placeholder="10.5" />
                            </FormItem>
                            <FormItem label="Width" invalid={!!errors.dimensions?.width} errorMessage={errors.dimensions?.width?.message}>
                                <Input type="number" step="0.1" {...register('dimensions.width', { 
                                    setValueAs: (v) => {
                                        if (v === '' || v === null || v === undefined) return undefined
                                        const num = Number(v)
                                        return isNaN(num) ? undefined : num
                                    }
                                })} placeholder="5.0" />
                            </FormItem>
                            <FormItem label="Height" invalid={!!errors.dimensions?.height} errorMessage={errors.dimensions?.height?.message}>
                                <Input type="number" step="0.1" {...register('dimensions.height', { 
                                    setValueAs: (v) => {
                                        if (v === '' || v === null || v === undefined) return undefined
                                        const num = Number(v)
                                        return isNaN(num) ? undefined : num
                                    }
                                })} placeholder="2.5" />
                            </FormItem>
                            <FormItem label="Unit">
                                <select 
                                    className="input" 
                                    value={watch('dimensions.unit') || ''}
                                    onChange={(e) => setValue('dimensions.unit', e.target.value, { shouldDirty: true })}
                                >
                                    <option value="">Unit</option>
                                    <option value="cm">cm</option>
                                    <option value="inch">inch</option>
                                    <option value="mm">mm</option>
                                </select>
                            </FormItem>
                        </div>
                    </div>
                    <FormItem label="Active">
                        <Switcher 
                            checked={watch('isActive')}
                            onChange={(checked) => setValue('isActive', checked, { shouldDirty: true })}
                        />
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


