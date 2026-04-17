import { defineStore } from 'pinia'
import type { UserRole, Permission } from '@wompi/types'
import { useApiClient } from '@wompi/api-client'

export interface CreateRoleRequest {
  name: string
  permissions: string[]
}

/**
 * Matches legacy api/roles.js:
 * - getAvailableRoles(merchantID, filters) → GET /merchant-users/merchant/{merchantID}/roles
 * - getRoleBlueprint(merchantID) → GET /merchant-users/merchant/{merchantID}/role
 * - getRole({ merchantID, roleID }) → GET /merchant-users/merchant/{merchantID}/role/{roleID}
 * - createNewRole({ data, merchantID }) → POST /merchant-users/merchant/{merchantID}/role
 * - updateRole({ data, merchantID, roleID }) → PATCH /merchant-users/merchant/{merchantID}/role/{roleID}
 * - dropRole({ roleID, merchantID }) → DELETE /merchant-users/merchant/{merchantID}/role/{roleID}
 */
export const useRolesStore = defineStore('roles', () => {
  const api = useApiClient()

  const roles = ref<UserRole[]>([])
  const currentRole = ref<UserRole | null>(null)
  const availablePermissions = ref<Permission[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  function getMerchantId(): string {
    return sessionStorage.getItem('userPrincipalID') || ''
  }

  /** GET /merchant-users/merchant/{merchantId}/roles — legacy: getAvailableRoles */
  async function fetchRoles(filters?: Record<string, unknown>) {
    loading.value = true
    error.value = null
    try {
      const merchantId = getMerchantId()
      const data = await api(`/merchant-users/merchant/${merchantId}/roles`, {
        query: filters,
      })
      roles.value = data.data || []
    } catch (e: unknown) {
      error.value = e instanceof Error ? e.message : 'Error al cargar roles'
    } finally {
      loading.value = false
    }
  }

  /** GET /merchant-users/merchant/{merchantId}/role/{roleId} — legacy: getRole */
  async function fetchRole(roleId: string) {
    loading.value = true
    error.value = null
    try {
      const merchantId = getMerchantId()
      const data = await api(`/merchant-users/merchant/${merchantId}/role/${roleId}`)
      currentRole.value = data.data || null
      return currentRole.value
    } catch (e: unknown) {
      error.value = e instanceof Error ? e.message : 'Error al cargar rol'
    } finally {
      loading.value = false
    }
  }

  /** GET /merchant-users/merchant/{merchantId}/role — legacy: getRoleBlueprint */
  async function fetchPermissions() {
    try {
      const merchantId = getMerchantId()
      const data = await api(`/merchant-users/merchant/${merchantId}/role`)
      availablePermissions.value = data.data || []
    } catch (e: unknown) {
      error.value = e instanceof Error ? e.message : 'Error al cargar permisos'
    }
  }

  /** POST /merchant-users/merchant/{merchantId}/role — legacy: createNewRole */
  async function createRole(payload: CreateRoleRequest) {
    loading.value = true
    error.value = null
    try {
      const merchantId = getMerchantId()
      const data = await api(`/merchant-users/merchant/${merchantId}/role`, {
        method: 'POST',
        body: payload,
      })
      return data.data
    } catch (e: unknown) {
      error.value = e instanceof Error ? e.message : 'Error al crear rol'
    } finally {
      loading.value = false
    }
  }

  /** PATCH /merchant-users/merchant/{merchantId}/role/{roleId} — legacy: updateRole */
  async function updateRole(roleId: string, payload: Partial<CreateRoleRequest>) {
    loading.value = true
    error.value = null
    try {
      const merchantId = getMerchantId()
      const data = await api(`/merchant-users/merchant/${merchantId}/role/${roleId}`, {
        method: 'PATCH',
        body: payload,
      })
      if (currentRole.value && currentRole.value.id === roleId) {
        Object.assign(currentRole.value, data.data)
      }
      return data.data
    } catch (e: unknown) {
      error.value = e instanceof Error ? e.message : 'Error al actualizar rol'
    } finally {
      loading.value = false
    }
  }

  /** DELETE /merchant-users/merchant/{merchantId}/role/{roleId} — legacy: dropRole */
  async function deleteRole(roleId: string) {
    loading.value = true
    error.value = null
    try {
      const merchantId = getMerchantId()
      await api(`/merchant-users/merchant/${merchantId}/role/${roleId}`, {
        method: 'DELETE',
      })
      roles.value = roles.value.filter(r => r.id !== roleId)
    } catch (e: unknown) {
      error.value = e instanceof Error ? e.message : 'Error al eliminar rol'
    } finally {
      loading.value = false
    }
  }

  const permissionsByModule = computed(() => {
    const grouped: Record<string, Permission[]> = {}
    for (const perm of availablePermissions.value) {
      if (!grouped[perm.module]) grouped[perm.module] = []
      grouped[perm.module].push(perm)
    }
    return grouped
  })

  return {
    roles, currentRole, availablePermissions, permissionsByModule,
    loading, error,
    fetchRoles, fetchRole, fetchPermissions, createRole, updateRole, deleteRole,
  }
})
