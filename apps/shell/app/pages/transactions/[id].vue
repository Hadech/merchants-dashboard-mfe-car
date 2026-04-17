<template>
  <div class="detail">
    <!-- ViewTitle bar -->
    <div class="view-title">
      <div class="container">
        <div class="left">
          <i class="ic ic_arrow-left back-arrow" @click="goBack"></i>
          <span class="title">Detalle de la transacción</span>
        </div>
      </div>
    </div>

    <!-- Loading state -->
    <div v-if="loading" class="view-content container" style="text-align: center; padding: 4rem;">
      <p>Cargando transacción...</p>
    </div>

    <!-- Error state -->
    <div v-else-if="error" class="view-content container" style="text-align: center; padding: 4rem;">
      <p style="color: #f64d79;">{{ error }}</p>
      <button class="retry-btn" @click="fetchTransaction">Reintentar</button>
    </div>

    <!-- Content -->
    <div v-else-if="transaction" class="view-content container">
      <!-- Left Column -->
      <div class="detail__column">
        <!-- Detalles de pago -->
        <h1 class="box-title">Detalles de pago</h1>
        <div class="detail__columns__box">
          <div class="detail__columns__payment-details__box__payment-overview">
            <span class="money">{{ transaction.currency }} {{ formatPrice(transaction.amount_in_cents) }}</span>
            <span class="separator">de</span>
            <span class="email">{{ transaction.customer_email }}</span>
          </div>
          <div class="detail__columns__box__list">
            <div class="details-table transaction-details">
              <!-- Estado -->
              <div class="details-table__row">
                <div class="details-table__name">Estado</div>
                <div class="details-table__value">
                  <span class="custom-tag" :class="'tag--' + filterStatus(transaction.status).color">
                    {{ filterStatus(transaction.status).text }}
                  </span>
                </div>
              </div>
              <!-- Detalle del estado -->
              <div v-if="typeof transaction.status_message === 'string'" class="details-table__row">
                <div class="details-table__name">Detalle del estado</div>
                <div class="details-table__value">{{ transaction.status_message }}</div>
              </div>
              <!-- Fecha -->
              <div class="details-table__row">
                <div class="details-table__name">Fecha</div>
                <div class="details-table__value">
                  <div class="full-date-wrapper">
                    <div class="time-wrapper">
                      <i class="mat-icon">access_time</i>
                      <span class="time">{{ formatTime(transaction.created_at) }}</span>
                    </div>
                    <div class="date-wrapper">
                      <i class="mat-icon">date_range</i>
                      <span class="range">{{ formatDate(transaction.created_at) }}</span>
                    </div>
                  </div>
                </div>
              </div>
              <!-- Fecha finalización -->
              <div v-if="transaction.finalized_at" class="details-table__row">
                <div class="details-table__name">Fecha finalización</div>
                <div class="details-table__value">
                  <div class="full-date-wrapper">
                    <div class="time-wrapper">
                      <i class="mat-icon">access_time</i>
                      <span class="time">{{ formatTime(transaction.finalized_at) }}</span>
                    </div>
                    <div class="date-wrapper">
                      <i class="mat-icon">date_range</i>
                      <span class="range">{{ formatDate(transaction.finalized_at) }}</span>
                    </div>
                  </div>
                </div>
              </div>
              <!-- Transacción # -->
              <div class="details-table__row">
                <div class="details-table__name">Transacción #</div>
                <div class="details-table__value">{{ transaction.id }}</div>
              </div>
              <!-- Medio de pago -->
              <div v-if="transaction.payment_method" class="details-table__row">
                <div class="details-table__name">Medio de pago</div>
                <div class="details-table__value">
                  <div class="payment-method-wrapper">
                    <span>{{ transaction.payment_method_type }}</span>
                    <template v-if="transaction.payment_method?.extra">
                      <span v-if="transaction.payment_method.type === 'CARD'" class="separator">-&nbsp;</span>
                      <span v-if="transaction.payment_method.extra?.last_four" class="cardDigits">{{ transaction.payment_method.extra.last_four }}</span>
                    </template>
                  </div>
                </div>
              </div>
              <!-- Referencia -->
              <div class="details-table__row">
                <div class="details-table__name">Referencia</div>
                <div class="details-table__value transaction-reference">{{ transaction.reference }}</div>
              </div>
            </div>
          </div>
        </div>

        <!-- Información del comprador -->
        <h1 class="box-title">Información del comprador</h1>
        <div class="detail__columns__box">
          <div class="details-table">
            <div class="details-table__row">
              <div class="details-table__name">Email</div>
              <div class="details-table__value">{{ transaction.customer_email }}</div>
            </div>
            <div v-if="transaction.customer_data?.full_name" class="details-table__row">
              <div class="details-table__name">Nombres y apellidos</div>
              <div class="details-table__value">{{ transaction.customer_data.full_name }}</div>
            </div>
            <div v-if="transaction.customer_data?.phone_number" class="details-table__row">
              <div class="details-table__name">Número telefónico o celular</div>
              <div class="details-table__value">
                <a :href="'tel:' + transaction.customer_data.phone_number">{{ transaction.customer_data.phone_number }}</a>
              </div>
            </div>
            <div v-if="transaction.customer_data?.legal_id && transaction.customer_data?.legal_id_type" class="details-table__row">
              <div class="details-table__name">Documento de Identidad</div>
              <div class="details-table__value">{{ transaction.customer_data.legal_id }} {{ transaction.customer_data.legal_id_type }}</div>
            </div>
          </div>
        </div>

        <!-- Referencias de pago -->
        <template v-if="transaction.customer_data?.customer_references">
          <h1 class="box-title">Referencias de pago</h1>
          <div class="detail__columns__box">
            <div v-for="(reference, idx) in transaction.customer_data.customer_references" :key="idx" class="details-table">
              <div class="details-table__row">
                <div class="details-table__name">{{ reference.label }}</div>
                <div class="details-table__value">{{ reference.value }}</div>
              </div>
            </div>
          </div>
        </template>

        <!-- Información de envío -->
        <template v-if="transaction.shipping_address">
          <h1 class="box-title">Información de envío</h1>
          <div class="detail__columns__box">
            <div class="details-table">
              <div v-if="transaction.shipping_address.name" class="details-table__row">
                <div class="details-table__name">Nombre de quien recibe</div>
                <div class="details-table__value">{{ transaction.shipping_address.name }}</div>
              </div>
              <div class="details-table__row">
                <div class="details-table__name">Dirección</div>
                <div class="details-table__value">
                  {{ transaction.shipping_address.address_line_1 }}
                  <br v-if="transaction.shipping_address.address_line_2" />
                  <span v-if="transaction.shipping_address.address_line_2">{{ transaction.shipping_address.address_line_2 }}</span>
                  <br v-if="transaction.shipping_address.postal_code" />
                  <span v-if="transaction.shipping_address.postal_code">{{ transaction.shipping_address.postal_code }}</span>
                  <br />
                  {{ transaction.shipping_address.city }}, {{ transaction.shipping_address.region }}, {{ transaction.shipping_address.country }}
                </div>
              </div>
              <div class="details-table__row">
                <div class="details-table__name">Número telefónico o celular</div>
                <div class="details-table__value">{{ transaction.shipping_address.phone_number }}</div>
              </div>
            </div>
          </div>
        </template>

        <!-- Detalles del autorizador (infoPaymentMethod) -->
        <template v-if="transaction.payment_method">
          <h1 class="box-title">Detalles del autorizador</h1>
          <div class="detail__columns__box">

            <!-- NEQUI -->
            <div v-if="transaction.payment_method_type === 'NEQUI'" class="details-table">
              <div class="details-table__row">
                <div class="details-table__name">Número celular usado</div>
                <div class="details-table__value">{{ transaction.payment_method.phone_number }}</div>
              </div>
              <div v-if="transaction.payment_method.extra?.transaction_id" class="details-table__row">
                <div class="details-table__name">ID Transacción Nequi</div>
                <div class="details-table__value">{{ transaction.payment_method.extra.transaction_id }}</div>
              </div>
            </div>

            <!-- PSE -->
            <div v-if="transaction.payment_method_type === 'PSE'" class="details-table">
              <div class="details-table__row">
                <div class="details-table__name">Tipo de cliente</div>
                <div class="details-table__value">{{ userTypeToLocale(transaction.payment_method.user_type) }}</div>
              </div>
              <div class="details-table__row">
                <div class="details-table__name">Documento</div>
                <div class="details-table__value">{{ transaction.payment_method.user_legal_id_type }} {{ transaction.payment_method.user_legal_id }}</div>
              </div>
              <div class="details-table__row">
                <div class="details-table__name">Descripción del pago</div>
                <div class="details-table__value">{{ transaction.payment_method.payment_description }}</div>
              </div>
              <div v-if="transaction.payment_method.extra?.traceability_code" class="details-table__row">
                <div class="details-table__name">CUS (Código Único de Servicio)</div>
                <div class="details-table__value">{{ transaction.payment_method.extra.traceability_code }}</div>
              </div>
              <div v-if="transaction.payment_method.extra?.ticket_id" class="details-table__row">
                <div class="details-table__name">Ticket ID</div>
                <div class="details-table__value">{{ transaction.payment_method.extra.ticket_id }}</div>
              </div>
            </div>

            <!-- CARD -->
            <div v-if="transaction.payment_method_type === 'CARD'" class="details-table">
              <div class="details-table__row">
                <div class="details-table__name">Número de cuotas</div>
                <div class="details-table__value">{{ transaction.payment_method.installments }}</div>
              </div>
              <div v-if="transaction.payment_method.extra?.brand" class="details-table__row">
                <div class="details-table__name">Franquicia</div>
                <div class="details-table__value">{{ transaction.payment_method.extra.brand }}</div>
              </div>
              <div v-if="transaction.payment_method.extra" class="details-table__row">
                <div class="details-table__name">Número de tarjeta (parcial)</div>
                <div class="details-table__value">{{ transaction.payment_method.extra.bin }} •••••• {{ transaction.payment_method.extra.last_four }}</div>
              </div>
              <div v-if="transaction.payment_method.extra?.exp_month" class="details-table__row">
                <div class="details-table__name">Fecha de vencimiento</div>
                <div class="details-table__value">{{ transaction.payment_method.extra.exp_month }} / {{ transaction.payment_method.extra.exp_year }}</div>
              </div>
            </div>

            <!-- BANCOLOMBIA_TRANSFER -->
            <div v-if="transaction.payment_method_type === 'BANCOLOMBIA_TRANSFER'" class="details-table">
              <div class="details-table__row">
                <div class="details-table__name">Tipo de usuario</div>
                <div class="details-table__value">{{ userTypeToLocale(transaction.payment_method.user_type) }}</div>
              </div>
              <div v-if="transaction.payment_method.extra?.external_identifier" class="details-table__row">
                <div class="details-table__name">ID Intención de compra en Bancolombia</div>
                <div class="details-table__value">{{ transaction.payment_method.extra.external_identifier }}</div>
              </div>
            </div>

            <!-- BANCOLOMBIA_COLLECT / BANCOLOMBIA -->
            <div v-if="transaction.payment_method_type === 'BANCOLOMBIA_COLLECT' || transaction.payment_method_type === 'BANCOLOMBIA'" class="details-table">
              <div v-if="transaction.payment_method.extra?.business_agreement_code" class="details-table__row">
                <div class="details-table__name">Código de convenio</div>
                <div class="details-table__value">{{ transaction.payment_method.extra.business_agreement_code }}</div>
              </div>
              <div v-if="transaction.payment_method.extra?.payment_intention_identifier" class="details-table__row">
                <div class="details-table__name">Referencia de pago</div>
                <div class="details-table__value">{{ transaction.payment_method.extra.payment_intention_identifier }}</div>
              </div>
            </div>

            <!-- BANCOLOMBIA_QR -->
            <div v-if="transaction.payment_method_type === 'BANCOLOMBIA_QR'" class="details-table">
              <div class="details-table__row">
                <div class="details-table__name">Tipo de transacción</div>
                <div class="details-table__value">Bancolombia QR</div>
              </div>
              <div v-if="transaction.payment_method.extra?.external_identifier" class="details-table__row">
                <div class="details-table__name">ID conciliación QR Bancolombia</div>
                <div class="details-table__value">{{ transaction.payment_method.extra.external_identifier }}</div>
              </div>
            </div>

            <!-- PCOL -->
            <div v-if="transaction.payment_method_type === 'PCOL'" class="details-table">
              <div v-if="transaction.payment_method.extra?.external_identifier" class="details-table__row">
                <div class="details-table__name">ID Transacción Puntos Colombia</div>
                <div class="details-table__value">{{ transaction.payment_method.extra.external_identifier }}</div>
              </div>
            </div>
          </div>
        </template>

        <!-- Detalle de Impuestos -->
        <template v-if="transaction.taxes && transaction.taxes.length > 0">
          <h1 class="box-title">Detalle de Impuestos</h1>
          <div class="detail__columns__box">
            <div v-for="(tax, idx) in transaction.taxes" :key="idx" class="details-table">
              <h1 class="box-title">{{ getTranslatedTaxType(tax.type, transaction.currency) }}</h1>
              <div class="details-table__row">
                <div class="details-table__name">Monto</div>
                <div class="details-table__value">{{ transaction.currency }} {{ formatPrice(tax.amount_in_cents) }}</div>
              </div>
            </div>
          </div>
        </template>

        <!-- Entradas contables -->
        <template v-if="transaction.entries && transaction.entries.length > 0">
          <h1 class="box-title">Entradas contables</h1>
          <div class="detail__columns__box">
            <table class="entries-table">
              <thead>
                <tr>
                  <th>Concepto</th>
                  <th>Monto</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(entry, idx) in transaction.entries" :key="idx">
                  <td>{{ translatedConcepts[entry.concept] || entry.concept }}</td>
                  <td :class="{ 'negative-amount': entry.amount_in_cents < 0 }">{{ formatPrice(entry.amount_in_cents) }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </template>

        <!-- Lista de reembolsos -->
        <template v-if="transaction.payment_method_type === 'CARD' && transaction.refunds">
          <h1 class="box-title">Lista de reembolsos</h1>
          <div class="detail__columns__box">
            <table class="entries-table">
              <thead>
                <tr>
                  <th>Fecha y hora</th>
                  <th>Monto</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(refund, idx) in transaction.refunds" :key="idx">
                  <td>
                    <div class="full-date-wrapper">
                      <div class="time-wrapper">
                        <i class="mat-icon">access_time</i>
                        <span class="time">{{ formatTime(refund.created_at) }}</span>
                      </div>
                      <div class="date-wrapper">
                        <i class="mat-icon">date_range</i>
                        <span class="range">{{ formatDate(refund.created_at) }}</span>
                      </div>
                    </div>
                  </td>
                  <td :class="{ 'negative-amount': refund.amount_in_cents < 0 }">
                    {{ transaction.currency }} {{ formatPrice(refund.amount_in_cents) }}
                  </td>
                  <td>
                    <span class="custom-tag" :class="'tag--' + disbursementStatusToTagType(refund.status)">
                      {{ disbursementStatusToString(refund.status) }}
                    </span>
                  </td>
                </tr>
              </tbody>
            </table>
            <p v-if="!transaction.refunds || transaction.refunds.length === 0" style="text-align: center; color: #999; padding: 1rem;">
              No hay reembolsos registrados
            </p>
          </div>
        </template>
      </div>

      <!-- Right Column -->
      <div class="detail__column">
        <!-- Desembolso -->
        <template v-if="transaction.disbursement">
          <h1 class="box-title">Desembolso</h1>
          <div class="detail__columns__box">
            <div class="details-table">
              <div class="details-table__row">
                <div class="details-table__name">Estado</div>
                <div class="details-table__value">
                  <span class="custom-tag" :class="'tag--' + disbursementStatusToTagType(transaction.disbursement.status)">
                    {{ disbursementStatusToString(transaction.disbursement.status) }}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </template>

        <!-- Información del link de pago -->
        <template v-if="paymentLink">
          <h1 class="box-title">Información del link de pago</h1>
          <div class="detail__columns__box">
            <div class="details-table">
              <div v-if="paymentLink.image_url" class="details-table__image">
                <img :src="paymentLink.image_url" />
              </div>
              <div class="details-table__row">
                <div class="details-table__name">Nombre</div>
                <div class="details-table__value">{{ paymentLink.name }}</div>
              </div>
              <div v-if="paymentLink.description" class="details-table__row">
                <div class="details-table__name">Descripción</div>
                <div class="details-table__value">{{ paymentLink.description }}</div>
              </div>
              <div v-if="paymentLink.expires_at" class="details-table__row">
                <div class="details-table__name">Fecha de expiración</div>
                <div class="details-table__value">
                  <div class="date-wrapper">
                    <i class="mat-icon">date_range</i>
                    <span class="range">{{ formatDate(paymentLink.expires_at) }}</span>
                  </div>
                  <div class="time-wrapper">
                    <i class="mat-icon">access_time</i>
                    <span class="time">{{ formatTime(paymentLink.expires_at) }}</span>
                  </div>
                </div>
              </div>
              <div v-if="paymentLink.sku" class="details-table__row">
                <div class="details-table__name">SKU</div>
                <div class="details-table__value">{{ paymentLink.sku }}</div>
              </div>
            </div>
            <div class="payment__link-more-details">
              <a :href="'/payment-links/' + paymentLink.id" class="menu-item">Ver link de pago</a>
            </div>
          </div>
        </template>

        <!-- Operaciones avanzadas (Anular) -->
        <template v-if="canVoid">
          <h1 class="box-title">Operaciones avanzadas</h1>
          <div class="detail__columns__box">
            <button class="btn-void" :disabled="isVoiding" @click="voidTxn">
              {{ isVoiding ? 'Anulando...' : 'Anular transacción' }}
            </button>
            <p>&nbsp;</p>
            <small>
              <strong>Importante:</strong>
              <span> La anulación de una transacción no tiene costo y se recomienda realizarla como máximo 2 horas después de aprobada la transacción; la posibilidad de hacerla varía según los tiempos de compensación de la red de autorización.</span>
            </small>
          </div>
        </template>
      </div>
    </div>
  </div>
</template>


<script setup lang="ts">
import { useTransactionsApi } from '~/composables/useTransactionsApi'

const route = useRoute()
const router = useRouter()
const { getTransaction } = useTransactionsApi()

// State
const transaction = ref<any>(null)
const paymentLink = ref<any>(null)
const loading = ref(false)
const error = ref<string | null>(null)
const isVoiding = ref(false)

// Translated concepts for accounting entries
const translatedConcepts: Record<string, string> = {
  PAYMENT: 'Pago',
  RETEICA_DEDUCTION: 'Reteica',
  RETEIVA_DEDUCTION: 'Reteiva',
  RETENTION_TAX: 'Retención en la fuente',
  CONSUMPTION_TAX_DEDUCTION: 'Deducción impuesto de consumo',
  PROVIDER_COMISSION: 'Comisión del proveedor',
  COMISSION_TAX: 'Impuesto de la comisión',
  FINANCIAL_MOVEMENT_TAX: 'Impuesto del movimiento financiero',
  TRANSACTION_FEE: 'Comisión',
  TRANSACTION_FEE_VAT: 'IVA de la comisión',
  VOID: 'Anulación',
  TRANSACTION_FEE_VOID: 'Devolución comisión de anulación',
  TRANSACTION_FEE_VAT_VOID: 'Devolución IVA comisión de anulación',
  VAT: 'ITBMS',
  VAT_IVA: 'IVA',
  CONSUMPTION: 'Impuesto al Consumo',
}

// Computed
const canVoid = computed(() => {
  if (!transaction.value) return false
  const t = transaction.value
  if (t.payment_method_type !== 'CARD' || t.status !== 'APPROVED') return false
  const now = Date.now()
  const created = new Date(t.created_at).getTime()
  const diff = (now - created) / 1000
  const maxSeconds = 60 * 60 * 12 // 12 hours
  return diff > 0 && diff < maxSeconds && (!t.refunds || t.refunds.length === 0)
})

// Methods
function goBack() {
  router.push('/transactions')
}

function formatPrice(amountInCents: number): string {
  if (typeof amountInCents !== 'number') return ''
  const amount = amountInCents / 100
  return new Intl.NumberFormat('es-CO', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount)
}

function formatTime(input: string): string {
  if (!input) return 'N/A'
  const d = new Date(input)
  const hours = d.getHours()
  const minutes = d.getMinutes()
  const ampm = hours >= 12 ? 'PM' : 'AM'
  const h = hours % 12 || 12
  return `${h.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')} ${ampm}`
}

function formatDate(input: string): string {
  if (!input) return 'N/A'
  const d = new Date(input)
  const months = ['ene.', 'feb.', 'mar.', 'abr.', 'may.', 'jun.', 'jul.', 'ago.', 'sep.', 'oct.', 'nov.', 'dic.']
  const currentYear = new Date().getFullYear()
  const month = months[d.getMonth()]
  const day = d.getDate().toString().padStart(2, '0')
  if (d.getFullYear() === currentYear) {
    return `${month} ${day}`
  }
  return `${month} ${day}, ${d.getFullYear()}`
}

function filterStatus(status: string) {
  switch (status) {
    case 'APPROVED':
      return { text: 'Aprobada', color: 'success' }
    case 'DECLINED':
      return { text: 'Declinada', color: 'danger' }
    case 'ERROR':
      return { text: 'Error', color: 'transaction-error' }
    case 'PENDING':
      return { text: 'Pendiente', color: 'warning' }
    case 'VOIDED':
      return { text: 'Anulada', color: 'transaction-voided' }
    default:
      return { text: status, color: 'info' }
  }
}

function disbursementStatusToTagType(status: string): string {
  if (status === 'APPROVED') return 'success'
  if (status === 'DECLINED') return 'danger'
  if (status === 'IN_PROGRESS') return 'warning'
  if (status === 'ERROR') return 'transaction-error'
  if (status === 'PENDING') return 'info'
  return 'info'
}

function disbursementStatusToString(status: string): string {
  if (status === 'APPROVED') return 'COMPLETADO'
  if (status === 'DECLINED') return 'RECHAZADO'
  if (status === 'IN_PROGRESS') return 'EN PROGRESO'
  if (status === 'ERROR') return 'ERROR'
  if (status === 'PENDING') return 'PENDIENTE'
  return status
}

function userTypeToLocale(userType: any): string {
  if (userType === 'PERSON' || userType === 0) return 'Persona natural'
  if (userType === 'BUSINESS' || userType === 1) return 'Persona jurídica'
  return '-'
}

function getTranslatedTaxType(type: string, currency: string): string {
  if (currency === 'COP' && translatedConcepts[type + '_IVA']) {
    return translatedConcepts[type + '_IVA']
  }
  return translatedConcepts[type] || type
}

function voidTxn() {
  const toVoid = confirm('¿Estás seguro que quieres anular la transacción?')
  if (!toVoid) return
  isVoiding.value = true
  // TODO: Implement void API call
  setTimeout(() => {
    isVoiding.value = false
    fetchTransaction()
  }, 2000)
}

async function fetchTransaction() {
  const id = route.params.id as string
  loading.value = true
  error.value = null
  try {
    const response = await getTransaction(id)
    transaction.value = response.data
    // Fetch payment link if available
    if (transaction.value?.payment_link_id) {
      // TODO: fetch payment link details
      paymentLink.value = null
    }
  } catch (e: unknown) {
    error.value = e instanceof Error ? e.message : 'Error al cargar la transacción'
  } finally {
    loading.value = false
  }
}

onMounted(fetchTransaction)
</script>


<style scoped>
/* === ViewTitle === */
.view-title {
  background: #2A2C29;
  color: #fff;
  position: relative;
}
.view-title .container {
  position: relative;
  height: 100px;
}
.view-title .left {
  position: absolute;
  left: 2.375rem;
  top: 50%;
  transform: translateY(-50%);
}
.view-title .left .back-arrow {
  cursor: pointer;
  display: inline-block;
  vertical-align: middle;
  margin-right: 0.5em;
  padding-right: 0.25em;
  font-size: 1.2rem;
  color: #BDF4BC;
}
.view-title .left .title {
  font-size: 1.6rem;
  display: inline-block;
  vertical-align: middle;
}

/* === View Content === */
.view-content {
  padding: 2rem 2.375rem;
}

/* === Detail Layout === */
.detail .box-title {
  font-size: 1rem;
  color: #252525;
  font-weight: 600;
  margin-bottom: 0.625rem;
}
.detail__columns__box {
  width: 100%;
  padding: 1.25rem;
  border-radius: 3px;
  box-shadow: 3px 3px 17px 0 rgba(174, 197, 215, 0.18);
  background-color: #fff;
  border: solid 1px #eee;
  margin-bottom: 1.625rem;
}
.detail__column {
  display: inline-block;
  vertical-align: top;
}

@media screen and (min-width: 72.75rem) {
  .detail__column:first-child {
    width: 58%;
    margin-right: 4%;
  }
  .detail__column:last-child {
    width: 38%;
  }
}
@media screen and (max-width: 72.74rem) {
  .detail__column {
    display: block;
    width: 100%;
  }
}

/* === Payment Overview Bar === */
.detail__columns__payment-details__box__payment-overview {
  margin-bottom: 0.4375rem;
  height: 2.9375rem;
  background-color: #e4ddff;
  display: flex;
  align-items: center;
  justify-content: center;
}
.detail__columns__payment-details__box__payment-overview span {
  color: #2A2C29;
}
.detail__columns__payment-details__box__payment-overview span:not(:first-child) {
  margin-left: 0.3rem;
}
.detail__columns__payment-details__box__payment-overview span.money {
  font-size: 1.25rem;
  font-weight: 600;
}
.detail__columns__payment-details__box__payment-overview span.email {
  font-weight: 400;
}

/* === Details Table === */
.details-table .details-table__row {
  border-bottom: 1px solid #eee;
  padding: 0.4rem 0;
  font-size: 0.85rem;
  line-height: 2.2em;
  display: flex;
  justify-content: space-between;
}
.details-table .details-table__row .details-table__name {
  color: #555555;
  font-weight: 400;
}
.details-table .details-table__row .details-table__value {
  color: #252525;
  font-weight: bold;
  text-align: right;
}
.details-table.transaction-details .details-table__name {
  width: 35%;
}
.details-table.transaction-details .details-table__value {
  width: 65%;
}
.details-table .details-table__value.transaction-reference {
  font-family: monospace;
  word-break: break-word;
}
.details-table .details-table__image {
  text-align: center;
}
.details-table .details-table__image img {
  max-width: 10rem;
}

/* === Date/Time Wrappers === */
.full-date-wrapper {
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;
}
.time-wrapper,
.date-wrapper {
  display: inline-flex;
  align-items: center;
  gap: 0.2rem;
}
.time-wrapper .mat-icon,
.date-wrapper .mat-icon {
  font-size: 1rem;
  color: #999;
}
.time-wrapper .time,
.date-wrapper .range {
  font-size: 0.85rem;
}

/* === Payment Method Wrapper === */
.payment-method-wrapper {
  display: flex;
  justify-content: flex-end;
  align-items: center;
}
.payment-method-wrapper .separator {
  margin-right: 0.5rem;
}

/* === Status Tags === */
.custom-tag {
  display: inline-block;
  padding: 0.15rem 0.6rem;
  border-radius: 3px;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  margin-left: auto;
}
.tag--success {
  background-color: #e8f8ee;
  color: #52cd87;
}
.tag--danger {
  background-color: #ffdce5;
  color: #f64d79;
}
.tag--warning {
  background-color: #fff2df;
  color: #ff9c1b;
}
.tag--transaction-error {
  background-color: #eee;
  color: #888;
}
.tag--transaction-voided {
  background-color: #ebf4ff;
  color: #409eff;
}
.tag--info {
  background-color: #d6e1ff;
  color: #4376ff;
}

/* === Negative Amount === */
.negative-amount {
  color: #f64d79;
}

/* === Entries Table === */
.entries-table {
  width: 100%;
  border-collapse: collapse;
}
.entries-table th {
  text-align: left;
  font-size: 0.8rem;
  color: #999;
  font-weight: 600;
  padding: 0.5rem 0;
  border-bottom: 1px solid #eee;
}
.entries-table td {
  font-size: 0.875rem;
  color: #555;
  padding: 0.5rem 0;
  border-bottom: 1px solid #eee;
}

/* === Void Button === */
.btn-void {
  width: 100%;
  padding: 0.75rem 1rem;
  background-color: #f64d79;
  color: #fff;
  border: none;
  border-radius: 4px;
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
}
.btn-void:hover {
  background-color: #e03a65;
}
.btn-void:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

/* === Retry Button === */
.retry-btn {
  margin-top: 1rem;
  padding: 0.5rem 1.5rem;
  background-color: #4376ff;
  color: #fff;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.9rem;
}

/* === Payment Link More Details === */
.payment__link-more-details {
  text-align: center;
  margin: 1rem 0 0;
}
.payment__link-more-details a.menu-item {
  font-size: 0.9em;
  color: #4376ff;
  text-decoration: none;
}
.payment__link-more-details a.menu-item:hover {
  text-decoration: underline;
}

/* === Material Icons (inline text icons) === */
.mat-icon {
  font-family: 'Material Icons';
  font-weight: normal;
  font-style: normal;
  font-size: 1.1rem;
  display: inline-block;
  line-height: 1;
  text-transform: none;
  letter-spacing: normal;
  word-wrap: normal;
  white-space: nowrap;
  direction: ltr;
  vertical-align: middle;
  -webkit-font-smoothing: antialiased;
}

/* === Responsive === */
@media screen and (max-width: 30rem) {
  .view-title .left {
    left: 1rem;
  }
  .view-title .left .title {
    font-size: 1.3rem;
  }
  .view-content {
    padding: 1.5rem 1rem;
  }
  .detail__columns__box {
    padding: 0.5rem;
  }
  .detail__columns__payment-details__box__payment-overview span.money {
    font-size: 0.9rem;
  }
  .detail__columns__payment-details__box__payment-overview span.email {
    font-size: 0.9rem;
  }
  .full-date-wrapper {
    flex-direction: column;
    gap: 0.25rem;
  }
}
</style>
