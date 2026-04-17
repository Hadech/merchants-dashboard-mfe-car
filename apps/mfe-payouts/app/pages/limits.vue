<template>
  <div class="space-y-6">
    <h1 class="text-2xl font-bold text-gray-900">Límites de dispersión</h1>

    <div v-if="loading" class="flex items-center justify-center h-32">
      <UIcon name="i-heroicons-arrow-path" class="animate-spin h-6 w-6 text-pink-500" />
    </div>

    <div v-else-if="limits" class="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl">
      <div class="bg-white rounded-lg border p-5">
        <p class="text-sm text-gray-500">Límite por transacción</p>
        <p class="text-2xl font-bold text-gray-900">{{ formatMoney(limits.per_transaction) }}</p>
      </div>
      <div class="bg-white rounded-lg border p-5">
        <p class="text-sm text-gray-500">Límite diario</p>
        <p class="text-2xl font-bold text-gray-900">{{ formatMoney(limits.daily) }}</p>
      </div>
      <div class="bg-white rounded-lg border p-5">
        <p class="text-sm text-gray-500">Límite mensual</p>
        <p class="text-2xl font-bold text-gray-900">{{ formatMoney(limits.monthly) }}</p>
      </div>
      <div class="bg-white rounded-lg border p-5">
        <p class="text-sm text-gray-500">Requiere aprobación desde</p>
        <p class="text-2xl font-bold text-gray-900">{{ formatMoney(limits.approval_threshold) }}</p>
      </div>
    </div>

    <div v-else class="text-center py-12">
      <p class="text-gray-500">No se pudieron cargar los límites de dispersión.</p>
      <UButton class="mt-3" variant="soft" @click="fetchLimits">Reintentar</UButton>
    </div>
  </div>
</template>

<script setup lang="ts">
import { usePayoutsApi } from '~/composables/usePayoutsApi'

interface PayoutLimits {
  per_transaction: number
  daily: number
  monthly: number
  approval_threshold: number
}

const { getLimits } = usePayoutsApi()

const loading = ref(false)
const limits = ref<PayoutLimits | null>(null)

function formatMoney(cents: number) {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0,
  }).format(cents / 100)
}

async function fetchLimits() {
  loading.value = true
  try {
    const data = await getLimits()
    limits.value = (data as { data: PayoutLimits }).data || null
  } catch {
    limits.value = null
  } finally {
    loading.value = false
  }
}

onMounted(fetchLimits)
</script>
