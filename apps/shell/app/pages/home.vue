<template>
  <div class="home-page">
    <!-- View Title Bar -->
    <div class="view-title-bar">
      <div class="view-title-bar__container">
        <span class="view-title-bar__text">Inicio</span>
      </div>
    </div>

    <div class="home-content">
      <!-- Merchant Info Box -->
      <div class="content-box merchant-info-box">
        <div v-if="merchant" class="merchant-header">
          <div v-if="merchant.logo_url" class="merchant-logo">
            <img :src="merchant.logo_url" alt="Logo" class="border-logo" />
          </div>
          <div class="merchant-details">
            <h1 class="merchant-name">{{ merchant.name }}</h1>
            <p class="merchant-legal">{{ merchant.legal_name }} ({{ merchant.email }})</p>
          </div>
        </div>
        <div v-else class="merchant-header">
          <div class="loading-placeholder">
            <div class="loading-spinner-sm"></div>
            <span>Cargando...</span>
          </div>
        </div>
      </div>

      <!-- Balance Module — "Tu dinero en Wompi" -->
      <article class="balance-module">
        <div class="balance-module__content">
          <header class="balance-module__header">
            <h6 class="balance-module__title">Tu dinero en Wompi</h6>
            <p class="balance-module__date">
              <span class="ic ic_calendar balance-module__date-icon"></span>
              <span>{{ formattedToday }}</span>
            </p>
          </header>
          <div class="balance-module__cards">
            <!-- Dinero recibido hoy -->
            <div class="balance-card">
              <div class="balance-card__icon-wrap">
                <span class="ic ic_money-check"></span>
              </div>
              <div class="balance-card__body">
                <span class="balance-card__title">Dinero recibido hoy</span>
                <span class="balance-card__desc">Valor neto (comisión aplicada). En revisión</span>
                <strong class="balance-card__amount" :class="{ negative: balanceAccredited < 0 }">
                  {{ formatBalance(balanceAccredited) }}
                </strong>
              </div>
            </div>
            <!-- Wompi Cuenta -->
            <div class="balance-card balance-card--primary">
              <div class="balance-card__icon-wrap balance-card__icon-wrap--green">
                <span class="ic ic_wallet"></span>
              </div>
              <div class="balance-card__body">
                <span class="balance-card__title">Wompi Cuenta</span>
                <strong class="balance-card__amount" :class="{ negative: balanceAvailable < 0 }">
                  {{ formatBalance(balanceAvailable) }}
                </strong>
                <div v-if="balanceInProgress !== 0" class="balance-card__credit">
                  <span class="ic ic_send-cash balance-card__credit-icon"></span>
                  <span>Abono en curso: {{ formatBalance(balanceInProgress) }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </article>

      <!-- Payouts Banner -->
      <div class="payouts-banner">
        <div class="payouts-banner__content">
          <h2 class="payouts-banner__title">Con pagos a terceros</h2>
          <p class="payouts-banner__desc">
            usas los recursos que tienes en tu cuenta Wompi o tu cuenta bancaria para pagar nómina, proveedores, servicios y más.
          </p>
          <button class="payouts-banner__btn" @click="navigateTo('/payouts/balances')">
            ¡Actívalo ahora!
          </button>
        </div>
      </div>

      <!-- Quick Access Cards -->
      <div class="quick-access">
        <div class="quick-card" @click="navigateTo('/payment-links/create')">
          <div class="quick-card__icon"><span class="ic ic_paper-plane-money"></span></div>
          <div class="quick-card__text">
            <span class="quick-card__label">Links de pago</span>
            <p>¡Crea links de pago y comienza a vender ahora!</p>
          </div>
        </div>
        <div class="quick-card" @click="navigateTo('/transactions')">
          <div class="quick-card__icon"><span class="ic ic_money-exchange"></span></div>
          <div class="quick-card__text">
            <span class="quick-card__label">Transacciones</span>
            <p>Consulta el estado y detalle de tus transacciones</p>
          </div>
        </div>
        <div class="quick-card" @click="openExternal('https://wompi.statuspage.io/')">
          <div class="quick-card__icon"><span class="ic ic_wrench"></span></div>
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

const today = new Date()
const monthNames = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic']
const formattedToday = `${monthNames[today.getMonth()]} ${String(today.getDate()).padStart(2, '0')}, ${today.getFullYear()}`

const balanceAccredited = computed(() => balance.value?.on_settlement?.[0]?.balance_in_cents ?? 0)
const balanceAvailable = computed(() => balance.value?.available?.[0]?.balance_in_cents ?? 0)
const balanceInProgress = computed(() => balance.value?.in_progress?.[0]?.balance_in_cents ?? 0)

function formatBalance(cents: number): string {
  const abs = Math.abs(cents) / 100
  const formatted = new Intl.NumberFormat('es-CO', { minimumFractionDigits: 0 }).format(abs)
  return `${cents < 0 ? '- ' : ''}$${formatted}`
}

function openExternal(url: string) {
  window.open(url, '_blank')
}

onMounted(async () => {
  const api = createApiClient({ useAuth: true, refreshSession })
  try {
    const res = await api<{ data: any[] }>('/merchants')
    if (res?.data?.length > 0) merchant.value = res.data[0]
  } catch (e) { console.warn('[Home] merchants:', e) }

  try {
    const res = await api<{ data: any }>('/balances')
    balance.value = res?.data ?? null
  } catch (e) { console.warn('[Home] balance:', e) }
})
</script>

<style scoped>
/* === View Title Bar === */
.view-title-bar { background: #2C2A29; color: #fff; }
.view-title-bar__container { max-width: 74.25rem; margin: 0 auto; height: 100px; display: flex; align-items: center; padding: 0 1.5rem; }
.view-title-bar__text { font-size: 1.6rem; font-weight: 400; }

/* === Content === */
.home-content { max-width: 74.25rem; margin: 0 auto; padding: 0 1.5rem 2rem; }

/* === Merchant Info Box === */
.content-box { background: #fff; border-radius: 4px; padding: 1.25rem; margin-top: 1rem; box-shadow: 0 1px 3px rgba(0,0,0,0.08); }
.merchant-header { display: flex; align-items: center; gap: 1rem; }
.merchant-logo .border-logo { max-width: 5rem; max-height: 5rem; border-radius: 4px; border: 1px solid #EBEEF5; }
.merchant-name { font-size: 1.25rem; font-weight: 700; color: #2C2A29; margin: 0; }
.merchant-legal { font-size: 0.875rem; color: #616161; margin: 0.25rem 0 0; }
.loading-placeholder { display: flex; align-items: center; gap: 0.5rem; color: #888; font-size: 0.875rem; }
.loading-spinner-sm { width: 16px; height: 16px; border: 2px solid #CACACA; border-top-color: #2C2A29; border-radius: 50%; animation: spin 0.6s linear infinite; }
@keyframes spin { to { transform: rotate(360deg); } }

/* === Balance Module — "Tu dinero en Wompi" === */
.balance-module {
  border-radius: 16px;
  padding: 24px 40px;
  background: #fff;
  box-shadow: 0px 3px 6px 0px rgba(44,42,41,0.16);
  margin-top: 1rem;
}
.balance-module__content { display: flex; flex-direction: column; }
.balance-module__header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; }
.balance-module__title { font-family: 'Open Sans', sans-serif; font-size: 18px; font-weight: 700; line-height: 20px; letter-spacing: -0.3px; color: #2C2A29; margin: 0; }
.balance-module__date { text-transform: capitalize; color: #969696; display: flex; align-items: center; gap: 4px; font-size: 12px; line-height: 16px; }
.balance-module__date-icon { font-size: 16px; color: #616161; }
.balance-module__cards { display: grid; grid-template-columns: 0.7fr 1fr; gap: 24px; max-width: 815px; margin: 0 auto; }

/* === Balance Card === */
.balance-card {
  background: #FAFAFA;
  border-radius: 16px;
  padding: 20px 24px;
  display: flex;
  align-items: flex-start;
  gap: 16px;
  border: 1px solid #E6E6E6;
}
.balance-card--primary { background: #F0FFF0; border-color: #C8E6C9; }
.balance-card__icon-wrap {
  width: 48px; height: 48px; min-width: 48px;
  border-radius: 50%; background: #2C2A29;
  display: flex; align-items: center; justify-content: center;
}
.balance-card__icon-wrap span { font-size: 1.4rem; color: #DFFF61; }
.balance-card__icon-wrap--green { background: #00825A; }
.balance-card__icon-wrap--green span { color: #fff; }
.balance-card__body { display: flex; flex-direction: column; gap: 4px; min-width: 0; }
.balance-card__title { font-size: 0.8rem; font-weight: 600; color: #616161; letter-spacing: -0.17px; }
.balance-card__desc { font-size: 0.7rem; color: #969696; line-height: 1.3; }
.balance-card__amount { font-size: 1.5rem; font-weight: 700; color: #2C2A29; letter-spacing: -0.6px; line-height: 1.2; }
.balance-card__amount.negative { color: #A01110; }
.balance-card__credit { display: flex; align-items: center; gap: 4px; font-size: 0.75rem; color: #616161; margin-top: 4px; }
.balance-card__credit-icon { font-size: 14px; color: #FF9C1B; }

/* === Payouts Banner === */
.payouts-banner {
  margin-top: 1.25rem;
  border-radius: 24px;
  background: linear-gradient(135deg, #DFFF61 0%, #C8F5A0 50%, #A8E6CF 100%);
  padding: 2.5rem 3.5rem;
  position: relative;
  overflow: hidden;
}
.payouts-banner__content { text-align: center; position: relative; z-index: 1; }
.payouts-banner__title {
  font-family: 'Open Sans', sans-serif;
  font-size: 1.75rem; font-weight: 700; color: #2C2A29;
  margin: 0 0 12px; letter-spacing: -0.6px;
}
.payouts-banner__desc {
  font-size: 1rem; color: #2C2A29; max-width: 400px; margin: 0 auto 24px;
  line-height: 1.4; font-weight: 400;
}
.payouts-banner__btn {
  display: inline-flex; align-items: center; justify-content: center;
  width: 224px; height: 48px; border-radius: 100px;
  background: #2C2A29; color: #DFFF61;
  font-size: 16px; font-weight: 600; letter-spacing: -0.3px;
  border: none; cursor: pointer; transition: background 0.15s;
}
.payouts-banner__btn:hover { background: #616161; }

/* === Quick Access Cards === */
.quick-access { display: grid; grid-template-columns: repeat(3, 1fr); gap: 1rem; margin-top: 1.25rem; }
.quick-card {
  background: #FAFAFA; border-radius: 8px; padding: 1rem;
  display: flex; align-items: center; gap: 0.75rem;
  cursor: pointer; border: 1px solid #EBEEF5; transition: all 0.15s ease-in-out;
}
.quick-card:hover { transform: translateY(-2px); border-color: #DFFF61; background: #F5F5F0; }
.quick-card:hover .quick-card__icon { background: #fff; }
.quick-card:hover .quick-card__icon span { color: #2C2A29; }
.quick-card__icon {
  width: 3.5rem; height: 3.5rem; border-radius: 50%; background: #2C2A29;
  display: flex; align-items: center; justify-content: center; flex-shrink: 0;
  transition: all 0.15s ease-in-out;
}
.quick-card__icon span { font-size: 1.5rem; color: #DFFF61; transition: color 0.15s; }
.quick-card__text { flex: 1; }
.quick-card__label { font-size: 0.75rem; color: #888; display: block; margin-bottom: 0.25rem; }
.quick-card__text p { font-size: 0.9rem; font-weight: 600; color: #616161; margin: 0; line-height: 1.3; }
.quick-card:hover .quick-card__text p { color: #2C2A29; }

/* === Responsive === */
@media screen and (max-width: 48rem) {
  .balance-module { padding: 16px; }
  .balance-module__cards { grid-template-columns: 1fr; max-width: 100%; }
  .balance-module__header { flex-direction: column; align-items: flex-start; gap: 8px; }
  .quick-access { grid-template-columns: 1fr; }
  .payouts-banner { padding: 2rem 1.5rem; }
  .payouts-banner__title { font-size: 1.4rem; }
  .view-title-bar__container { justify-content: center; }
  .view-title-bar__text { font-size: 1.3rem; }
  .merchant-header { flex-direction: column; text-align: center; }
}
</style>
