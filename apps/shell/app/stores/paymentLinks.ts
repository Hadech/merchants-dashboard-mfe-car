import { defineStore } from 'pinia'
import type { PaymentLink } from '@wompi/types'
import { usePaymentLinksApi } from '~/composables/usePaymentLinksApi'

/**
 * Matches legacy pages/payment-links/index.vue:
 * - callGetPaymentLinks({ page, page_size, active })
 * - Defaults: active=true, order_by='created_at', order='DESC', page=1, page_size=25
 */
export const usePaymentLinksStore = defineStore('paymentLinks', () => {
  const { getPaymentLinks: fetchApi } = usePaymentLinksApi()

  const paymentLinks = ref<PaymentLink[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)
  const page = ref(1)
  const pageSize = ref(25)
  const totalResults = ref(0)
  const active = ref(true)

  async function fetchPaymentLinks() {
    loading.value = true
    error.value = null
    try {
      const data = await fetchApi({
        page: page.value,
        page_size: pageSize.value,
        active: active.value,
        order_by: 'created_at',
        order: 'DESC',
      })
      paymentLinks.value = data.data || []
      totalResults.value = data.meta?.total_results || 0
    } catch (e: unknown) {
      error.value = e instanceof Error ? e.message : 'Error al cargar payment links'
    } finally {
      loading.value = false
    }
  }

  return { paymentLinks, loading, error, page, pageSize, totalResults, active, fetchPaymentLinks }
})
