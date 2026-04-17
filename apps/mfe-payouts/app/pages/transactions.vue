<template>
  <div class="space-y-6">
    <div class="flex items-center justify-between">
      <h1 class="text-2xl font-bold text-gray-900">Transacciones Payouts</h1>
      <UButton
        icon="i-heroicons-arrow-down-tray"
        color="neutral"
        variant="soft"
        :loading="downloading"
        @click="handleDownload"
      >
        Descargar reporte
      </UButton>
    </div>

    <WFilterPanel
      :filters="filters"
      :schema="filterSchema"
      @update:filters="handleFiltersUpdate"
      @apply="fetchData"
      @reset="handleReset"
    />

    <WDataTable
      :columns="columns"
      :rows="tableRows"
      :loading="loading"
      :total="transactions.length"
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
    </WDataTable>
  </div>
</template>

<script setup lang="ts">
import { WDataTable, WFilterPanel, WStatusBadge, WCopyButton } from '@wompi/ui'
import { useApiClient } from '@wompi/api-client'
import type { PayoutTransaction } from '@wompi/types'

const api = useApiClient()

const page = ref(1)
const perPage = ref(20)
const loading = ref(false)
const downloading = ref(false)
const transactions = ref<PayoutTransaction[]>([])

const filters = reactive({
  status: '',
  date_from: '',
  date_to: '',
  amount_min: '',
  amount_max: '',
})

const filterSchema = [
  {
    key: 'status',
    label: 'Estado',
    type: 'select' as const,
    options: ['PENDING', 'APPROVED', 'REJECTED', 'COMPLETED'],
  },
  { key: 'date_from', label: 'Fecha desde', type: 'text' as const },
  { key: 'date_to', label: 'Fecha hasta', type: 'text' as const },
  { key: 'amount_min', label: 'Monto mínimo', type: 'text' as const },
  { key: 'amount_max', label: 'Monto máximo', type: 'text' as const },
]

const columns = [
  { key: 'id', label: 'ID' },
  { key: 'status', label: 'Estado' },
  { key: 'amount_in_cents', label: 'Monto' },
  { key: 'destination', label: 'Destino' },
  { key: 'created_at', label: 'Fecha' },
]

const tableRows = computed(() =>
  transactions.value.map((tx) => ({ ...tx }))
)

function handleFiltersUpdate(updated: Record<string, unknown>) {
  Object.assign(filters, updated)
}

function handleReset() {
  filters.status = ''
  filters.date_from = ''
  filters.date_to = ''
  filters.amount_min = ''
  filters.amount_max = ''
  fetchData()
}

async function fetchData() {
  loading.value = true
  page.value = 1
  try {
    const query: Record<string, string> = {}
    for (const [k, v] of Object.entries(filters)) {
      if (String(v).trim()) query[k] = String(v).trim()
    }
    const data = await api<{ data: PayoutTransaction[] }>('/payouts/transactions', { query })
    transactions.value = data.data || []
  } catch {
    transactions.value = []
  } finally {
    loading.value = false
  }
}

async function handleDownload() {
  downloading.value = true
  try {
    await api('/payouts/transactions/report', {
      query: { format: 'csv' },
      responseType: 'blob',
    })
  } finally {
    downloading.value = false
  }
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

onMounted(fetchData)
</script>
