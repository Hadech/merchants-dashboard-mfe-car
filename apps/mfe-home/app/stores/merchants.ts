import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { Merchant, Balance, BusinessProcedure, ApiEnvironment } from '@wompi/types'
import { useEventBus } from '@wompi/event-bus'

export const useMerchantsStore = defineStore('merchants', () => {
  const { emit } = useEventBus('mfe-home')

  const merchants = ref<Merchant[]>([])
  const merchant = computed(() => merchants.value[0] ?? null)
  const balance = ref<Balance | null>(null)
  const businessesProcedures = ref<BusinessProcedure[]>([])
  const apiEnvironment = ref<ApiEnvironment | null>(null)
  const featureFlags = ref<Record<string, boolean>>({})
  const loading = ref(false)
  const error = ref<string | null>(null)

  async function fetchMerchants() {
    try {
      loading.value = true
      const data = await $fetch<Merchant[]>('/merchants')
      merchants.value = data
    } catch (e: any) {
      error.value = e?.message ?? 'Failed to load merchants'
      emit('mfe-home:error', { code: 'MERCHANTS_LOAD_FAILED', message: error.value! })
    } finally {
      loading.value = false
    }
  }

  async function fetchBalance() {
    try {
      const data = await $fetch<Balance>('/balances')
      balance.value = data
    } catch (e: any) {
      console.error('Failed to fetch balance:', e)
    }
  }

  async function fetchBusinessesProcedures(merchantId: string) {
    try {
      const data = await $fetch<BusinessProcedure[]>(`/crm/businesses_procedures?merchant_id=${merchantId}`)
      businessesProcedures.value = data
    } catch (e: any) {
      console.error('Failed to fetch business procedures:', e)
    }
  }

  async function evaluateFeatureFlags(flagName: string) {
    try {
      const data = await $fetch<Record<string, boolean>>(`/feature_flags?name=${flagName}`)
      featureFlags.value = { ...featureFlags.value, ...data }
    } catch {
      console.error('Failed to evaluate feature flags')
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
