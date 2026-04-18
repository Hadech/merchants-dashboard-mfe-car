<template>
  <div class="home-page">
    <!-- View Title Bar -->
    <div class="view-title-bar">
      <div class="view-title-bar__container">
        <span class="view-title-bar__text">Inicio</span>
      </div>
    </div>

    <div class="home-content">
      <!-- Merchant Info + Balances -->
      <div class="content-box merchant-info-box">
        <div v-if="merchant" class="merchant-header">
          <div v-if="merchant.logo_url" class="merchant-logo">
            <img :src="merchant.logo_url" alt="Logo" />
          </div>
          <div class="merchant-details">
            <h1 class="merchant-name">{{ merchant.name }}</h1>
            <p class="merchant-legal">{{ merchant.legal_name }} ({{ merchant.email }})</p>
          </div>
        </div>
        <div v-else class="merchant-header loading-placeholder">
          <div class="loading-spinner-sm"></div>
          <span>Cargando información del comercio...</span>
        </div>
      </div>

      <!-- Balance Cards -->
      <div class="balance-section">
        <h2 class="balance-title">
          Descripción general de saldos
          <span class="balance-month">(Mes de {{ currentMonth }})</span>
        </h2>

        <div class="balance-cards">
          <!-- Acreditado -->
          <div class="balance-card">
            <div class="balance-card__icon">
              <span class="ic ic_money-check"></span>
            </div>
            <div class="balance-card__info">
              <span class="balance-card__label">Acreditado</span>
              <strong class="balance-card__amount" :class="{ negative: balanceAccredited < 0 }">
                {{ formatBalance(balanceAccredited) }}
              </strong>
            </div>
          </div>

          <!-- Disponible -->
          <div class="balance-card">
            <div class="balance-card__icon balance-card__icon--available">
              <span class="ic ic_wallet"></span>
            </div>
            <div class="balance-card__info">
              <span class="balance-card__label">Saldo disponible</span>
              <strong class="balance-card__amount" :class="{ negative: balanceAvailable < 0 }">
                {{ formatBalance(balanceAvailable) }}
              </strong>
            </div>
          </div>

          <!-- En dispersión -->
          <div class="balance-card">
            <div class="balance-card__icon balance-card__icon--progress">
              <span class="ic ic_send-cash"></span>
            </div>
            <div class="balance-card__info">
              <span class="balance-card__label">En dispersión</span>
              <strong class="balance-card__amount" :class="{ negative: balanceInProgress < 0 }">
                {{ formatBalance(balanceInProgress) }}
              </strong>
            </div>
          </div>
        </div>
      </div>

      <!-- Quick Access Cards -->
      <div class="quick-access">
        <div class="quick-card" @click="navigateTo('/payment-links/create')">
          <div class="quick-card__icon">
            <span class="ic ic_paper-plane-money"></span>
          </div>
          <div class="quick-card__text">
            <span class="quick-card__label">Links de pago</span>
            <p>¡Crea links de pago y comienza a vender ahora!</p>
          </div>
        </div>

        <div class="quick-card" @click="navigateTo('/transactions')">
          <div class="quick-card__icon">
            <span class="ic ic_money-exchange"></span>
          </div>
          <div class="quick-card__text">
            <span class="quick-card__label">Transacciones</span>
            <p>Consulta el estado y detalle de tus transacciones</p>
          </div>
        </div>

        <div class="quick-card" @click="openExternal('https://wompi.statuspage.io/')">
          <div class="quick-card__icon">
            <span class="ic ic_wrench"></span>
          </div>
          <div class="quick-card__text">
            <span class="quick-card__label">Status Page</span>
            <p>Conoce el estado de los servicios de Wompi y los medios de pago</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { createApiClient } from '@wompi/api-client'
import { useAuth } from '@wompi/auth'

const { refreshSession } = useAuth()

const merchant = ref<any>(null)
const balance = ref<any>(null)
const loadingBalance = ref(true)

const monthNames = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre',
]
const currentMonth = monthNames[new Date().getMonth()]

const balanceAccredited = computed(() => {
  return balance.value?.on_settlement?.[0]?.balance_in_cents ?? 0
})

const balanceAvailable = computed(() => {
  return balance.value?.available?.[0]?.balance_in_cents ?? 0
})

const balanceInProgress = computed(() => {
  return balance.value?.in_progress?.[0]?.balance_in_cents ?? 0
})

function formatBalance(cents: number): string {
  const formatted = new Intl.NumberFormat('es-CO', { minimumFractionDigits: 0 }).format(Math.abs(cents) / 100)
  return `${cents < 0 ? '-' : ''}COP $${formatted}`
}

function openExternal(url: string) {
  window.open(url, '_blank')
}

onMounted(async () => {
  const api = createApiClient({ useAuth: true, refreshSession })

  // Fetch merchants
  try {
    const res = await api<{ data: any[] }>('/merchants')
    if (res?.data?.length > 0) {
      merchant.value = res.data[0]
    }
  } catch (e) {
    console.warn('[Home] Could not fetch merchants:', e)
  }

  // Fetch balance
  try {
    const res = await api<{ data: any }>('/balances')
    balance.value = res?.data ?? null
  } catch (e) {
    console.warn('[Home] Could not fetch balance:', e)
  } finally {
    loadingBalance.value = false
  }
})
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
  font-weight: 400;
}

/* Content */
.home-content {
  max-width: 74.25rem;
  margin: 0 auto;
  padding: 0 1.5rem;
}

/* Merchant Info Box */
.content-box {
  background: #fff;
  border-radius: 4px;
  padding: 1.25rem;
  margin-top: 1rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
}

.merchant-header {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.merchant-logo img {
  max-width: 5rem;
  max-height: 5rem;
  border-radius: 4px;
  border: 1px solid #EBEEF5;
}

.merchant-name {
  font-size: 1.25rem;
  font-weight: 700;
  color: #2C2A29;
  margin: 0;
}

.merchant-legal {
  font-size: 0.875rem;
  color: #616161;
  margin: 0.25rem 0 0;
}

.loading-placeholder {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: #888;
  font-size: 0.875rem;
}

.loading-spinner-sm {
  width: 16px;
  height: 16px;
  border: 2px solid #CACACA;
  border-top-color: #2C2A29;
  border-radius: 50%;
  animation: spin 0.6s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

/* Balance Section */
.balance-section {
  margin-top: 1.25rem;
}

.balance-title {
  font-size: 1rem;
  font-weight: 600;
  color: #2C2A29;
  margin: 0 0 1rem;
}

.balance-month {
  font-weight: 400;
  color: #616161;
}

.balance-cards {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 0.75rem;
}

.balance-card {
  background: #fff;
  border-radius: 8px;
  padding: 1.25rem;
  display: flex;
  align-items: center;
  gap: 1rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
  border: 1px solid #EBEEF5;
}

.balance-card__icon {
  width: 3.5rem;
  height: 3.5rem;
  border-radius: 50%;
  background: #2C2A29;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.balance-card__icon span {
  font-size: 1.5rem;
  color: #DFFF61;
}

.balance-card__icon--available {
  background: #00825A;
}

.balance-card__icon--progress {
  background: #FF9C1B;
}

.balance-card__info {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.balance-card__label {
  font-size: 0.8rem;
  color: #616161;
  text-transform: uppercase;
}

.balance-card__amount {
  font-size: 1.1rem;
  font-weight: 700;
  color: #2C2A29;
}

.balance-card__amount.negative {
  color: #A01110;
}

/* Quick Access Cards */
.quick-access {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 0.75rem;
  margin-top: 1.25rem;
  margin-bottom: 2rem;
}

.quick-card {
  background: #FAFAFA;
  border-radius: 8px;
  padding: 1rem;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  cursor: pointer;
  border: 1px solid #EBEEF5;
  transition: all 0.15s ease-in-out;
}

.quick-card:hover {
  transform: translateY(-2px);
  border-color: #DFFF61;
  background: #F5F5F0;
}

.quick-card:hover .quick-card__icon {
  background: #fff;
}

.quick-card:hover .quick-card__icon span {
  color: #2C2A29;
}

.quick-card__icon {
  width: 3.5rem;
  height: 3.5rem;
  border-radius: 50%;
  background: #2C2A29;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  transition: all 0.15s ease-in-out;
}

.quick-card__icon span {
  font-size: 1.5rem;
  color: #DFFF61;
  transition: color 0.15s ease-in-out;
}

.quick-card__text {
  flex: 1;
}

.quick-card__label {
  font-size: 0.75rem;
  color: #888;
  display: block;
  margin-bottom: 0.25rem;
}

.quick-card__text p {
  font-size: 0.9rem;
  font-weight: 600;
  color: #616161;
  margin: 0;
  line-height: 1.3;
}

.quick-card:hover .quick-card__text p {
  color: #2C2A29;
}

/* Responsive */
@media screen and (max-width: 48rem) {
  .balance-cards,
  .quick-access {
    grid-template-columns: 1fr;
  }

  .view-title-bar__container {
    justify-content: center;
  }

  .view-title-bar__text {
    font-size: 1.3rem;
  }

  .merchant-header {
    flex-direction: column;
    text-align: center;
  }
}
</style>
