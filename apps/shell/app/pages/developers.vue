<template>
  <div class="developers-page">
    <!-- View Title Bar -->
    <div class="view-title-bar">
      <div class="view-title-bar__container">
        <span class="view-title-bar__text">Desarrollo: Programadores</span>
      </div>
    </div>

    <!-- Content -->
    <div class="developers-content">
      <div class="developers-columns">
        <!-- Left column: main config -->
        <div class="col-main">
          <!-- Loading -->
          <div v-if="loading" class="loading-state">
            <UIcon name="i-heroicons-arrow-path" class="animate-spin text-xl text-gray-400" />
            <span>Cargando información del comercio...</span>
          </div>

          <template v-else-if="merchant">
            <span class="box-label">Configuraciones avanzadas para programadores</span>

            <div class="data-box">
              <!-- Events URL -->
              <p class="subtitle">Seguimiento de transacciones</p>
              <div class="form-group">
                <label class="form-label">URL de Eventos</label>
                <UInput
                  v-model="eventsUrl"
                  placeholder="Ejp: https://mitienda.co/pagos/wompi/eventos"
                  class="form-input"
                />
              </div>
              <div class="save-row">
                <UButton
                  color="primary"
                  class="save-btn"
                  :loading="saving"
                  @click="saveEventsUrl"
                >
                  Guardar
                </UButton>
                <div v-if="hasUnsavedChanges" class="unsaved-warning">
                  <UIcon name="i-heroicons-exclamation-triangle" class="warn-icon" />
                  <span>Haz clic en "Guardar" para guardar tus cambios</span>
                </div>
              </div>

              <!-- API Keys -->
              <p class="subtitle mt-section">Llaves del API para integración técnica</p>

              <div class="keys-box">
                <!-- Public key -->
                <div class="key-row">
                  <div class="key-label-box">
                    <span>Llave pública</span>
                  </div>
                  <div class="key-value">{{ merchant.public_key }}</div>
                </div>

                <!-- Private key -->
                <div class="key-row">
                  <div class="key-label-box">
                    <span>Llave privada</span>
                  </div>
                  <div class="key-value">
                    {{ showPrivateKey ? merchant.private_key : '•••••••••••••••••••••••••••••••••••••••••' }}
                  </div>
                  <div class="key-action-box">
                    <UButton
                      variant="outline"
                      color="neutral"
                      size="xs"
                      @click="showPrivateKey = !showPrivateKey"
                    >
                      {{ showPrivateKey ? 'Ocultar' : 'Mostrar' }}
                    </UButton>
                  </div>
                </div>
              </div>

              <!-- Secrets -->
              <p class="subtitle mt-section">Secretos para integración técnica</p>

              <div class="keys-box">
                <div v-for="(label, key) in secretLabels" :key="key" class="key-row">
                  <div class="key-label-box">
                    <span>{{ label }}</span>
                  </div>
                  <div class="key-value">
                    {{ shownSecrets[key] ? (merchant.secrets?.[key] || '—') : '•••••••••••••••••••••••••••••••••••••••••' }}
                  </div>
                  <div class="key-action-box">
                    <UButton
                      variant="outline"
                      color="neutral"
                      size="xs"
                      @click="shownSecrets[key] = !shownSecrets[key]"
                    >
                      {{ shownSecrets[key] ? 'Ocultar' : 'Mostrar' }}
                    </UButton>
                  </div>
                </div>
              </div>

              <!-- Help links -->
              <p class="help-label">Consulta los siguientes links para entender cómo hacer una integración técnica:</p>
              <a class="external-link" href="https://docs.wompi.co" target="_blank">
                <UIcon name="i-heroicons-arrow-top-right-on-square" />
                Documentación y guías de integración
              </a>
              <a class="external-link" href="https://docs.wompi.co/docs/en/referencia-api" target="_blank">
                <UIcon name="i-heroicons-arrow-top-right-on-square" />
                Referencia del API
              </a>
              <a class="external-link" href="https://docs.wompi.co/docs/en/ambientes-y-llaves" target="_blank">
                <UIcon name="i-heroicons-arrow-top-right-on-square" />
                Ambientes y llaves
              </a>
            </div>
          </template>
        </div>

        <!-- Right column: sandbox, status, key rotation -->
        <div class="col-side">
          <!-- Sandbox toggle -->
          <span class="box-label">Modo de pruebas</span>
          <div class="side-card">
            <p class="subtitle">
              {{ isSandbox
                ? 'Vuelve al modo Producción para realizar transacciones con dinero real:'
                : 'Haz transacciones sin usar dinero real usando nuestro Sandbox:'
              }}
            </p>
            <UButton
              :color="isSandbox ? 'neutral' : 'primary'"
              :variant="isSandbox ? 'outline' : 'solid'"
              class="side-btn"
              @click="toggleSandbox"
            >
              {{ isSandbox ? 'Desactivar modo de pruebas' : 'Activar modo de pruebas' }}
            </UButton>
          </div>

          <!-- Status page -->
          <span class="box-label">Status Page</span>
          <div class="side-card side-card--flex">
            <div class="featured-icon">
              <UIcon name="i-heroicons-wrench-screwdriver" />
            </div>
            <div>
              <p class="subtitle">Válida si se están presentando problemas en el servicio</p>
              <a
                href="https://wompi.statuspage.io/"
                target="_blank"
                class="side-link"
              >
                Validar ahora
              </a>
            </div>
          </div>

          <!-- Key rotation -->
          <span class="box-label">Rotación de llaves privadas</span>
          <div class="side-card">
            <div class="key-rotation-warning">
              <UIcon name="i-heroicons-exclamation-triangle" class="rotation-warn-icon" />
              <p>
                Al realizar esta operación <strong>tus llaves privadas van a cambiar.</strong>
                Una vez lo realizas, debes actualizar de inmediato las llaves en los plugins o integraciones que tengas con Wompi.
              </p>
            </div>
            <UButton
              variant="outline"
              color="error"
              class="side-btn"
              @click="handleRegenerateKeys"
            >
              Regenerar llaves del comercio
            </UButton>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useApiClient } from '@wompi/api-client'

const api = useApiClient()

const loading = ref(false)
const saving = ref(false)
const merchant = ref<any>(null)
const eventsUrl = ref('')
const originalEventsUrl = ref('')
const showPrivateKey = ref(false)
const isSandbox = ref(false)

const secretLabels: Record<string, string> = {
  EVENTS: 'Eventos',
  INTEGRITY: 'Integridad',
}

const shownSecrets = reactive<Record<string, boolean>>({
  EVENTS: false,
  INTEGRITY: false,
})

const hasUnsavedChanges = computed(() => eventsUrl.value !== originalEventsUrl.value)

async function loadMerchant() {
  loading.value = true
  try {
    const data = await api<{ data: any[] }>('/merchants')
    const m = Array.isArray(data.data) ? data.data[0] : data.data
    merchant.value = m
    eventsUrl.value = m?.events_url || ''
    originalEventsUrl.value = m?.events_url || ''

    // Check sandbox from localStorage
    try {
      const stored = localStorage.getItem('apiEnvironment')
      if (stored) {
        const parsed = JSON.parse(stored)
        isSandbox.value = parsed?.type?.includes('test') ?? false
      }
    } catch { /* ignore */ }
  } catch {
    merchant.value = null
  } finally {
    loading.value = false
  }
}

async function saveEventsUrl() {
  if (!merchant.value) return
  saving.value = true
  try {
    const data = await api<{ data: any }>(`/merchants/${merchant.value.id}`, {
      method: 'PATCH',
      body: { events_url: eventsUrl.value.trim() || null },
    })
    merchant.value = data.data
    originalEventsUrl.value = data.data?.events_url || ''
  } catch {
    // silent
  } finally {
    saving.value = false
  }
}

function toggleSandbox() {
  isSandbox.value = !isSandbox.value
  // Persist sandbox state
  const env = isSandbox.value
    ? { type: 'test', tag: 'sandbox' }
    : { type: 'production', tag: 'production' }
  localStorage.setItem('apiEnvironment', JSON.stringify(env))
  loadMerchant()
}

async function handleRegenerateKeys() {
  if (!confirm('¿Estás seguro de querer regenerar las llaves privadas del comercio?')) return
  try {
    await api('/merchants/rotate_keys', {
      method: 'POST',
      body: { id_token: localStorage.getItem('idToken') },
    })
    await loadMerchant()
  } catch {
    // silent
  }
}

onMounted(loadMerchant)
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
.developers-content {
  max-width: 74.25rem;
  margin: 0 auto;
  padding: 1.5rem;
}

/* Two-column layout like legacy */
.developers-columns {
  display: flex;
  gap: 4%;
}

.col-main {
  flex: 0 0 58%;
}

.col-side {
  flex: 0 0 38%;
}

/* Box label — matches legacy content-box__label */
.box-label {
  display: block;
  font-size: 0.875rem;
  font-weight: 600;
  color: #555;
  margin-bottom: 0.5rem;
  margin-top: 1rem;
}

/* Data box — matches legacy developers__data-box */
.data-box {
  background: #fff;
  border: 1px solid #e0e0e0;
  border-radius: 20px;
  box-shadow: 0px 1px 8px 0px rgba(0, 0, 0, 0.08);
  padding: 2rem;
  margin-bottom: 1.5625rem;
}

.subtitle {
  font-weight: 400;
  font-size: 0.9375rem;
  color: #333;
  border-bottom: none;
  margin-bottom: 0.75rem;
}

.mt-section {
  margin-top: 1.5rem;
}

/* Form */
.form-group {
  margin-bottom: 1rem;
}

.form-label {
  font-size: 0.875rem;
  color: #333;
  display: block;
  margin-bottom: 0.3rem;
}

.form-input {
  width: 100%;
}

.save-row {
  display: flex;
  align-items: center;
  gap: 1rem;
  flex-wrap: wrap;
}

.save-btn {
  border-radius: 2rem;
  font-weight: 600;
}

.unsaved-warning {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 0.8125rem;
  color: #F59E0B;
}

.warn-icon {
  font-size: 1rem;
}

/* Keys box — matches legacy developers__keys-box */
.keys-box {
  margin: 1rem 0 0;
}

.key-row {
  display: flex;
  align-items: stretch;
  border: 1px solid #e0e0e0;
  border-radius: 4px;
  margin-bottom: 1rem;
  overflow: hidden;
}

.key-row:hover .key-value {
  background: rgba(44, 42, 41, 0.02);
}

.key-label-box {
  background: #f5f5f5;
  width: 20%;
  min-width: 100px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 0.5rem;
  border-right: 1px solid #e0e0e0;
}

.key-label-box span {
  font-size: 0.875rem;
  font-weight: 600;
  color: #777;
  text-align: center;
}

.key-value {
  flex: 1;
  font-family: monospace;
  font-size: 0.85rem;
  padding: 0 0.8rem;
  line-height: 3.5rem;
  overflow-x: auto;
  white-space: nowrap;
  transition: background 0.1s ease-in-out;
}

.key-action-box {
  background: #f5f5f5;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 0.75rem;
  border-left: 1px solid #e0e0e0;
}

/* Help links — matches legacy */
.help-label {
  display: block;
  font-size: 0.875rem;
  font-weight: 600;
  color: #333;
  margin: 1.5rem 0 0.7rem;
}

.external-link {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 0.875rem;
  font-weight: 600;
  color: #2C2A29;
  text-decoration: underline;
  margin-bottom: 0.6rem;
  cursor: pointer;
}

.external-link:hover {
  color: #00C389;
}

/* Side cards — matches legacy detail__columns__box */
.side-card {
  background: #fff;
  border: 1px solid #e0e0e0;
  border-radius: 20px;
  box-shadow: 0px 1px 8px 0px rgba(0, 0, 0, 0.08);
  padding: 2rem;
  margin-bottom: 1.625rem;
}

.side-card--flex {
  display: flex;
  align-items: flex-start;
  gap: 16px;
}

.featured-icon {
  background: #2C2A29;
  width: 3.5rem;
  height: 3.5rem;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  color: #DFFF61;
  font-size: 1.25rem;
}

.side-btn {
  border-radius: 2rem;
  font-weight: 600;
  margin-top: 0.75rem;
}

.side-link {
  font-size: 0.875rem;
  font-weight: 600;
  color: #2C2A29;
  text-decoration: underline;
  cursor: pointer;
}

.side-link:hover {
  color: #00C389;
}

/* Key rotation warning */
.key-rotation-warning {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  background: #FEF2F2;
  border: 1px solid #FECACA;
  border-radius: 8px;
  padding: 12px;
  font-size: 0.8125rem;
  color: #991B1B;
  line-height: 1.4;
}

.rotation-warn-icon {
  font-size: 1.125rem;
  color: #DC2626;
  flex-shrink: 0;
  margin-top: 2px;
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

/* Responsive */
@media screen and (max-width: 72.75rem) {
  .developers-columns {
    flex-direction: column;
  }

  .col-main,
  .col-side {
    flex: 1;
  }
}

@media screen and (max-width: 48rem) {
  .view-title-bar__text {
    font-size: 1.3rem;
  }

  .view-title-bar__container {
    justify-content: center;
  }

  .key-label-box {
    width: 100%;
    min-width: unset;
  }

  .key-row {
    flex-direction: column;
  }

  .key-value {
    line-height: 2.8rem;
  }

  .key-action-box {
    border-left: none;
    border-top: 1px solid #e0e0e0;
    padding: 0.5rem;
  }

  .data-box,
  .side-card {
    padding: 1rem;
  }
}
</style>
