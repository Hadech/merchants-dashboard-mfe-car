<template>
  <div class="space-y-6">
    <div class="flex items-center gap-3">
      <UButton
        icon="i-heroicons-arrow-left"
        variant="ghost"
        color="neutral"
        @click="router.push('/payment-links')"
      />
      <h1 class="text-2xl font-bold text-gray-900">Detalle del link de pago</h1>
    </div>

    <div v-if="loading" class="flex items-center justify-center h-64">
      <UIcon name="i-heroicons-arrow-path" class="animate-spin h-8 w-8 text-pink-500" />
    </div>

    <div v-else-if="error" class="text-center py-16">
      <UIcon name="i-heroicons-exclamation-triangle" class="h-12 w-12 text-red-500 mx-auto mb-4" />
      <p class="text-gray-600">{{ error }}</p>
      <UButton class="mt-4" @click="fetchLink">Reintentar</UButton>
    </div>

    <template v-else-if="link">
      <!-- Link Info -->
      <div class="bg-white rounded-lg border p-6 space-y-4">
        <h2 class="text-lg font-semibold text-gray-800">Información del link</h2>
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <InfoItem label="Nombre">{{ link.name }}</InfoItem>
          <InfoItem label="Estado">
            <WStatusBadge :status="link.status" />
          </InfoItem>
          <InfoItem label="Monto">
            {{ formatMoney(link.amount_in_cents, link.currency) }}
          </InfoItem>
          <InfoItem v-if="link.description" label="Descripción">
            {{ link.description }}
          </InfoItem>
          <InfoItem label="Fecha de creación">
            {{ formatDate(link.created_at) }}
          </InfoItem>
          <InfoItem v-if="link.expires_at" label="Fecha de expiración">
            {{ formatDate(link.expires_at) }}
          </InfoItem>
          <InfoItem label="Transacciones">
            {{ link.transactions_count }}
          </InfoItem>
        </div>
      </div>

      <!-- URL -->
      <div class="bg-white rounded-lg border p-6 space-y-3">
        <h2 class="text-lg font-semibold text-gray-800">URL del link</h2>
        <div class="flex items-center gap-2 bg-gray-50 rounded p-3">
          <code class="text-sm text-gray-900 break-all flex-1">{{ link.url }}</code>
          <WCopyButton :text="link.url" label="Copiar" />
        </div>
      </div>

      <!-- Associated Transactions -->
      <div class="bg-white rounded-lg border p-6 space-y-4">
        <h2 class="text-lg font-semibold text-gray-800">Transacciones asociadas</h2>
        <div v-if="transactions.length === 0" class="text-sm text-gray-500 py-4 text-center">
          No hay transacciones asociadas a este link
        </div>
        <WDataTable
          v-else
          :columns="txColumns"
          :rows="txRows"
          :loading="false"
          :total="transactions.length"
          :page="txPage"
          :per-page="10"
          @update:page="txPage = $event"
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
  </div>
</template>

<script setup lang="ts">
import { WStatusBadge, WCopyButton, WDataTable } from '@wompi/ui'
import { usePaymentLinksApi } from '~/composables/usePaymentLinksApi'
import { useTransactionsApi } from '~/composables/useTransactionsApi'
import type { PaymentLink, Transaction } from '@wompi/types'

const InfoItem = defineComponent({
  props: { label: { type: String, required: true } },
  setup(props, { slots }) {
    return () =>
      h('div', [
        h('p', { class: 'text-xs font-medium text-gray-500 mb-1' }, props.label),
        h('div', { class: 'text-sm text-gray-900' }, slots.default?.()),
      ])
  },
})

const route = useRoute()
const router = useRouter()
const { getPaymentLink } = usePaymentLinksApi()
const { getTransactions } = useTransactionsApi()

const link = ref<PaymentLink | null>(null)
const transactions = ref<Transaction[]>([])
const loading = ref(false)
const error = ref<string | null>(null)
const txPage = ref(1)

const txColumns = [
  { key: 'id', label: 'ID' },
  { key: 'reference', label: 'Referencia' },
  { key: 'amount_in_cents', label: 'Monto' },
  { key: 'status', label: 'Estado' },
  { key: 'created_at', label: 'Fecha' },
]

const txRows = computed(() =>
  transactions.value.map((tx) => ({
    ...tx,
    click: () => router.push(`/transactions/${tx.id}`),
  }))
)

async function fetchLink() {
  const id = route.params.id as string
  loading.value = true
  error.value = null
  try {
    const response = await getPaymentLink(id)
    link.value = response.data

    // Fetch associated transactions
    try {
      const txResponse = await getTransactions({ source_channel: 'PAYMENT_LINK' })
      transactions.value = txResponse.data || []
    } catch {
      transactions.value = []
    }
  } catch (e: unknown) {
    error.value = e instanceof Error ? e.message : 'Error al cargar el link de pago'
  } finally {
    loading.value = false
  }
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

onMounted(fetchLink)
</script>
