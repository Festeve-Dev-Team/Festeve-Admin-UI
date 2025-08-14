import { FC } from 'react'
import { Navigate } from 'react-router-dom'
import { getToken } from '@/utils/cookies'
import appConfig from '@/configs/app.config'

interface AuthRouteProps {
    children: React.ReactNode
}

const AuthRoute: FC<AuthRouteProps> = ({ children }) => {
    const token = getToken()

    if (token) {
        return <Navigate to={appConfig.authenticatedEntryPath} replace />
    }

    return <>{children}</>
}

export default AuthRoute
