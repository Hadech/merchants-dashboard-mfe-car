import type { Merchant, ApiEnvironment } from '@wompi/types'

export type EventMap = {
  'merchant:changed': { merchantId: string; merchant: Merchant }
  'environment:changed': { environment: ApiEnvironment }
  'auth:logout': void
  'auth:session-refreshed': { accessToken: string }
  'mfe-home:navigate': { path: string; query?: Record<string, string> }
  'mfe-home:error': { code: string; message: string }
  'mfe-home:logout': void
  'mfe-home:merchant-redirect': { path: string }
}

export type EventKey = keyof EventMap
export type EventHandler<K extends EventKey> = (payload: EventMap[K]) => void
