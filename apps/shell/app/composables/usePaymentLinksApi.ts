import { useApiClient } from '@wompi/api-client'
import type { PaymentLink, CreatePaymentLinkRequest } from '@wompi/types'

/**
 * Matches legacy: apiCalls.js > paymentsApi, paymentApi, createPaymentLinkApi
 * IMPORTANT: endpoint is /payment_links (UNDERSCORE, not hyphen)
 * Default values from legacy: active=true, order_by='created_at', order='DESC', page=1, page_size=25
 */
export function usePaymentLinksApi() {
  const api = useApiClient()

  /** GET /payment_links — legacy: paymentsApi({ page, page_size, active, order_by, order }) */
  async function getPaymentLinks(params?: Record<string, unknown>) {
    return api<{ data: PaymentLink[]; meta: { total_results: number; page_size: number } }>('/payment_links', {
      query: {
        page: 1,
        page_size: 25,
        active: true,
        order_by: 'created_at',
        order: 'DESC',
        ...params,
      },
    })
  }

  /** GET /payment_links/{id} — legacy: paymentApi(id) */
  async function getPaymentLink(id: string) {
    return api<{ data: PaymentLink }>(`/payment_links/${id}`)
  }

  /** POST /payment_links — legacy: createPaymentLinkApi(body) */
  async function createPaymentLink(payload: CreatePaymentLinkRequest) {
    return api<{ data: PaymentLink }>('/payment_links', {
      method: 'POST',
      body: payload,
    })
  }

  return { getPaymentLinks, getPaymentLink, createPaymentLink }
}
