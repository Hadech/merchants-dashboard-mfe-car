import mitt from 'mitt'
import type { EventMap, EventKey, EventHandler } from './types'

const emitter = mitt<EventMap>()

const subscriptionRegistry = new Map<string, Array<() => void>>()

export function useEventBus(mfeId?: string) {
  function emit<K extends EventKey>(event: K, payload: EventMap[K]) {
    emitter.emit(event, payload)
  }

  function on<K extends EventKey>(event: K, handler: EventHandler<K>) {
    emitter.on(event, handler)

    if (mfeId) {
      const cleanups = subscriptionRegistry.get(mfeId) || []
      cleanups.push(() => emitter.off(event, handler))
      subscriptionRegistry.set(mfeId, cleanups)
    }

    return () => emitter.off(event, handler)
  }

  function cleanup() {
    if (!mfeId) return
    const cleanups = subscriptionRegistry.get(mfeId)
    cleanups?.forEach(fn => fn())
    subscriptionRegistry.delete(mfeId)
  }

  return { emit, on, cleanup }
}
