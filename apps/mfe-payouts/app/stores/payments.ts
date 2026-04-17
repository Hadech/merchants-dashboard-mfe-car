import { defineStore } from 'pinia'
import type { CreatePayoutRequest } from '@wompi/types'
import { usePayoutsApi } from '../composables/usePayoutsApi'

export const usePaymentsStore = defineStore('payments', () => {
  const { createPayout } = usePayoutsApi()

  const loading = ref(false)
  const error = ref<string | null>(null)
  const lastPayoutId = ref<string | null>(null)

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

  return { loading, error, lastPayoutId, submitPayout }
})
