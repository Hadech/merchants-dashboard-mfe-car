import { defineStore } from 'pinia'
import type { DashboardUser, CreateUserRequest } from '@wompi/types'
import { useApiClient } from '@wompi/api-client'

/**
 * Matches legacy api/users.js:
 * - getUsers(merchantId, filters) → GET /merchant-users/merchant/{merchantId}
 * - merchantId comes from sessionStorage.getItem('userPrincipalID')
 */
export const useUsersStore = defineStore('users', () => {
  const api = useApiClient()

  const users = ref<DashboardUser[]>([])
  const currentUser = ref<DashboardUser | null>(null)
  const loading = ref(false)
  const error = ref<string | null>(null)

  function getMerchantId(): string {
    return sessionStorage.getItem('userPrincipalID') || ''
  }

  /** GET /merchant-users/merchant/{merchantId} — legacy: getUsers(merchantId, filters) */
  async function fetchUsers(filters?: Record<string, unknown>) {
    loading.value = true
    error.value = null
    try {
      const merchantId = getMerchantId()
      const data = await api(`/merchant-users/merchant/${merchantId}`, {
        query: filters,
      })
      users.value = data.data?.merchantUsers || data.data || []
    } catch (e: unknown) {
      error.value = e instanceof Error ? e.message : 'Error al cargar usuarios'
    } finally {
      loading.value = false
    }
  }

  async function fetchUser(id: string) {
    loading.value = true
    error.value = null
    try {
      const merchantId = getMerchantId()
      const data = await api(`/merchant-users/merchant/${merchantId}`)
      const allUsers = data.data?.merchantUsers || data.data || []
      currentUser.value = allUsers.find((u: DashboardUser) => u.id === id) || null
      return currentUser.value
    } catch (e: unknown) {
      error.value = e instanceof Error ? e.message : 'Error al cargar usuario'
    } finally {
      loading.value = false
    }
  }

  async function createUser(payload: CreateUserRequest) {
    loading.value = true
    error.value = null
    try {
      const merchantId = getMerchantId()
      const data = await api(`/merchant-users/merchant/${merchantId}`, {
        method: 'POST',
        body: payload,
      })
      return data.data
    } catch (e: unknown) {
      error.value = e instanceof Error ? e.message : 'Error al crear usuario'
    } finally {
      loading.value = false
    }
  }

  async function updateUser(id: string, payload: Partial<CreateUserRequest>) {
    loading.value = true
    error.value = null
    try {
      const merchantId = getMerchantId()
      const data = await api(`/merchant-users/merchant/${merchantId}`, {
        method: 'PATCH',
        body: payload,
      })
      if (currentUser.value && currentUser.value.id === id) {
        Object.assign(currentUser.value, data.data)
      }
      return data.data
    } catch (e: unknown) {
      error.value = e instanceof Error ? e.message : 'Error al actualizar usuario'
    } finally {
      loading.value = false
    }
  }

  async function disableUser(id: string) {
    loading.value = true
    error.value = null
    try {
      const merchantId = getMerchantId()
      await api(`/merchant-users/merchant/${merchantId}`, {
        method: 'PATCH',
        body: { id, status: 'DISABLED' },
      })
      if (currentUser.value && currentUser.value.id === id) {
        currentUser.value.status = 'DISABLED'
      }
      const idx = users.value.findIndex(u => u.id === id)
      if (idx !== -1) users.value[idx].status = 'DISABLED'
    } catch (e: unknown) {
      error.value = e instanceof Error ? e.message : 'Error al deshabilitar usuario'
    } finally {
      loading.value = false
    }
  }

  return { users, currentUser, loading, error, fetchUsers, fetchUser, createUser, updateUser, disableUser }
})
