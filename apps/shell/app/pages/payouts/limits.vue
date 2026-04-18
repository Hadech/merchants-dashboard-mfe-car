<template>
  <div class="limits-page">
    <!-- View Title Bar -->
    <div class="view-title-bar">
      <div class="view-title-bar__container">
        <span class="view-title-bar__text">Pagos a terceros</span>
      </div>
    </div>

    <!-- Content -->
    <div class="limits-content">
      <h2 class="section-title">Límites de dispersión</h2>

      <!-- Loading -->
      <div v-if="loading" class="loading-state">
        <UIcon name="i-heroicons-arrow-path" class="animate-spin text-xl text-gray-400" />
        <span>Cargando límites...</span>
      </div>

      <!-- Limits cards -->
      <template v-else-if="limits">
        <div class="limits-cards">
          <WBalanceCard
            icon="payout"
            title="Límite por transacción"
            :amount="formatMoney(limits.per_transaction)"
            currency="COP"
          />
          <WBalanceCard
            icon="calendar-month"
            title="Límite diario"
            :amount="formatMoney(limits.daily)"
            currency="COP"
          />
          <WBalanceCard
            icon="chart-analytics"
            title="Límite mensual"
            :amount="formatMoney(limits.monthly)"
            currency="COP"
          />
          <WBalanceCard
            icon="shield-check"
            title="Requiere aprobación desde"
            :amount="formatMoney(limits.approval_threshold)"
            currency="COP"
          />
        </div>
      </template>

      <!-- Error state -->
      <div v-else class="empty-state">
        <UIcon name="i-heroicons-exclamation-triangle" class="text-2xl text-gray-400" />
        <p>No se pudieron cargar los límites de dispersión.</p>
        <UButton variant="outline" color="neutral" class="retry-btn" @click="fetchLimitsData">
          Reintentar
        </UButton>
      </div>
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

async function fetchLimitsData() {
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

onMounted(fetchLimitsData)
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
.limits-content {
  max-width: 74.25rem;
  margin: 0 auto;
  padding: 1.5rem;
}

.section-title {
  font-size: 28px;
  font-weight: 700;
  color: #2C2A29;
  margin-bottom: 1.5rem;
}

/* Limits cards grid */
.limits-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
  gap: 16px;
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

/* Empty / Error state */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.75rem;
  padding: 4rem 0;
  color: #888;
}

.retry-btn {
  border-radius: 2rem;
  font-weight: 600;
  margin-top: 0.5rem;
}

/* Responsive */
@media screen and (max-width: 48rem) {
  .view-title-bar__text {
    font-size: 1.3rem;
  }

  .view-title-bar__container {
    justify-content: center;
  }

  .section-title {
    font-size: 22px;
  }

  .limits-cards {
    grid-template-columns: 1fr;
  }
}
</style>
