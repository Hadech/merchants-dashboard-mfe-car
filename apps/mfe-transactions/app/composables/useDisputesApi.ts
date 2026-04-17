import { useApiClient } from '@wompi/api-client'
import type { Dispute } from '@wompi/types'

export function useDisputesApi() {
  const api = useApiClient()

  async function getDisputes(params?: Record<string, string>) {
    return api<{ data: Dispute[] }>('/disputes', { query: params })
  }

  async function getDispute(id: string) {
    return api<{ data: Dispute }>(`/disputes/${id}`)
  }

  return { getDisputes, getDispute }
}
