import { useSessionStore } from '~/stores/session'

/**
 * Composable that exposes the MFE config from the session store.
 */
export function useMfeHomeConfig() {
  const sessionStore = useSessionStore()

  const config = computed(() => sessionStore.config)

  return { config }
}
