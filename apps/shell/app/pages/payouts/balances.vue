<template>
  <div class="balances-page">
    <!-- View Title Bar -->
    <div class="view-title-bar">
      <div class="view-title-bar__container">
        <span class="view-title-bar__text">Pagos a terceros</span>
      </div>
    </div>

    <!-- Content -->
    <div class="balances-content">
      <!-- Loading -->
      <div v-if="store.loading && !store.balance" class="loading-state">
        <UIcon name="i-heroicons-arrow-path" class="animate-spin text-xl text-gray-400" />
        <span>Cargando saldos...</span>
      </div>

      <!-- Balance info -->
      <template v-else-if="store.balance">
        <!-- Balance cards row -->
        <div class="balance-cards-row">
          <WBalanceCard
            icon="wallet"
            title="Saldo disponible"
            :amount="formatMoney(store.balance.available_amount)"
            :currency="store.balance.currency || 'COP'"
          />
          <WBalanceCard
            icon="clock"
            title="Saldo pendiente"
            :amount="formatMoney(store.balance.pending_amount || 0)"
            :currency="store.balance.currency || 'COP'"
          />
          <WBalanceCard
            icon="files-money"
            title="Total desembolsado"
            :amount="formatMoney(store.balance.disbursed_amount || 0)"
            :currency="store.balance.currency || 'COP'"
          />
        </div>

        <!-- Auto-payment section -->
        <div class="autopayment-section">
          <div class="autopayment-card">
            <div class="autopayment-card__header">
              <div class="autopayment-card__icon">
                <UIcon name="i-heroicons-arrow-path-rounded-square" />
              </div>
              <div class="autopayment-card__info">
                <span class="autopayment-card__title">Auto-pago</span>
                <span class="autopayment-card__description">
                  Activa el auto-pago para recibir tus desembolsos automáticamente en tu cuenta bancaria registrada.
                </span>
              </div>
            </div>
            <div class="autopayment-card__toggle">
              <span class="autopayment-card__status" :class="{ active: store.balance.auto_payment_enabled }">
                {{ store.balance.auto_payment_enabled ? 'Activado' : 'Desactivado' }}
              </span>
              <USwitch
                :model-value="store.balance.auto_payment_enabled"
                :loading="toggling"
                @update:model-value="handleToggleAutoPayment"
              />
            </div>
          </div>
        </div>

        <!-- Limits section -->
        <div v-if="store.limits" class="limits-section">
          <h3 class="section-title">Límites de transacción</h3>
          <div class="limits-card">
            <div class="limits-row">
              <span class="limits-label">Monto mínimo por transacción</span>
              <span class="limits-value">{{ formatMoney(store.limits.min_amount || 0) }} COP</span>
            </div>
            <div class="limits-row">
              <span class="limits-label">Monto máximo por transacción</span>
              <span class="limits-value">{{ formatMoney(store.limits.max_amount || 0) }} COP</span>
            </div>
          </div>
        </div>
      </template>

      <!-- Error state -->
      <div v-else-if="store.error" class="error-state">
        <UIcon name="i-heroicons-exclamation-triangle" class="text-red-400 text-2xl" />
        <p>{{ store.error }}</p>
        <UButton variant="outline" color="neutral" @click="loadData">
          Reintentar
        </UButton>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useBalancesStore } from '~/stores/balances'

const store = useBalancesStore()
const toggling = ref(false)

function formatMoney(cents: number) {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0,
  }).format(cents / 100)
}

async function handleToggleAutoPayment(value: boolean) {
  toggling.value = true
  try {
    await store.toggleAutoPayment(value)
  } finally {
    toggling.value = false
  }
}

async function loadData() {
  await Promise.all([
    store.fetchBalance(),
    store.fetchLimits(),
  ])
}

onMounted(() => loadData())
</script>

<style scoped>
/* View Title Bar */
.view-title-bar {
  background: #2C2A29;
  color: #fff;
}

.view-title-bar__container {
  max-width: 74.25rem;
  margin: 0 auto;
  height: 100px;
  display: flex;
  align-items: center;
  padding: 0 1.5rem;
}

.view-title-bar__text {
  font-size: 1.6rem;
}

/* Content */
.balances-content {
  max-width: 74.25rem;
  margin: 0 auto;
  padding: 1.5rem;
}

/* Balance cards row */
.balance-cards-row {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 16px;
  margin-bottom: 24px;
}

/* Auto-payment section */
.autopayment-section {
  margin-bottom: 24px;
}

.autopayment-card {
  background: #fff;
  border: 1px solid #e0e0e0;
  border-radius: 16px;
  padding: 24px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  box-shadow: 0px 1px 8px 0px rgba(0, 0, 0, 0.08);
}

.autopayment-card__header {
  display: flex;
  align-items: center;
  gap: 16px;
}

.autopayment-card__icon {
  background: #2C2A29;
  width: 3rem;
  height: 3rem;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  color: #DFFF61;
  font-size: 1.25rem;
}

.autopayment-card__info {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.autopayment-card__title {
  font-size: 1rem;
  font-weight: 700;
  color: #2C2A29;
}

.autopayment-card__description {
  font-size: 0.875rem;
  color: #666;
  line-height: 1.4;
}

.autopayment-card__toggle {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-shrink: 0;
}

.autopayment-card__status {
  font-size: 0.875rem;
  font-weight: 600;
  color: #999;
}

.autopayment-card__status.active {
  color: #00C389;
}

/* Limits section */
.limits-section {
  margin-bottom: 24px;
}

.section-title {
  font-size: 1.125rem;
  font-weight: 700;
  color: #2C2A29;
  margin-bottom: 12px;
}

.limits-card {
  background: #fff;
  border: 1px solid #e0e0e0;
  border-radius: 16px;
  padding: 24px;
  box-shadow: 0px 1px 8px 0px rgba(0, 0, 0, 0.08);
}

.limits-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 0;
}

.limits-row:not(:last-child) {
  border-bottom: 1px solid #f0f0f0;
}

.limits-label {
  font-size: 0.875rem;
  color: #555;
}

.limits-value {
  font-size: 0.875rem;
  font-weight: 700;
  color: #2C2A29;
}

/* Loading */
.loading-state {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 4rem 0;
  color: #999;
}

/* Error */
.error-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.75rem;
  padding: 4rem 0;
  color: #888;
}

/* Responsive */
@media screen and (max-width: 48rem) {
  .view-title-bar__text {
    font-size: 1.3rem;
  }

  .view-title-bar__container {
    justify-content: center;
  }

  .balance-cards-row {
    grid-template-columns: 1fr;
  }

  .autopayment-card {
    flex-direction: column;
    align-items: flex-start;
  }

  .autopayment-card__toggle {
    align-self: flex-end;
  }
}
</style>
