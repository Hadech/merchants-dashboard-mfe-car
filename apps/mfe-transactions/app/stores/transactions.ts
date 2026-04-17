import { defineStore } from 'pinia'
import type { TransactionFilters, Transaction } from '@wompi/types'
import { useApiClient } from '@wompi/api-client'

export function removeEmpty(filters: TransactionFilters): Record<string, string> {
  const result: Record<string, string> = {}
  for (const [key, value] of Object.entries(filters)) {
    const str = String(value).trim()
    if (str !== '' && value !== false) {
      result[key] = str
    }
  }
  return result
}

export const useTransactionsStore = defineStore('transactions', () => {
  const api = useApiClient()

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

  function setFilter(key: keyof TransactionFilters, value: string | boolean) {
    ;(filters.value as Record<string, unknown>)[key] = value
  }

  async function getReport() {
    loading.value = true
    error.value = null
    try {
      const cleanFilters = removeEmpty(filters.value)
      const data = await api('/transactions', { query: cleanFilters })
      transactions.value = data.data || []
      return data
    } catch (e: unknown) {
      error.value = e instanceof Error ? e.message : 'Error desconocido'
    } finally {
      loading.value = false
    }
  }

  return { filters, loading, error, transactions, setFilter, getReport }
})
