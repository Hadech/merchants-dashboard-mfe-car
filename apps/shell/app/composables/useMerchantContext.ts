import { useEventBus } from '@wompi/event-bus'
import type { Merchant, ApiEnvironment } from '@wompi/types'

export function useMerchantContext() {
  const { emit } = useEventBus()

  const currentMerchant = ref<Merchant | null>(null)
  const merchants = ref<Merchant[]>([])

  const currentEnvironment = ref<ApiEnvironment>({
    tag: 'production',
    name: 'Producción',
    type: 'prod',
    baseUrl: String(import.meta.env.VITE_API_GW_BASE_URL),
  })

  const isSandbox = computed(() => currentEnvironment.value.type.includes('test'))

  function selectMerchant(merchant: Merchant) {
    currentMerchant.value = merchant
    sessionStorage.setItem('userPrincipalID', merchant.id)
    localStorage.setItem('userPrincipalID', merchant.id)
    emit('merchant:changed', { merchantId: merchant.id, merchant })
  }

  /**
   * Restore userPrincipalID from localStorage into sessionStorage
   * when sessionStorage was lost (new tab, page refresh).
   * If neither exists, fetch merchants from API.
   */
  async function ensureUserPrincipalID(): Promise<void> {
    const fromSession = sessionStorage.getItem('userPrincipalID')
    if (fromSession) return

    const fromLocal = localStorage.getItem('userPrincipalID')
    if (fromLocal) {
      sessionStorage.setItem('userPrincipalID', fromLocal)
      return
    }

    // Neither exists — try to fetch from API
    const token = localStorage.getItem('token')
    const userName = localStorage.getItem('userName')
    if (!token || !userName) return

    try {
      const { createApiClient } = await import('@wompi/api-client')
      const api = createApiClient({ useAuth: true, refreshSession: undefined })
      const response = await api<{ data: { merchants: Array<{ id: string }> } }>(
        `/merchant-users/user/email/${userName}`
      )
      const merchants = response.data?.merchants || []
      if (merchants.length > 0) {
        const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
        const merchant = merchants.find(m => uuidRegex.test(m.id)) || merchants[0]
        sessionStorage.setItem('userPrincipalID', merchant.id)
        localStorage.setItem('userPrincipalID', merchant.id)
      }
    } catch (e) {
      console.warn('[MerchantContext] Could not restore userPrincipalID:', e)
    }
  }

  function toggleEnvironment() {
    const isSandboxNow = isSandbox.value
    currentEnvironment.value = isSandboxNow
      ? {
          tag: 'production',
          name: 'Producción',
          type: 'prod',
          baseUrl: String(import.meta.env.VITE_API_GW_BASE_URL),
        }
      : {
          tag: 'sandbox',
          name: 'Sandbox',
          type: 'test',
          baseUrl: String(import.meta.env.VITE_API_GW_BASE_URL_SANDBOX),
        }

    localStorage.setItem('apiEnvironment', JSON.stringify(currentEnvironment.value))
    emit('environment:changed', { environment: currentEnvironment.value })
  }

  return {
    currentMerchant,
    merchants,
    currentEnvironment,
    isSandbox,
    selectMerchant,
    toggleEnvironment,
    ensureUserPrincipalID,
  }
}
