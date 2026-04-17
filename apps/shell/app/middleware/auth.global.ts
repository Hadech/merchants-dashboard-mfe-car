export default defineNuxtRouteMiddleware(async (to) => {
  if (import.meta.server) return

  const publicRoutes = ['/login', '/password-recovery', '/register', '/confirm-code']

  if (publicRoutes.some(route => to.path.startsWith(route))) {
    return
  }

  const token = localStorage.getItem('token')
  if (!token) {
    return navigateTo('/login')
  }

  // Restore userPrincipalID if missing from sessionStorage
  // This handles: page refresh, new tab, or sessionStorage cleared
  if (!sessionStorage.getItem('userPrincipalID')) {
    // Try localStorage first (fast path)
    const fromLocal = localStorage.getItem('userPrincipalID')
    if (fromLocal) {
      sessionStorage.setItem('userPrincipalID', fromLocal)
    } else {
      // Fetch from API as last resort
      const userName = localStorage.getItem('userName')
      if (userName) {
        try {
          // Extract email from idToken (userName might be a nickname)
          const idToken = localStorage.getItem('idToken')
          let email = userName
          if (idToken) {
            try {
              const payload = JSON.parse(atob(idToken.split('.')[1]))
              if (payload.email) email = payload.email.toLowerCase()
            } catch { /* fallback to userName */ }
          }

          const { createApiClient } = await import('@wompi/api-client')
          const api = createApiClient({ useAuth: true, refreshSession: undefined })
          const response = await api<{ data: { merchants: Array<{ id: string }> } }>(
            `/merchant-users/user/email/${email}`
          )
          const merchants = response?.data?.merchants || []
          if (merchants.length > 0) {
            const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
            const merchant = merchants.find((m: { id: string }) => uuidRegex.test(m.id)) || merchants[0]
            sessionStorage.setItem('userPrincipalID', merchant.id)
            localStorage.setItem('userPrincipalID', merchant.id)
          }
        } catch (e) {
          console.warn('[Auth Middleware] Could not restore userPrincipalID:', e)
        }
      }
    }
  }
})
