import { defineStore } from 'pinia'
import type { UserRole, Permission } from '@wompi/types'
import { useApiClient } from '@wompi/api-client'

export interface CreateRoleRequest {
  name: string
  permissions: string[] // permission IDs
}

export const useRolesStore = defineStore('roles', () => {
  const api = useApiClient()

  const roles = ref<UserRole[]>([])
  const currentRole = ref<UserRole | null>(null)
  const availablePermissions = ref<Permission[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  async function fetchRoles() {
    loading.value = true
    error.value = null
    try {
      const data = await api('/roles')
      roles.value = data.data || []
    } catch (e: unknown) {
      error.value = e instanceof Error ? e.message : 'Error al cargar roles'
    } finally {
      loading.value = false
    }
  }

  async function fetchRole(id: string) {
    loading.value = true
    error.value = null
    try {
      const data = await api(`/roles/${id}`)
      currentRole.value = data.data || null
      return currentRole.value
    } catch (e: unknown) {
      error.value = e instanceof Error ? e.message : 'Error al cargar rol'
    } finally {
      loading.value = false
    }
  }

  async function fetchPermissions() {
    try {
      const data = await api('/permissions')
      availablePermissions.value = data.data || []
    } catch (e: unknown) {
      error.value = e instanceof Error ? e.message : 'Error al cargar permisos'
    }
  }

  async function createRole(payload: CreateRoleRequest) {
    loading.value = true
    error.value = null
    try {
      const data = await api('/roles', { method: 'POST', body: payload })
      return data.data
    } catch (e: unknown) {
      error.value = e instanceof Error ? e.message : 'Error al crear rol'
    } finally {
      loading.value = false
    }
  }

  async function updateRole(id: string, payload: Partial<CreateRoleRequest>) {
    loading.value = true
    error.value = null
    try {
      const data = await api(`/roles/${id}`, { method: 'PATCH', body: payload })
      if (currentRole.value && currentRole.value.id === id) {
        Object.assign(currentRole.value, data.data)
      }
      return data.data
    } catch (e: unknown) {
      error.value = e instanceof Error ? e.message : 'Error al actualizar rol'
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
    fetchRoles, fetchRole, fetchPermissions, createRole, updateRole,
  }
})
