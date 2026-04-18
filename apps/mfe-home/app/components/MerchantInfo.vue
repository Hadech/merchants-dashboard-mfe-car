<script setup lang="ts">
import type { Merchant, Balance } from '@wompi/types'

interface Props {
  merchant: Merchant
  balance: Balance | null
  isSandbox: boolean
}

const props = defineProps<Props>()

function formatCurrency(amountInCents: number): string {
  const amount = amountInCents / 100
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}
</script>

<template>
  <div class="merchant-info">
    <div class="merchant-header">
      <h1 class="merchant-name">{{ props.merchant.name }}</h1>
      <span class="merchant-id">ID: {{ props.merchant.id }}</span>
      <span :class="['merchant-status', { active: props.merchant.active }]">
        {{ props.merchant.active ? 'Activo' : 'Inactivo' }}
      </span>
    </div>
    <div v-if="props.balance && !props.isSandbox" class="merchant-balance">
      <span class="balance-label">Saldo disponible</span>
      <strong class="balance-amount">{{ formatCurrency(props.balance.available) }}</strong>
    </div>
  </div>
</template>

<style scoped>
.merchant-info {
  padding: 1rem 0;
}

.merchant-header {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
}

.merchant-name {
  font-size: 1.5rem;
  font-weight: 700;
  color: #2a2c29;
  margin: 0;
}

.merchant-id {
  font-size: 0.85rem;
  color: #616161;
}

.merchant-status {
  font-size: 0.75rem;
  padding: 2px 8px;
  border-radius: 4px;
  background-color: #e0e0e0;
  color: #616161;
}

.merchant-status.active {
  background-color: #b0f2ae;
  color: #1b5e20;
}

.merchant-balance {
  margin-top: 12px;
  display: flex;
  align-items: center;
  gap: 8px;
}

.balance-label {
  font-size: 0.9rem;
  color: #616161;
}

.balance-amount {
  font-size: 1.1rem;
  color: #2a2c29;
}
</style>
