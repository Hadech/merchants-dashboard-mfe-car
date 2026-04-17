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
      :total="store.transactions.length"
      :page="page"
      :per-page="perPage"
      @update:page="page = $event"
      @update:per-page="perPage = $event"
    >
      <template #cell-id="{ row }">
        <WCopyButton :text="row.id" :label="shortId(row.id)" />
      </template>
      <template #cell-amount_in_cents="{ row }">
        {{ formatMoney(row.amount_in_cents, row.currency) }}
      </template>
      <template #cell-status="{ row }">
        <WStatusBadge :status="row.status" />
      </template>
      <template #cell-created_at="{ row }">
        {{ formatDate(row.created_at) }}
      </template>
    </WDataTable>
  </div>
</template>

<script setup lang="ts">
import { WDataTable, WFilterPanel, WStatusBadge, WCopyButton } from '@wompi/ui'
import { useTransactionsStore } from '~/stores/transactions'
import { useTransactionsApi } from '~/composables/useTransactionsApi'

const store = useTransactionsStore()
const { downloadReport } = useTransactionsApi()
const router = useRouter()

const page = ref(1)
const perPage = ref(20)
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
    options: ['API', 'PAYMENT_LINK', 'CHECKOUT'],
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
    click: () => router.push(`/transactions/${tx.id}`),
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

async function fetchData() {
  page.value = 1
  await store.getReport()
}

async function handleDownload() {
  downloading.value = true
  try {
    await downloadReport(store.filters, 'csv')
  } finally {
    downloading.value = false
  }
}

function shortId(id: string) {
  return id.length > 8 ? `${id.slice(0, 8)}…` : id
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
