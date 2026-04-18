import { useSessionStore } from '../stores/session'

export function usePermissions() {
  const sessionStore = useSessionStore()

  function can(action: string, subject: string): boolean {
    return sessionStore.permissions.some(
      (p) => p.action === action && p.subject === subject
    )
  }

  return { can }
}
