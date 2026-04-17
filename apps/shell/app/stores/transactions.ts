import { defineStore } from 'pinia'
import type { TransactionFilters, Transaction } from '@wompi/types'
import { useTransactionsApi } from '~/composables/useTransactionsApi'

export function removeEmpty(filters: Record<string, unknown>): Record<string, string> {
  const result: Record<string, string> = {}
  for (const [key, value] of Object.entries(filters)) {
    const str = String(value).trim()
    if (str !== '' && value !== false) {
      result[key] = str
    }
  }
  return result
}

function lastXDays(days: number): [string, string] {
  const now = new Date()
  const from = new Date(now)
  from.setDate(from.getDate() - days)
  return [from.toISOString().split('T')[0], now.toISOString().split('T')[0]]
}

/**
 * Matches legacy TransactionPayments.vue:
 * - callGetTransactions({ from_date, until_date, page_size, page }) + optional filters
 * - getReportTransaction for CSV download via /transactions/download_filtered
 */
export const useTransactionsStore = defineStore('transactions', () => {
  const { getTransactions: fetchApi, downloadReport: downloadApi } = useTransactionsApi()

  const filters = ref<TransactionFilters>({
    id: '',
    reference: '',
    customer_email: '',
    is_strict_payment_method_type: false,
    status: '',
    payment_method_type: '',
    source_channel: '',
  })
  const loading = ref(false)
  const error = ref<string | null>(null)
  const transactions = ref<Transaction[]>([])
  const page = ref(1)
  const pageSize = ref(20)
  const totalResults = ref(0)

  const [defaultFrom, defaultUntil] = lastXDays(30)
  const fromDate = ref(defaultFrom)
  const untilDate = ref(defaultUntil)

  function setFilter(key: keyof TransactionFilters, value: string | boolean) {
    ;(filters.value as Record<string, unknown>)[key] = value
  }

  async function getTransactions() {
    loading.value = true
    error.value = null
    try {
      const cleanFilters = removeEmpty(filters.value as Record<string, unknown>)
      const data = await fetchApi({
        ...cleanFilters,
        from_date: fromDate.value,
        until_date: untilDate.value,
        page: page.value,
        page_size: pageSize.value,
      })
      transactions.value = data.data || []
      totalResults.value = data.meta?.total_results || 0
      return data
    } catch (e: unknown) {
      error.value = e instanceof Error ? e.message : 'Error desconocido'
    } finally {
      loading.value = false
    }
  }

  /** Legacy: api/transactions.js > getTransactionReport — GET /transactions/download_filtered */
  async function downloadReport() {
    const cleanFilters = removeEmpty(filters.value as Record<string, unknown>)
    return downloadApi({
      ...cleanFilters,
      from_date: fromDate.value,
      until_date: untilDate.value,
    })
  }

  return {
    filters, loading, error, transactions,
    page, pageSize, totalResults,
    fromDate, untilDate,
    setFilter, getTransactions, downloadReport,
  }
})
