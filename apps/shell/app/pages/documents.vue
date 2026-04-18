<template>
  <div class="results-filtered-report">
    <!-- View Title Bar -->
    <div class="view-title-bar">
      <div class="view-title-bar__container">
        <span class="view-title-bar__text">Reportes: Recibir pagos</span>
      </div>
    </div>

    <div class="view-content container">
      <!-- Section header -->
      <div class="container-info">
        <div class="container-info__section">
          <div class="container-info__title">
            <span class="info-text">Reportes de tu comercio</span>
          </div>
        </div>
      </div>

      <!-- Reports container -->
      <div class="container-reports">
        <div class="content-box">
          <!-- Filter header row -->
          <div class="filter-header">
            <!-- Left: report type -->
            <div class="filter-columns">
              <p class="filter-header__description">¿Cómo quieres ver tus reportes?</p>
              <div class="group-button-report">
                <button class="report-btn report-btn--active">
                  <span class="ic ic_document"></span>
                  <span class="label-url">Reportes estándar</span>
                </button>
              </div>
            </div>

            <!-- Right: filters -->
            <div class="filter-columns">
              <p class="filter-header__description">Filtros</p>
              <div class="group-button-report">
                <!-- Type filter -->
                <div class="type-filter">
                  <button class="type-filter__btn" @click="showTypeDropdown = !showTypeDropdown">
                    <span class="ic ic_calendar-month"></span>
                    <span>Tipo de reporte</span>
                    <span class="ic ic_angle-down"></span>
                  </button>
                  <div v-if="showTypeDropdown" class="type-filter__dropdown">
                    <label v-for="opt in reportTypeOptions" :key="opt.value" class="type-filter__option">
                      <input type="checkbox" :value="opt.value" v-model="selectedTypes" />
                      <span class="ic" :class="opt.icon"></span>
                      <span>{{ opt.label }}</span>
                    </label>
                    <div class="type-filter__actions">
                      <button class="action-btn action-btn--clear" @click="selectedTypes = []; applyTypeFilter()">Borrar</button>
                      <button class="action-btn action-btn--apply" @click="applyTypeFilter()">Aplicar</button>
                    </div>
                  </div>
                </div>

                <!-- Date pickers -->
                <div class="date-picker-group">
                  <label class="date-label">Desde</label>
                  <input v-model="startDate" type="date" class="date-input" />
                </div>
                <div class="date-picker-group">
                  <label class="date-label">Hasta</label>
                  <input v-model="endDate" type="date" class="date-input" />
                </div>

                <!-- Shortcuts -->
                <div class="date-shortcuts">
                  <button
                    v-for="shortcut in dateShortcuts"
                    :key="shortcut.label"
                    class="shortcut-btn"
                    :class="{ active: activeShortcut === shortcut.days }"
                    @click="applyShortcut(shortcut.days)"
                  >{{ shortcut.label }}</button>
                </div>
              </div>
            </div>
          </div>

          <!-- Current period -->
          <p v-if="startDate && endDate" class="current-period-report">
            <strong>Reporte generado en el periodo: </strong>
            <span>({{ formatDisplayDate(startDate) }} - {{ formatDisplayDate(endDate) }})</span>
          </p>

          <!-- Loading -->
          <div v-if="loading" class="loading-state">
            <div class="loading-spinner"></div>
            <span>Cargando reportes...</span>
          </div>

          <!-- Table -->
          <template v-else-if="hasFetched && documents.length > 0">
            <table class="documents-table">
              <thead>
                <tr>
                  <th style="min-width:25%">Tipo de reporte</th>
                  <th style="min-width:60%">Fecha de reporte</th>
                  <th style="min-width:15%"></th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="row in documents" :key="row.id">
                  <td>
                    <span class="type-cell">
                      <i :class="documentTypeToIcon(row.type)"></i>
                      {{ documentTypeToString(row.type) }}
                    </span>
                  </td>
                  <td>
                    <span class="date-wrapper">{{ formatDateFull(row.created_at) }}</span>
                  </td>
                  <td>
                    <a class="download-link" @click="downloadDocument(row.id)">
                      <strong>Descargar&nbsp;</strong>
                      <i class="ic ic_download"></i>
                    </a>
                  </td>
                </tr>
              </tbody>
            </table>

            <!-- Pagination -->
            <div v-if="totalResults > pageSize" class="pagination-container">
              <button class="page-btn" :disabled="currentPage <= 1" @click="onPageChanged(currentPage - 1)">‹</button>
              <span class="page-info">Página {{ currentPage }} de {{ Math.ceil(totalResults / pageSize) }}</span>
              <button class="page-btn" :disabled="currentPage >= Math.ceil(totalResults / pageSize)" @click="onPageChanged(currentPage + 1)">›</button>
            </div>
          </template>

          <!-- Empty state -->
          <div v-else-if="hasFetched" class="empty-state">
            <i class="ic ic_search empty-icon"></i>
            <p>No se encontraron reportes para el periodo seleccionado.</p>
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

const startDate = ref('')
const endDate = ref('')
const loading = ref(false)
const hasFetched = ref(false)
const documents = ref<any[]>([])
const currentPage = ref(1)
const pageSize = ref(10)
const totalResults = ref(0)
const selectedTypes = ref<string[]>([])
const showTypeDropdown = ref(false)
const activeShortcut = ref(30)

const reportTypeOptions = [
  { label: 'Reporte semanal de transacciones', value: 'WEEKLY_MERCHANT_REPORT', icon: 'ic_chart-bar-window' },
  { label: 'Reporte diario de transacciones', value: 'DAILY_MERCHANT_REPORT', icon: 'ic_chart-analytics' },
  { label: 'Reporte diario desembolso', value: 'DISBURSEMENT_REPORT', icon: 'ic_files-money' },
]

const dateShortcuts = [
  { label: 'Último mes', days: 30 },
  { label: 'Últimos 3 meses', days: 90 },
  { label: 'Últimos 6 meses', days: 180 },
]

function documentTypeToString(type: string): string {
  const map: Record<string, string> = {
    WEEKLY_MERCHANT_REPORT: 'Reporte semanal de transacciones',
    DAILY_MERCHANT_REPORT: 'Reporte diario de transacciones',
    DISBURSEMENT_REPORT: 'Reporte diario desembolso',
  }
  return map[type] ?? 'Reporte'
}

function documentTypeToIcon(type: string): string {
  const map: Record<string, string> = {
    WEEKLY_MERCHANT_REPORT: 'ic ic_chart-bar-window',
    DAILY_MERCHANT_REPORT: 'ic ic_chart-analytics',
    DISBURSEMENT_REPORT: 'ic ic_files-money',
  }
  return map[type] ?? 'ic ic_document'
}

watch([startDate, endDate], ([from, to]) => {
  if (from && to) { currentPage.value = 1; fetchData() }
})

function applyTypeFilter() {
  showTypeDropdown.value = false
  currentPage.value = 1
  if (startDate.value && endDate.value) fetchData()
}

async function fetchData() {
  loading.value = true
  try {
    const api = createApiClient({ useAuth: true, refreshSession })
    const filters: Record<string, unknown> = {
      from_date: startDate.value,
      until_date: endDate.value,
      page_size: pageSize.value,
      page: currentPage.value,
    }
    if (selectedTypes.value.length > 0) filters.type = selectedTypes.value
    const response = await api<{ data: any[]; meta: { total_results: number; page_size: number } }>(
      '/documents', { query: filters }
    )
    documents.value = response?.data ?? []
    totalResults.value = response?.meta?.total_results ?? 0
    pageSize.value = response?.meta?.page_size ?? 10
  } catch {
    documents.value = []
    totalResults.value = 0
  } finally {
    loading.value = false
    hasFetched.value = true
  }
}

function onPageChanged(page: number) { currentPage.value = page; fetchData() }

async function downloadDocument(id: string) {
  try {
    const api = createApiClient({ useAuth: true, refreshSession })
    const res = await api<{ data: { url: string } }>(`/documents/${id}`)
    if (res?.data?.url) window.location.href = res.data.url
  } catch { /* silent */ }
}

function applyShortcut(days: number) {
  activeShortcut.value = days
  const end = new Date(); const start = new Date()
  start.setDate(start.getDate() - days)
  startDate.value = start.toISOString().slice(0, 10)
  endDate.value = end.toISOString().slice(0, 10)
}

function formatDisplayDate(dateStr: string) {
  return new Date(dateStr + 'T00:00:00').toLocaleDateString('es-CO', { year: 'numeric', month: 'long', day: 'numeric' })
}

function formatDateFull(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('es-CO', { weekday: 'long', day: '2-digit', month: '2-digit', year: 'numeric' })
}

onMounted(() => { applyShortcut(30) })
</script>

<style scoped>
/* === View Title Bar === */
.view-title-bar { background: #2C2A29; color: #fff; }
.view-title-bar__container { max-width: 74.25rem; margin: 0 auto; height: 100px; display: flex; align-items: center; padding: 0 1.5rem; }
.view-title-bar__text { font-size: 1.6rem; font-weight: 400; }

/* === Content === */
.view-content.container { max-width: 74.25rem; margin: 0 auto; padding: 0 1.5rem; }

/* === Section header === */
.container-info { display: flex; align-content: center; justify-content: center; width: 100%; padding: 1.5rem 0 0; }
.container-info__section { display: flex; align-items: center; justify-content: space-between; width: 100%; flex-wrap: wrap; gap: 9px; }
.container-info__title { font-size: 28px; font-weight: 700; color: #2C2A29; }

/* === Reports container === */
.container-reports { border-radius: 16px; margin-top: 17.6px; }
.content-box { padding: 0; }

/* === Filter header === */
.filter-header { display: flex; gap: 2rem; margin-bottom: 0.3rem; flex-wrap: wrap; }
.filter-columns { flex: 1; min-width: 280px; margin-bottom: 16px; }
.filter-header__description { color: #2C2A29; font-size: 20px; font-weight: 700; line-height: 24px; letter-spacing: -0.375px; margin: 0 0 1rem; }

/* === Report type buttons === */
.group-button-report { display: flex; flex-wrap: wrap; margin-top: 0; gap: 10px; }
.report-btn {
  display: inline-flex; align-items: center; gap: 6px;
  font-size: 14px; padding: 8px 16px; border-radius: 20px;
  border: 1px solid #2C2A29; cursor: pointer; font-weight: 600;
  background: #fff; color: #2C2A29; transition: all 0.15s;
}
.report-btn .ic { font-size: 20px; }
.report-btn--active { background: #2C2A29; color: #DFFF61; border-color: #2C2A29; }

/* === Type filter dropdown === */
.type-filter { position: relative; }
.type-filter__btn {
  display: inline-flex; align-items: center; gap: 6px;
  padding: 8px 16px; border-radius: 20px; border: 1px solid #2C2A29;
  background: #fff; color: #2C2A29; font-size: 14px; font-weight: 400; cursor: pointer;
}
.type-filter__btn .ic { font-size: 16px; }
.type-filter__dropdown {
  position: absolute; top: 100%; left: 0; z-index: 10;
  background: #fff; border: 1px solid #E6E6E6; border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.12); padding: 8px 0; min-width: 280px; margin-top: 4px;
}
.type-filter__option {
  display: flex; align-items: center; gap: 8px; padding: 8px 16px; cursor: pointer; font-size: 14px; color: #2C2A29;
}
.type-filter__option:hover { background: #F5F5F5; }
.type-filter__option input { accent-color: #2C2A29; }
.type-filter__option .ic { font-size: 16px; }
.type-filter__actions { display: flex; justify-content: flex-end; gap: 8px; padding: 8px 16px; border-top: 1px solid #E6E6E6; margin-top: 4px; }
.action-btn { padding: 6px 16px; border-radius: 20px; font-size: 13px; font-weight: 600; cursor: pointer; border: 1px solid #2C2A29; }
.action-btn--clear { background: #fff; color: #2C2A29; }
.action-btn--apply { background: #2C2A29; color: #DFFF61; }

/* === Date pickers === */
.date-picker-group { display: flex; flex-direction: column; gap: 4px; }
.date-label { font-size: 0.7rem; color: #616161; font-weight: 600; text-transform: uppercase; }
.date-input { width: 10rem; height: 36px; border: 1px solid #CACACA; border-radius: 4px; padding: 0 8px; font-size: 0.875rem; color: #2C2A29; outline: none; font-family: "Open Sans", sans-serif; }
.date-input:focus { border-color: #2C2A29; }

/* === Shortcuts === */
.date-shortcuts { display: flex; gap: 0.5rem; align-items: flex-end; }
.shortcut-btn { height: 36px; padding: 0 12px; border: 1px solid #CACACA; border-radius: 4px; background: #fff; font-size: 0.8rem; color: #616161; cursor: pointer; transition: all 0.15s; font-family: "Open Sans", sans-serif; }
.shortcut-btn:hover { border-color: #2C2A29; color: #2C2A29; }
.shortcut-btn.active { background: #2C2A29; color: #fff; border-color: #2C2A29; }

/* === Current period === */
.current-period-report { color: #2C2A29; font-size: 16px; font-weight: 400; line-height: 22px; letter-spacing: -0.3px; margin: 0 0 1rem; }
.current-period-report strong { font-weight: 800; }

/* === Table === */
.documents-table { width: 100%; border-collapse: collapse; background: #fff; margin-bottom: 10px; }
.documents-table thead th { color: #2C2A29; font-size: 16px; font-weight: 700; line-height: 22px; letter-spacing: -0.3px; text-align: left; padding: 12px 16px; border-bottom: 1px solid #BDF4BC; }
.documents-table td { padding: 12px 16px; font-size: 14px; color: #2C2A29; border-bottom: 1px solid #F0F0F0; }
.documents-table tbody tr:hover { background: #F9F9F9; }
.type-cell { display: flex; align-items: center; gap: 6px; color: #2C2A29; font-weight: 400; }
.type-cell i { font-size: 16px; }
.date-wrapper { color: #2C2A29; }
.download-link { cursor: pointer; color: #888; display: inline-flex; align-items: center; gap: 4px; font-size: 14px; }
.download-link:hover { color: #2C2A29; }
.download-link .ic { font-size: 20px; }

/* === Pagination === */
.pagination-container { margin-top: 20px; display: flex; justify-content: center; align-items: center; gap: 1rem; padding-bottom: 1rem; }
.page-btn { width: 32px; height: 32px; border: 1px solid #CACACA; border-radius: 4px; background: #fff; cursor: pointer; font-size: 1rem; color: #2C2A29; }
.page-btn:hover:not(:disabled) { border-color: #2C2A29; }
.page-btn:disabled { opacity: 0.4; cursor: not-allowed; }
.page-info { font-size: 0.85rem; color: #616161; }

/* === Loading === */
.loading-state { display: flex; align-items: center; justify-content: center; gap: 0.5rem; padding: 3rem 0; color: #888; }
.loading-spinner { width: 20px; height: 20px; border: 2px solid #CACACA; border-top-color: #2C2A29; border-radius: 50%; animation: spin 0.6s linear infinite; }
@keyframes spin { to { transform: rotate(360deg); } }

/* === Empty state === */
.empty-state { display: flex; flex-direction: column; align-items: center; gap: 0.75rem; padding: 3rem 0; color: #888; }
.empty-icon { font-size: 2rem; }

/* === Responsive === */
@media screen and (max-width: 48rem) {
  .view-title-bar__text { font-size: 1.3rem; }
  .view-title-bar__container { justify-content: center; }
  .container-info__title { font-size: 22px; }
  .filter-header__description { font-size: 16px; }
  .filter-header { flex-direction: column; gap: 1rem; }
  .group-button-report { flex-direction: column; }
  .date-shortcuts { flex-wrap: wrap; }
}
</style>
