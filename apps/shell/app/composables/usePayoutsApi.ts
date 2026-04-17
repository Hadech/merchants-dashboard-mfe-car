import { useApiClient } from '@wompi/api-client'
import type { PayoutBalance, CreatePayoutRequest } from '@wompi/types'

/**
 * Matches legacy:
 * - api/payouts.js > merchantBalanceApi, updateAutopaymentStatusApi, getLimits
 * - apiCalls.js > disbursementsApi
 */
export function usePayoutsApi() {
  const api = useApiClient()

  /** GET /transversal/balances/{merchantId} — legacy: merchantBalanceApi */
  async function getBalance(merchantId: string) {
    return api<{ data: PayoutBalance }>(`/transversal/balances/${merchantId}`)
  }

  /** PATCH /transversal/balances/{merchantId}/status — legacy: updateAutopaymentStatusApi */
  async function updateAutoPayment(merchantId: string, activate: boolean) {
    return api(`/transversal/balances/${merchantId}/status`, {
      method: 'PATCH',
      body: { activate },
    })
  }

  /** GET /payouts/limits — legacy: getLimits (with business-application-id header) */
  async function getLimits() {
    return api('/payouts/limits', {
      headers: { 'business-application-id': 'WOMPI_PAYINS' },
    })
  }

  /** POST /payouts — for creating payouts */
  async function createPayout(payload: CreatePayoutRequest) {
    return api('/payouts', { method: 'POST', body: payload })
  }

  /** GET /disbursements — legacy: disbursementsApi(filters) */
  async function getDisbursements(filters: Record<string, unknown>) {
    return api<{ data: unknown[]; meta: { total_results: number; page_size: number } }>('/disbursements', {
      query: filters,
    })
  }

  return { getBalance, updateAutoPayment, getLimits, createPayout, getDisbursements }
}
