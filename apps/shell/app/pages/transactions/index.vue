<template>
  <div class="space-y-6">
    <div class="flex items-center justify-between">
      <h1 class="text-2xl font-bold text-gray-900">Transacciones</h1>
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

    <!-- Date Range -->
    <div class="flex items-end gap-4 bg-white rounded-lg border p-4">
      <div>
        <label class="block text-xs font-medium text-gray-600 mb-1">Desde</label>
        <UInput v-model="store.fromDate" type="date" />
      </div>
      <div>
        <label class="block text-xs font-medium text-gray-600 mb-1">Hasta</label>
        <UInput v-model="store.untilDate" type="date" />
      </div>
      <UButton color="primary" @click="fetchData">Buscar</UButton>
    </div>

    <WFilterPanel
      :filters="store.filters"
      :schema="filterSchema"
      @update:filters="handleFiltersUpdate"
      @apply="fetchData"
      @reset="handleReset"
    />

    <WDataTable
      :columns="columns"
      :rows="tableRows"
      :loading="store.loading"
      :total="store.totalResults"
      :page="store.page"
      :per-page="store.pageSize"
      @update:page="handlePageChange"
      @update:per-page="handlePerPageChange"
    />

    <div v-if="store.error" class="text-sm text-red-600 bg-red-50 p-3 rounded-lg">
      {{ store.error }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { WDataTable, WFilterPanel } from '@wompi/ui'
import { useTransactionsStore } from '~/stores/transactions'

const store = useTransactionsStore()
const router = useRouter()
const downloading = ref(false)

const filterSchema = [
  { key: 'id', label: 'ID transacción', type: 'text' as const },
  { key: 'reference', label: 'Referencia', type: 'text' as const },
  { key: 'customer_email', label: 'Email cliente', type: 'text' as const },
  {
    key: 'status',
    label: 'Estado',
    type: 'select' as const,
    options: ['APPROVED', 'DECLINED', 'VOIDED', 'ERROR', 'PENDING'],
  },
  {
    key: 'payment_method_type',
    label: 'Método de pago',
    type: 'select' as const,
    options: ['CARD', 'NEQUI', 'PSE', 'BANCOLOMBIA_TRANSFER', 'BANCOLOMBIA_COLLECT'],
  },
  {
    key: 'source_channel',
    label: 'Canal',
    type: 'select' as const,
    options: ['VENTA_PRESENTE', 'WEB', 'POS_TERMINAL'],
  },
]

const columns = [
  { key: 'id', label: 'ID' },
  { key: 'reference', label: 'Referencia' },
  { key: 'amount_in_cents', label: 'Monto' },
  { key: 'payment_method_type', label: 'Método de pago' },
  { key: 'status', label: 'Estado' },
  { key: 'source_channel', label: 'Canal' },
  { key: 'created_at', label: 'Fecha' },
]

const tableRows = computed(() => {
  return store.transactions.map((tx) => ({
    ...tx,
    id: String(tx.id).slice(0, 8) + '…',
    _fullId: tx.id,
    amount_in_cents: formatMoney(tx.amount_in_cents, tx.currency),
    created_at: formatDate(tx.created_at),
  }))
})

function handleFiltersUpdate(filters: Record<string, unknown>) {
  for (const [key, value] of Object.entries(filters)) {
    store.setFilter(key as keyof typeof store.filters, value as string)
  }
}

function handleReset() {
  store.filters.id = ''
  store.filters.reference = ''
  store.filters.customer_email = ''
  store.filters.status = ''
  store.filters.payment_method_type = ''
  store.filters.source_channel = ''
  store.filters.is_strict_payment_method_type = false
  fetchData()
}

function handlePageChange(newPage: number) {
  store.page = newPage
  store.getTransactions()
}

function handlePerPageChange(newSize: number) {
  store.pageSize = newSize
  store.page = 1
  store.getTransactions()
}

async function fetchData() {
  store.page = 1
  await store.getTransactions()
}

async function handleDownload() {
  downloading.value = true
  try {
    await store.downloadReport()
  } finally {
    downloading.value = false
  }
}

function formatMoney(cents: number, currency: string) {
  const amount = cents / 100
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: currency || 'COP',
    minimumFractionDigits: 0,
  }).format(amount)
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
