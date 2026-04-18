<template>
  <div class="create-payment-page">
    <!-- View Title Bar -->
    <div class="view-title-bar">
      <div class="view-title-bar__container">
        <span class="view-title-bar__text">Pagos a terceros</span>
      </div>
    </div>

    <!-- Content -->
    <div class="create-payment-content">
      <h2 class="section-title">Crear pago</h2>

      <!-- Success confirmation -->
      <div v-if="store.lastPayoutId" class="success-card">
        <div class="success-card__header">
          <UIcon name="i-heroicons-check-circle" class="success-icon" />
          <span>Pago creado exitosamente</span>
        </div>
        <div class="success-card__id">
          <span class="id-label">ID de transacción</span>
          <code class="id-value">{{ store.lastPayoutId }}</code>
        </div>
        <div v-if="requiresApproval" class="success-card__warning">
          <UIcon name="i-heroicons-exclamation-triangle" class="warning-icon" />
          <span>Este pago requiere aprobación antes de ser procesado.</span>
        </div>
        <div class="success-card__actions">
          <UButton color="primary" class="action-btn" @click="resetForm">
            Crear otro pago
          </UButton>
          <UButton variant="outline" color="neutral" class="action-btn" @click="navigateTo('/payouts/consultTransactions')">
            Ver transacciones
          </UButton>
        </div>
      </div>

      <!-- Payment Form -->
      <div v-else class="form-card">
        <!-- Destination type -->
        <div class="form-group">
          <label class="form-label">Tipo de destinatario</label>
          <USelect v-model="form.destinationType" :items="destinationTypes" class="form-input" />
        </div>

        <!-- Bank + Account type row -->
        <div class="form-row">
          <div class="form-group">
            <label class="form-label">Banco *</label>
            <UInput v-model="form.bankName" placeholder="Ej: Bancolombia" class="form-input" />
          </div>
          <div class="form-group">
            <label class="form-label">Tipo de cuenta *</label>
            <USelect v-model="form.accountType" :items="accountTypes" class="form-input" />
          </div>
        </div>

        <!-- Account number -->
        <div class="form-group">
          <label class="form-label">Número de cuenta *</label>
          <UInput v-model="form.accountNumber" placeholder="Ej: 12345678901" class="form-input" />
        </div>

        <!-- Amount + Payment type row -->
        <div class="form-row">
          <div class="form-group">
            <label class="form-label">Monto (en pesos) *</label>
            <UInput v-model.number="form.amount" type="number" placeholder="50000" :min="1" class="form-input" />
          </div>
          <div class="form-group">
            <label class="form-label">Tipo de pago</label>
            <USelect v-model="form.paymentType" :items="paymentTypes" class="form-input" />
          </div>
        </div>

        <!-- Concept -->
        <div class="form-group">
          <label class="form-label">Concepto *</label>
          <UInput v-model="form.concept" placeholder="Ej: Pago proveedor marzo" class="form-input" />
        </div>

        <!-- Error -->
        <div v-if="store.error" class="form-error">
          <UIcon name="i-heroicons-exclamation-circle" />
          {{ store.error }}
        </div>

        <!-- Submit -->
        <div class="form-actions">
          <UButton
            color="primary"
            class="submit-btn"
            :loading="store.loading"
            :disabled="!isValid"
            @click="handleSubmit"
          >
            Crear pago
          </UButton>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { usePaymentsStore } from '~/stores/payments'
import type { CreatePayoutRequest } from '@wompi/types'

const store = usePaymentsStore()
const requiresApproval = ref(false)

const destinationTypes = ['Cuenta bancaria', 'Favorito']
const accountTypes = ['Ahorros', 'Corriente']
const paymentTypes = ['Pago a proveedor', 'Nómina', 'Reembolso', 'Otro']

const form = reactive({
  destinationType: 'Cuenta bancaria',
  bankName: '',
  accountType: 'Ahorros',
  accountNumber: '',
  amount: null as number | null,
  paymentType: 'Pago a proveedor',
  concept: '',
})

const isValid = computed(() =>
  form.bankName.trim() !== '' &&
  form.accountNumber.trim() !== '' &&
  form.amount !== null && form.amount > 0 &&
  form.concept.trim() !== ''
)

async function handleSubmit() {
  const payload: CreatePayoutRequest = {
    amount_in_cents: (form.amount || 0) * 100,
    destination: {
      type: form.destinationType === 'Favorito' ? 'FAVORITE' : 'BANK_ACCOUNT',
      bank_name: form.bankName.trim(),
      account_number: form.accountNumber.trim(),
      account_type: form.accountType,
    },
    concept: form.concept.trim(),
    payment_type: form.paymentType,
  }

  const result = await store.submitPayout(payload)
  if (result && store.lastPayoutId) {
    requiresApproval.value = (form.amount || 0) >= 5000000
  }
}

function resetForm() {
  form.bankName = ''
  form.accountNumber = ''
  form.amount = null
  form.concept = ''
  form.destinationType = 'Cuenta bancaria'
  form.accountType = 'Ahorros'
  form.paymentType = 'Pago a proveedor'
  store.lastPayoutId = null
  store.error = null
  requiresApproval.value = false
}
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
.create-payment-content {
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

/* Form card */
.form-card {
  background: #fff;
  border: 1px solid #e0e0e0;
  border-radius: 16px;
  padding: 32px;
  max-width: 640px;
  box-shadow: 0px 1px 8px 0px rgba(0, 0, 0, 0.08);
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.form-label {
  font-size: 0.875rem;
  font-weight: 600;
  color: #2C2A29;
}

.form-input {
  width: 100%;
}

.form-error {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 0.875rem;
  color: #dc2626;
}

.form-actions {
  padding-top: 8px;
}

.submit-btn {
  font-size: 1rem;
  font-weight: 600;
  padding: 0.75em 2em;
  border-radius: 2rem;
}

/* Success card */
.success-card {
  background: #F2FDF1;
  border: 1px solid #BDF4BC;
  border-radius: 16px;
  padding: 32px;
  max-width: 640px;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.success-card__header {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 1.125rem;
  font-weight: 700;
  color: #1A624C;
}

.success-icon {
  font-size: 1.5rem;
  color: #40A940;
}

.success-card__id {
  background: #fff;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.id-label {
  font-size: 0.75rem;
  font-weight: 600;
  color: #888;
  text-transform: uppercase;
}

.id-value {
  font-size: 0.875rem;
  color: #2C2A29;
  word-break: break-all;
}

.success-card__warning {
  background: #FFFBEB;
  border: 1px solid #FDE68A;
  border-radius: 8px;
  padding: 12px 16px;
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.875rem;
  color: #92400E;
}

.warning-icon {
  font-size: 1rem;
  color: #F59E0B;
  flex-shrink: 0;
}

.success-card__actions {
  display: flex;
  gap: 12px;
}

.action-btn {
  border-radius: 2rem;
  font-weight: 600;
}

/* Responsive */
@media screen and (max-width: 48rem) {
  .view-title-bar__text {
    font-size: 1.3rem;
  }

  .view-title-bar__container {
    justify-content: center;
  }

  .form-row {
    grid-template-columns: 1fr;
  }

  .form-card {
    padding: 20px;
  }

  .success-card {
    padding: 20px;
  }

  .success-card__actions {
    flex-direction: column;
  }
}
</style>
