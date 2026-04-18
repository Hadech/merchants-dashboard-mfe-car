<template>
  <div class="my-account-page">
    <!-- View Title Bar -->
    <div class="view-title-bar">
      <div class="view-title-bar__container">
        <span class="view-title-bar__text">Cuenta comercio: Resumen cuenta</span>
      </div>
    </div>

    <!-- Content -->
    <div class="my-account-content">
      <!-- Loading -->
      <div v-if="loading" class="loading-state">
        <UIcon name="i-heroicons-arrow-path" class="animate-spin text-xl text-gray-400" />
        <span>Cargando información del comercio...</span>
      </div>

      <template v-else-if="merchant">
        <!-- Merchant info section -->
        <span class="box-label">Tu comercio</span>
        <div class="info-card">
          <div class="merchant-header">
            <div v-if="merchant.logo_url" class="merchant-logo">
              <img :src="merchant.logo_url" alt="Logo" />
            </div>
            <div class="merchant-header__info">
              <h3 class="merchant-name">{{ merchant.name || merchant.legal_name }}</h3>
              <span class="merchant-id">ID: {{ merchant.id }}</span>
            </div>
          </div>

          <!-- Balance summary -->
          <div v-if="balance" class="balance-summary">
            <div class="balance-item">
              <span class="balance-item__label">Balance disponible</span>
              <span class="balance-item__value">{{ formatMoney(balance.available_amount || 0) }}</span>
            </div>
          </div>
        </div>

        <!-- Account config section -->
        <span class="box-label">Configuración de la cuenta</span>
        <div class="info-card">
          <div class="details-table">
            <div class="details-table__row">
              <span class="details-table__name">Razón social</span>
              <span class="details-table__value">{{ merchant.legal_name || '—' }}</span>
            </div>
            <div class="details-table__row">
              <span class="details-table__name">Identificación</span>
              <span class="details-table__value">{{ merchant.legal_id_type }} {{ merchant.legal_id }}</span>
            </div>
            <div class="details-table__row">
              <span class="details-table__name">Nombre de contacto</span>
              <span class="details-table__value">{{ merchant.contact_name || '—' }}</span>
            </div>
            <div class="details-table__row">
              <span class="details-table__name">Teléfono de contacto</span>
              <span class="details-table__value">{{ merchant.phone_number || '—' }}</span>
            </div>
            <div class="details-table__row">
              <span class="details-table__name">Email</span>
              <span class="details-table__value">{{ merchant.email || '—' }}</span>
            </div>
          </div>
        </div>

        <!-- Payment methods -->
        <div v-if="merchant.accepted_payment_methods?.length">
          <span class="box-label">Métodos de pago habilitados</span>
          <div class="info-card">
            <div class="payment-methods-grid">
              <div
                v-for="pm in merchant.accepted_payment_methods"
                :key="pm"
                class="payment-method-box"
              >
                <UIcon :name="paymentMethodIcon(pm)" class="pm-icon" />
                <span class="pm-name">{{ paymentMethodName(pm) }}</span>
              </div>
            </div>

            <!-- Disbursement account -->
            <div v-if="merchant.bank_account_number" class="disbursement-account">
              <h4 class="subsection-title">Cuenta de desembolso</h4>
              <div class="details-table">
                <div class="details-table__row">
                  <span class="details-table__name">Banco</span>
                  <span class="details-table__value">{{ merchant.bank_name || 'Bancolombia' }}</span>
                </div>
                <div class="details-table__row">
                  <span class="details-table__name">Tipo de cuenta</span>
                  <span class="details-table__value">{{ accountTypeLocale(merchant.bank_account_type) }}</span>
                </div>
                <div class="details-table__row">
                  <span class="details-table__name">Número de cuenta</span>
                  <span class="details-table__value">{{ merchant.bank_account_number }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Billing plan -->
        <div v-if="billingPlan">
          <span class="box-label">Plan de facturación</span>
          <div class="info-card">
            <div class="billing-plan-card">
              <div class="billing-plan-card__header">
                <span class="billing-plan-card__badge">¡Plan actual! 🤩</span>
                <h4 class="billing-plan-card__name">{{ billingPlan.name }}</h4>
              </div>
              <div v-if="billingPlan.fees?.length" class="billing-plan-card__fee">
                <span class="fee-rate">{{ getFeeRate(billingPlan) }}</span>
                <small>(Por transacción exitosa)</small>
              </div>
            </div>

            <div class="plan-includes">
              <p class="plan-includes__title">Todos nuestros planes incluyen:</p>
              <div class="plan-includes__items">
                <div class="plan-includes__item">
                  <UIcon name="i-heroicons-check" class="check-icon" />
                  <span>Desembolso al siguiente día hábil</span>
                </div>
                <div class="plan-includes__item">
                  <UIcon name="i-heroicons-check" class="check-icon" />
                  <span>Reportes en línea en tu cuenta Wompi</span>
                </div>
                <div class="plan-includes__item">
                  <UIcon name="i-heroicons-check" class="check-icon" />
                  <span>Sin cláusulas de permanencia, mensualidades o costos fijos</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Disbursements warning -->
        <div v-if="merchant.disbursements_allowed === false" class="warning-banner">
          <UIcon name="i-heroicons-exclamation-triangle" class="warning-banner__icon" />
          <div>
            <strong>Desembolsos inactivos</strong>
            <p>Para activar los desembolsos, debes completar primero el proceso de vinculación.</p>
          </div>
        </div>
      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useApiClient } from '@wompi/api-client'

const api = useApiClient()

const loading = ref(false)
const merchant = ref<any>(null)
const balance = ref<any>(null)
const billingPlan = ref<any>(null)

const pmNames: Record<string, string> = {
  CARD: 'Tarjetas',
  BANCOLOMBIA_TRANSFER: 'Botón Bancolombia',
  BANCOLOMBIA_QR: 'Código QR',
  NEQUI: 'Nequi',
  BANCOLOMBIA_COLLECT: 'Efectivo',
  PSE: 'PSE',
  DAVIPLATA: 'Daviplata',
  PCOL: 'Puntos Colombia',
  BANCOLOMBIA_BNPL: 'Compra y Paga Después',
  SU_PLUS: 'SU+Pay',
  CARD_TTP: 'Pago sin contacto',
}

const pmIcons: Record<string, string> = {
  CARD: 'i-heroicons-credit-card',
  BANCOLOMBIA_TRANSFER: 'i-heroicons-building-library',
  BANCOLOMBIA_QR: 'i-heroicons-qr-code',
  NEQUI: 'i-heroicons-device-phone-mobile',
  BANCOLOMBIA_COLLECT: 'i-heroicons-banknotes',
  PSE: 'i-heroicons-building-office',
  DAVIPLATA: 'i-heroicons-device-phone-mobile',
  PCOL: 'i-heroicons-star',
  BANCOLOMBIA_BNPL: 'i-heroicons-clock',
  SU_PLUS: 'i-heroicons-plus-circle',
  CARD_TTP: 'i-heroicons-signal',
}

function paymentMethodName(pm: string) { return pmNames[pm] ?? pm }
function paymentMethodIcon(pm: string) { return pmIcons[pm] ?? 'i-heroicons-credit-card' }

function accountTypeLocale(type: string) {
  if (type === 'CHECKING') return 'Cuenta Corriente'
  if (type === 'SAVINGS') return 'Cuenta de Ahorros'
  return '—'
}

function formatMoney(cents: number) {
  return new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 }).format(cents / 100)
}

function getFeeRate(plan: any) {
  if (!plan.fees?.length) return '—'
  const fee = plan.fees[0]
  const rate = Math.round(fee.fee_rate * 10000) / 100
  const fixed = fee.fixed_fee_in_cents ? ` + ${Math.round(fee.fixed_fee_in_cents / 100)}` : ''
  return `${rate} %${fixed} + IVA`
}

async function loadData() {
  loading.value = true
  try {
    const [merchantRes, balanceRes, plansRes] = await Promise.allSettled([
      api<{ data: any }>('/merchants'),
      api<{ data: any }>('/balances'),
      api<{ data: any[] }>('/billing_plans'),
    ])

    if (merchantRes.status === 'fulfilled') {
      const m = Array.isArray(merchantRes.value.data) ? merchantRes.value.data[0] : merchantRes.value.data
      merchant.value = m
    }
    if (balanceRes.status === 'fulfilled') {
      balance.value = balanceRes.value.data
    }
    if (plansRes.status === 'fulfilled' && merchant.value) {
      const plans = Array.isArray(plansRes.value.data) ? plansRes.value.data : plansRes.value
      billingPlan.value = plans?.find?.((p: any) => p.id === merchant.value.billing_plan_id) ?? null
    }
  } finally {
    loading.value = false
  }
}

onMounted(loadData)
</script>

<style scoped>
/* View Title Bar */
.view-title-bar { background: #2C2A29; color: #fff; }
.view-title-bar__container { max-width: 74.25rem; margin: 0 auto; height: 100px; display: flex; align-items: center; padding: 0 1.5rem; }
.view-title-bar__text { font-size: 1.6rem; }

/* Content */
.my-account-content { max-width: 74.25rem; margin: 0 auto; padding: 1.5rem; }

/* Box label */
.box-label { display: block; font-size: 0.875rem; font-weight: 600; color: #555; margin: 1.5rem 0 0.5rem; }
.box-label:first-child { margin-top: 0; }

/* Info card */
.info-card {
  background: #fff;
  border: 1px solid #e0e0e0;
  border-radius: 20px;
  box-shadow: 0px 1px 8px 0px rgba(0, 0, 0, 0.08);
  padding: 2rem;
  margin-bottom: 0.5rem;
}

/* Merchant header */
.merchant-header { display: flex; align-items: center; gap: 16px; margin-bottom: 1rem; }
.merchant-logo { width: 64px; height: 64px; border-radius: 12px; overflow: hidden; flex-shrink: 0; border: 1px solid #e0e0e0; }
.merchant-logo img { width: 100%; height: 100%; object-fit: contain; }
.merchant-header__info { display: flex; flex-direction: column; gap: 2px; }
.merchant-name { font-size: 1.25rem; font-weight: 700; color: #2C2A29; }
.merchant-id { font-size: 0.8125rem; color: #888; font-family: monospace; }

/* Balance summary */
.balance-summary { display: flex; gap: 24px; padding-top: 1rem; border-top: 1px solid #f0f0f0; }
.balance-item { display: flex; flex-direction: column; gap: 2px; }
.balance-item__label { font-size: 0.8125rem; color: #888; }
.balance-item__value { font-size: 1.5rem; font-weight: 700; color: #2C2A29; }

/* Details table — matches legacy */
.details-table { width: 100%; }
.details-table__row { display: flex; padding: 0.6rem 0; border-bottom: 1px solid #f5f5f5; }
.details-table__row:last-child { border-bottom: none; }
.details-table__name { flex: 0 0 40%; font-size: 0.875rem; color: #888; }
.details-table__value { flex: 1; font-size: 0.875rem; color: #2C2A29; font-weight: 500; }

/* Payment methods grid */
.payment-methods-grid { display: flex; flex-wrap: wrap; gap: 12px; margin-bottom: 1.5rem; }
.payment-method-box {
  display: flex; flex-direction: column; align-items: center; justify-content: center;
  width: calc(25% - 12px); min-width: 100px; padding: 16px 8px;
  border: 1px solid #f0f0f0; border-radius: 12px; text-align: center;
  transition: background 0.15s;
}
.payment-method-box:hover { background: #f9f9f9; }
.pm-icon { font-size: 1.5rem; color: #2C2A29; margin-bottom: 6px; }
.pm-name { font-size: 0.75rem; color: #555; font-weight: 500; }

/* Disbursement account */
.disbursement-account { padding-top: 1.5rem; border-top: 1px solid #f0f0f0; }
.subsection-title { font-size: 1rem; font-weight: 700; color: #2C2A29; margin-bottom: 0.75rem; }

/* Billing plan card */
.billing-plan-card { text-align: center; padding: 1.5rem; border: 2px solid #BDF4BC; border-radius: 16px; margin-bottom: 1.5rem; }
.billing-plan-card__header { margin-bottom: 0.75rem; }
.billing-plan-card__badge { display: inline-block; background: #F2FDF1; color: #1A624C; font-size: 0.8125rem; font-weight: 600; padding: 4px 12px; border-radius: 20px; margin-bottom: 8px; }
.billing-plan-card__name { font-size: 1.25rem; font-weight: 700; color: #2C2A29; }
.billing-plan-card__fee { margin-top: 0.5rem; }
.fee-rate { font-size: 1.5rem; font-weight: 700; color: #2C2A29; }
.billing-plan-card__fee small { display: block; font-size: 0.8125rem; color: #888; margin-top: 4px; }

/* Plan includes */
.plan-includes { border-top: 1px solid #f0f0f0; padding-top: 1rem; }
.plan-includes__title { font-size: 0.9375rem; font-weight: 700; color: #2C2A29; margin-bottom: 0.75rem; }
.plan-includes__items { display: flex; flex-direction: column; gap: 8px; }
.plan-includes__item { display: flex; align-items: center; gap: 8px; font-size: 0.875rem; color: #555; }
.check-icon { color: #40A940; font-size: 1rem; flex-shrink: 0; }

/* Warning banner */
.warning-banner {
  display: flex; align-items: flex-start; gap: 12px;
  background: #FFFBEB; border: 1px solid #FDE68A; border-radius: 12px;
  padding: 16px 20px; margin-top: 1.5rem; font-size: 0.875rem; color: #92400E;
}
.warning-banner__icon { font-size: 1.25rem; color: #F59E0B; flex-shrink: 0; margin-top: 2px; }
.warning-banner p { margin-top: 4px; }

/* Loading */
.loading-state { display: flex; align-items: center; justify-content: center; gap: 0.5rem; padding: 4rem 0; color: #999; }

/* Responsive */
@media screen and (max-width: 48rem) {
  .view-title-bar__text { font-size: 1.3rem; }
  .view-title-bar__container { justify-content: center; }
  .details-table__name { flex: 0 0 45%; }
  .payment-method-box { width: calc(50% - 12px); }
  .info-card { padding: 1.25rem; }
  .balance-summary { flex-direction: column; gap: 12px; }
}
</style>
