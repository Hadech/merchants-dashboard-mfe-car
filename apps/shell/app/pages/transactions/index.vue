<template>
  <div>
    <!-- ViewTitle bar -->
    <div class="view-title">
      <div class="view-title__container">
        <span class="view-title__text">Transacciones: Recibir pagos</span>
      </div>
    </div>

    <div class="view-content container">
      <!-- Filters Option Row -->
      <div class="filters-option">
        <div class="container-description">
          <span class="filter-header__description">Filtrar por fechas de transacciones</span>
          <div class="date-picker-row">
            <input
              type="date"
              class="date-input"
              :value="store.fromDate"
              @input="onFromDateInput"
            />
            <span class="date-separator">—</span>
            <input
              type="date"
              class="date-input"
              :value="store.untilDate"
              @input="onUntilDateInput"
            />
            <button class="btn-search" @click="fetchData">Buscar</button>
          </div>
        </div>

        <div class="container-buttons">
          <div class="container-buttons__filter">
            <div class="filter-button" @click="showFilters = !showFilters">
              <UIcon name="i-heroicons-funnel" class="filter-icon" />
              <span class="filter-text">{{ showFilters ? 'Cerrar' : 'Filtros' }}</span>
            </div>
          </div>
          <div class="container-buttons__download">
            <button
              class="btn-download"
              :disabled="downloading"
              @click="handleDownload"
            >
              <span class="ic ic_download"></span>
              Descargar Reporte
            </button>
          </div>
        </div>
      </div>

      <!-- Expandable Filters Panel -->
      <div v-show="showFilters" class="filters-container">
        <div class="inputs-container">
          <div>
            <label class="input-label">Estado</label>
            <select v-model="filterForm.status" class="filter-input">
              <option value="">Ingresa el estado</option>
              <option value="APPROVED">APROBADA</option>
              <option value="DECLINED">DECLINADA</option>
              <option value="ERROR">ERROR</option>
              <option value="VOIDED">ANULADA</option>
              <option value="PENDING">PENDIENTE</option>
            </select>
          </div>
          <div>
            <label class="input-label">Método de pago</label>
            <select v-model="filterForm.payment_method_type" class="filter-input">
              <option value="">Ingrese el método</option>
              <option value="CARD">CARD</option>
              <option value="NEQUI">NEQUI</option>
              <option value="PSE">PSE</option>
              <option value="BANCOLOMBIA_TRANSFER">BANCOLOMBIA_TRANSFER</option>
              <option value="BANCOLOMBIA_COLLECT">BANCOLOMBIA_COLLECT</option>
            </select>
          </div>
          <div>
            <label class="input-label">Id de la transacción</label>
            <input
              v-model="filterForm.id"
              type="text"
              class="filter-input"
              placeholder="Ingresa Id"
              maxlength="30"
            />
          </div>
          <div>
            <label class="input-label">Referencia de la transacción</label>
            <input
              v-model="filterForm.reference"
              type="text"
              class="filter-input"
              placeholder="Ingrese la referencia"
              maxlength="255"
            />
          </div>
          <div>
            <label class="input-label">Email del cliente</label>
            <input
              v-model.trim="filterForm.customer_email"
              type="text"
              class="filter-input"
              placeholder="Ingrese el Email"
              maxlength="70"
            />
          </div>
          <div>
            <label class="input-label">Tipo de venta</label>
            <select v-model="filterForm.source_channel" class="filter-input">
              <option value="">Seleccione</option>
              <option value="VENTA_PRESENTE">App</option>
              <option value="WEB">No presente</option>
              <option value="POS_TERMINAL">Datáfono</option>
            </select>
          </div>
        </div>
        <div class="search-button">
          <div class="clean-filter-container" @click="cleanFilters">
            <span class="clean-filters">Limpiar</span>
          </div>
          <div class="button-container">
            <button class="btn-apply" @click="applyFilters">Aplicar</button>
          </div>
        </div>
      </div>

      <!-- Current Period Label -->
      <div v-if="store.fromDate && store.untilDate" class="current-period">
        <p>Transacciones entre&nbsp;</p>
        <p class="date">({{ formatDateLabel(store.fromDate) }} a {{ formatDateLabel(store.untilDate) }})</p>
      </div>

      <!-- Transactions Table -->
      <div class="transactions__box">
        <div class="table-show" :class="{ 'is-loading': store.loading }">
          <div v-if="store.loading" class="loading-overlay">
            <div class="spinner"></div>
          </div>
          <table v-if="store.transactions.length > 0" class="transactions-table">
            <thead>
              <tr>
                <th>Estado</th>
                <th>Monto y cliente</th>
                <th>Datos del pago</th>
                <th>Hora y fecha</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="tx in store.transactions"
                :key="tx.id"
                class="tx-row"
                @click="navigateTo('/transactions/' + tx.id)"
              >
                <td>
                  <span class="status-tag" :class="getStatusClass(tx.status)">
                    {{ getStatusLabel(tx.status) }}
                  </span>
                </td>
                <td>
                  <div class="client-payment-wrapper">
                    <span class="payment-method-icon">{{ getPaymentIcon(tx.payment_method_type) }}</span>
                    <div class="text">
                      <span class="cents">{{ formatPrice(tx.amount_in_cents, tx.currency) }}</span>
                      <span class="email">{{ tx.customer_email }}</span>
                    </div>
                  </div>
                </td>
                <td>
                  <div class="client-payment-wrapper">
                    <div>
                      <span class="payment-id">#{{ tx.id }}</span>
                      <br />
                      <span class="payment-ref">Ref: {{ tx.reference }}</span>
                    </div>
                  </div>
                </td>
                <td>
                  <div class="date-time-wrapper">
                    <span class="range">{{ formatTxDate(tx.created_at) }}</span>
                    <span class="time">{{ formatTxTime(tx.created_at) }}</span>
                  </div>
                </td>
                <td>
                  <div class="last-cell">
                    <div class="action-icon-wrapper">
                      <p class="see-more">Ver más</p>
                      <UIcon name="i-heroicons-arrow-right" class="action-icon" />
                    </div>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
          <p v-if="!store.loading && store.transactions.length === 0" class="no-transactions">
            No hay transacciones para las fechas escogidas.
          </p>
        </div>

        <!-- Pagination -->
        <div v-if="totalPages > 1" class="way-pagination">
          <button
            class="pagination-btn"
            :disabled="store.page <= 1"
            @click="changePage(store.page - 1)"
          >
            &lt;
          </button>
          <button
            v-for="p in paginationPages"
            :key="p"
            class="pagination-number"
            :class="{ active: p === store.page }"
            @click="changePage(p)"
          >
            {{ p }}
          </button>
          <button
            class="pagination-btn"
            :disabled="store.page >= totalPages"
            @click="changePage(store.page + 1)"
          >
            &gt;
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useTransactionsStore } from '~/stores/transactions'

const store = useTransactionsStore()
const downloading = ref(false)
const showFilters = ref(false)

function onFromDateInput(e: Event) {
  store.fromDate = (e.target as HTMLInputElement).value
}
function onUntilDateInput(e: Event) {
  store.untilDate = (e.target as HTMLInputElement).value
}

const filterForm = reactive({
  id: '',
  reference: '',
  customer_email: '',
  status: '',
  payment_method_type: '',
  source_channel: '',
})

const totalPages = computed(() => Math.ceil(store.totalResults / store.pageSize))

const paginationPages = computed(() => {
  const pages: number[] = []
  const total = totalPages.value
  const current = store.page
  const maxVisible = 7
  if (total <= maxVisible) {
    for (let i = 1; i <= total; i++) pages.push(i)
  } else {
    const start = Math.max(1, current - 3)
    const end = Math.min(total, start + maxVisible - 1)
    for (let i = start; i <= end; i++) pages.push(i)
  }
  return pages
})

const STATUS_MAP: Record<string, { label: string; cssClass: string }> = {
  APPROVED: { label: 'Pagada', cssClass: 'tag-success' },
  DECLINED: { label: 'Declinada', cssClass: 'tag-danger' },
  ERROR: { label: 'Error', cssClass: 'tag-error' },
  VOIDED: { label: 'Anulada', cssClass: 'tag-voided' },
  PENDING: { label: 'Pendiente', cssClass: 'tag-warning' },
}

function getStatusLabel(status: string) {
  return STATUS_MAP[status]?.label || status
}

function getStatusClass(status: string) {
  return STATUS_MAP[status]?.cssClass || 'tag-error'
}

function getPaymentIcon(type: string) {
  const icons: Record<string, string> = {
    CARD: '💳',
    NEQUI: '📱',
    PSE: '🏦',
    BANCOLOMBIA_TRANSFER: '🏦',
    BANCOLOMBIA_COLLECT: '🏦',
  }
  return icons[type] || '💰'
}

function formatPrice(cents: number, currency?: string) {
  const amount = cents / 100
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: currency || 'COP',
    minimumFractionDigits: 0,
  }).format(amount)
}

function formatTxDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('es-CO', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

function formatTxTime(dateStr: string) {
  return new Date(dateStr).toLocaleTimeString('es-CO', {
    hour: '2-digit',
    minute: '2-digit',
  })
}

function formatDateLabel(dateStr: string) {
  const d = new Date(dateStr + 'T12:00:00')
  return d.toLocaleDateString('es-CO', { month: 'long', day: 'numeric', year: 'numeric' })
}

function applyFilters() {
  Object.entries(filterForm).forEach(([key, value]) => {
    store.setFilter(key as any, value)
  })
  store.page = 1
  store.getTransactions()
}

function cleanFilters() {
  filterForm.id = ''
  filterForm.reference = ''
  filterForm.customer_email = ''
  filterForm.status = ''
  filterForm.payment_method_type = ''
  filterForm.source_channel = ''
  Object.entries(filterForm).forEach(([key, value]) => {
    store.setFilter(key as any, value)
  })
  store.page = 1
  store.getTransactions()
}

function changePage(p: number) {
  store.page = p
  store.getTransactions()
}

async function fetchData() {
  store.page = 1
  await store.getTransactions()
}

async function handleDownload() {
  downloading.value = true
  try {
    await store.downloadReport()
  } finally {
    downloading.value = false
  }
}

onMounted(fetchData)
</script>

<style scoped>
/* ===== ViewTitle ===== */
.view-title {
  background: #2A2C29;
  color: #fff;
  position: relative;
}
.view-title__container {
  position: relative;
  height: 100px;
  display: flex;
  align-items: center;
  padding-left: 2.375rem;
}
.view-title__text {
  font-size: 1.6rem;
  display: inline-block;
  vertical-align: middle;
}

/* ===== Main Container ===== */
.view-content.container {
  background-color: #ffffff;
  padding: 2rem 2.375rem;
}

/* ===== Filters Option Row ===== */
.filters-option {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
}
.container-description {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
}
.filter-header__description {
  color: #2A2C29;
  font-size: 18px;
  font-weight: 700;
  margin: 0.5rem 0;
}
.date-picker-row {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-top: 0.5rem;
}
.date-input {
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  padding: 0.5rem 0.75rem;
  font-size: 14px;
  height: 40px;
  outline: none;
  color: #606266;
}
.date-input:focus {
  border-color: #409eff;
}
.date-separator {
  color: #606266;
  margin: 0 0.25rem;
}
.btn-search {
  background: #2A2C29;
  color: #fff;
  border: none;
  border-radius: 4px;
  padding: 0.5rem 1rem;
  height: 40px;
  font-size: 14px;
  cursor: pointer;
  font-weight: 600;
}
.btn-search:hover {
  opacity: 0.9;
}

/* ===== Filter & Download Buttons ===== */
.container-buttons {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.container-buttons__filter {
  display: flex;
  align-items: center;
  justify-content: center;
}
.container-buttons__download {
  display: flex;
  align-items: center;
  justify-content: center;
  margin-left: 1rem;
}
.filter-button {
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: space-evenly;
  width: 125px;
  height: 40px;
  border: 1px solid rgba(0, 0, 0, 0.5);
  border-radius: 20px;
}
.filter-button .filter-icon {
  color: #2A2C29;
  font-size: 1.25rem;
}
.filter-button .filter-text {
  color: #2A2C29;
  font-size: 14px;
  font-weight: 600;
}
.btn-download {
  background: #00825A;
  color: #fff;
  border: none;
  border-radius: 4px;
  padding: 0.5rem 1.25rem;
  height: 40px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}
.btn-download:hover {
  background: #006d4b;
}
.btn-download:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

/* ===== Expandable Filters Panel ===== */
.filters-container {
  animation: fadeIn ease 0.5s;
  margin-top: 1rem;
}
.inputs-container {
  display: flex;
  flex-wrap: wrap;
  align-items: baseline;
  gap: 0.5rem;
}
.inputs-container > div {
  display: flex;
  flex-direction: column;
}
.input-label {
  color: #2A2C29;
  font-size: 0.8rem;
  font-weight: 500;
  margin-top: 0.8rem;
  margin-bottom: 0.3rem;
}
.filter-input {
  width: 14rem;
  height: 36px;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  padding: 0 0.75rem;
  font-size: 14px;
  color: #606266;
  outline: none;
  background: #fff;
  appearance: auto;
}
.filter-input:focus {
  border-color: #409eff;
}
.search-button {
  margin-top: 1rem;
  display: flex;
  justify-content: center;
  align-items: center;
}
.clean-filter-container {
  border: 1px solid #2A2C29;
  border-radius: 20px;
  width: 90px;
  height: 40px;
  margin-top: 1rem;
  display: flex;
  justify-content: center;
  align-items: center;
  cursor: pointer;
}
.clean-filters {
  text-align: center;
  color: #2A2C29;
  font-size: 0.8rem;
  font-weight: 600;
}
.button-container {
  margin-left: 1rem;
  display: flex;
  justify-content: center;
}
.btn-apply {
  margin-top: 1rem;
  width: 90px;
  height: 40px;
  background: #00825A;
  color: #fff;
  border: none;
  border-radius: 4px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
}
.btn-apply:hover {
  background: #006d4b;
}

/* ===== Current Period ===== */
.current-period {
  display: flex;
  align-items: flex-start;
  font-weight: 700;
  color: #2C2A29;
  text-transform: none;
  text-align: center;
  font-size: 18px;
  margin: 1.5rem 0 0.3rem;
}
.current-period .date {
  font-weight: 200;
  text-transform: capitalize;
}

/* ===== Transactions Table ===== */
.transactions__box {
  margin-top: 0.9375rem;
}
.table-show {
  position: relative;
}
.table-show.is-loading {
  min-height: 200px;
}
.loading-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(255, 255, 255, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10;
}
.spinner {
  width: 32px;
  height: 32px;
  border: 3px solid #eee;
  border-top-color: #00825A;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}
@keyframes spin {
  to { transform: rotate(360deg); }
}
.transactions-table {
  width: 100%;
  border-collapse: collapse;
  border-radius: 3px;
  box-shadow: 3px 3px 17px 0 rgba(174, 197, 215, 0.18);
  background: #fff;
}
.transactions-table thead th {
  text-align: left;
  padding: 0.875rem 1.0625rem 0.625rem;
  color: #555555;
  font-size: 0.875rem;
  font-weight: 600;
  border-bottom: 1px solid #ebeef5;
}
.transactions-table tbody tr {
  cursor: pointer;
  transition: background 0.15s;
}
.transactions-table tbody tr:hover {
  background: #f5f7fa;
}
.transactions-table tbody td {
  padding: 0.625rem 1.0625rem;
  font-size: 0.875rem;
  line-height: normal;
  border-bottom: 1px solid #ebeef5;
  vertical-align: middle;
}

/* Status Tags */
.status-tag {
  display: inline-block;
  padding: 0.15rem 0.6rem;
  border-radius: 3px;
  font-size: 12px;
  font-weight: 600;
  white-space: nowrap;
}
.tag-success {
  background: #e5fbe4;
  color: #1a624c;
}
.tag-danger {
  background: #ffebeb;
  color: #a01110;
}
.tag-error {
  background: #eee;
  color: #888;
}
.tag-voided {
  background: #ebf4ff;
  color: #409eff;
}
.tag-warning {
  background: #fff2df;
  color: #ff9c1b;
}

/* Table cell content */
.client-payment-wrapper {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}
.payment-method-icon {
  font-size: 1.25rem;
}
.text {
  display: flex;
  flex-direction: column;
}
.cents {
  font-weight: 600;
  color: #4376ff;
  display: block;
}
.email {
  color: #252525;
  font-size: 0.8rem;
}
.payment-id {
  font-weight: 600;
  color: #252525;
}
.payment-ref {
  color: #252525;
  font-size: 0.8rem;
}
.date-time-wrapper {
  display: flex;
  flex-direction: column;
}
.range {
  color: #252525;
}
.time {
  color: #252525;
  font-size: 0.8rem;
}
.last-cell {
  position: relative;
}
.action-icon-wrapper {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  opacity: 0.7;
}
.see-more {
  color: #969696;
  font-weight: 600;
  font-size: 14px;
  letter-spacing: -0.2px;
  margin: 0;
}
.action-icon {
  color: #969696;
  font-size: 20px;
}
.no-transactions {
  color: #555555;
  font-size: 0.9rem;
  padding: 2.5rem 1rem;
  text-align: center;
}

/* ===== Pagination ===== */
.way-pagination {
  margin-top: 1.8125rem;
  text-align: center;
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 0.25rem;
}
.pagination-btn {
  background: transparent;
  border: none;
  color: #555555;
  font-size: 14px;
  cursor: pointer;
  padding: 0.25rem 0.5rem;
}
.pagination-btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}
.pagination-number {
  background: transparent;
  border: none;
  color: #555555;
  font-size: 13px;
  font-weight: 400;
  cursor: pointer;
  padding: 0.25rem 0.5rem;
  border-radius: 3px;
}
.pagination-number.active {
  color: #BDF4BC;
  font-weight: 700;
}
.pagination-number:hover:not(.active) {
  background: #f5f7fa;
}

/* ===== Animations ===== */
@keyframes fadeIn {
  0% { opacity: 0; }
  100% { opacity: 1; }
}

/* ===== Responsive ===== */
@media screen and (max-width: 30rem) {
  .view-title__container {
    padding-left: 1rem;
    height: 80px;
  }
  .view-title__text {
    font-size: 1.3rem;
  }
  .view-content.container {
    padding: 1.5rem 1rem;
  }
  .filters-option {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }
  .container-buttons {
    flex-direction: column-reverse;
    align-items: flex-start;
    gap: 0.75rem;
  }
  .container-buttons__download {
    margin-left: 0;
  }
  .inputs-container {
    flex-direction: column;
  }
  .filter-input {
    width: 100%;
  }
  .current-period {
    flex-direction: column;
    margin-left: 6px;
  }
}
</style>
