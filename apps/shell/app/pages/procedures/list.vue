<template>
  <div class="procedures-page">
    <!-- View Title Bar -->
    <div class="view-title-bar">
      <div class="view-title-bar__container">
        <span class="view-title-bar__text">Cuenta comercio: Procedimientos</span>
      </div>
    </div>

    <!-- Content -->
    <div class="procedures-content">
      <div class="procedures-columns">
        <!-- Left: New procedure -->
        <div class="col-new">
          <span class="box-label">Nuevo procedimiento</span>
          <div class="info-card">
            <p class="card-description">
              Actualiza datos sobre tu cuenta, escogiendo un procedimiento de la lista y llenando los datos respectivos en el siguiente paso:
            </p>
            <USelectMenu
              v-model="chosenProcedureId"
              :items="procedureOptions"
              placeholder="Selecciona un procedimiento"
              class="procedure-select"
            />
            <UButton
              color="primary"
              class="initiate-btn"
              :disabled="!chosenProcedureId || initiating"
              :loading="initiating"
              @click="initiateProcedure"
            >
              Iniciar procedimiento
            </UButton>
          </div>
        </div>
      </div>

      <!-- Recent procedures -->
      <span class="box-label">Tus procedimientos recientes</span>

      <!-- Loading -->
      <div v-if="loading" class="loading-state">
        <UIcon name="i-heroicons-arrow-path" class="animate-spin text-xl text-gray-400" />
        <span>Cargando procedimientos...</span>
      </div>

      <!-- Table -->
      <template v-else-if="resources.length > 0">
        <div class="results-box">
          <UTable :columns="columns" :rows="resources">
            <template #cell-name="{ row }">
              <a class="procedure-link" @click="goToDetail(row.id)">
                <strong>{{ row.name }}</strong>
              </a>
            </template>

            <template #cell-status="{ row }">
              <WStatusBadge
                :status="statusToType(row.status)"
                :label="statusToString(row.status)"
              />
            </template>

            <template #cell-created_at="{ row }">
              <div class="datetime-cell">
                <div class="date-cell">
                  <UIcon name="i-heroicons-calendar" class="meta-icon" />
                  <span>{{ formatDate(row.created_at) }}</span>
                </div>
                <div class="time-cell">
                  <UIcon name="i-heroicons-clock" class="meta-icon" />
                  <span>{{ formatTime(row.created_at) }}</span>
                </div>
              </div>
            </template>
          </UTable>
        </div>

        <!-- Pagination -->
        <div v-if="totalResults > pageSize" class="pagination-container">
          <UPagination
            v-model="currentPage"
            :total="totalResults"
            :items-per-page="pageSize"
            @update:model-value="onPageChanged"
          />
        </div>
      </template>

      <!-- Empty -->
      <div v-else-if="!loading" class="empty-state">
        <UIcon name="i-heroicons-clipboard-document-list" class="text-2xl text-gray-400" />
        <p>No tienes procedimientos recientes.</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useApiClient } from '@wompi/api-client'

const api = useApiClient()

const loading = ref(false)
const initiating = ref(false)
const resources = ref<any[]>([])
const procedures = ref<any[]>([])
const chosenProcedureId = ref('')
const currentPage = ref(1)
const pageSize = ref(25)
const totalResults = ref(0)

const columns = [
  { key: 'name', label: 'Procedimiento' },
  { key: 'status', label: 'Estado' },
  { key: 'created_at', label: 'Fecha de creación' },
]

const procedureOptions = computed(() =>
  procedures.value.map(p => ({ label: p.name, value: p.id }))
)

function statusToType(status: string): 'success' | 'danger' | 'warning' | 'pending' {
  const map: Record<string, 'success' | 'danger' | 'warning' | 'pending'> = {
    APPROVED: 'success',
    DECLINED: 'danger',
    IN_REVIEW: 'warning',
    PENDING: 'pending',
    RESCUE: 'warning',
  }
  return map[status] ?? 'pending'
}

function statusToString(status: string): string {
  const map: Record<string, string> = {
    APPROVED: 'Aprobado',
    DECLINED: 'Rechazado',
    IN_REVIEW: 'En Revisión',
    PENDING: 'SIN LLENAR',
    RESCUE: 'Rescate',
  }
  return map[status] ?? status
}

function goToDetail(id: string) {
  navigateTo(`/procedures/${id}`)
}

async function initiateProcedure() {
  if (!chosenProcedureId.value) return
  initiating.value = true
  try {
    const res = await api<{ data: any }>('/crm/businesses_procedures', {
      method: 'POST',
      body: { procedure_id: chosenProcedureId.value },
    })
    const bp = res.data
    if (bp?.id) navigateTo(`/procedures/${bp.id}`)
  } catch {
    // silent
  } finally {
    initiating.value = false
  }
}

async function fetchResources() {
  loading.value = true
  try {
    const merchantId = sessionStorage.getItem('userPrincipalID') || ''
    const res = await api<{ data: any[]; meta: { total_results: number } }>('/crm/businesses_procedures', {
      query: {
        merchant_id: merchantId,
        page: currentPage.value,
        page_size: pageSize.value,
      },
    })
    // Filter out identity_validation_payouts like legacy
    resources.value = (res.data ?? []).filter((r: any) => r.slug !== 'identity_validation_payouts')
    totalResults.value = res.meta?.total_results ?? 0
  } catch {
    resources.value = []
  } finally {
    loading.value = false
  }
}

async function fetchProcedures() {
  try {
    const res = await api<{ data: any[] }>('/crm/procedures')
    procedures.value = res.data ?? []
  } catch {
    procedures.value = []
  }
}

function onPageChanged(page: number) {
  currentPage.value = page
  fetchResources()
}

function formatDate(s: string) {
  return new Date(s).toLocaleDateString('es-CO', { year: 'numeric', month: 'short', day: 'numeric' })
}

function formatTime(s: string) {
  return new Date(s).toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' })
}

onMounted(() => {
  fetchProcedures()
  fetchResources()
})
</script>

<style scoped>
/* View Title Bar */
.view-title-bar { background: #2C2A29; color: #fff; }
.view-title-bar__container { max-width: 74.25rem; margin: 0 auto; height: 100px; display: flex; align-items: center; padding: 0 1.5rem; }
.view-title-bar__text { font-size: 1.6rem; }

/* Content */
.procedures-content { max-width: 74.25rem; margin: 0 auto; padding: 1.5rem; }

/* Columns */
.procedures-columns { display: flex; gap: 2rem; margin-bottom: 1rem; }
.col-new { flex: 0 0 50%; }

/* Box label */
.box-label { display: block; font-size: 0.875rem; font-weight: 600; color: #555; margin: 1rem 0 0.5rem; }

/* Info card */
.info-card {
  background: #fff; border: 1px solid #e0e0e0; border-radius: 20px;
  box-shadow: 0px 1px 8px 0px rgba(0, 0, 0, 0.08); padding: 2rem;
}

.card-description { font-size: 0.9375rem; color: #333; margin-bottom: 1rem; line-height: 1.5; }
.procedure-select { width: 100%; margin-bottom: 1rem; }
.initiate-btn { border-radius: 2rem; font-weight: 600; }

/* Results */
.results-box { margin-top: 0.9375rem; border-radius: 3px; }

.procedure-link { cursor: pointer; color: #2C2A29; text-decoration: none; }
.procedure-link:hover { color: #00C389; }

.datetime-cell { display: flex; flex-direction: column; gap: 2px; }
.date-cell, .time-cell { display: flex; align-items: center; gap: 4px; font-size: 0.8125rem; color: #555; }
.meta-icon { font-size: 0.875rem; color: #888; }

/* Pagination */
.pagination-container { margin-top: 1.8125rem; display: flex; justify-content: center; }

/* Loading / Empty */
.loading-state { display: flex; align-items: center; justify-content: center; gap: 0.5rem; padding: 3rem 0; color: #999; }
.empty-state { display: flex; flex-direction: column; align-items: center; gap: 0.75rem; padding: 3rem 0; color: #888; }

/* Responsive */
@media screen and (max-width: 48rem) {
  .view-title-bar__text { font-size: 1.3rem; }
  .view-title-bar__container { justify-content: center; }
  .procedures-columns { flex-direction: column; }
  .col-new { flex: 1; }
  .info-card { padding: 1.25rem; }
}
</style>
