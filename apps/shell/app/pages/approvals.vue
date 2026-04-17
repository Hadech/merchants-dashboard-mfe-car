<template>
  <div class="space-y-6">
    <h1 class="text-2xl font-bold text-gray-900">Aprobaciones pendientes</h1>

    <div v-if="store.error" class="text-sm text-red-600">{{ store.error }}</div>

    <WDataTable
      :columns="columns"
      :rows="tableRows"
      :loading="store.loading"
      :total="store.pendingApprovals.length"
      :page="page"
      :per-page="perPage"
      @update:page="page = $event"
      @update:per-page="perPage = $event"
    >
      <template #cell-id="{ row }">
        <WCopyButton :text="row.id" :label="shortId(row.id)" />
      </template>
      <template #cell-status="{ row }">
        <WStatusBadge :status="row.status" />
      </template>
      <template #cell-amount_in_cents="{ row }">
        {{ formatMoney(row.amount_in_cents) }}
      </template>
      <template #cell-created_at="{ row }">
        {{ formatDate(row.created_at) }}
      </template>
      <template #cell-destination="{ row }">
        {{ row.destination?.bank_name || '—' }} · {{ row.destination?.account_number || '' }}
      </template>
      <template #cell-actions="{ row }">
        <div class="flex gap-2">
          <UButton
            size="xs"
            color="primary"
            :loading="store.loading"
            @click="handleApprove(row.id)"
          >
            Aprobar
          </UButton>
          <UButton
            size="xs"
            color="error"
            variant="soft"
            :loading="store.loading"
            @click="handleReject(row.id)"
          >
            Rechazar
          </UButton>
        </div>
      </template>
    </WDataTable>

    <div v-if="!store.loading && store.pendingApprovals.length === 0" class="text-center py-12">
      <UIcon name="i-heroicons-check-circle" class="h-12 w-12 text-green-400 mx-auto mb-3" />
      <p class="text-gray-500">No hay pagos pendientes de aprobación</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { WDataTable, WStatusBadge, WCopyButton } from '@wompi/ui'
import { useApprovalsStore } from '~/stores/approvals'

const store = useApprovalsStore()

const page = ref(1)
const perPage = ref(20)

const columns = [
  { key: 'id', label: 'ID' },
  { key: 'amount_in_cents', label: 'Monto' },
  { key: 'destination', label: 'Destino' },
  { key: 'created_at', label: 'Fecha' },
  { key: 'status', label: 'Estado' },
  { key: 'actions', label: 'Acciones' },
]

const tableRows = computed(() =>
  store.pendingApprovals.map((p) => ({ ...p }))
)

async function handleApprove(id: string) {
  await store.approvePayout(id)
}

async function handleReject(id: string) {
  await store.rejectPayout(id)
}

function shortId(id: string) {
  return id.length > 8 ? `${id.slice(0, 8)}…` : id
}

function formatMoney(cents: number) {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0,
  }).format(cents / 100)
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('es-CO', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

onMounted(() => store.fetchPendingApprovals())
</script>
