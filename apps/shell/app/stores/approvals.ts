import { defineStore } from 'pinia'
import type { PayoutTransaction } from '@wompi/types'
import { useApiClient } from '@wompi/api-client'

/**
 * Approvals store for payout approval workflows.
 * These endpoints don't have a direct legacy equivalent in the old dashboard
 * but follow the same API patterns.
 */
export const useApprovalsStore = defineStore('approvals', () => {
  const api = useApiClient()

  const pendingApprovals = ref<PayoutTransaction[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  async function fetchPendingApprovals() {
    loading.value = true
    error.value = null
    try {
      const data = await api('/payouts/approvals', { query: { status: 'PENDING' } })
      pendingApprovals.value = data.data || []
    } catch (e: unknown) {
      error.value = e instanceof Error ? e.message : 'Error al cargar aprobaciones'
    } finally {
      loading.value = false
    }
  }

  async function approvePayout(payoutId: string) {
    loading.value = true
    error.value = null
    try {
      await api(`/payouts/${payoutId}/approve`, { method: 'POST' })
      pendingApprovals.value = pendingApprovals.value.filter(p => p.id !== payoutId)
    } catch (e: unknown) {
      error.value = e instanceof Error ? e.message : 'Error al aprobar pago'
    } finally {
      loading.value = false
    }
  }

  async function rejectPayout(payoutId: string) {
    loading.value = true
    error.value = null
    try {
      await api(`/payouts/${payoutId}/reject`, { method: 'POST' })
      pendingApprovals.value = pendingApprovals.value.filter(p => p.id !== payoutId)
    } catch (e: unknown) {
      error.value = e instanceof Error ? e.message : 'Error al rechazar pago'
    } finally {
      loading.value = false
    }
  }

  return { pendingApprovals, loading, error, fetchPendingApprovals, approvePayout, rejectPayout }
})
