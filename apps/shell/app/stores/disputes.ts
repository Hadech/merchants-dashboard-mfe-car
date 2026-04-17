import { defineStore } from 'pinia'
import type { Dispute } from '@wompi/types'
import { useDisputesApi } from '~/composables/useDisputesApi'

function lastXDays(days: number): [string, string] {
  const now = new Date()
  const from = new Date(now)
  from.setDate(from.getDate() - days)
  return [from.toISOString().split('T')[0], now.toISOString().split('T')[0]]
}

/**
 * Matches legacy pages/disputes/index.vue:
 * - callGetResources({ from_date, until_date, page_size, page, timezone })
 * - timezone is auto-calculated inside the composable
 */
export const useDisputesStore = defineStore('disputes', () => {
  const { getDisputes: fetchDisputesApi } = useDisputesApi()

  const disputes = ref<Dispute[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)
  const page = ref(1)
  const pageSize = ref(10)
  const totalResults = ref(0)

  const [defaultFrom, defaultUntil] = lastXDays(30)
  const fromDate = ref(defaultFrom)
  const untilDate = ref(defaultUntil)

  async function fetchDisputes() {
    loading.value = true
    error.value = null
    try {
      const data = await fetchDisputesApi({
        from_date: fromDate.value,
        until_date: untilDate.value,
        page: page.value,
        page_size: pageSize.value,
      })
      disputes.value = data.data || []
      totalResults.value = data.meta?.total_results || 0
    } catch (e: unknown) {
      error.value = e instanceof Error ? e.message : 'Error al cargar disputas'
    } finally {
      loading.value = false
    }
  }

  return { disputes, loading, error, page, pageSize, totalResults, fromDate, untilDate, fetchDisputes }
})
