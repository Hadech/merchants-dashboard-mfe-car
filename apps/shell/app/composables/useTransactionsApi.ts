import { useApiClient } from '@wompi/api-client'
import type { Transaction } from '@wompi/types'

/**
 * Matches legacy: apiCalls.js > transactionsApi, transactionApi
 * and api/transactions.js > getTransactionReport
 */
export function useTransactionsApi() {
  const api = useApiClient()

  /** GET /transactions — legacy: transactionsApi(filters) */
  async function getTransactions(filters: Record<string, unknown>) {
    return api<{ data: Transaction[]; meta: { total_results: number; page_size: number } }>('/transactions', {
      query: filters,
    })
  }

  /** GET /transactions/{id} — legacy: transactionApi({ id }) */
  async function getTransaction(id: string) {
    return api<{ data: Transaction }>(`/transactions/${id}`)
  }

  /** GET /transactions/download_filtered — legacy: api/transactions.js > getTransactionReport */
  async function downloadReport(filters: Record<string, unknown>) {
    return api('/transactions/download_filtered', {
      query: filters,
      responseType: 'blob',
    })
  }

  return { getTransactions, getTransaction, downloadReport }
}
