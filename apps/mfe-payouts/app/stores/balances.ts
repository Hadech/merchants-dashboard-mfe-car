import { defineStore } from 'pinia'
import type { PayoutBalance } from '@wompi/types'
import { usePayoutsApi } from '../composables/usePayoutsApi'

export const useBalancesStore = defineStore('balances', () => {
  const { getBalance, updateAutoPayment } = usePayoutsApi()

  const balance = ref<PayoutBalance | null>(null)
  const loading = ref(false)
  const error = ref<string | null>(null)

  async function fetchBalance(merchantId: string) {
    loading.value = true
    error.value = null
    try {
      const data = await getBalance(merchantId)
      balance.value = data.data || null
    } catch (e: unknown) {
      error.value = e instanceof Error ? e.message : 'Error al cargar balance'
    } finally {
      loading.value = false
    }
  }

  async function toggleAutoPayment(merchantId: string, activate: boolean) {
    loading.value = true
    error.value = null
    try {
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

  return { balance, loading, error, fetchBalance, toggleAutoPayment }
})
