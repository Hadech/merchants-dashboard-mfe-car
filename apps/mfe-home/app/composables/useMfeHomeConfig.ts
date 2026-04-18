import { useSessionStore } from '../stores/session'

export function useMfeHomeConfig() {
  const sessionStore = useSessionStore()
  return sessionStore.config
}
