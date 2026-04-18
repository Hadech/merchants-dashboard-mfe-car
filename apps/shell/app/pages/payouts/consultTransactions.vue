<template>
  <div class="consult-tx-page">
    <!-- View Title Bar -->
    <div class="view-title-bar">
      <div class="view-title-bar__container">
        <span class="view-title-bar__text">Pagos a terceros</span>
      </div>
    </div>

    <!-- Content -->
    <div class="consult-tx-content">
      <h2 class="section-title">Consultar transacciones</h2>

      <!-- Filters -->
      <div class="filter-row">
        <div class="filter-controls">
          <UInput
            v-model="startDate"
            type="date"
            placeholder="Fecha desde"
            class="date-input"
          />
          <UInput
            v-model="endDate"
            type="date"
            placeholder="Fecha hasta"
            class="date-input"
          />
          <USelectMenu
            v-model="statusFilter"
            :items="statusOptions"
            placeholder="Estado"
            class="status-select"
          />
          <div class="date-shortcuts">
            <UButton
              v-for="s in dateShortcuts"
              :key="s.label"
              variant="outline"
              color="neutral"
              size="xs"
              @click="applyShortcut(s.days)"
            >
              {{ s.label }}
            </UButton>
          </div>
        </div>
      </div>

      <!-- Current period -->
      <p v-if="startDate && endDate" class="current-period">
        <strong>Transacciones del periodo: </strong>
        <span>({{ formatDisplayDate(startDate) }} - {{ formatDisplayDate(endDate) }})</span>
      </p>

      <!-- Loading -->
      <div v-if="loading" class="loading-state">
        <UIcon name="i-heroicons-arrow-path" class="animate-spin text-xl text-gray-400" />
        <span>Cargando transacciones...</span>
      </div>

      <!-- Table -->
      <template v-else-if="hasFetched && transactions.length > 0">
        <div class="results-box">
          <UTable :columns="columns" :rows="transactions">
            <template #cell-id="{ row }">
              <span class="id-cell" :title="row.id">{{ shortId(row.id) }}</span>
            </template>
            <template #cell-status="{ row }">
              <WStatusBadge
                :status="statusToType(row.status)"
                :label="statusToString(row.status)"
              />
            </template>
            <template #cell-amount_in_cents="{ row }">
              <strong>COP {{ formatPrice(row.amount_in_cents) }}</strong>
            </template>
            <template #cell-destination="{ row }">
              {{ row.destination?.bank_name || '—' }} · {{ row.destination?.account_number || '' }}
            </template>
            <template #cell-created_at="{ row }">
              <div class="date-cell">
                <UIcon name="i-heroicons-calendar" class="date-icon" />
                <span>{{ formatDate(row.created_at) }}</span>
              </div>
            </template>
          </UTable>
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
        <UIcon name="i-heroicons-document-magnifying-glass" class="text-2xl text-gray-400" />
        <p>No se encontraron transacciones para el periodo seleccionado.</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useApiClient } from '@wompi/api-client'

const api = useApiClient()

const startDate = ref('')
const endDate = ref('')
const statusFilter = ref('')
const loading = ref(false)
const hasFetched = ref(false)
const transactions = ref<any[]>([])
const currentPage = ref(1)
const pageSize = ref(25)
const totalResults = ref(0)

const columns = [
  { key: 'id', label: 'ID' },
  { key: 'status', label: 'Estado' },
  { key: 'amount_in_cents', label: 'Monto' },
  { key: 'destination', label: 'Destino' },
  { key: 'created_at', label: 'Fecha' },
]

const statusOptions = [
  { label: 'Todos', value: '' },
  { label: 'Pendiente', value: 'PENDING' },
  { label: 'Aprobado', value: 'APPROVED' },
  { label: 'Rechazado', value: 'REJECTED' },
  { label: 'Completado', value: 'COMPLETED' },
  { label: 'Error', value: 'ERROR' },
]

const dateShortcuts = [
  { label: 'Último mes', days: 30 },
  { label: 'Últimos 3 meses', days: 90 },
  { label: 'Últimos 6 meses', days: 180 },
]

function statusToType(status: string): 'success' | 'danger' | 'warning' | 'pending' {
  const map: Record<string, 'success' | 'danger' | 'warning' | 'pending'> = {
    APPROVED: 'success',
    COMPLETED: 'success',
    REJECTED: 'danger',
    ERROR: 'danger',
    PENDING: 'pending',
    IN_PROGRESS: 'warning',
  }
  return map[status] ?? 'pending'
}

function statusToString(status: string): string {
  const map: Record<string, string> = {
    APPROVED: 'APROBADO',
    COMPLETED: 'COMPLETADO',
    REJECTED: 'RECHAZADO',
    ERROR: 'ERROR',
    PENDING: 'PENDIENTE',
    IN_PROGRESS: 'EN PROGRESO',
  }
  return map[status] ?? status
}

watch([startDate, endDate], ([from, to]) => {
  if (from && to) {
    currentPage.value = 1
    fetchData()
  }
})

watch(statusFilter, () => {
  if (startDate.value && endDate.value) {
    currentPage.value = 1
    fetchData()
  }
})

async function fetchData() {
  loading.value = true
  try {
    const query: Record<string, unknown> = {
      from_date: startDate.value,
      until_date: endDate.value,
      page_size: pageSize.value,
      page: currentPage.value,
    }
    if (statusFilter.value) query.status = statusFilter.value

    const data = await api<{ data: any[]; meta: { total_results: number; page_size: number } }>(
      '/payouts/transactions',
      { query }
    )
    transactions.value = data.data ?? []
    totalResults.value = data.meta?.total_results ?? 0
    pageSize.value = data.meta?.page_size ?? 25
  } catch {
    transactions.value = []
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

function shortId(id: string) {
  return id.length > 8 ? `${id.slice(0, 8)}…` : id
}

function formatPrice(cents: number) {
  return new Intl.NumberFormat('es-CO', { minimumFractionDigits: 0 }).format(cents / 100)
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('es-CO', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function formatDisplayDate(dateStr: string) {
  return new Date(dateStr + 'T00:00:00').toLocaleDateString('es-CO', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

onMounted(() => applyShortcut(30))
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
.consult-tx-content {
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

/* Filters */
.filter-row {
  margin-bottom: 1rem;
}

.filter-controls {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  align-items: center;
}

.date-input {
  width: 10rem;
}

.status-select {
  width: 10rem;
}

.date-shortcuts {
  display: flex;
  gap: 0.5rem;
}

/* Current period */
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

/* Results */
.results-box {
  margin-top: 0.5rem;
  border-radius: 3px;
}

.id-cell {
  font-family: monospace;
  font-size: 0.8125rem;
  color: #555;
  cursor: default;
}

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
  display: flex;
  justify-content: center;
}

/* Loading */
.loading-state {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 3rem 0;
  color: #999;
}

/* Empty */
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

  .section-title {
    font-size: 22px;
  }

  .filter-controls {
    flex-direction: column;
    align-items: flex-start;
  }

  .date-shortcuts {
    flex-wrap: wrap;
  }

  .pagination-container {
    margin-top: 0.875rem;
  }
}
</style>
