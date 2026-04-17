import { useApiClient } from '@wompi/api-client'
import type { Transaction, TransactionFilters } from '@wompi/types'

export function useTransactionsApi() {
  const api = useApiClient()

  async function getTransactions(filters: Partial<TransactionFilters>) {
    return api<{ data: Transaction[] }>('/transactions', { query: filters })
  }

  async function getTransaction(id: string) {
    return api<{ data: Transaction }>(`/transactions/${id}`)
  }

  async function downloadReport(filters: Partial<TransactionFilters>, format: 'csv' | 'xlsx') {
    return api(`/transactions/report`, {
      query: { ...filters, format },
      responseType: 'blob',
    })
  }

  return { getTransactions, getTransaction, downloadReport }
}
