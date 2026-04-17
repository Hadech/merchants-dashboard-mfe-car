import { useApiClient } from '@wompi/api-client'
import type { Dispute } from '@wompi/types'

/**
 * Matches legacy: apiCalls.js > disputesApi, disputeApi
 * Timezone calc from: pages/disputes/index.vue data()
 */
function getTimezone(): string {
  const gmtHours = parseInt(String(new Date().getTimezoneOffset() / 60))
  const padded = gmtHours < 10 ? `0${gmtHours}` : `${gmtHours}`
  return gmtHours > 0 ? `-${padded}00` : `+${padded}00`
}

export function useDisputesApi() {
  const api = useApiClient()

  /** GET /disputes — legacy: disputesApi(filters) with timezone */
  async function getDisputes(params?: Record<string, unknown>) {
    return api<{ data: Dispute[]; meta: { total_results: number; page_size: number } }>('/disputes', {
      query: {
        timezone: getTimezone(),
        ...params,
      },
    })
  }

  /** GET /disputes/{id} — legacy: disputeApi(id) */
  async function getDispute(id: string) {
    return api<{ data: Dispute }>(`/disputes/${id}`)
  }

  return { getDisputes, getDispute }
}
