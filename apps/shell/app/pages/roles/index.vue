<template>
  <div class="space-y-6">
    <div class="flex items-center justify-between">
      <h1 class="text-2xl font-bold text-gray-900">Roles</h1>
      <UButton color="primary" icon="i-heroicons-plus" @click="navigateTo('/roles/create')">
        Crear rol
      </UButton>
    </div>

    <WDataTable
      :columns="columns"
      :rows="tableRows"
      :loading="store.loading"
      :total="store.roles.length"
      :page="page"
      :per-page="perPage"
      @update:page="page = $event"
      @update:per-page="perPage = $event"
    >
      <template #cell-permissions="{ row }">
        <span class="text-sm text-gray-500">{{ row.permissions?.length || 0 }} permisos</span>
      </template>
    </WDataTable>

    <div v-if="store.error" class="text-sm text-red-600">{{ store.error }}</div>
  </div>
</template>

<script setup lang="ts">
import { WDataTable } from '@wompi/ui'
import { useRolesStore } from '~/stores/roles'

const store = useRolesStore()
const router = useRouter()

const page = ref(1)
const perPage = ref(20)

const columns = [
  { key: 'name', label: 'Nombre del rol' },
  { key: 'permissions', label: 'Permisos' },
]

const tableRows = computed(() => {
  return store.roles.map((role) => ({
    ...role,
    click: () => router.push(`/roles/${role.id}`),
  }))
})

onMounted(() => {
  store.fetchRoles()
})
</script>
