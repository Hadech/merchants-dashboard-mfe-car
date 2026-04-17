<template>
  <div class="space-y-6">
    <div class="flex items-center justify-between">
      <h1 class="text-2xl font-bold text-gray-900">Payment Links</h1>
      <UButton
        icon="i-heroicons-plus"
        color="primary"
        @click="router.push('/payment-links/create')"
      >
        Crear link de pago
      </UButton>
    </div>

    <WDataTable
      :columns="columns"
      :rows="tableRows"
      :loading="store.loading"
      :total="store.paymentLinks.length"
      :page="page"
      :per-page="perPage"
      @update:page="page = $event"
      @update:per-page="perPage = $event"
    >
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
import { WDataTable, WStatusBadge } from '@wompi/ui'
import { usePaymentLinksStore } from '~/stores/paymentLinks'

const store = usePaymentLinksStore()
const router = useRouter()

const page = ref(1)
const perPage = ref(20)

const columns = [
  { key: 'name', label: 'Nombre' },
  { key: 'amount_in_cents', label: 'Monto' },
  { key: 'status', label: 'Estado' },
  { key: 'created_at', label: 'Fecha' },
]

const tableRows = computed(() =>
  store.paymentLinks.map((link) => ({
    ...link,
    click: () => router.push(`/payment-links/${link.id}`),
  }))
)

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

onMounted(() => store.fetchPaymentLinks())
</script>
