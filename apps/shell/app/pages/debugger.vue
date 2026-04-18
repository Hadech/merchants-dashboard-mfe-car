<template>
  <div class="debugger-page">
    <!-- View Title Bar -->
    <div class="view-title-bar">
      <div class="view-title-bar__container">
        <span class="view-title-bar__text">Desarrollo: Debugger</span>
      </div>
    </div>

    <!-- Content -->
    <div class="debugger-content">
      <!-- Filter header -->
      <div class="filter-header">
        <p class="filter-header__description">Escoge las fechas para ver los eventos</p>
        <div class="date-picker-row">
          <UInput v-model="startDate" type="datetime-local" placeholder="Fecha y hora inicio" class="date-input-wide" />
          <UInput v-model="endDate" type="datetime-local" placeholder="Fecha y hora fin" class="date-input-wide" />
          <div class="date-shortcuts">
            <UButton v-for="s in dateShortcuts" :key="s.label" variant="outline" color="neutral" size="xs" @click="applyShortcut(s.hours)">
              {{ s.label }}
            </UButton>
          </div>
        </div>

        <p v-if="startDate && endDate" class="current-period">
          Viendo eventos generados entre
          <br>
          <strong>{{ formatDisplayDate(startDate) }}</strong>
          &nbsp;~&nbsp;
          <strong>{{ formatDisplayDate(endDate) }}</strong>
        </p>
      </div>

      <!-- Loading -->
      <div v-if="loading" class="loading-state">
        <UIcon name="i-heroicons-arrow-path" class="animate-spin text-xl text-gray-400" />
        <span>Cargando eventos...</span>
      </div>

      <!-- Events table -->
      <template v-else-if="hasFetched && events.length > 0">
        <div class="results-box">
          <div v-for="evt in events" :key="evt.id" class="event-row" @click="toggleExpand(evt.id)">
            <!-- Summary row -->
            <div class="event-summary">
              <div class="event-summary__expand">
                <UIcon
                  :name="expandedId === evt.id ? 'i-heroicons-chevron-down' : 'i-heroicons-chevron-right'"
                  class="expand-icon"
                />
              </div>
              <div class="event-summary__datetime">
                <div class="date-cell">
                  <UIcon name="i-heroicons-calendar" class="meta-icon" />
                  <span>{{ formatDate(evt.created_at) }}</span>
                </div>
                <div class="time-cell">
                  <UIcon name="i-heroicons-clock" class="meta-icon" />
                  <span>{{ formatTime(evt.created_at) }}</span>
                </div>
              </div>
              <div class="event-summary__type">
                <code class="monospace">{{ evt.event_type }}</code>
              </div>
              <div class="event-summary__status">
                <span class="status-tag" :class="statusClass(evt.status)">
                  {{ statusText(evt.status) }}
                </span>
              </div>
              <div class="event-summary__entity">
                <span>{{ entityText(evt.entity_type) }}</span>
                <code class="monospace entity-key">{{ evt.entity_key }}</code>
              </div>
            </div>

            <!-- Expanded detail -->
            <div v-if="expandedId === evt.id" class="event-detail" @click.stop>
              <div v-if="loadingDetail" class="detail-loading">
                <UIcon name="i-heroicons-arrow-path" class="animate-spin" />
                <span>Espera...</span>
              </div>
              <template v-else-if="eventDetail">
                <div class="detail-grid">
                  <!-- URL -->
                  <div class="detail-section">
                    <p class="detail-title">URL del evento</p>
                    <code class="event-url">{{ eventDetail.external_request?.url || '—' }}</code>
                  </div>

                  <!-- HTTP Status -->
                  <div class="detail-section">
                    <p class="detail-title">Status HTTP respondido por el comercio</p>
                    <span
                      v-if="eventDetail.external_request?.response?.status_code > 0"
                      class="status-tag"
                      :class="statusClass(evt.status)"
                    >
                      {{ eventDetail.external_request.response.status_code }}
                    </span>
                    <em v-else class="no-response">No se obtuvo respuesta del servidor del comercio</em>
                  </div>
                </div>

                <div class="detail-grid">
                  <!-- Request body -->
                  <div class="detail-section">
                    <p class="detail-title">Evento</p>
                    <pre class="code-block">{{ formatJson(eventDetail.external_request?.request?.body) }}</pre>
                    <p class="detail-subtitle">Headers del evento</p>
                    <ul class="headers-list">
                      <li v-for="(val, key) in (eventDetail.external_request?.request?.headers || {})" :key="key">
                        <span class="header-key">{{ key }}</span>
                        <span class="header-val" :title="val">{{ val }}</span>
                      </li>
                    </ul>
                  </div>

                  <!-- Response body -->
                  <div class="detail-section">
                    <p class="detail-title">Respuesta del comercio</p>
                    <pre class="code-block">{{ eventDetail.external_request?.response?.non_parseable_body || formatJson(eventDetail.external_request?.response?.body) || '—' }}</pre>
                    <p class="detail-subtitle">Headers de respuesta</p>
                    <ul class="headers-list">
                      <li v-for="(val, key) in (eventDetail.external_request?.response?.headers || {})" :key="key">
                        <span class="header-key">{{ key }}</span>
                        <span class="header-val" :title="val">{{ val }}</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </template>
            </div>
          </div>
        </div>

        <!-- Pagination -->
        <div v-if="totalResults > 0" class="pagination-container">
          <UPagination
            v-model="currentPage"
            :total="totalResults"
            :items-per-page="pageSize"
            @update:model-value="onPageChanged"
          />
        </div>
      </template>

      <!-- Empty -->
      <div v-else-if="hasFetched" class="empty-state">
        <UIcon name="i-heroicons-signal-slash" class="text-2xl text-gray-400" />
        <p>No se encontraron eventos para el periodo seleccionado.</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useApiClient } from '@wompi/api-client'

const api = useApiClient()

const startDate = ref('')
const endDate = ref('')
const loading = ref(false)
const hasFetched = ref(false)
const events = ref<any[]>([])
const currentPage = ref(1)
const pageSize = ref(25)
const totalResults = ref(0)

const expandedId = ref<string | null>(null)
const loadingDetail = ref(false)
const eventDetail = ref<any>(null)
const detailCache = reactive<Record<string, any>>({})

const dateShortcuts = [
  { label: 'Última hora', hours: 1 },
  { label: 'Últimas 24h', hours: 24 },
  { label: 'Últimos 7 días', hours: 168 },
  { label: 'Último mes', hours: 720 },
]

const statusMap: Record<string, { cls: string; text: string }> = {
  SUCCESS: { cls: 'status--success', text: 'Exitoso' },
  NO_EVENTS_URL: { cls: 'status--warning', text: 'Sin URL' },
  ERROR: { cls: 'status--danger', text: 'Error' },
}

const entityMap: Record<string, string> = {
  TRANSACTION: 'Transacción',
  REFUND: 'Reembolso',
  NEQUI_TOKEN: 'Token de Nequi',
  BANCOLOMBIA_TRANSFER_TOKEN: 'Token de Transferencia Bancolombia',
}

function statusClass(status: string) { return statusMap[status]?.cls ?? '' }
function statusText(status: string) { return statusMap[status]?.text ?? status }
function entityText(type: string) { return entityMap[type] ?? type }

watch([startDate, endDate], ([from, to]) => {
  if (from && to) { currentPage.value = 1; fetchData() }
})

async function fetchData() {
  loading.value = true
  try {
    const response = await api<{ data: any[]; meta: { total_results: number; page_size: number } }>('/webhook_events', {
      query: {
        start_date: startDate.value.replace('T', ' ') + ':00',
        end_date: endDate.value.replace('T', ' ') + ':00',
        page_size: pageSize.value,
        page: currentPage.value,
      },
    })
    events.value = response.data ?? []
    totalResults.value = response.meta?.total_results ?? 0
    pageSize.value = response.meta?.page_size ?? 25
  } catch {
    events.value = []
    totalResults.value = 0
  } finally {
    loading.value = false
    hasFetched.value = true
  }
}

async function toggleExpand(id: string) {
  if (expandedId.value === id) {
    expandedId.value = null
    eventDetail.value = null
    return
  }
  expandedId.value = id
  if (detailCache[id]) {
    eventDetail.value = detailCache[id]
    return
  }
  loadingDetail.value = true
  eventDetail.value = null
  try {
    const data = await api<{ data: any }>(`/webhook_events/${id}`)
    detailCache[id] = data.data ?? data
    eventDetail.value = detailCache[id]
  } catch {
    eventDetail.value = null
  } finally {
    loadingDetail.value = false
  }
}

function onPageChanged(page: number) {
  currentPage.value = page
  expandedId.value = null
  eventDetail.value = null
  fetchData()
}

function applyShortcut(hours: number) {
  const end = new Date()
  const start = new Date(end.getTime() - hours * 3600000)
  startDate.value = toLocalDatetime(start)
  endDate.value = toLocalDatetime(end)
}

function toLocalDatetime(d: Date): string {
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`
}

function formatDate(s: string) {
  return new Date(s).toLocaleDateString('es-CO', { year: 'numeric', month: 'short', day: 'numeric' })
}

function formatTime(s: string) {
  return new Date(s).toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
}

function formatDisplayDate(s: string) {
  return new Date(s).toLocaleDateString('es-CO', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })
}

function formatJson(obj: any) {
  if (!obj) return '—'
  try { return typeof obj === 'string' ? JSON.stringify(JSON.parse(obj), null, 2) : JSON.stringify(obj, null, 2) }
  catch { return String(obj) }
}

onMounted(() => applyShortcut(24))
</script>

<style scoped>
/* View Title Bar */
.view-title-bar { background: #2C2A29; color: #fff; }
.view-title-bar__container { max-width: 74.25rem; margin: 0 auto; height: 100px; display: flex; align-items: center; padding: 0 1.5rem; }
.view-title-bar__text { font-size: 1.6rem; }

/* Content */
.debugger-content { max-width: 74.25rem; margin: 0 auto; padding: 0 1.5rem; }

/* Filter header */
.filter-header { margin-top: 0.6875rem; margin-bottom: 0.9375rem; display: flex; flex-direction: column; }
.filter-header__description { color: #2C2A29; font-size: 1rem; font-weight: 600; margin: 0.5rem 0; }
.date-picker-row { display: flex; align-items: center; gap: 0.75rem; flex-wrap: wrap; }
.date-input-wide { width: 14rem; }
.date-shortcuts { display: flex; gap: 0.5rem; }
.current-period { color: #888; text-transform: uppercase; text-align: center; font-size: 0.8rem; margin: 1.5rem 0 0.3rem; }
.current-period strong { color: #2C2A29; }

/* Results box */
.results-box { margin-top: 0.9375rem; background: #fff; border: 1px solid #e0e0e0; border-radius: 3px; overflow: hidden; }

/* Event row */
.event-row { cursor: pointer; transition: background 0.15s; }
.event-row:hover .event-summary { background: rgba(44, 42, 41, 0.03); }
.event-row:not(:last-child) .event-summary { border-bottom: 1px solid #f0f0f0; }

.event-summary { display: flex; align-items: center; padding: 12px 16px; gap: 16px; }
.event-summary__expand { flex-shrink: 0; }
.expand-icon { font-size: 1rem; color: #888; }

.event-summary__datetime { flex: 0 0 140px; display: flex; flex-direction: column; gap: 2px; }
.date-cell, .time-cell { display: flex; align-items: center; gap: 4px; font-size: 0.8125rem; color: #555; }
.meta-icon { font-size: 0.875rem; color: #888; }

.event-summary__type { flex: 1; }
.monospace { font-family: Courier, "Lucida Console", monospace; letter-spacing: 0.01em; word-break: break-word; font-size: 0.8125rem; }

.event-summary__status { flex: 0 0 80px; }
.status-tag { display: inline-block; padding: 2px 10px; border-radius: 4px; font-size: 0.75rem; font-weight: 600; }
.status--success { background: #E5FBE4; color: #1A624C; }
.status--warning { background: rgba(246, 198, 67, 0.32); color: #ff9c1b; }
.status--danger { background: #FFEBEB; color: #A01110; }

.event-summary__entity { flex: 0 0 200px; display: flex; flex-direction: column; gap: 2px; font-size: 0.8125rem; }
.entity-key { font-size: 0.75rem; color: #888; }

/* Event detail (expanded) */
.event-detail { background: rgba(44, 42, 41, 0.03); border-top: 1px solid rgba(44, 42, 41, 0.1); border-bottom: 1px solid rgba(44, 42, 41, 0.1); padding: 24px; cursor: auto; }
.detail-loading { display: flex; align-items: center; gap: 8px; justify-content: center; padding: 4rem 0; color: #888; }

.detail-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 24px; margin-bottom: 16px; }
.detail-section { min-width: 0; }
.detail-title { font-size: 1rem; color: #2C2A29; font-weight: 600; margin: 0 0 0.35rem; }
.detail-subtitle { font-size: 0.9rem; font-weight: 600; color: #2C2A29; margin: 1.25em 0 0.5em; }

.event-url { font-family: Courier, monospace; word-break: break-all; font-weight: 600; color: #333; background: rgba(0, 0, 0, 0.05); border-radius: 4px; padding: 1em; display: block; line-height: 1.4em; font-size: 0.85rem; }
.no-response { font-size: 0.875rem; color: #888; }

.code-block { background: #1e1e1e; color: #d4d4d4; border-radius: 4px; padding: 1em; font-size: 0.75rem; font-family: Courier, monospace; overflow-x: auto; max-height: 20rem; white-space: pre-wrap; word-break: break-word; margin: 0.5rem 0; }

.headers-list { list-style: none; padding: 0; margin: 0; }
.headers-list li { display: flex; justify-content: space-between; padding: 0.3rem 0; font-family: monospace; font-size: 0.85em; }
.header-key { flex: 0.4; font-weight: bold; color: #333; }
.header-val { flex: 0.6; word-break: break-word; color: #555; }

/* Pagination */
.pagination-container { margin-top: 1.8125rem; display: flex; justify-content: center; }

/* Loading / Empty */
.loading-state { display: flex; align-items: center; justify-content: center; gap: 0.5rem; padding: 3rem 0; color: #999; }
.empty-state { display: flex; flex-direction: column; align-items: center; gap: 0.75rem; padding: 3rem 0; color: #888; }

/* Responsive */
@media screen and (max-width: 48rem) {
  .view-title-bar__text { font-size: 1.3rem; }
  .view-title-bar__container { justify-content: center; }
  .event-summary { flex-wrap: wrap; gap: 8px; }
  .event-summary__datetime { flex: 0 0 100%; }
  .event-summary__entity { flex: 0 0 100%; }
  .detail-grid { grid-template-columns: 1fr; }
  .date-picker-row { flex-direction: column; align-items: flex-start; }
  .date-shortcuts { flex-wrap: wrap; }
}
</style>
