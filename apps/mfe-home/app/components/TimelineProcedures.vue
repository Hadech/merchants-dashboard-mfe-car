<script setup lang="ts">
import type { BusinessProcedure } from '@wompi/types'

interface Props {
  businessesProcedures: BusinessProcedure[]
}

const props = defineProps<Props>()

const showProcedures = ref(true)

const statusLabels: Record<string, string> = {
  PENDING: 'Pendiente',
  IN_REVIEW: 'En revisión',
  APPROVED: 'Aprobado',
  DECLINED: 'Rechazado',
  RESCUE: 'En rescate',
}

function getStatusClass(status: string): string {
  const map: Record<string, string> = {
    PENDING: 'status-pending',
    IN_REVIEW: 'status-review',
    APPROVED: 'status-approved',
    DECLINED: 'status-declined',
    RESCUE: 'status-rescue',
  }
  return map[status] || 'status-pending'
}

function toggleShowProcedures() {
  showProcedures.value = !showProcedures.value
}
</script>

<template>
  <div v-if="props.businessesProcedures.length > 0" class="timeline-procedures">
    <button class="timeline-title" @click="toggleShowProcedures">
      <span class="title">Estado de la vinculación</span>
      <span class="toggle-icon">{{ showProcedures ? '▲' : '▼' }}</span>
    </button>
    <div v-if="showProcedures" class="procedures">
      <div
        v-for="procedure in props.businessesProcedures"
        :key="procedure.id"
        class="procedure"
      >
        <div class="procedure-info">
          <span class="procedure-slug">{{ procedure.slug }}</span>
          <span :class="['procedure-status', getStatusClass(procedure.status)]">
            {{ statusLabels[procedure.status] || procedure.status }}
          </span>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.timeline-procedures {
  width: 100%;
  padding: 24px;
  margin-bottom: 24px;
  background-color: white;
  border-radius: 20px;
  box-shadow: 0px 1px 4px 0px rgba(0, 0, 0, 0.14);
}

.timeline-title {
  display: flex;
  align-items: center;
  gap: 12px;
  background: none;
  border: none;
  cursor: pointer;
  width: 100%;
  justify-content: center;
}

.title {
  font-size: 16px;
  font-weight: 700;
  color: #2a2c29;
}

.toggle-icon {
  font-size: 12px;
}

.procedures {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
  margin-top: 24px;
  justify-content: center;
}

.procedure {
  display: flex;
  align-items: center;
}

.procedure-info {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
}

.procedure-slug {
  font-size: 12px;
  font-weight: 600;
  color: #2a2c29;
}

.procedure-status {
  font-size: 12px;
  padding: 3px 12px;
  border-radius: 4px;
}

.status-pending {
  background-color: #f5f5f5;
  color: #616161;
}

.status-review {
  background-color: #fff3e0;
  color: #e65100;
}

.status-approved {
  background-color: #b0f2ae;
  color: #1b5e20;
}

.status-declined {
  background-color: #ffd6d6;
  color: #b71c1c;
}

.status-rescue {
  background-color: #fff9c4;
  color: #f57f17;
}
</style>
