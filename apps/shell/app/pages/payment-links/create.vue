<template>
  <div class="create-link-page">
    <!-- View Title Bar with back arrow -->
    <div class="view-title-bar">
      <div class="view-title-bar__container">
        <a class="back-arrow" @click="navigateTo('/payment-links')">
          <UIcon name="i-heroicons-arrow-left" />
        </a>
        <span class="view-title-bar__text">Creando link de pago</span>
      </div>
    </div>

    <!-- Content -->
    <div class="create-link-content">
      <!-- Success state -->
      <div v-if="createdLink" class="success-card">
        <div class="success-card__header">
          <UIcon name="i-heroicons-check-circle" class="success-icon" />
          <span>Link de pago creado</span>
        </div>
        <p class="success-card__msg">¡Tu link de pago ya está disponible!</p>
        <div class="success-card__url">
          <span class="url-label">URL del link</span>
          <code class="url-value">{{ createdLink.url || createdLink.id }}</code>
        </div>
        <div class="success-card__actions">
          <button class="btn-primary" @click="navigateTo(`/payment-links/${createdLink.id}`)">Ver link</button>
          <button class="btn-outline" @click="resetForm">Crear otro</button>
        </div>
      </div>

      <!-- Form -->
      <template v-else>
        <div class="form-header">
          <span class="form-header__title">Llena los siguientes datos</span>
        </div>

        <div class="form-box">
          <p class="required-note">Los campos resaltados con asterisco<span class="asterisk">*</span> son obligatorios</p>

          <!-- Basic info section -->
          <h3 class="form-section-title">Información básica</h3>

          <div class="form-group required">
            <label class="form-label">Nombre del producto o servicio</label>
            <UInput v-model="form.name" placeholder="Nombre del producto o servicio que vas a vender" />
          </div>

          <div class="form-group required">
            <label class="form-label">Descripción</label>
            <UTextarea v-model="form.description" placeholder="Ingresa aquí la descripción" :rows="3" />
          </div>

          <div class="form-group required">
            <label class="form-label">{{ showTaxField ? 'Precio con impuestos' : 'Precio' }}</label>
            <div class="price-row">
              <div v-if="!isOpenAmount" class="price-input-wrapper">
                <UInput v-model.number="form.amount" type="number" placeholder="Monto a pagar" :min="1" />
              </div>
              <div v-else class="open-amount-notice">
                <UIcon name="i-heroicons-information-circle" class="info-icon" />
                El pagador establecerá el precio
              </div>
              <label class="checkbox-label">
                <input type="checkbox" v-model="isOpenAmount" />
                <span>El cliente establece el precio</span>
              </label>
            </div>
          </div>

          <!-- Additional settings section -->
          <h3 class="form-section-title">Configuraciones adicionales</h3>

          <div class="form-group">
            <label class="form-label">¿Solicitar información de envío?</label>
            <p class="form-hint">En caso de que necesites hacer un envío, Wompi solicitará esta información al pagador</p>
            <USelect v-model="form.collect_shipping" :items="yesNoOptions" class="select-small" />
          </div>

          <div class="form-group">
            <label class="form-label">¿Solicitar documento de identidad del pagador?</label>
            <p class="form-hint">Se le solicitará al pagador tipo y número de documento</p>
            <USelect v-model="form.collect_customer_legal_id" :items="yesNoOptions" class="select-small" />
          </div>

          <div class="form-group">
            <label class="form-label">¿Pago único?</label>
            <p class="form-hint">Inhabilita el link de pago después del primer pago aprobado</p>
            <USelect v-model="form.single_use" :items="yesNoOptions" class="select-small" />
          </div>

          <div class="form-group">
            <label class="form-label form-label--optional">¿Vencimiento del link de pago?</label>
            <p class="form-hint">Fecha y hora a partir de las cuales el link no podrá ser usado</p>
            <UInput v-model="form.expires_at" type="datetime-local" class="input-medium" />
          </div>

          <div class="form-group">
            <label class="form-label form-label--optional">Link de redirección</label>
            <p class="form-hint">URL a donde se redirigirá después de completar el pago</p>
            <UInput v-model="form.redirect_url" placeholder="URL de redirección" />
          </div>

          <div class="form-group">
            <label class="form-label form-label--optional">Código de producto o SKU</label>
            <p class="form-hint">Referencia interna del producto en el comercio (opcional)</p>
            <UInput v-model="form.sku" placeholder="Ejp: CDX-LG28UD-001" class="input-medium" />
          </div>

          <!-- Customer references section -->
          <h3 class="form-section-title">Solicitar datos adicionales al pagador (opcional)</h3>

          <div class="info-alert">
            <UIcon name="i-heroicons-megaphone" class="alert-icon" />
            <span>
              Usa estas <strong>referencias para solicitar información adicional a tus clientes</strong> (máx. 2).
              Por ejemplo: <em>Número de factura; Apartamento; Código de estudiante; Talla; etc.</em>
            </span>
          </div>

          <div v-for="(ref, idx) in visibleReferences" :key="idx" class="reference-row">
            <div class="form-group">
              <label class="form-label">Nombre Referencia {{ idx + 1 }}</label>
              <UInput v-model="ref.label" placeholder="Nombre de la referencia" maxlength="24" />
            </div>
            <div class="form-group">
              <label class="form-label">¿Es obligatoria?</label>
              <USelect v-model="ref.is_required" :items="yesNoRequiredOptions" class="select-small" />
            </div>
          </div>

          <button
            v-if="shownReferences < 2"
            class="btn-add"
            @click="shownReferences++"
          >
            <UIcon name="i-heroicons-plus-circle" />
            <strong>Solicitar referencia adicional al pagador</strong>
          </button>

          <hr class="divider" />

          <!-- Error -->
          <div v-if="error" class="form-error">
            <UIcon name="i-heroicons-exclamation-circle" />
            {{ error }}
          </div>

          <!-- Submit -->
          <button
            class="btn-primary btn-submit"
            :disabled="!isValid || submitting"
            @click="handleSubmit"
          >
            <span v-if="submitting" class="spinner-small"></span>
            Crear link de pago
          </button>
        </div>
      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
import { usePaymentLinksApi } from '~/composables/usePaymentLinksApi'

const { createPaymentLink } = usePaymentLinksApi()

const submitting = ref(false)
const error = ref<string | null>(null)
const createdLink = ref<any>(null)
const isOpenAmount = ref(false)
const showTaxField = ref(false)
const shownReferences = ref(0)

const form = reactive({
  name: '',
  description: '',
  amount: null as number | null,
  single_use: 'No',
  collect_shipping: 'No',
  collect_customer_legal_id: 'No',
  expires_at: '',
  redirect_url: '',
  sku: '',
})

const customerReferences = reactive([
  { label: '', is_required: 'Sí' },
  { label: '', is_required: 'Sí' },
])

const yesNoOptions = [
  { label: 'No', value: 'No' },
  { label: 'Sí', value: 'Sí' },
]

const yesNoRequiredOptions = [
  { label: 'Sí', value: 'Sí' },
  { label: 'No', value: 'No' },
]

const visibleReferences = computed(() => customerReferences.slice(0, shownReferences.value))

const isValid = computed(() =>
  form.name.trim() !== '' &&
  form.description.trim() !== '' &&
  (isOpenAmount.value || (form.amount !== null && form.amount > 0))
)

async function handleSubmit() {
  submitting.value = true
  error.value = null
  try {
    const body: Record<string, any> = {
      name: form.name.trim(),
      description: form.description.trim(),
      currency: 'COP',
      single_use: form.single_use === 'Sí',
      collect_shipping: form.collect_shipping === 'Sí',
      collect_customer_legal_id: form.collect_customer_legal_id === 'Sí',
    }

    if (!isOpenAmount.value && form.amount) {
      body.amount_in_cents = form.amount * 100
    }
    if (form.expires_at) body.expires_at = form.expires_at
    if (form.redirect_url.trim()) body.redirect_url = form.redirect_url.trim()
    if (form.sku.trim()) body.sku = form.sku.trim()

    const refs = customerReferences
      .slice(0, shownReferences.value)
      .filter(r => r.label.trim())
      .map(r => ({ label: r.label.trim(), is_required: r.is_required === 'Sí' }))
    if (refs.length > 0) body.customer_data = { customer_references: refs }

    const response = await createPaymentLink(body)
    createdLink.value = response.data
  } catch (e: unknown) {
    error.value = e instanceof Error ? e.message : 'El link de pago no pudo ser creado. Por favor intenta más tarde.'
  } finally {
    submitting.value = false
  }
}

function resetForm() {
  form.name = ''
  form.description = ''
  form.amount = null
  form.single_use = 'No'
  form.collect_shipping = 'No'
  form.collect_customer_legal_id = 'No'
  form.expires_at = ''
  form.redirect_url = ''
  form.sku = ''
  isOpenAmount.value = false
  shownReferences.value = 0
  customerReferences[0].label = ''
  customerReferences[1].label = ''
  createdLink.value = null
  error.value = null
}
</script>

<style scoped>
/* View Title Bar */
.view-title-bar { background: #2C2A29; color: #fff; }
.view-title-bar__container { max-width: 74.25rem; margin: 0 auto; height: 100px; display: flex; align-items: center; padding: 0 1.5rem; gap: 0.75rem; }
.view-title-bar__text { font-size: 1.6rem; }
.back-arrow { cursor: pointer; color: #DFFF61; font-size: 1.2rem; display: flex; align-items: center; padding-right: 0.25em; }

/* Content */
.create-link-content { max-width: 74.25rem; margin: 0 auto; padding: 1.75rem 2rem; }

/* Form header */
.form-header { margin-bottom: 0.8125rem; }
.form-header__title { color: #2C2A29; font-size: 1rem; font-weight: 600; }

/* Form box — matches legacy el-form */
.form-box {
  padding: 1.5rem;
  background: #fafafa;
  box-shadow: 3px 3px 17px 0 rgba(174, 197, 215, 0.18);
  border-radius: 4px;
}

.required-note { font-size: 0.875rem; color: #555; margin-bottom: 1rem; }
.asterisk { color: #F56C6C; font-weight: bold; }

/* Section titles — matches legacy create-link__form-title */
.form-section-title {
  font-size: 1.1rem;
  font-weight: bold;
  margin: 1.5rem 0 0.75rem;
  color: #2C2A29;
  border-bottom: 1px solid #e0e0e0;
  padding-bottom: 0.1em;
}

/* Form groups */
.form-group { margin-bottom: 1.2rem; }
.form-group.required .form-label::after { content: '*'; color: #F56C6C; display: inline-block; margin-left: 2px; }
.form-label { display: block; font-size: 0.875rem; font-weight: 600; color: #333; margin-bottom: 0.35rem; }
.form-label--optional { color: #888; }
.form-hint { font-size: 0.8rem; color: #999; margin: 0 0 0.25rem; }

/* Price row */
.price-row { display: flex; align-items: center; gap: 1rem; flex-wrap: wrap; }
.price-input-wrapper { flex: 0 0 250px; }
.open-amount-notice { display: flex; align-items: center; gap: 6px; background: #F0FFF4; border: 1px solid #C6F6D5; border-radius: 4px; padding: 0.5rem 0.75rem; font-size: 0.875rem; color: #276749; }
.info-icon { color: #38A169; }
.checkbox-label { display: flex; align-items: center; gap: 6px; font-size: 0.875rem; color: #555; cursor: pointer; }
.checkbox-label input { accent-color: #2C2A29; }

/* Selects */
.select-small { width: 8rem; }
.input-medium { width: 16rem; }

/* Info alert — matches legacy el-alert */
.info-alert {
  display: flex; align-items: flex-start; gap: 8px;
  background: #ECF5FF; border: 1px solid #B3D8FF; border-radius: 4px;
  padding: 12px; font-size: 0.8125rem; color: #333; margin-bottom: 1rem; line-height: 1.4;
}
.alert-icon { color: #409EFF; font-size: 1rem; flex-shrink: 0; margin-top: 2px; }

/* Reference row */
.reference-row { display: flex; gap: 1rem; align-items: flex-end; flex-wrap: wrap; }
.reference-row .form-group { flex: 1; min-width: 200px; }

/* Buttons */
.btn-add {
  display: inline-flex; align-items: center; gap: 6px;
  background: none; border: 1px solid #dcdfe6; border-radius: 4px;
  padding: 0.4rem 0.75rem; font-size: 0.8125rem; color: #333; cursor: pointer;
  margin-bottom: 1rem;
}
.btn-add:hover { background: #f5f5f5; }

.btn-primary {
  background: #2C2A29; color: #DFFF61; border: none; border-radius: 4px;
  padding: 0.65rem 1.5rem; font-size: 1rem; font-weight: bold; cursor: pointer;
}
.btn-primary:hover { opacity: 0.9; }
.btn-primary:disabled { opacity: 0.5; cursor: not-allowed; }
.btn-submit { margin-top: 1rem; }

.btn-outline {
  background: none; border: 1px solid #2C2A29; color: #2C2A29; border-radius: 4px;
  padding: 0.65rem 1.5rem; font-size: 1rem; font-weight: 600; cursor: pointer;
}

.divider { border: none; border-top: 1px solid #e0e0e0; margin: 1.5rem 0; }

.form-error { display: flex; align-items: center; gap: 6px; font-size: 0.875rem; color: #F56C6C; margin-bottom: 0.5rem; }

.spinner-small { display: inline-block; width: 14px; height: 14px; border: 2px solid #DFFF61; border-top-color: transparent; border-radius: 50%; animation: spin 0.6s linear infinite; margin-right: 6px; }
@keyframes spin { to { transform: rotate(360deg); } }

/* Success card */
.success-card {
  background: #F2FDF1; border: 1px solid #BDF4BC; border-radius: 16px;
  padding: 32px; max-width: 640px; display: flex; flex-direction: column; gap: 16px;
}
.success-card__header { display: flex; align-items: center; gap: 10px; font-size: 1.125rem; font-weight: 700; color: #1A624C; }
.success-icon { font-size: 1.5rem; color: #40A940; }
.success-card__msg { font-size: 0.9375rem; color: #333; }
.success-card__url { background: #fff; border: 1px solid #e0e0e0; border-radius: 8px; padding: 16px; }
.url-label { display: block; font-size: 0.75rem; font-weight: 600; color: #888; text-transform: uppercase; margin-bottom: 4px; }
.url-value { font-size: 0.875rem; color: #2C2A29; word-break: break-all; }
.success-card__actions { display: flex; gap: 12px; }

/* Responsive */
@media screen and (max-width: 48rem) {
  .view-title-bar__text { font-size: 1.3rem; }
  .create-link-content { padding: 1.5rem 1rem; }
  .form-box { padding: 0.75rem; }
  .price-row { flex-direction: column; align-items: flex-start; }
  .price-input-wrapper { flex: 1; width: 100%; }
  .reference-row { flex-direction: column; }
  .select-small { width: 100%; }
  .input-medium { width: 100%; }
}
</style>
