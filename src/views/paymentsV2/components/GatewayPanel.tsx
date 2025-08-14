import { Controller } from 'react-hook-form'
import { FormContainer, FormItem } from '@/components/ui/Form'
import Input from '@/components/ui/Input'
import Button from '@/components/ui/Button'

type Props = { control: any; watch: any; onVerify: () => void }

export default function GatewayPanel({ control, watch, onVerify }: Props) {
    return (
        <FormContainer>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormItem label="provider">
                    <Controller name="provider" control={control} render={({ field }) => (
                        <select className="input" {...field}>
                            <option value="razorpay">razorpay</option>
                            <option value="stripe">stripe</option>
                            <option value="cashfree">cashfree</option>
                            <option value="paytm">paytm</option>
                            <option value="other">other</option>
                        </select>
                    )} />
                </FormItem>
                <FormItem label="method">
                    <Controller name="method" control={control} render={({ field }) => (
                        <select className="input" {...field}>
                            <option value="UPI">UPI</option>
                            <option value="CARD">CARD</option>
                            <option value="NETBANKING">NETBANKING</option>
                            <option value="WALLET">WALLET</option>
                            <option value="COD">COD</option>
                            <option value="BANK_TRANSFER">BANK_TRANSFER</option>
                            <option value="OTHER">OTHER</option>
                        </select>
                    )} />
                </FormItem>
                <FormItem label="transactionId" extra={<span className="text-xs text-gray-500">Gateway txn/UTR/charge ID</span>}>
                    <Controller name="transactionId" control={control} render={({ field }) => (<Input {...field} />)} />
                </FormItem>
                <FormItem label="paymentIntentId" extra={<span className="text-xs text-gray-500">Stripe/RZP intent/order id if applicable</span>}>
                    <Controller name="paymentIntentId" control={control} render={({ field }) => (<Input {...field} />)} />
                </FormItem>
            </div>
            <div className="mt-2">
                <Button size="sm" onClick={onVerify}>Verify with gateway</Button>
            </div>
        </FormContainer>
    )
}



