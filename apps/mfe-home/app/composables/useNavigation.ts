import { useEventBus } from '@wompi/event-bus'

export function useNavigation() {
  const { emit } = useEventBus('mfe-home')
  const route = useRoute()

  function navigateTo(path: string) {
    const query = { ...route.query } as Record<string, string>
    emit('mfe-home:navigate', { path, query })
  }

  return { navigateTo }
}
