export default defineNuxtRouteMiddleware(async (to) => {
  if (import.meta.server) return

  const publicRoutes = ['/login', '/password-recovery', '/register', '/confirm-code']

  if (publicRoutes.some(route => to.path.startsWith(route))) {
    return
  }

  const token = localStorage.getItem('token')
  const refreshToken = localStorage.getItem('refreshToken')

  // No session at all → login
  if (!token && !refreshToken) {
    return navigateTo('/login')
  }

  // Restore userPrincipalID if missing from sessionStorage
  if (!sessionStorage.getItem('userPrincipalID')) {
    const fromLocal = localStorage.getItem('userPrincipalID')
    if (fromLocal) {
      sessionStorage.setItem('userPrincipalID', fromLocal)
    } else {
      const email = localStorage.getItem('userEmail') || localStorage.getItem('userName')
      if (email) {
        try {
          const { createApiClient } = await import('@wompi/api-client')
          const api = createApiClient({ useAuth: true, refreshSession: undefined })
          const response = await api<{ data: { merchants: Array<{ id: string }> } }>(
            `/merchant-users/user/email/${email}`
          )
          const merchants = response?.data?.merchants || []
          if (merchants.length > 0) {
            const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
            const merchant = merchants.find((m: { id: string }) => uuidRegex.test(m.id)) ?? merchants[0]
            if (merchant) {
              sessionStorage.setItem('userPrincipalID', merchant.id)
              localStorage.setItem('userPrincipalID', merchant.id)
            }
          }
        } catch (e) {
          console.warn('[Auth Middleware] Could not restore userPrincipalID:', e)
        }
      }
    }
  }
})
