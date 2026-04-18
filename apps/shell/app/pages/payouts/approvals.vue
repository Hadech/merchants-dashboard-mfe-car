<template>
  <div class="approvals-page">
    <!-- View Title Bar -->
    <div class="view-title-bar">
      <div class="view-title-bar__container">
        <span class="view-title-bar__text">Pagos a terceros</span>
      </div>
    </div>

    <!-- Content -->
    <div class="approvals-content">
      <h2 class="section-title">Aprobaciones pendientes</h2>

      <!-- Error -->
      <div v-if="store.error" class="error-banner">
        <UIcon name="i-heroicons-exclamation-circle" />
        <span>{{ store.error }}</span>
      </div>

      <!-- Loading -->
      <div v-if="store.loading && store.pendingApprovals.length === 0" class="loading-state">
        <UIcon name="i-heroicons-arrow-path" class="animate-spin text-xl text-gray-400" />
        <span>Cargando aprobaciones...</span>
      </div>

      <!-- Approvals list -->
      <template v-else-if="store.pendingApprovals.length > 0">
        <div class="approvals-list">
          <div
            v-for="item in store.pendingApprovals"
            :key="item.id"
            class="approval-item"
          >
            <div class="approval-item__icon">
              <UIcon name="i-heroicons-clock" class="clock-icon" />
            </div>

            <div class="approval-item__info">
              <div class="approval-item__row-top">
                <span class="approval-item__amount">COP {{ formatPrice(item.amount_in_cents) }}</span>
                <WStatusBadge status="pending" label="PENDIENTE" />
              </div>
              <span class="approval-item__destination">
                {{ item.destination?.bank_name || '—' }} · {{ item.destination?.account_number || '' }}
              </span>
              <span class="approval-item__meta">
                <span class="approval-item__id" :title="item.id">ID: {{ shortId(item.id) }}</span>
                <span class="approval-item__date">
                  <UIcon name="i-heroicons-calendar" class="meta-icon" />
                  {{ formatDate(item.created_at) }}
                </span>
              </span>
            </div>

            <div class="approval-item__actions">
              <UButton
                color="primary"
                size="sm"
                class="action-btn"
                :loading="store.loading"
                @click="handleApprove(item.id)"
              >
                Aprobar
              </UButton>
              <UButton
                variant="outline"
                color="error"
                size="sm"
                class="action-btn"
                :loading="store.loading"
                @click="handleReject(item.id)"
              >
                Rechazar
              </UButton>
            </div>
          </div>
        </div>
      </template>

      <!-- Empty state -->
      <div v-else class="empty-state">
        <div class="empty-state__icon-wrapper">
          <UIcon name="i-heroicons-check-circle" class="empty-check-icon" />
        </div>
        <p class="empty-state__title">No hay pagos pendientes de aprobación</p>
        <p class="empty-state__hint">Cuando se creen pagos que requieran aprobación, aparecerán aquí.</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useApprovalsStore } from '~/stores/approvals'

const store = useApprovalsStore()

async function handleApprove(id: string) {
  await store.approvePayout(id)
}

async function handleReject(id: string) {
  await store.rejectPayout(id)
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

onMounted(() => store.fetchPendingApprovals())
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
.approvals-content {
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

/* Error banner */
.error-banner {
  display: flex;
  align-items: center;
  gap: 8px;
  background: #FEF2F2;
  border: 1px solid #FECACA;
  border-radius: 8px;
  padding: 12px 16px;
  color: #991B1B;
  font-size: 0.875rem;
  margin-bottom: 1rem;
}

/* Approvals list — card style */
.approvals-list {
  background: #fff;
  border: 1px solid #e0e0e0;
  border-radius: 16px;
  box-shadow: 0px 1px 8px 0px rgba(0, 0, 0, 0.08);
  overflow: hidden;
}

.approval-item {
  display: flex;
  align-items: center;
  padding: 20px 24px;
  gap: 16px;
  transition: background 0.2s ease-out;
}

.approval-item:hover {
  background: #f9f9f9;
}

.approval-item:not(:last-child) {
  border-bottom: 1px solid #f0f0f0;
}

.approval-item__icon {
  background: #FEF3C7;
  width: 2.5rem;
  height: 2.5rem;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.clock-icon {
  color: #F59E0B;
  font-size: 1.125rem;
}

.approval-item__info {
  display: flex;
  flex-direction: column;
  gap: 4px;
  flex: 1;
  min-width: 0;
}

.approval-item__row-top {
  display: flex;
  align-items: center;
  gap: 12px;
}

.approval-item__amount {
  font-size: 1.125rem;
  font-weight: 700;
  color: #2C2A29;
}

.approval-item__destination {
  font-size: 0.875rem;
  color: #555;
}

.approval-item__meta {
  display: flex;
  align-items: center;
  gap: 16px;
  font-size: 0.8125rem;
  color: #888;
}

.approval-item__id {
  font-family: monospace;
}

.approval-item__date {
  display: flex;
  align-items: center;
  gap: 4px;
}

.meta-icon {
  font-size: 0.875rem;
}

.approval-item__actions {
  display: flex;
  gap: 8px;
  flex-shrink: 0;
}

.action-btn {
  border-radius: 2rem;
  font-weight: 600;
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

/* Empty state */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  padding: 4rem 0;
}

.empty-state__icon-wrapper {
  margin-bottom: 0.5rem;
}

.empty-check-icon {
  font-size: 3rem;
  color: #40A940;
}

.empty-state__title {
  font-size: 1rem;
  font-weight: 600;
  color: #555;
}

.empty-state__hint {
  font-size: 0.875rem;
  color: #aaa;
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

  .approval-item {
    flex-wrap: wrap;
    padding: 16px;
  }

  .approval-item__actions {
    width: 100%;
    justify-content: flex-end;
    margin-top: 8px;
  }

  .approval-item__meta {
    flex-wrap: wrap;
    gap: 8px;
  }
}
</style>
