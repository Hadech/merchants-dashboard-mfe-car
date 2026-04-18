<template>
  <div class="disbursements-page">
    <!-- View Title (replica legacy ViewTitle) -->
    <div class="view-title-bar">
      <div class="view-title-bar__container">
        <span class="view-title-bar__text">Recibir pagos: Desembolsos</span>
      </div>
    </div>

    <!-- Content -->
    <div class="disbursements-content">
      <!-- Filter header -->
      <div class="filter-header">
        <p class="filter-header__description">
          Escoge las fechas para las que quieres ver desembolsos
        </p>

        <!-- Date pickers (replica legacy WayDatePicker) -->
        <div class="date-picker-row">
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

        <!-- Current period text -->
        <p v-if="startDate && endDate" class="current-period">
          Viendo desembolsos generados entre
          <br>
          <strong>{{ formatDisplayDate(startDate) }}</strong>
          &nbsp;~&nbsp;
          <strong>{{ formatDisplayDate(endDate) }}</strong>
        </p>
      </div>

      <!-- Results table -->
      <div v-if="loading" class="results-box">
        <div class="loading-container">
          <UIcon name="i-heroicons-arrow-path" class="animate-spin text-xl text-gray-400" />
          <span class="text-sm text-gray-400 ml-2">Cargando desembolsos...</span>
        </div>
      </div>

      <div v-else-if="hasFetched && disbursements.length > 0" class="results-box">
        <table class="disbursements-table">
          <thead>
            <tr>
              <th style="min-width:100px">Monto</th>
              <th>Estado</th>
              <th>Cuenta bancaria</th>
              <th style="min-width:120px">Fecha de creación</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="row in disbursements" :key="row.id || row.created_at">
              <td><strong class="amount-cell">COP {{ formatPrice(row.amount_in_cents) }}</strong></td>
              <td>
                <WStatusBadge :status="statusToType(row.status)" :label="statusToString(row.status)" />
              </td>
              <td>
                <span v-if="row.bank_account_type === 'CHECKING'">Corriente</span>
                <span v-else-if="row.bank_account_type === 'SAVINGS'">Ahorros</span>
                &nbsp;{{ row.bank_account_number }}
              </td>
              <td>
                <div class="date-cell">
                  <span class="ic ic_calendar date-icon"></span>
                  <span>{{ formatDate(row.created_at) }}</span>
                </div>
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
      </div>

      <!-- Error notification -->
      <div v-else-if="hasError" class="empty-state">
        <UIcon name="i-heroicons-exclamation-triangle" class="text-red-400 text-2xl" />
        <p>Ocurrió un error y no se pudieron cargar los desembolsos. Intenta nuevamente más tarde.</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { usePayoutsApi } from '~/composables/usePayoutsApi'

const { getDisbursements } = usePayoutsApi()

const startDate = ref('')
const endDate = ref('')
const loading = ref(false)
const hasFetched = ref(false)
const hasError = ref(false)
const disbursements = ref<any[]>([])
const currentPage = ref(1)
const pageSize = ref(25)
const totalResults = ref(0)

const columns = [
  { id: 'amount_in_cents', key: 'amount_in_cents', label: 'Monto' },
  { id: 'status', key: 'status', label: 'Estado' },
  { id: 'bank_account', key: 'bank_account', label: 'Cuenta bancaria' },
  { id: 'created_at', key: 'created_at', label: 'Fecha de creación' },
]

const dateShortcuts = [
  { label: 'Último mes', days: 30 },
  { label: 'Últimos 3 meses', days: 90 },
  { label: 'Últimos 6 meses', days: 180 },
]

// Status mapping matching legacy exactly
function statusToType(status: string): 'success' | 'danger' | 'warning' | 'pending' {
  const map: Record<string, 'success' | 'danger' | 'warning' | 'pending'> = {
    APPROVED: 'success',
    DECLINED: 'danger',
    IN_PROGRESS: 'warning',
    ERROR: 'danger',
    PENDING: 'pending',
  }
  return map[status] ?? 'pending'
}

function statusToString(status: string): string {
  const map: Record<string, string> = {
    APPROVED: 'APROBADO',
    DECLINED: 'RECHAZADO',
    IN_PROGRESS: 'EN PROGRESO',
    ERROR: 'ERROR',
    PENDING: 'PENDIENTE',
  }
  return map[status] ?? status
}

// Auto-fetch when dates change (like legacy watcher on chosenDates)
watch([startDate, endDate], ([from, to]) => {
  if (from && to) {
    currentPage.value = 1
    fetchData()
  }
})

async function fetchData() {
  loading.value = true
  hasError.value = false
  try {
    const response = await getDisbursements({
      from_date: startDate.value,
      until_date: endDate.value,
      page_size: pageSize.value,
      page: currentPage.value,
    })
    disbursements.value = response.data ?? []
    totalResults.value = response.meta?.total_results ?? 0
    pageSize.value = response.meta?.page_size ?? 25
  } catch {
    disbursements.value = []
    totalResults.value = 0
    hasError.value = true
  } finally {
    loading.value = false
    hasFetched.value = true
  }
}

function onPageChanged(page: number) {
  currentPage.value = page
  fetchData()
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

function formatPrice(cents: number) {
  return new Intl.NumberFormat('es-CO', { minimumFractionDigits: 0 }).format(cents / 100)
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('es-CO', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

function formatDisplayDate(dateStr: string) {
  return new Date(dateStr + 'T00:00:00').toLocaleDateString('es-CO', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

// Default: load last 30 days on mount (like legacy WayDatePicker created())
onMounted(() => {
  applyShortcut(30)
})
</script>

<style scoped>
/* View Title Bar — replica legacy ViewTitle */
.view-title-bar {
  background: #2C2A29;
  color: #fff;
  position: relative;
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

/* Content area */
.disbursements-content {
  max-width: 74.25rem;
  margin: 0 auto;
  padding: 0 1.5rem;
}

/* Filter header */
.filter-header {
  margin-top: 0.6875rem;
  margin-bottom: 0.9375rem;
  display: flex;
  flex-direction: column;
}

.filter-header__description {
  color: #2C2A29;
  font-size: 1rem;
  font-weight: 600;
  margin: 0.5rem 0;
}

/* Date picker row */
.date-picker-row {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  flex-wrap: wrap;
}

.date-input {
  width: 10rem;
}

.date-shortcuts {
  display: flex;
  gap: 0.5rem;
  margin-left: 0.5rem;
}

/* Current period text — matches legacy */
.current-period {
  color: #888;
  text-transform: uppercase;
  text-align: center;
  font-size: 0.8rem;
  margin: 1.5rem 0 0.3rem;
}

.current-period strong {
  color: #2C2A29;
}

/* Results box */
.results-box {
  margin-top: 0.9375rem;
  border-radius: 3px;
}

/* Table */
.disbursements-table {
  width: 100%;
  border-collapse: collapse;
  background: #fff;
  border-radius: 4px;
  overflow: hidden;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
}

.disbursements-table thead {
  background: #FAFAFA;
}

.disbursements-table th {
  text-align: left;
  padding: 12px 16px;
  font-size: 0.8rem;
  font-weight: 600;
  color: #616161;
  text-transform: uppercase;
  border-bottom: 1px solid #EBEEF5;
}

.disbursements-table td {
  padding: 12px 16px;
  font-size: 0.875rem;
  color: #2C2A29;
  border-bottom: 1px solid #EBEEF5;
}

.disbursements-table tbody tr:hover {
  background: #F5F7FA;
}

/* Amount cell */
.amount-cell {
  font-weight: 600;
}

/* Date cell with icon — matches legacy date_range icon */
.date-cell {
  display: flex;
  align-items: center;
  gap: 0.35rem;
}

.date-icon {
  color: #888;
  font-size: 0.9rem;
}

/* Pagination */
.pagination-container {
  margin-top: 1.8125rem;
  text-align: center;
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 1rem;
  padding-bottom: 1rem;
}

.page-btn {
  width: 32px;
  height: 32px;
  border: 1px solid #CACACA;
  border-radius: 4px;
  background: #fff;
  cursor: pointer;
  font-size: 1rem;
  color: #2C2A29;
}

.page-btn:hover:not(:disabled) {
  border-color: #2C2A29;
}

.page-btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.page-info {
  font-size: 0.85rem;
  color: #616161;
}

/* Loading */
.loading-container {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 3rem 0;
}

/* Empty / Error state */
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

  .date-picker-row {
    flex-direction: column;
    align-items: flex-start;
  }

  .date-shortcuts {
    margin-left: 0;
  }

  .pagination-container {
    margin-top: 0.875rem;
  }
}
</style>
