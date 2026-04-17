<template>
  <div class="space-y-6">
    <div class="flex items-center justify-between">
      <h1 class="text-2xl font-bold text-gray-900">Usuarios</h1>
      <UButton color="primary" icon="i-heroicons-plus" @click="navigateTo('/users/create')">
        Crear usuario
      </UButton>
    </div>

    <WDataTable
      :columns="columns"
      :rows="tableRows"
      :loading="store.loading"
      :total="store.users.length"
      :page="page"
      :per-page="perPage"
      @update:page="page = $event"
      @update:per-page="perPage = $event"
    >
      <template #cell-status="{ row }">
        <WStatusBadge :status="row.status" />
      </template>
      <template #cell-role="{ row }">
        <span class="text-sm text-gray-700">{{ row.role?.name || '—' }}</span>
      </template>
      <template #cell-created_at="{ row }">
        {{ formatDate(row.created_at) }}
      </template>
    </WDataTable>

    <div v-if="store.error" class="text-sm text-red-600">{{ store.error }}</div>
  </div>
</template>

<script setup lang="ts">
import { WDataTable, WStatusBadge } from '@wompi/ui'
import { useUsersStore } from '~/stores/users'

const store = useUsersStore()
const router = useRouter()

const page = ref(1)
const perPage = ref(20)

const columns = [
  { key: 'name', label: 'Nombre' },
  { key: 'email', label: 'Email' },
  { key: 'role', label: 'Rol' },
  { key: 'status', label: 'Estado' },
  { key: 'created_at', label: 'Fecha creación' },
]

const tableRows = computed(() => {
  return store.users.map((user) => ({
    ...user,
    click: () => router.push(`/users/${user.id}`),
  }))
})

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('es-CO', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

onMounted(() => {
  store.fetchUsers()
})
</script>
