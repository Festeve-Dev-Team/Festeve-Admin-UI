import { FC } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { getToken } from '@/utils/cookies'
import { REDIRECT_URL_KEY } from '@/constants/app.constant'

interface PrivateRouteProps {
    children: React.ReactNode
}

const PrivateRoute: FC<PrivateRouteProps> = ({ children }) => {
    const location = useLocation()
    const token = getToken()

    if (!token) {
        const loginUrl = '/sign-in'
        const redirectUrl = `${loginUrl}?${REDIRECT_URL_KEY}=${encodeURIComponent(location.pathname)}`
        return <Navigate to={redirectUrl} replace />
    }

    return <>{children}</>
}

export default PrivateRoute
