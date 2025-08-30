import { useState } from 'react'
import { FormItem, FormContainer } from '@/components/ui/Form'
import Input from '@/components/ui/Input'
import Button from '@/components/ui/Button'
import Alert from '@/components/ui/Alert'
import PasswordInput from '@/components/shared/PasswordInput'
import ActionLink from '@/components/shared/ActionLink'
import OTPVerification from '@/components/shared/OTPVerification'
import useTimeOutMessage from '@/utils/hooks/useTimeOutMessage'
import { Field, Form, Formik } from 'formik'
import * as Yup from 'yup'
import useAuth from '@/utils/hooks/useAuth'
import type { CommonProps } from '@/@types/common'
import type { SignUpCredential } from '@/@types/auth'

interface SignUpFormProps extends CommonProps {
    disableSubmit?: boolean
    signInUrl?: string
}

type SignUpFormSchema = {
    name: string
    password: string
    email: string
    phone: string
    referralCode: string
    confirmPassword: string
}

const validationSchema = Yup.object().shape({
    name: Yup.string().required('Please enter your name'),
    email: Yup.string()
        .email('Invalid email')
        .required('Please enter your email'),
    phone: Yup.string().required('Please enter your phone number'),
    password: Yup.string()
        .min(6, 'Password must be at least 6 characters')
        .required('Please enter your password'),
    confirmPassword: Yup.string().oneOf(
        [Yup.ref('password')],
        'Your passwords do not match',
    ),
    referralCode: Yup.string(), // Optional field
})

const SignUpForm = (props: SignUpFormProps) => {
    const { disableSubmit = false, className, signInUrl = '/sign-in' } = props

    const { signUp, verifyOTP } = useAuth()

    const [message, setMessage] = useTimeOutMessage()
    const [showOTPVerification, setShowOTPVerification] = useState(false)
    const [signupData, setSignupData] = useState<SignUpCredential | null>(null)
    const [identifier, setIdentifier] = useState('')

    const onSignUp = async (
        values: SignUpFormSchema,
        setSubmitting: (isSubmitting: boolean) => void,
    ) => {
        const { name, password, email, phone, referralCode } = values
        setSubmitting(true)
        
        const signUpData = {
            name,
            email,
            phone,
            provider: 'native',
            providerUserId: '',
            password,
            profilePicture: '',
            referralCode: referralCode || '',
        }
        
        const result = await signUp(signUpData)

        if (result?.status === 'failed') {
            // Check if the error message indicates OTP is required
            if (result.message?.toLowerCase().includes('otp') || 
                result.message?.toLowerCase().includes('verification') ||
                result.message?.toLowerCase().includes('verify')) {
                // Switch to OTP verification mode
                setSignupData(signUpData)
                setIdentifier(email)
                setShowOTPVerification(true)
                setMessage('')
            } else {
                setMessage(result.message)
            }
        } else if (result?.status === 'success') {
            // For successful signup, always show OTP verification
            // This assumes your API requires OTP verification after signup
            setSignupData(signUpData)
            setIdentifier(email)
            setShowOTPVerification(true)
            setMessage('')
        } else {
            // Fallback: if no result, assume OTP is needed
            setSignupData(signUpData)
            setIdentifier(email)
            setShowOTPVerification(true)
            setMessage('')
        }

        setSubmitting(false)
    }

    const handleOTPVerification = async (
        identifier: string,
        code: string,
        signupData: SignUpCredential
    ) => {
        return await verifyOTP(identifier, code, signupData)
    }

    const handleOTPSuccess = () => {
        // This will be called when OTP verification is successful
        // The verifyOTP function already handles navigation
        setShowOTPVerification(false)
    }

    // Show OTP verification if required
    if (showOTPVerification && signupData) {
        return (
            <OTPVerification
                className={className}
                identifier={identifier}
                signupData={signupData}
                onVerifyOTP={handleOTPVerification}
                onVerifySuccess={handleOTPSuccess}
            />
        )
    }

    return (
        <div className={className}>
            {message && (
                <Alert showIcon className="mb-4" type="danger">
                    {message}
                </Alert>
            )}
            <Formik
                initialValues={{
                    name: '',
                    password: '',
                    confirmPassword: '',
                    email: '',
                    phone: '',
                    referralCode: '',
                }}
                validationSchema={validationSchema}
                onSubmit={(values, { setSubmitting }) => {
                    if (!disableSubmit) {
                        onSignUp(values, setSubmitting)
                    } else {
                        setSubmitting(false)
                    }
                }}
            >
                {({ touched, errors, isSubmitting }) => (
                    <Form>
                        <FormContainer>
                            <FormItem
                                label="Full Name"
                                invalid={errors.name && touched.name}
                                errorMessage={errors.name}
                            >
                                <Field
                                    type="text"
                                    autoComplete="off"
                                    name="name"
                                    placeholder="Full Name"
                                    component={Input}
                                />
                            </FormItem>
                            <FormItem
                                label="Email"
                                invalid={errors.email && touched.email}
                                errorMessage={errors.email}
                            >
                                <Field
                                    type="email"
                                    autoComplete="off"
                                    name="email"
                                    placeholder="Email"
                                    component={Input}
                                />
                            </FormItem>
                            <FormItem
                                label="Phone Number"
                                invalid={errors.phone && touched.phone}
                                errorMessage={errors.phone}
                            >
                                <Field
                                    type="tel"
                                    autoComplete="off"
                                    name="phone"
                                    placeholder="Phone Number"
                                    component={Input}
                                />
                            </FormItem>
                            <FormItem
                                label="Password"
                                invalid={errors.password && touched.password}
                                errorMessage={errors.password}
                            >
                                <Field
                                    autoComplete="off"
                                    name="password"
                                    placeholder="Password"
                                    component={PasswordInput}
                                />
                            </FormItem>
                            <FormItem
                                label="Confirm Password"
                                invalid={
                                    errors.confirmPassword &&
                                    touched.confirmPassword
                                }
                                errorMessage={errors.confirmPassword}
                            >
                                <Field
                                    autoComplete="off"
                                    name="confirmPassword"
                                    placeholder="Confirm Password"
                                    component={PasswordInput}
                                />
                            </FormItem>
                            <FormItem
                                label="Referral Code (Optional)"
                                invalid={errors.referralCode && touched.referralCode}
                                errorMessage={errors.referralCode}
                            >
                                <Field
                                    type="text"
                                    autoComplete="off"
                                    name="referralCode"
                                    placeholder="Referral Code"
                                    component={Input}
                                />
                            </FormItem>
                            <Button
                                block
                                loading={isSubmitting}
                                variant="solid"
                                type="submit"
                            >
                                {isSubmitting
                                    ? 'Creating Account...'
                                    : 'Sign Up'}
                            </Button>
                            <div className="mt-4 text-center">
                                <span>Already have an account? </span>
                                <ActionLink to={signInUrl}>Sign in</ActionLink>
                            </div>
                        </FormContainer>
                    </Form>
                )}
            </Formik>
        </div>
    )
}

export default SignUpForm
