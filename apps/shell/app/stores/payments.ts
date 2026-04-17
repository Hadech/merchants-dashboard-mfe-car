import { defineStore } from 'pinia'
import type { CreatePayoutRequest } from '@wompi/types'
import { usePayoutsApi } from '~/composables/usePayoutsApi'
import { useApiClient } from '@wompi/api-client'

/**
 * Matches legacy:
 * - apiCalls.js > merchantsApi, updateMerchantApi, regenerateKeysApi
 * - apiCalls.js > disbursementsApi (via usePayoutsApi)
 */
export const usePaymentsStore = defineStore('payments', () => {
  const { createPayout, getDisbursements: fetchDisbursementsApi } = usePayoutsApi()
  const api = useApiClient()

  const loading = ref(false)
  const error = ref<string | null>(null)
  const lastPayoutId = ref<string | null>(null)
  const disbursements = ref<unknown[]>([])
  const disbursementsTotalResults = ref(0)

  /** POST /payouts */
  async function submitPayout(payload: CreatePayoutRequest) {
    loading.value = true
    error.value = null
    lastPayoutId.value = null
    try {
      const data = await createPayout(payload)
      lastPayoutId.value = data.data?.id || null
      return data
    } catch (e: unknown) {
      error.value = e instanceof Error ? e.message : 'Error al crear pago'
    } finally {
      loading.value = false
    }
  }

  /** GET /disbursements — legacy: disbursementsApi(filters) */
  async function fetchDisbursements(filters: Record<string, unknown>) {
    loading.value = true
    error.value = null
    try {
      const data = await fetchDisbursementsApi(filters)
      disbursements.value = data.data || []
      disbursementsTotalResults.value = data.meta?.total_results || 0
      return data
    } catch (e: unknown) {
      error.value = e instanceof Error ? e.message : 'Error al cargar desembolsos'
    } finally {
      loading.value = false
    }
  }

  /** GET /merchants — legacy: merchantsApi() */
  async function fetchMerchants() {
    return api('/merchants')
  }

  /** PATCH /merchants/{id} — legacy: updateMerchantApi({ id, body }) */
  async function updateMerchant(id: string, body: Record<string, unknown>) {
    return api(`/merchants/${id}`, { method: 'PATCH', body })
  }

  /** POST /merchants/rotate_keys — legacy: regenerateKeysApi() */
  async function regenerateKeys() {
    return api('/merchants/rotate_keys', {
      method: 'POST',
      body: { id_token: localStorage.getItem('idToken') },
    })
  }

  return {
    loading, error, lastPayoutId,
    disbursements, disbursementsTotalResults,
    submitPayout, fetchDisbursements,
    fetchMerchants, updateMerchant, regenerateKeys,
  }
})
