import { apiSignIn, apiSignOut, apiSignUp, apiVerifyOTP } from '@/services/AuthService'
import {
    setUser,
    signInSuccess,
    signOutSuccess,
    useAppSelector,
    useAppDispatch,
} from '@/store'
import appConfig from '@/configs/app.config'
import { REDIRECT_URL_KEY } from '@/constants/app.constant'
import { useNavigate } from 'react-router-dom'
import useQuery from './useQuery'
import type { SignInCredential, SignUpCredential, OTPVerificationRequest } from '@/@types/auth'

type Status = 'success' | 'failed'

function useAuth() {
    const dispatch = useAppDispatch()

    const navigate = useNavigate()

    const query = useQuery()

    const { token, signedIn } = useAppSelector((state) => state.auth.session)

    const signIn = async (
        values: SignInCredential,
    ): Promise<
        | {
              status: Status
              message: string
          }
        | undefined
    > => {
        try {
            const resp = await apiSignIn(values)
            if (resp.data) {
                const { token } = resp.data
                completeAuthAndRedirect(token, resp.data.user)
                return {
                    status: 'success',
                    message: '',
                }
            }
            // eslint-disable-next-line  @typescript-eslint/no-explicit-any
        } catch (errors: any) {
            return {
                status: 'failed',
                message: errors?.response?.data?.message || errors.toString(),
            }
        }
    }

    const signUp = async (values: SignUpCredential) => {
        try {
            const resp = await apiSignUp(values)
            if (resp.data) {
                // Don't auto-login or redirect on signup success
                // Let the calling component handle OTP flow
                return {
                    status: 'success',
                    message: 'Signup successful',
                    data: resp.data,
                }
            }
            // eslint-disable-next-line  @typescript-eslint/no-explicit-any
        } catch (errors: any) {
            return {
                status: 'failed',
                message: errors?.response?.data?.message || errors.toString(),
            }
        }
    }

    const handleSignOut = () => {
        dispatch(signOutSuccess())
        dispatch(
            setUser({
                avatar: '',
                userName: '',
                email: '',
                authority: [],
            }),
        )
        navigate(appConfig.unAuthenticatedEntryPath)
    }

    const signOut = async () => {
        await apiSignOut()
        handleSignOut()
    }

    const completeAuthAndRedirect = (token: string, user: any) => {
        dispatch(signInSuccess(token))
        if (user) {
            dispatch(
                setUser(
                    user || {
                        avatar: '',
                        userName: 'Anonymous',
                        authority: ['USER'],
                        email: '',
                    },
                ),
            )
        }
        const redirectUrl = query.get(REDIRECT_URL_KEY)
        navigate(
            redirectUrl
                ? redirectUrl
                : appConfig.authenticatedEntryPath,
        )
    }

    const verifyOTP = async (
        identifier: string,
        code: string,
        signupData: SignUpCredential
    ): Promise<
        | {
              status: Status
              message: string
          }
        | undefined
    > => {
        try {
            const otpData: OTPVerificationRequest = {
                identifier,
                code,
                signupData
            }
            
            const resp = await apiVerifyOTP(otpData)
            if (resp.data) {
                const { token } = resp.data
                completeAuthAndRedirect(token, resp.data.user)
                return {
                    status: 'success',
                    message: 'OTP verified successfully',
                }
            }
            // eslint-disable-next-line  @typescript-eslint/no-explicit-any
        } catch (errors: any) {
            return {
                status: 'failed',
                message: errors?.response?.data?.message || errors.toString(),
            }
        }
    }

    return {
        authenticated: token && signedIn,
        signIn,
        signUp,
        signOut,
        verifyOTP,
    }
}

export default useAuth
