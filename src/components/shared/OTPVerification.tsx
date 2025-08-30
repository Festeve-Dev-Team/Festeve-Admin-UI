import { useState, useRef, useEffect } from 'react'
import { FormItem, FormContainer } from '@/components/ui/Form'
import Input from '@/components/ui/Input'
import Button from '@/components/ui/Button'
import Alert from '@/components/ui/Alert'
import useTimeOutMessage from '@/utils/hooks/useTimeOutMessage'
import type { CommonProps } from '@/@types/common'
import type { SignUpCredential } from '@/@types/auth'

interface OTPVerificationProps extends CommonProps {
    identifier: string
    signupData: SignUpCredential
    onVerifySuccess: () => void
    onVerifyOTP: (identifier: string, code: string, signupData: SignUpCredential) => Promise<{
        status: 'success' | 'failed'
        message: string
    } | undefined>
}

const OTPVerification = ({
    identifier,
    signupData,
    onVerifySuccess,
    onVerifyOTP,
    className
}: OTPVerificationProps) => {
    const [otpCode, setOtpCode] = useState(['', '', '', '', '', ''])
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [message, setMessage] = useTimeOutMessage()
    const inputRefs = useRef<(HTMLInputElement | null)[]>([])

    useEffect(() => {
        // Focus on first input when component mounts
        if (inputRefs.current[0]) {
            inputRefs.current[0].focus()
        }
    }, [])

    const handleInputChange = (index: number, value: string) => {
        if (value.length > 1) {
            // If user pastes a code, split it across inputs
            const digits = value.slice(0, 6).split('')
            const newOtpCode = [...otpCode]
            digits.forEach((digit, i) => {
                if (index + i < 6) {
                    newOtpCode[index + i] = digit
                }
            })
            setOtpCode(newOtpCode)
            
            // Focus on the last filled input or next empty one
            const nextIndex = Math.min(index + digits.length, 5)
            if (inputRefs.current[nextIndex]) {
                inputRefs.current[nextIndex].focus()
            }
        } else {
            // Single digit input
            const newOtpCode = [...otpCode]
            newOtpCode[index] = value
            setOtpCode(newOtpCode)

            // Move to next input if digit entered
            if (value && index < 5) {
                if (inputRefs.current[index + 1]) {
                    inputRefs.current[index + 1].focus()
                }
            }
        }
    }

    const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
        if (e.key === 'Backspace' && !otpCode[index] && index > 0) {
            // Move to previous input on backspace if current is empty
            if (inputRefs.current[index - 1]) {
                inputRefs.current[index - 1].focus()
            }
        } else if (e.key === 'ArrowLeft' && index > 0) {
            if (inputRefs.current[index - 1]) {
                inputRefs.current[index - 1].focus()
            }
        } else if (e.key === 'ArrowRight' && index < 5) {
            if (inputRefs.current[index + 1]) {
                inputRefs.current[index + 1].focus()
            }
        }
    }

    const handleSubmit = async () => {
        const code = otpCode.join('')
        if (code.length !== 6) {
            setMessage('Please enter the complete 6-digit code')
            return
        }

        setIsSubmitting(true)
        
        try {
            const result = await onVerifyOTP(identifier, code, signupData)
            
            if (result?.status === 'success') {
                onVerifySuccess()
            } else {
                setMessage(result?.message || 'OTP verification failed')
            }
        } catch (error) {
            setMessage('An error occurred during verification')
        }
        
        setIsSubmitting(false)
    }

    const isCodeComplete = otpCode.every(digit => digit !== '')

    return (
        <div className={className}>
            {message && (
                <Alert showIcon className="mb-4" type="danger">
                    {message}
                </Alert>
            )}
            
            <div className="text-center mb-6">
                <h3 className="mb-2">Verify Your Email</h3>
                <p className="text-gray-600">
                    We've sent a 6-digit verification code to
                </p>
                <p className="font-semibold">{identifier}</p>
            </div>

            <FormContainer>
                <FormItem label="Enter verification code">
                    <div className="flex justify-center space-x-2 mb-6">
                        {otpCode.map((digit, index) => (
                            <Input
                                key={index}
                                ref={(el) => (inputRefs.current[index] = el)}
                                type="text"
                                inputMode="numeric"
                                pattern="[0-9]*"
                                maxLength={6}
                                value={digit}
                                onChange={(e) => handleInputChange(index, e.target.value.replace(/[^0-9]/g, ''))}
                                onKeyDown={(e) => handleKeyDown(index, e)}
                                className="w-12 h-12 text-center text-lg font-semibold"
                                autoComplete="off"
                            />
                        ))}
                    </div>
                </FormItem>

                <Button
                    block
                    loading={isSubmitting}
                    variant="solid"
                    disabled={!isCodeComplete}
                    onClick={handleSubmit}
                >
                    {isSubmitting ? 'Verifying...' : 'Verify Code'}
                </Button>

                <div className="mt-4 text-center">
                    <span className="text-gray-600">Didn't receive the code? </span>
                    <button 
                        type="button"
                        className="text-blue-600 hover:text-blue-700 font-medium"
                        onClick={() => {
                            // You can implement resend functionality here
                            setMessage('Resend functionality can be implemented here')
                        }}
                    >
                        Resend
                    </button>
                </div>
            </FormContainer>
        </div>
    )
}

export default OTPVerification
