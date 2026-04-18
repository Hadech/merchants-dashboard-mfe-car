<template>
  <div class="create-link">
    <!-- View Title Bar with back arrow -->
    <div class="view-title-bar">
      <div class="view-title-bar__container">
        <a class="back-arrow" @click="navigateTo('/payment-links')">
          <span class="ic ic_angle-left"></span>
        </a>
        <span class="view-title-bar__text">Creando link de pago</span>
      </div>
    </div>

    <div class="view-content container">
      <!-- Success state -->
      <div v-if="createdLink" class="success-card">
        <div class="success-header">
          <span class="ic ic_check-circle success-icon"></span>
          <span>Link de pago creado</span>
        </div>
        <p>¡Tu link de pago ya está disponible!</p>
        <div class="success-actions">
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
          <p class="cl-text">Los campos resaltados con asterisco<span class="asterisk">*</span> son obligatorios</p>

          <h3 class="create-link__form-title">Información básica</h3>

          <div class="form-item required">
            <label>Nombre del producto o servicio</label>
            <input v-model="form.name" type="text" placeholder="Nombre del producto o servicio que vas a vender" />
          </div>

          <div class="form-item required">
            <label>Descripción</label>
            <textarea v-model="form.description" placeholder="Ingresa aquí la descripción" rows="3"></textarea>
          </div>

          <div class="form-item required">
            <label>{{ 'Precio' }}</label>
            <div class="price-row">
              <div v-if="!isOpenAmount" class="price-input">
                <input v-model.number="form.amount" type="number" placeholder="Monto a pagar" min="1" />
              </div>
              <div v-else class="open-amount-alert">
                <span class="ic ic_circle-info"></span>
                El pagador establecerá el precio
              </div>
              <label class="checkbox-inline">
                <input type="checkbox" v-model="isOpenAmount" />
                <span>El cliente establece el precio</span>
              </label>
            </div>
          </div>

          <div v-if="!isOpenAmount && form.amount && form.amount > 0" class="total-amount">
            Total a cobrar: <strong>COP ${{ formatPrice(form.amount * 100) }}</strong>
          </div>

          <h3 class="create-link__form-title">Configuraciones adicionales</h3>

          <div class="form-item">
            <label>¿Solicitar información de envío?</label>
            <p class="hint">En caso de que necesites hacer un envío, Wompi solicitará esta información al pagador</p>
            <select v-model="form.collect_shipping"><option :value="false">No</option><option :value="true">Sí</option></select>
          </div>

          <div class="form-item">
            <label>¿Solicitar documento de identidad del pagador?</label>
            <p class="hint">Se le solicitará al pagador tipo y número de documento</p>
            <select v-model="form.collect_customer_legal_id"><option :value="false">No</option><option :value="true">Sí</option></select>
          </div>

          <div class="form-item">
            <label>¿Pago único?</label>
            <p class="hint">Inhabilita el link de pago después del primer pago aprobado</p>
            <select v-model="form.single_use"><option :value="false">No</option><option :value="true">Sí</option></select>
          </div>

          <div class="form-item">
            <label class="optional">¿Vencimiento del link de pago?</label>
            <p class="hint">Fecha y hora a partir de las cuales el link no podrá ser usado</p>
            <input v-model="form.expires_at" type="datetime-local" class="input-medium" />
          </div>

          <div class="form-item">
            <label class="optional">Link de redirección</label>
            <p class="hint">URL a donde se redirigirá después de completar el pago</p>
            <input v-model="form.redirect_url" type="text" placeholder="URL de redirección" />
          </div>

          <div class="form-item">
            <label class="optional">Código de producto o SKU</label>
            <p class="hint">Referencia interna del producto en el comercio (opcional)</p>
            <input v-model="form.sku" type="text" placeholder="Ejp: CDX-LG28UD-001" class="input-medium" />
          </div>

          <h3 class="create-link__form-title">Solicitar datos adicionales al pagador (opcional)</h3>

          <div class="info-alert">
            <span class="ic ic_circle-info alert-icon"></span>
            <span>Usa estas <strong>referencias para solicitar información adicional a tus clientes</strong> (máx. 2). Por ejemplo: <em>Número de factura; Apartamento; Código de estudiante; Talla; etc.</em></span>
          </div>

          <div v-for="(ref, idx) in customerReferences.slice(0, shownReferences)" :key="idx" class="reference-row">
            <div class="form-item">
              <label>Nombre Referencia {{ idx + 1 }}</label>
              <input v-model="ref.label" type="text" placeholder="Nombre de la referencia" maxlength="24" />
            </div>
            <div class="form-item">
              <label>¿Es obligatoria?</label>
              <select v-model="ref.is_required"><option :value="true">Sí</option><option :value="false">No</option></select>
            </div>
          </div>

          <button v-if="shownReferences < 2" class="btn-add" @click="shownReferences++">
            <span class="ic ic_circle-plus"></span>
            <strong>Solicitar referencia adicional al pagador</strong>
          </button>

          <hr class="divider" />

          <div v-if="error" class="form-error">{{ error }}</div>

          <button class="btn-primary btn-submit" :disabled="!isValid || submitting" @click="handleSubmit">
            <span v-if="submitting" class="spinner-sm"></span>
            Crear link de pago
          </button>
        </div>
      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
import { createApiClient } from '@wompi/api-client'
import { useAuth } from '@wompi/auth'

const { refreshSession } = useAuth()

const submitting = ref(false)
const error = ref<string | null>(null)
const createdLink = ref<any>(null)
const isOpenAmount = ref(false)
const shownReferences = ref(0)

const form = reactive({
  name: '', description: '', amount: null as number | null,
  single_use: false, collect_shipping: false, collect_customer_legal_id: false,
  expires_at: '', redirect_url: '', sku: '',
})

const customerReferences = reactive([
  { label: '', is_required: true },
  { label: '', is_required: true },
])

const isValid = computed(() =>
  form.name.trim() !== '' && form.description.trim() !== '' &&
  (isOpenAmount.value || (form.amount !== null && form.amount > 0))
)

function formatPrice(cents: number) {
  return new Intl.NumberFormat('es-CO', { minimumFractionDigits: 0 }).format(cents / 100)
}

async function handleSubmit() {
  submitting.value = true; error.value = null
  try {
    const api = createApiClient({ useAuth: true, refreshSession })
    const body: Record<string, any> = {
      name: form.name.trim(), description: form.description.trim(), currency: 'COP',
      single_use: form.single_use, collect_shipping: form.collect_shipping,
      collect_customer_legal_id: form.collect_customer_legal_id,
    }
    if (!isOpenAmount.value && form.amount) body.amount_in_cents = form.amount * 100
    if (form.expires_at) body.expires_at = form.expires_at
    if (form.redirect_url.trim()) body.redirect_url = form.redirect_url.trim()
    if (form.sku.trim()) body.sku = form.sku.trim()
    const refs = customerReferences.slice(0, shownReferences.value).filter(r => r.label.trim()).map(r => ({ label: r.label.trim(), is_required: r.is_required }))
    if (refs.length > 0) body.customer_data = { customer_references: refs }
    const response = await api<{ data: any }>('/payment_links', { method: 'POST', body })
    createdLink.value = response.data
  } catch (e: unknown) {
    error.value = e instanceof Error ? e.message : 'El link de pago no pudo ser creado.'
  } finally { submitting.value = false }
}

function resetForm() {
  form.name = ''; form.description = ''; form.amount = null; form.single_use = false
  form.collect_shipping = false; form.collect_customer_legal_id = false
  form.expires_at = ''; form.redirect_url = ''; form.sku = ''
  isOpenAmount.value = false; shownReferences.value = 0
  customerReferences[0].label = ''; customerReferences[1].label = ''
  createdLink.value = null; error.value = null
}
</script>

<style scoped>
/* === Title Bar === */
.view-title-bar { background: #2C2A29; color: #fff; }
.view-title-bar__container { max-width: 74.25rem; margin: 0 auto; height: 100px; display: flex; align-items: center; padding: 0 1.5rem; gap: 0.75rem; }
.view-title-bar__text { font-size: 1.6rem; font-weight: 400; }
.back-arrow { cursor: pointer; color: #DFFF61; font-size: 1.5rem; display: flex; align-items: center; }

/* === Content === */
.view-content.container { max-width: 74.25rem; margin: 0 auto; padding: 1.75rem 2rem; }

/* === Form header === */
.form-header { margin-bottom: 0.8125rem; }
.form-header__title { color: #2C2A29; font-size: 1rem; font-weight: 600; }

/* === Form box — matches legacy el-form === */
.form-box { padding: 1.5rem; background: #FAFAFA; box-shadow: 3px 3px 17px 0 rgba(174,197,215,0.18); border-radius: 4px; }
.cl-text { font-size: 0.875rem; color: #555; margin-bottom: 1rem; }
.asterisk { color: #F56C6C; font-weight: bold; }

/* === Section titles === */
.create-link__form-title { font-size: 1.1rem; font-weight: bold; margin: 1.5rem 0 0.75rem; color: #2C2A29; border-bottom: 1px solid #e0e0e0; padding-bottom: 0.1em; }

/* === Form items === */
.form-item { margin-bottom: 1.2rem; }
.form-item label { display: block; font-size: 0.875rem; font-weight: 600; color: #888; margin-bottom: 0.35rem; }
.form-item.required label { color: #333; }
.form-item.required label::after { content: '*'; color: #F56C6C; margin-left: 2px; }
.form-item label.optional { color: #888; }
.hint { font-size: 0.8rem; color: #999; margin: 0 0 0.25rem; }

/* === Inputs — matches legacy el-input === */
.form-item input[type="text"],
.form-item input[type="number"],
.form-item input[type="datetime-local"],
.form-item textarea,
.form-item select {
  width: 100%; height: 40px; border: 1px solid #DCDFE6; border-radius: 4px;
  padding: 0 15px; font-size: 0.875rem; color: #2C2A29; outline: none;
  font-family: "Open Sans", "Source Sans Pro", sans-serif; transition: border-color 0.2s;
}
.form-item textarea { height: auto; padding: 10px 15px; resize: vertical; }
.form-item select { appearance: auto; cursor: pointer; width: auto; min-width: 8rem; }
.form-item input:focus, .form-item textarea:focus, .form-item select:focus { border-color: #2C2A29; }
.form-item input::placeholder, .form-item textarea::placeholder { color: #C0C4CC; }
.input-medium { max-width: 16rem; }

/* === Price row === */
.price-row { display: flex; align-items: center; gap: 1rem; flex-wrap: wrap; }
.price-input { flex: 0 0 250px; }
.price-input input { width: 100%; }
.open-amount-alert { display: flex; align-items: center; gap: 6px; background: #F0FFF4; border: 1px solid #C6F6D5; border-radius: 4px; padding: 0.5rem 0.75rem; font-size: 0.875rem; color: #276749; }
.checkbox-inline { display: flex; align-items: center; gap: 6px; font-size: 0.875rem; color: #555; cursor: pointer; }
.checkbox-inline input { accent-color: #2C2A29; }

/* === Total amount === */
.total-amount { font-size: 0.95rem; color: #2C2A29; margin-top: 0.5rem; }

/* === Info alert === */
.info-alert { display: flex; align-items: flex-start; gap: 8px; background: #ECF5FF; border: 1px solid #B3D8FF; border-radius: 4px; padding: 12px; font-size: 0.8125rem; color: #333; margin-bottom: 1rem; line-height: 1.4; }
.alert-icon { color: #409EFF; font-size: 1rem; flex-shrink: 0; margin-top: 2px; }

/* === Reference row === */
.reference-row { display: flex; gap: 1rem; align-items: flex-end; flex-wrap: wrap; }
.reference-row .form-item { flex: 1; min-width: 200px; }

/* === Buttons === */
.btn-add { display: inline-flex; align-items: center; gap: 6px; background: none; border: 1px solid #DCDFE6; border-radius: 4px; padding: 0.4rem 0.75rem; font-size: 0.8125rem; color: #333; cursor: pointer; margin-bottom: 1rem; }
.btn-add:hover { background: #f5f5f5; }
.btn-primary { background: #2C2A29; color: #DFFF61; border: none; border-radius: 4px; padding: 0.65rem 1.5rem; font-size: 1rem; font-weight: bold; cursor: pointer; }
.btn-primary:hover { opacity: 0.9; }
.btn-primary:disabled { opacity: 0.5; cursor: not-allowed; }
.btn-submit { margin-top: 1rem; }
.btn-outline { background: none; border: 1px solid #2C2A29; color: #2C2A29; border-radius: 4px; padding: 0.65rem 1.5rem; font-size: 1rem; font-weight: 600; cursor: pointer; }
.divider { border: none; border-top: 1px solid #e0e0e0; margin: 1.5rem 0; }
.form-error { font-size: 0.875rem; color: #F56C6C; margin-bottom: 0.5rem; }
.spinner-sm { display: inline-block; width: 14px; height: 14px; border: 2px solid #DFFF61; border-top-color: transparent; border-radius: 50%; animation: spin 0.6s linear infinite; margin-right: 6px; }
@keyframes spin { to { transform: rotate(360deg); } }

/* === Success card === */
.success-card { background: #F2FDF1; border: 1px solid #BDF4BC; border-radius: 16px; padding: 32px; max-width: 640px; display: flex; flex-direction: column; gap: 12px; }
.success-header { display: flex; align-items: center; gap: 10px; font-size: 1.125rem; font-weight: 700; color: #1A624C; }
.success-icon { font-size: 1.5rem; color: #40A940; }
.success-actions { display: flex; gap: 12px; }

/* === Responsive === */
@media screen and (max-width: 48rem) {
  .view-content.container { padding: 1.5rem 1rem; }
  .form-box { padding: 0.75rem; }
  .price-row { flex-direction: column; align-items: flex-start; }
  .price-input { flex: 1; width: 100%; }
  .reference-row { flex-direction: column; }
  .input-medium { max-width: 100%; }
  .view-title-bar__text { font-size: 1.3rem; }
}
</style>
