<template>
  <div class="space-y-6">
    <div class="flex items-center gap-3">
      <UButton
        icon="i-heroicons-arrow-left"
        variant="ghost"
        color="neutral"
        @click="router.push('/transactions')"
      />
      <h1 class="text-2xl font-bold text-gray-900">Detalle de transacción</h1>
    </div>

    <div v-if="loading" class="flex items-center justify-center h-64">
      <UIcon name="i-heroicons-arrow-path" class="animate-spin h-8 w-8 text-pink-500" />
    </div>

    <div v-else-if="error" class="text-center py-16">
      <UIcon name="i-heroicons-exclamation-triangle" class="h-12 w-12 text-red-500 mx-auto mb-4" />
      <p class="text-gray-600">{{ error }}</p>
      <UButton class="mt-4" @click="fetchTransaction">Reintentar</UButton>
    </div>

    <template v-else-if="transaction">
      <!-- Transaction Info -->
      <div class="bg-white rounded-lg border p-6 space-y-4">
        <h2 class="text-lg font-semibold text-gray-800">Información de la transacción</h2>
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <InfoItem label="ID">
            <div class="flex items-center gap-1">
              <span class="font-mono text-sm">{{ transaction.id }}</span>
              <WCopyButton :text="transaction.id" label="" />
            </div>
          </InfoItem>
          <InfoItem label="Referencia">
            <span class="font-mono text-sm">{{ transaction.reference }}</span>
          </InfoItem>
          <InfoItem label="Monto">
            {{ formatMoney(transaction.amount_in_cents, transaction.currency) }}
          </InfoItem>
          <InfoItem label="Estado">
            <WStatusBadge :status="transaction.status" />
          </InfoItem>
          <InfoItem label="Canal de origen">
            {{ transaction.source_channel }}
          </InfoItem>
          <InfoItem label="Fecha de creación">
            {{ formatDate(transaction.created_at) }}
          </InfoItem>
          <InfoItem v-if="transaction.finalized_at" label="Fecha de finalización">
            {{ formatDate(transaction.finalized_at) }}
          </InfoItem>
        </div>
      </div>

      <!-- Payment Method -->
      <div class="bg-white rounded-lg border p-6 space-y-4">
        <h2 class="text-lg font-semibold text-gray-800">Método de pago</h2>
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <InfoItem label="Tipo">
            {{ transaction.payment_method_type }}
          </InfoItem>
          <template v-if="transaction.payment_method?.extra">
            <InfoItem
              v-for="(value, key) in transaction.payment_method.extra"
              :key="String(key)"
              :label="formatLabel(String(key))"
            >
              {{ value }}
            </InfoItem>
          </template>
        </div>
      </div>

      <!-- Status Timeline -->
      <div class="bg-white rounded-lg border p-6 space-y-4">
        <h2 class="text-lg font-semibold text-gray-800">Timeline de estados</h2>
        <div class="space-y-3">
          <div class="flex items-center gap-3">
            <div class="w-3 h-3 rounded-full bg-blue-500" />
            <div>
              <p class="text-sm font-medium">Creada</p>
              <p class="text-xs text-gray-500">{{ formatDate(transaction.created_at) }}</p>
            </div>
          </div>
          <div v-if="transaction.status === 'PENDING'" class="flex items-center gap-3">
            <div class="w-3 h-3 rounded-full bg-yellow-500 animate-pulse" />
            <div>
              <p class="text-sm font-medium">Pendiente</p>
              <p class="text-xs text-gray-500">En proceso</p>
            </div>
          </div>
          <div v-if="transaction.finalized_at" class="flex items-center gap-3">
            <div
              class="w-3 h-3 rounded-full"
              :class="transaction.status === 'APPROVED' ? 'bg-green-500' : 'bg-red-500'"
            />
            <div>
              <p class="text-sm font-medium">
                <WStatusBadge :status="transaction.status" />
              </p>
              <p class="text-xs text-gray-500">{{ formatDate(transaction.finalized_at) }}</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Customer Data -->
      <div v-if="transaction.customer_email" class="bg-white rounded-lg border p-6 space-y-4">
        <h2 class="text-lg font-semibold text-gray-800">Datos del cliente</h2>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <InfoItem label="Email">
            {{ transaction.customer_email }}
          </InfoItem>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { WStatusBadge, WCopyButton } from '@wompi/ui'
import { useTransactionsApi } from '~/composables/useTransactionsApi'
import type { Transaction } from '@wompi/types'

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
const { getTransaction } = useTransactionsApi()

const transaction = ref<Transaction | null>(null)
const loading = ref(false)
const error = ref<string | null>(null)

async function fetchTransaction() {
  const id = route.params.id as string
  loading.value = true
  error.value = null
  try {
    const response = await getTransaction(id)
    transaction.value = response.data
  } catch (e: unknown) {
    error.value = e instanceof Error ? e.message : 'Error al cargar la transacción'
  } finally {
    loading.value = false
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

function formatLabel(key: string) {
  return key.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())
}

onMounted(fetchTransaction)
</script>
