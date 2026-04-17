import { defineStore } from 'pinia'
import type { Dispute } from '@wompi/types'
import { useApiClient } from '@wompi/api-client'

export const useDisputesStore = defineStore('disputes', () => {
  const api = useApiClient()

  const disputes = ref<Dispute[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  async function fetchDisputes() {
    loading.value = true
    error.value = null
    try {
      const data = await api('/disputes')
      disputes.value = data.data || []
    } catch (e: unknown) {
      error.value = e instanceof Error ? e.message : 'Error al cargar disputas'
    } finally {
      loading.value = false
    }
  }

  return { disputes, loading, error, fetchDisputes }
})
