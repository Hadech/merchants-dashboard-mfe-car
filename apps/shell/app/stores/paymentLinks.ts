import { defineStore } from 'pinia'
import type { PaymentLink } from '@wompi/types'
import { useApiClient } from '@wompi/api-client'

export const usePaymentLinksStore = defineStore('paymentLinks', () => {
  const api = useApiClient()

  const paymentLinks = ref<PaymentLink[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  async function fetchPaymentLinks() {
    loading.value = true
    error.value = null
    try {
      const data = await api('/payment-links')
      paymentLinks.value = data.data || []
    } catch (e: unknown) {
      error.value = e instanceof Error ? e.message : 'Error al cargar payment links'
    } finally {
      loading.value = false
    }
  }

  return { paymentLinks, loading, error, fetchPaymentLinks }
})
