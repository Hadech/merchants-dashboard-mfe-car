import type { Merchant, ApiEnvironment, Balance, BusinessProcedure } from '@wompi/types'
import { useEventBus } from '@wompi/event-bus'

export const useMerchantsStore = defineStore('merchants', () => {
  const merchants = ref<Merchant[]>([])
  const merchant = computed(() => merchants.value[0] ?? null)
  const balance = ref<Balance | null>(null)
  const businessesProcedures = ref<BusinessProcedure[]>([])
  const apiEnvironment = ref<ApiEnvironment | null>(null)
  const featureFlags = ref<Record<string, boolean>>({})
  const loading = ref(false)
  const error = ref<string | null>(null)

  const { emit } = useEventBus('mfe-home')

  async function fetchMerchants() {
    loading.value = true
    error.value = null
    try {
      const data = await $fetch<{ data: Merchant[] }>('/merchants')
      merchants.value = data.data
    } catch (err: any) {
      const message = err?.message || 'Failed to load merchants'
      error.value = message
      emit('mfe-home:error', { code: 'MERCHANTS_LOAD_FAILED', message })
    } finally {
      loading.value = false
    }
  }

  async function fetchBalance() {
    try {
      const data = await $fetch<{ data: Balance }>('/balances')
      balance.value = data.data
    } catch (err: any) {
      console.error('[mfe-home] Failed to fetch balance:', err?.message)
    }
  }

  async function fetchBusinessesProcedures(merchantId: string) {
    try {
      const data = await $fetch<{ data: BusinessProcedure[] }>(
        `/crm/businesses_procedures?merchant_id=${merchantId}`
      )
      businessesProcedures.value = data.data
    } catch (err: any) {
      console.error('[mfe-home] Failed to fetch businesses procedures:', err?.message)
    }
  }

  async function evaluateFeatureFlags(feature: string) {
    try {
      const data = await $fetch<{ data: Record<string, boolean> }>(
        `/feature_flags?feature=${feature}`
      )
      featureFlags.value = { ...featureFlags.value, ...data.data }
    } catch (err: any) {
      console.error('[mfe-home] Failed to evaluate feature flags:', err?.message)
    }
  }

  return {
    merchants,
    merchant,
    balance,
    businessesProcedures,
    apiEnvironment,
    featureFlags,
    loading,
    error,
    fetchMerchants,
    fetchBalance,
    fetchBusinessesProcedures,
    evaluateFeatureFlags,
  }
})
