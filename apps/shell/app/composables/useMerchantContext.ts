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
    emit('merchant:changed', { merchantId: merchant.id, merchant })
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
  }
}
