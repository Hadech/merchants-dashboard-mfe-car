import { useApiClient } from '@wompi/api-client'
import type { PaymentLink, CreatePaymentLinkRequest } from '@wompi/types'

export function usePaymentLinksApi() {
  const api = useApiClient()

  async function getPaymentLinks(params?: Record<string, string>) {
    return api<{ data: PaymentLink[] }>('/payment-links', { query: params })
  }

  async function getPaymentLink(id: string) {
    return api<{ data: PaymentLink }>(`/payment-links/${id}`)
  }

  async function createPaymentLink(payload: CreatePaymentLinkRequest) {
    return api<{ data: PaymentLink }>('/payment-links', {
      method: 'POST',
      body: payload,
    })
  }

  return { getPaymentLinks, getPaymentLink, createPaymentLink }
}
