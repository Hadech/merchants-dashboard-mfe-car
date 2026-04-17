import { createApiClient } from './client'
import { useAuth } from '@wompi/auth'

export function useApiClient() {
  const { refreshSession, logout } = useAuth()

  return createApiClient({
    useAuth: true,
    refreshSession,
    onUnauthorized: logout,
  })
}

export { createApiClient }
export type * from './types'
