export type SignInCredential = {
    email: string
    password: string
}

export type SignInResponse = {
    token: string
    user: {
        userName: string
        authority: string[]
        avatar: string
        email: string
    }
}

export type SignUpResponse = SignInResponse

export type SignUpCredential = {
    name: string
    email: string
    phone: string
    provider: string
    providerUserId: string
    password: string
    profilePicture: string
    referralCode: string
}

export type ForgotPassword = {
    email: string
}

export type ResetPassword = {
    password: string
}

export type OTPVerificationRequest = {
    identifier: string
    code: string
    signupData: SignUpCredential
}

export type OTPVerificationResponse = {
    token: string
    user: {
        userName: string
        authority: string[]
        avatar: string
        email: string
    }
}
