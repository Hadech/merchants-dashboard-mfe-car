import { useApiClient } from '@wompi/api-client'
import type { PayoutBalance, CreatePayoutRequest } from '@wompi/types'

export function usePayoutsApi() {
  const api = useApiClient()

  async function getBalance(merchantId: string) {
    return api<{ data: PayoutBalance }>(`/transversal/balances/${merchantId}`)
  }

  async function updateAutoPayment(merchantId: string, activate: boolean) {
    return api(`/transversal/balances/${merchantId}/status`, {
      method: 'PATCH',
      body: { activate },
    })
  }

  async function createPayout(payload: CreatePayoutRequest) {
    return api('/payouts', { method: 'POST', body: payload })
  }

  async function getLimits() {
    return api('/payouts/limits', {
      headers: { 'business-application-id': 'WOMPI_PAYINS' },
    })
  }

  return { getBalance, updateAutoPayment, createPayout, getLimits }
}
