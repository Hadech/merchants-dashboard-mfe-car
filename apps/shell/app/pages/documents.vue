<template>
  <div class="documents-page">
    <!-- View Title Bar -->
    <div class="view-title-bar">
      <div class="view-title-bar__container">
        <span class="view-title-bar__text">Reportes: Recibir pagos</span>
      </div>
    </div>

    <!-- Content -->
    <div class="documents-content">
      <!-- Section header -->
      <div class="container-info">
        <span class="container-info__title">Reportes de tu comercio</span>
      </div>

      <!-- Filters area -->
      <div class="content-box">
        <div class="filter-row">
          <!-- Left: report type toggle -->
          <div class="filter-col">
            <p class="filter-label">¿Cómo quieres ver tus reportes?</p>
            <div class="report-type-buttons">
              <UButton
                :color="reportView === 'standart' ? 'primary' : 'neutral'"
                :variant="reportView === 'standart' ? 'solid' : 'outline'"
                icon="i-heroicons-document-text"
                @click="handleTypeReportView('standart')"
              >
                Reportes estándar
              </UButton>
            </div>
          </div>

          <!-- Right: type filter + date filter -->
          <div class="filter-col">
            <p class="filter-label">Filtros</p>
            <div class="filter-controls">
              <!-- Report type filter (only for standart) -->
              <USelectMenu
                v-if="reportView === 'standart'"
                v-model="selectedTypes"
                :items="reportTypeOptions"
                multiple
                placeholder="Tipo de reporte"
                class="type-select"
                @update:model-value="handleTypeFilter"
              />

              <!-- Date pickers -->
              <UInput
                v-model="startDate"
                type="date"
                placeholder="Fecha inicial"
                class="date-input"
              />
              <UInput
                v-model="endDate"
                type="date"
                placeholder="Fecha final"
                class="date-input"
              />

              <!-- Shortcuts -->
              <div class="date-shortcuts">
                <UButton
                  v-for="shortcut in dateShortcuts"
                  :key="shortcut.label"
                  variant="outline"
                  color="neutral"
                  size="xs"
                  @click="applyShortcut(shortcut.days)"
                >
                  {{ shortcut.label }}
                </UButton>
              </div>
            </div>
          </div>
        </div>

        <!-- Current period -->
        <p v-if="startDate && endDate" class="current-period">
          <strong>Reporte generado en el periodo: </strong>
          <span>({{ formatDisplayDate(startDate) }} - {{ formatDisplayDate(endDate) }})</span>
        </p>

        <!-- Loading -->
        <div v-if="loading" class="loading-state">
          <UIcon name="i-heroicons-arrow-path" class="animate-spin text-xl text-gray-400" />
          <span>Cargando reportes...</span>
        </div>

        <!-- Desktop table -->
        <template v-else-if="hasFetched && documents.length > 0">
          <table class="documents-table">
            <thead>
              <tr>
                <th>Tipo de reporte</th>
                <th>Fecha de reporte</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="row in documents" :key="row.id">
                <td>
                  <span class="type-cell">{{ documentTypeToString(row.type) }}</span>
                </td>
                <td>{{ formatDateFull(row.created_at) }}</td>
                <td>
                  <a class="download-link" @click="downloadDocument(row.id)">
                    <strong>Descargar</strong>
                    <span class="ic ic_download"></span>
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
          <UIcon name="i-heroicons-document-magnifying-glass" class="text-2xl text-gray-400" />
          <p>No se encontraron reportes para el periodo seleccionado.</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useDocumentsApi } from '~/composables/useDocumentsApi'

const { getDocuments, getDocumentUrl } = useDocumentsApi()

const startDate = ref('')
const endDate = ref('')
const loading = ref(false)
const hasFetched = ref(false)
const documents = ref<any[]>([])
const currentPage = ref(1)
const pageSize = ref(10)
const totalResults = ref(0)
const reportView = ref<'standart' | 'customReport'>('standart')
const selectedTypes = ref<string[]>([])

const columns = [
  { key: 'type', label: 'Tipo de reporte' },
  { key: 'created_at', label: 'Fecha de reporte' },
  { key: 'download', label: '' },
]

const reportTypeOptions = [
  { label: 'Reporte semanal de transacciones', value: 'WEEKLY_MERCHANT_REPORT' },
  { label: 'Reporte diario de transacciones', value: 'DAILY_MERCHANT_REPORT' },
  { label: 'Reporte diario desembolso', value: 'DISBURSEMENT_REPORT' },
]

const dateShortcuts = [
  { label: 'Último mes', days: 30 },
  { label: 'Últimos 3 meses', days: 90 },
  { label: 'Últimos 6 meses', days: 180 },
]

// Document type mapping — matches legacy exactly
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
    WEEKLY_MERCHANT_REPORT: 'i-heroicons-chart-bar',
    DAILY_MERCHANT_REPORT: 'i-heroicons-chart-bar-square',
    DISBURSEMENT_REPORT: 'i-heroicons-banknotes',
  }
  return map[type] ?? 'i-heroicons-document'
}

// Auto-fetch when dates change (like legacy watcher)
watch([startDate, endDate], ([from, to]) => {
  if (from && to) {
    currentPage.value = 1
    fetchData()
  }
})

function handleTypeReportView(view: 'standart' | 'customReport') {
  reportView.value = view
  selectedTypes.value = []
  currentPage.value = 1
  if (startDate.value && endDate.value) fetchData()
}

function handleTypeFilter() {
  currentPage.value = 1
  if (startDate.value && endDate.value) fetchData()
}

async function fetchData() {
  loading.value = true
  try {
    const filters: Record<string, unknown> = {
      from_date: startDate.value,
      until_date: endDate.value,
      page_size: pageSize.value,
      page: currentPage.value,
    }
    if (selectedTypes.value.length > 0) {
      filters.type = selectedTypes.value
    }
    const response = await getDocuments(filters)
    documents.value = response.data ?? []
    totalResults.value = response.meta?.total_results ?? 0
    pageSize.value = response.meta?.page_size ?? 10
  } catch {
    documents.value = []
    totalResults.value = 0
  } finally {
    loading.value = false
    hasFetched.value = true
  }
}

function onPageChanged(page: number) {
  currentPage.value = page
  fetchData()
}

async function downloadDocument(id: string) {
  try {
    const url = await getDocumentUrl(id)
    window.location.href = url
  } catch {
    // silent fail
  }
}

function applyShortcut(days: number) {
  const end = new Date()
  const start = new Date()
  start.setDate(start.getDate() - days)
  startDate.value = toDateString(start)
  endDate.value = toDateString(end)
}

function toDateString(d: Date): string {
  return d.toISOString().slice(0, 10)
}

function formatDisplayDate(dateStr: string) {
  return new Date(dateStr + 'T00:00:00').toLocaleDateString('es-CO', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

function formatDateFull(dateStr: string) {
  const d = new Date(dateStr)
  return d.toLocaleDateString('es-CO', {
    weekday: 'long',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  })
}

// Default: load last 30 days on mount
onMounted(() => {
  applyShortcut(30)
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
}

/* Content */
.documents-content {
  max-width: 74.25rem;
  margin: 0 auto;
  padding: 0 1.5rem;
}

/* Section header — matches legacy container-info */
.container-info {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1.5rem 0 0;
  flex-wrap: wrap;
  gap: 9px;
}

.container-info__title {
  font-size: 28px;
  font-weight: 700;
  color: #2C2A29;
}

/* Content box — matches legacy container-reports */
.content-box {
  border-radius: 16px;
  margin-top: 17.6px;
}

/* Filter row */
.filter-row {
  display: flex;
  gap: 2rem;
  margin-bottom: 0.3rem;
  flex-wrap: wrap;
}

.filter-col {
  flex: 1;
  min-width: 280px;
  margin-bottom: 16px;
}

.filter-label {
  color: #2C2A29;
  font-size: 20px;
  font-weight: 700;
  line-height: 24px;
  letter-spacing: -0.375px;
  margin: 0 0 1rem;
}

/* Report type buttons */
.report-type-buttons {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

/* Filter controls */
.filter-controls {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  align-items: center;
}

.type-select {
  width: 200px;
}

.date-input {
  width: 10rem;
}

.date-shortcuts {
  display: flex;
  gap: 0.5rem;
}

/* Current period — matches legacy */
.current-period {
  color: #2C2A29;
  font-size: 16px;
  font-weight: 400;
  line-height: 22px;
  letter-spacing: -0.3px;
  margin: 0 0 1rem;
}

.current-period strong {
  font-weight: 800;
}

/* Table styling */
.documents-table {
  width: 100%;
  border-collapse: collapse;
  background: #fff;
  border-radius: 4px;
  overflow: hidden;
  box-shadow: 0 1px 3px rgba(0,0,0,0.08);
  margin-bottom: 10px;
}
.documents-table thead { background: #FAFAFA; }
.documents-table th {
  text-align: left; padding: 12px 16px;
  font-size: 0.8rem; font-weight: 600; color: #616161;
  text-transform: uppercase; border-bottom: 1px solid #EBEEF5;
}
.documents-table td {
  padding: 12px 16px; font-size: 0.875rem; color: #2C2A29;
  border-bottom: 1px solid #EBEEF5;
}
.documents-table tbody tr:hover { background: #F5F7FA; }

.type-cell {
  display: flex;
  align-items: center;
  gap: 6px;
  color: #2C2A29;
  font-weight: 400;
}

.type-icon {
  font-size: 16px;
}

.download-link {
  cursor: pointer;
  color: #888;
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 14px;
}

.download-link:hover {
  color: #2C2A29;
}

/* Pagination */
.pagination-container {
  margin-top: 20px;
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 1rem;
  padding-bottom: 1rem;
}
.page-btn {
  width: 32px; height: 32px; border: 1px solid #CACACA; border-radius: 4px;
  background: #fff; cursor: pointer; font-size: 1rem; color: #2C2A29;
}
.page-btn:hover:not(:disabled) { border-color: #2C2A29; }
.page-btn:disabled { opacity: 0.4; cursor: not-allowed; }
.page-info { font-size: 0.85rem; color: #616161; }

/* Loading */
.loading-state {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 3rem 0;
  color: #999;
}

/* Empty state */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.75rem;
  padding: 3rem 0;
  color: #888;
}

/* Responsive */
@media screen and (max-width: 48rem) {
  .view-title-bar__text {
    font-size: 1.3rem;
  }

  .view-title-bar__container {
    justify-content: center;
  }

  .container-info__title {
    font-size: 22px;
  }

  .filter-label {
    font-size: 16px;
  }

  .filter-row {
    flex-direction: column;
    gap: 1rem;
  }

  .filter-controls {
    flex-direction: column;
    align-items: flex-start;
  }

  .date-shortcuts {
    flex-wrap: wrap;
  }
}
</style>
