<template>
  <div class="space-y-6">
    <h1 class="text-2xl font-bold text-gray-900">Balances</h1>

    <!-- Balance Card -->
    <div class="bg-white rounded-lg border p-6 space-y-4 max-w-lg">
      <div v-if="store.loading" class="flex items-center justify-center h-24">
        <UIcon name="i-heroicons-arrow-path" class="animate-spin h-6 w-6 text-pink-500" />
      </div>

      <template v-else-if="store.balance">
        <div>
          <p class="text-sm text-gray-500">Balance disponible</p>
          <p class="text-3xl font-bold text-gray-900">
            {{ formatMoney(store.balance.available_amount, store.balance.currency) }}
          </p>
          <p class="text-xs text-gray-400 mt-1">{{ store.balance.currency }}</p>
        </div>

        <div class="border-t pt-4 flex items-center justify-between">
          <div>
            <p class="text-sm font-medium text-gray-700">Auto-pago</p>
            <p class="text-xs text-gray-500">
              {{ store.balance.auto_payment_enabled ? 'Activado' : 'Desactivado' }}
            </p>
          </div>
          <UToggle
            :model-value="store.balance.auto_payment_enabled"
            @update:model-value="handleToggleAutoPayment"
          />
        </div>
      </template>

      <div v-else class="text-sm text-gray-500">
        No se pudo cargar el balance.
      </div>

      <div v-if="store.error" class="text-sm text-red-600">{{ store.error }}</div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useBalancesStore } from '~/stores/balances'

const store = useBalancesStore()
const merchantId = computed(() => sessionStorage.getItem('userPrincipalID') || '')

function formatMoney(cents: number, currency: string) {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: currency || 'COP',
    minimumFractionDigits: 0,
  }).format(cents / 100)
}

async function handleToggleAutoPayment(value: boolean) {
  if (merchantId.value) {
    await store.toggleAutoPayment(merchantId.value, value)
  }
}

onMounted(() => {
  if (merchantId.value) {
    store.fetchBalance(merchantId.value)
  }
})
</script>
