import { defineStore } from 'pinia'
import type { PayoutBalance } from '@wompi/types'
import { usePayoutsApi } from '~/composables/usePayoutsApi'

/**
 * Matches legacy api/payouts.js:
 * - merchantBalanceApi({ merchantId }) → GET /transversal/balances/{merchantId}
 * - updateAutopaymentStatusApi({ merchantId, status }) → PATCH /transversal/balances/{merchantId}/status
 * - getLimits() → GET /payouts/limits with header business-application-id: WOMPI_PAYINS
 */
export const useBalancesStore = defineStore('balances', () => {
  const { getBalance, updateAutoPayment, getLimits } = usePayoutsApi()

  const balance = ref<PayoutBalance | null>(null)
  const limits = ref<unknown>(null)
  const loading = ref(false)
  const error = ref<string | null>(null)

  function getMerchantId(): string {
    return sessionStorage.getItem('userPrincipalID') || ''
  }

  /** GET /transversal/balances/{merchantId} */
  async function fetchBalance() {
    loading.value = true
    error.value = null
    try {
      const merchantId = getMerchantId()
      const data = await getBalance(merchantId)
      balance.value = data.data || null
    } catch (e: unknown) {
      error.value = e instanceof Error ? e.message : 'Error al cargar balance'
    } finally {
      loading.value = false
    }
  }

  /** PATCH /transversal/balances/{merchantId}/status */
  async function toggleAutoPayment(activate: boolean) {
    loading.value = true
    error.value = null
    try {
      const merchantId = getMerchantId()
      await updateAutoPayment(merchantId, activate)
      if (balance.value) {
        balance.value.auto_payment_enabled = activate
      }
    } catch (e: unknown) {
      error.value = e instanceof Error ? e.message : 'Error al actualizar auto-pago'
    } finally {
      loading.value = false
    }
  }

  /** GET /payouts/limits with business-application-id header */
  async function fetchLimits() {
    loading.value = true
    error.value = null
    try {
      const data = await getLimits()
      limits.value = data.data || null
    } catch (e: unknown) {
      error.value = e instanceof Error ? e.message : 'Error al cargar límites'
    } finally {
      loading.value = false
    }
  }

  return { balance, limits, loading, error, fetchBalance, toggleAutoPayment, fetchLimits }
})
