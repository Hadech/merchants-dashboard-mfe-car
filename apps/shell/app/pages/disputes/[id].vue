<template>
  <div class="space-y-6">
    <div class="flex items-center gap-3">
      <UButton
        icon="i-heroicons-arrow-left"
        variant="ghost"
        color="neutral"
        @click="router.push('/disputes')"
      />
      <h1 class="text-2xl font-bold text-gray-900">Detalle de disputa</h1>
    </div>

    <div v-if="loading" class="flex items-center justify-center h-64">
      <UIcon name="i-heroicons-arrow-path" class="animate-spin h-8 w-8 text-pink-500" />
    </div>

    <div v-else-if="error" class="text-center py-16">
      <UIcon name="i-heroicons-exclamation-triangle" class="h-12 w-12 text-red-500 mx-auto mb-4" />
      <p class="text-gray-600">{{ error }}</p>
      <UButton class="mt-4" @click="fetchDispute">Reintentar</UButton>
    </div>

    <template v-else-if="dispute">
      <!-- Dispute Info -->
      <div class="bg-white rounded-lg border p-6 space-y-4">
        <h2 class="text-lg font-semibold text-gray-800">Información de la disputa</h2>
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <InfoItem label="ID">
            <span class="font-mono text-sm">{{ dispute.id }}</span>
          </InfoItem>
          <InfoItem label="Estado">
            <WStatusBadge :status="dispute.status" />
          </InfoItem>
          <InfoItem label="Monto">
            {{ formatMoney(dispute.amount_in_cents, dispute.currency) }}
          </InfoItem>
          <InfoItem label="Razón">
            {{ dispute.reason }}
          </InfoItem>
          <InfoItem label="Fecha de creación">
            {{ formatDate(dispute.created_at) }}
          </InfoItem>
          <InfoItem label="Última actualización">
            {{ formatDate(dispute.updated_at) }}
          </InfoItem>
        </div>
      </div>

      <!-- Associated Transaction -->
      <div v-if="dispute.transaction" class="bg-white rounded-lg border p-6 space-y-4">
        <h2 class="text-lg font-semibold text-gray-800">Transacción asociada</h2>
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <InfoItem label="ID transacción">
            <NuxtLink
              :to="`/transactions/${dispute.transaction.id}`"
              class="text-pink-600 hover:underline font-mono text-sm"
            >
              {{ dispute.transaction.id }}
            </NuxtLink>
          </InfoItem>
          <InfoItem label="Referencia">
            <span class="font-mono text-sm">{{ dispute.transaction.reference }}</span>
          </InfoItem>
          <InfoItem label="Monto">
            {{ formatMoney(dispute.transaction.amount_in_cents, dispute.transaction.currency) }}
          </InfoItem>
          <InfoItem label="Estado">
            <WStatusBadge :status="dispute.transaction.status" />
          </InfoItem>
          <InfoItem label="Método de pago">
            {{ dispute.transaction.payment_method_type }}
          </InfoItem>
          <InfoItem label="Fecha">
            {{ formatDate(dispute.transaction.created_at) }}
          </InfoItem>
        </div>
      </div>

      <!-- Status Timeline -->
      <div class="bg-white rounded-lg border p-6 space-y-4">
        <h2 class="text-lg font-semibold text-gray-800">Timeline de estados</h2>
        <div class="space-y-3">
          <div
            v-for="(entry, idx) in timelineEntries"
            :key="idx"
            class="flex items-start gap-3"
          >
            <div
              class="w-3 h-3 mt-1 rounded-full shrink-0"
              :class="timelineDotColor(entry.status, idx === 0)"
            />
            <div>
              <div class="flex items-center gap-2">
                <WStatusBadge :status="entry.status" />
              </div>
              <p class="text-xs text-gray-500 mt-0.5">{{ formatDate(entry.date) }}</p>
              <p v-if="entry.description" class="text-sm text-gray-600 mt-0.5">
                {{ entry.description }}
              </p>
            </div>
          </div>
          <!-- Fallback if no timeline entries -->
          <div v-if="!timelineEntries.length" class="flex items-center gap-3">
            <div class="w-3 h-3 rounded-full bg-blue-500" />
            <div>
              <p class="text-sm font-medium">Creada</p>
              <p class="text-xs text-gray-500">{{ formatDate(dispute.created_at) }}</p>
            </div>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { WStatusBadge } from '@wompi/ui'
import { useDisputesApi } from '~/composables/useDisputesApi'
import type { Dispute, DisputeStatus } from '@wompi/types'

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
const { getDispute: fetchDisputeApi } = useDisputesApi()

const dispute = ref<Dispute | null>(null)
const loading = ref(false)
const error = ref<string | null>(null)

const timelineEntries = computed(() => dispute.value?.timeline ?? [])

function timelineDotColor(status: DisputeStatus, isLatest: boolean) {
  if (isLatest) {
    const colors: Record<DisputeStatus, string> = {
      OPEN: 'bg-blue-500',
      UNDER_REVIEW: 'bg-yellow-500 animate-pulse',
      WON: 'bg-green-500',
      LOST: 'bg-red-500',
      EXPIRED: 'bg-gray-400',
    }
    return colors[status] || 'bg-gray-400'
  }
  return 'bg-gray-300'
}

async function fetchDispute() {
  const id = route.params.id as string
  loading.value = true
  error.value = null
  try {
    const response = await fetchDisputeApi(id)
    dispute.value = response.data
  } catch (e: unknown) {
    error.value = e instanceof Error ? e.message : 'Error al cargar la disputa'
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

onMounted(fetchDispute)
</script>
