<template>
  <div class="space-y-6">
    <h1 class="text-2xl font-bold text-gray-900">Disputas</h1>

    <WDataTable
      :columns="columns"
      :rows="tableRows"
      :loading="store.loading"
      :total="store.disputes.length"
      :page="page"
      :per-page="perPage"
      @update:page="page = $event"
      @update:per-page="perPage = $event"
    >
      <template #cell-status="{ row }">
        <WStatusBadge :status="row.status" />
      </template>
      <template #cell-amount_in_cents="{ row }">
        {{ formatMoney(row.amount_in_cents, row.currency) }}
      </template>
      <template #cell-created_at="{ row }">
        {{ formatDate(row.created_at) }}
      </template>
      <template #cell-transaction_id="{ row }">
        <NuxtLink
          v-if="row.transaction_id"
          :to="`/transactions/${row.transaction_id}`"
          class="text-pink-600 hover:underline font-mono text-sm"
        >
          {{ shortId(row.transaction_id) }}
        </NuxtLink>
      </template>
    </WDataTable>
  </div>
</template>

<script setup lang="ts">
import { WDataTable, WStatusBadge } from '@wompi/ui'
import { useDisputesStore } from '~/stores/disputes'

const store = useDisputesStore()
const router = useRouter()

const page = ref(1)
const perPage = ref(20)

const columns = [
  { key: 'id', label: 'ID' },
  { key: 'status', label: 'Estado' },
  { key: 'amount_in_cents', label: 'Monto' },
  { key: 'created_at', label: 'Fecha' },
  { key: 'transaction_id', label: 'Transacción asociada' },
]

const tableRows = computed(() =>
  store.disputes.map((d) => ({
    ...d,
    click: () => router.push(`/disputes/${d.id}`),
  }))
)

function shortId(id: string) {
  return id.length > 8 ? `${id.slice(0, 8)}…` : id
}

function formatMoney(cents: number, currency: string) {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: currency || 'COP',
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

onMounted(() => store.fetchDisputes())
</script>
