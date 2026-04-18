import { useSessionStore } from '~/stores/session'

/**
 * Composable that exposes permission checking based on the session store.
 * Returns true if any permission matches both action and subject.
 */
export function usePermissions() {
  const sessionStore = useSessionStore()

  function can(action: string, subject: string): boolean {
    return sessionStore.permissions.some(
      (p) => p.action === action && p.subject === subject
    )
  }

  return { can }
}
