export default defineNuxtRouteMiddleware((to) => {
  if (import.meta.server) return

  const publicRoutes = ['/login', '/password-recovery', '/register', '/confirm-code']

  if (publicRoutes.some(route => to.path.startsWith(route))) {
    return
  }

  const token = localStorage.getItem('token')
  if (!token) {
    return navigateTo('/login')
  }
})
