import { useEventBus } from '@wompi/event-bus'

/**
 * Composable that provides navigation via event-bus,
 * preserving current query params from the route.
 */
export function useNavigation() {
  const { emit } = useEventBus('mfe-home')
  const route = useRoute()

  function navigateTo(path: string) {
    const query = { ...route.query } as Record<string, string>
    emit('mfe-home:navigate', { path, query })
  }

  return { navigateTo }
}
